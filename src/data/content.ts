// Inhalte der Startseite. Einzige Quelle: Sektionen und Schema lesen von hier.
// Texte aus Figma uebernommen; wo Figma nur Template-Platzhalter hatte, ist der
// Eintrag mit "PLATZHALTER" markiert und muss vor Launch mit dem Mandanten
// abgestimmt werden.

import type { ImageMetadata } from 'astro';

import leistungFibu from '../assets/images/leistung-finanzbuchhaltung.jpg';
import leistungLohn from '../assets/images/leistung-lohn.png';
import leistungJa from '../assets/images/leistung-jahresabschluss.jpg';
import warumAnsprech from '../assets/images/warum-ansprechpartner.jpg';
import warumDigital from '../assets/images/warum-digital.jpg';
import warumPauschale from '../assets/images/warum-pauschale.png';
import warumMelden from '../assets/images/warum-melden.png';
import iconAnsprech from '../assets/icons/warum-ansprechpartner.svg?url';
import iconDigital from '../assets/icons/warum-digital.svg?url';
import iconPauschale from '../assets/icons/warum-pauschale.svg?url';
import iconMelden from '../assets/icons/warum-melden.svg?url';
import teamHartmann from '../assets/images/team-hartmann.png';
import teamVogt from '../assets/images/team-vogt.png';
import teamKeller from '../assets/images/team-keller.png';
import bergerAvatar from '../assets/images/testimonial-berger.jpg';
import clientLogo from '../assets/images/client-logo.png';
import newsERechnung from '../assets/images/news-erechnung.png';
import newsGmbh from '../assets/images/news-gmbh-ug.png';

// ---------- Kennzahlen (Hero-Karte, Kanzlei-Leiste) ----------
export const stats = [
  { value: '15 Jahre', label: 'Erfahrung in der Beratung' },
  { value: '40+', label: 'Steuerberater im Team' },
  { value: '180+', label: 'Betreute Mandanten' },
  { value: '24 Std.', label: 'Reaktionszeit werktags' },
];

export const rating = { score: '4,9', max: 5, clients: '180+' };

// ---------- Leistungen ----------
export interface Service {
  title: string;
  text: string;
  points: string[];
  image: ImageMetadata;
  alt: string;
}

export const services: Service[] = [
  {
    title: 'Finanzbuchhaltung',
    text: 'Laufende Buchhaltung, digital und ohne Belegchaos. Sie laden hoch, wir übernehmen den Rest.',
    points: ['Belegerfassung und Kontierung', 'Umsatzsteuervoranmeldung', 'Monatliche Auswertungen (BWA)'],
    image: leistungFibu,
    alt: 'Beleg wird mit dem Smartphone fotografiert und digital hochgeladen',
  },
  {
    // PLATZHALTER: Figma zeigt dreimal "Finanzbuchhaltung". Text mit Mandant abstimmen.
    title: 'Lohnbuchhaltung',
    text: 'Pünktliche Abrechnungen für Ihr Team, inklusive Meldungen an Krankenkassen und Finanzamt.',
    points: ['Monatliche Lohn- und Gehaltsabrechnung', 'Meldungen an Sozialversicherung', 'Lohnsteueranmeldung'],
    image: leistungLohn,
    alt: 'Beratungsgespräch mit Handschlag am Besprechungstisch',
  },
  {
    // PLATZHALTER: siehe oben.
    title: 'Jahresabschluss',
    text: 'Bilanz, Steuererklärungen und Offenlegung termingerecht. Mit Erklärung, was die Zahlen bedeuten.',
    points: ['Bilanz und Gewinnermittlung', 'Betriebliche Steuererklärungen', 'Abschlussgespräch mit Ausblick'],
    image: leistungJa,
    alt: 'Zwei Personen gehen Unterlagen gemeinsam am Tisch durch',
  },
];

// ---------- Warum wir ----------
export interface Reason {
  tab: string;
  title: string;
  text: string;
  detailTitle: string;
  detail: string;
  image: ImageMetadata;
  alt: string;
  icon: string;
}

export const reasons: Reason[] = [
  {
    tab: 'Fester Ansprechpartner',
    title: 'Fester Ansprechpartner',
    text: 'Immer dieselbe Person, die Ihr Unternehmen kennt. Keine wechselnden Sachbearbeiter.',
    detailTitle: 'Was das heißt',
    detail: 'Eine Durchwahl, eine E-Mail-Adresse, keine Erklärungen von vorn.',
    image: warumAnsprech,
    alt: 'Steuerberaterin telefoniert am Schreibtisch mit einem Mandanten',
    icon: iconAnsprech,
  },
  {
    tab: 'Digitale Zusammenarbeit',
    title: 'Digitale Zusammenarbeit',
    text: 'Belege hochladen, Auswertungen im Portal abrufen. DATEV Unternehmen online inklusive.',
    detailTitle: 'Was das heißt',
    // PLATZHALTER: Figma hatte hier englischen Template-Text.
    detail: 'Kein Pendelordner, kein Postversand. Ihre Unterlagen sind jederzeit dort, wo Sie sie brauchen.',
    image: warumDigital,
    alt: 'Hände halten ein Smartphone mit geöffneter Beleg-App',
    icon: iconDigital,
  },
  {
    // PLATZHALTER: Karte fehlte in Figma (dort englischer Kanzlei-Template-Text).
    tab: 'Feste Monatspauschale',
    title: 'Feste Monatspauschale',
    text: 'Ein Betrag pro Monat, schriftlich vereinbart. Keine Abrechnung nach Zeit, keine Nachforderungen.',
    detailTitle: 'Was das heißt',
    detail: 'Sie können Ihre Steuerberatung planen wie Miete oder Gehälter.',
    image: warumPauschale,
    alt: 'Zwei Kollegen prüfen gemeinsam eine Auswertung',
    icon: iconPauschale,
  },
  {
    // PLATZHALTER: siehe oben.
    tab: 'Wir melden uns zuerst',
    title: 'Wir melden uns zuerst',
    text: 'Fristen, Vorauszahlungen, Auffälligkeiten in den Zahlen: Sie hören es von uns, bevor es zum Problem wird.',
    detailTitle: 'Was das heißt',
    detail: 'Keine Überraschungen vom Finanzamt, sondern Zeit zum Reagieren.',
    image: warumMelden,
    alt: 'Besprechung am Tisch mit Unterlagen und Notizen',
    icon: iconMelden,
  },
];

