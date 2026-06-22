# Homepage — Apple-Grade Redesign Spec
status 

Step 6 — Boot choreography: center-out rewrite of runBoot

Step 7 — Forward-pass refinements + choreographed exit

Step 8 — Copy: new hint line, joke-budget curation

Step 9 — Finish & QA: contrast, 60fps, no CLS, responsive 375/768/1280, favicon/OG

> Supersedes `neural_net_upgrades.md` for the homepage. That file's ideas are folded in
> here with explicit status tags. This is the authoritative, implementation-ready plan.
>
> **Scope:** homepage only (`src/pages/index.astro`, `src/components/NeuralNet.astro`,
> `src/components/AmbientNet.astro`, `src/styles/global.css`, `src/config/constants.ts`).
> The design *system* (type, spacing, motion, color tokens) is established here and rolled
> out to the inner pages in a later pass.

**Status legend:** ✅ done · ♻️ rework existing · ✨ new · ❌ discarded (with reason)

---

## 0. Guiding principle & locked decisions

**Principle:** *Calm still frame. Magic on demand.* At rest the page reads as a confident,
almost-minimal product surface — pitch-black space, small drifting stars, a quietly legible
network, hero identity, slim typographic nav. ALL the ML machinery (vectors, softmax readout,
loss caption, glows) appears only on interaction. Authority comes from **restraint, type
discipline, spacing, and one coherent motion language** — never from stacked glow.

**Locked from the design discussion:**
1. **Homepage first**, system rolls out later.
2. **Background = small, moving stars on pitch-black** with parallax depth. The second
   drifting node-graph (`AmbientNet`) is removed from the homepage — two node-graphs read as
   noise, not depth.
3. **Resting network must be clearly legible** as a network (no glow, just contrast).
4. **Nav buttons → typographic** (no bordered boxes — that was the biggest "toy" tell).
5. **Input/output vectors + result readout = compact and symmetric** around the net. The
   network is the centerpiece; side elements must not eat horizontal space.
6. **Boot is choreographed**: space → network from center → edges form → nav staggers in →
   hint line draws attention.
7. **Dark mode only** (unchanged base fact).

---

## 1. Design-system foundation  ✨  → `src/styles/global.css`

The current type sizes (`0.72`, `0.68`, `0.58`, `0.55`, `0.44rem`) are arbitrary and far too
small — the single biggest remaining amateur tell after the boxed buttons. Replace with a
real scale and use it everywhere.

### 1a. Type scale (modular, ratio ≈1.25)
```css
--t-2xs: 0.6875rem;  /* 11px — smallest allowed (vector caps labels). NEVER go below this. */
--t-xs:  0.75rem;    /* 12px — meta, captions */
--t-sm:  0.875rem;   /* 14px — mono labels, hint */
--t-base:1rem;       /* 16px — body / tagline base */
--t-md:  1.25rem;    /* 20px — nav items */
--t-lg:  1.5rem;     /* 24px — tagline (desktop) */
--t-xl:  2rem;       /* 32px — hero name (desktop) */
```
- Hero name: `var(--t-xl)` weight 600, letter-spacing `0.01em`, mono.
- Tagline: clamp to `var(--t-base)`→`var(--t-lg)`, color `--text-faint`, max-width `24rem`.
- **Show the tagline on the homepage** — it is the strongest credibility line and is currently
  absent. (`TAGLINE` already exists in `constants.ts`.)
- Tabular figures for all numeric readouts: `font-variant-numeric: tabular-nums`.

### 1b. Spacing scale
```css
--sp-1:4px; --sp-2:8px; --sp-3:12px; --sp-4:16px;
--sp-6:24px; --sp-8:32px; --sp-12:48px; --sp-16:64px;
```
Replace ad-hoc `rem` paddings/gaps with these. Add a safe-area inset token for fixed corners:
`--edge-pad: clamp(1.5rem, 4vw, 3.5rem)` and use `env(safe-area-inset-*)` on mobile.

