# CLAUDE.md

Regelwerk für dieses Astro-Projekt. Kurz halten. Dieses File ist der Index,
nicht die Ablage. Details liegen in den verlinkten Files.

@SEO.md
@FORMS.md

---

## Oberste Regel

**Jede Tatsache hat genau eine Quelle. Alles andere referenziert sie.**

Kontaktdaten, Slugs, Seitenliste, Fahrzeuge, Preise, Öffnungszeiten – jeweils
an genau einer Stelle im Code. Nie duplizieren, nie in eine `.md` kopieren.
Wer eine Zahl an zwei Orten pflegt, hat einen Bug gebaut, der beim ersten
Ändern zuschlägt.

Konkret verboten:
- Kontaktdaten (Telefon/E-Mail/Adresse) als Literal in mehreren Dateien →
  eine zentrale NAP-Konstante, überall referenziert (auch im Schema).
- Zweite Quelle für einen Slug (z. B. Navigations-Array *und* Datendatei) →
  ein Slug, eine Quelle.
- Volatile Fakten (Seitenliste, Fahrzeuge, konkrete Keywords) in dieser oder
  einer anderen `.md`. Die leben im Code. Diese `.md` nennt nur Prinzipien.

---

## Non-Negotiables (Launch-Gate, keine Empfehlung)

Vor jedem Live-Gang einer Seite erfüllt:

- [ ] hreflang `de` / `en` / `x-default` gesetzt, sobald ein EN-Pendant
      existiert (reine DE-Seite bekommt keins)
- [ ] Canonical korrekt
- [ ] Korrektes Schema.org für den Seitentyp (siehe SEO.md)
- [ ] OG- und Twitter-Meta vorhanden (auch auf der Startseite)
- [ ] Interne Verlinkung: keine Waisenseite, beschreibende Ankertexte
- [ ] `npm run build` läuft grün durch (inkl. `seo-check.mjs`)
- [ ] Keine Platzhalter (`[BITTE ERGÄNZEN]`, Entwurfs-Rechtstexte) auf
      indexierbaren Seiten
- [ ] HTTPS + HSTS aktiv

---

## Stack (nicht verhandelbar)

- **Astro**, `output: 'static'`. Kein SSR-Adapter, außer explizit anders
  entschieden.
- **Tailwind 4** CSS-first über `@theme` in `src/styles/global.css`. Keine
  `tailwind.config.*`.
- **Fonts self-hosted** über `@fontsource*`. Niemals Google Fonts CDN oder
  FontAwesome CDN (GDPR).
- **Bilder** über `astro:assets` (`<Image>` / `getImage`). Keine rohen
  `<img>`-Tags für Inhaltsbilder → srcset/Optimierung kommt automatisch.
- **Formulare**: Cloudflare Pages Functions + Resend + Turnstile. Siehe
  FORMS.md.
- **Deploy**: Cloudflare Pages. `public/_headers` für Cache-Regeln.

---

## Secrets

- Niemals Keys/Tokens im Client-Code als String-Literal. Auch keine
  „öffentlichen" API-Keys (Maps o. Ä.) hartkodiert → Env-Variable.
- `re_…`, Turnstile-Secrets, Resend-Keys: nur in Cloudflare-Env, nie im Repo.
  `grep -rn "re_[A-Za-z0-9]" src/ functions/` muss leer sein.
- `.env.example` dokumentiert alle erwarteten Variablen (nur Namen).

---

## Env & Config

- Env-Variablen typisiert in `src/env.d.ts`.
- `PUBLIC_*` = Build-time (ins HTML inlined), alles andere = Runtime (Function).
- Keine Config nur im Cloudflare-Dashboard, die nicht auch als `.env.example`
  oder `_headers`/`_redirects` im Repo nachvollziehbar ist.

---

## Arbeitsweise

- Eine neue Seite entsteht immer über die zentrale Routen-Registry
  (siehe SEO.md). DE ist Pflicht, EN optional (Deutsch zuerst, Übersetzung
  später); EN wird nie erzwungen.
- Interne Links nur über `localizedPath(key, locale)`, nie roh.
- Vor jedem Commit: `astro check` läuft, keine Secrets im Diff.
- Im Zweifel: nachfragen statt raten. Lieber eine Rückfrage als eine
  stille Architekturentscheidung.
