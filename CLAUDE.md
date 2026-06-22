# CLAUDE.md — Personal Portfolio Site

Guiding doc for building this site with Claude Code. Read this fully before generating files.

---

## 1. What this is

A personal portfolio + tech blog for an AI/ML engineer (and AIML student). Priorities, in order:

1. **Blog** — the main motive. Hosts technical posts. Author wants full autonomy over structure (no platform lock-in).
2. **Credibility** — proof of work as an AIML engineer (projects + publications).
3. **Personality** — a subtle, tasteful ML theme. Never braggy. See the **Joke Budget** (§9).

The site must read as *clean and professional at a glance*, with ML personality rewarding those who look closer.

---

## 2. CONSTRAINTS (read first)

- **Transfer is via ZIP**, then `npm install` on the author's machine. So **binary assets ARE allowed** (this relaxes an earlier text-only rule).
  - **Project thumbnails → real PNG/WebP** screenshots of actual artifacts (plots, attention maps, confusion matrices, demo frames). This is the strongest credibility signal — use real images, optimized by Astro's image pipeline.
  - **Blog thumbnails → default to SVG** (on-brand, zero-maintenance, generated from a small template); PNG allowed if a specific post warrants it. The thumbnail doubles as the post's OG image.
  - **Fonts** → local font file or Google Fonts link, either is fine. **Favicon** → `.ico` or SVG. **OG images** → generated PNGs are fine.
  - `node_modules` is NOT shipped in the zip — regenerate via `npm install` from `package.json`.
- **Static only.** No server, no DB, no runtime API calls required for the site to work. Pure static output.
- **No browser storage.** Do NOT use localStorage / sessionStorage. Use in-memory JS state only.
- **Dark mode by default** and only — no theme toggle in v1.
- Keep components reasonably self-contained and the file tree clean (good practice, no longer a transfer necessity).

---

## 3. Stack

- **Astro** (static output) — pages, layouts, components in `.astro`; posts in `.mdx`.
- **Vanilla JS + SVG** for the neural network. No React, no animation library. The net is one self-contained component.
- **Expressive Code** (`astro-expressive-code`) — code blocks: highlighting, copy button, filename + line-highlight.
- **remark-math + rehype-katex** — LaTeX rendering.
- **MDX** — enabled so posts can use the `<Term>` popover component.
- **Plain CSS** with custom properties in `global.css`. No Tailwind.
- **Hosting:** Cloudflare Pages or Vercel (static). Out of scope for the build.

Run commands: `npm install`, `npm run dev` (local preview), `npm run build` (static output to `dist/`).

---

## 4. Design tokens (define in global.css as :root custom properties)

Dark theme, GitHub-dark-adjacent. One accent (green). Mono for all meta/accents.

```
--bg:            #0d1117   /* page background */
--surface:       #161b22   /* cards, nodes, code blocks */
--border:        #21262d   /* subtle borders */
--border-bright: #30363d   /* hover borders, edge mesh top end */
--edge:          #1f2733   /* neural-net edge mesh (very dim) */
--text:          #e6edf3   /* primary text */
--text-dim:      #c9d1d9   /* secondary */
--text-faint:    #7d8590   /* meta, captions */
--text-ghost:    #484f58   /* hints, timestamps, TOC lines at rest */
--accent:        #58d6a3   /* THE accent: active path, winner, active TOC line */
--accent-dark:   #1d9e75   /* accent borders */
--accent-tint:   #0f2a1f   /* active node fill */
--amber:         #e3b341   /* backprop / "wrong answer" state ONLY */
--error:         #e24b4a   /* 404 number only */
--font-mono:     ui-monospace, "JetBrains Mono", "Fira Code", monospace
--font-body:     system-ui, -apple-system, "Segoe UI", sans-serif
--measure:       46rem     /* blog reading column max-width (~700px) */
```

Mono for: nav, metadata, hints, node labels, captions, TOC labels, the 404. Body for: blog prose, About paragraphs. Headings may be mono for the techy feel — keep consistent.

---

## 5. File manifest (keep current)

