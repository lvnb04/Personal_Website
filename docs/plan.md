# Personal Portfolio Site — Implementation Plan

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax. Execute task-by-task,
> top to bottom. After each **Phase**, run the build/dev checkpoint and pause for review.

**Goal:** Build a fast, static, dark-mode personal portfolio + tech blog for an AIML
engineer, per `CLAUDE.md` (canonical spec) and `docs/decisions.md` (overrides).

**Architecture:** Astro static-output site. One config (`site.ts`) drives nav + the
neural-net home page. Content collections for blog (`.mdx`) and projects (`.md`);
publications from a YAML data file. A single shared `Tile.astro` powers the
projects / publications / blog grids. Plain CSS with custom-property design tokens.
No backend, no browser storage, no theme toggle.

**Tech Stack:** Astro, MDX, `astro-expressive-code`, `remark-math` + `rehype-katex`
(KaTeX), vanilla JS + SVG (neural net), plain CSS.

**Verification model (no unit tests / no git):**
- Per task: file exists + content correct.
- Per phase: `npm run build` exits 0, then `npm run dev` visual smoke test.
- No commits (ZIP transfer). Review checkpoints replace commits.

---

## File Structure (decomposition)

```
package.json                         deps + scripts
astro.config.mjs                     integrations: mdx, expressive-code, katex
tsconfig.json                        astro strict base
public/favicon.svg                   on-brand favicon
public/og-default.png                fallback OG image
src/config/site.ts                   SINGLE SOURCE OF TRUTH (identity + sections)
src/data/publications.yaml           3 papers (placeholder)
src/styles/global.css                design tokens + base styles
src/content.config.ts                blog + projects collections
src/lib/seededRandom.ts              seeded PRNG (neural net edges)
src/lib/readingStats.ts             ~N min + N.Nk tokens from post body
src/components/Header.astro          inner-page nav (from site.ts)
src/components/Footer.astro          socials + one static quip
src/components/Tile.astro            shared card: image + title + per-surface slot
src/components/Term.astro            MDX hover-definition popover
src/components/TempSlider.astro      About-page temperature easter egg
src/components/Toc.astro             minimap table of contents
src/components/NeuralNet.astro       home network (built last)
src/layouts/Base.astro               header + footer + slot (inner pages)
src/layouts/Post.astro               blog chrome: progress bar, Toc, prev/next
src/pages/index.astro                home (NeuralNet, no Header)
src/pages/about.astro
src/pages/projects.astro
src/pages/publications.astro
src/pages/blog/index.astro
src/pages/blog/[...slug].astro
src/pages/404.astro
src/pages/rss.xml.js                 RSS feed
src/content/blog/hello-world.mdx     sample post exercising every reader feature
src/content/projects/sample-project.md
src/assets/thumbs/                    project PNGs (placeholder) + blog SVGs
```

---

## Phase 0 — Scaffold & Foundation

