# Inner-Pages Design Unification — Design Spec

> **Scope:** inner pages only — `/about`, `/projects`, `/papers` (renamed from `/publications`),
> `/blog` (index), and the blog **post** reading page. **The homepage (`index.astro` +
> `NeuralNet.astro`) is FROZEN — do not touch it.** The homepage is the *reference* whose
> visual language the inner pages must adopt, not a target for changes.
>
> **Goal:** make every inner page read as the same "framed canvas" as the homepage — no
> header/footer bars, a serif name floating top-left, nav floating top-right, content
> scrolling underneath, and a borderless bottom row — plus a set of per-page content fixes
> (About header, page-title cleanup, tile redesign, dynamic fields, hover lift, papers rename).
>
> Status: **SPEC — awaiting review.** Created 2026-06-20.

---

## 0. One open decision (flagged for confirmation)

**Page-title color — recommendation: WHITE.** The big page title (e.g. "Projects") should be
**`--text` (white)**, not `--accent` (iris). Reasons: (a) the homepage name is white serif —
white ties the page title to that identity; (b) iris/teal are reserved for *interactive/active*
states (active nav link, winner, links) — keeping titles white preserves that hue discipline
(CLAUDE.md §9). The title should also use **`--font-display` (serif)** to echo the homepage name.
**Confirm white+serif, or switch to iris during review.**

---

## A. The universal frame (ALL inner pages)

The two chrome bars are replaced by floating corner elements over the existing starfield +
vignette, identical in spirit to the homepage.

### A1 — Name (top-left)
- Lives where `Header`'s brand is today, but restyled and repositioned to a **fixed** corner.
- Font: **`--font-display` (Fraunces serif)**, matching `index.astro`'s `.home-name`
  (`font-size: 1.6rem; font-weight: 500; letter-spacing: -0.01em; color: var(--text)`).
- `position: fixed; top: var(--edge-pad); left: var(--edge-pad); z-index: 50.`
- It is the **home link** (`<a href="/">`), `aria-label="{site.name} — home"`. Hover → no color
  shift needed (keep it calm) or a subtle `--text-dim`→`--text`; pick the calmer option.

### A2 — Nav (top-right)
- Same items, same order, **same top-right position** as today (`site.sections`). NOT moved.
- `position: fixed; top: var(--edge-pad); right: var(--edge-pad); z-index: 50.`
- Mono (`--font-mono`), `font-size: 0.9rem`, items in a horizontal flex row, `gap: 1.25rem`.
- Active page: keep the current accent treatment — `color: var(--accent-bright)` + the 2px
  `--accent` underline (`.nav-link.active::after`). Active detection logic unchanged
  (normalize trailing slash, `path === href || path.startsWith(href + "/")`).
- Inactive: `--text-dim`, hover → `--text`.

### A3 — Kill the bars
- Remove from `Header`: `border-bottom`, `background`, `backdrop-filter`, `position: sticky`,
  the `.bar`/`.container` wrapper, and the fixed `height: 3.5rem`. Header becomes two floating
  corner elements (name + nav), nothing else.
- Remove from `Footer`: `border-top` and `margin-top` border framing (see A5).

### A4 — Content scrolls underneath, with a top fade
- `<main>` gets **top padding** so content *starts* below the floating frame — enough to clear
  the name (serif 1.6rem) + `--edge-pad`. Use `padding-top: calc(var(--edge-pad) + 3.5rem)`
  (tune live). Keep existing bottom padding.
- **Top fade-out mask:** as content scrolls up, the ~40–60px nearest the top dissolves into the
  page background instead of hard-clipping behind the name/nav. Implement with a
  `mask-image: linear-gradient(to bottom, transparent 0, #000 <fade>)` on the scroll region, OR
  a fixed full-width gradient overlay strip at the top (`linear-gradient(#020308 → transparent)`,
  `pointer-events:none`, `z-index` between content and frame). Prefer the **overlay strip** —
  simpler, no mask-compat caveats, and it matches the existing `.page-vignette` pattern.
  The strip height ≈ the frame's reserved top zone.

### A5 — Bottom row (socials + quip + rss), borderless
- Keep `Footer`'s content (`<Socials size>`, the `--text-ghost` quip `loss still decreasing`,
  the `rss` link) but **remove the border bar**. Keep it **in normal document flow** (the
  existing `body { display:flex; flex-direction:column; min-height:100vh }` sticky-footer
  setup) so it pins to the viewport bottom on short pages and sits at content end on long ones —
  do NOT make it `position: fixed` (a fixed bottom bar would cover scrolling content).