```
package.json
astro.config.mjs
CLAUDE.md                          (this file)
public/                            favicon, OG images, static assets (binaries OK)
src/config/site.ts                 SINGLE SOURCE OF TRUTH — see §6
src/styles/global.css
src/content.config.ts              collections: blog, projects
src/components/Header.astro
src/components/Footer.astro
src/components/NeuralNet.astro      the big one — see §10
src/components/Tile.astro          shared by blog + projects
src/components/Term.astro          MDX hover-definition popover
src/components/TempSlider.astro     About-page "temperature" easter egg
src/components/Toc.astro            minimap table of contents — see §11
src/layouts/Base.astro             header + footer + <slot/>; NOT used on index
src/layouts/Post.astro             blog post chrome: progress bar, Toc, prev/next
src/pages/index.astro              home — neural net, no Header
src/pages/about.astro
src/pages/projects.astro
src/pages/publications.astro
src/pages/blog/index.astro
src/pages/blog/[...slug].astro
src/pages/404.astro
src/content/blog/hello-world.mdx   sample post exercising every feature
src/content/projects/sample-project.md
src/assets/thumbs/                 project PNGs + blog SVGs
src/data/publications.yaml         3 papers as data (no per-paper page)
```

---

## 6. Single source of truth — `src/config/site.ts`

Defines site sections ONCE. Both the Header nav and the NeuralNet input nodes import from it. Adding a section here makes it appear in nav AND as a network node — no other edits.

```ts
export const site = {
  name: "Your Name",
  tagline: "AIML Engineer · I build and write about ML systems",
  email: "you@example.com",
  github: "https://github.com/you",
  linkedin: "https://linkedin.com/in/you",
  // order drives nav order AND neural-net input node order
  sections: [
    { id: "about",        label: "about",        href: "/about" },
    { id: "projects",     label: "projects",     href: "/projects" },
    { id: "publications", label: "publications", href: "/publications" },
    { id: "blog",         label: "blog",         href: "/blog" },
  ],
};
```

NeuralNet inputs = `site.sections` (4). Outputs = `site.sections` + a `/dev/null` joke class (5). A 5th section later grows the net automatically.

---

## 7. Content collections (`src/content.config.ts`)

**blog** (`.mdx`): `title`, `date`, `tags: string[]`, `description`, `thumbnail?`, `updated?`. Newest-first on index.

**projects** (`.md`): `title`, `summary`, `stack: string[]`, `repo?`, `demo?`, `blog?` (related-post slug), `thumbnail` (real PNG), `status?` ("deployed" | "archived" | "in-training"), `order?`. Body present → detail page `/projects/[slug]`; no body → tile links to `repo`.

**publications** — NOT a collection; data file `src/data/publications.yaml`, array of:
`title`, `authors`, `venue`, `year`, `link?`, `pdf?`, `note?`. `/publications` maps over it.

**Adding content later (document for the author):**
- New post → one `.mdx` in `src/content/blog/`.
- New project → one `.md` in `src/content/projects/` + thumbnail PNG.
- New paper → one entry in `publications.yaml`.
- New section → one entry in `site.ts` + its page.

---

## 8. Page specs (brief; blog post detail in §11)

**`/` Home** — see §10. No Header chrome; the network IS the nav. Name + tagline top-left, social icons in a corner, one hint line.

**`/about`** — first-person intro (3–5 sentences); current role; education; skills grouped (ML / deploy / tooling — not a flat list); a "currently learning" line; contact (visible email + resume link). ML touch = **TempSlider** (§9) top-right. No `about.md` header line — slider is the only joke here.

**`/projects`** — Tile grid, curated 4–6. Tile: real PNG thumbnail, title (2-line clamp), stack line, repo/demo icons. Whole card is one `<a>`. Hover = border → accent only. Cross-link related blog post. **Zero ML jokes** (status chips at most).

**`/publications`** — clean academic list (not tiles). Each: title, authors (your name bolded), venue + year, links (PDF / DOI / arXiv). Newest first. No jokes — pure credibility.

