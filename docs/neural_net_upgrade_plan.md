# Neural Network Homepage — World-Class Upgrade

Implement Tiers 1–3 from the upgrade recommendations plus two user-requested features: terminal prompt-style inputs and mouse-reactive aliveness. The neural network should feel like a *living system* that responds to the user's presence.

## User Review Required

> [!IMPORTANT]
> This is a large refactor touching ~1200 lines across 3 files. I'll implement in 8 phases, validating after each. The dev server will hot-reload throughout. Estimated: ~45 minutes of implementation.

> [!WARNING]
> Phase 1 (terminal prompts) changes the left panel HTML structure — the `<a class="nn-btn">` elements become `<a class="nn-prompt">` with new inner markup (`> ` prefix + blinking cursor). All existing wireButtons logic is preserved but CSS classes change.

## Proposed Changes

### Phase 1 — Terminal Prompt Inputs
Replace boxy `[about]` buttons with terminal-style `> about_` prompts.

#### [MODIFY] [NeuralNet.astro](file:///c:/Users/LvnBharateesha/Documents/FFN_PW/src/components/NeuralNet.astro)
- **HTML (lines 17–29):** Replace `<a class="nn-btn">` with `<a class="nn-prompt">` containing:
  - `<span class="nn-prompt-caret">> </span>` — the terminal prefix
  - `<span class="nn-prompt-text">{s.label}</span>` — the label
  - `<span class="nn-prompt-cursor">_</span>` — blinking cursor, visible on hover
- **CSS:** Replace `.nn-btn` styles with `.nn-prompt` styles — monospace, no border, no background, just text with a blinking cursor animation on hover. Active/clicked state shows a typing animation.
- **JS wireButtons:** Update selector from `.nn-btn` to `.nn-prompt`. Add hover listener that adds `.nn-prompt--active` class (shows cursor blinking).

---

### Phase 2 — Mouse-Reactive Aliveness
The network and elements respond to cursor proximity.

#### [MODIFY] [NeuralNet.astro](file:///c:/Users/LvnBharateesha/Documents/FFN_PW/src/components/NeuralNet.astro)
**Cursor proximity glow:** Track mouse position over the `.nn-center` div. In the drift animation tick, compute distance from each node's screen position to the cursor. Nodes within ~120px radius get a brightness boost:
- Closest nodes: subtle glow halo (filter: drop-shadow), opacity 1.0
- Edges connected to glowing nodes: opacity boost (+0.15)
- Effect fades smoothly with distance (no hard cutoff)

**Subtle parallax tilt:** Track cursor X/Y relative to viewport center. Apply a `transform: perspective(1200px) rotateY(Xdeg) rotateX(Ydeg)` to the `.nn-center` container where the rotation is ±1.5° max. This gives the entire network a subtle 3D depth response to cursor movement.

**Input node highlighting on prompt hover:** When hovering a terminal prompt, the corresponding input node gets a teal glow halo and gently pulses (scale oscillation via `r` attribute).

---

### Phase 3 — Cinematic Boot Sequence
Network builds itself on page load.

#### [MODIFY] [NeuralNet.astro](file:///c:/Users/LvnBharateesha/Documents/FFN_PW/src/components/NeuralNet.astro)
**Node entrance:** All nodes start with `opacity: 0` and `r: 0`. After DOMContentLoaded, animate them in layer-by-layer with 80ms stagger per layer and 30ms stagger per node within each layer. Each node scales from `r=0 → actual r` and fades from 0→1.

**Edge entrance:** All edges start with `stroke-dasharray` set to their full length and `stroke-dashoffset` equal to full length (invisible). After nodes in both endpoint layers are visible, animate `stroke-dashoffset → 0` over 300ms with easing. Creates an "ink drawing" effect.

**Panel stagger:** Left prompts and right tiles start `opacity: 0; transform: translateX(-20px)` (left) and `translateX(20px)` (right). Stagger-fade them in after the network is built, 120ms apart.

**Guide text typewriter:** The bottom text types itself character by character at 40ms per char, appearing after all panels are in.

#### [MODIFY] [index.astro](file:///c:/Users/LvnBharateesha/Documents/FFN_PW/src/pages/index.astro)
- Name and socials also participate in the entrance: fade+slide from `translateY(-10px)`.

---

### Phase 4 — Edge Pulse Particles + Node Ripples
The showstopper visual upgrade.

#### [MODIFY] [NeuralNet.astro](file:///c:/Users/LvnBharateesha/Documents/FFN_PW/src/components/NeuralNet.astro)
**Edge pulse particles:** Create a new SVG `<g class="nn-pulses">` group above edges but below nodes. During `forwardPass()`, instead of just coloring edges, spawn small SVG circles (r=2.5, with glow filter) at source node positions that animate along each edge to the target node over ~100ms. Each pulse has 2–3 trailing dots with fading opacity. Pulses are staggered 10–20ms per edge within a layer.