### Task 0.1: Initialize Astro project files

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "portfolio",
  "type": "module",
  "version": "0.1.0",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "astro": "^4.15.0",
    "@astrojs/mdx": "^3.1.0",
    "@astrojs/rss": "^4.0.0",
    "astro-expressive-code": "^0.35.0",
    "remark-math": "^6.0.0",
    "rehype-katex": "^7.0.0",
    "katex": "^0.16.11",
    "js-yaml": "^4.1.0"
  }
}
```

- [ ] **Step 2: Create `astro.config.mjs`**

```js
// astro.config.mjs — integrations: expressive-code, mdx, katex
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import expressiveCode from "astro-expressive-code";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export default defineConfig({
  site: "https://example.com", // update at deploy
  integrations: [
    expressiveCode({ themes: ["github-dark"], styleOverrides: { borderRadius: "6px" } }),
    mdx(),
  ],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{ "extends": "astro/tsconfigs/strict" }
```

- [ ] **Step 4: Install deps** — Run: `npm install` — Expected: exits 0, `node_modules/` created.

### Task 0.2: Single source of truth — `site.ts`

**Files:** Create: `src/config/site.ts`

- [ ] **Step 1: Write config with real identity** (values from `docs/decisions.md`)

```ts
// src/config/site.ts — SINGLE SOURCE OF TRUTH (nav + neural-net nodes)
export const site = {
  name: "Bharateesha LVN",
  tagline: "CS undergrad @ PES University · building ML systems & the infra that runs them",
  email: "bharateesha.lvn@gmail.com",
  github: "https://github.com/lvnb04",
  linkedin: "https://www.linkedin.com/in/lvnb",
  // order drives nav order AND neural-net input node order
  sections: [
    { id: "about",        label: "about",        href: "/about" },
    { id: "projects",     label: "projects",     href: "/projects" },
    { id: "publications", label: "publications", href: "/publications" },
    { id: "blog",         label: "blog",         href: "/blog" },
  ],
};
```

### Task 0.3: Design tokens — `global.css`

**Files:** Create: `src/styles/global.css`

- [ ] **Step 1: Define `:root` tokens** (exact values from `CLAUDE.md` §4) — bg, surface,
  border, border-bright, edge, text/dim/faint/ghost, accent + accent-dark/tint, amber,
  error, font-mono, font-body, measure.
- [ ] **Step 2: Base styles** — `box-sizing: border-box`, dark `body` (bg + text + font-body),
  link reset, `img { max-width: 100% }`, mono headings, focus-visible ring using `--accent`.
- [ ] **Step 3: Import KaTeX CSS** — add `@import "katex/dist/katex.min.css";` at top.

### Task 0.4: Content collections + data

**Files:** Create: `src/content.config.ts`, `src/data/publications.yaml`

- [ ] **Step 1: Define collections** (schemas per `CLAUDE.md` §7)

```ts
// src/content.config.ts — blog + projects collections
import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.date(),
    tags: z.array(z.string()).default([]),
    description: z.string(),
    thumbnail: z.string().optional(),
    updated: z.date().optional(),
  }),
});

const projects = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    stack: z.array(z.string()).default([]),
    repo: z.string().url().optional(),
    demo: z.string().url().optional(),
    blog: z.string().optional(),
    thumbnail: z.string(),
    status: z.enum(["deployed", "archived", "in-training"]).optional(),
    order: z.number().optional(),
  }),
});

