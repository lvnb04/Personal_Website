# Neural-Net Homepage Showcase — Status & Remaining Work

> **For agentic workers:** This doc is a STATUS + GUARDRAILS document, not a from-scratch build plan. Most of the showcase is **already implemented in the live code** (often differently/better than the original plan). Before doing ANYTHING: read the "Already in place" and "Hard guardrails" sections. Re-applying old build steps would duplicate or break workC:\Users\LvnBharateesha\Documents\FFN_PW\docs\superpowers\plans\2026-06-19-neural-net-homepage-showcase.mding features. Only the "Remaining work" section is open.

---

## ⚠️ STATUS — read first (verified against code 2026-06-20)

**Current state:** The homepage has had a full "apple-grade" redesign pass. The neural net, its interactions, the pipeline story, particles, ripples, boot (nodes+edges), breathing, a pointer-repel field, the starfield background, the vignette, **paced boot choreography (button cascade + guide typewriter)**, and **synapse pointer cursor** are **all live and working**. The code evolved *past* the step-by-step plan — so this doc was rewritten to match reality.

**Remaining items:** ✅ **All planned work (R1 + R2) is complete.** Only the optional deferred items in R3 remain (gradient name, layer color-temp, staggered node firing, choreographed exit, keyboard 1–4). See coverage audit below.

### Hard guardrails (do NOT violate — apply to ALL future work here)
- **The neural net does not move.** `.nn-center` is `position:fixed`, screen-centered, size `var(--nn-net-w)` with `aspect-ratio:900/620`. Do **not** change its position, centering, or anchoring.
- **Do not touch sizes.** Frozen: `--nn-net-w` (`min(84rem, 100vw - 28rem)`), `--nn-vec-edge`, the `900×620` viewBox, node radii (7/6/4), `layersDesktop` `[4,7,10,7,5]`, all font sizes, fixed offsets, gaps. No resizing, no relayout.
- **Additive only.** New motion must animate `opacity` / `transform: translate` and **settle back to the exact rest state** — never alter resting geometry. (The winner "pop" is a ±3px `translateX` nudge, not a scale, on purpose — keep it that way.)
- **Keep the click model + the verbatim guide line** `click once to see the magic · double-click to miss it`. No storage (CLAUDE.md §12).
- **Seed is the logo:** never reseed (`NEURAL_NET.seed = 20260618`).
- Everything stays in the three files: [`NeuralNet.astro`](../../../src/components/NeuralNet.astro), [`AmbientNet.astro`](../../../src/components/AmbientNet.astro), [`index.astro`](../../../src/pages/index.astro), with dials in [`constants.ts`](../../../src/config/constants.ts).

### Already in place — DO NOT rebuild or "re-apply the plan" (would damage working code)
| Feature | Where it lives |
|---|---|
| Perf: cached `node.el` / `edge.el`; drift uses cached refs (no per-frame `querySelector`) | NeuralNet.astro `renderNetwork` (l.479,497), `startDrift` (l.520) |
| Seeded full-mesh net + ambient drift + idle pulse | `buildModel` (l.131), `startDrift`, `runIdlePulse` (l.1100) |
| Sparse winning sub-path (deterministic) | `computeSubPath` (l.194) |
| Full-mesh flood + **brighter sub-path** overlay | `forwardPass` (l.765) |
| **Edge pulse particles** on the sub-path (+trail) | `spawnPulse` (l.718), pulse layer `MODEL.pulseG` (l.503) |
| **Node ripple** on fire (JS-driven sonar ring) | `spawnRipple` (l.683), called from `flashNode` |
| **Winner-tile celebration** (±3px nudge + `go →`) | `.nn-tile-winner` / `@keyframes nn-tile-pop` (l.1626) |
| **Boot: nodes fade+scale-up layer-by-layer, edges ink in** | `runBoot` (l.1218), `skipBoot` (l.1285) |
| Name/socials one-time entrance | index.astro `@keyframes home-in` (l.104) |
| **Pipeline labels + explicit `argmax → /section`** | `showInputVec`/`transformInputVecToEmbedding` (l.382,395), captions (l.995,1020) |
| Input/output vectors: chars→token ids→embedding→logits→softmax (real math, agrees with tiles) | l.241–427, `settleSoftmax` (l.832) |
| Misclassification + amber backprop + green re-run | `runClickPass` (l.957–1002), `runBackprop` (l.885) |
| **Network breathing** at rest (idle-only brightness swell) | `startDrift` breath block (l.557–583) |
| **Pointer-repel field** (cursor pushes nearby nodes away) | `startDrift` field block (l.532), `wireField` (l.1318) |
| Edge **weight variation** at rest (stroke-width from seeded opacity) | `renderNetwork` (l.472) |
| Selected-input highlight + dim others | `setSelectedInput` (l.621), `.nn-btn-selected/-dimmed` (l.1432) |
| Click model: 1st click runs pass · 2nd click same section navigates · switch restarts · Enter accepts | `wireButtons` (l.1143), Enter handler (l.1193) |
| **Starfield** background (parallax depth) on pitch-black + center-clean mask | AmbientNet `variant="stars"` (l.62), index.astro (l.27) |
| **Vignette** seating the scene | index.astro `.home-vignette` (l.70) |
| Boxless typographic nav with accent-rule hover (replaced the old buttons) | `.nn-btn` (l.1388) |
| Reduced-motion + tab-visibility handling across all the above | throughout (`reduced` checks, `visibilitychange`) |

