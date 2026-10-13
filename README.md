# Accounting Firm website template (GrowUp outreach)

A premium one-page website for German tax and accounting firms (Steuerkanzleien), built so we can produce a **finished site for a prospect firm in hours**: their name, logo, colours, people, services and city, as a free, value-first outreach pitch.

Everything that differs between firms lives in **one profile folder per firm** (`src/firms/<slug>/`). The code is shared. You can fill a profile by hand in the **configurator** or let an **AI agent** do it from a short brief.

> **AI agents:** start with [`AGENTS.md`](AGENTS.md).

---

## Quick start

Requirements: Node.js ≥ 22.12, npm. Optional: Claude Code (for the agent workflow), Chrome with the Claude extension and a Google account with Flow (for generating images).

```bash
git clone https://github.com/GrowupMediaDev/Accounting-Firm.git
cd Accounting-Firm
npm install
npm run dev
```

- Site: <http://localhost:4321/> (English version at `/en/` if the firm has it on). Add `?intro` to replay the preloader.
- Configurator: <http://localhost:4321/configurator> (dev only, never part of a build).

The dev server shows the firm set in `src/firms/active.json`. Switch firms in the configurator's firm menu.

## Build a site for a new firm

### Option A: let an AI agent do it (recommended)
In Claude Code, inside this folder:
```
/new-firm-site Müller & Partner Steuerberatung, Köln, current site mueller-steuer.de, focus on doctors
```
The agent follows the playbook in [`.claude/skills/new-firm-site/`](.claude/skills/new-firm-site/SKILL.md):
1. Research the firm's current site.
2. Create the profile and write the copy for that firm.
3. Set the logo, colours and images (optionally English).
4. Run the checks and the build.
5. Report what is real and what is still a placeholder.

Other agents (Codex, Cursor …): tell them to read `AGENTS.md`.

### Option B: by hand
1. `npm run dev`, open `/configurator`, click **+ New firm** (copies the current firm's settings).
2. Work through the groups on the left; the preview on the right updates live.
3. Click **Check** until nothing important is left, then build (below).

### Check and build
```bash
npm run check-firm -- <slug>        # placeholders, contrast, image sizes, missing images … (exit 1 on errors)
FIRM=<slug> npm run build           # static site in dist/
NOINDEX=1 FIRM=<slug> npm run build # outreach preview: never indexed by search engines
```

## Demo firms (in this repo)

| Slug | Firm | Look |
|---|---|---|
| `hartmann-vogt` | Hartmann & Vogt, Düsseldorf | Reference profile (Figma design), orange on light blue, cut-out hero, English version |
| `brandt` | Brandt Steuerberatung, Hamburg (founders) | Teal on sand, Gambarino, **photo hero**, grid pattern |
| `lindner-kaya` | Lindner & Kaya, München (family businesses) | Forest green on sage, waves pattern |
| `sommerfeld` | Sommerfeld Steuerkanzlei, Köln (doctors) | Burgundy on blush, diagonal pattern |

`hartmann-vogt` is the **reference profile**: every image another firm doesn't have is taken from it, and new fields get their defaults there. Contact data in the demos is fictional.

## Commands

| Command | |
|---|---|
| `npm run dev` | Dev server + configurator |
| `npm run new-firm -- <slug> "<Name>" [--activate]` | New firm profile (settings copied, images inherited, English off) |
| `npm run check-firm -- [slug] [--json]` | Same checks as the configurator's Check button, plus file checks |
| `npm run build` | SEO/hygiene check (`scripts/seo-check.mjs`) + static build (`FIRM`, `NOINDEX` env) |
| `npx astro check` | Type check (keep at 0 errors) |

## How it works (short)

- **Astro 7** (static), **Tailwind 4** (tokens in `src/styles/global.css`), **GSAP** + **Lenis** for motion, WebGL shader for the contact-section pattern.
- `src/config/firm.ts` loads the active profile (`FIRM` env or `active.json`), merges it over the reference profile and provides text placeholders (`{city}`, `{years}` …) and `*accent*` words.
- Colours: a firm sets 4 colours; the full palette is derived in `src/config/theme.ts` (accessible text colour included).
- Every section in `src/components/sections/` reads only from the profile. No firm text is hard-coded.
- English: `firm.en.json` with only the translated texts; `/en/` is built when `languages.en` is on.

Full details: [architecture](.claude/skills/new-firm-site/reference/architecture.md), [design system](.claude/skills/new-firm-site/reference/design-system.md), [motion](.claude/skills/new-firm-site/reference/motion.md), [content & images](.claude/skills/new-firm-site/reference/content-and-images.md), [publishing](.claude/skills/new-firm-site/reference/publishing.md).

## Repository map

```
src/firms/<slug>/          firm.json, firm.en.json (optional), images/   ← firm data
src/firms/active.json      firm shown by the dev server
src/config/                firm loader, theme, patterns, site/nav/routes (all derived)
src/components/sections/   one file per page section
src/components/global/     header, footer, preloader
src/scripts/               motion primitives, shader
src/i18n/                  built-in UI texts DE/EN
integrations/configurator/ configurator (dev-only Astro integration + UI + shared checks)
scripts/                   new-firm, check-firm, seo-check
.claude/skills/new-firm-site/  agent playbook + references
CLAUDE.md, SEO.md, SEO-REVIEW.md, FORMS.md   project rules (German): single source of truth, SEO, copy review, forms
```

## Publishing

One Cloudflare Pages project per firm, all from this repo, with env `FIRM=<slug>` and, for outreach previews, `NOINDEX=1`. Step by step: [publishing.md](.claude/skills/new-firm-site/reference/publishing.md).

## Team rules

- **Pull before you change anything** (`git pull --ff-only`); several people push to `main`.
- **One source of truth:** firm facts only in the profile; never hard-code them in components (see `CLAUDE.md`).
- **Outreach previews are never indexable** (`NOINDEX=1`) and are not sent to a prospect without the team's OK.
- **No invented facts:** ratings, testimonials, team members and legal data must be real before a site goes live. Generated people are placeholders for the pitch only.
- **Copy:** formal "Sie", factual (professional law for tax advisors), German en dash `–`, never em dash `—`.
- **Template changes** become profile options (configurator schema + docs), never one-off edits for a single firm.

## Status / open items

- Contact button opens a pre-filled email; a real contact form (Cloudflare Functions + Resend + Turnstile, see `FORMS.md`) is not built yet.
- Impressum and Datenschutz are placeholders (noindex) until a firm supplies its texts.
- The demo firms use fictional contact data and placeholder domains (`check-firm` reports them).
