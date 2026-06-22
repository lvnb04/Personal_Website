# Progress Tracker

Live status of the build. See `docs/plan.md` for task detail, `docs/decisions.md` for
decisions, `CLAUDE.md` for the canonical spec.

**Legend:** ⬜ not started · 🟦 in progress · ✅ done · ⛔ blocked

_Last updated: 2026-06-18 — Phase 6 in progress. Tasks 1–3 complete (seededRandom.ts + NEURAL_NET constants, NeuralNet.astro full component, index.astro full-bleed home). All interactions (click, idle, hover theater, backprop, mobile) are implemented in NeuralNet.astro. Next: 6-T9 verify all states in browser._

## ▶ RESUME HERE

### Everything done so far — clean build, 8 pages

**Phases 0–5 complete** (scaffold, layout, tiles, inner pages, sample posts, reading chrome).

**Blog v2 complete:**
- ✅ Minimap TOC — fixed rail, rAF scroll-spy, sliding active highlight (position-based, no IO flicker), click smooth-centers panel, mobile dropdown variant
- ✅ Centered reading column (~43rem), IBM Plex Sans 18px/1.7lh typography
- ✅ Calm centered post header (title → meta → tags → hr → body)
- ✅ Reading settings kebab (text size A−/reset/A+, focus mode), focus mode (f/Esc)
- ✅ Progress bar (epoch K/N · NN% → converged ✓), back-to-top, lightbox, heading anchors, table scroll-wrap, external ↗
- ✅ `Sidenote.astro` — float-right ≥1200px, inline tap-expand below; global MDX component
- ✅ `Term.astro` — centered below word, near-black bg, mono font; global MDX component
- ✅ `Term` + `Sidenote` auto-available in every post via `[...slug].astro` components prop — zero per-post imports
- ✅ Keyboard nav — `j`/`k` sections, `t` top, `f`/Esc focus mode
- ✅ Footnote hover previews — frosted popover on `[n]` ref

**Ambient background:**
- ✅ `AmbientNet.astro` — drifting iris node-graph; nodes `0.35` opacity / `1.8`r, edges `0.13` max opacity
- ✅ Wired into `Base.astro` (`ambientNet={true}` default) — about, projects, publications get it automatically
- ✅ Excluded from blog index (`ambientNet={false}`) and blog post detail (`Post.astro` opts out) — functional/reading pages stay clean

### 🟦 Phase 6 — NeuralNet home (IN PROGRESS)

**Full implementation plan:** `docs/superpowers/plans/2026-06-18-neuralnet-home.md` (9 tasks, detailed steps + code)
**Design spec:** `docs/superpowers/specs/2026-06-18-neuralnet-home-design.md`
**Key spec refs:** `CLAUDE.md §10` (canonical home behaviour), `§13` (mobile), `decisions.md §5` (scenic ~0.8s click-pass)

Build order: static SVG → click/navigate → idle → hover → backprop → mobile → index.astro → verify

| Task | Status | What it does |
|---|---|---|
| 6-T1: `seededRandom.ts` + `NEURAL_NET` constants | ✅ | Mulberry32 PRNG + all tunables in `constants.ts` |
| 6-T2: `NeuralNet.astro` — static SVG render | ✅ | Config-driven SVG, `<a>` nodes, seeded edges, brightness hierarchy, a11y baseline |
| 6-T3: `index.astro` — full-bleed home | ✅ | Replace temp placeholder; net full-bleed + name/tagline/socials/hint overlaid |
| 6-T4: Click-pass + navigate | ✅ | Click input → ~0.8s forward cascade → navigate; escape hatches; Ctrl+click passthrough |
| 6-T5: Idle pulse | ✅ | Faint pulse every 3–4s on random path; pauses on tab-hidden |
| 6-T6: Hover theater | ✅ | L→R cascade + softmax jitter + settled output glows + `Enter` navigates |
| 6-T7: Backprop misclassification | ✅ | ~12% hovers → amber wrong settle → backprop → correct re-run; guards: not first, not twice |
| 6-T8: Mobile vertical layout | ✅ | `layers=[4,5,5,5]`, vertical, labels below, result pill, tap→navigate, `matchMedia` rebuild |
| 6-T9: Verify + joke-budget audit | ⬜ | All states tested; §13 hard reqs; 375/768/1280 check; clean build |

