# Publishing

One repository, many firms. Every firm is built from the same code with a different `FIRM`. Publishing = one **Cloudflare Pages project per firm**, all connected to this repo.

Only publish when the user asks. Publishing puts a site that carries a real firm's name online, so the rules below matter.

## Two kinds of deployment

| | Outreach preview (default) | Live site (firm agreed) |
|---|---|---|
| Purpose | Link we send to the prospect | The firm's real website |
| `NOINDEX` | `1`: every page `noindex, nofollow`, robots.txt `Disallow: /`, empty sitemap | not set: canonical, hreflang, sitemap active |
| Domain | `<project>.pages.dev` | firm's domain, `seo.url` set to it |
| Content | may contain placeholders and stock photos, reported to the user | no placeholders (`check-firm` exit 0), real photos and legal texts, firm approved |

A preview must **never** be indexable: it imitates a real business without its consent. Always deploy outreach previews with `NOINDEX=1`.

## Cloudflare Pages project for a firm

Create it in the Cloudflare dashboard (the user or someone with access does this; never handle their credentials yourself):
1. Workers & Pages → Create → Pages → Connect to Git → `GrowupMediaDev/Accounting-Firm`.
2. Project name: `kanzlei-<slug>` (becomes `kanzlei-<slug>.pages.dev`).
3. Build settings: framework preset **Astro**, build command `npm run build`, output directory `dist`, production branch `main`.
4. Environment variables (Production **and** Preview):
   - `FIRM` = `<slug>`
   - `NOINDEX` = `1` (remove when the site goes live)
   - `NODE_VERSION` = `22` (the project needs Node ≥ 22.12)
5. Save and deploy. `public/_headers` sets the cache rules automatically.

Local equivalent of what Cloudflare runs:
```bash
NOINDEX=1 FIRM=<slug> npm run build && npx astro preview
```

## Known Cloudflare behaviour
- Builds run one at a time per account; feature-branch previews queue ahead of `main`.
- Cloudflare builds a commit only for the branch that was pushed first: if you fast-forward `main` to a SHA that was already built on another branch, no production build starts. Push `main` first, or make a new commit on `main`.
- Every project rebuilds when anything in the repo changes (all firms share the code). To limit that, use Pages "Build watch paths" per project: `src/firms/<slug>/**`, plus the shared paths `src/components/**`, `src/config/**`, `src/styles/**`, `src/scripts/**`, `src/layouts/**`, `src/pages/**`, `src/i18n/**`, `package*.json`, `astro.config.mjs`.
- Track a build: `gh api repos/GrowupMediaDev/Accounting-Firm/commits/<sha>/check-runs` (look for "Cloudflare Pages").

## Before a site goes live
- `npm run check-firm -- <slug>` exits 0, with no placeholders left.
- Real Impressum and Datenschutz texts (the pages are still placeholders in this template, noindex until filled).
- Real team photos and only real testimonials and ratings; generated people removed or clearly not presented as the firm's staff.
- Contact: the CTA currently opens a pre-filled email (`mailto`). A real form (Cloudflare Pages Functions + Resend + Turnstile) is described in `FORMS.md` and not built yet.
- `seo.url` = the live domain; remove `NOINDEX`; connect the custom domain in Pages.
- Tracking only with consent (see `SEO.md`).