export const collections = { blog, projects };
```

- [ ] **Step 2: Create `publications.yaml`** — 3 placeholder entries, each with
  `title, authors, venue, year, link?, pdf?, note?` (author name **Bharateesha LVN**).

**✅ Phase 0 checkpoint:** `npm run build` exits 0 (empty site OK). Review.

---

## Phase 1 — Layout & Chrome

### Task 1.1: `Header.astro`
**Files:** Create: `src/components/Header.astro`
- [ ] Render name → links home; nav items mapped from `site.sections`; social icons
  (github, linkedin, email) from `site`. Mono font, `--text-faint` at rest →
  `--text` on hover. Active-page link uses `--accent`.

### Task 1.2: `Footer.astro`
**Files:** Create: `src/components/Footer.astro`
- [ ] Socials + ONE static quip `loss still decreasing` (`--text-ghost`, mono). No rotation.

### Task 1.3: `Base.astro` layout
**Files:** Create: `src/layouts/Base.astro`
- [ ] Props: `title`, `description`, `ogImage?`. `<head>` with charset/viewport, title,
  meta description, OG/Twitter tags, favicon, global.css import. Body = `<Header/>` +
  `<main>` + `<slot/>` + `<Footer/>`. **Not used on `/`.**

**✅ Phase 1 checkpoint:** temporary test page renders header/footer; `npm run dev` visual check.

---

## Phase 2 — Shared Tile

### Task 2.1: `Tile.astro` (base + per-surface extras)
**Files:** Create: `src/components/Tile.astro`
- [ ] **Step 1:** Props — `href`, `title`, `image` (ImageMetadata or string), `imageAlt`,
  plus a default `<slot/>` for the per-surface extras strip.
- [ ] **Step 2:** Layout (LinkedIn "Featured" pattern) — whole card is one `<a>`;
  image region ~70–80% of card height (`aspect-ratio`, `object-fit: cover`);
  text strip below: bold title (2-line clamp via `-webkit-line-clamp`) + `<slot/>`.
- [ ] **Step 3:** Style — `--surface` bg, `--border` border → `--accent` (border only)
  on hover; rounded; subtle. Use Astro `<Image>` for raster thumbs (optimization).
- [ ] **Step 4:** A `.tile-grid` helper class (responsive `grid`, `auto-fill minmax`).

**✅ Phase 2 checkpoint:** render 2 tiles on a scratch page; verify image-dominant layout + hover.

---

## Phase 3 — Inner Pages

### Task 3.1: `/about`
**Files:** Create: `src/pages/about.astro`, `src/components/TempSlider.astro`
- [ ] About content from `docs/decisions.md` bio; current role; education (PES University);
  skills grouped (ML / deploy / tooling — not flat); "currently learning" line; visible
  email + resume link. Body font for prose.
- [ ] `TempSlider.astro` top-right: default `0.0` = professional bio; `1.0` = playful bio
  with brief token-resample scramble on change. In-memory JS only (no storage). Only joke here.

### Task 3.2: `/projects`
**Files:** Create: `src/pages/projects.astro`
- [ ] Query `projects` collection, sort by `order`. Render `.tile-grid` of `Tile`s.
  Per-surface slot: stack line + repo/demo icons. Status chip allowed (only ML touch).
  Card links to detail page if body present, else to `repo`.

### Task 3.3: `/projects/[slug]` (detail)
**Files:** Create: `src/pages/projects/[slug].astro`
- [ ] `getStaticPaths` over projects **with body**. Render title, stack, links, thumbnail,
  rendered MD body, cross-link to related blog post (`blog` frontmatter) if present.

### Task 3.4: `/publications`
**Files:** Create: `src/pages/publications.astro`
- [ ] Load `publications.yaml` (newest first). Render `.tile-grid` of `Tile`s; each tile
  links to `pdf || link`. Slot: authors (your name **bold**) · venue · year. No jokes.

### Task 3.5: `/blog` index
**Files:** Create: `src/pages/blog/index.astro`, `src/lib/readingStats.ts`
- [ ] `readingStats.ts`: from body text compute `~N min` (≈200 wpm) and `N.Nk tokens`
  (≈ words × 1.3). Render `.tile-grid`, newest first; slot: `<month year> · ~N min ·
  N.Nk tokens` + 2–3 tags. Tag filtering deferred until >10 posts.

### Task 3.6: `/404`
**Files:** Create: `src/pages/404.astro`
- [ ] OOD misclassification: big `404` (`--error`), `input is out of distribution`,
  near-uniform probs (0.31 / 0.28 / 0.26 / 0.15), `max confidence below threshold —
  prediction rejected`, link `← return to training data`.

**✅ Phase 3 checkpoint:** all inner pages build + render with placeholder content. Review.

---

## Phase 4 — Sample Post & Reader Features

### Task 4.1: `Term.astro` popover
**Files:** Create: `src/components/Term.astro`
- [ ] Dotted-underline + ⓘ trigger; hover (desktop) / tap-toggle (mobile) opens small
  definition card; keyboard-focusable; viewport-aware positioning. Quick defs only.

### Task 4.2: Sample MDX post
**Files:** Create: `src/content/blog/hello-world.mdx`, `src/assets/thumbs/hello-world.svg`
- [ ] Frontmatter (title, date, tags, description, thumbnail SVG). Body exercises EVERY
  reader feature: code block (filename + line-highlight), inline + block KaTeX, image
  with caption, table, footnote, `<Term>` popover, external link, multiple h2/h3.
- [ ] Generate on-brand SVG thumbnail (doubles as OG image).

### Task 4.3: A second stub post
**Files:** Create: `src/content/blog/second-post.mdx` (+ SVG) — so prev/next + grid have ≥2.

**✅ Phase 4 checkpoint:** posts build; features render in dev. Review.

---

## Phase 5 — Blog Reading Chrome

### Task 5.1: `Toc.astro` minimap
**Files:** Create: `src/components/Toc.astro`
- [ ] Built from `headings` (h2/h3 only). At rest: lines only (h2 full, h3 short+indented,
  `--text-ghost`). Hover rail → text labels fade/slide in left. Scroll-spy via
  `IntersectionObserver` → active line `--accent`. Click → smooth-scroll + set
  `location.hash`. Sticky right rail ≥1000px; below that, collapsed "On this page" row.

### Task 5.2: `Post.astro` layout
**Files:** Create: `src/layouts/Post.astro`
- [ ] Reading column `--measure`, body font. Training progress bar pinned top
  (`--accent` fill, label `epoch 1/1 · NN%`, desktop only; `converged ✓` at 100%).
  Header/Footer shared. Meta line under title (`month year · ~N min · N.Nk tokens` + tags).
  Includes `<Toc>`. Prev/next links at bottom.
- [ ] Reader CSS: image click-to-zoom lightbox, styled tables (mobile scroll), footnote
  styling, heading anchors (`#` on hover, click copies link), external-link `↗` marker.