Implementation:
- `spawnPulse(fromNode, toNode, color, duration)` — creates the animated circle, uses `requestAnimationFrame` to interpolate position, removes from DOM when done
- Called from `fireLayer()` instead of `lightEdge()` — edges still get colored, but pulses travel on top
- Pulse group is cleared on `resetAll()`

**Node ripple:** In `flashNode()`, append a temporary SVG circle at the node position that expands from node `r` to `r*3` while fading from opacity 0.5 → 0 over 400ms. CSS animation via class addition, removed after `animationend`.

---

### Phase 5 — Glassmorphism + Visual Polish

#### [MODIFY] [NeuralNet.astro](file:///c:/Users/LvnBharateesha/Documents/FFN_PW/src/components/NeuralNet.astro)
**Glassmorphism panels:**
- `.nn-prompt`: `backdrop-filter: blur(8px); background: rgba(20,26,38,0.3)`
- `.nn-output-tile`: `backdrop-filter: blur(16px); background: rgba(5,7,12,0.5)`
- `.nn-tile-winner`: enhanced with stronger glass effect and inner glow

**Edge weight variation at rest:** In `renderNetwork()`, set `stroke-width` to `0.5 + edge.baseOpacity * 1.5` instead of flat 1.

#### [MODIFY] [index.astro](file:///c:/Users/LvnBharateesha/Documents/FFN_PW/src/pages/index.astro)
**Gradient text:** `.home-name` gets `background: linear-gradient(...)` with `background-clip: text`.

**Vignette background:** `.home-body::before` with radial gradient creating subtle center glow.

---

### Phase 6 — Animation Refinements

#### [MODIFY] [NeuralNet.astro](file:///c:/Users/LvnBharateesha/Documents/FFN_PW/src/components/NeuralNet.astro)
**Color temperature shift across layers:** In `forwardPass()`, compute a per-layer color that shifts from warm white (input) → teal → iris → bright iris (output). Pass this color to `flashNode()` and `lightEdge()` / pulse spawn.

**Staggered firing within layers:** In `fireLayer()`, add 15–20ms delay between individual nodes within a layer (top to bottom), creating a wave rather than simultaneous flash.

**Network breathing at rest:** In the drift tick, add a global sine-wave breathing factor to all edge opacities: `±0.04` with a 5s period. Subtle collective rhythm.

**Winner tile celebration:**
- Scale bounce: CSS animation `scale(1) → 1.04 → 1` over 300ms with spring easing
- Probability count-up: animate text from "0%" to final value over 400ms
- "go →" pill slides up from below with slight bounce

---

### Phase 7 — Smooth Auto-Reset

#### [MODIFY] [NeuralNet.astro](file:///c:/Users/LvnBharateesha/Documents/FFN_PW/src/components/NeuralNet.astro)
Replace abrupt `resetAll()` in `scheduleAutoReset` with a choreographed exit:
1. Winner tile glow fades over 600ms
2. Edges fade back to rest opacity in reverse layer order (200ms per layer)
3. Vector columns fade out over 400ms
4. Caption fades
5. *Then* state variables reset to idle

---

### Phase 8 — UX Refinements

#### [MODIFY] [NeuralNet.astro](file:///c:/Users/LvnBharateesha/Documents/FFN_PW/src/components/NeuralNet.astro)
**Adaptive guide text:**
- First visit: `"← choose a section to run inference"`
- After first pass: `"click the winner tile to navigate · or pick another"`
- After 3+ interactions: hide guide text (user understands)
- Track via `sessionStorage` counter

**Keyboard shortcuts:** Wire `1/2/3/4` keys to trigger forward pass for corresponding section. Show subtle key hints `[1]` next to terminal prompts.

**Custom cursor:** `.nn-center { cursor: crosshair; }` — simple but signals interactivity.

#### [MODIFY] [constants.ts](file:///c:/Users/LvnBharateesha/Documents/FFN_PW/src/config/constants.ts)
- Add new constants: `bootStaggerMs`, `pulseSpeed`, `breathPeriod`, `parallaxMax`, `proximityRadius`

---

## Verification Plan

### Manual Verification
- Page load: watch the full boot sequence choreography
- Hover prompts: verify cursor blink, input node glow
- Move cursor over network: check proximity glow + parallax tilt
- Single-click: verify pulse particles flow through edges, ripples on nodes, color temperature shift
- Check settled state: winner celebration, tile clickability
- Wait 6s: verify smooth choreographed exit
- Press `1/2/3/4`: verify keyboard shortcuts
- Test on mobile viewport: verify graceful degradation
- Check `prefers-reduced-motion`: animations should be disabled
