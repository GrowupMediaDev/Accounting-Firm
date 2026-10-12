#!/usr/bin/env node
/**
 * seo-check.mjs — mechanischer SEO-/Hygiene-Check.
 *
 * Laeuft NUR beim Produktions-Build (in package.json vor "astro build" haengen),
 * NICHT bei "astro dev". Prueft nur Mechanisches. Ob Texte GUT sind, klaert
 * SEO-REVIEW.md, nicht dieses Skript.
 *
 * Zwei Stufen:
 *   ERROR   -> bricht den Build ab (Exit 1)
 *   WARNING -> laeuft durch (Exit 0), nur Hinweis
 *
 * Ventil: SEO_CHECK=warn npm run build  -> stuft alle ERRORs zu WARNINGs herab.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const WARN_ONLY = process.env.SEO_CHECK === 'warn';
const SCAN_DIRS = ['src', 'functions'];
const SCAN_EXT = new Set(['.astro', '.ts', '.tsx', '.js', '.mjs', '.jsx', '.md']);

const errors = [];
const warnings = [];

function walk(dir) {
  let out = [];
  let items;
  try { items = readdirSync(dir); } catch { return out; }
  for (const it of items) {
    const p = join(dir, it);
    const s = statSync(p);
    if (s.isDirectory()) out = out.concat(walk(p));
    else if (SCAN_EXT.has(extname(p))) out.push(p);
  }
  return out;
}

function eachLine(file, fn) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => fn(line, i + 1));
}

// --- Regeln ---
const RULES = [
  {
    id: 'secret-in-code',
    level: 'error',
    test: (line) => /(re_[A-Za-z0-9]{12,}|RESEND_API_KEY\s*=\s*['"]re_|TURNSTILE_SECRET_KEY\s*=\s*['"]0x)/.test(line),
    msg: 'Moeglicher Secret/API-Key als Literal im Code. Gehoert in eine Env-Variable.',
  },
  {
    id: 'meta-keywords',
    level: 'error',
    test: (line) => /<meta\s+name=["']keywords["']/i.test(line),
    msg: 'meta keywords ist verboten (Google ignoriert es, legt die Strategie offen).',
  },
  {
    id: 'raw-internal-anchor',
    level: 'error',
    onlyExt: new Set(['.astro']),
    test: (line) => /<a\s+[^>]*href=["']\/[^"']/.test(line) && !/localizedPath/.test(line),
    msg: 'Roher <a href="/..">. Interne Links immer ueber localizedPath(key, locale).',
  },
  {
    id: 'placeholder',
    level: 'warning',
    test: (line) => /\[BITTE ERG(AE|Ä)NZEN\]/.test(line),
    msg: 'Platzhalter [BITTE ERGAENZEN] im Code. Vor Launch fuellen.',
  },
  {
    id: 'em-dash',
    level: 'warning',
    test: (line) => line.includes('\u2014'),
    msg: 'Em-Dash (—) gefunden. In deutschen Texten Halbgeviertstrich (–) verwenden.',
  },
];

for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    const ext = extname(file);
    eachLine(file, (line, n) => {
      for (const r of RULES) {
        if (r.onlyExt && !r.onlyExt.has(ext)) continue;
        if (r.test(line)) {
          const entry = `${file}:${n}  [${r.id}] ${r.msg}`;
          (r.level === 'error' ? errors : warnings).push(entry);
        }
      }
    });
  }
}

// --- Registry-Grundcheck: jede Route braucht einen DE-Slug ---
try {
  const routesSrc = readFileSync('src/config/routes.ts', 'utf8');
  const body = routesSrc.slice(routesSrc.indexOf('export const routes'));
  const enOnly = /\{\s*en:\s*['"][^'"]+['"]\s*,/g;
  if (enOnly.test(body)) {
    errors.push("src/config/routes.ts  [route-de-missing] Route ohne DE-Slug. DE ist Pflicht.");
  }
} catch { /* Registry optional beim ersten Setup */ }

// --- Ausgabe ---
function print(title, list) {
  if (!list.length) return;
  console.log(`\n${title} (${list.length}):`);
  for (const e of list) console.log('  ' + e);
}

print('WARNINGEN', warnings);
print('FEHLER', errors);

if (errors.length && !WARN_ONLY) {
  console.error(`\nseo-check: ${errors.length} Fehler. Build abgebrochen.`);
  console.error('Bewusst ueberschreiben mit: SEO_CHECK=warn npm run build');
  process.exit(1);
}

if (errors.length && WARN_ONLY) {
  console.log(`\nseo-check: ${errors.length} Fehler als Warnung durchgelassen (SEO_CHECK=warn).`);
}
if (!errors.length && !warnings.length) console.log('seo-check: alles sauber.');
process.exit(0);