### 1c. Motion language (one curve, a few durations)
```css
--ease:        cubic-bezier(.22,.61,.36,1);   /* the ONLY easing for entrances/transitions */
--ease-spring: cubic-bezier(.2,.9,.3,1.2);    /* micro-interactions only (hover/press pop) */
--dur-fast:150ms; --dur:250ms; --dur-slow:450ms;
```
Rule: everything **decelerates into place** (ease-out). No `linear`, no default easing anywhere.

### 1d. Color discipline
- **Accent (`--accent`) is punctuation, not paint.** It appears at the moment of meaning (the
  winner, the active path), not on every edge or as ambient decoration.
- **One bloom, not four.** Active states get a single soft glow, not 3–4 stacked box-shadows.
- Keep the elevation ladder (`--void < --bg < --surface < --surface-2`) and use it consistently.

---

## 2. Background — moving starfield on pitch-black  ♻️/✨  → `AmbientNet.astro` + `index.astro`

Replace the homepage backdrop. Two options for how to do it:
- **Recommended:** add a `variant="stars"` branch to `AmbientNet.astro` (keep the existing
  node-graph variant for inner pages), OR
- create a small dedicated `Starfield.astro`. Either is fine; keep it self-contained.

### Spec
- **Background colour:** darken page to near-pitch. Set `--bg: #020308` on the home body (or a
  dedicated `--bg-home`). Stars rely on contrast, so the darker the better.
- **Stars:** canvas-drawn points.
  - Count ≈ `W*H / 7000` (denser than the old node-graph, but tiny).
  - Radius `0.4–1.4px` (SMALL — big dots read as toy). Cap DPR at 2 for crispness.
  - Per-star **depth** `d ∈ [0,1]`: size, brightness, AND speed all scale with `d`.
  - Alpha `0.22 + d*0.5`, with a gentle twinkle (`±0.3` sine, slow).
  - **Parallax motion** (this is what creates depth): velocity scales with `d` — near stars
    drift faster, far stars slower. Slow overall (a slight constant drift, e.g. up-left), wrap
    at edges. NEVER fast.
  - ~12% of stars tinted iris (`rgba(168,177,255,a)`); the rest near-white. No heavy glow —
    crisp points only (drop the `shadowBlur` on most).
- **Subtle vignette** (`index.astro` overlay): `radial-gradient(120% 120% at 50% 44%, transparent 58%, rgba(0,0,0,.6) 100%)`
  to seat the scene and pull the eye to the network. (Replaces old upgrade #13's *glow* vignette
  with a *darkening* one — pitch-black wants no central glow.)
- **Perf/correctness:** pause RAF on `document.hidden`; freeze (draw one static frame) under
  `prefers-reduced-motion`; `pointer-events:none`; `aria-hidden`.
- **Aurora glow:** ❌ discarded for the homepage — conflicts with "pitch dark." (Keep the idea
  on the shelf only if the field ever looks too empty.)

---

## 3. Resting network — make it legible & alive  ♻️  → `NeuralNet.astro` CSS + `constants.ts`

The net currently dissolves at rest (edge `#3d4f6e` @ opacity 0.18–0.42 over near-black). Lift it.

### 3a. Lifted visibility (resting, NO glow)
In `.nn-root` local tokens (`NeuralNet.astro` ~L1328):
```
--edge-vis:        #5e72a2;   /* cooler + brighter than #3d4f6e — reads clearly on pitch-black */
--node-io-border:  #8497c0;   /* was #6b82a8 */
--node-h-border:   #5a6e92;   /* was #4a5a72 */
```
In `constants.ts` `NEURAL_NET`:
```
edgeOpacityMin: 0.28,   // was 0.18
edgeOpacityMax: 0.60,   // was 0.42
```
Target: a visitor instantly recognizes "that's a neural network" at rest, but it never glows.

