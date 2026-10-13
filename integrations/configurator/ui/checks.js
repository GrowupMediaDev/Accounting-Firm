// Pruefungen eines Kanzlei-Profils. EINE Quelle fuer den "Check"-Knopf im
// Konfigurator (app.js, Browser) und fuer scripts/check-firm.mjs (Node, Agenten).
// Reines Modul ohne Browser- oder Node-Abhaengigkeiten.
import { GROUPS } from './schema.js';
import { tr } from './i18n.js';

export const get = (obj, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
const TEXT_TYPES = new Set(['text', 'textarea', 'rich', 'lines']);
/** Wird das Feld uebersetzt? (Textfelder ohne i18n: false; Listen mit solchen Feldern) */
export const translatable = (f) => (f.type === 'list' ? f.fields.some(translatable) : TEXT_TYPES.has(f.type) && f.i18n !== false);

function hexRgb(hex) { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function lum(rgb) { return rgb.map((v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; }).reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0); }
/** WCAG-Kontrast zweier Hex-Farben. */
export function contrast(a, b) { const [x, y] = [lum(hexRgb(a)), lum(hexRgb(b))].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); }

/** Lesbarer Name eines Profil-Pfads, z. B. "Contact & address › Phone". */
export function labelOf(path) {
  for (const g of GROUPS) {
    for (const f of g.fields) {
      if (path === f.path) return `${tr(g.title)} › ${tr(f.label)}`;
      if (f.type === 'list' && path.startsWith(`${f.path}.`)) {
        const [i, ...rest] = path.slice(f.path.length + 1).split('.');
        const sub = f.fields.find((x) => x.path === rest.join('.'));
        return `${tr(f.label)} › ${Number(i) + 1}${sub ? ` › ${tr(sub.label)}` : ''}`;
      }
    }
  }
  return path;
}

/** Gruppe (Konfigurator-Abschnitt) zu einem Pfad. */
export const groupOf = (path) => GROUPS.find((g) => g.fields.some((f) => path === f.path || path.startsWith(`${f.path}.`)))?.id;

/** Anzahl deutscher Texte ohne englische Fassung. */
export function untranslated(data, en) {
  let n = 0;
  const empty = (v) => v == null || v === '' || (Array.isArray(v) && !v.length);
  const check = (f, path) => {
    if (f.type === 'list') {
      (get(data, path) ?? []).forEach((_, i) => f.fields.filter(translatable).forEach((sub) => check(sub, `${path}.${i}.${sub.path}`)));
      return;
    }
    if (!translatable(f)) return;
    if (!empty(get(data, path)) && empty(get(en, path))) n++;
  };
  GROUPS.forEach((g) => g.fields.forEach((f) => check(f, f.path)));
  return n;
}

/**
 * Offene Punkte eines Profils.
 * data = firm.json, en = firm.en.json (oder {}), images = Liste vorhandener Bilddateien (optional).
 * Jeder Punkt: { text, path?, translate?, level: 'error' | 'warn' }
 *   error = so nicht an einen Interessenten schicken; warn = pruefen.
 */
export function findIssues(data, en = {}, images = null) {
  const d = data;
  const issues = [];
  const add = (level, text, path, extra = {}) => issues.push({ level, text, path, ...extra });

  // Platzhalter aus der Vorlage
  const walk = (v, path) => {
    if (typeof v === 'string') {
      if (/TODO|example\.com|\[BITTE/i.test(v)) add('error', tr('{label}: noch Platzhalter („{value}“)', { label: labelOf(path), value: v.slice(0, 50) }), path);
    } else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}.${i}`));
    else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => walk(x, path ? `${path}.${k}` : k));
  };
  walk(d, '');
  if (/^\+?[\d\s]*0{3}\s?0{6,}/.test(d.contact.phone)) add('error', tr('Telefon: noch Platzhalter („{value}“)', { value: d.contact.phone }), 'contact.phone');
  if (/^0+$/.test(d.contact.postalCode)) add('error', tr('PLZ: noch Platzhalter'), 'contact.postalCode');

  // SEO-Laengen (mit eingesetzten Platzhaltern)
  const fillVars = (s) => s.replace('{city}', d.contact.city).replace('{name}', d.brand.name);
  const tl = fillVars(d.seo.title).length;
  if (tl > 60) add('warn', tr('Seitentitel ist {n} Zeichen lang (Google zeigt ca. 60).', { n: tl }), 'seo.title');
  const dl = fillVars(d.seo.description).length;
  if (dl < 110 || dl > 165) add('warn', tr('Beschreibung hat {n} Zeichen (gut: 120–160).', { n: dl }), 'seo.description');

  // Kontrast weisser Buttontext auf Akzent
  const c = contrast(d.theme.accent, d.theme.light);
  if (c < 4.5) add(c < 3 ? 'error' : 'warn', tr('Weiße Schrift auf der Akzentfarbe erreicht nur {ratio} : 1 (Buttons, ideal ab 4,5).', { ratio: c.toFixed(1) }), 'theme.accent');

  // Bildbeschreibungen, FAQ-Kontakt
  const altMissing = JSON.stringify(d).match(/"(imageAlt|deadlineImageAlt|alt)":""/g);
  if (altMissing) add('warn', tr('{n} Bild(er) ohne Bildbeschreibung.', { n: altMissing.length }), 'alt');
  if (!d.team.members.some((m) => m.name === d.faq.contactPerson)) add('error', tr('Ansprechpartner der FAQ-Karte ist nicht im Team.'), 'faq.contactPerson');

  // Hero-Ueberschrift: Zeilen brechen nicht um (nowrap) und muessen auf 360px passen.
  (d.hero.title ?? []).forEach((line, i) => {
    if (line.length > 14) add('warn', tr('Hero-Zeile {n} hat {len} Zeichen (max. ca. 14, sonst zu breit auf kleinen Handys).', { n: i + 1, len: line.length }), 'hero.title');
  });
  // Akzentwoerter brechen nie um: lange Woerter sprengen die Spalte auf dem Handy.
  const accents = (v, path) => {
    if (typeof v === 'string') { for (const [, w] of v.matchAll(/\*([^*]+)\*/g)) if (w.length >= 14) add('warn', tr('Akzentwort „{w}“ ist lang (bricht nicht um, mobil prüfen).', { w }), path); }
    else if (Array.isArray(v)) v.forEach((x, i) => accents(x, `${path}.${i}`));
    else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => accents(x, path ? `${path}.${k}` : k));
  };
  accents(d, '');

  // Bilder vorhanden? (nur wenn eine Dateiliste uebergeben wird)
  if (images) {
    const have = new Set(images);
    const refs = new Set();
    JSON.stringify(d).replace(/"([\w.-]+\.(?:png|jpe?g|webp|avif|gif|svg))"/gi, (m, f) => { refs.add(f); return m; });
    for (const f of refs) if (!have.has(f)) add('error', tr('Bild „{f}“ fehlt im images-Ordner.', { f }), '');
  }

  if (d.languages?.en) {
    const n = untranslated(d, en);
    if (n) add('warn', tr('Englisch: {n} Texte noch nicht übersetzt (bleiben deutsch).', { n }), '', { translate: true });
  }
  return issues;
}
