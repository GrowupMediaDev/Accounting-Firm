# Design system

Source of truth: `src/styles/global.css` (`@theme` tokens + `@utility` type styles) and `src/config/theme.ts` (palette per firm). A live overview of tokens and components is at `/styleguide/` (noindex). Never hard-code a colour in a component: use `var(--color-*)`, Tailwind token classes (`bg-accent`, `text-ink`…) or `rgb(var(--accent-rgb) / 0.2)` for accent with alpha. Neutral transparencies use `rgb(0 0 0 / x)` on light and `rgb(255 255 255 / x)` on dark surfaces.

## Colour: 4 inputs, everything else derived

A firm sets only `theme.accent`, `theme.background`, `theme.dark`, `theme.light`. `src/config/theme.ts` computes the rest and `src/layouts/Layout.astro` injects them as `:root` variables (overriding the defaults in `@theme`):

| Token | Derived as | Used for |
|---|---|---|
| `--color-accent` | `accent` | Buttons (accent variant), accent words, bars, dots, focus rings, selection, pattern default |
| `--color-accent-deep` | accent mixed 17 % toward `dark` | Hover fill of accent buttons |
| `--color-accent-ink` | accent darkened in 6 % steps toward `dark` until it reaches **4.5:1** on both `light` and `background` | Small accent text on light surfaces (eyebrows, labels, status) |
| `--color-sky` | `background` | Page background, hero shell, light sections |
| `--color-sky-deep` | background mixed 6 % toward dark | Subtle fills |
| `--color-ink` | `dark` | Dark sections (Kanzlei, Team, contact, footer), body text, pattern canvas base |
| `--color-ink-soft` | dark mixed 13 % toward light | Secondary dark |
| `--color-paper` | `light` | Cards, text on dark |
| `--color-pattern` | `pattern.color` or accent | Contact-section pattern |
| `--accent-rgb` | accent as `r g b` | `rgb(var(--accent-rgb) / a)` |

`<meta name="theme-color">` uses `background`.

### Choosing a palette for a firm
1. **Accent** = the firm's strongest brand colour, made usable: a saturated mid-to-dark tone. White button text on it should reach ≥ 4.5:1 (`check-firm` warns below 4.5 and errors below 3). If their brand colour is light (yellow, light blue), darken it for the accent and keep the light tone out of the UI.
2. **Background** = a very light tint (lightness ~93–96 %), either neutral-warm (`#f2ede4`) or tinted toward the brand hue (`#e9efe7` for green, `#f6edeb` for burgundy, `#e0eff3` for orange/blue). Never pure white: cards are white and need to stand off it.
3. **Dark** = near-black, optionally tinted toward the brand hue (`#101a14`, `#1c1215`, `#0c1d24`). Pure `#000000` is fine for neutral brands.
4. **Light** = `#ffffff` unless the brand needs warm white.
5. Pattern colour: leave empty (accent) unless the accent is very dark; strength 0.8–1.2.

Reference palettes (live demo profiles): Hartmann & Vogt orange `#cb530a` on `#e0eff3` / `#000000`; Brandt teal `#0e7c74` on `#f2ede4` / `#0c1d24`; Lindner & Kaya forest `#2d6a4f` on `#e9efe7` / `#101a14`; Sommerfeld burgundy `#9b2c4b` on `#f6edeb` / `#1c1215`.

## Typography

| Role | Font | Where |
|---|---|---|
| Display (headings, big numbers, hero) | `theme.displayFont`: **Instrument Serif** (default, real italic for accent words) or **Gambarino** (no italic: accent words stay upright, only coloured; `size-adjust` 88 %; overrides in `src/styles/fonts-gambarino.css`) | `t-display`, `t-h2`, `t-h3`, `t-stat`, hero title, CTA heading, footer headings and word |
| Sans (body, UI, card titles) | Instrument Sans (variable) | body, buttons, `t-title` (card/panel titles), nav, FAQ questions |
| Brand (wordmark) | Georgia / Gelasio | Logo wordmark and the preloader letters only |

Fonts are self-hosted (`@fontsource`, Fontshare woff2 under `src/assets/fonts/`). No Google Fonts CDN (GDPR).

Type utilities (fluid clamps, tuned at 1440 px): `t-display`, `t-h2`, `t-h3`, `t-h5`, `t-stat`, `t-title` (sans 500, for card titles; the user wants serif only for big headlines), `t-body`, `t-small`, `t-eyebrow` (uppercase, `--eyebrow-color` or accent-ink). Above 1440 px the root font grows gently (to max 20 px), above 1800 px the container widens.

### Heading rules (important, the user cares about this)
- Headings fill lines; no artificial balancing. `text-wrap: pretty` in the heading utilities, and `bindLastWords()` in `src/scripts/motion.ts` glues the last two words together (non-breaking space; if the second-to-last word is an accent `<em>`, both are wrapped in a nowrap span). SplitText runs with `reduceWhiteSpace: false` so this survives.
- Accent words (`<em>`) never wrap (`white-space: nowrap`): keep them short (≤ 13 chars) so they fit at 360 px.
- One accent word per heading, the meaningful one ("Klarheit", "*Gespräch*", "*Heilberufe*").
- Hero title lines never wrap: ≤ ~13 characters per line.
- German sentence case, never Title Case.

## Layout

- Container: `container-site` (82.5rem, 88rem ≥ 1800 px) with `--gutter` (20 → 60 px).
- Radius scale only: `--radius-btn` 6 px (buttons, icon tiles), `--radius-sm` 10 px (nested images, chips), `--radius-card` 16 px (cards, photos), `--radius-section` 32 px (24 px mobile; hero shell, rounded section edges).
- Hairlines: 1 px `rgb(0 0 0 / 0.12)` on light, `rgb(255 255 255 / 0.12–0.2)` on dark. Lists (services, FAQ, signals, Warum tabs) are "ledger" style: rows separated by hairlines, a small tabular index (`01`) on the left.
- Section rhythm (top to bottom): hero (light shell on a dark frame) → Kanzlei (dark, rounded bottom, cards overlapping the edge) → Leistungen (light) → Ansatz (light) → Warum (light) → Team + testimonials (dark rounded block) → FAQ (light) → Aktuelles (light, cards overlap into the next section) → contact (dark, rounded top, hands + pattern) → footer (dark).
- Breakpoints in use: 640 (sm), 768 (md), 1024 (lg, desktop layouts and pinned stages), 1200, 1440, 1800.
- Mobile first: everything must work at 360 px without horizontal scroll.

## Components (src/components/ui)

| Component | Purpose |
|---|---|
| `Button` | `variant: dark | light | accent`; hover = calm opacity crossfade to a fill colour (no magnetic follow, no text clone); `:active` scales to 0.98 |
| `CtaPair` | Button + arrow tile as one link (header CTA, section CTAs); arrow flies out and back in on hover |
| `ArrowTile` | Square accent tile with arrow (mobile header CTA) |
| `IconTile` | Square tile for white PNG icons on cards |
| `Eyebrow` | Small uppercase label above headings (`reveal` prop) |
| `Img` | `astro:assets` picture with `sizes`/`widths`; use it for every content image |
| `Logo` | Mark + optional two-line wordmark, or a full logo image; light variant on dark |

Section-specific UI (cards, ledger, carousels, accordions) lives inside each section file with scoped styles.