### 3b. Edge weight variation  ✨ (old #17)
Vary `stroke-width` by seeded base opacity so the net looks like a *trained* model:
```js
"stroke-width": 0.6 + edge.baseOpacity * 1.0   // ~0.6–1.2px
```
Trivial, high texture payoff.

### 3c. Network "breathing" at rest  ✨ (old #7)
In the drift tick, add a slow collective opacity oscillation so the net feels alive, not frozen:
```js
const breath = Math.sin(t/4200 * Math.PI*2) * 0.05;   // ±0.05
edge.el.setAttribute("opacity", clamp(edge.baseOpacity + breath, 0, 1));
```
Keep amplitude small. Skip under reduced-motion.

### 3d. Idle pulse — keep ✅ (already implemented, tune brightness to new edge colours).

---

## 4. Boot choreography — center-out  ♻️ (replaces current L→R `runBoot`)

The current boot reveals nodes left-to-right then inks edges. Replace with the sequence from the
design discussion. All timings live in `constants.ts` (`NEURAL_NET.boot*`). Skippable on ANY
interaction (extend existing `skipBoot()`), and fully bypassed under `prefers-reduced-motion`.

### Sequence & timings (ms from load)
| Phase | What | Start | Detail |
|---|---|---|---|
| 1 | **Stars fade up** from pure black | 0 | ~480ms ease-out (space appears first) |
| 2 | **Nodes emerge from CENTER**, settle outward | 380 | reveal delay ∝ distance from net centroid (`spread ≈ 560`); each node fades+scales (r·0.3→1) over ~420ms and lerps position from centroid→final |
| 3 | **Edges form** between settled nodes, center-out | 920 | each edge "draws" by growing length from→to (`spread ≈ 560`, dur ≈ 400); delay ∝ midpoint distance from centroid |
| 4 | **Nav items stagger in** one-by-one | 1620 | each fades + `translateX(-10px)→0`, `110ms` apart |
| 5 | **Identity + socials** fade in | ~1420 | name/tagline `translateY`, socials fade |
| 6 | **Hint line** appears + draws attention | 2120 | fade + slide up + a single colour pulse to `--accent-bright` then settle |

Total ≈ 2.3s, skippable. Implementation notes:
- Compute centroid `(cx0,cy0)` and `maxDist` once in `buildModel()`.
- Store `revealT` per node and `drawT` per edge there.
- Easing = `1-(1-p)^3` (matches `--ease`).
- The existing cinematic boot code (`runBoot`/`skipBoot`, ~L1192) is the scaffold — rewrite the
  ordering from layer-index to distance-from-centroid, and change edge reveal from
  `stroke-dashoffset` to length-grow (or keep dashoffset; length-grow reads more "forming").

---

## 5. Navigation redesign — typographic  ♻️ (replaces `.nn-btn` boxes)

Kill the bordered/filled rounded rectangles. New nav = type + space + one precise motion.

### Spec (`.nn-left` / `.nn-btn` in `NeuralNet.astro`)
- Vertical list, mono, `var(--t-md)`, color `--text-faint`, `gap: var(--sp-6)`.
- **No border, no background, no min-width.** Width = `max-content`.
- **Hover/focus:** text → `--text`; a short accent rule draws in from the left:
  ```css
  .nn-btn::before{content:"";display:inline-block;width:0;height:1.5px;background:var(--accent);
    vertical-align:middle;transition:width var(--dur) var(--ease),margin-right var(--dur) var(--ease);}
  .nn-btn:hover::before,.nn-btn:focus-visible::before{width:1.5rem;margin-right:.65rem;}
  ```
- **Selected (clicked):** label → `--accent-bright`, the accent rule stays drawn; others dim to
  `opacity:.4` (reuse existing `nn-btn-selected` / `nn-btn-dimmed` logic, restyle).
- Keep real `<a href>` (JS-off navigation), `:focus-visible` ring, ≥44px tap target on mobile
  (pad the hit area, not the visual).
