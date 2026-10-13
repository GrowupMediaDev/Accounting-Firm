# Architecture

Astro 7 (static output) + Tailwind 4 (CSS-first `@theme`) + GSAP 3 (ScrollTrigger, SplitText) + Lenis smooth scroll. One page (`/`) plus optional `/en/`, Impressum, Datenschutz, a noindex styleguide.

## Data flow

```
src/firms/active.json ──► which profile the dev server shows (configurator switches it)
FIRM=<slug> (env)     ──► which profile a build uses (overrides active.json)
                            │
src/firms/<slug>/firm.json ─┤  (German, complete)
src/firms/<slug>/firm.en.json  (optional, only translated texts)
src/firms/<slug>/images/*      (all images of this firm)
                            ▼
src/config/firm.ts   firm (DE), firmFor(locale), img(name), logoMark(), fill(), rich(), hasEnglish
   ├─ src/config/theme.ts    4 base colours → full palette → CSS vars injected in <head>
   ├─ src/config/pattern.ts  pattern type/colour/strength → shader data attrs + SVG fallback
   │     └─ src/config/pattern-tiles.ts (shapes, shared with the configurator)
   ├─ src/config/site.ts     site / nap / hours / social / telHref (derived, no literals)
   ├─ src/config/nav.ts      navFor(locale), primaryCtaFor(locale), SECTION ids
   └─ src/config/routes.ts   route registry (adds /en/ only if languages.en)
src/i18n/ui.ts       built-in UI strings (aria labels, live status, weekdays, months) DE + EN
src/i18n/index.ts    useI18n(Astro.url) → { locale, f, fill, rich, t, ui }
src/components/pages/HomePage.astro   assembles sections (shared by / and /[lang]/)
src/components/sections/*.astro       one file per section, read only from the profile
```

- `firm.ts` deep-merges the active profile over the reference profile `hartmann-vogt`, so older profiles keep working when fields are added.
- `img('file.jpg')` resolves `src/firms/<slug>/images/file.jpg` and, if the firm doesn't have that file, the reference profile's file of the same name. **A firm folder only holds its own images** (logo, their photos); all stock images are inherited from `hartmann-vogt`. `new-firm`, the configurator's duplicate, the image picker and `check-firm` all follow this rule. To replace a stock image for one firm, put a file with a new name into its `images/` and reference it. Never overwrite a reference image for one firm. Images are optimised by `astro:assets` (`<Img>` wrapper in `src/components/ui/Img.astro` builds srcset/sizes).
- `fill(text)` replaces `{name} {shortName} {city} {phone} {email} {founded} {years} {open} {close} {days}`. `rich(text)` also escapes HTML and turns `*Wort*` into `<em>` (rendered with `set:html`).
- Components never contain firm literals. Every visible text comes from the profile (`f`) or `src/i18n/ui.ts` (`t`).

## Profile fields (`firm.json`)

| Group | Fields | Notes |
|---|---|---|
| `brand` | `name`, `shortName`, `logoMark`, `tintMark`, `logoImage`, `logoImageLight`, `wordmark`, `wordmarkSub`, `footerWord`, `description`, `founded`, `businessType` | `logoMark` SVG with `<path>`s animates in the preloader; `tintMark` recolours a single-colour SVG with the accent. `logoImage` replaces mark+wordmark. Empty `wordmark` = icon only. `footerWord` = giant word in the footer (auto-sized by length). `businessType` = schema.org type (`AccountingService`). |
| `theme` | `accent`, `background`, `dark`, `light`, `displayFont`, `pattern.{type,color,intensity}` | See design-system.md. |
| `languages` | `en` | Builds `/en/` + DE/EN switch in the header. |
| `seo` | `url`, `title`, `description`, `ogImage` | Title ≤ 60 chars, description 120–160 (filled). `url` also sets Astro `site`. |
| `contact` | `legalName`, `phone`, `email`, `street`, `postalCode`, `city`, `region`, `country`, `areaServed[]` | Feeds the footer, contact section, LocalBusiness schema. `areaServed` only what the copy promotes. |
| `hours` | `days[]` (JS weekday, 1 = Mon), `open`, `close`, `timeZone` | Drives "Montag–Freitag", the live "Jetzt erreichbar" status and `{open}/{close}/{days}`. |
| `social` | `whatsapp`, `tiktok`, `facebook`, `instagram`, `linkedin` | Empty = hidden. |
| `rating` | `show`, `score`, `count`, `source` | Only real, verifiable ratings. |
| `stats[4]` | `value`, `label` | Odometer figures in "Die Kanzlei". Value must start with digits (`400+`, `{years} Jahre`). Exactly 4. |
| `nav` | `start`, `kanzlei`, `leistungen`, `team`, `aktuelles`, `cta` | Hidden sections drop out of the nav automatically. |
| `hero` | `layout` (`cutout`/`photo`), `eyebrow`, `title[]` (one entry per line), `text`, `primaryCta`, `secondaryCta`, `note`, `image`, `imageAlt`, `photo`, `photoAlt`, `photoFocus`, `availabilityLabel`, `availabilityText`, `avatars[]`, `deadlineTitle`, `deadlineText`, `deadlineImage`, `deadlineImageAlt`, `deadlineItem`, `deadlineStart`, `deadlineSteps[]` | Title lines never wrap: keep each ≤ ~13 chars. `photoFocus` = CSS object-position. |
| `kanzlei` | `eyebrow`, `heading`, `lead`, `cards[2]` (`title`,`text`), `image`, `imageAlt` | Exactly 2 cards (layout: card, image, card). |
| `leistungen` | `eyebrow`, `heading`, `lead`, `scopeLabel`, `cta`, `items[]` (`title`,`text`,`points[]`,`image`,`alt`) | 4–6 items read best. |
| `ansatz` | `show`, `eyebrow`, `heading`, `lead`, `signalsLabel`, `signals[]` (`label`, `bars[5]` 0–100), `foot`, `cta`, `image`, `imageAlt`, `noteValue`, `noteText`, `noteTag`, `noteAction` | Last bar is accent-coloured. |
| `warum` | `show`, `eyebrow`, `heading`, `detailLabel`, `items[]` (`title`,`text`,`detail`,`image`,`alt`) | 3–5 items (pinned scroll stage on desktop). |
| `team` | `show`, `eyebrow`, `heading`, `button`, `grayscale`, `members[]` (`name`,`role`,`image`,`focus`,`linkedin`) | 3 members fit the staggered grid best. |
| `testimonials` | `show`, `eyebrow`, `heading`, `lead`, `items[]` (`quote`,`name`,`role`) | Autoplay carousel. |
| `faq` | `show`, `eyebrow`, `heading`, `contactPerson` (a team name), `contactTitle`, `contactText`, `contactCta`, `items[]` (`q`,`a`) | Also emitted as FAQPage schema. |
| `news` | `show`, `eyebrow`, `heading`, `lead`, `items[≤2]` (`title`,`text`,`image`,`alt`,`href`) | Empty `href` = no link, no arrow. |
| `cta` | `heading`, `text`, `button`, `facts[]`, `mailSubject`, `mailBody`, `handGiving`, `handReceiving` | The contact section; button = pre-filled mailto, second button = phone. |
| `footer` | `credit` | Empty = hidden. |

