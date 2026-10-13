#!/usr/bin/env node
/**
 * new-firm.mjs — neues Kanzlei-Profil anlegen (wie "+ New firm" im Konfigurator).
 *
 *   node scripts/new-firm.mjs <slug> "<Name der Kanzlei>" [--from <slug>] [--activate]
 *
 * Legt src/firms/<slug>/ mit der firm.json von <from> an (Standard: hartmann-vogt),
 * setzt brand.name und schaltet Englisch aus (die englischen Texte der Vorlage
 * passen nicht zur neuen Kanzlei; firm.en.json wird nicht kopiert).
 * Bilder werden NICHT kopiert: was im eigenen images/-Ordner fehlt, kommt aus dem
 * Referenzprofil hartmann-vogt (siehe src/config/firm.ts). Ist <from> ein anderes
 * Profil, werden dessen eigene Bilder mitkopiert.
 * --activate setzt das Profil zusaetzlich in src/firms/active.json (Dev-Vorschau).
 */
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const flag = (name) => { const i = args.indexOf(name); if (i < 0) return undefined; const v = args[i + 1]; args.splice(i, v && !v.startsWith('--') ? 2 : 1); return v && !v.startsWith('--') ? v : true; };
const from = flag('--from') || 'hartmann-vogt';
const activate = Boolean(flag('--activate'));
const [slug, name] = args;

const FIRMS = fileURLToPath(new URL('../src/firms/', import.meta.url));
const fail = (msg) => { console.error(`✗ ${msg}`); process.exit(1); };

if (!slug || !name) fail('Aufruf: node scripts/new-firm.mjs <slug> "<Name der Kanzlei>" [--from <slug>] [--activate]');
if (!/^[a-z0-9][a-z0-9-]{0,47}$/.test(slug)) fail('Slug nur aus a-z, 0-9 und Bindestrich (z. B. mueller-partner).');
if (!existsSync(join(FIRMS, from, 'firm.json'))) fail(`Vorlage "${from}" gibt es nicht.`);
if (existsSync(join(FIRMS, slug))) fail(`"${slug}" gibt es schon.`);

mkdirSync(join(FIRMS, slug, 'images'), { recursive: true });
cpSync(join(FIRMS, from, 'firm.json'), join(FIRMS, slug, 'firm.json'));
if (from !== 'hartmann-vogt' && existsSync(join(FIRMS, from, 'images'))) cpSync(join(FIRMS, from, 'images'), join(FIRMS, slug, 'images'), { recursive: true });

const file = join(FIRMS, slug, 'firm.json');
const data = JSON.parse(readFileSync(file, 'utf8'));
data.brand.name = name;
data.languages = { ...(data.languages ?? {}), en: false };
writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);

if (activate) writeFileSync(join(FIRMS, 'active.json'), `${JSON.stringify({ firm: slug }, null, 2)}\n`);

console.log(`✓ Profil angelegt: src/firms/${slug}/ (Kopie von ${from})${activate ? ', aktiv gesetzt' : ''}
  Weiter: firm.json fuellen, eigene Bilder in images/ legen (fehlende kommen aus hartmann-vogt), dann
  node scripts/check-firm.mjs ${slug}
  FIRM=${slug} npm run build`);
