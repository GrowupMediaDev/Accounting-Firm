# Astro-Starter (GrowUp Media)

Kopierbarer Ausgangspunkt fuer neue Chauffeur-/Dienstleister-Websites: Astro
statisch, DE/EN, Cloudflare Pages. Der Starter bringt SEO-Mechanik, Sitemap,
Schema, robots und den Formular-Standard vorkonfiguriert mit. Er gibt **kein
Design und keine Seitenliste** vor, das ist pro Projekt.

## Leitprinzip

Jede Tatsache hat genau eine Quelle. Was im Code lebt (Seiten, Slugs, Fahrzeuge,
Kontaktdaten), steht nie in einer `.md`. Die `.md`-Files enthalten nur stabile
Prinzipien, Abweichungen faengt `scripts/seo-check.mjs`.

## Struktur

```
CLAUDE.md            Index + Non-Negotiables + Stack. Zieht SEO.md & FORMS.md ein.
SEO.md               SEO-Architektur (Prinzipien, keine Daten).
SEO-REVIEW.md        Qualitativer Onpage-Review, auf Abruf.
FORMS.md             Formular-/Backend-Standard.
.env.example         Erwartete Env-Variablen (nur Namen).
scripts/
  seo-check.mjs      Mechanischer Check, laeuft beim Produktions-Build.
public/
  sitemap.xsl        Tabellen-Ansicht der Sitemap (rein optisch).
  _headers           Cache-Regeln + Content-Type fuer sitemap.xsl.
src/
  config/site.ts     Site-Config + NAP (einzige Quelle fuer Kontaktdaten).
  config/routes.ts   Routen-Registry: Seiten, Slugs, DE/EN, indexable, Schema.
  layouts/Layout.astro   Kopf-Plumbing: Canonical, hreflang, OG, Twitter.
  components/Schema.astro JSON-LD pro Seitentyp, LocalBusiness mit fester @id.
  pages/sitemap.xml.ts    Sitemap aus dem indexable-Flag, mit Stylesheet-Zeile.
  pages/robots.txt.ts     robots.txt, verweist auf die Sitemap.
  styles/global.css       Tailwind 4 CSS-first, Design-Tokens pro Projekt.
```

## Neues Projekt aufsetzen

1. Ordner kopieren, in ein neues Repo legen.
2. `src/config/site.ts` ausfuellen (Name, Domain, NAP).
3. Seiten in `src/config/routes.ts` eintragen. DE ist Pflicht, EN optional.
4. Design-Tokens in `src/styles/global.css` setzen.
5. Env-Variablen (siehe `.env.example`) in Cloudflare hinterlegen.

## Commands

```
npm install
npm run dev      # lokal, ohne seo-check und ohne Functions
npm run build    # Produktions-Build MIT seo-check
```

Empfohlener Build-Eintrag in `package.json`:

```json
"scripts": {
  "dev": "astro dev",
  "build": "node scripts/seo-check.mjs && astro build",
  "preview": "astro preview"
}
```

Der Check faengt vor dem Build. Bewusst ueberschreiben:
`SEO_CHECK=warn npm run build`.

## Sprachen

Deutsch zuerst. Eine reine DE-Seite ist erlaubt und bricht den Build nicht.
Sobald ein EN-Slug in der Registry steht, kommen hreflang und der EN-Sitemap-
Eintrag automatisch dazu.

## Deploy

Cloudflare Pages. `public/_headers` steuert Cache und den Content-Type der
`sitemap.xsl`. Formular-Functions laufen nur auf der deployten Site, nicht im
lokalen Dev (siehe FORMS.md).
