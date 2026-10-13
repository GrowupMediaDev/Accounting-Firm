// Konfigurator-Oberflaeche. Liest das Profil, rendert das Formular aus schema.js,
// speichert jede Aenderung (kurz verzoegert) in src/firms/<slug>/firm.json bzw.
// die englischen Texte in firm.en.json. Die Vorschau ist die echte Seite im
// iframe (/ oder /en/); Vite laedt sie nach dem Speichern neu.
//
// Oberflaeche: Englisch (i18n.js). Website-Inhalt: German | English (welche
// Fassung der Seite bearbeitet wird).
import { GROUPS, PLACEHOLDERS } from './schema.js';
import { tr } from './i18n.js';
import { findIssues as checkProfile, contrast, groupOf, translatable, get } from './checks.js';

const $ = (s, el = document) => el.querySelector(s);
const h = (tag, attrs = {}, ...kids) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'html') el.innerHTML = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  return el;
};
const api = async (path, opts = {}) => {
  const res = await fetch(`/__cfg/${path}`, opts);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || res.statusText);
  return body;
};
const putJson = (path, body) => api(path, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body });
const postJson = (path, obj) => api(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) });

// ---------- Zustand ----------
// data = deutsches Profil (alles), en = nur englische Texte (gleiche Struktur).
const state = { slug: '', firms: [], data: null, en: {}, mode: 'de', past: [], future: [], images: [], open: new Set(['brand']) };
const set = (obj, path, value) => {
  const keys = path.split('.');
  const last = keys.pop();
  // Zahl als naechster Schluessel = Liste (wichtig fuer firm.en.json: Listen nach Position).
  const target = keys.reduce((o, k, i) => (o[k] ??= /^\d+$/.test(keys[i + 1] ?? last) ? [] : {}), obj);
  target[last] = value;
};
const imageUrl = (name) => `/__cfg/image/${state.slug}/${encodeURIComponent(name)}`;
const englishOn = () => Boolean(state.data?.languages?.en);

// ---------- Oberflaechentexte ----------
/** Statische Texte in index.html (data-i18n*) ins Englische setzen. */
function translateStatic() {
  for (const [attr, prop] of [['i18n', 'text'], ['i18nPlaceholder', 'placeholder'], ['i18nTitle', 'title'], ['i18nAria', 'aria-label']]) {
    document.querySelectorAll(`[data-${attr.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}]`).forEach((el) => {
      const key = el.dataset[attr] || (el.dataset[`${attr}Orig`] ??= prop === 'text' ? el.textContent.trim() : el.getAttribute(prop));
      if (prop === 'text') el.textContent = tr(key);
      else el.setAttribute(prop, tr(key));
    });
  }
}
// ---------- Speichern ----------
const status = $('[data-status]');
const setStatus = (text, kind = '') => { status.textContent = text; status.className = `top__status ${kind ? `is-${kind}` : ''}`; };
let saveTimer = 0;
let lastSaved = '';
const snapshot = () => JSON.stringify({ de: state.data, en: state.en });