**`/blog` index** — Tile grid, newest first. Tile: SVG thumbnail, title, `<month year> · ~N min · N.Nk tokens`, 2–3 tags. Tag filtering only once >10 posts.

**`/blog/[slug]`** — full reading experience, see §11.

**`/404`** — OOD misclassification. Big `404`, `input is out of distribution`, **near-uniform** probabilities (e.g. 0.31 / 0.28 / 0.26 / 0.15 — high entropy), `max confidence below threshold — prediction rejected`, link home `← return to training data`.

**Site-wide** — Header (name→home, nav from `site.ts`, socials) on inner pages, never on `/`. Footer: socials + ONE static quip (`loss still decreasing`). RSS feed. OG tags + description per page/post.

---

## 9. Joke Budget (enforce — subtlety comes from scarcity)

| Surface | Touch | Weight |
|---|---|---|
| Home | Neural-net nav + softmax + idle pulse + backprop-on-wrong | Heavy (centerpiece) |
| About | `temperature` slider (default 0.0 = professional; 1.0 = playful bio, brief token-resample scramble on change) | Interactive, opt-in |
| Blog index | `~N min · N.Nk tokens` on tiles | Featherweight |
| Blog post | Training-style progress bar; `converged ✓` at end (label desktop-only) | Light, functional |
| Projects | Nothing (status chips at most) | Zero, on purpose |
| Publications | Nothing | Zero |
| 404 | OOD misclassification | Medium, hidden |
| Footer | One static quip | Featherweight |

Anti-patterns — do NOT: ML metaphors on nav labels; rename dates→timestamps / tags→labels; multiple jokes on one surface; rotating/random footer quips; confidently-wrong probabilities anywhere (a wrong model is *unsure*).

---

## 10. HOME PAGE BEHAVIOUR SPEC (canonical — build to this exactly)

### Network construction
- Config-driven, generated by JS — never hand-author SVG nodes/edges.
- `layers = [inputs, 7, 7, 7, outputs]` where inputs = `site.sections.length` (4), outputs = inputs + 1 = 5.
- Inputs labeled from `site.sections`; outputs = same + `/dev/null`.
- **Seeded** PRNG (fixed seed) picks which edges exist (~65% density) and each edge's resting opacity (0.25–0.6). Same network every visit — it's the author's logo.
- Brightness hierarchy (critical on dark bg): edges = dim texture (`--edge`, 1px, varied opacity) < hidden nodes (`--surface` fill, `--text-faint` border) < input labels (`--text-dim`, brightest static). Active = `--accent` only. Hidden nodes may shrink mid-net (r 7→5→7) for depth.
- Input AND output nodes are real `<a href>` elements. Input label is part of the click target (not just the circle).

### Speed / fast-path hierarchy (IMPORTANT — never trap a user)
1. **Deep link / bookmark / search result** → the network never loads; straight to content. Most repeat traffic.
2. **Click an input** → quick correct pass, then auto-navigate. The everyday fast lane. Hint says `click to go`.
3. **Mid-animation impatience** → a second click OR any key skips instantly to the page.
4. **Keyboard** → `Enter` after a settled pass accepts the prediction and navigates.
- **Click-pass duration is a tunable dial.** Default ~0.7–1s (plays the cascade, more charm) with the instant-skip escape hatch. Snappier ~300ms option (winning path flashes only) if speed is prioritized — decide by feel once running. Hard ceiling 1.2s; if exceeded, cut steps, never make the user wait.

### States & interactions
**Idle:** every 3–4s a faint slow pulse travels a random valid path at ~30% brightness; outputs rest near-uniform (`0.33/0.33/0.33/0.01`). No misclassification ever in idle.

