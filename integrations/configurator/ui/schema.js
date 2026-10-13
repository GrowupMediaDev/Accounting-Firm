// Formular-Beschreibung des Kanzlei-Profils (src/firms/<slug>/firm.json).
// Jede Gruppe = ein Abschnitt im Konfigurator; `section` ist der Anker, zu dem
// die Vorschau beim Oeffnen springt. Neues Feld im Profil? Hier eintragen.
//
// Feldtypen: text, textarea, rich (Ueberschrift mit *Akzentwort*), number,
// range, color, select, toggle, image, lines (Liste von Zeilen), numbers
// (Zahlenreihe), days (Wochentage), person (Name aus dem Team),
// list (Liste von Eintraegen mit eigenen Feldern).
//
// Uebersetzung: Textfelder (text, textarea, rich, lines) gibt es im Modus
// "English" zum Uebersetzen, ausser sie tragen i18n: false (Namen, Kontakt, URLs).

const img = (path, label, help) => ({ path, label, type: 'image', help });
const alt = (path) => ({ path, label: 'Bildbeschreibung (Alt-Text)', type: 'text', help: 'Was ist zu sehen? Für Screenreader und Google.' });
const heading = (path) => ({ path, label: 'Überschrift', type: 'rich' });
const eyebrow = (path) => ({ path, label: 'Kennzeile', type: 'text', help: 'Kleine Zeile über der Überschrift.' });
const show = (path, what) => ({ path, label: `${what} anzeigen`, type: 'toggle' });