- Layout per author intent: **quip centered** in the row, socials and rss flanking — OR keep the
  current left/right split. Recommendation: center the quip (`text-align:center` / the quip as
  the centered element with socials left, rss right) to echo the homepage's centered bottom
  guide. Confirm during review; default to centered quip.
- No border, no background. Sits over the starfield like everything else.

### A6 — Z-order & background (unchanged plumbing)
- `Base.astro` already renders `AmbientNet` (stars) + `.page-vignette` + `body.stars-bg`
  (`#020308`). Keep all of it. The frame elements (`z-index:50`) sit above content
  (`z-index:1`) which sits above vignette (`z:0`) and stars.

### A7 — Mobile (≤767px)
- Name + nav must not wrap to two rows or collide. If the nav row is too wide at 375px,
  reduce nav `gap`/`font-size` — never wrap (CLAUDE.md §13). Verify the four nav items + name
  fit. The top fade + content top-padding still apply.

---

## B. Blog-post reading page re-stack (`Post.astro` only)

The post page has three top/right elements; re-stack so they coexist with the floating nav.

- **Nav** — top-right, floating (from §A2). Unchanged position.
- **Progress hairline** — the 3px `.progress` bar stays `position: fixed; top: 0` full width.
  It's a thin line above the frame; no conflict. Keep as-is.
- **Epoch label** (`epoch 1/N · NN%` → `converged ✓`) — currently `position:absolute; top:1.1rem;
  right:0.4rem`, which **collides with the nav**. **Move it to stack directly UNDER the nav**,
  right-aligned: `position: fixed; top: calc(var(--edge-pad) + 2.4rem); right: var(--edge-pad)`
  (tune the offset to clear the nav row, mirroring the homepage `loss/argmax` caption that sits
  under the socials). Keep its existing reading-focus peek/hide behavior and its
  `@media (max-width:767px){ display:none }`.
- **TOC rail** (`Toc variant="rail"`, right edge, ≥1000px) — must **start low enough to clear the
  nav + epoch label** stacked above it. The rail is roughly vertically centered; verify it clears
  and, if not, nudge its top bound down. (Check `Toc.astro` rail positioning during implementation.)
- Everything else on the post page — meta line under title, prev/next, the §A5 bottom row,
  reading-focus mode — is behavior-unchanged.

Resulting top-right stack, top→bottom: `progress hairline (edge)` › `nav` › `epoch label` ›
`(gap)` › `TOC rail`.

---

## C. About page (`about.astro`)

1. **Heading text + case:** `ABOUT.heading` in `constants.ts` changes `"about"` → `"About"`
   (capital A). (Edit the config value, not the template — single source of truth.)
2. **Raise the heading:** reduce the vertical space above `.about-h1`. Currently the `.about-bar`
   (slider) sits above it with `margin-bottom: 1.5rem` and the h1 has `margin: 0 0 2.25rem`.
   After C3 (slider goes inline), the h1 moves up naturally; additionally trim the `<main>`
   top padding contribution so "About" sits higher on the page.
3. **Slider inline with the heading:** put the `TempSlider` on the **same line** as the "About"
   heading. Replace the separate `.about-bar` block with a flex row:
   `<div class="about-head"><h1 class="about-h1">{a.heading}</h1><TempSlider …/></div>` where
   `.about-head { display:flex; align-items:center; justify-content:space-between; gap:1.5rem }`.
   The h1 stays left, slider sits right, vertically centered with the heading. On mobile (≤36rem)
   allow it to wrap (`flex-wrap: wrap`) so the slider drops below the heading without overflow.
