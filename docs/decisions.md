# Decisions & Spec Deltas

This file records decisions made during brainstorming that **clarify or override**
`CLAUDE.md`. `CLAUDE.md` remains the canonical spec; where this file conflicts with
it, **this file wins** (it reflects later user instructions).

_Date: 2026-06-15_

---

## 1. Identity (`src/config/site.ts`)

| Field | Value |
|---|---|
| name | `Bharateesha LVN` |
| tagline | `CS undergrad @ PES University · building ML systems & the infra that runs them` |
| email | `bharateesha.lvn@gmail.com` |
| github | `https://github.com/lvnb04` |
| linkedin | `https://www.linkedin.com/in/lvnb` |

Sections (drive nav order **and** neural-net input nodes): `about`, `projects`,
`publications`, `blog`.

**About-page intro text** (first-person, used verbatim-ish on `/about`):

> Computer Science undergrad at PES University with a focus on Machine Learning and AI.
>
> I like building software that solves real problems — whether that means designing
> intelligent systems that can reason and act on their own, or engineering the backend
> infrastructure that makes them work at scale. I care as much about writing clean,
> reliable code as I do about the models running on top of it.
>
> Always learning and building. Open to connecting with like-minded professionals and
> enthusiasts.

---

## 2. Content mode — **Hybrid**

- Real identity values wired into `site.ts` now (above).
- Projects, blog posts, and publications ship with **realistic placeholder bodies +
  dummy data**; author swaps real content later by editing content files / `site.ts`.
- Site builds and runs fully with placeholders.

---

## 3. Shared `Tile.astro` — **base + per-surface extras** (OVERRIDES CLAUDE.md §8)

Reference: LinkedIn "Featured" card layout. Large image on top (~70–80% of card
height), text strip below with bold title + small meta line. Whole card is one `<a>`.

One component, used on **projects, publications, AND blog** (CLAUDE.md originally
scoped Tile to blog + projects only, and made publications a list — both overridden).

| Surface | Image | Title | Extras below title |
|---|---|---|---|
| Projects | real PNG screenshot (placeholder for now) | project title (2-line clamp) | stack line + repo/demo icons |
| Blog | SVG thumbnail (doubles as OG image) | post title | `date · ~N min · N.Nk tokens` + 2–3 tags |
| Publications | figure/plot from paper (placeholder for now) | paper title | authors (your name bolded) · venue · year |

Implementation: a base Tile (image + title slot) with optional named slots / props
for the per-surface extras. Hover = border → accent only.

---

## 3b. Projects — **every tile links to its GitHub repo** (OVERRIDES CLAUDE.md §7)

No project detail pages. Every project tile links directly to its `repo` (opens in a new
tab). The collection's `blog`/body-based detail-page behaviour from §7 is dropped. Project
`.md` files are frontmatter-only (title, summary, stack, repo, status, order, thumbnail?).

## 4. Publications — **tile grid, link out** (OVERRIDES CLAUDE.md §8)

