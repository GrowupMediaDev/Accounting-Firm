import { localizedPath } from './routes';

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

export const mainNav: { label: string; section: SectionId }[] = [
  { label: 'Start', section: SECTION.start },
  { label: 'Kanzlei', section: SECTION.kanzlei },
  { label: 'Leistungen', section: SECTION.leistungen },
  { label: 'Team', section: SECTION.team },
  { label: 'Aktuelles', section: SECTION.aktuelles },
];

export const primaryCta = {
  label: 'Termin vereinbaren',
  section: SECTION.termin,
};

// Sprungziel einer Sektion: auf der Startseite nur der Anker, sonst Startseite + Anker.
export function sectionHref(section: SectionId, pathname: string): string {
  const home = localizedPath('home', 'de');
  return pathname === home ? `#${section}` : `${home}#${section}`;
}
