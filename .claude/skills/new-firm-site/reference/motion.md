# Motion

Everything animates automatically from the profile; a new firm needs no animation code. This file explains what runs, what it depends on, and the rules if you ever touch it.

**Global rules**
- Libraries: GSAP 3 (ScrollTrigger, SplitText), Lenis smooth scroll (`window.lenis`).
- `prefers-reduced-motion: reduce` → no preloader, no intro, no scroll effects, no loops; everything is visible at once. Start states only apply under `html.js` + `no-preference`; if JS fails, a 2.5 s fallback in `Layout.astro` removes `html.js` so nothing stays hidden.
- Easing family: `expo.out` for entrances, `expo.inOut` / `power4.inOut` for transitions, `power2/3` for small UI. CSS uses `--ease-out-expo`, `--ease-in-out-expo`, `--ease-out-quart`.
- Calm, not flashy: slow durations (0.9–1.8 s), small distances, no bounces except the stars.

## Scroll primitives (`src/scripts/motion.ts`, data attributes)
| Attribute | Effect |
|---|---|
| `data-split` | Heading slides up line by line out of a mask (SplitText). Runs after `bindLastWords()`. |
| `data-reveal="up"` / `"fade"` | Fade + slight rise when entering; siblings stagger. |
| `data-reveal="image"` | Image uncovered with a clip-path, content scales back. `data-radius` sets the mask radius. |
| `data-reveal-delay="0.2"` | Extra delay in seconds. |
| `data-parallax="0.08"` | Vertical parallax as a share of the element's own height (wrap the image in an oversized box). |
| `data-counter` | Counts a number up in text. |
Use these instead of writing new JS for standard effects.

## Preloader (`src/components/global/Preloader.astro`)
Plays once per browser session (`sessionStorage hv-seen`). Skipped for deep links (`#section`) and reduced motion; force it with `?intro`. About 2.9 s.
1. **Logo build:** every `<path>` of the SVG logo mark is revealed from bottom to top with `clip-path` (stagger 0.12 s). Path order = DOM order of the SVG, so for bar-like marks put the paths in the order they should rise.
2. **Wordmark:** the letters of `brand.wordmark` rise out of masks while the letter-spacing tightens from 0.5em to 0.28em.
3. **Light sweep:** a light copy of the mark (accent mixed 75 % with white) is shown only inside a moving diagonal mask band (`--sweep` from 130 % to −30 %).
4. **Split exit:** the logo steps back (scale 0.92, fade), the black surface splits along the middle, and the halves move up and down. `hv:ready` fires so the hero starts while the halves are still moving.
- **Raster or full logos** (`logoImage`, or a PNG `logoMark`): the image is revealed from the bottom as a whole, with no sweep and no letters. A full logo without `logoImageLight` is tinted white.
- **Requirements for a good logo animation:** a vector SVG made of `<path>` elements (not `<image>`, and ideally no `<rect>`/`<polygon>`: convert shapes to paths); one colour if `tintMark` is on. `check-firm` warns otherwise.

## Logo hover (`src/components/ui/Logo.astro`)
On hover the mark's paths scale down vertically by slightly different amounts (0.86 / 0.92 / 0.8, staggered). This works for any path-based mark.

## Hero (`src/components/sections/Hero.astro`)
- **Entrance (parallax layers, all from below, different depths):** the shell rises (22 vh; 8 vh after the preloader), the cut-out partners rise and scale from 1.06 (from 1.18 after the preloader), the title lines rise out of masks, text and buttons fade up, the two cards rise furthest with a slight tilt, the header items drop in, and the stars pop. In the `photo` layout the photo zooms from 1.12 to 1 instead.
- **Scroll (≥ 1024 px):** the partners and photo drift down slowly, the cards float up at different speeds, and the shell scales to 0.96. With a fine pointer the cards follow the mouse slightly.
- **Live status:** "Jetzt erreichbar" / "Ab 8:00 erreichbar" from `hours` and `timeZone`, updated every minute.
- **Deadline loop (accent card):** the chip cycles "`deadlineItem` + month", walking through `deadlineSteps` with a progress bar, then moves to the next month. It runs only while visible and after the intro.

## Header (`src/components/global/Header.astro`)
Transparent at the top; from 40 px of scroll a floating glass bar (background colour at 90 %, blur). It hides when scrolling down past 400 px and returns when scrolling up. Nav links roll their text and draw an accent underline. If the wordmark doesn't fit next to the buttons, the header shows the mark only (`is-compact`, measured live). Over a `photo` hero the header text is white until the glass bar appears. Mobile: a full-screen menu that wipes in with staggered links.

## Sections
- **Die Kanzlei:** the hairline ledger draws itself; stat digits roll in like an odometer (CSS, triggered once by IntersectionObserver); the cards reveal; the image has parallax.
- **Leistungen:** an accordion list (one open at a time). On desktop with a mouse, a preview image follows the cursor over the rows.
- **Unser Ansatz:** two advisor notes pop onto the image; the mini bar charts grow in, then loop gently (`scale` keyframes, the accent bar dips deepest).
- **Warum wir:** ≥ 1024 px it's a pinned stage: scrolling switches panels, and the active tab's progress runs along its divider line. Tablet: 2-column cards. Mobile: a stacked list.
- **Team:** portraits with slightly different parallax per card. Testimonials autoplay every 7 s with segment progress, pausing on hover, focus or when out of view.
- **FAQ:** an accordion animated with `grid-template-rows` (single open).
- **Contact:** two hand images move toward each other as you scroll (scrubbed; a longer path on mobile).
- **Footer:** the giant `footerWord` rises letter by letter.

## Contact-section shader (`src/scripts/chevron-shader.ts`)
A WebGL fragment shader behind the contact section. It draws the profile's pattern and nothing else.
- **Pattern:** `u_pattern` index (0 zigzag 14×10, 1 diagonal, 2 dots 12 px, 3 grid 16 px, 4 waves), colour `u_color` (pattern colour or accent), strength `u_gain` (× `intensity`; 0.55 on screens < 768 px because text sits on it). The canvas data attributes come from `src/config/pattern.ts`.
- **Mask:** it starts at the vertical middle of the hands image, peaks, then fades back to the base colour over the last 200–420 px before the footer edge, so the footer stays a single colour.
- **Base colour `u_bg`:** the firm's `dark` colour, so there's no seam on non-black themes. Never output pure black.
- **Life:** slow fabric-like flow (2-octave value noise), a diagonal light sweep, and a soft lens that lifts the pattern under the mouse (mouse only).
- **Flicker-free:** the canvas is positioned and sized on whole device pixels (the moiré fix); geometry is recomputed only on resize, DPR change or body resize.
- **Performance:** 30 fps, renders only while visible (IntersectionObserver), DPR capped at 1.5 on weak/touch devices and at 2 otherwise, and no layout reads per frame.
- **Fallback:** without WebGL the same pattern shows as a static SVG tile (`--pattern-svg`) with a top fade. `type: none` removes the canvas.
- **New pattern:** add the shape to `src/config/pattern-tiles.ts` (SVG tile and index order) and a branch in the shader with the same proportions.