---

## Coverage audit — every homepage item from both upgrade docs

`docs/neural_net_upgrades.md` (#1–19) + `docs/neural_net_upgrade_plan.md` (terminal prompts, mouse-reactive).

| # | Upgrade | Status | Note |
|---|---|---|---|
| 1 | Cinematic boot sequence | ✅ Done | Paced phase-by-phase choreography: name → nodes layer-by-layer → edges by target layer → breathing on → button cascade → guide typewriter. `skipBoot` snaps everything to finished. |
| 2 | Edge pulse particles | ✅ Done | On sub-path only (legible + cheap). |
| 3 | Glassmorphism panels | ⛔ Excluded / N/A | Panels are now boxless typographic — no surfaces to frost. |
| 4 | Node activation ripple | ✅ Done | |
| 5 | Hover preview connection | ➖ Superseded | Click model; feedback comes from the pointer-repel field + selected-input highlight. |
| 6 | Gradient text identity | ⏸ Deferred | Name uses the display font in solid color; optional later. |
| 7 | Network breathing at rest | ✅ Done | Idle-only swell; never competes with firing. |
| 8 | Layer color-temperature shift | ⏸ Deferred | Optional; flood is single-hue. Borderline on technical accuracy. |
| 9 | Staggered node firing within layers | ⏸ Deferred | Current pass fires a whole layer at one instant *by design* (clearly-stepped wave). |
| 10 | Winner-tile celebration | ✅ Done | ±3px nudge (not scale → respects "no size changes"). |
| 11 | Smarter/adaptive guide text | ⛔ Excluded | Needs storage (banned) + you want the FOMO line kept verbatim. |
| 12 | Custom cursor | ✅ Done | Synapse pointer: arrow silhouette drawn from two thin dendrite lines converging at a glowing node tip. Over interactive targets the synapse fires (lines brighten, node pulses). Desktop-only, gated behind `(hover: hover)` + not `prefers-reduced-motion`. |
| 13 | Vignette background | ✅ Done | `home-vignette`. |
| 14 | Smooth choreographed auto-reset exit | ⏸ Deferred | Reset uses 0.4–0.5s transitions; the staggered reverse-layer fade-out isn't built. Optional polish. |
| 15 | Keyboard shortcuts 1–4 | ⏸ Deferred | Only `Enter`-to-accept exists today. Easy add if wanted. |
| 16 | Mobile swipe between sections | ⛔ Excluded | Conflicts with scroll / undiscoverable. |
| 17 | Edge weight variation at rest | ✅ Done | |
| 18 | Ambient sound (opt-in) | ⛔ Parked | Tier-4 extra; not core. |
| 19 | WebGL port | ⛔ Excluded | Overkill; perf solved via cached refs. |
| — | Terminal prompt inputs (`> about_`) | ⏸ Superseded | Nav became boxless typographic w/ accent-rule hover — a cleaner direction. Revisit only if you want the terminal look. |
| — | Mouse-reactive: proximity glow | ✅ Done (as repel) | Became a pointer-repel field (nodes pushed from cursor). |
| — | Mouse-reactive: parallax tilt | ⛔ Excluded | Gimmicky; fights "clean at a glance". |

**Flag (no action unless you want it):** the guide line says "double-click to miss it", but the live mechanic is *second-click-on-the-same-section navigates* (there's no double-click handler). Kept verbatim per your FOMO preference — just noting the copy/mechanic mismatch.

---

## Completed work

### ✅ Task R1: Boot — paced, watchable choreography (gaps between phases) + button cascade + typewriter

**Problem with the current boot:** it's too fast and the steps **overlap** — `runBoot` deliberately starts edges at `bootLayerStaggerMs * 2` (while nodes are still appearing, "one continuous build"), the name/socials fade in instantly in parallel, and **breathing starts at page load**. The user can't actually *watch the network come alive* stage by stage.

**Goal:** Re-pace the boot into **distinct, sequenced phases with a deliberate pause between each**, so the build reads as a live sequence:

> **A.** name + socials fade in → *pause* → **B.** nodes materialize layer by layer → *pause* → **C.** edges weave in (only AFTER nodes finish) → *pause* → **D.** breathing visibly "switches on" → **E.** nav buttons rise up one-by-one → **F.** guide line types itself.

The whole thing is longer than today but every step is interruptible — any click calls `skipBoot()` and snaps to the finished state (never trap the user).

**Files:**
- Modify: `src/components/NeuralNet.astro` — `runBoot` (l.1218), `skipBoot` (l.1285), the breathing condition in `startDrift` (l.561)
- Modify: `src/config/constants.ts` — `NEURAL_NET`
- Modify: `src/pages/index.astro` — delay the `home-in` name/socials so they land *first*, before the net builds

**Interfaces:**
- Consumes: `bootDone` flag, `EASE` const (already in `runBoot`), `C.*` dials.
- Produces: a new module-level `bootBreathReady` flag (default `false`) that gates breathing until phase D; set `true` in phase D and in `skipBoot`.

- [x] **Step 1: Add / retune pacing dials**

In `constants.ts` `NEURAL_NET`. Bump the existing boot dials slower and add the phase-gap + new-phase dials. Replace the boot block:

```js
    bootStartDelayMs: 450,       // let name/socials land first, THEN the net starts building
    bootLayerStaggerMs: 260,     // delay between layers materializing (was 120 — slower, watchable)
    bootNodeStaggerMs: 55,       // delay between nodes within a layer (was 35)
    bootNodeFadeMs: 460,         // per-node fade+scale duration
    bootPhaseGapMs: 520,         // deliberate PAUSE inserted between each boot phase
    bootEdgeStaggerMs: 110,      // edges weave in group-by-group (per target layer)
    bootEdgeDrawMs: 560,         // edge stroke-draw duration
    bootBtnRiseMs: 340,          // per-button fade-up duration
    bootBtnStaggerMs: 210,       // gap between buttons; ≈ riseMs so the next begins as the prior lands
    guideTypeMs: 36,             // ms per character of the guide-line typewriter
```

(`bootLayerStaggerMs` and `bootNodeStaggerMs` already exist — change their values; the rest are new. Remove the now-unused overlap behavior in code, Step 2.)

- [x] **Step 2: Rewrite `runBoot` as explicit phases with a running time cursor**

Replace the body of `runBoot` (keep the `reduced`/`!MODEL` early-return and the `EASE` const). The key changes vs. today: a `t` cursor that advances phase-by-phase with `bootPhaseGapMs` pauses; **edges start only after all nodes are in** (no more `bootLayerStaggerMs*2` overlap); edges **weave by target layer**; breathing is switched on as its own beat; then buttons, then guide.

```js
  let bootDone = false;
  let bootBreathReady = false;   // breathing stays OFF until phase D
  function runBoot() {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !MODEL) { bootDone = true; bootBreathReady = true; return; }
    const { nodes, edges, layers } = MODEL;
    const EASE = "cubic-bezier(0.22, 0.61, 0.36, 1)";

    // hide everything to start
    nodes.forEach(n => {
      if (!n.el) return;
      n.el.style.transition = "none";
      n.el.style.transformBox = "fill-box";
      n.el.style.transformOrigin = "center";
      n.el.style.opacity = "0";
      n.el.style.transform = "scale(0.2)";
    });
    edges.forEach(e => {
      if (!e.el) return;
      const len = Math.hypot(nodes[e.toIdx].bx - nodes[e.fromIdx].bx, nodes[e.toIdx].by - nodes[e.fromIdx].by);
      e.el.style.strokeDasharray = len;
      e.el.style.strokeDashoffset = len;
      e.el.style.transition = "none";
      e.el.style.opacity = "0";
    });
    const btns = [...document.querySelectorAll(".nn-btn")];
    btns.forEach(b => { b.style.transition = "none"; b.style.opacity = "0"; b.style.transform = "translateY(12px)"; });
    const guide = document.querySelector(".nn-guide");
    let guideFull = "";
    if (guide) { guideFull = guide.textContent.replace(/\s+/g, " ").trim(); guide.textContent = ""; }

    let t = C.bootStartDelayMs;   // PHASE A (name/socials) is handled by CSS delay in index.astro; net waits.

    // ── PHASE B: nodes materialize, layer by layer ───────────────────────────
    for (let li = 0; li < layers.length; li++) {
      const layerNodes = nodes.filter(n => n.layer === li);
      layerNodes.forEach((n, i) => {
        setTimeout(() => {
          if (bootDone) return;
          n.el.style.transition = `opacity ${C.bootNodeFadeMs}ms ${EASE}, transform ${C.bootNodeFadeMs}ms ${EASE}`;
          n.el.style.opacity = (n.type === "input" || n.type === "output") ? "1" : "0.8";
          n.el.style.transform = "scale(1)";
        }, t + i * C.bootNodeStaggerMs);
      });
      t += C.bootLayerStaggerMs;
    }
    t += C.bootNodeFadeMs + C.bootPhaseGapMs;   // wait for last nodes to finish, THEN pause

    // ── PHASE C: edges weave in, grouped by target layer (only after nodes) ──
    for (let li = 1; li < layers.length; li++) {
      const layerEdges = edges.filter(e => nodes[e.toIdx].layer === li);
      setTimeout(() => {
        if (bootDone) return;
        layerEdges.forEach(e => {
          if (!e.el) return;
          e.el.style.transition = `stroke-dashoffset ${C.bootEdgeDrawMs}ms ${EASE}, opacity 300ms ease`;
          e.el.style.opacity = "1";
          e.el.style.strokeDashoffset = "0";
        });
      }, t + (li - 1) * C.bootEdgeStaggerMs);
    }
    t += (layers.length - 1) * C.bootEdgeStaggerMs + C.bootEdgeDrawMs + C.bootPhaseGapMs;

    // ── PHASE D: breathing switches on (its own beat) ────────────────────────
    setTimeout(() => { if (!bootDone) bootBreathReady = true; }, t);

    // ── PHASE E: nav buttons rise up, one after another ──────────────────────
    btns.forEach((b, i) => {
      setTimeout(() => {
        if (bootDone) return;
        b.style.transition = `opacity ${C.bootBtnRiseMs}ms ${EASE}, transform ${C.bootBtnRiseMs}ms ${EASE}`;
        b.style.opacity = "";
        b.style.transform = "translateY(0)";
        b.addEventListener("transitionend", () => { b.style.transform = ""; b.style.transition = ""; }, { once: true });
      }, t + i * C.bootBtnStaggerMs);
    });
    t += btns.length * C.bootBtnStaggerMs + C.bootPhaseGapMs;

    // ── PHASE F: guide line types itself ─────────────────────────────────────
    if (guide) {
      guideFull.split("").forEach((ch, i) => {
        setTimeout(() => { if (!bootDone) guide.textContent += ch; }, t + i * C.guideTypeMs);
      });
    }

    // ── cleanup: clear inline node/edge styles so drift/reset behave normally ─
    const total = t + guideFull.length * C.guideTypeMs + 60;
    setTimeout(() => {
      if (bootDone) return;
      nodes.forEach(n => { if (n.el) { n.el.style.transition = ""; n.el.style.transform = ""; } });
      edges.forEach(e => { if (e.el) { e.el.style.strokeDasharray = ""; e.el.style.strokeDashoffset = ""; e.el.style.transition = ""; e.el.style.opacity = ""; } });
      bootDone = true;
    }, total);
  }
```

- [x] **Step 3: Gate breathing on `bootBreathReady`**

In `startDrift`, the breathing condition is currently `const breathe = !driftReduced && hoverState === "idle" && !isCommitting;` (l.561). Add the boot gate so breathing can't start until phase D:

```js
      const breathe = bootBreathReady && !driftReduced && hoverState === "idle" && !isCommitting;
```

- [x] **Step 4: `skipBoot` finalizes everything (nodes, edges, breathing, buttons, guide)**

Replace `skipBoot` so any click mid-boot snaps to the finished state — nothing left half-built:

```js
  function skipBoot() {
    if (bootDone) return;
    bootDone = true;
    bootBreathReady = true;
    if (MODEL) {
      MODEL.nodes.forEach(n => { if (n.el) { n.el.style.transition = ""; n.el.style.transform = ""; n.el.style.opacity = (n.type === "input" || n.type === "output") ? "1" : "0.8"; } });
      MODEL.edges.forEach(e => { if (e.el) { e.el.style.transition = ""; e.el.style.strokeDasharray = ""; e.el.style.strokeDashoffset = ""; e.el.style.opacity = ""; } });
    }
    document.querySelectorAll(".nn-btn").forEach(b => { b.style.transition = ""; b.style.transform = ""; b.style.opacity = ""; });
    const guide = document.querySelector(".nn-guide");
    if (guide && !guide.textContent.trim()) {
      guide.textContent = "click once to see the magic · double-click to miss it";
    }
  }
```

- [x] **Step 5: Make name/socials land FIRST (phase A)**

In `index.astro` `<style>`, the name/socials already animate via `home-in`. Keep them as phase A but ensure they complete before the net starts (`bootStartDelayMs` = 450). They currently start at 0ms / 120ms — that's fine (they finish ~600ms, net begins building at 450ms with the first layer fade — slight, intentional overlap so it feels continuous, not stop-start). No change required unless you want a harder gap; if so, leave name as-is and it already reads as "name first".

- [x] **Step 6: Manual verification**

`npm run dev`, hard-reload `/`. Expected, as a watchable sequence with clear beats: name + socials in → **pause** → nodes appear layer by layer (slow enough to follow) → **pause** → edges weave in front-to-back (only after nodes are all in) → **pause** → the net visibly starts *breathing* → nav buttons rise up one-by-one → guide line types itself. Total ≈ 4–6s but every beat is distinct. **Click anywhere mid-boot** → instantly snaps to finished + the pass runs (no waiting, no half-built state, breathing on). **Reduced-motion** → everything static, breathing off-then-on not applicable (just present), guide text intact. At 375/768/1280px: net unmoved, no size change, no horizontal scroll.

If any beat feels too slow/fast, tune the single relevant dial (`bootLayerStaggerMs`, `bootEdgeStaggerMs`, or `bootPhaseGapMs`) — don't touch geometry.

- [ ] **Step 7: Commit** *(pending user action)*

```bash
git add src/components/NeuralNet.astro src/config/constants.ts src/pages/index.astro
git commit -m "feat(home/boot): paced phase-by-phase choreography + button cascade + typewriter"
```

### ✅ Task R2: Custom "synapse pointer" cursor (homepage only)

**Goal (updated):** Replace the native pointer on the homepage with an on-brand cursor: an **arrow silhouette drawn from two thin converging SVG lines (dendrites)** meeting at a **glowing node tip (the synapse)**. Over interactive targets the synapse **fires** — lines brighten, node pulses larger then settles (matching the network's own node-fire animation). Desktop only; falls back to the native cursor on touch/reduced-motion.

**Files:**
- Modify: `src/pages/index.astro` (markup + style + a small script block)

**Guardrail compliance:** the cursor is a `position:fixed; pointer-events:none; z-index:50` overlay — it never affects layout, sizes, or the net's position. Gated behind `(hover: hover)` AND not `prefers-reduced-motion` (so touch/keyboard/reduced-motion users keep the normal cursor and are never left with `cursor:none`).

**Interfaces:** self-contained in index.astro; no shared functions.

- [x] **Step 1: Markup** — SVG synapse arrow inside `<body class="home-body">`, after the socials `<nav>`.

- [x] **Step 2: Styles** — synapse pointer styles with dendrite lines, node glow, and fired state (lines brighten + node pulse animation).

- [x] **Step 3: Script** — simplified (no rAF loop needed since SVG snaps directly to pointer position).

- [x] **Step 4: Manual verification**

Verified on `npm run dev`, `/` on desktop. The native arrow is replaced by a synapse pointer (two thin iris-colored dendrite lines forming an arrow shape with a glowing node at the tip). Over nav words / social icons → synapse fires (lines brighten, node pulses). Pointer off-window → cursor fades, returns on re-enter. Touch / reduced-motion → normal system cursor. Net/layout/sizes unchanged.

- [ ] **Step 5: Commit** *(pending user action)*

```bash
git add src/pages/index.astro
git commit -m "feat(home): synapse pointer cursor with interactive fire state"
```

### Task R3 (optional, only if you ask): pick from the Deferred list

Any of #6 gradient name, #8 layer color-temp, #9 staggered node firing, #14 choreographed exit, #15 keyboard 1–4. Each is independent and small. Not started; do **only on request**.

---

## Self-Review

- **Status accuracy:** updated 2026-06-20 after R1 + R2 completion. ✓
- **No dangerous re-apply:** old "build X" code for already-done features was removed; they're now listed as "do not rebuild" with code locations. ✓
- **Guardrails:** net-position-frozen and no-size-changes stated up top and respected in both R1 (translate/opacity only) and R2 (fixed overlay, pointer-events:none). ✓
- **Coverage:** all 19 doc items + 2 user-requested features have an explicit disposition. R1 + R2 both ✅. ✓
- **Remaining work:** only optional deferred items (R3) remain — gradient name, layer color-temp, staggered firing, choreographed exit, keyboard 1–4. None started; do only on request. ✓
