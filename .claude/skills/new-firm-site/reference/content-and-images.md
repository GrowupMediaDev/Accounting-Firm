# Content and images

## Who reads this site
Business owners, freelancers, doctors and private clients looking for a Steuerberater, usually German-speaking, often switching firms. They want: someone reliable, a clear cost picture, a personal contact, and an easy first step. The site has one conversion goal: the **free first meeting** (Erstgespräch) by phone or email.

## Copy rules
- **Formal "Sie"**, calm and competent, never salesy. Short sentences. Concrete over vague ("BWA am 10. des Monats" beats "schnelle Auswertungen").
- **Professional law (StBerG §57a, BOStB):** advertising must be factual. No superlatives about quality ("beste Kanzlei"), no guarantees (savings, refunds, response times), no comparisons that disparage named competitors, no fixed price promises. Fees: "nach der Steuerberatervergütungsverordnung (StBVV) oder als vereinbarte Pauschale, schriftlich festgehalten".
- **Protected titles:** only call someone Steuerberater/in, Wirtschaftsprüfer/in or Fachberater/in if the firm's site or register says so. Otherwise use the role they publish (Steuerfachangestellte, Bilanzbuchhalter …).
- **Figures** (stats, rating, team size) must come from the firm or be clearly placeholder (and reported as such). Years: use `{years}` from `brand.founded`.
- **No app/receipt angle:** this is a Kanzlei, not a bookkeeping app. Digital collaboration (DATEV Unternehmen online, Belege digital) is fine as one point among others.
- **Make it theirs:** rewrite headings and leads around the firm's focus and city (examples: Brandt = founders, "Wachstum mit System"; Lindner & Kaya = family businesses, "Werte, die bleiben"; Sommerfeld = Heilberufe, "Mehr Zeit für Ihre Praxis"). Services, FAQ ("Für wen arbeiten Sie?") and Warum-reasons should match that focus.
- **German typography:** en dash `–` for ranges and title separators, never the em dash `—`; correct capitalisation (no Title Case); `{open}–{close} Uhr`.
- **Lengths:** hero title lines ≤ ~13 chars; accent words ≤ 13 chars; SEO title ≤ 60, description 120–160; card titles 2–4 words; leads 1–3 sentences.
- **Placeholders** instead of repeated facts: `{city}`, `{name}`, `{shortName}`, `{years}`, `{founded}`, `{open}`, `{close}`, `{days}`, `{phone}`, `{email}`.
- **Legal pages** (Impressum, Datenschutz) are placeholders and noindex; never invent their content.

## Images

### Where they come from (in this order)
1. **The firm's own published photos** (team portraits, office, building). Fine for the private outreach preview; for a live launch the firm must confirm usage rights.
2. **Existing template images** in the reference profile (generic office and advisory scenes, all generated in a consistent style).
3. **New generated images** (Google Flow, see below) when a section needs a specific scene.

Generated people are **placeholders**. A live site must not present invented people as the firm's team or as real clients. Team portraits and named hero partners must be replaced by real photos before launch; say so in your report.

### Style (keep every image consistent)
Editorial documentary photograph, natural window daylight, warm neutral tones, modern German office with light wood, white walls, folders and plants, shallow depth of field, 35 mm look, realistic skin. **No text, logos or watermarks; no legible text on paper or screens.** People act naturally (talking, reviewing documents, on a call), never posing at the camera with thumbs up.

Avoid repeating the same concept within one section (two phone calls in "Warum wir").

### Sizes and formats
| Slot | Format | Minimum | Notes |
|---|---|---|---|
| `hero.image` (layout `cutout`) | transparent PNG | 1600 px wide | People cut out, flush with the bottom edge, room on the left for text |
| `hero.photo` (layout `photo`) | landscape 16:9 | 2000 px wide | People in the right third, calm left half; set `photoFocus` (e.g. `80% 50%`) so people stay visible on tablets |
| `leistungen.items[].image` | portrait 3:4 | 896 px wide | |
| `warum.items[].image` | portrait 3:4 | 1200 px wide (large desktop panel) | |
| `kanzlei.image`, `ansatz.image` | landscape / square | 1200 px | |
| `team.members[].image` | portrait 4:5 | 700 px wide | Face in the upper third; adjust `focus` |
| `news.items[].image` | landscape 4:3 / 3:2 | 1200 px wide | |
| `hero.avatars[]` | square | 128 px | Three small faces on the availability card |
| Logo mark | SVG with `<path>` elements | | See motion.md → Preloader |

Save photos as JPEG quality ~84 (progressive) into `src/firms/<slug>/images/`; `astro:assets` creates the responsive sizes. Always fill the alt texts (`alt`, `imageAlt`, `photoAlt` …), describing what is visible, in German (and English in `firm.en.json`).

### Generating with Google Flow (worked, 0 credits on the user's plan)
Requires the user's Chrome with the Claude extension connected and the user signed in to Google (never enter credentials yourself).
1. `flow.google.com` → New project (or reuse the GrowUp project). In the prompt bar's settings chip pick **Image**, the aspect ratio (3:4, 4:3, 16:9 …), **Nano Banana**, **x2**.
2. Prompt = scene sentence + the style block above. Submit with the arrow button (Enter is unreliable); about 2 jobs run at once, so queue the next prompt when a slot frees. Watch that the "Agent" toggle stays off.
3. Pick the best variant, open it → **Download media → 2K Upscaled** (it downloads automatically after upscaling). Group downloads are 1K zips whose file names contain "…": extract them with Python `zipfile`, not `unzip`.
4. Move the downloads out of `~/Downloads`, convert to JPEG q84, put them into the profile's `images/`, update `firm.json` (and alt texts), delete images no longer referenced, run `check-firm`.
Alternative without a browser: the Gemini API (same model family), but it costs money, so ask first.