- **Alternative considered:** indexed editorial (`01 about`, `02 projects`). Slightly more ML/
  technical flavour but busier — defer unless the plain version feels too sparse.

---

## 6. Result reveal — compact, symmetric, singular  ♻️ → vectors + tiles in `NeuralNet.astro`

The payoff moment currently fires everything at once (input vec + wave + output vec + 5 bordered
tiles + caption) and the side panels eat horizontal width. Redesign for a single beautiful
moment with a slim, symmetric footprint.

### 6a. Symmetric slim vectors
- Input vector and output (probabilities) vector are **slim brackets** flanking the net,
  **equidistant from centre** (mirror around 50%). Keep them narrow (`~34–45px` columns).
- Labels min size `--t-2xs` (11px) — **no more 0.44rem (7px)**.
- Values `--t-xs`, `tabular-nums`, accent-tinted at the relevant stage.
- Keep the existing chars→token-ids→embedding / logits→probabilities staging ✅ — it's a genuine
  ML touch — just retypeset and re-space it to the new scale.

### 6b. Output readout — replace bordered tiles
The 5 bordered `.nn-output-tile` boxes (with `go →` pill) are the same "form-control" problem as
the nav. Replace with a **compact typographic readout** anchored right (mirror of the nav):
- **Winner:** `→ projects  0.84` — `--t-md`, label `--accent-bright`, prob `--accent` tabular.
  This whole line is the clickable target after settle (keeps the "scenic lane").
- **Runners-up:** one dim line, `--t-xs`, `--text-ghost`:
  `about 0.06 · papers 0.03 · blog 0.02 · /dev/null 0.06`  (keeps the `/dev/null` joke, quietly).
- The winning **output node** in the SVG glows (single soft bloom) — that's the celebration,
  not a glowing box.
