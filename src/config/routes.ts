// Routen-Registry: die EINZIGE Quelle fuer alle Seiten, Slugs und Sprachpaare.
// Kein roher <a href="/..">-String im Projekt, immer localizedPath() nutzen.
// DE ist Pflicht, EN optional (Deutsch zuerst, Uebersetzung spaeter).

import type { Locale } from './site';

export type SchemaType =
  | 'LocalBusiness'    // Startseite + Kernseiten
  | 'Service'          // Leistungsseite
  | 'ServiceItemList'  // Hub mit gleichrangigen Subs
  | 'Vehicle'          // nur bei echtem Fahrzeug-Datensatz
  | 'FAQPage'
  | 'TouristTrip'
  | 'None';

export interface RouteDef {
  de: string;            // DE-Slug, Pflicht. Mit fuehrendem + abschliessendem Slash.
  en?: string;           // EN-Slug, optional. Fehlt EN, gibt es kein hreflang fuer die Seite.
  indexable: boolean;    // steuert noindex UND Sitemap-Aufnahme
  schema: SchemaType;
  parent?: string;       // pageKey der Hub-Seite, fuer Breadcrumb / Hub-Spoke
}

// Bewusst fast leer. Seitenliste ist projektspezifisch, hier NICHT vordefinieren.
const routeDefs = {
  home: { de: '/', indexable: true, schema: 'LocalBusiness' },
  // Interne Design-System-Uebersicht, nicht indexieren.
  styleguide: { de: '/styleguide/', indexable: false, schema: 'None' },
  // Rechtstexte: noindex, bis die echten Texte vom Mandanten vorliegen.
  impressum: { de: '/impressum/', indexable: false, schema: 'None' },
  datenschutz: { de: '/datenschutz/', indexable: false, schema: 'None' },

  // Beispiele (auskommentiert), pro Projekt ersetzen:
  // kontakt: { de: '/kontakt/', en: '/en/contact/', indexable: true, schema: 'LocalBusiness' },
  // flughafenHub: { de: '/flughafentransfer/', en: '/en/airport-transfer/', indexable: true, schema: 'ServiceItemList' },
  // flughafenMuc: { de: '/flughafentransfer/muc/', indexable: true, schema: 'Service', parent: 'flughafenHub' },
} satisfies Record<string, RouteDef>;

export type PageKey = keyof typeof routeDefs;
// Breit typisiert, damit optionale Felder (en, parent) ueberall lesbar bleiben.
export const routes: Record<PageKey, RouteDef> = routeDefs;

export function localizedPath(key: PageKey, locale: Locale): string {
  const r = routes[key];
  if (locale === 'en') return r.en ?? r.de; // Fallback DE, falls EN fehlt
  return r.de;
}

export function hasEN(key: PageKey): boolean {
  return Boolean((routes[key] as RouteDef).en);
}