**Hover an input = theater, NO navigation** (hover is not intent):
1. Forward pass cascades L→R, ~150ms per layer gap (~800ms total). Edges "draw" via `stroke-dashoffset` (dasharray = path length, offset length→0). Nodes flash as they fire.
2. Light only ~10–15 edges: 2–3 branching paths toward the winner, incl. one main path. Never all edges.
3. Output probabilities jitter through 3–4 values, then settle; winner → `--accent` (e.g. 0.93).
4. **Misclassification — ~10–15% of hovers (HOVER ONLY):** lands on WRONG output in `--amber`, LOW confidence (~0.55–0.70, correct class runner-up). Caption `loss: 0.87 — backpropagating...`. Signal runs BACKWARD (reversed draw, amber); 2–3 edge opacities shift. Forward pass auto-re-runs faster, lands CORRECT (green); caption `loss: 0.04 ✓`. Never on FIRST hover; never twice in a row; never confidently wrong.
5. After a correct settle, winning OUTPUT becomes a live link: border glows, label gains quiet `open ↵`. Settled state LINGERS ~2–3s after cursor leaves (so user can travel to click it), then fades to idle.

**Click an input = commit + navigate:** faster clean pass, ALWAYS correct (no misclassification on click — never tax intent), winner locks green, auto-navigate ~250ms after settle.

**Three doors:** click input (fast) · hover then click lit output (scenic) · `Enter` after settle (accept prediction).

**Escape hatches:** second click / any key during pass → navigate now. Middle/Ctrl/Cmd-click → do NOT preventDefault; browser opens new tab; no animation. Implementation: intercept plain left-click only → preventDefault, animate, `location.assign(href)`.

**Reduced motion:** `prefers-reduced-motion: reduce` → no animations; hover statically highlights path; click navigates instantly.

**Accessibility:** nodes keyboard-focusable, visible focus ring, real `<a>` navigation works with JS off; `aria-label` describes the network.

**Mobile (no hover):** hover-theater (incl. backprop) does not exist. Tap = quick pass → navigate; second tap = skip. Idle pulse still runs. Resize/restructure SVG for narrow viewports so labels never collide; tap targets ≥ 44px.

**Hint line:** `hover to think · click to go` (mono, `--text-ghost`). Output-click and `Enter` doors left undocumented — discovered affordances delight more than announced ones.

---

## 11. BLOG POST BEHAVIOUR SPEC (`/blog/[slug]` — build to this)

### Minimap table of contents (`Toc.astro`) — Notion-style
- **Built automatically** from the post's `h2` + `h3` headings (Astro provides `headings`). Author never maintains it. Ignore `h4`+ (keeps it clean).
- **At rest:** thin horizontal LINES only — no text. `h2` = full-width line, `h3` = shorter + indented. Color `--text-ghost`/`--text-faint`. Reads as texture, not a panel.
- **On hover** over the rail: heading TEXT labels fade/slide in (~150ms) to the LEFT of the lines, indented by level. Cursor leaves → collapse back to lines.
- **Scroll-spy:** the line of the section currently in view turns `--accent`, others dim. Use `IntersectionObserver` (no scroll-event jank).
- **Click** a line or its revealed label → smooth-scroll to that heading AND set `location.hash` (`#section-slug`) so readers can copy-link to a section.
- **Keyboard:** labels are focusable links; focus reveals the panel; Enter jumps.
- **Position:** sticky right rail on viewports ≥ ~1000px. Below that: rail is hidden, replaced by a collapsed "On this page" row under the title that taps open into a list. Same data, different shape.

### Reading chrome
- Reading column width `--measure` (~700px). Body font `--font-body`.
- **Training-style progress bar** pinned at top: thin `--accent` fill, label `epoch 1/1 · NN%` (desktop only). At 100% → `converged ✓`.
- Header (name→home, nav, socials) shared site-wide. Prev/next post links at the bottom.
- Post meta line under title: `<month year> · ~N min · N.Nk tokens` + tags.

