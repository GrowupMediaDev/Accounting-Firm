---
name: new-firm-site
description: Build a complete outreach website for a tax/accounting firm (Steuerkanzlei) from this template. Use when someone gives a firm name, a current website URL or a brief and wants "their" version of the site. Covers research, firm profile, copy, logo, colours, images, English, checks and build.
argument-hint: <firm name and/or current website URL, plus any wishes>
---

# New firm site

You turn this template into a finished site for one accounting firm. Everything firm-specific lives in **one profile folder**: `src/firms/<slug>/firm.json` (+ `firm.en.json`, `images/`). You almost never touch components. If you think you need to, read `reference/architecture.md` first and keep the change generic, so every firm benefits.

Read these before you start, they are short and they are the rules:
- `reference/architecture.md`: how data flows, every profile field, scripts, configurator.
- `reference/design-system.md`: colours (and how they are derived), type, layout, components.
- `reference/motion.md`: preloader, logo, hero entrance, shader, scroll reveals. What is automatic, what depends on the profile.
- `reference/content-and-images.md`: copy rules for German accounting firms, image style and prompts.

## Purpose (why this exists)

GrowUp rebuilds a prospect firm's website with this template as a **free, value-first outreach pitch**. The result must look like *their* site on day one: their name, logo, colours, people, services, city. It must also be credible: realistic claims, correct German, nothing a tax advisor would find embarrassing.

## Workflow

### 1. Intake
Collect, from the brief and (if given) the firm's current website, using WebFetch on the homepage plus the Impressum, team, services and contact pages:
- legal name, short name, founding year, city, address, phone, email, opening hours
- services and focus groups (e.g. Heilberufe, Gründer, Mittelstand), industries
- team: names, roles (Steuerberater/in, Partner/in, Steuerfachangestellte …), photos if published
- logo (SVG preferred; else the largest PNG), brand colours (from logo/CSS)
- real testimonials and Google rating, **only if you can verify them**. Otherwise remove the rating (`rating.show: false`) and mark testimonials as placeholders in your report.
- languages: English only if the firm serves international clients or the brief asks for it

Write down what you could not find. Never invent legal facts (names, addresses, registration, ratings).

### 2. Create the profile
```bash
npm run new-firm -- <slug> "<Firm name>" --activate     # firm.json from hartmann-vogt, English off; stock images are inherited
```
`<slug>`: short, lowercase, hyphens (`mueller-partner`). It becomes the folder and the build target.

### 3. Fill `firm.json`
Edit `src/firms/<slug>/firm.json` directly (or via the configurator at `/configurator` while `npm run dev` runs, which writes the same file). Go group by group in this order: `brand` → `theme` → `contact`/`hours`/`social` → `seo` → `nav` → `hero` → `stats` → `kanzlei` → `leistungen` → `ansatz` → `warum` → `team` → `testimonials` → `faq` → `news` → `cta` → `footer`.
- Field meanings and constraints: `reference/architecture.md` (profile fields table).
- Copy rules: `reference/content-and-images.md`. **Rewrite the template copy for this firm**: its focus, its city, its people. Don't just swap names.
- Use placeholders instead of repeating facts: `{city}`, `{name}`, `{years}`, `{founded}`, `{open}`, `{close}`, `{days}`, `{phone}`, `{email}`.
- Accent word in headings: `*Wort*` (one per heading, short).
- Hide sections that would be empty or fake (`ansatz.show`, `warum.show`, `team.show`, `testimonials.show`, `faq.show`, `news.show`).

### 4. Brand: logo and colours
- Logo: put the file in `images/`, then set `brand.logoMark` (icon only) plus `wordmark`/`wordmarkSub`, **or** `brand.logoImage` (complete logo, optional `logoImageLight` for dark backgrounds). Empty wordmark = icon only. Details and the SVG requirements for the animated preloader: `reference/motion.md` → "Logo".
- Colours: set only the four base colours (`theme.accent`, `background`, `dark`, `light`). Everything else is derived. Pick them from the firm's brand, then follow `reference/design-system.md` → "Choosing a palette" (contrast!).
- Pattern and font: `theme.pattern.type` (`zigzag | diagonal | dots | grid | waves | none`), `theme.displayFont` (`instrument-serif | gambarino`).

### 5. Images
Use the firm's own photos where they exist and are good enough (team portraits, office, building). Otherwise keep or generate stock that matches the style. Rules, sizes and the Flow workflow: `reference/content-and-images.md`. Choose `hero.layout`: `cutout` needs a transparent PNG of people; `photo` takes any landscape photo (office, team, building).

### 6. English (optional)
Set `languages.en: true`, then create `firm.en.json` with **only the translated texts** in the same structure; lists are matched by position. Untranslated fields fall back to German. See `reference/architecture.md` → "English".

### 7. Check, then build
```bash
npm run check-firm -- <slug>          # must exit 0 (no ✗). Fix every ⚠ you can.
npx astro check                       # 0 errors
FIRM=<slug> npm run build             # seo-check + static build into dist/
```
Then look at it: `npm run dev` (the profile is active) at 1440, 768 and 390 px wide, with the preloader forced via `/?intro`. Verify: the hero headline fits at 360 px, no horizontal scroll, the logo doesn't collide with the header buttons, headings break sensibly, every image matches its section.

### 8. Report
Tell the user, in plain words: what you built, what came from their site vs. what is placeholder, every remaining ⚠ from `check-firm`, and what needs the firm's input (legal texts, real testimonials, photos). Do **not** commit or deploy unless asked.

## Hard rules
- One source of truth: firm facts only in `firm.json`; never hard-code a firm detail in a component.
- No unrealistic claims (guaranteed savings, "24 h response", fixed prices). Fees: StBVV or agreed flat fee (Pauschale), stated in writing.
- No em dash (—) in copy; the German en dash (–) is fine. Correct German capitalisation; headings are not Title Case.
- Placeholder legal pages (Impressum, Datenschutz) stay noindex until the firm supplies texts.
- Don't change the template for one firm. If something must change, make it a profile option and update the configurator schema (`integrations/configurator/ui/schema.js` + English label in `i18n.js`) and the reference docs.