/** Jede Aenderung: gedrosselt speichern. */
function commit() {
  if (snapshot() === lastSaved) return;
  setStatus(tr('Änderungen …'));
  clearTimeout(saveTimer);
  saveTimer = setTimeout(save, 650);
}
/** Schreibt nur die Datei(en), die sich gegenueber dem letzten Stand geaendert haben. */
async function write(snap) {
  rememberScroll();
  const next = JSON.parse(snap);
  const prev = lastSaved ? JSON.parse(lastSaved) : { de: null, en: null };
  if (JSON.stringify(next.de) !== JSON.stringify(prev.de)) await putJson(`firm/${state.slug}`, JSON.stringify(next.de));
  if (JSON.stringify(next.en) !== JSON.stringify(prev.en)) await putJson(`firm/${state.slug}?lang=en`, JSON.stringify(next.en));
  lastSaved = snap;
  setStatus(tr('Gespeichert ✓'), 'ok');
  updateUndo();
  updateChecks();
}
async function save() {
  if (!state.data) return;
  const snap = snapshot();
  if (snap === lastSaved) return;
  const before = lastSaved;
  try {
    await write(snap);
    // Verlauf: Stand vor dieser Aenderung merken.
    state.past.push(before);
    if (state.past.length > 100) state.past.shift();
    state.future = [];
    updateUndo();
  } catch (e) {
    setStatus(tr('Fehler: {msg}', { msg: e.message }), 'err');
  }
}
/** Rueckgaengig/Wiederholen: Stand setzen, Formular neu aufbauen, speichern. */
async function jump(snap) {
  clearTimeout(saveTimer);
  const s = JSON.parse(snap);
  state.data = s.de;
  state.en = s.en;
  renderGroups();
  try { await write(snap); } catch (e) { setStatus(tr('Fehler: {msg}', { msg: e.message }), 'err'); }
}
function updateUndo() {
  $('[data-undo]').disabled = state.past.length === 0;
  $('[data-redo]').disabled = state.future.length === 0;
}
$('[data-undo]').addEventListener('click', () => undo());
$('[data-redo]').addEventListener('click', () => redo());
async function undo() {
  await save(); // offene Eingabe erst festhalten
  if (!state.past.length) return;
  state.future.push(lastSaved);
  await jump(state.past.pop());
}
async function redo() {
  if (!state.future.length) return;
  state.past.push(lastSaved);
  await jump(state.future.pop());
}
document.addEventListener('keydown', (e) => {
  if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'z') return;
  if (e.target.closest('input, textarea')) return; // Texteingaben behalten ihr eigenes Rueckgaengig
  e.preventDefault();
  e.shiftKey ? redo() : undo();
});

// ---------- Vorschau ----------
const frame = $('[data-frame]');
const iframe = $('[data-preview]');
const stage = $('[data-stage]');
const DEVICES = { desktop: 1440, tablet: 834, mobile: 390 };
let device = 'desktop';
let pendingScroll = null;

try { sessionStorage.setItem('hv-seen', '1'); } catch { /* ohne Preloader in der Vorschau */ }

function layoutFrame() {
  const w = DEVICES[device];
  const availW = stage.clientWidth - 32;
  const availH = stage.clientHeight - 32;
  const scale = Math.min(1, availW / w);
  frame.style.width = `${w}px`;
  frame.style.height = `${availH / scale}px`;
  frame.style.transform = `scale(${scale})`;
  frame.style.marginLeft = `${Math.max(0, (availW - w * scale) / 2)}px`;
  frame.style.justifySelf = 'start';
}
new ResizeObserver(layoutFrame).observe(stage);
document.querySelectorAll('[data-device]').forEach((b) => b.addEventListener('click', () => {
  device = b.dataset.device;
  document.querySelectorAll('[data-device]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  layoutFrame();
}));

const win = () => iframe.contentWindow;
function rememberScroll() {
  try { pendingScroll = win().scrollY; } catch { pendingScroll = null; }
}
/** Vorschau auf die bearbeitete Sprache stellen (/ oder /en/), Scrollstand behalten. */
function showPreview() {
  const path = state.mode === 'en' ? '/en/' : '/';
  let current = '';
  try { current = win().location.pathname; } catch { /* noch leer */ }
  if (current === path) return;
  rememberScroll();
  frame.classList.add('is-loading');
  iframe.src = path;
}
iframe.addEventListener('load', () => {
  frame.classList.remove('is-loading');
  if (pendingScroll == null) return;
  const y = pendingScroll;
  pendingScroll = null;
  // Nach dem Neuladen an dieselbe Stelle (Lenis, falls aktiv).
  const go = () => { const w = win(); w.lenis ? w.lenis.scrollTo(y, { immediate: true, force: true }) : w.scrollTo(0, y); };
  go();
  setTimeout(go, 120);
});
function scrollPreviewTo(selector) {
  try {
    const w = win();
    const el = w.document.querySelector(selector);
    if (!el) return;
    w.lenis ? w.lenis.scrollTo(el, { offset: -10, duration: 0.9 }) : el.scrollIntoView({ behavior: 'smooth' });
  } catch { /* Vorschau laedt gerade */ }
}

// ---------- Inhaltssprache (Deutsch | English) ----------
const modeSeg = $('[data-content-lang]');
function updateModeSeg() {
  modeSeg.hidden = !englishOn();
  modeSeg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === state.mode)));
}
function setMode(mode) {
  state.mode = mode === 'en' && englishOn() ? 'en' : 'de';
  document.body.classList.toggle('is-en', state.mode === 'en');
  updateModeSeg();
  renderGroups();
  showPreview();
}
modeSeg.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));

