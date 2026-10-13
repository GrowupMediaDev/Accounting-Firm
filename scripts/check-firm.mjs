#!/usr/bin/env node
/**
 * check-firm.mjs — prueft ein Kanzlei-Profil, bevor es an einen Interessenten geht.
 *
 *   node scripts/check-firm.mjs [slug] [--json]
 *
 * Ohne slug: das aktive Profil (src/firms/active.json). Dieselben Pruefungen wie
 * der "Check"-Knopf im Konfigurator (integrations/configurator/ui/checks.js),
 * plus Dinge, die nur auf der Platte pruefbar sind: fehlende Bilder, Bildgroessen,
 * animierbare Bildmarke.
 *
 * Exit 1, wenn es Fehler (level "error") gibt. --json gibt die Liste maschinenlesbar aus.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findIssues } from '../integrations/configurator/ui/checks.js';

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const FIRMS = fileURLToPath(new URL('../src/firms/', import.meta.url));
const slug = args.find((a) => !a.startsWith('--')) || JSON.parse(readFileSync(join(FIRMS, 'active.json'), 'utf8')).firm;
const dir = join(FIRMS, slug);
if (!existsSync(join(dir, 'firm.json'))) { console.error(`✗ Profil "${slug}" fehlt (src/firms/${slug}/firm.json).`); process.exit(1); }

const data = JSON.parse(readFileSync(join(dir, 'firm.json'), 'utf8'));
const en = existsSync(join(dir, 'firm.en.json')) ? JSON.parse(readFileSync(join(dir, 'firm.en.json'), 'utf8')) : {};
// Eigene Bilder plus geerbte aus dem Referenzprofil (dieselbe Regel wie img() in src/config/firm.ts).
const REF = 'hartmann-vogt';
const own = existsSync(join(dir, 'images')) ? readdirSync(join(dir, 'images')) : [];
const inherited = slug === REF ? [] : readdirSync(join(FIRMS, REF, 'images')).filter((f) => !own.includes(f));
const images = [...own, ...inherited];
const imagePath = (f) => join(FIRMS, own.includes(f) ? slug : REF, 'images', f);
const issues = findIssues(data, en, images);
const add = (level, text) => issues.push({ level, text });

// Bildmarke: der Preloader animiert <path>-Elemente einzeln.
const mark = data.brand.logoMark;
if (!data.brand.logoImage && mark?.endsWith('.svg') && images.includes(mark)) {
  const svg = readFileSync(imagePath(mark), 'utf8');
  const paths = (svg.match(/<path\b/g) ?? []).length;
  if (!paths) add('warn', `Logo mark ${mark} has no <path> elements: the preloader bar animation needs paths (convert shapes to paths).`);
  if (/<image\b/.test(svg)) add('warn', `Logo mark ${mark} embeds a raster <image>: use a real vector SVG or set brand.logoMark to the PNG.`);
  const colors = new Set((svg.match(/fill="(#[0-9a-fA-F]{3,8})"/g) ?? []).map((c) => c.toLowerCase()));
  if (data.brand.tintMark && colors.size > 1) add('warn', `Logo mark has ${colors.size} fill colours but brand.tintMark is on (everything becomes the accent colour).`);
}

// Bildgroessen (sharp kommt mit Astro; ohne sharp wird dieser Teil uebersprungen)
let sharp = null;
try { sharp = (await import('sharp')).default; } catch { /* optional */ }
if (sharp) {
  const minWidth = (f, w, why) => ({ f, w, why });
  const rules = [
    data.hero.layout === 'photo' && data.hero.photo && minWidth(data.hero.photo, 2000, 'hero photo fills the screen'),
    data.hero.layout !== 'photo' && minWidth(data.hero.image, 1600, 'hero cut-out'),
    ...data.leistungen.items.map((s) => minWidth(s.image, 896, `service "${s.title}"`)),
    ...data.warum.items.map((r) => minWidth(r.image, 1200, `reason "${r.title}" (large desktop panel)`)),
    ...data.team.members.map((m) => minWidth(m.image, 700, `portrait ${m.name}`)),
  ].filter(Boolean);
  for (const { f, w, why } of rules) {
    if (!f || !images.includes(f) || f.endsWith('.svg')) continue;
    const meta = await sharp(imagePath(f)).metadata();
    if ((meta.width ?? 0) < w) add('warn', `Image ${f} is ${meta.width}px wide, ${w}px recommended (${why}).`);
  }
  if (data.hero.layout !== 'photo' && data.hero.image && images.includes(data.hero.image)) {
    const meta = await sharp(imagePath(data.hero.image)).metadata();
    if (!meta.hasAlpha) add('error', `Hero image ${data.hero.image} has no transparency: the cut-out layout needs a PNG without background (or set hero.layout to "photo").`);
  }
}

if (asJson) {
  console.log(JSON.stringify({ slug, issues }, null, 2));
} else {
  const errors = issues.filter((i) => i.level === 'error');
  const warns = issues.filter((i) => i.level !== 'error');
  console.log(`Firm profile: ${slug} (${data.brand.name})`);
  for (const i of errors) console.log(`  ✗ ${i.text}`);
  for (const i of warns) console.log(`  ⚠ ${i.text}`);
  console.log(errors.length || warns.length ? `\n${errors.length} error(s), ${warns.length} warning(s).` : '✓ All set.');
}
process.exit(issues.some((i) => i.level === 'error') ? 1 : 0);