// ---------- Team ----------
// Hinweis: In Figma waren die Fotos von Julia Vogt und Andreas Keller vertauscht.
export const team = [
  { name: 'Dr. Michael Hartmann', role: 'Steuerberater, Partner', image: teamHartmann, linkedin: '#', objectPosition: '38% 20%' },
  { name: 'Julia Vogt', role: 'Steuerberaterin, Partnerin', image: teamVogt, linkedin: '#', objectPosition: '50% 20%' },
  { name: 'Andreas Keller', role: 'Steuerberater', image: teamKeller, linkedin: '#', objectPosition: '50% 20%' },
];

// ---------- Mandantenstimmen ----------
// avatar/logo optional: ohne Foto zeigt die Karte Initialen.
export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  avatar?: ImageMetadata;
  logo?: ImageMetadata;
}

export const testimonials: Testimonial[] = [
  {
    quote: 'Wir hatten vorher zwei Dienstleister für Buchhaltung und Lohn und ständig Rückfragen zwischen beiden. Jetzt läuft alles über eine Stelle, und ich bekomme meine BWA am 10., nicht irgendwann.',
    // Hinweis: Figma-Foto zeigt eine Frau, Name ist maennlich. Mit Mandant klaeren.
    name: 'Thomas Berger',
    role: 'Geschäftsführer, Berger Elektrotechnik GmbH',
    avatar: bergerAvatar,
    logo: clientLogo,
  },
  {
    // PLATZHALTER: echte Mandantenstimme einholen.
    quote: 'Beim Wechsel mitten im Jahr hatte ich mit Chaos gerechnet. Die Übergabe lief komplett über die Kanzlei, ich musste nur unterschreiben.',
    name: 'Sandra Wolff',
    role: 'Inhaberin, Wolff Innenarchitektur',
  },
  {
    // PLATZHALTER: echte Mandantenstimme einholen.
    quote: 'Endlich jemand, der mir die Zahlen erklärt, statt sie mir nur zu schicken. Die Quartalsgespräche sind für mich inzwischen fester Termin.',
    name: 'Jonas Albers',
    role: 'Gründer, Albers Digital UG',
  },
];

// ---------- FAQ (auch Quelle fuer das FAQPage-Schema) ----------
export const faqs = [
  {
    q: 'Was kostet die Betreuung?',
    a: 'Das hängt von Rechtsform, Belegvolumen und Umfang ab. Wir nennen Ihnen nach dem Erstgespräch eine feste Monatspauschale und halten sie schriftlich fest. Sie wissen vorher, woran Sie sind.',
  },
  {
    // PLATZHALTER-Antworten ab hier: in Figma nur Fragen vorhanden.
    q: 'Wie läuft der Wechsel ab?',
    a: 'Sie kündigen bei Ihrer bisherigen Kanzlei, den Rest übernehmen wir: Datenübernahme aus DATEV, Abstimmung offener Fristen und Übergabe der Unterlagen. Ein Wechsel ist auch mitten im Jahr möglich.',
  },
  {
    q: 'Muss ich meine Buchhaltungssoftware wechseln?',
    a: 'In den meisten Fällen nicht. Wir arbeiten mit DATEV und binden gängige Programme und Bankkonten an. Wenn ein Wechsel sinnvoll ist, sagen wir Ihnen das und begleiten die Umstellung.',
  },
  {
    q: 'Wie schnell bekomme ich eine Antwort?',
    a: 'Werktags innerhalb von 24 Stunden, meist deutlich schneller. Sie erreichen Ihren festen Ansprechpartner direkt per Telefon oder E-Mail.',
  },
  {
    q: 'Betreuen Sie auch Mandanten außerhalb von Düsseldorf?',
    a: 'Ja. Da wir vollständig digital arbeiten, betreuen wir Unternehmen in ganz Deutschland. Persönliche Termine finden in unserer Kanzlei in Düsseldorf oder per Video statt.',
  },
  {
    q: 'Was brauche ich für das Erstgespräch?',
    a: 'Nichts außer etwas Zeit. Hilfreich sind die letzte BWA oder der letzte Jahresabschluss, damit wir Ihre Situation schneller einschätzen können.',
  },
];

// ---------- Aktuelles ----------
// PLATZHALTER: Artikel-Seiten existieren noch nicht, Karten verlinken daher nicht.
export const news = [
  {
    title: 'E-Rechnungspflicht: Was jetzt auf Unternehmen zukommt',
    text: 'Seit 2025 müssen Unternehmen E-Rechnungen empfangen können. Für den Versand laufen Übergangsfristen. Was Sie bis wann umstellen müssen.',
    image: newsERechnung,
    alt: 'Unternehmerpaar sitzt nachdenklich auf dem Sofa',
  },
  {
    title: 'GmbH oder UG: die Rechnung hinter der Entscheidung',
    text: 'Stammkapital, Haftung, laufende Kosten und Außenwirkung. Wir rechnen beide Varianten an einem konkreten Beispiel durch.',
    image: newsGmbh,
    alt: 'Modernes Firmengebäude mit Holzfassade und Einfahrt',
  },
];