### Task 5.3: `/blog/[...slug]`
**Files:** Create: `src/pages/blog/[...slug].astro`
- [ ] `getStaticPaths` over blog (newest first). Render with `Post.astro`, pass
  `headings`, compute prev/next neighbors.

### Task 5.4: RSS feed
**Files:** Create: `src/pages/rss.xml.js`
- [ ] `@astrojs/rss` over blog collection; link in Footer/`<head>`.

**✅ Phase 5 checkpoint:** post page full experience works (TOC, progress, code, math). Review.

---

## Phase 6 — NeuralNet (home, built last, tuned by feel)

### Task 6.1: Seeded PRNG
**Files:** Create: `src/lib/seededRandom.ts`
- [ ] Deterministic PRNG (e.g. mulberry32) with fixed seed → same network every visit.

### Task 6.2: `NeuralNet.astro` construction
**Files:** Create: `src/components/NeuralNet.astro`
- [ ] JS-generated SVG: `layers = [sections.length, 7,7,7, sections.length+1]`. Inputs
  labeled from `site.sections`; outputs = sections + `/dev/null`. Seeded ~65% edge
  density + resting opacities 0.25–0.6. Brightness hierarchy per §10. Input + output
  nodes are real `<a href>` (label part of click target). `aria-label` on SVG.

### Task 6.3: Behavior — idle + hover theater
- [ ] Idle: every 3–4s faint pulse on a random valid path (~30%); outputs rest near-uniform.
- [ ] Hover (no nav): L→R cascade (~150ms/layer) via `stroke-dashoffset`; light 10–15 edges;
  prob jitter → settle; winner `--accent`. Misclassification 10–15% of hovers (never first,
  never twice in a row, never confidently wrong): amber wrong winner, backprop reverse pass,
  re-run correct. Settled winner output becomes live link, lingers 2–3s.

### Task 6.4: Behavior — click / keyboard / escape / a11y / mobile
- [ ] Click input = always-correct scenic pass ~0.7–1s → `location.assign(href)` ~250ms after
  settle. Second click / any key = skip now. `Enter` after settle accepts. Middle/Ctrl/Cmd
  click → no preventDefault (browser new tab). `prefers-reduced-motion` → static highlight +
  instant nav. Mobile: no hover theater; tap = quick pass → nav; tap targets ≥44px; SVG
  reflows for narrow viewports.

### Task 6.5: `/` home page
**Files:** Create: `src/pages/index.astro`
- [ ] No Header. Name + tagline top-left; socials in a corner; one hint line
  `hover to think · click to go` (`--text-ghost`). Embeds `<NeuralNet/>`.

**✅ Phase 6 checkpoint:** home network works across idle/hover/click/keyboard/reduced-motion/mobile.

---

## Phase 7 — Polish & Final Verification

### Task 7.1: Favicon + default OG
**Files:** Create: `public/favicon.svg`, `public/og-default.png`
- [ ] On-brand SVG favicon; default OG fallback image.

### Task 7.2: Placeholder project thumbnails
**Files:** Create: `src/assets/thumbs/sample-project.png` (or .webp)
- [ ] On-brand placeholder raster so Astro image pipeline runs end-to-end.

### Task 7.3: Final pass
- [ ] `npm run build` exits 0, no warnings about missing assets/links.
- [ ] `npm run dev` smoke test every page + responsive (desktop/mobile) + reduced-motion.
- [ ] Joke Budget audit (§9): no extra jokes leaked onto projects/publications.
- [ ] Confirm: no localStorage/sessionStorage, no `<form>`, no runtime API calls.

**✅ Phase 7 checkpoint:** ship-ready static `dist/`. Review → ZIP.

---

## Self-Review — Spec Coverage

- §3 stack → Tasks 0.1–0.2 ✓ · §4 tokens → 0.3 ✓ · §5 manifest → all files mapped ✓
- §6 site.ts SSOT → 0.2 ✓ · §7 collections → 0.4 ✓ · §8 pages → Phase 3 + 6 ✓
  (publications overridden to tiles per decisions.md §4 ✓)
- §9 Joke Budget → enforced; audit 7.3 ✓ · §10 NeuralNet → Phase 6 ✓
- §11 blog reader → Phases 4–5 ✓ · §12 quality bar → 7.3 ✓
- decisions.md: identity ✓ hybrid content ✓ shared Tile ✓ pubs tiles ✓ scenic speed ✓ no git ✓