**Critical implementation notes for the next session:**
- `NeuralNet.astro` is **fully self-contained** — all SVG build JS + styles in one file (`CLAUDE.md §12`)
- The PRNG is **inlined** in the `<script>` (same Mulberry32 logic as `seededRandom.ts`) — the `.ts` file is the source of truth but can't be imported in an inline `<script>`
- `pendingNavHref` is declared **only in Task 4** (click handler) — do NOT add it in Task 2
- Mobile detection: `matchMedia("(max-width: 767px)")` for layout rebuild; `matchMedia("(hover: hover)")` for hover-theater guard — never `ontouchstart`
- All CSS tokens reference `global.css` custom properties: `--edge`, `--surface`, `--border-bright`, `--text-dim`, `--text-ghost`, `--accent`, `--accent-tint`, `--accent-glow`, `--amber`, `--font-mono`
- `npm run build` clean = success (ignore the cosmetic Node 24 libuv teardown line)

### Then: Phase 7 (favicon, OG, thumbnails, smoke test) + mobile pass (§13 header nav, 375/768/1280 sweep)
### DEFERRED: View Transitions + prefetch sitewide (wrap inline scripts in `astro:page-load`)

Build command: `npm run build` — Node 24 prints a cosmetic libuv teardown line after "Complete!", ignore it.

---

## Phases

| # | Phase | Status | Notes |
|---|---|---|---|
| 0 | Scaffold & Foundation | ✅ | package.json, astro config, site.ts(+constants), tokens, collections |
| 1 | Layout & Chrome | ✅ | Header, Footer, Base layout (+ shared Socials, temp index) |
| 2 | Shared Tile | ✅ | image 70–80% + title + per-surface slot; .tile-grid; placeholder fallback |
| 3 | Inner Pages | ✅ | about, projects(→repo), publications, blog index, 404 (detail pages dropped) |
| 4 | Sample Post & Reader Features | ✅ | Term.astro; voice-agent-anatomy.mdx (real Notion draft, all features); hello-world.mdx (2nd) |
| 5 | Blog Reading Chrome | ✅ | Toc, Post layout (progress bar, lightbox, anchors, table-wrap), [...slug], RSS |
| 6 | NeuralNet (home) | ⬜ | built last, tuned by feel |
| 7 | Polish & Final Verification | ⬜ | favicon/OG, placeholder thumbs, full smoke test |

---

## Task checklist

### Phase 0 — Scaffold & Foundation
- [x] 0.1 Astro project files (package.json, astro.config.mjs, tsconfig.json) + `npm install`
- [x] 0.2 `site.ts` SSOT + `constants.ts` separation + path aliases
- [x] 0.3 `global.css` design tokens + base styles + KaTeX import
- [x] 0.4 Content collections + `publications.yaml`
- [x] ✅ Phase 0 checkpoint: build completes, `dist/` produced (Node 24 teardown crash cosmetic)

### Phase 1 — Layout & Chrome
- [x] 1.1 `Header.astro` (+ shared `Socials.astro`)
- [x] 1.2 `Footer.astro`
- [x] 1.3 `Base.astro` (SEO/OG, head slot)
- [x] temp `index.astro` placeholder (replaced in Phase 6)
- [x] ✅ Phase 1 checkpoint: builds clean, 1 page

### Phase 2 — Shared Tile
- [x] 2.1 `Tile.astro` (base + per-surface extras) + `.tile-grid` + placeholder fallback
- [x] ✅ Phase 2 checkpoint: builds; tile preview added to temp home