- **Winner micro-celebration:** keep a restrained version of the existing pop — winner line
  fades+rises with `--ease-spring`; optional 400ms count-up on the probability. Drop the
  multi-shadow tile glow. (Folds in old #10, trimmed.)

### 6c. Choreographed exit  ✨ (old #14)
Auto-reset must fade out as deliberately as it faded in: winner glow down ~600ms, edges back to
rest opacity ~500ms, vectors/readout out ~400ms, *then* reset state. No abrupt snap. Reduce
`settledLingerMs` 6000 → ~4000.

---

## 7. Forward-pass refinements  ♻️ → `NeuralNet.astro` + `constants.ts`

- **Snappier timing (Apple is fast).** The CLAUDE.md hard ceiling is 1.2s for the visible pass.
  - `waveLayerGapMs` 300 → **~200**
  - `outputVecProbDelay` 1000 → **~550**
  - This keeps the cascade legible but removes the "waiting" feeling.
- **Staggered node firing within a layer** ✨ (old #9): 15–25ms top-to-bottom stagger inside
  `fireLayer()` so a layer *rolls* instead of flashing — more organic. Skip under reduced-motion.
- **Restrained layer colour** (modified old #8): NOT a rainbow. At most a subtle two-tone — input
  fires near-white (`--text`), everything downstream resolves to iris (`--accent`), winner peak
  `--accent-bright`. Honors color discipline (§1d). Full per-layer rainbow ❌ discarded.
- Edge pulse particles ✅ and node ripple ✅ already implemented — retune colours to match.

---

## 8. Copy & joke budget  ♻️

- **Hint line:** replace `click once to see the magic · double-click to miss it`. "see the
  magic / miss it" undercuts credibility and "miss it" is unclear. Use quiet, confident copy,
  e.g. `click a section to run inference` (mono, `--text-ghost`). Leave the double-click /
  Enter / output-click doors **undocumented** (discovered affordances delight more).
- **Curate the jokes** to the budget: keep the network (centerpiece), the `/dev/null` runner-up
  (quiet), the About temperature slider, the footer quip. Drop anything that pushes a *second*
  joke onto the homepage surface. No confidently-wrong probabilities anywhere.

---

## 9. Finish & QA (the last 5%)

- **Contrast / a11y:** verify text on pitch-black meets WCAG AA (`--text-faint`/`--text-ghost`
  on `#020308` — check ratios; lift if needed). Keyboard: nav focusable, visible ring, Enter
  accepts settled winner. `aria-hidden` on pure-decoration SVG/canvas. Real `<a>` navigation
  works JS-off.
- **60fps:** the drift loop rewrites every edge endpoint every frame; with the full mesh
  (`[4,7,10,7,5]`) that's heavy. Profile; if it janks on mid hardware, throttle drift to ~30fps
  or skip endpoint writes for off-screen/idle edges.
- **No CLS:** identity/nav/result fade or scale **in place** — never reflow each other. Reserve
  space for the vector columns so their appearance doesn't shift the net.
- **Fonts:** self-hosted already ✅ — confirm no FOUT flash (font-display).
- **Favicon + OG image:** ensure both are crafted (favicon SVG/ico; a generated OG PNG for the
  home route).
- **Responsive:** verify at 375 / 768 / 1280. Mobile keeps tap→pass→navigate; stars + boot still
  run; nav never wraps to two rows; vectors hidden on mobile (already ✅).

---

## 10. Explicitly discarded (do NOT build)

| Idea (source) | Why discarded |
|---|---|
| Gradient-clip text on the name (old #6) | `background-clip:text` gradients read cheap and date badly; confident solid `--text` is more timeless. |
| Glassmorphism on nav/tiles (old #3) | Nav/result are now typographic — no panels to frost. Reserve blur only for a genuinely floating panel if one ever appears. |
| Per-layer rainbow colour temperature (old #8) | Violates "accent as punctuation." Replaced by restrained two-tone (§7). |
| Custom cursor (old #12) | Gimmicky; risks feeling like a toy — the opposite of the goal. |
| Visible `[1][2][3]` keyboard hint labels (old #15) | Adds clutter. Optional: wire the keys silently as a power-user affordance, but don't label them. |
| Ambient sound (old #18) | Out of scope; auto-anything-audio hurts credibility. Far-future opt-in at most. |
| WebGL port (old #19) | Only if SVG perf proves insufficient after §9 profiling. Not now. |
| Aurora glow background | Conflicts with locked "pitch-dark + stars." |

---

## 11. Implementation order (next session)

1. **Design tokens** (§1) — type scale, spacing, motion, into `global.css`. Foundation for all else.
2. **Starfield background** (§2) — replace `AmbientNet` on home; darken `--bg`; vignette.
3. **Resting network legibility** (§3) — edge colour/opacity/weight, breathing.
4. **Typographic nav** (§5) — kill `.nn-btn` boxes.
5. **Compact symmetric vectors + readout** (§6a/6b) — kill bordered tiles.
6. **Boot choreography** (§4) — center-out rewrite of `runBoot`.
7. **Forward-pass refinements + exit** (§7, §6c) — staggered firing, snappier timings, choreographed reset.
8. **Copy** (§8).
9. **Finish & QA** (§9).

Each step is independently shippable and visually verifiable. Steps 1–5 transform the *still
frame* (biggest perceived jump); 6–7 transform the *motion*; 8–9 are polish.

---

## 12. Definition of done (homepage)

- At rest: pitch-black, small drifting parallax stars, a clearly-legible non-glowing network,
  hero name + tagline, slim typographic nav, one quiet hint line. Reads as a calm product page.
- On load: the choreographed boot (§4) plays once, skippable, reduced-motion-safe.
- On click: a fast (<1.2s), legible forward pass resolves to a single, beautiful result — compact
  symmetric vectors + a typographic readout — then exits gracefully.
- Every size/weight comes from the type scale; every transition uses `--ease`; accent appears
  only at moments of meaning.
- 60fps, no CLS, AA contrast, keyboard + JS-off navigable, responsive at 375/768/1280.
- Nothing on screen reads as a default form control or a stacked-glow "effect."
