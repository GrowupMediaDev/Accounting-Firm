// Kanzlei-Profil: EINZIGE Quelle fuer alles, was pro Kanzlei anders ist (Marke,
// Farben, Muster, Kontakt, Texte, Bilder). Jedes Profil liegt in
// src/firms/<slug>/ (firm.json + images/). Bearbeitet wird es im Konfigurator
// (npm run dev, dann /configurator).
//
// Aktives Profil: Umgebungsvariable FIRM (fuer Builds: FIRM=mueller npm run build),
// sonst src/firms/active.json (setzt der Konfigurator).
// Fehlende Felder (aeltere Profile) fuellt das Referenzprofil auf.
//
// Englisch: firm.en.json im selben Ordner enthaelt NUR die uebersetzten Texte
// (gleiche Struktur, Listen nach Position). Was dort fehlt oder leer ist, bleibt
// deutsch. Die EN-Seite (/en/) gibt es nur, wenn languages.en aktiv ist.

import type { ImageMetadata } from 'astro';
import { ui } from '../i18n/ui';
import active from '../firms/active.json';
import reference from '../firms/hartmann-vogt/firm.json';

export type Firm = typeof reference;
export const REFERENCE_FIRM = 'hartmann-vogt';

const profiles = import.meta.glob<Firm>('../firms/*/firm.json', { eager: true, import: 'default' });
const translations = import.meta.glob<unknown>('../firms/*/firm.en.json', { eager: true, import: 'default' });
const images = import.meta.glob<ImageMetadata>('../firms/*/images/*.{png,jpg,jpeg,webp,avif,gif}', { eager: true, import: 'default' });
// SVGs als Komponenten (Bildmarke wird inline gerendert und animiert).
const svgs = import.meta.glob<(props: Record<string, unknown>) => unknown>('../firms/*/images/*.svg', { eager: true, import: 'default' });

// Build-Zeit in Node: FIRM aus der Umgebung (FIRM=mueller npm run build).
declare const process: { env: Record<string, string | undefined> } | undefined;
const envFirm = typeof process !== 'undefined' ? process.env.FIRM : undefined;
export const firmSlug: string = envFirm || active.firm;
const own = profiles[`../firms/${firmSlug}/firm.json`];
if (!own) throw new Error(`Kanzlei-Profil "${firmSlug}" fehlt: src/firms/${firmSlug}/firm.json`);

// Tiefes Zusammenfuehren: Objekte werden gemischt, Arrays und Werte ersetzt.
function merge<T>(base: T, over: unknown): T {
  if (Array.isArray(base) || typeof base !== 'object' || base === null) return (over ?? base) as T;
  const out = { ...base } as Record<string, unknown>;
  for (const [k, v] of Object.entries((over ?? {}) as Record<string, unknown>)) {
    out[k] = k in out ? merge(out[k], v) : v;
  }
  return out as T;
}

export const firm: Firm = merge(reference, own);

export type Locale = 'de' | 'en';

// Uebersetzung drueberlegen: Objekte mischen, Objekt-Listen nach Position,
// Textlisten nur ersetzen, wenn sie gefuellt sind; leere Texte bleiben deutsch.
function overlay<T>(base: T, over: unknown): T {
  if (over == null || over === '') return base;
  if (Array.isArray(base)) {
    if (!Array.isArray(over)) return base;
    if (base.every((x) => typeof x !== 'object')) return (over.filter((x) => x !== '' && x != null).length ? over : base) as T;
    return base.map((item, i) => overlay(item, over[i])) as T;
  }
  if (typeof base === 'object' && base !== null) {
    const out = { ...base } as Record<string, unknown>;
    for (const k of Object.keys(out)) out[k] = overlay(out[k], (over as Record<string, unknown>)[k]);
    return out as T;
  }
  return (typeof over === typeof base ? over : base) as T;
}

/** Ist die englische Seite fuer dieses Profil eingeschaltet? */
export const hasEnglish: boolean = Boolean(firm.languages?.en);
const byLocale: Record<Locale, Firm> = {
  de: firm,
  en: overlay(firm, translations[`../firms/${firmSlug}/firm.en.json`]),
};
/** Profil in der Sprache der Seite (Texte uebersetzt, alles andere gleich). */
export function firmFor(locale: Locale): Firm {
  return byLocale[locale] ?? firm;
}

/** Bild aus dem Profil (Dateiname in images/); fehlt es, das gleichnamige Referenzbild. */
export function img(name: string): ImageMetadata {
  const found = images[`../firms/${firmSlug}/images/${name}`] ?? images[`../firms/${REFERENCE_FIRM}/images/${name}`];
  if (!found) throw new Error(`Bild "${name}" fehlt in src/firms/${firmSlug}/images/`);
  return found;
}

/** Bildmarke: SVG als Komponente oder Rasterbild. */
export function logoMark(): { svg?: (props: Record<string, unknown>) => unknown; image?: ImageMetadata } {
  const name = firm.brand.logoMark;
  if (name.endsWith('.svg')) {
    const key = [`../firms/${firmSlug}/images/${name}`, `../firms/${REFERENCE_FIRM}/images/${name}`].find((k) => k in svgs);
    if (key) return { svg: svgs[key] };
  }
  return { image: img(name) };
}

// ---------- Platzhalter in Texten ----------
const h = firm.hours;
const varsFor = (locale: Locale): Record<string, string> => ({
  name: firmFor(locale).brand.name,
  shortName: firm.brand.shortName,
  city: firm.contact.city,
  phone: firm.contact.phone,
  email: firm.contact.email,
  founded: String(firm.brand.founded),
  years: String(new Date().getFullYear() - firm.brand.founded),
  open: String(h.open),
  close: String(h.close),
  days: `${ui[locale].weekdaysShort[h.days[0]]}–${ui[locale].weekdaysShort[h.days[h.days.length - 1]]}`,
});
const vars = { de: varsFor('de'), en: varsFor('en') };

/** Ersetzt {city}, {years}, {open} … durch die Profildaten. */
export function fill(text: string, locale: Locale = 'de'): string {
  return text.replace(/\{(\w+)\}/g, (m, k: string) => vars[locale][k] ?? m);
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Ueberschrift mit Akzentwort: *Wort* wird zur kursiven Akzentfarbe (fuer set:html). */
export function rich(text: string, locale: Locale = 'de'): string {
  return esc(fill(text, locale)).replace(/\*([^*]+)\*/g, '<em>$1</em>');
}
