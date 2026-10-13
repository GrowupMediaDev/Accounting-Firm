// Feste Oberflaechentexte der Seite (keine Kanzlei-Inhalte, die stehen im Profil).
// Pro Sprache dieselben Schluessel; TypeScript prueft, dass EN vollstaendig ist.

const de = {
  homeLink: 'zur Startseite',
  mainNav: 'Hauptnavigation',
  mobileNav: 'Mobile Navigation',
  menuOpen: 'Menü öffnen',
  menuClose: 'Menü schließen',
  orCall: 'Oder anrufen:',
  call: 'Anrufen',
  language: 'Sprache',
  // Hero: Erreichbarkeit und Bewertung
  weekdays: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
  weekdaysShort: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
  months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  statusDefault: 'Werktags erreichbar',
  statusOpen: 'Jetzt erreichbar',
  statusLaterToday: 'Ab {time} erreichbar',
  statusTomorrow: 'Morgen ab {time}',
  statusOnDay: '{day} ab {time}',
  outOfStars: 'von 5 Sternen',
  reviews: '{count} {source}-Bewertungen',
  // Sektionen
  reasons: 'Gründe',
  onLinkedin: '{name} auf LinkedIn',
  prevQuote: 'Vorherige Stimme',
  nextQuote: 'Nächste Stimme',
  personalContact: 'Persönlicher Kontakt',
  // Footer
  footerNav: 'Footer Navigation',
  navigation: 'Navigation',
  services: 'Leistungen',
  legal: 'Rechtliches',
  contact: 'Kontakt',
  imprint: 'Impressum',
  privacy: 'Datenschutz',
};

export type UiStrings = typeof de;

const en: UiStrings = {
  homeLink: 'to the home page',
  mainNav: 'Main navigation',
  mobileNav: 'Mobile navigation',
  menuOpen: 'Open menu',
  menuClose: 'Close menu',
  orCall: 'Or call:',
  call: 'Call',
  language: 'Language',
  weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  statusDefault: 'Available on weekdays',
  statusOpen: 'Available now',
  statusLaterToday: 'Available from {time}',
  statusTomorrow: 'Tomorrow from {time}',
  statusOnDay: '{day} from {time}',
  outOfStars: 'out of 5 stars',
  reviews: '{count} {source} reviews',
  reasons: 'Reasons',
  onLinkedin: '{name} on LinkedIn',
  prevQuote: 'Previous testimonial',
  nextQuote: 'Next testimonial',
  personalContact: 'Personal contact',
  footerNav: 'Footer navigation',
  navigation: 'Navigation',
  services: 'Services',
  legal: 'Legal',
  contact: 'Contact',
  imprint: 'Legal notice',
  privacy: 'Privacy policy',
};

export const ui = { de, en };