// ---------- Felder ----------
let patternTiles = null;
async function loadPatterns() {
  patternTiles = await api(`patterns?color=${encodeURIComponent(state.data.theme.pattern.color || state.data.theme.accent)}`);
}

function fieldWrap(f, control, extra) {
  const label = tr(f.label);
  const help = f.help && tr(f.help);
  return h('div', { class: 'field', 'data-label': `${label} ${help || ''}`.toLowerCase() },
    h('span', { class: 'field__label' }, label),
    control,
    help && h('span', { class: 'field__help' }, help),
    extra);
}

/**
 * Ein Feld. `obj` ist das Objekt, auf das sich `f.path` bezieht (Profil oder
 * Listeneintrag). Im Modus English ist `obj` die Uebersetzung und `ref` das
 * deutsche Profil: das Deutsche steht als Platzhalter im Feld.
 */
function renderField(f, obj, ref) {
  const value = get(obj, f.path);
  const de = ref ? get(ref, f.path) : undefined;
  const update = (v) => { set(obj, f.path, v); commit(); };
  const hint = ref && typeof de === 'string' ? de : ref && Array.isArray(de) ? de.join('\n') : '';
  const deNote = ref && hint && h('span', { class: 'field__de' }, tr('Deutsch: {text}', { text: hint.length > 140 ? `${hint.slice(0, 140)} …` : hint }));

  switch (f.type) {
    case 'text':
      return fieldWrap(f, h('input', { value: value ?? '', placeholder: hint, oninput: (e) => update(e.target.value) }), deNote);

    case 'textarea':
      return fieldWrap(f, h('textarea', { rows: f.rows || 3, placeholder: hint, oninput: (e) => update(e.target.value) }, value ?? ''), deNote);

    case 'number':
      return fieldWrap(f, h('input', { type: 'number', value: value ?? '', min: f.min, max: f.max, oninput: (e) => e.target.value !== '' && update(Number(e.target.value)) }));

    case 'rich': {
      const preview = h('span', { class: 'rich__preview' });
      const show = (v) => { preview.innerHTML = tr('Vorschau: ') + v.replace(/[<>&]/g, '').replace(/\*([^*]+)\*/g, '<em>$1</em>'); };
      const input = h('input', { value: value ?? '', placeholder: hint, oninput: (e) => { update(e.target.value); show(e.target.value || hint); } });
      const mark = h('button', { type: 'button', title: tr('Markierten Text als Akzentwort'), onclick: () => {
        const { selectionStart: a, selectionEnd: b, value: v } = input;
        if (a === b) return;
        input.value = `${v.slice(0, a)}*${v.slice(a, b).replace(/\*/g, '')}*${v.slice(b)}`.replace(/\*([^*]*)\*\*([^*]*)\*/g, '*$1$2*');
        input.dispatchEvent(new Event('input'));
        input.focus();
      } }, '✦');
      show(value || hint || '');
      return fieldWrap(f, h('div', { class: 'rich' }, input, mark), preview);
    }

    case 'toggle':
      return h('label', { class: 'field toggle', 'data-label': tr(f.label).toLowerCase() },
        h('input', { type: 'checkbox', checked: !!value, onchange: (e) => {
          update(e.target.checked);
          if (f.path === 'languages.en' && !e.target.checked) setMode('de');
          updateModeSeg();
          renderGroups();
        } }),
        h('span', { class: 'field__label' }, tr(f.label)),
        f.help && h('span', { class: 'field__help toggle__help' }, tr(f.help)));

    case 'select':
      return fieldWrap(f, h('select', { onchange: (e) => update(e.target.value) },
        f.options.map((o) => h('option', { value: o.value, selected: o.value === value }, tr(o.label)))));

    case 'range': {
      const out = h('output', {}, Number(value ?? 1).toFixed(2));
      return fieldWrap(f, h('div', { class: 'range' },
        h('input', { type: 'range', min: f.min, max: f.max, step: f.step, value: value ?? 1, oninput: (e) => { out.textContent = Number(e.target.value).toFixed(2); update(Number(e.target.value)); } }),
        out));
    }

    case 'color': {
      const fallback = f.optional ? state.data.theme.accent : '#000000';
      const text = h('input', { type: 'text', value: value ?? '', placeholder: f.optional ? tr('Standard') : '#000000', maxlength: 7 });
      const pick = h('input', { type: 'color', value: /^#[0-9a-f]{6}$/i.test(value || '') ? value : fallback });
      const contrastEl = h('span', { class: 'contrast' });
      const showContrast = () => {
        if (f.path !== 'theme.accent' || !/^#[0-9a-f]{6}$/i.test(text.value)) { contrastEl.textContent = ''; return; }
        const c = contrast(text.value, state.data.theme.light || '#ffffff');
        const verdict = c >= 4.5 ? '✓' : c >= 3 ? tr('(für Buttons knapp, ab 4,5 sicher)') : tr('(zu schwach, dunkler wählen)');
        contrastEl.textContent = tr('Weiße Schrift auf Akzent: {ratio} : 1 {verdict}', { ratio: c.toFixed(1), verdict });
        contrastEl.className = `contrast ${c < 4.5 ? 'is-bad' : ''}`;
      };
      const apply = (v) => {
        if (v === '' && f.optional) { update(''); return; }
        if (!/^#[0-9a-f]{6}$/i.test(v)) return;
        update(v.toLowerCase());
        showContrast();
        if (f.path === 'theme.accent' || f.path === 'theme.pattern.color') loadPatterns().then(refreshPatternTiles);
      };
      pick.addEventListener('input', () => { text.value = pick.value; apply(pick.value); });
      pick.addEventListener('change', () => renderGroups());
      text.addEventListener('input', () => { if (/^#[0-9a-f]{6}$/i.test(text.value)) pick.value = text.value; apply(text.value.trim()); });
      showContrast();
      return fieldWrap(f, h('div', { class: 'color' }, pick, text,
        f.optional && h('button', { type: 'button', class: 'btn btn--small', onclick: () => { text.value = ''; apply(''); } }, tr('Standard'))), contrastEl);
    }

    case 'pattern': {
      const names = { zigzag: 'Zickzack', diagonal: 'Diagonal', dots: 'Punkte', grid: 'Raster', waves: 'Wellen', none: 'Keins' };
      const wrap = h('div', { class: 'patterns', 'data-patterns': '' });
      const draw = () => {
        wrap.replaceChildren(...(patternTiles?.patterns ?? []).map((p) => h('button', {
          type: 'button',
          'aria-pressed': String(get(obj, f.path) === p),
          style: p === 'none' ? '' : `background-image:url("data:image/svg+xml,${encodeURIComponent(patternTiles.tiles[p].replace(/stroke-opacity='[^']*'|fill-opacity='[^']*'/g, ''))}")`,
          onclick: () => { update(p); draw(); },
        }, tr(names[p] ?? p))));
      };
      wrap._draw = draw;
      draw();
      return fieldWrap(f, wrap);
    }

    case 'lines':
      return fieldWrap(f, h('textarea', { rows: Math.max(2, (value?.length || de?.length || 1) + 1), placeholder: hint, oninput: (e) => update(e.target.value.split('\n').map((l) => l.trim()).filter(Boolean)) }, (value ?? []).join('\n')), deNote);

    case 'numbers':
      return fieldWrap(f, h('input', { value: (value ?? []).join(', '), oninput: (e) => {
        const nums = e.target.value.split(/[,;\s]+/).filter(Boolean).map(Number).filter((n) => Number.isFinite(n)).map((n) => Math.max(0, Math.min(100, n)));
        if (nums.length) update(nums);
      } }));

    case 'days': {
      const order = [1, 2, 3, 4, 5, 6, 0];
      const names = { 1: 'Mo', 2: 'Di', 3: 'Mi', 4: 'Do', 5: 'Fr', 6: 'Sa', 0: 'So' };
      const current = new Set(value ?? []);
      return fieldWrap(f, h('div', { class: 'days' }, order.map((d) => h('label', {},
        h('input', { type: 'checkbox', checked: current.has(d), onchange: (e) => {
          e.target.checked ? current.add(d) : current.delete(d);
          if (!current.size) { e.target.checked = true; current.add(d); return; }
          update(order.filter((x) => current.has(x)));
        } }),
        h('span', {}, tr(names[d]))))));
    }

    case 'person':
      return fieldWrap(f, h('select', { onchange: (e) => update(e.target.value) },
        (state.data.team.members ?? []).map((m) => h('option', { value: m.name, selected: m.name === value }, m.name))));

    case 'image': {
      const thumb = h('span', { class: 'thumb' }, value ? h('img', { src: imageUrl(value), alt: '' }) : null);
      return fieldWrap(f, h('div', { class: 'image' },
        thumb,
        h('span', { class: 'image__name' }, value || tr('Kein Bild')),
        h('button', { type: 'button', class: 'btn btn--small', onclick: () => pickImage(value, (name) => { update(name); renderGroups(); }) }, value ? tr('Ändern') : tr('Wählen')),
        f.optional && value && h('button', { type: 'button', class: 'btn btn--small', onclick: () => { update(''); renderGroups(); } }, tr('Entfernen'))));
    }

    case 'images': {
      const list = [...(value ?? [])];
      return fieldWrap(f, h('div', { class: 'images' },
        list.map((name, i) => h('span', { class: 'thumb', title: tr('{name} (klicken zum Ändern)', { name }), onclick: (e) => {
          if (e.target.tagName === 'BUTTON') return;
          pickImage(name, (n) => { list[i] = n; update([...list]); renderGroups(); });
        } },
          h('img', { src: imageUrl(name), alt: '' }),
          list.length > 1 && h('button', { type: 'button', 'aria-label': tr('Entfernen'), onclick: () => { list.splice(i, 1); update([...list]); renderGroups(); } }, '✕'))),
        list.length < 5 && h('button', { type: 'button', class: 'btn btn--small', onclick: () => pickImage('', (n) => { update([...list, n]); renderGroups(); }) }, tr('+ Bild'))));
    }

    case 'list':
      return ref ? renderListTranslation(f, obj, ref) : renderList(f, obj);

    default:
      return fieldWrap(f, h('em', {}, tr('Unbekannter Feldtyp {type}', { type: f.type })));
  }
}

const itemTitle = (item, f) => String(item?.[f.itemLabel] ?? '').replace(/\*/g, '');

function renderList(f, obj) {
  const items = get(obj, f.path) ?? [];
  const wrap = h('div', { class: 'list' });
  const rerender = () => { commit(); renderGroups(); };
  // Listen-Umbau verschiebt auch die englischen Eintraege, damit sie passen.
  const enItems = () => get(state.en, f.path);
  const move = (from, to) => {
    items.splice(to, 0, items.splice(from, 1)[0]);
    const en = enItems();
    if (Array.isArray(en)) { while (en.length <= Math.max(from, to)) en.push({}); en.splice(to, 0, en.splice(from, 1)[0]); }
    rerender();
  };
  items.forEach((item, i) => {
    const key = `${f.path}#${i}`;
    const details = h('details', { class: 'item', open: state.open.has(key) },
      h('summary', { onclick: (e) => { if (e.target.closest('button')) e.preventDefault(); } },
        h('span', { class: 'item__no' }, String(i + 1).padStart(2, '0')),
        h('span', { class: 'item__title' }, itemTitle(item, f) || tr('Ohne Titel')),
        h('span', { class: 'item__tools' },
          h('button', { type: 'button', class: 'icon-btn', title: tr('Nach oben'), disabled: i === 0, onclick: () => move(i, i - 1) }, '↑'),
          h('button', { type: 'button', class: 'icon-btn', title: tr('Nach unten'), disabled: i === items.length - 1, onclick: () => move(i, i + 1) }, '↓'),
          !f.fixed && h('button', { type: 'button', class: 'icon-btn', title: tr('Duplizieren'), disabled: f.max && items.length >= f.max, onclick: () => {
            items.splice(i + 1, 0, structuredClone(item));
            const en = enItems();
            if (Array.isArray(en) && en.length > i) en.splice(i + 1, 0, structuredClone(en[i] ?? {}));
            state.open.add(`${f.path}#${i + 1}`);
            rerender();
          } }, '⧉'),
          !f.fixed && h('button', { type: 'button', class: 'icon-btn', title: tr('Löschen'), disabled: items.length <= (f.min ?? 0), onclick: () => {
            if (!confirm(tr('„{name}“ löschen?', { name: itemTitle(item, f) || tr('Eintrag') }))) return;
            items.splice(i, 1);
            const en = enItems();
            if (Array.isArray(en)) en.splice(i, 1);
            rerender();
          } }, '✕'))),
      h('div', { class: 'item__body' }, f.fields.map((sub) => renderField(sub, item))));
    details.addEventListener('toggle', () => (details.open ? state.open.add(key) : state.open.delete(key)));
    wrap.append(details);
  });
  if (!f.fixed && !(f.max && items.length >= f.max)) {
    wrap.append(h('button', { type: 'button', class: 'btn btn--small', onclick: () => {
      // Neuer Eintrag nach dem Muster des letzten, Texte leer.
      const blank = structuredClone(items[items.length - 1] ?? {});
      for (const sub of f.fields) {
        const v = get(blank, sub.path);
        if (typeof v === 'string' && sub.type !== 'image') set(blank, sub.path, '');
        if (Array.isArray(v) && sub.type === 'lines') set(blank, sub.path, []);
      }
      items.push(blank);
      set(obj, f.path, items);
      state.open.add(`${f.path}#${items.length - 1}`);
      rerender();
    } }, tr('+ Eintrag hinzufügen')));
  }
  return fieldWrap(f, wrap);
}

/** Englisch: gleiche Eintraege wie im Deutschen, nur Textfelder, kein Umbau. */
function renderListTranslation(f, enRoot, deRoot) {
  const items = get(deRoot, f.path) ?? [];
  const subs = f.fields.filter(translatable);
  const wrap = h('div', { class: 'list' });
  items.forEach((item, i) => {
    const key = `${f.path}#${i}`;
    const enItem = get(enRoot, `${f.path}.${i}`);
    const details = h('details', { class: 'item', open: state.open.has(key) },
      h('summary', {},
        h('span', { class: 'item__no' }, String(i + 1).padStart(2, '0')),
        h('span', { class: 'item__title' }, itemTitle(enItem, f) || itemTitle(item, f) || tr('Ohne Titel'))),
      h('div', { class: 'item__body' }, subs.map((sub) => renderField({ ...sub, path: `${f.path}.${i}.${sub.path}` }, enRoot, deRoot))));
    details.addEventListener('toggle', () => (details.open ? state.open.add(key) : state.open.delete(key)));
    wrap.append(details);
  });
  return fieldWrap({ ...f, help: '' }, wrap);
}

function refreshPatternTiles() {
  document.querySelectorAll('[data-patterns]').forEach((el) => el._draw?.());
}

// ---------- Gruppen ----------
const groupsEl = $('[data-groups]');
function renderGroups() {
  if (!state.data) return;
  const scroll = groupsEl.scrollTop;
  const active = document.activeElement;
  const activePath = active?.closest?.('.field')?.dataset.label;
  const en = state.mode === 'en';
  const groups = en ? GROUPS.map((g) => ({ ...g, fields: g.fields.filter(translatable) })).filter((g) => g.fields.length) : GROUPS;
  groupsEl.replaceChildren(
    en && h('p', { class: 'mode-note' }, tr('Englische Texte: Das Deutsche steht als Vorlage im Feld. Leere Felder bleiben deutsch.')),
    ...groups.map((g) => {
      const visible = GROUPS.find((x) => x.id === g.id).fields.find((f) => f.type === 'toggle' && f.path.endsWith('.show'));
      const hiddenSection = visible && !get(state.data, visible.path);
      const title = tr(g.title);
      const details = h('details', { class: `group ${hiddenSection ? 'is-hidden-section' : ''}`, open: state.open.has(g.id), 'data-group': g.id },
        h('summary', {}, hiddenSection ? tr('{title} (ausgeblendet)', { title }) : title),
        h('div', { class: 'group__body' }, g.fields.map((f) => (en ? renderField(f, state.en, state.data) : renderField(f, state.data)))));
      details.addEventListener('toggle', () => {
        if (details.open) { state.open.add(g.id); if (g.section) scrollPreviewTo(g.section); }
        else state.open.delete(g.id);
      });
      return details;
    }));
  groupsEl.scrollTop = scroll;
  if (activePath) groupsEl.querySelector(`.field[data-label="${CSS.escape(activePath)}"] input, .field[data-label="${CSS.escape(activePath)}"] textarea`)?.focus({ preventScroll: true });
  applySearch();
}

// Suche: Felder filtern, passende Gruppen aufklappen.
const search = $('[data-search]');
function applySearch() {
  const q = search.value.trim().toLowerCase();
  groupsEl.querySelectorAll('.group').forEach((g) => {
    const fields = [...g.querySelectorAll(':scope > .group__body > .field')];
    if (!q) { g.hidden = false; fields.forEach((f) => { f.hidden = false; f.classList.remove('is-match'); }); return; }
    let any = false;
    fields.forEach((f) => {
      const hit = (f.dataset.label || '').includes(q) || g.querySelector('summary').textContent.toLowerCase().includes(q);
      f.hidden = !hit;
      f.classList.toggle('is-match', hit && (f.dataset.label || '').includes(q));
      any ||= hit;
    });
    g.hidden = !any;
    if (any) g.open = true;
  });
}
search.addEventListener('input', applySearch);

$('[data-placeholders]').append(...PLACEHOLDERS.flatMap((p, i) => [i ? ', ' : '', h('code', {}, p)]));

// ---------- Bilder ----------
const picker = $('[data-picker]');
const pickerGrid = $('[data-picker-grid]');
const upload = $('[data-upload]');
const drop = $('[data-drop]');
let onPick = null;
let pickCurrent = '';

async function loadImages() {
  state.images = await api(`images/${state.slug}`);
}
function drawPicker() {
  pickerGrid.replaceChildren(...state.images.map((img) => h('button', {
    type: 'button',
    'aria-pressed': String(img.name === pickCurrent),
    onclick: () => { picker.close(); onPick?.(img.name); },
  }, h('span', { class: 'thumb' }, h('img', { src: imageUrl(img.name), alt: '', loading: 'lazy' })), h('span', {}, img.inherited ? `${img.name} · ${tr('Vorlage')}` : img.name))));
}
async function pickImage(current, cb) {
  pickCurrent = current;
  onPick = cb;
  await loadImages();
  drawPicker();
  picker.showModal();
}
async function uploadFiles(files) {
  let last = '';
  for (const file of files) {
    setStatus(tr('Lade {name} hoch …', { name: file.name }));
    try {
      const res = await fetch(`/__cfg/upload/${state.slug}?name=${encodeURIComponent(file.name)}`, { method: 'POST', body: file });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      last = body.name;
    } catch (e) {
      setStatus(tr('Upload fehlgeschlagen: {msg}', { msg: e.message }), 'err');
    }
  }
  await loadImages();
  // Ein einzelnes Bild direkt uebernehmen, mehrere zur Auswahl anzeigen.
  if (files.length === 1 && last) { picker.close(); onPick?.(last); setStatus(tr('Bild hochgeladen ✓'), 'ok'); }
  else { pickCurrent = last; drawPicker(); setStatus(tr('Bilder hochgeladen ✓'), 'ok'); }
}
upload.addEventListener('change', () => { if (upload.files.length) uploadFiles([...upload.files]); upload.value = ''; });
['dragenter', 'dragover'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add('is-over'); }));
['dragleave', 'drop'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.remove('is-over'); }));
drop.addEventListener('drop', (e) => { if (e.dataTransfer.files.length) uploadFiles([...e.dataTransfer.files]); });

// ---------- Kanzleien ----------
const firmSelect = $('[data-firm-select]');
async function loadState() {
  const s = await api('state');
  state.firms = s.firms;
  state.slug = s.active;
  firmSelect.replaceChildren(...s.firms.map((f) => h('option', { value: f.slug, selected: f.slug === s.active }, `${f.name}  (${f.slug})`)));
}
async function openFirm(slug) {
  clearTimeout(saveTimer);
  await save();
  state.slug = slug;
  state.data = await api(`firm/${slug}`);
  state.en = await api(`firm/${slug}?lang=en`);
  lastSaved = snapshot();
  state.past = [];
  state.future = [];
  updateUndo();
  await loadPatterns();
  setMode(state.mode);
  updateChecks();
  $('[data-build-cmd]').textContent = `FIRM=${slug} npm run build`;
}
firmSelect.addEventListener('change', async () => {
  const slug = firmSelect.value;
  setStatus(tr('Wechsle Kanzlei …'));
  await postJson('active', { slug });
  await openFirm(slug);
  frame.classList.add('is-loading');
  setStatus(tr('Kanzlei gewechselt ✓'), 'ok');
});

const newDialog = $('[data-new-dialog]');
const newForm = $('[data-new-form]');
const newError = $('[data-new-error]');
$('[data-new-firm]').addEventListener('click', () => { newForm.reset(); newError.hidden = true; newDialog.showModal(); });
newForm.name.addEventListener('input', () => {
  newForm.slug.value = newForm.name.value.toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/steuerberatung(sgesellschaft)?|steuerkanzlei|kanzlei|gmbh|partg(mbb)?|mbb/g, '')
    .replace(/&/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
});
newForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await save();
    const name = newForm.name.value.trim();
    const { slug } = await postJson('duplicate', { from: state.slug, slug: newForm.slug.value.trim(), name });
    await postJson('active', { slug });
    await loadState();
    await openFirm(slug);
    newDialog.close();
    setStatus(tr('„{name}“ angelegt ✓', { name }), 'ok');
  } catch (err) {
    newError.textContent = err.message;
    newError.hidden = false;
  }
});