## English

- `languages.en: true` → `src/pages/[lang]/index.astro` builds `/en/` (via `getStaticPaths`), the route registry gets the EN slug, hreflang + sitemap entries appear, the header shows DE/EN.
- `firm.en.json` mirrors `firm.json` but contains **only texts**. Arrays of objects are matched by index (`leistungen.items[2].title` translates the third service). Text arrays (`hero.title`, `points`) replace the German array when non-empty. Empty strings fall back to German.
- Don't translate names, contact data, URLs, the wordmark or the logo text. The configurator marks those fields `i18n: false`.
- Built-in UI strings (weekdays, live status, aria labels, footer headings) are in `src/i18n/ui.ts` and are already bilingual.

## Configurator (dev only)

`npm run dev`, then `http://localhost:4321/configurator` (Astro's default port; use the port the dev server prints). An Astro integration (`integrations/configurator/index.mjs`) adds Vite middleware: the UI (`ui/index.html`, `app.js`, `app.css`) plus an API under `/__cfg/*` (state, firm read/write incl. `?lang=en`, duplicate, activate, images list, upload, pattern tiles). It writes the same files you would edit by hand; the preview iframe reloads via Vite on save. Nothing of it reaches the build.

- `ui/schema.js` describes every editable field (types: text, textarea, rich, number, range, color, select, toggle, image, images, lines, numbers, days, person, pattern, list).
- `ui/i18n.js` translates the German labels to English (the UI is English-only).
- `ui/checks.js` holds the profile checks, shared with `scripts/check-firm.mjs`.
- Changes to `integrations/configurator/index.mjs` need a dev-server restart. UI files are served fresh on each request.

## Scripts

| Command | What it does |
|---|---|
| `npm run new-firm -- <slug> "<Name>" [--from <slug>] [--activate]` | New profile from another profile's `firm.json` (English off). Images are inherited, not copied. |
| `npm run check-firm -- [slug] [--json]` | Placeholders, SEO lengths, contrast, alt texts, FAQ contact, hero line length, long accent words, missing images, image sizes, cut-out transparency, animatable SVG, untranslated EN. Exit 1 on errors. |
| `FIRM=<slug> npm run build` | `scripts/seo-check.mjs` (em dash, placeholders, secrets; also scans the profile JSON) and the static build into `dist/`. |
| `npx astro check` | Types (must be 0 errors). |

## Adding a new profile option (template change)

1. Add the field with a sensible default to `src/firms/hartmann-vogt/firm.json` (the reference profile; other profiles inherit it through the merge).
2. Read it in the component through `useI18n(Astro.url).f` (or `firm` from `config/firm.ts` for non-text settings).
3. Add it to `integrations/configurator/ui/schema.js` (`i18n: false` if it is not translatable) and its English label/help to `ui/i18n.js`.
4. If it can be wrong in a checkable way, add a rule to `ui/checks.js`.
5. Update these reference docs.