4. **Heading color/font:** keep consistent with the §0 decision — if page titles become white
   serif, the About heading should match (currently it's `--accent` mono `1.5rem`). Align it to
   the same treatment as the other page titles for cross-page consistency. Confirm in review.

> About keeps its two-column layout (intro + spec rows | timeline), the temperature resample
> behavior, and all copy in `constants.ts`. Only the header area changes.

---

## D. Index pages — projects, papers, blog (NOT the blog post)

These three use `PageHeader.astro` + `Tile.astro`. Changes apply to both shared components.

### D1 — Remove redundant title + tagline (`PageHeader.astro`)
- Today each page shows: a mono **eyebrow** (`projects`), a big **h1** (`Projects`), and a
  **lead** tagline (`Things I've built…`). That's two names + a tagline.
- **Drop the eyebrow and the lead.** Keep **only the h1 title.** Remove the `eyebrow` and `lead`
  props/markup from `PageHeader` (or stop passing them from the three pages — prefer removing the
  markup so the component is genuinely simpler). Update the three page call-sites
  (`projects.astro`, `papers.astro`, `blog/index.astro`) to pass only `title`.

### D2 — Center the title (`PageHeader.astro`)
- The remaining title is **horizontally centered** (not left-aligned).
  `.page-header { justify-content: center; text-align: center }` (and drop the
  space-between/actions layout that existed for the slider — no inner page except About uses
  actions, and About no longer uses PageHeader).
- Title style per §0: **white (`--text`), `--font-display` serif**, `font-size:
  clamp(1.6rem, 4vw, 2.25rem)`, centered. Keep a sensible `margin-bottom` (e.g. `2rem`) so the
  grid below has air.

### D3 — Tile text strip: distinct dark contrast zone (`Tile.astro`)
- The tile is mostly the thumbnail image; the bottom **`.tile-body`** holds the title + extras.
- Give `.tile-body` a **distinct, darker background** than the page and clearly separated from the
  image — so the text zone reads as its own panel layered under the image. Use a near-black
  surface, e.g. `background: #0b0f16` (darker than `--surface` #161b22) or
  `color-mix(in srgb, var(--bg) 92%, #000)`. The media area keeps `background: var(--bg)`.
- Result: image on top, a crisp darker strip beneath holding text — visible separation regardless
  of the thumbnail's colors. Keep the tile's outer `--border` + `--r-md` + `overflow:hidden`.

### D4 — Dynamic fields (show only what exists)
The tiles must render a field **only when its config value is present**, and omit it entirely
otherwise — no `#` fallbacks, no empty rows.

- **Projects (`projects.astro`):**
  - **repo** (`p.data.repo`, optional): render `repo ↗` link ONLY if present.
  - **demo** (`p.data.demo`, optional — schema already has it but the page ignores it today):
    render `demo ↗` link ONLY if present. Support **both** repo + demo, **either** alone, or
    **neither**.
  - **status** (`p.data.status`, optional): chip ONLY if present (already conditional — keep).
  - **Tile href behavior:** today the whole card links to `repo ?? "#"`. With dynamic links, the
    card href should be `demo ?? repo ?? <project detail or no-op>`. If neither exists and there's
    no detail page, the card should not be a dead `#` link — make the whole-card link optional:
    when no link exists, render a non-link card (or link to a detail page if the project has body
    content per CLAUDE.md §7). **Implementation note:** `Tile` currently *requires* `href` and
    always renders an `<a>`. Extend `Tile` to accept an optional `href` — when absent, render the
    card as a `<div>` (or `<article>`) instead of `<a>`, and let the per-surface extras carry the
    actual repo/demo links as individual `<a>`s. This is the cleanest way to support "repo only",
    "demo only", "both", and "neither" without dead links.
  - **Caveat (whole-card-link vs inner links):** an `<a>` cannot legally nest `<a>`s. So if the
    card stays a single link, repo/demo can't each be separate links inside it. Decision: **make
    the card a non-link container and put repo/demo as separate inline links in the extras row.**
    This unblocks per-link dynamics and is the standard pattern. (Confirm in review — alternative
    is "card links to demo||repo, no inner links," which is simpler but can't show both.)
- **Papers (`papers.astro`):**
  - **link target**: `pdf || link` (already conditional). If neither, same non-link treatment.
  - **note** (`p.note`, optional in the publications data): show ONLY if present.
  - authors + venue/year always present (data fields), render as today.
- **Blog (`blog/index.astro`):** meta line + tags already derive from present data; no dead
  fields. Leave as-is (tags already `.slice(0,3)`; `:empty` extras already collapse).

### D5 — Hover: keep teal border + ADD image lift (`Tile.astro`)
- Keep the current hover: `border-color: var(--hover)` + `box-shadow: var(--hover-glow)` +
  title → `--hover`.
- **Add a lift:** on `.tile:hover`, raise the card with `transform: translateY(-6px)` (tune
  4–8px) so it reacts to the pointer. Add `transform` to the tile's `transition`
  (`transition: border-color .15s, box-shadow .2s, transform .2s ease`). Use the existing
  `--ease`/`--ease-spring` curve for a tasteful settle.
- **Reduced motion:** under `@media (prefers-reduced-motion: reduce)`, disable the translate
  (keep the border/glow). 
- Whole-card lift (not just the image) reads cleaner and avoids clipping inside `overflow:hidden`;
  lift the `.tile`, not the inner `<img>`.

---

## E. Papers rename (`/publications` → `/papers`)

The id stays `publications` internally where it's harmless; user-facing path + titles become
"papers".

- **Route:** rename `src/pages/publications.astro` → `src/pages/papers.astro`.
- **Nav href:** `SECTIONS` entry — change `href: "/publications"` → `href: "/papers"`.
  `id` can stay `"publications"` (used as a stable key / for the net), `label` is already
  `"papers"`. **Verify** nothing else keys off the `/publications` href (search the repo:
  internal links, `projects` `blog` cross-links, RSS, sitemap).
- **Page title:** the h1 becomes **"Papers"** (was "Publications"); `Base title="papers"`,
  `description` updated.
- **Data/lib:** `src/data/publications.yaml`, `@lib/publications`, `getPublications()` may keep
  their internal names (no user-facing string) — rename optional, not required. Prefer leaving
  internal names to minimize churn; only the route, nav href, and visible title change.
- **Redirect/SEO:** `SITE_URL` is still `https://example.com` (not deployed, no live traffic), so
  no redirect is required now. Note for deploy time: if `/publications` was ever live, add a
  redirect — out of scope here.

---

## F. File-by-file change summary

| File | Change |
|---|---|
| `src/components/Header.astro` | Strip the bar (border/bg/sticky/height/container). Name → fixed top-left serif home-link; nav → fixed top-right mono with active underline. (A1–A3) |
| `src/components/Footer.astro` | Remove border/margin bar framing; keep content in-flow, borderless; quip centered. (A5) |
| `src/layouts/Base.astro` | `<main>` top padding to clear the frame; add top fade overlay strip; keep stars/vignette. (A4, A6) |
| `src/layouts/Post.astro` | Move epoch label to stack under the nav (top-right); verify TOC rail clears the nav. (B) |
| `src/components/Toc.astro` | If rail collides with the top-right nav, nudge rail top bound. (B) |
| `src/components/PageHeader.astro` | Remove eyebrow + lead; center the title; white serif title. (D1, D2) |
| `src/components/Tile.astro` | Optional `href` (non-link card when absent); darker `.tile-body` bg; hover translateY lift + reduced-motion guard. (D3, D4, D5) |
| `src/pages/projects.astro` | Pass only `title` to PageHeader; dynamic repo/demo links + status; non-dead card link. (D1, D4) |
| `src/pages/papers.astro` (renamed) | Renamed from `publications.astro`; title "Papers"; dynamic pdf/link + note. (D1, D4, E) |
| `src/pages/blog/index.astro` | Pass only `title` to PageHeader. (D1) |
| `src/pages/about.astro` | Slider inline with heading; raise heading; heading style per §0. (C) |
| `src/config/constants.ts` | `ABOUT.heading` "about"→"About"; `SECTIONS` papers `href` → `/papers`. (C1, E) |

> **Out of scope / explicitly NOT changed:** the homepage (`index.astro`, `NeuralNet.astro`),
> the temperature resample logic, the reading-progress math, the TempSlider component internals,
> the publications data file/lib internal names, and the `X_URL` value (separate pending item —
> author to confirm the real handle).

---

## G. Verification (per CLAUDE.md §13 + the frame's scroll behavior)

Render (`npm run dev`) and check at **375 / 768 / 1280 / 1440 / 1920**:
1. **No header/footer bars** anywhere on inner pages; name (serif) + nav float in the corners.
2. **Scroll a long page** (a blog post): content dissolves under the frame via the top fade — no
   text hard-clipped behind the name/nav.
3. **Blog post top-right:** nav, then epoch label beneath it, then the TOC rail — none overlap;
   progress hairline runs across the very top.
4. **Page titles** centered, white serif, single title (no eyebrow, no tagline).
5. **About:** "About" (capital A), raised, TempSlider inline on the same row; wraps cleanly on
   mobile.
6. **Tiles:** darker text strip clearly separated from the image; hover lifts the card + teal
   border; repo/demo links appear only when present (test a project with repo-only, demo-only,
   both, neither); no `#` dead links.
7. **Papers:** URL is `/papers`, nav highlights correctly, title reads "Papers".
8. **Mobile:** name + nav don't wrap/collide at 375px; zero horizontal scroll
   (`body.scrollWidth === innerWidth`); tap targets ≥44px.
9. **Reduced motion:** tile lift disabled; everything else legible.

---

## H. Self-review checklist (done before handing to author)

- Placeholders: none — the one open choice (§0 title color) is explicitly flagged for confirm.
- Consistency: frame (§A) applies to all inner pages incl. post; post-specific re-stack (§B)
  doesn't contradict §A (nav position identical). ✓
- Scope: single coherent pass over inner-page chrome + tiles; homepage explicitly excluded. ✓
- Ambiguity resolved: title color (recommend white+serif), card-link vs inner-links (recommend
  non-link card + inline repo/demo links), bottom row (recommend centered quip) — each has a
  default chosen, flagged for author override.
