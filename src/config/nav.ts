import { localizedPath } from './routes';
import { firmFor, type Locale } from './firm';

// Hauptnavigation der One-Page. Einzige Quelle fuer Menuepunkte und Sektions-IDs:
// Header, mobiles Menue und (spaeter) Footer lesen von hier, die Sektionen
// setzen ihre id aus SECTION.
export const SECTION = {
  start: 'start',
  kanzlei: 'kanzlei',
  leistungen: 'leistungen',
  team: 'team',
  aktuelles: 'aktuelles',
  termin: 'termin',
} as const;

export type SectionId = (typeof SECTION)[keyof typeof SECTION];

// Beschriftungen aus dem Kanzlei-Profil (in der Sprache der Seite);
// ausgeblendete Sektionen fallen raus.
export function navFor(locale: Locale): { label: string; section: SectionId }[] {
  const f = firmFor(locale);
  return [
    { label: f.nav.start, section: SECTION.start },
    { label: f.nav.kanzlei, section: SECTION.kanzlei },
    { label: f.nav.leistungen, section: SECTION.leistungen },
    ...(f.team.show ? [{ label: f.nav.team, section: SECTION.team }] : []),
    ...(f.news.show ? [{ label: f.nav.aktuelles, section: SECTION.aktuelles }] : []),
  ];
}

export function primaryCtaFor(locale: Locale) {
  return { label: firmFor(locale).nav.cta, section: SECTION.termin };
}

// Sprungziel einer Sektion: auf der Startseite nur der Anker, sonst Startseite + Anker.
export function sectionHref(section: SectionId, pathname: string): string {
  const home = localizedPath('home', pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'de');
  return pathname === home ? `#${section}` : `${home}#${section}`;
}