### Reader features — DAY ONE
- Minimap TOC (above) + reading progress bar.
- **Code blocks** (Expressive Code): syntax highlight, copy button, filename label, line-highlighting, horizontal scroll for long lines.
- **LaTeX** (KaTeX): inline + block.
- **Images:** captions (from alt/title) + click-to-zoom lightbox. Astro-optimized.
- **Tables:** styled; horizontal scroll on mobile, never break layout.
- **Footnotes:** native Markdown, with back-reference link.
- **`<Term>` popovers:** dotted-underline + ⓘ; hover (desktop) / tap-toggle (mobile) opens a small definition card; keyboard-focusable; viewport-aware. QUICK definitions only — anything longer is a link or footnote.
- **Heading anchors:** `#` appears on hover; clicking copies the section link.
- **External links:** small `↗` marker via `a[href^="http"]::after`.
- Fully responsive; all interactive bits keyboard-navigable; `prefers-reduced-motion` respected.

### Reader features — LATER (do not build yet)
- Callout/aside blocks (Note / Warning).
- Series box for multi-part posts (build at first series).
- Related posts at bottom (only past ~8 posts).
- Giscus comments (only once there's traffic — empty comment sections look worse than none).
- Git-derived "last updated" date.

### Reader features — NEVER
- View counters, like buttons, social share buttons, newsletter popups. A quiet RSS link is the only "subscribe."

---

## 12. Quality bar / do-NOT list

- Binaries are fine now (zip transfer), but optimize images and keep `public/` tidy.
- No localStorage/sessionStorage. No `<form>` posting anywhere.
- Don't gate navigation behind animation — animation is decoration ON TOP of real `<a>` links.
- Don't over-format prose pages; let whitespace carry the clean, confident feel.
- Don't exceed the Joke Budget (§9).
- Keep `NeuralNet.astro` self-contained (its JS + styles can live in the one file).
- Comment the top of each file with its path/purpose.
- Build order: scaffold + `site.ts` + `global.css` + collections → inner pages + Tile → sample post exercising every feature → `Toc.astro` → `NeuralNet.astro` last (most fun to tune by feel).

---

## 13. MOBILE RESPONSIVENESS SPEC

### Detection methods — use each only for its designated purpose
- **Layout/visual** → CSS `min-width` media queries. Mobile-first (base = narrow, add desktop via `min-width`).
- **JS behaviour (network config, TOC shape)** → `window.matchMedia("(max-width: 767px)")` with a `change` listener for tablet rotation.
- **Hover vs tap (network interaction only)** → `window.matchMedia("(hover: hover)")`. Never use `ontouchstart`.
- **Never:** user-agent sniffing, server-side device detection (Astro is static).

Breakpoints: mobile base ≤767px · tablet 768px · desktop 1024px.

### Homepage neural net — mobile
- Vertical top-to-bottom layout. NOT a CSS rotation of the desktop SVG.
- Mobile config: `layers = [4, 5, 5, 5]`, `direction = "vertical"`, `outputDisplay = "single"`.
- Inputs: horizontal row at top, labels below each node, "publications" → "papers" for width.
- Output: single result readout pill at bottom (`→ projects · 0.93`). No full softmax row.
- Interaction: tap = quick pass → navigate. No hover-theater, no backprop on mobile. Second tap = skip.
- Tap targets ≥44px (circle + label + padding). Idle pulse travels downward.
- Add `change` listener on `matchMedia("(max-width: 767px)")` → `rebuildNetwork()` on resize.

### Universal hard requirements (every page)
- Viewport meta tag: `<meta name="viewport" content="width=device-width, initial-scale=1">`.
- Zero horizontal scroll — verify `body.scrollWidth === window.innerWidth` at 375px.
- Reading column: `max-width: min(var(--measure), 100% - 2rem)`.
- Touch targets ≥44px everywhere.
- Code blocks and tables: `overflow-x: auto` on their containers — never push page wide.
- Images: `max-width: 100%; height: auto`.
- Tile grids: `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))` — auto-collapses.
- Blog TOC: below 1000px replace rail entirely with collapsed "On this page ↓" row.
- Progress bar label: hidden on mobile, bar itself stays.
- Term popovers: tap-to-toggle, viewport-aware positioning.
- Nav: never wraps to two rows on mobile.

### Verification (run after each page)
Playwright MCP screenshots at 375px, 768px, 1280px. Check: no label collision, no overflow, no horizontal scroll, tap targets viable. Homepage: verify four labels fit at 375px and result readout is visible.