export const GROUPS = [
  {
    id: 'languages', title: 'Sprachen', section: '#start',
    fields: [
      { i18n: false, path: 'languages.en', label: 'Englische Version (/en/)', type: 'toggle', help: 'Baut zusätzlich eine englische Seite mit Umschalter DE/EN. Texte oben über „English“ übersetzen; was fehlt, bleibt deutsch.' },
    ],
  },
  {
    id: 'brand', title: 'Marke & Logo', section: '#start',
    fields: [
      { i18n: false, path: 'brand.name', label: 'Name der Kanzlei', type: 'text', help: 'Voller Name, z. B. für Seitentitel und Google.' },
      { i18n: false, path: 'brand.shortName', label: 'Kurzname', type: 'text', help: 'Preloader und Copyright.' },
      img('brand.logoMark', 'Bildmarke', 'SVG empfohlen: wird im Preloader Pfad für Pfad animiert. PNG geht auch.'),
      { path: 'brand.tintMark', label: 'Bildmarke in Akzentfarbe einfärben', type: 'toggle', help: 'Nur für einfarbige SVG-Marken. Aus = Originalfarben der Datei.' },
      { i18n: false, path: 'brand.wordmark', label: 'Wortmarke, Zeile 1', type: 'text', help: 'Schriftzug neben der Bildmarke. Leer = nur die Bildmarke.' },
      { i18n: false, path: 'brand.wordmarkSub', label: 'Wortmarke, Zeile 2', type: 'text', help: 'Leer lassen für einzeilig.' },
      { ...img('brand.logoImage', 'Komplettes Logo (optional)', 'Ersetzt Bildmarke und Wortmarke, wenn die Kanzlei ein fertiges Logo hat.'), optional: true },
      { ...img('brand.logoImageLight', 'Logo hell (optional)', 'Für dunkle Flächen (Footer, Preloader). Ohne wird das Logo weiß eingefärbt.'), optional: true },
      { i18n: false, path: 'brand.footerWord', label: 'Großes Wort im Footer', type: 'text' },
      { path: 'brand.description', label: 'Kurzbeschreibung', type: 'textarea', help: 'Footer. Platzhalter wie {city} sind erlaubt.' },
      { path: 'brand.founded', label: 'Gründungsjahr', type: 'number', min: 1900, max: 2100, help: 'Ergibt {years} (Jahre Erfahrung) und {founded}.' },
    ],
  },
  {
    id: 'theme', title: 'Farben, Schrift & Muster', section: '#termin',
    fields: [
      { path: 'theme.accent', label: 'Akzentfarbe', type: 'color', help: 'Buttons, Hervorhebungen, Muster. Dunklere Abstufungen werden berechnet.' },
      { path: 'theme.background', label: 'Heller Hintergrund', type: 'color', help: 'Hero und helle Sektionen.' },
      { path: 'theme.dark', label: 'Dunkle Flächen', type: 'color', help: 'Kanzlei, Team, Kontakt, Footer.' },
      { path: 'theme.light', label: 'Hell (Karten, Schrift auf dunkel)', type: 'color' },
      { path: 'theme.displayFont', label: 'Schrift für Überschriften', type: 'select', options: [
        { value: 'instrument-serif', label: 'Instrument Serif (mit Kursive)' },
        { value: 'gambarino', label: 'Gambarino' },
      ] },
      { path: 'theme.pattern.type', label: 'Muster (Kontakt-Sektion)', type: 'pattern' },
      { path: 'theme.pattern.color', label: 'Musterfarbe', type: 'color', optional: true, help: 'Leer = Akzentfarbe.' },
      { path: 'theme.pattern.intensity', label: 'Musterstärke', type: 'range', min: 0, max: 1.5, step: 0.05 },
    ],
  },
  {
    id: 'contact', title: 'Kontakt & Adresse', section: '#termin',
    fields: [
      { i18n: false, path: 'contact.legalName', label: 'Rechtlicher Name', type: 'text', help: 'Impressum und Google-Daten.' },
      { i18n: false, path: 'contact.phone', label: 'Telefon', type: 'text' },
      { i18n: false, path: 'contact.email', label: 'E-Mail', type: 'text' },
      { i18n: false, path: 'contact.street', label: 'Straße und Hausnummer', type: 'text' },
      { i18n: false, path: 'contact.postalCode', label: 'PLZ', type: 'text' },
      { i18n: false, path: 'contact.city', label: 'Ort', type: 'text', help: 'Steht über {city} in vielen Texten.' },
      { i18n: false, path: 'contact.region', label: 'Bundesland', type: 'text' },
      { i18n: false, path: 'contact.country', label: 'Land (Code)', type: 'text', help: 'DE, AT oder CH.' },
      { i18n: false, path: 'contact.areaServed', label: 'Einzugsgebiet', type: 'lines', help: 'Ein Ort pro Zeile. Nur, was die Texte auch bewerben.' },
    ],
  },
  {
    id: 'hours', title: 'Erreichbarkeit', section: '#start',
    fields: [
      { path: 'hours.days', label: 'Tage', type: 'days' },
      { path: 'hours.open', label: 'Von (Uhr)', type: 'number', min: 0, max: 23 },
      { path: 'hours.close', label: 'Bis (Uhr)', type: 'number', min: 1, max: 24 },
      { i18n: false, path: 'hours.timeZone', label: 'Zeitzone', type: 'text', help: 'Europe/Berlin, Europe/Vienna oder Europe/Zurich.' },
    ],
  },
  {
    id: 'social', title: 'Social Media', section: 'footer',
    fields: ['whatsapp', 'tiktok', 'facebook', 'instagram', 'linkedin'].map((k) => ({
      i18n: false, path: `social.${k}`, label: { whatsapp: 'WhatsApp', tiktok: 'TikTok', facebook: 'Facebook', instagram: 'Instagram', linkedin: 'LinkedIn' }[k], type: 'text', help: k === 'whatsapp' ? 'Link, z. B. https://wa.me/49…  Leer = ausgeblendet.' : 'Leer = ausgeblendet.',
    })),
  },
  {
    id: 'seo', title: 'Google & Teilen', section: '#start',
    fields: [
      { i18n: false, path: 'seo.url', label: 'Domain', type: 'text', help: 'Mit https://, ohne Schrägstrich am Ende.' },
      { path: 'seo.title', label: 'Seitentitel', type: 'text', help: 'Ca. 50–60 Zeichen. {city} und {name} sind erlaubt.' },
      { path: 'seo.description', label: 'Beschreibung', type: 'textarea', help: 'Ca. 140–160 Zeichen: Leistung, Detail, Vertrauenssignal.' },
      { i18n: false, path: 'seo.ogImage', label: 'Teilen-Bild (Pfad)', type: 'text', help: 'Bild in public/, z. B. /og-default.jpg (1200×630).' },
    ],
  },
  {
    id: 'nav', title: 'Navigation', section: '#start',
    fields: [
      { path: 'nav.start', label: 'Start', type: 'text' },
      { path: 'nav.kanzlei', label: 'Kanzlei', type: 'text' },
      { path: 'nav.leistungen', label: 'Leistungen', type: 'text' },
      { path: 'nav.team', label: 'Team', type: 'text' },
      { path: 'nav.aktuelles', label: 'Aktuelles', type: 'text' },
      { path: 'nav.cta', label: 'Button oben rechts', type: 'text' },
    ],
  },
  {
    id: 'hero', title: 'Hero', section: '#start',
    fields: [
      eyebrow('hero.eyebrow'),
      { path: 'hero.title', label: 'Überschrift (eine Zeile pro Zeile)', type: 'lines' },
      { path: 'hero.text', label: 'Text', type: 'textarea' },
      { path: 'hero.primaryCta', label: 'Button', type: 'text' },
      { path: 'hero.secondaryCta', label: 'Zweiter Button', type: 'text', help: 'Leer = ausgeblendet.' },
      { path: 'hero.note', label: 'Hinweis unter den Buttons', type: 'text', help: 'Leer = ausgeblendet.' },
      { path: 'hero.layout', label: 'Hero-Layout', type: 'select', options: [
        { value: 'cutout', label: 'Freigestellte Personen (PNG)' },
        { value: 'photo', label: 'Foto über die ganze Fläche' },
      ], help: 'Freigestellt braucht ein PNG ohne Hintergrund. Foto geht mit jedem normalen Bild (Büro, Team, Gebäude).' },
      img('hero.image', 'Hauptbild (freigestellt)', 'Freigestelltes PNG mit transparentem Hintergrund, Personen unten bündig.'),
      alt('hero.imageAlt'),
      { ...img('hero.photo', 'Hero-Foto', 'Querformat, mindestens 2000 px breit. Ruhige Fläche links, dort steht der Text.'), optional: true },
      alt('hero.photoAlt'),
      { i18n: false, path: 'hero.photoFocus', label: 'Bildausschnitt Hero-Foto', type: 'text', help: 'Horizontal und vertikal, z. B. 70% 40% (Personen rechts).' },
      { path: 'hero.availabilityLabel', label: 'Weiße Karte: Bezeichnung', type: 'text' },
      { path: 'hero.availabilityText', label: 'Weiße Karte: Text', type: 'text', help: '{open} und {close} = Öffnungszeiten.' },
      { path: 'hero.avatars', label: 'Weiße Karte: Gesichter', type: 'images' },
      { path: 'rating.show', label: 'Bewertung anzeigen', type: 'toggle' },
      { i18n: false, path: 'rating.score', label: 'Bewertung', type: 'text', help: 'z. B. 4,9' },
      { path: 'rating.count', label: 'Anzahl Bewertungen', type: 'number', min: 0 },
      { i18n: false, path: 'rating.source', label: 'Quelle', type: 'text', help: 'z. B. Google' },
      { path: 'hero.deadlineTitle', label: 'Akzent-Karte: Titel', type: 'text' },
      { path: 'hero.deadlineText', label: 'Akzent-Karte: Text', type: 'textarea' },
      img('hero.deadlineImage', 'Akzent-Karte: Bild'),
      alt('hero.deadlineImageAlt'),
      { path: 'hero.deadlineItem', label: 'Akzent-Karte: Vorgang', type: 'text', help: 'Davor steht der Monat, z. B. „UStVA Mai“.' },
      { path: 'hero.deadlineStart', label: 'Akzent-Karte: Startstatus', type: 'text' },
      { path: 'hero.deadlineSteps', label: 'Akzent-Karte: Schritte', type: 'lines', help: 'Eine pro Zeile, der letzte bekommt ✓.' },
    ],
  },
  {
    id: 'kanzlei', title: 'Die Kanzlei & Kennzahlen', section: '#kanzlei',
    fields: [
      eyebrow('kanzlei.eyebrow'),
      heading('kanzlei.heading'),
      { path: 'kanzlei.lead', label: 'Text', type: 'textarea' },
      { path: 'stats', label: 'Kennzahlen', type: 'list', fixed: true, itemLabel: 'value', fields: [
        { path: 'value', label: 'Wert', type: 'text', help: 'Zahl vorne, z. B. 400+ oder {years} Jahre.' },
        { path: 'label', label: 'Beschreibung', type: 'text' },
      ] },
      { path: 'kanzlei.cards', label: 'Karten', type: 'list', fixed: true, itemLabel: 'title', fields: [
        { path: 'title', label: 'Titel', type: 'text' },
        { path: 'text', label: 'Text', type: 'textarea' },
      ] },
      img('kanzlei.image', 'Bild zwischen den Karten'),
      alt('kanzlei.imageAlt'),
    ],
  },
  {
    id: 'leistungen', title: 'Leistungen', section: '#leistungen',
    fields: [
      eyebrow('leistungen.eyebrow'),
      heading('leistungen.heading'),
      { path: 'leistungen.lead', label: 'Text', type: 'textarea' },
      { path: 'leistungen.scopeLabel', label: 'Bezeichnung der Punkte', type: 'text' },
      { path: 'leistungen.cta', label: 'Button in der Leistung', type: 'text' },
      { path: 'leistungen.items', label: 'Leistungen', type: 'list', itemLabel: 'title', min: 1, fields: [
        { path: 'title', label: 'Titel', type: 'text' },
        { path: 'text', label: 'Text', type: 'textarea' },
        { path: 'points', label: 'Leistungsumfang', type: 'lines', help: 'Ein Punkt pro Zeile.' },
        img('image', 'Bild'),
        alt('alt'),
      ] },
    ],
  },
  {
    id: 'ansatz', title: 'Unser Ansatz', section: '[data-ansatz]',
    fields: [
      show('ansatz.show', 'Abschnitt'),
      eyebrow('ansatz.eyebrow'),
      heading('ansatz.heading'),
      { path: 'ansatz.lead', label: 'Text', type: 'textarea' },
      { path: 'ansatz.signalsLabel', label: 'Über der Liste', type: 'text' },
      { path: 'ansatz.signals', label: 'Signale', type: 'list', itemLabel: 'label', fields: [
        { path: 'label', label: 'Bezeichnung', type: 'text' },
        { path: 'bars', label: 'Balken (0–100)', type: 'numbers', help: 'Fünf Werte, z. B. 92, 80, 68, 54, 38. Der letzte ist farbig.' },
      ] },
      { path: 'ansatz.foot', label: 'Unter der Liste', type: 'text' },
      { path: 'ansatz.cta', label: 'Button', type: 'text' },
      img('ansatz.image', 'Bild'),
      alt('ansatz.imageAlt'),
      { path: 'ansatz.noteValue', label: 'Notiz 1: Wert', type: 'text' },
      { path: 'ansatz.noteText', label: 'Notiz 1: Text', type: 'text' },
      { path: 'ansatz.noteTag', label: 'Notiz 2: Kennzeile', type: 'text' },
      { path: 'ansatz.noteAction', label: 'Notiz 2: Text', type: 'text' },
    ],
  },
  {
    id: 'warum', title: 'Warum wir', section: '[data-warum]',
    fields: [
      show('warum.show', 'Abschnitt'),
      eyebrow('warum.eyebrow'),
      heading('warum.heading'),
      { path: 'warum.detailLabel', label: 'Bezeichnung der Details', type: 'text' },
      { path: 'warum.items', label: 'Gründe', type: 'list', itemLabel: 'title', min: 1, fields: [
        { path: 'title', label: 'Titel', type: 'text' },
        { path: 'text', label: 'Text', type: 'textarea' },
        { path: 'detail', label: 'Detail', type: 'textarea' },
        img('image', 'Bild'),
        alt('alt'),
      ] },
    ],
  },
  {
    id: 'team', title: 'Team', section: '#team',
    fields: [
      show('team.show', 'Team'),
      eyebrow('team.eyebrow'),
      heading('team.heading'),
      { path: 'team.button', label: 'Button', type: 'text' },
      { path: 'team.grayscale', label: 'Fotos schwarz-weiß', type: 'toggle', help: 'Gleicht unterschiedliche Fotos an; Farbe erscheint beim Darüberfahren.' },
      { path: 'team.members', label: 'Personen', type: 'list', itemLabel: 'name', min: 1, fields: [
        { i18n: false, path: 'name', label: 'Name', type: 'text' },
        { path: 'role', label: 'Rolle', type: 'text' },
        img('image', 'Porträt', 'Hochformat (etwa 4:5), Gesicht im oberen Drittel.'),
        { i18n: false, path: 'focus', label: 'Bildausschnitt', type: 'text', help: 'Horizontal und vertikal, z. B. 50% 20% (Gesicht oben).' },
        { i18n: false, path: 'linkedin', label: 'LinkedIn', type: 'text', help: 'Leer = kein Icon.' },
      ] },
    ],
  },
  {
    id: 'testimonials', title: 'Mandantenstimmen', section: '[data-testimonials]',
    fields: [
      show('testimonials.show', 'Stimmen'),
      eyebrow('testimonials.eyebrow'),
      heading('testimonials.heading'),
      { path: 'testimonials.lead', label: 'Text', type: 'textarea' },
      { path: 'testimonials.items', label: 'Stimmen', type: 'list', itemLabel: 'name', min: 1, fields: [
        { path: 'quote', label: 'Zitat', type: 'textarea' },
        { i18n: false, path: 'name', label: 'Name', type: 'text' },
        { path: 'role', label: 'Funktion, Firma', type: 'text' },
      ] },
    ],
  },
  {
    id: 'faq', title: 'Häufige Fragen', section: '[data-faq]',
    fields: [
      show('faq.show', 'Abschnitt'),
      eyebrow('faq.eyebrow'),
      heading('faq.heading'),
      { path: 'faq.contactPerson', label: 'Ansprechpartner auf der Karte', type: 'person' },
      { path: 'faq.contactTitle', label: 'Karte: Titel', type: 'text' },
      { path: 'faq.contactText', label: 'Karte: Text', type: 'textarea' },
      { path: 'faq.contactCta', label: 'Karte: Button', type: 'text' },
      { path: 'faq.items', label: 'Fragen', type: 'list', itemLabel: 'q', min: 1, fields: [
        { path: 'q', label: 'Frage', type: 'text' },
        { path: 'a', label: 'Antwort', type: 'textarea' },
      ] },
    ],
  },
  {
    id: 'news', title: 'Aktuelles', section: '#aktuelles',
    fields: [
      show('news.show', 'Abschnitt'),
      eyebrow('news.eyebrow'),
      heading('news.heading'),
      { path: 'news.lead', label: 'Text', type: 'textarea' },
      { path: 'news.items', label: 'Beiträge', type: 'list', itemLabel: 'title', max: 2, min: 1, fields: [
        { path: 'title', label: 'Titel', type: 'text' },
        { path: 'text', label: 'Text', type: 'textarea' },
        img('image', 'Bild'),
        alt('alt'),
        { i18n: false, path: 'href', label: 'Link', type: 'text', help: 'Leer = Karte ohne Link.' },
      ] },
    ],
  },
  {
    id: 'cta', title: 'Kontakt-Abschnitt', section: '#termin',
    fields: [
      heading('cta.heading'),
      { path: 'cta.text', label: 'Text', type: 'textarea' },
      { path: 'cta.button', label: 'Button', type: 'text' },
      { path: 'cta.facts', label: 'Punkte unter den Buttons', type: 'lines', help: 'Einer pro Zeile. {days}, {open}, {close} sind erlaubt.' },
      { path: 'cta.mailSubject', label: 'E-Mail: Betreff', type: 'text' },
      { path: 'cta.mailBody', label: 'E-Mail: Vorlage', type: 'textarea', rows: 8 },
      img('cta.handGiving', 'Hand links'),
      img('cta.handReceiving', 'Hand rechts'),
    ],
  },
  {
    id: 'footer', title: 'Footer', section: 'footer',
    fields: [
      { i18n: false, path: 'footer.credit', label: 'Zeile unten rechts', type: 'text', help: 'Leer = ausgeblendet.' },
    ],
  },
];

/** Platzhalter, die in Texten erlaubt sind (siehe src/config/firm.ts). */
export const PLACEHOLDERS = ['{name}', '{shortName}', '{city}', '{phone}', '{email}', '{founded}', '{years}', '{open}', '{close}', '{days}'];