- Rendered as a Tile grid (not an academic list).
- Each tile links **straight to PDF / DOI / arXiv** — no per-paper detail page
  (keeps CLAUDE.md's "no per-paper page" rule).
- Data source unchanged: `src/data/publications.yaml`.

---

## 5. Neural-net click-pass speed — **Scenic ~0.7–1s**

- Default ~0.7–1s click-pass that plays the cascade.
- Instant-skip escape hatch (second click / any key) preserved.
- Hard ceiling 1.2s (CLAUDE.md §10).

---

## 6. Tooling

- **No git** — plain files, transfer via ZIP. No repo init, no commits.
- Everything else per `CLAUDE.md` §3 stack (Astro static, MDX, Expressive Code,
  remark-math + rehype-katex, plain CSS).

---

## 7. Guiding principle — built to last, content grows not structure

This is a **permanent personal site** — the author's standing proof of credibility and
work across every career stage and company. Implications that govern every decision:

- **Sections are stable; content accretes.** The page set rarely changes; what grows is
  the *content within* (more projects, posts, publications). Adding content must be a
  **single-file operation** (drop a `.md`/`.mdx`/yaml entry), never a code change.
- **Data-driven, never hardcoded.** No content baked into components. Components render
  whatever the collections / `site.ts` / `publications.yaml` give them. The grids scale
  from 1 to 100 items with no edits.
- **Reuse-first components.** Shared, well-bounded, prop-driven components — `Tile` is the
  flagship (one component, three surfaces via slots). Prefer composing existing components
  over new bespoke ones. Each component: one clear purpose, clean prop interface.
- **`site.ts` stays the single hinge.** Adding/reordering a section = one edit there,
  reflected in nav AND the neural net automatically (already per `CLAUDE.md` §6).
- **YAGNI still applies.** "Future-proof" means clean seams and no hardcoding — NOT
  speculative features. Build what the spec needs, but build it so extension is cheap.

### Constants / config separation (production-grade)

- **`src/config/constants.ts`** — the ONE file holding raw primitive values (identity,
  social URLs, section list, footer quip, deploy URL, and later: animation tunables).
  Imports nothing from the app.
- **`src/config/site.ts`** — imports `constants.ts`, assembles the typed `site` object.
  This is the single import point for the app: `import { site } from "@config/site"`.
- **Components/pages NEVER hardcode values** — always read from `site` (or a future typed
  config). Changing a value = edit `constants.ts` only.
- **Path aliases** (`@config`, `@components`, `@layouts`, `@lib`, `@styles`, `@data`,
  `@assets`) set in `tsconfig.json` for clean imports.
- Tunable magic numbers introduced later (neural-net timings, edge density, reading wpm)
  go into `constants.ts` as named exports — not inline literals.

---

## 7b. Visual identity (OVERRIDES CLAUDE.md §4 token values)

The original §4 palette (GitHub-dark `#0d1117` + green `#58d6a3`) was replaced — it matched
a known AI-generated default (near-black + acid-green). New identity (canonical token list
now lives in `global.css`):

- **Palette "Ink & Iris"** — near-black cool ink + periwinkle/iris accent. Neutrals tinted
  toward the ink (no dead greys). Elevation ladder `--void < --bg < --surface < --surface-2`.
  Key tokens: `--void #020308`, `--bg #05070c` (near-black), `--surface #141a26`,
  `--accent #7c8cff` (iris), `--accent-bright #a8b1ff`, `--accent-glow` (iris bloom).
  Amber kept as backprop signal; error tuned cooler to `#e2566b`.
- **Hover vs active are different colors (deliberate):** `--hover #5fd3c4` (teal) for
  interactive hover (tile borders/title + teal bloom); the iris `--accent` is reserved for
  genuinely active/selected states (neural-net winner, active TOC line, links). Keeping the
  accent scarce makes it meaningful.
- **Typography** — self-hosted (`@fontsource`) **IBM Plex Sans** (body) + **IBM Plex Mono**
  (headings/nav/meta/code). Engineering pedigree, cohesive, deliberately not Inter.
- **Shape scale** — `--r-sm 6px` (controls), `--r-md 10px` (cards), `--r-lg 14px` (panels);
  hairline 1px borders.
- **Signature** — `.dot-field` latent-space dot-grid (iris dots, masked to fade at edges)
  behind hero areas. On-brand ML texture; kept whisper-quiet. `.dot-field--faint` variant.

## 9. Ambient background — page coverage (OVERRIDES CLAUDE.md implied sitewide)

`AmbientNet.astro` (drifting iris node-graph) is **NOT on all pages**. Placement:

| Page | Ambient bg | Reason |
|---|---|---|
| `/about` | ✅ | Moderate content, clear anchors, personality fits |
| `/projects` | ✅ | Card grid has strong visual anchors, bg stays peripheral |
| `/publications` | ✅ | Same |
| `/blog` index | ❌ | Functional scanning page — user is finding a post, not being charmed |
| `/blog/[slug]` | ❌ | Long-form reading — moving bg causes eye fatigue |
| `/` home | N/A | NeuralNet IS the background |
| `/404` | ✅ (default) | Fine for a rare page |

Wired via `ambientNet` prop on `Base.astro` (default `true`). Opt-out pages pass `ambientNet={false}`.
Tuned values: nodes `rgba(124,140,255,0.35)` radius `1.8`, edges max opacity `0.13`.

---

## 8. Unchanged from CLAUDE.md (still in force)

- Dark mode only, no theme toggle.
- No localStorage / sessionStorage; in-memory JS state only.
- Static output only; no backend.
- Joke Budget (§9) enforced — subtlety via scarcity.
- Build order: scaffold → inner pages + Tile → sample post → Toc → NeuralNet last.
