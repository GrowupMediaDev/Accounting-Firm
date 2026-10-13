// Site- und Kontaktdaten, abgeleitet aus dem aktiven Kanzlei-Profil (config/firm.ts).
// Hier steht KEIN Literal einer Kanzlei: Werte werden im Konfigurator gepflegt.

import { firm, fill } from './firm';

export const site = {
  name: firm.brand.name,
  shortName: firm.brand.shortName,
  // Schema.org-Typ: Steuerkanzlei = AccountingService (Untertyp von LocalBusiness).
  businessType: firm.brand.businessType,
  tagline: fill(firm.brand.description),
  // Gruendungsjahr: Quelle fuer "Jahre Erfahrung" und "Seit …".
  founded: firm.brand.founded,
  url: firm.seo.url,
  defaultLocale: 'de' as const,
  locales: ['de', 'en'] as const,
  ogImage: firm.seo.ogImage,
};

// NAP = Name, Address, Phone. Wird auch vom LocalBusiness-Schema referenziert.
// Schema-Reichweite <= Content-Reichweite: areaServed nur, was die Texte bewerben.
export const nap = {
  ...firm.contact,
  areaServed: firm.contact.areaServed.map((name) => ({ type: 'City', name })),
};

// Erreichbarkeit (Live-Status im Hero). Wochentage nach JS-Zaehlung (1 = Montag),
// Zeiten in der Zeitzone der Kanzlei.
export const hours = firm.hours;

// Social-Profile (Footer). Leere Eintraege werden nicht angezeigt.
const socialLabels = { whatsapp: 'WhatsApp', tiktok: 'TikTok', facebook: 'Facebook', instagram: 'Instagram', linkedin: 'LinkedIn' } as const;
export const social = (Object.keys(socialLabels) as (keyof typeof socialLabels)[])
  .filter((key) => firm.social[key])
  .map((key) => ({ key, label: socialLabels[key], href: firm.social[key] }));

/** tel:-Link aus der Telefonnummer. */
export const telHref = `tel:${firm.contact.phone.replace(/[^+\d]/g, '')}`;

export type Locale = (typeof site.locales)[number];
