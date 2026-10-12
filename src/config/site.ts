// Zentrale Site- und Kontaktdaten. EINZIGE Quelle. Nie in eine .md kopieren,
// nie in mehreren Dateien wiederholen. Pro Projekt die TODO-Werte ersetzen.

export const site = {
  name: 'Hartmann & Vogt Steuerberatung',
  // Schema.org-Typ: Steuerkanzlei = AccountingService (Untertyp von LocalBusiness).
  businessType: 'AccountingService',
  tagline: 'Steuerberatung für Mittelstand, Gründer und Selbstständige in Düsseldorf. Digital, persönlich, zum festen Monatshonorar.',
  url: 'https://example.com',        // echte Domain pro Projekt
  defaultLocale: 'de' as const,
  locales: ['de', 'en'] as const,
  ogImage: '/og-default.jpg',        // Default-OG-Bild, pro Projekt ersetzen
};

// NAP = Name, Address, Phone. Einzige Quelle fuer Kontaktdaten.
// Wird auch vom LocalBusiness-Schema referenziert, nicht dort dupliziert.
export const nap = {
  legalName: 'TODO Hartmann & Vogt Steuerberatungsgesellschaft',
  phone: '+49 000 0000000',
  email: 'office@example.com',
  street: 'TODO Strasse 1',
  postalCode: '00000',
  city: 'Düsseldorf',
  region: 'Nordrhein-Westfalen',
  country: 'DE',
  // Gebiet, das der Dienstleister bedient. Schema-Reichweite <= Content-Reichweite:
  // nur eintragen, was in den Texten auch wirklich beworben wird.
  areaServed: [
    { type: 'City', name: 'Düsseldorf' },
    // { type: 'Country', name: 'Deutschland' },
  ],
};

// Social-Profile (Footer). TODO: echte URLs vom Mandanten; '#' = noch offen.
export const social = [
  { key: 'whatsapp', label: 'WhatsApp', href: '#' },
  { key: 'tiktok', label: 'TikTok', href: '#' },
  { key: 'facebook', label: 'Facebook', href: '#' },
  { key: 'instagram', label: 'Instagram', href: '#' },
  { key: 'linkedin', label: 'LinkedIn', href: '#' },
] as const;

export type Locale = (typeof site.locales)[number];