### Phase 3 — Inner Pages
- [x] 3.1 `/about` + `TempSlider.astro` (Ink&Iris polish, AmbientNet bg, two-stop temp slider, all copy in constants)
- [x] 3.2 `/projects` (every tile → GitHub repo; stack · status chip · repo↗)
- [x] ~~3.3 `/projects/[slug]`~~ — dropped (tiles link straight to repo)
- [x] 3.4 `/publications` (tiles → pdf/link; authors bolded; YAML via ?raw + js-yaml)
- [x] 3.5 `/blog` index + `readingStats.ts` (+ placeholder hello-world.mdx)
- [x] 3.6 `/404` (OOD misclassification, high-entropy probs)
- [x] ✅ Phase 3 checkpoint: 6 pages build clean

### Phase 4 — Sample Post & Reader Features
- [x] 4.1 `Term.astro` (tap-toggle, viewport-aware popover)
- [x] 4.2 `voice-agent-anatomy.mdx` — real Notion draft; exercises code/KaTeX/table/footnotes/`<Term>`/figure
- [x] 4.3 second post = existing `hello-world.mdx`
- [x] assets: `src/assets/thumbs/voice-agent.svg` + `src/assets/figures/voice-pipeline.svg`

### Phase 5 — Blog Reading Chrome
- [x] 5.1 `Toc.astro` minimap (rail + mobile variants, IO scroll-spy)
- [x] 5.2 `Post.astro` (progress bar `epoch 1/1 · NN%`→`converged ✓`, meta line, prev/next, reader CSS: lightbox, heading anchors, table wrap, external `↗`, scroll-margin)
- [x] 5.3 `/blog/[...slug].astro` (getStaticPaths, headings, prev/next via Post)
- [x] 5.4 `rss.xml.js`
- [x] ✅ Phase 5 checkpoint: build clean, 8 pages (incl. both posts + rss + optimized figure)

### Phase 6 — NeuralNet (home)
- [x] 6-T1 `seededRandom.ts` + `NEURAL_NET` constants block in `constants.ts`
- [x] 6-T2 `NeuralNet.astro` — static seeded SVG (nodes, edges, `<a>` links, a11y baseline)
- [x] 6-T3 `index.astro` — full-bleed home (net + overlaid chrome, no Header)
- [x] 6-T4 Click-pass + navigate + escape hatches (critical path — site functional after this)
- [x] 6-T5 Idle pulse (faint, tab-hidden pause)
- [x] 6-T6 Hover theater (cascade + softmax jitter + settled output glow + Enter nav)
- [x] 6-T7 Backprop misclassification (~12% hovers, guards enforced, amber+backprop+rerun)
- [x] 6-T8 Mobile vertical layout (layers=[4,5,5,5], result pill, tap→navigate, matchMedia rebuild)
- [ ] 6-T9 Verify + joke-budget audit (all states, 375/768/1280, clean build)
- [ ] ✅ Phase 6 checkpoint: all states/interactions verified, clean build

### Phase 7 — Polish & Final Verification
- [ ] 7.1 favicon + default OG
- [ ] 7.2 placeholder project thumbnail(s)
- [ ] 7.3 final build + full smoke test + joke-budget audit + constraints check
- [ ] ✅ Phase 7 checkpoint: ship-ready `dist/`

---

## Mobile (CLAUDE.md §13) — cross-cutting, build mobile-first
- [ ] Header nav: replace wrap-to-two-rows with hamburger / horizontal-scroll (≤767px)
- [ ] Temp slider: full-width + ≥44px thumb on mobile
- [ ] Home neural net: vertical mobile layout (`layers=[4,5,5,5]`, single readout) — Phase 6
- [ ] Blog TOC: swap rail → "On this page ↓" below 1000px — Phase 5
- [ ] Verification: screenshots at 375/768/1280 (Playwright MCP not yet connected — confirm or manual)

## Open items / waiting on author
- [ ] Real project thumbnail PNGs → drop into `src/assets/thumbs/`
- [ ] Real blog post content (replacing placeholders)
- [ ] Real publication entries → `src/data/publications.yaml`
- [ ] Resume file/link for About page
- [ ] Confirm/replace drafted tagline in `site.ts`
- [ ] Set real deploy URL in `astro.config.mjs` (`site:`)
