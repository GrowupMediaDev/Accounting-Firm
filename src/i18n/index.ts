// Sprache einer Seite aus der URL (/en/... = Englisch) und alles, was eine
// Komponente dafuer braucht: Profil in der Sprache, Platzhalter, UI-Texte.
//   const { f, fill, rich, t, locale } = useI18n(Astro.url);

import { firmFor, fill as fillText, rich as richText, type Locale } from '../config/firm';
import { ui, type UiStrings } from './ui';

export type { Locale };

export function localeOf(url: URL): Locale {
  return url.pathname === '/en' || url.pathname.startsWith('/en/') ? 'en' : 'de';
}

type TextKey = { [K in keyof UiStrings]: UiStrings[K] extends string ? K : never }[keyof UiStrings];

export function useI18n(url: URL) {
  const locale = localeOf(url);
  const strings = ui[locale];
  return {
    locale,
    f: firmFor(locale),
    ui: strings,
    fill: (text: string) => fillText(text, locale),
    rich: (text: string) => richText(text, locale),
    /** UI-Text, optional mit {platzhaltern}: t('reviews', { count: 86 }) */
    t: (key: TextKey, params: Record<string, string | number> = {}) =>
      strings[key].replace(/\{(\w+)\}/g, (m, k: string) => (k in params ? String(params[k]) : m)),
  };
}
