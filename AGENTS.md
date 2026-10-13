# AGENTS.md: read this first

You are working in a **website template for German tax and accounting firms** (Steuerkanzleien). GrowUp uses it to build a finished site for a prospect firm as an outreach pitch. Your usual job: **take a brief (firm name, current website, wishes) and turn it into that firm's site.**

## Read in this order
1. [`README.md`](README.md): what this is, commands, demo firms, team rules.
2. [`.claude/skills/new-firm-site/SKILL.md`](.claude/skills/new-firm-site/SKILL.md): **the workflow you follow** (intake → profile → copy → brand → images → English → check → build → report).
3. The references it points to, before touching anything:
   - [`architecture.md`](.claude/skills/new-firm-site/reference/architecture.md): data flow, every profile field, configurator, scripts, how to add an option
   - [`design-system.md`](.claude/skills/new-firm-site/reference/design-system.md): colours and how they're derived, palette choice, typography and heading rules, layout, components
   - [`motion.md`](.claude/skills/new-firm-site/reference/motion.md): preloader and logo animation, hero entrance, header, section animations, the WebGL pattern shader
   - [`content-and-images.md`](.claude/skills/new-firm-site/reference/content-and-images.md): copy rules (incl. professional law), image style, sizes, generating images with Google Flow
   - [`publishing.md`](.claude/skills/new-firm-site/reference/publishing.md): Cloudflare Pages per firm, outreach preview (`NOINDEX=1`) vs. live
4. [`CLAUDE.md`](CLAUDE.md), [`SEO.md`](SEO.md), [`SEO-REVIEW.md`](SEO-REVIEW.md), [`FORMS.md`](FORMS.md): project rules (German).

In Claude Code the workflow is available as the slash command `/new-firm-site <brief>`.

## The essentials (if you read nothing else)
- A firm = `src/firms/<slug>/firm.json` (+ optional `firm.en.json`, own `images/`). Create one with `npm run new-firm -- <slug> "<Name>" --activate`. Don't edit components for one firm.
- Verify with `npm run check-firm -- <slug>` (must exit 0 for a live site), `npx astro check` (0 errors), `FIRM=<slug> npm run build`, and a visual check at 1440/768/390 px.
- Never invent facts (names, addresses, ratings, testimonials, qualifications). Report what's placeholder.
- No em dash `—` in copy. Formal "Sie". Factual, no guarantees or superlatives (tax advisor advertising rules).
- Pull before changing (`git pull --ff-only`). Commit, push or publish **only when asked**. Ask before spending money (paid APIs). Outreach previews are always `NOINDEX=1`.
- Never enter passwords or API keys yourself; the user does that.