// ---------- Pruefen ----------
/** Offene Punkte (gemeinsame Logik mit scripts/check-firm.mjs, siehe checks.js). */
const findIssues = () => checkProfile(state.data, state.en);
function updateChecks() {
  if (!state.data) return;
  const n = findIssues().length;
  const badge = $('[data-check-count]');
  badge.hidden = n === 0;
  badge.textContent = String(n);
}
$('[data-check]').addEventListener('click', () => {
  const list = $('[data-check-list]');
  const issues = findIssues();
  const close = () => $('[data-check-dialog]').close();
  list.replaceChildren(...(issues.length ? issues.map((i) => h('div', { class: 'check' },
    h('span', {}, '⚠︎'),
    h('span', {}, i.text),
    i.translate
      ? h('button', { type: 'button', class: 'btn btn--small', onclick: () => { close(); setMode('en'); } }, tr('Übersetzen'))
      : groupOf(i.path) && h('button', { type: 'button', class: 'btn btn--small', onclick: () => {
        close();
        const id = groupOf(i.path);
        setMode('de');
        state.open.add(id);
        renderGroups();
        groupsEl.querySelector(`[data-group="${id}"]`)?.scrollIntoView({ behavior: 'smooth' });
      } }, tr('Öffnen')))) : [h('div', { class: 'check is-ok' }, h('span', {}, '✓'), h('b', {}, tr('Alles bereit.')))]));
  $('[data-check-dialog]').showModal();
});

// ---------- Start ----------
translateStatic();
(async () => {
  try {
    await loadState();
    await openFirm(state.slug);
    layoutFrame();
    setStatus(tr('Bereit'));
  } catch (e) {
    setStatus(tr('Fehler beim Laden: {msg}', { msg: e.message }), 'err');
  }
})();
// Beim Schliessen ausstehende Aenderung sofort speichern.
window.addEventListener('beforeunload', () => {
  if (!state.data || snapshot() === lastSaved) return;
  navigator.sendBeacon?.(`/__cfg/firm/${state.slug}`, new Blob([JSON.stringify(state.data)], { type: 'application/json' }));
  navigator.sendBeacon?.(`/__cfg/firm/${state.slug}?lang=en`, new Blob([JSON.stringify(state.en)], { type: 'application/json' }));
});
