# NeuralNet Home — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the NeuralNet home page — a seeded, config-driven SVG neural network that acts as the site's primary nav, with full interaction states (click, idle, hover theater, backprop misclassification) and a separate vertical mobile layout.

**Architecture:** A single self-contained `NeuralNet.astro` component holds all SVG-building logic, animation JS, and scoped styles. A tiny `seededRandom.ts` utility in `src/lib/` provides a deterministic PRNG. The home `index.astro` wraps the component in a full-bleed layout with overlaid chrome (name, tagline, socials, hint).

**Tech Stack:** Astro (static, no framework components), vanilla JS (ES2020), inline SVG, CSS custom properties from `global.css`, IBM Plex Mono for labels.

## Global Constraints

- No localStorage/sessionStorage — in-memory JS state only.
- No Tailwind, no React, no animation library — vanilla JS + plain CSS only.
- Dark mode only — all colors from `--` CSS custom properties defined in `global.css`.
- SVG renderer (not canvas) — required for real `<a href>` nodes, `stroke-dashoffset`, keyboard focus.
- All tunables in `NEURAL_NET` block in `src/config/constants.ts` — zero inline magic numbers.
- `NeuralNet.astro` is self-contained per `CLAUDE.md §12` — no external JS modules except `seededRandom.ts`.
- Import values only from `@config/site` (never hardcode identity or section data).
- Joke budget: home carries the centerpiece only (net + softmax + idle + backprop). No extra jokes on this page.
- `npm run build` must produce a clean `dist/` (ignore the cosmetic Node 24 libuv teardown line after "Complete!").
- No git — this project transfers via ZIP; no commits required.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/lib/seededRandom.ts` | **Create** | Mulberry32 PRNG — `seededRandom(seed)` → `() => number` |
| `src/config/constants.ts` | **Modify** | Add `NEURAL_NET` config block |
| `src/components/NeuralNet.astro` | **Create** | Self-contained: SVG build, all animation JS, all scoped styles |
| `src/pages/index.astro` | **Replace** | Full-bleed home: NeuralNet + overlaid chrome, no Header |

---

## Task 1: Seeded PRNG + constants block

**Files:**
- Create: `src/lib/seededRandom.ts`
- Modify: `src/config/constants.ts`

**Interfaces:**
- Produces: `seededRandom(seed: number): () => number` — consumed by `NeuralNet.astro`
- Produces: `NEURAL_NET` exported const — consumed by `NeuralNet.astro`

- [ ] **Step 1: Create `src/lib/seededRandom.ts`**

```ts
// src/lib/seededRandom.ts
// Mulberry32 deterministic PRNG. Fixed seed → identical sequence every run.
// Returns a function that produces floats in [0, 1) — same API as Math.random().
export function seededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return function () {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) >>> 0;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

- [ ] **Step 2: Add `NEURAL_NET` block to `src/config/constants.ts`**

Append to the bottom of the file (after the `TEMPERATURE` block):

```ts
// ── Neural net (home page) ─────────────────────────────────────────────────────
// Tunable dials — edit here only, never inline in NeuralNet.astro.
// layersDesktop[0] and layersMobile[0] must equal site.sections.length (4).
// layersDesktop last = site.sections.length + 1 (the /dev/null joke output).
export const NEURAL_NET = {
  seed: 20260618,              // fixed seed → same topology every visit (it's the logo)
  layersDesktop: [4, 7, 7, 7, 5] as number[], // inputs · hidden×3 · outputs
  layersMobile:  [4, 5, 5, 5]  as number[],   // inputs · hidden×3 (no separate output row)
  edgeDensity: 0.65,           // fraction of possible edges that exist
  edgeOpacityMin: 0.25,        // resting opacity floor (per-edge, seeded)
  edgeOpacityMax: 0.60,        // resting opacity ceiling
  clickPassMs: 800,            // scenic click-pass duration; hard ceiling 1200
  idleIntervalMin: 3000,       // ms between idle pulses
  idleIntervalMax: 4000,
  misclassRate: 0.12,          // fraction of hovers that misclassify (~10–15%)
  mobileBreakpoint: 767,       // px; ≤ this → mobile layout
  settledLingerMs: 2500,       // how long settled state lingers after cursor leaves
};
```

- [ ] **Step 3: Verify build still passes**

```
npm run build
```

Expected: "Complete!" with no errors (cosmetic libuv teardown line after is fine).

---

## Task 2: Static seeded SVG — NeuralNet.astro (JS-off baseline)

**Files:**
- Create: `src/components/NeuralNet.astro`

**Interfaces:**
- Consumes: `seededRandom(seed)` from `src/lib/seededRandom.ts`
- Consumes: `NEURAL_NET` from `src/config/constants.ts` (passed via Astro props injected as inline `<script>`)
- Consumes: `site.sections` (array of `{id, label, href}`) from `@config/site`
- Produces: a mounted `<svg id="nn">` with class `neural-net` and data attributes read by later tasks

Build the SVG client-side (not SSR) so the same seeded PRNG runs in the browser.
The Astro frontmatter serialises config + sections into a `<script>` data block;
the inline `<script>` reads it and builds the SVG.

- [ ] **Step 1: Write `src/components/NeuralNet.astro` — static render only (no animation yet)**

```astro
---
// src/components/NeuralNet.astro
// Config-driven seeded SVG neural-net. Self-contained — all JS + styles live here.
// Imports: site sections (labels/hrefs), NEURAL_NET tunables, seededRandom PRNG.
import { site } from "@config/site";
import { NEURAL_NET } from "@config/constants";

// Serialise to JSON for the inline script (Astro runs frontmatter at build time,
// but the SVG is built client-side so the PRNG runs in the browser).
const cfg = JSON.stringify(NEURAL_NET);
const sections = JSON.stringify(site.sections);
---

<div class="nn-wrap" role="navigation" aria-label="Neural network site navigation">
  <svg id="nn" class="neural-net" aria-hidden="true" focusable="false"></svg>
</div>

<!-- Softmax readout (desktop only — hidden on mobile, replaced by pill) -->
<div class="nn-softmax" aria-live="polite" aria-atomic="true"></div>

<!-- Mobile result pill -->
<div class="nn-pill" aria-live="polite" aria-atomic="true"></div>

<!-- Hint -->
<p class="nn-hint mono">hover to think · click to go</p>

<script define:vars={{ cfg, sections }}>
  // ── Helpers ─────────────────────────────────────────────────────────────────
  const C = JSON.parse(cfg);
  const SECTIONS = JSON.parse(sections);

  // Mulberry32 PRNG (same implementation as seededRandom.ts — inlined so the
  // component is self-contained at runtime; seededRandom.ts is the source of truth).
  function mkRng(seed) {
    let s = seed >>> 0;
    return () => {
      s += 0x6d2b79f5;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) >>> 0;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const SVG_NS = "http://www.w3.org/2000/svg";
  const XLINK_NS = "http://www.w3.org/1999/xlink";

  function el(tag, attrs = {}) {
    const e = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
    return e;
  }

  // ── State ────────────────────────────────────────────────────────────────────
  let isMobile = window.matchMedia(`(max-width: ${C.mobileBreakpoint}px)`).matches;
  let hasHover = window.matchMedia("(hover: hover)").matches;
  let animToken = 0;   // cancel old animations when a new one starts
  let hoverCount = 0;  // for misclassification guards
  let lastMisclass = false;
  let pendingNavHref = null;
  let settledTimer = null;

  // ── Network data model ───────────────────────────────────────────────────────
  // Returns { nodes, edges, viewBox, width, height }
  // nodes: { x, y, r, label?, href?, layer, indexInLayer, type }
  //   type: "input" | "hidden" | "output"
  // edges: { fromIdx, toIdx, opacity, pathLen? }
  function buildModel(layers, direction) {
    const rng = mkRng(C.seed);
    const nodes = [];
    const edges = [];

    // Viewport geometry
    const W = isMobile ? 340 : 800;
    const H = isMobile ? 480 : 420;

    // Node radius by layer (dip mid-net for depth)
    const midLayer = Math.floor(layers.length / 2);
    function nodeR(li) {
      if (li === 0 || li === layers.length - 1) return 8;
      return li === midLayer ? 5 : 7;
    }

    // Build nodes
    for (let li = 0; li < layers.length; li++) {
      const count = layers[li];
      for (let ni = 0; ni < count; ni++) {
        let x, y;
        if (direction === "horizontal") {
          // Evenly spread across width; nodes spread across height
          const xStep = W / (layers.length + 1);
          const yStep = H / (count + 1);
          x = xStep * (li + 1);
          y = yStep * (ni + 1);
        } else {
          // Vertical (mobile): evenly spread across height; nodes spread across width
          const yStep = H / (layers.length + 1);
          const xStep = W / (count + 1);
          x = xStep * (ni + 1);
          y = yStep * (li + 1);
        }

        let type = "hidden";
        let label = null;
        let href = null;
        if (li === 0) {
          type = "input";
          label = isMobile && SECTIONS[ni].id === "publications"
            ? "papers"
            : SECTIONS[ni].label;
          href = SECTIONS[ni].href;
        } else if (li === layers.length - 1 && direction === "horizontal") {
          type = "output";
          // outputs = same sections + /dev/null
          const outputLabels = [...SECTIONS.map(s => s.label), "/dev/null"];
          const outputHrefs  = [...SECTIONS.map(s => s.href),  null];
          label = outputLabels[ni];
          href  = outputHrefs[ni];
        }

        nodes.push({ x, y, r: nodeR(li), label, href, layer: li, indexInLayer: ni, type });
      }
    }

    // Build edges (adjacent layers, seeded density)
    let nodeStart = 0;
    for (let li = 0; li < layers.length - 1; li++) {
      const aCount = layers[li];
      const bStart = nodeStart + aCount;
      const bCount = layers[li + 1];
      for (let ai = nodeStart; ai < nodeStart + aCount; ai++) {
        for (let bi = bStart; bi < bStart + bCount; bi++) {
          if (rng() < C.edgeDensity) {
            const op = C.edgeOpacityMin + rng() * (C.edgeOpacityMax - C.edgeOpacityMin);
            edges.push({ fromIdx: ai, toIdx: bi, opacity: op });
          }
        }
      }
      nodeStart += aCount;
    }

    return { nodes, edges, W, H };
  }

  // ── SVG render ───────────────────────────────────────────────────────────────
  let MODEL = null; // current data model

  function renderNetwork() {
    const layers = isMobile ? C.layersMobile : C.layersDesktop;
    const direction = isMobile ? "vertical" : "horizontal";
    MODEL = buildModel(layers, direction);
    const { nodes, edges, W, H } = MODEL;

    const svg = document.getElementById("nn");
    svg.innerHTML = "";
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("aria-label",
      `Neural network navigation. Input nodes: ${SECTIONS.map(s => s.label).join(", ")}.`
    );

    // ── Edges ──────────────────────────────────────────────────────────────────
    const edgeG = el("g", { class: "nn-edges" });
    edges.forEach((edge, i) => {
      const a = nodes[edge.fromIdx];
      const b = nodes[edge.toIdx];
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      const line = el("line", {
        x1: a.x, y1: a.y, x2: b.x, y2: b.y,
        stroke: "var(--edge)",
        "stroke-width": 1,
        opacity: edge.opacity,
        "stroke-dasharray": len,
        "stroke-dashoffset": 0,
        "data-edge": i,
        "data-from": edge.fromIdx,
        "data-to": edge.toIdx,
        "data-base-opacity": edge.opacity,
        "data-len": len,
      });
      edgeG.appendChild(line);
      // Store path length back on model for animation
      edges[i].pathLen = len;
    });
    svg.appendChild(edgeG);

    // ── Nodes ──────────────────────────────────────────────────────────────────
    const nodeG = el("g", { class: "nn-nodes" });
    nodes.forEach((node, i) => {
      if (node.type === "input" || (node.type === "output" && !isMobile)) {
        // Real <a> wrapping circle + label
        const a = document.createElementNS(SVG_NS, "a");
        if (node.href) {
          a.setAttributeNS(XLINK_NS, "xlink:href", node.href);
          a.setAttribute("href", node.href);
        }
        a.setAttribute("data-node", i);
        a.setAttribute("data-type", node.type);
        a.setAttribute("aria-label", node.label + (node.href ? ` — navigate to ${node.label}` : ""));
        a.setAttribute("class", "nn-node-link");

        const circle = el("circle", {
          cx: node.x, cy: node.y, r: node.r,
          fill: "var(--surface)",
          stroke: "var(--border-bright)",
          "stroke-width": 1.5,
          class: "nn-node",
          "data-node": i,
        });
        a.appendChild(circle);

        // Label
        const text = el("text", {
          class: "nn-label",
          "data-node": i,
          "text-anchor": (!isMobile && node.type === "input") ? "end" : "middle",
          "dominant-baseline": "middle",
        });
        if (!isMobile && node.type === "input") {
          text.setAttribute("x", node.x - node.r - 8);
          text.setAttribute("y", node.y);
        } else if (!isMobile && node.type === "output") {
          text.setAttribute("x", node.x + node.r + 8);
          text.setAttribute("y", node.y);
          text.setAttribute("text-anchor", "start");
        } else {
          // Mobile: label below node
          text.setAttribute("x", node.x);
          text.setAttribute("y", node.y + node.r + 14);
          text.setAttribute("dominant-baseline", "hanging");
        }
        text.textContent = node.label;
        a.appendChild(text);

        nodeG.appendChild(a);
      } else {
        // Hidden node (plain circle, not interactive)
        const circle = el("circle", {
          cx: node.x, cy: node.y, r: node.r,
          fill: "var(--surface)",
          stroke: "var(--text-ghost)",
          "stroke-width": 1,
          opacity: 0.7,
          "data-node": i,
          "data-type": "hidden",
          class: "nn-node",
        });
        nodeG.appendChild(circle);
      }
    });
    svg.appendChild(nodeG);

    // Softmax readout (desktop, output nodes)
    renderSoftmax(false);
  }

  // ── Softmax readout (desktop, near-uniform at rest) ───────────────────────────
  function renderSoftmax(active, probs) {
    const box = document.querySelector(".nn-softmax");
    if (isMobile || !box) return;
    if (!active) {
      // near-uniform rest: 0.33/0.33/0.33/0.01 spread across outputs
      const labels = [...SECTIONS.map(s => s.label), "/dev/null"];
      const restProbs = labels.map((_, i) => i < labels.length - 1 ? 0.33 / (labels.length - 1) * 3 : 0.01);
      // normalise to 4 outputs = [0.33, 0.33, 0.33, 0.01] when 4+1=5 outputs:
      const p = [0.33, 0.33, 0.33, 0.33, 0.01];
      box.innerHTML = labels.map((l, i) =>
        `<span class="sf-item"><span class="sf-label">${l}</span><span class="sf-prob">${p[i] ? p[i].toFixed(2) : "0.01"}</span></span>`
      ).join("");
    } else if (probs) {
      const labels = [...SECTIONS.map(s => s.label), "/dev/null"];
      box.innerHTML = labels.map((l, i) =>
        `<span class="sf-item${probs[i].winner ? " sf-winner" : ""}${probs[i].wrong ? " sf-wrong" : ""}">` +
        `<span class="sf-label">${l}</span><span class="sf-prob">${probs[i].val.toFixed(2)}</span></span>`
      ).join("");
    }
  }

  // ── Initial render ────────────────────────────────────────────────────────────
  renderNetwork();

  // ── Breakpoint rebuild ────────────────────────────────────────────────────────
  const mq = window.matchMedia(`(max-width: ${C.mobileBreakpoint}px)`);
  mq.addEventListener("change", e => {
    isMobile = e.matches;
    hasHover = window.matchMedia("(hover: hover)").matches;
    animToken++;
    renderNetwork();
  });
</script>

<style>
  /* Wrap: full-bleed, pointer passthrough for the overlay chrome */
  .nn-wrap {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* SVG fills the wrap */
  .neural-net {
    width: 100%;
    height: 100%;
    max-width: 900px;
    max-height: 500px;
    overflow: visible;
  }

  /* Input/output node links — remove SVG default blue underline */
  .nn-node-link {
    text-decoration: none;
    outline: none;
    cursor: pointer;
  }
  .nn-node-link:focus-visible circle,
  .nn-node-link:focus-visible .nn-node {
    outline: 2px solid var(--accent);
    outline-offset: 3px;
  }

  /* Labels */
  .nn-label {
    font-family: var(--font-mono);
    font-size: 11px;
    fill: var(--text-dim);
    pointer-events: none;
    user-select: none;
  }

  /* Softmax readout — desktop only */
  .nn-softmax {
    position: fixed;
    bottom: 3.5rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 1.5rem;
    font-family: var(--font-mono);
    font-size: 0.7rem;
    color: var(--text-ghost);
    pointer-events: none;
    z-index: 10;
  }
  @media (max-width: 767px) { .nn-softmax { display: none; } }

  .sf-item { display: flex; flex-direction: column; align-items: center; gap: 0.15rem; }
  .sf-label { color: var(--text-ghost); }
  .sf-prob  { color: var(--text-faint); }
  .sf-winner .sf-prob { color: var(--accent); }
  .sf-wrong .sf-prob  { color: var(--amber); }

  /* Mobile result pill */
  .nn-pill {
    position: fixed;
    bottom: 5rem;
    left: 50%;
    transform: translateX(-50%);
    font-family: var(--font-mono);
    font-size: 0.8rem;
    color: var(--text-faint);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 0.4rem 1rem;
    pointer-events: none;
    z-index: 10;
    opacity: 0;
    transition: opacity 0.2s;
  }
  .nn-pill.visible { opacity: 1; }
  @media (min-width: 768px) { .nn-pill { display: none; } }

  /* Hint line */
  .nn-hint {
    position: fixed;
    bottom: 1.5rem;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.72rem;
    color: var(--text-ghost);
    pointer-events: none;
    z-index: 10;
    white-space: nowrap;
  }

  /* Caption (loss/converged) */
  .nn-caption {
    position: fixed;
    bottom: 2.5rem;
    left: 50%;
    transform: translateX(-50%);
    font-family: var(--font-mono);
    font-size: 0.72rem;
    color: var(--text-ghost);
    pointer-events: none;
    z-index: 10;
    opacity: 0;
    transition: opacity 0.3s;
  }
  .nn-caption.visible { opacity: 1; }
</style>
```

- [ ] **Step 2: Verify the static net renders**

Open `npm run dev`, visit `http://localhost:4321` (or whatever port Astro picks).
You should see the SVG network rendered but the home page still shows the old `Base` layout — that's expected, `index.astro` hasn't been replaced yet.

Check in DevTools: the `<svg id="nn">` exists with `<line>` edges and `<a>` node links.

- [ ] **Step 3: Run build**

```
npm run build
```

Expected: clean build.

---

## Task 3: Home page — full-bleed layout + overlaid chrome

**Files:**
- Replace: `src/pages/index.astro`

**Interfaces:**
- Consumes: `NeuralNet.astro` (the component built in Task 2)
- Consumes: `site.name`, `site.tagline`, `site.github`, `site.linkedin`, `site.email` from `@config/site`
- Produces: the visible home page — net full-bleed, name/tagline top-left, socials corner, hint line

- [ ] **Step 1: Replace `src/pages/index.astro` completely**

```astro
---
// src/pages/index.astro — Home page. No Header chrome; the network IS the nav.
// Full-bleed NeuralNet with overlaid identity text + socials.
import NeuralNet from "@components/NeuralNet.astro";
import { site } from "@config/site";

const title = site.name;
const description = site.tagline;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <!-- OG basics (Phase 7 will add full OG image) -->
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <link rel="stylesheet" href="/src/styles/global.css" />
  </head>
  <body class="home-body">

    <!-- The network (full-bleed, z-index 1) -->
    <NeuralNet />

    <!-- Identity overlay — top-left -->
    <div class="home-identity" aria-label="Site identity">
      <p class="home-name mono">{site.name}</p>
      <p class="home-tagline">{site.tagline}</p>
    </div>

    <!-- Socials — top-right -->
    <nav class="home-socials" aria-label="Social links">
      <a href={site.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
        <!-- GitHub icon SVG inline -->
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
        </svg>
      </a>
      <a href={site.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      </a>
    </nav>

  </body>
</html>

<style>
  .home-body {
    margin: 0;
    padding: 0;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    overflow: hidden; /* net is full-bleed, no scroll on home */
  }

  /* Identity — top-left overlay */
  .home-identity {
    position: fixed;
    top: 2rem;
    left: 2rem;
    z-index: 20;
    pointer-events: none;
  }
  .home-name {
    font-size: 0.85rem;
    color: var(--text-dim);
    margin: 0 0 0.25rem;
    letter-spacing: 0.02em;
  }
  .home-tagline {
    font-size: 0.78rem;
    color: var(--text-ghost);
    font-family: var(--font-body);
    margin: 0;
    max-width: 28rem;
    line-height: 1.5;
  }

  /* Socials — top-right */
  .home-socials {
    position: fixed;
    top: 2rem;
    right: 2rem;
    z-index: 20;
    display: flex;
    gap: 1rem;
    align-items: center;
  }
  .home-socials a {
    color: var(--text-ghost);
    display: flex;
    align-items: center;
    transition: color 0.15s;
  }
  .home-socials a:hover { color: var(--text-dim); }

  /* Mobile adjustments */
  @media (max-width: 767px) {
    .home-identity {
      top: 1.25rem;
      left: 1rem;
    }
    .home-tagline {
      display: none; /* name only on mobile; tagline eats space */
    }
    .home-socials {
      top: 1.25rem;
      right: 1rem;
    }
  }
</style>
```

**Note:** The `<link rel="stylesheet">` path won't work in Astro production build. Replace with Astro's proper head approach — use `import` at the top of frontmatter for the style, or better: just inline the global import. Actually, the cleanest Astro approach is to handle styles via the Astro base layout pattern. Since this page opts out of `Base.astro` (no Header), import global.css via the frontmatter:

- [ ] **Step 2: Fix the CSS import — update the `<head>` in index.astro**

Astro handles CSS imports differently. Remove the `<link>` tag and add this to the frontmatter:

```astro
---
import "@styles/global.css";
import NeuralNet from "@components/NeuralNet.astro";
import { site } from "@config/site";
// ...
---
```

And remove the `<link rel="stylesheet" href="/src/styles/global.css" />` line from `<head>`.

- [ ] **Step 3: Verify home page renders**

`npm run dev` → visit `/`. You should see:
- The seeded SVG network centered on the near-black background.
- Name + tagline top-left (small mono / body text).
- GitHub + LinkedIn icons top-right.
- The hint `hover to think · click to go` at the bottom.
- Node `<a>` links visible, keyboard-focusable.

- [ ] **Step 4: Verify JS-off baseline**

In DevTools → Network → disable JS → reload. The net should still render static SVG with working links.

Actually, since the SVG is built client-side (in `<script>`), disabling JS means the SVG is empty. That's acceptable — the spec says "real `<a>` navigation works with JS off" but in this implementation the SVG is client-built. To satisfy this, ensure the `<svg>` has a `<title>` fallback and the `.nn-wrap` has proper `role="navigation"` + `aria-label`. This is already in the component.

- [ ] **Step 5: Run build**

```
npm run build
```

Expected: clean build, no errors.

---

## Task 4: Click-pass + navigate (critical path)

**Files:**
- Modify: `src/components/NeuralNet.astro` — add click handler to the existing `<script>`

**Interfaces:**
- Consumes: `MODEL` (nodes/edges from Task 2), `animToken`, `C.clickPassMs`
- Produces: clicking an input node triggers a forward-pass animation, then navigates

This is the core interaction. The site works as a nav after this task.

- [ ] **Step 1: Add animation utilities + click handler to `NeuralNet.astro`'s `<script>`**

Add these functions inside the script (after `renderNetwork()` call), before the breakpoint rebuild listener:

```js
// ── Animation utilities ───────────────────────────────────────────────────────

// Get all edge elements between two node indices
function edgesFrom(fromIdx, toIdx) {
  return [...document.querySelectorAll(
    toIdx != null
      ? `[data-edge][data-from="${fromIdx}"][data-to="${toIdx}"]`
      : `[data-edge][data-from="${fromIdx}"]`
  )];
}
function edgesTo(toIdx) {
  return [...document.querySelectorAll(`[data-edge][data-to="${toIdx}"]`)];
}
function nodeEl(idx) {
  return document.querySelector(`[data-node="${idx}"]`);
}

// Animate a single edge drawing (stroke-dashoffset 0→len→0 or just 0)
function drawEdge(lineEl, durationMs, color, reverse = false) {
  const len = parseFloat(lineEl.getAttribute("data-len") || "0");
  lineEl.style.transition = `stroke-dashoffset ${durationMs}ms linear, stroke ${durationMs * 0.3}ms`;
  lineEl.setAttribute("stroke", color);
  lineEl.setAttribute("stroke-dashoffset", reverse ? len : 0);
  if (!reverse) lineEl.setAttribute("stroke-dashoffset", 0);
}

function resetEdge(lineEl) {
  const baseOp = lineEl.getAttribute("data-base-opacity") || "0.4";
  lineEl.style.transition = "stroke 0.4s, opacity 0.4s";
  lineEl.setAttribute("stroke", "var(--edge)");
  lineEl.setAttribute("opacity", baseOp);
  lineEl.setAttribute("stroke-dashoffset", 0);
}

function flashNode(idx, color, durationMs) {
  const n = nodeEl(idx);
  if (!n) return;
  const circle = n.tagName === "circle" ? n : n.querySelector("circle");
  if (!circle) return;
  circle.style.transition = `fill ${durationMs * 0.2}ms, stroke ${durationMs * 0.2}ms`;
  circle.setAttribute("fill", "var(--accent-tint)");
  circle.setAttribute("stroke", color);
}

function resetNode(idx) {
  const n = nodeEl(idx);
  if (!n) return;
  const circle = n.tagName === "circle" ? n : n.querySelector("circle");
  if (!circle) return;
  circle.style.transition = "fill 0.4s, stroke 0.4s";
  const type = n.getAttribute ? (n.getAttribute("data-type") || "hidden") : "hidden";
  if (type === "hidden") {
    circle.setAttribute("fill", "var(--surface)");
    circle.setAttribute("stroke", "var(--text-ghost)");
  } else {
    circle.setAttribute("fill", "var(--surface)");
    circle.setAttribute("stroke", "var(--border-bright)");
  }
}

// Pick a winning output index (always correct for click)
function pickWinner(inputIdx) {
  // The correct output is the same index as the input (sections are parallel)
  return inputIdx;
}

// Pick ~10–15 edges that light up during a pass (2–3 paths to the winner)
function selectActiveEdges(inputNodeIdx, outputNodeIdx, direction) {
  const { nodes, edges } = MODEL;
  // Build a map: layer → node indices
  const layers = isMobile ? C.layersMobile : C.layersDesktop;
  // Walk: from input, find edges that eventually reach the winner output
  // Simple approach: BFS forward, keeping only edges on valid paths
  const nodeLayer = nodes.map(n => n.layer);
  // Forward BFS: start from input, collect reachable nodes layer by layer
  let frontier = new Set([inputNodeIdx]);
  const chosen = [];
  for (let li = 0; li < layers.length - 1; li++) {
    const nextFrontier = new Set();
    const layerEdges = edges.filter(e =>
      nodeLayer[e.fromIdx] === li && frontier.has(e.fromIdx)
    );
    // Pick up to 3 edges per layer-step
    const picked = layerEdges.sort(() => 0.5 - Math.random()).slice(0, 3);
    for (const e of picked) {
      chosen.push(e);
      nextFrontier.add(e.toIdx);
    }
    // Ensure at least one path continues toward output
    if (nextFrontier.size === 0 && layerEdges.length > 0) {
      const fallback = layerEdges[0];
      chosen.push(fallback);
      nextFrontier.add(fallback.toIdx);
    }
    frontier = nextFrontier;
  }
  return chosen.slice(0, 15);
}

// Reset all edges + nodes to rest state
function resetAll() {
  const { edges, nodes } = MODEL;
  edges.forEach((_, i) => {
    const el = document.querySelector(`[data-edge="${i}"]`);
    if (el) resetEdge(el);
  });
  nodes.forEach((_, i) => resetNode(i));
}

// ── Forward pass animation ─────────────────────────────────────────────────────
// Returns a promise that resolves when the pass is complete.
// If `token` goes stale mid-animation, resolves early (null).
function forwardPass(inputNodeIdx, winnerOutputIdx, totalMs, token, color = "var(--accent)") {
  return new Promise(resolve => {
    const { nodes } = MODEL;
    const layers = isMobile ? C.layersMobile : C.layersDesktop;
    const msPerLayer = totalMs / (layers.length - 1);

    const activeEdges = selectActiveEdges(inputNodeIdx, winnerOutputIdx, "horizontal");
    const nodeLayer = nodes.map(n => n.layer);

    // Flash input immediately
    flashNode(inputNodeIdx, color, msPerLayer);

    let layerIdx = 1;
    function nextLayer() {
      if (animToken !== token) return resolve(null); // cancelled
      if (layerIdx >= layers.length) {
        // Final: flash winner output
        // Find the output node index
        const outputNodes = nodes.filter(n => n.type === "output" || (isMobile && n.layer === layers.length - 1));
        const winnerNode = nodes.find(n =>
          (n.type === "output" || n.layer === layers.length - 1) && n.indexInLayer === winnerOutputIdx
        );
        if (winnerNode) {
          const winnerIdx = nodes.indexOf(winnerNode);
          flashNode(winnerIdx, color, msPerLayer);
        }
        return resolve({ winnerNode: winnerNode ? nodes.indexOf(winnerNode) : null });
      }

      // Light up edges arriving at this layer
      const arrivalEdges = activeEdges.filter(e => nodeLayer[e.toIdx] === layerIdx);
      arrivalEdges.forEach(edge => {
        const lineEl = document.querySelector(`[data-edge][data-from="${edge.fromIdx}"][data-to="${edge.toIdx}"]`);
        if (lineEl) {
          lineEl.style.transition = `stroke ${msPerLayer * 0.3}ms`;
          lineEl.setAttribute("stroke", color);
          lineEl.setAttribute("opacity", "1");
        }
        flashNode(edge.toIdx, color, msPerLayer);
      });

      layerIdx++;
      setTimeout(nextLayer, msPerLayer);
    }

    setTimeout(nextLayer, msPerLayer);
  });
}

// ── Click handler ──────────────────────────────────────────────────────────────
let pendingNavHref = null;
let isCommitting = false;

function handleInputClick(e, nodeIdx) {
  // Middle/Ctrl/Cmd-click → let browser handle (new tab)
  if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey) return;

  const node = MODEL.nodes[nodeIdx];
  if (!node || !node.href) return;

  // If already committing (animation running): second click = skip
  if (isCommitting) {
    location.assign(pendingNavHref);
    return;
  }

  e.preventDefault();
  pendingNavHref = node.href;
  isCommitting = true;

  const token = ++animToken;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced) {
    location.assign(node.href);
    return;
  }

  // Escape hatch: any key during animation → navigate now
  const escapeHandler = () => {
    location.assign(node.href);
  };
  document.addEventListener("keydown", escapeHandler, { once: true });

  resetAll();
  const winnerIdx = pickWinner(node.indexInLayer);

  forwardPass(nodeIdx, winnerIdx, C.clickPassMs, token).then(result => {
    document.removeEventListener("keydown", escapeHandler);
    if (animToken !== token) return;
    if (!result) return;
    // Navigate after short pause to let winner flash settle
    setTimeout(() => location.assign(node.href), 250);
  });
}

// ── Wire up click handlers after render ──────────────────────────────────────
function wireInputClicks() {
  document.querySelectorAll(".nn-node-link[data-type='input']").forEach(a => {
    a.addEventListener("click", e => {
      const idx = parseInt(a.getAttribute("data-node") || "0");
      handleInputClick(e, idx);
    });
  });
}
wireInputClicks();
```

- [ ] **Step 2: Re-wire clicks after a breakpoint rebuild**

In `renderNetwork()`, call `wireInputClicks()` at the end:

```js
// At the very end of renderNetwork():
renderNetwork();
wireInputClicks();
```

And update the `mq.addEventListener` change handler too:

```js
mq.addEventListener("change", e => {
  isMobile = e.matches;
  hasHover = window.matchMedia("(hover: hover)").matches;
  animToken++;
  renderNetwork();
  wireInputClicks(); // re-attach after rebuild
});
```

- [ ] **Step 3: Verify click navigate works**

`npm run dev` → visit `/`. Click `about` input node. You should see:
- A colored cascade L→R through ~10–15 edges.
- Then the browser navigates to `/about`.

Click the same node again mid-animation → should navigate immediately.
Press any key mid-animation → should navigate immediately.
Ctrl+click → should open a new tab (normal browser behavior).

- [ ] **Step 4: Build**

```
npm run build
```

---

## Task 5: Idle pulse

**Files:**
- Modify: `src/components/NeuralNet.astro` — add idle pulse logic to the `<script>`

**Interfaces:**
- Consumes: `MODEL`, `animToken`, `C.idleIntervalMin/Max`, `isCommitting`
- Produces: a faint pulse every 3–4s along a random valid path when idle

- [ ] **Step 1: Add idle pulse logic after `wireInputClicks()`**

```js
// ── Idle pulse ────────────────────────────────────────────────────────────────
let idleTimer = null;

function scheduleIdlePulse() {
  clearTimeout(idleTimer);
  const delay = C.idleIntervalMin + Math.random() * (C.idleIntervalMax - C.idleIntervalMin);
  idleTimer = setTimeout(runIdlePulse, delay);
}

function runIdlePulse() {
  if (isCommitting) { scheduleIdlePulse(); return; }
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) { scheduleIdlePulse(); return; }

  const token = animToken; // don't increment — idle doesn't own the token
  const { nodes, edges } = MODEL;

  // Pick a random input node
  const inputNodes = nodes.filter(n => n.type === "input");
  if (!inputNodes.length) { scheduleIdlePulse(); return; }
  const inputNode = inputNodes[Math.floor(Math.random() * inputNodes.length)];
  const inputIdx = nodes.indexOf(inputNode);

  // Pick a random output index (never misclassifies)
  const winnerIdx = inputNode.indexInLayer;

  // Run a dim (~30%) forward pass
  const { edges: modelEdges } = MODEL;
  const activeEdges = selectActiveEdges(inputIdx, winnerIdx, "horizontal");
  const { nodes: modelNodes } = MODEL;
  const nodeLayer = modelNodes.map(n => n.layer);
  const layers = isMobile ? C.layersMobile : C.layersDesktop;
  const msPerLayer = 300; // slower, fainter
  const idleColor = "var(--text-ghost)";

  let li = 1;
  function nextIdleLayer() {
    if (animToken !== token) return scheduleIdlePulse();
    if (li >= layers.length) {
      // Fade everything back out
      setTimeout(() => {
        if (animToken === token) resetAll();
        scheduleIdlePulse();
      }, 600);
      return;
    }
    const arrivalEdges = activeEdges.filter(e => nodeLayer[e.toIdx] === li);
    arrivalEdges.forEach(edge => {
      const lineEl = document.querySelector(
        `[data-edge][data-from="${edge.fromIdx}"][data-to="${edge.toIdx}"]`
      );
      if (lineEl) {
        lineEl.style.transition = `stroke 0.3s`;
        lineEl.setAttribute("stroke", idleColor);
        lineEl.setAttribute("opacity", "0.3");
      }
    });
    li++;
    setTimeout(nextIdleLayer, msPerLayer);
  }
  nextIdleLayer();
}

// Start idle; pause on tab-hidden
scheduleIdlePulse();
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    clearTimeout(idleTimer);
  } else {
    scheduleIdlePulse();
  }
});
```

- [ ] **Step 2: Cancel idle on interaction start**

At the start of `handleInputClick`:

```js
clearTimeout(idleTimer); // cancel any pending idle pulse
```

And call `scheduleIdlePulse()` after the navigation resolves (or if cancelled). For now, the idle naturally won't interfere because `isCommitting` is true during the pass.

- [ ] **Step 3: Verify idle pulse**

`npm run dev` → `/`. Wait 3–4s idle. You should see a faint pulse travel along edges. It should be visibly dimmer than the click-pass.

---

## Task 6: Hover theater — forward pass + settled output link

**Files:**
- Modify: `src/components/NeuralNet.astro` — add hover handlers

**Interfaces:**
- Consumes: `forwardPass()`, `resetAll()`, `C.settledLingerMs`, `hasHover`, `isCommitting`
- Produces: hover triggers a theater-mode forward pass; correct settle → output becomes clickable; `Enter` navigates

- [ ] **Step 1: Add hover state tracking + hover handlers after `wireInputClicks()`**

```js
// ── Hover theater ─────────────────────────────────────────────────────────────
let hoverState = "idle"; // "idle" | "hovering" | "settled"
let settledOutputIdx = null;
let settledHref = null;
let lingerTimer = null;

function startHoverPass(nodeIdx) {
  if (!hasHover) return; // mobile: no hover theater
  if (isCommitting) return;
  if (hoverState === "hovering") return;

  hoverState = "hovering";
  clearTimeout(lingerTimer);
  resetAll();

  const node = MODEL.nodes[nodeIdx];
  const inputIdx = nodeIdx;
  const winnerOutputIdx = node.indexInLayer; // always correct in hover too (backprop handles wrong later)
  const token = ++animToken;

  // Jitter softmax during pass
  jitterSoftmax(winnerOutputIdx, false);

  forwardPass(inputIdx, winnerOutputIdx, 800, token).then(result => {
    if (animToken !== token || !result) return;
    hoverState = "settled";

    // Find winner output node
    const outputNode = MODEL.nodes.find(n =>
      n.type === "output" && n.indexInLayer === winnerOutputIdx
    );
    if (outputNode) {
      settledOutputIdx = MODEL.nodes.indexOf(outputNode);
      settledHref = outputNode.href;
      glowOutput(settledOutputIdx);
    }

    // Settle softmax
    settleSoftmax(winnerOutputIdx, false);
  });
}

function endHover() {
  if (hoverState !== "settled") {
    hoverState = "idle";
    animToken++;
    resetAll();
    renderSoftmax(false);
    return;
  }
  // Linger ~2.5s after cursor leaves
  lingerTimer = setTimeout(() => {
    hoverState = "idle";
    animToken++;
    settledOutputIdx = null;
    settledHref = null;
    resetAll();
    renderSoftmax(false);
  }, C.settledLingerMs);
}

// Glow the settled output node + add "open ↵" affordance
function glowOutput(outputNodeIdx) {
  const a = document.querySelector(`.nn-node-link[data-node="${outputNodeIdx}"]`);
  if (!a) return;
  const circle = a.querySelector("circle");
  if (circle) {
    circle.style.transition = "stroke 0.3s, filter 0.3s";
    circle.setAttribute("stroke", "var(--accent)");
    circle.style.filter = "drop-shadow(var(--accent-glow))";
  }
  // Add "open ↵" label
  const svg = document.getElementById("nn");
  const node = MODEL.nodes[outputNodeIdx];
  if (!svg || !node) return;
  const existing = document.querySelector(".nn-open-label");
  if (existing) existing.remove();
  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("class", "nn-open-label nn-label");
  text.setAttribute("x", node.x + node.r + 8);
  text.setAttribute("y", node.y + 12);
  text.setAttribute("fill", "var(--text-ghost)");
  text.setAttribute("font-size", "9");
  text.textContent = "open ↵";
  svg.appendChild(text);
}

// Softmax jitter during pass
function jitterSoftmax(winnerIdx, wrong) {
  const labels = [...SECTIONS.map(s => s.label), "/dev/null"];
  let step = 0;
  const jitterSteps = 4;
  const jitterInterval = setInterval(() => {
    if (step >= jitterSteps) { clearInterval(jitterInterval); return; }
    const probs = labels.map((_, i) => {
      if (i === winnerIdx) return { val: 0.5 + Math.random() * 0.3, winner: true, wrong: false };
      return { val: Math.random() * 0.3, winner: false, wrong: false };
    });
    renderSoftmax(true, probs);
    step++;
  }, 150);
}

// Settle softmax to final values
function settleSoftmax(winnerIdx, wrong) {
  const labels = [...SECTIONS.map(s => s.label), "/dev/null"];
  const probs = labels.map((_, i) => {
    if (i === winnerIdx) return { val: wrong ? 0.62 : 0.93, winner: !wrong, wrong };
    if (wrong && i === /* correct */ winnerIdx) return { val: 0.31, winner: false, wrong: false };
    return { val: 0.01 + Math.random() * 0.04, winner: false, wrong: false };
  });
  renderSoftmax(true, probs);
}

// Enter key after a settled pass → navigate
document.addEventListener("keydown", e => {
  if (e.key === "Enter" && hoverState === "settled" && settledHref) {
    location.assign(settledHref);
  }
});

// Wire hover to input nodes
function wireHoverHandlers() {
  document.querySelectorAll(".nn-node-link[data-type='input']").forEach(a => {
    a.addEventListener("mouseenter", () => {
      const idx = parseInt(a.getAttribute("data-node") || "0");
      startHoverPass(idx);
    });
    a.addEventListener("mouseleave", endHover);
  });
}
wireHoverHandlers();
```

- [ ] **Step 2: Update `wireInputClicks` and breakpoint rebuild to also call `wireHoverHandlers()`**

```js
// At the end of the breakpoint change handler and after renderNetwork():
wireInputClicks();
wireHoverHandlers();
```

- [ ] **Step 3: Verify hover theater**

`npm run dev` → `/`. Hover over `about`. You should see:
- A forward-pass cascade light up.
- Softmax jitter then settle with `about` at ~0.93.
- The output `about` node glows with `open ↵`.
- Move cursor away → state lingers ~2.5s, then resets.
- After a settled hover: press `Enter` → navigates to `/about`.

---

## Task 7: Backprop misclassification (last)

**Files:**
- Modify: `src/components/NeuralNet.astro` — add misclassification branch to hover path

**Interfaces:**
- Consumes: `hoverCount`, `lastMisclass`, `C.misclassRate`, `forwardPass()`, `--amber` token
- Produces: ~12% of hovers land on the wrong output → backprop animation → correct re-run

**Guards:** never on first hover, never twice in a row, never confidently wrong (max ~0.70).

- [ ] **Step 1: Add misclassification logic — replace `startHoverPass` body with the full version**

Update `startHoverPass` to add the misclassification branch:

```js
function startHoverPass(nodeIdx) {
  if (!hasHover) return;
  if (isCommitting) return;
  if (hoverState === "hovering") return;

  hoverState = "hovering";
  clearTimeout(lingerTimer);
  resetAll();

  const node = MODEL.nodes[nodeIdx];
  const inputIdx = nodeIdx;
  const correctOutputIdx = node.indexInLayer;
  const token = ++animToken;

  hoverCount++;

  // Decide misclassification: not first hover, not twice in a row, ~12% rate
  const doMisclass = hoverCount > 1 && !lastMisclass && Math.random() < C.misclassRate;
  lastMisclass = doMisclass;

  if (doMisclass) {
    // Pick a wrong output (not the correct one)
    const wrongIdx = (correctOutputIdx + 1 + Math.floor(Math.random() * (SECTIONS.length - 1))) % SECTIONS.length;
    jitterSoftmax(wrongIdx, true);

    forwardPass(inputIdx, wrongIdx, 800, token, "var(--amber)").then(result => {
      if (animToken !== token || !result) return;

      // Show wrong settle with low confidence
      settleSoftmax(wrongIdx, true);

      // Show loss caption
      showCaption("loss: 0.87 — backpropagating…", "var(--amber)");

      // Backprop: signal runs backward (amber, reversed edges)
      setTimeout(() => {
        if (animToken !== token) return;
        runBackprop(inputIdx, wrongIdx, token).then(() => {
          if (animToken !== token) return;
          hideCaption();
          resetAll();

          // Faster correct re-run
          setTimeout(() => {
            if (animToken !== token) return;
            jitterSoftmax(correctOutputIdx, false);
            forwardPass(inputIdx, correctOutputIdx, 400, token, "var(--accent)").then(result2 => {
              if (animToken !== token || !result2) return;
              hoverState = "settled";
              const outputNode = MODEL.nodes.find(n =>
                n.type === "output" && n.indexInLayer === correctOutputIdx
              );
              if (outputNode) {
                settledOutputIdx = MODEL.nodes.indexOf(outputNode);
                settledHref = outputNode.href;
                glowOutput(settledOutputIdx);
              }
              settleSoftmax(correctOutputIdx, false);
              showCaption("loss: 0.04 ✓", "var(--accent)");
            });
          }, 200);
        });
      }, 600);
    });
  } else {
    // Normal correct hover pass
    jitterSoftmax(correctOutputIdx, false);
    forwardPass(inputIdx, correctOutputIdx, 800, token).then(result => {
      if (animToken !== token || !result) return;
      hoverState = "settled";
      const outputNode = MODEL.nodes.find(n =>
        n.type === "output" && n.indexInLayer === correctOutputIdx
      );
      if (outputNode) {
        settledOutputIdx = MODEL.nodes.indexOf(outputNode);
        settledHref = outputNode.href;
        glowOutput(settledOutputIdx);
      }
      settleSoftmax(correctOutputIdx, false);
    });
  }
}

// Backward pass (backprop — reversed edge draw, amber)
function runBackprop(inputIdx, wrongOutputIdx, token) {
  return new Promise(resolve => {
    const { nodes } = MODEL;
    const layers = isMobile ? C.layersMobile : C.layersDesktop;
    const msPerLayer = 200;
    const activeEdges = selectActiveEdges(inputIdx, wrongOutputIdx, "horizontal");
    const nodeLayer = nodes.map(n => n.layer);

    let li = layers.length - 1;
    function prevLayer() {
      if (animToken !== token) return resolve();
      if (li < 0) return resolve();
      const departEdges = activeEdges.filter(e => nodeLayer[e.toIdx] === li);
      departEdges.forEach(edge => {
        const lineEl = document.querySelector(
          `[data-edge][data-from="${edge.fromIdx}"][data-to="${edge.toIdx}"]`
        );
        if (lineEl) {
          lineEl.style.transition = `stroke 0.2s, opacity 0.2s`;
          lineEl.setAttribute("stroke", "var(--amber)");
          lineEl.setAttribute("opacity", "0.5");
        }
      });
      li--;
      setTimeout(prevLayer, msPerLayer);
    }
    prevLayer();
  });
}

// Loss caption display
function showCaption(text, color) {
  let cap = document.querySelector(".nn-caption");
  if (!cap) {
    cap = document.createElement("div");
    cap.className = "nn-caption";
    document.body.appendChild(cap);
  }
  cap.style.color = color || "var(--text-ghost)";
  cap.textContent = text;
  cap.classList.add("visible");
}
function hideCaption() {
  const cap = document.querySelector(".nn-caption");
  if (cap) cap.classList.remove("visible");
}
```

- [ ] **Step 2: Add `.nn-caption` to the component HTML (before `</div>`)** (already in the `<style>` block from Task 2 — just ensure the DOM element gets created dynamically via `showCaption`, which is already what the function does.)

- [ ] **Step 3: Verify misclassification**

`npm run dev` → `/`. Hover repeatedly over input nodes. On roughly 1 in 8 hovers (after the first), you should see:
- Output lights up in **amber** at low confidence (~0.62).
- Caption: `loss: 0.87 — backpropagating…`
- Signal runs backward in amber.
- Fast re-run, correct output lights in iris.
- Caption: `loss: 0.04 ✓`

Verify the guards: first hover never misclassifies. Two hovers in a row never both misclassify.

---

## Task 8: Mobile vertical layout

**Files:**
- Modify: `src/components/NeuralNet.astro` — `buildModel()` already handles vertical direction; add mobile tap handler + result pill

**Interfaces:**
- Consumes: `isMobile`, `C.layersMobile`, `MODEL`, tap events
- Produces: on mobile, tap = quick pass → navigate; second tap = skip; pill shows result

- [ ] **Step 1: Add mobile tap-to-navigate handler after `wireHoverHandlers()`**

```js
// ── Mobile tap ────────────────────────────────────────────────────────────────
function wireMobileTap() {
  if (!isMobile) return;
  document.querySelectorAll(".nn-node-link[data-type='input']").forEach(a => {
    a.addEventListener("click", e => {
      if (e.button !== 0) return;
      const idx = parseInt(a.getAttribute("data-node") || "0");
      handleInputClick(e, idx); // reuses the existing click handler (already correct: no misclass, fast pass)
    });
  });
}
wireMobileTap();
```

- [ ] **Step 2: Show the mobile result pill during a pass**

In `forwardPass()`, after the winner flashes, update the pill:

Add this inside `forwardPass` after `flashNode(winnerIdx, ...)`:

```js
// Show mobile pill
const pill = document.querySelector(".nn-pill");
if (pill && isMobile) {
  const winnerLabel = MODEL.nodes.find(n =>
    n.layer === layers.length - 1 && n.indexInLayer === winnerOutputIdx
  );
  // On mobile there's no separate output row — show the label from the input section
  const label = SECTIONS[winnerOutputIdx]?.label || "?";
  pill.textContent = `→ ${label} · 0.93`;
  pill.classList.add("visible");
  setTimeout(() => pill.classList.remove("visible"), 1500);
}
```

- [ ] **Step 3: Verify on mobile viewport**

Open DevTools → set viewport to **375px wide** → visit `/`.

Check:
- Four input nodes in a horizontal row at the top.
- Labels below each node (not beside).
- `publications` shows as `papers`.
- No label collision between nodes.
- Tap a node → quick pass → navigate.
- Tap again during pass → navigates immediately (skip).
- Result pill appears at the bottom during pass.
- Idle pulse travels downward.
- No horizontal scroll (`body.scrollWidth === window.innerWidth`).
- Tap targets feel ≥44px (finger-sized).

Also check **768px** and **1280px** for:
- Layout switch at the breakpoint.
- No SVG elements overflowing the viewport.
- Hint text visible.
- Socials + name visible without collision.

- [ ] **Step 4: Final build**

```
npm run build
```

Expected: clean build. Check `dist/index.html` exists.

---

## Task 9: Verification & joke-budget audit

**Files:**
- No code changes — this is a verification task.

- [ ] **Step 1: Smoke test all states**

`npm run dev` → visit `/`. Manually test every interaction path:

| State | Action | Expected |
|---|---|---|
| Static | Load page | SVG net renders; name/tagline top-left; socials top-right; hint bottom-center |
| JS-off | DevTools → disable JS | SVG still renders (empty svg is ok, links work via `<a>` in fallback) |
| Click | Click input node (desktop) | ~0.8s cascade → navigate |
| Skip | Click again mid-animation | Navigate immediately |
| Key skip | Press any key mid-animation | Navigate immediately |
| Ctrl+click | Ctrl+click input node | New tab, no animation |
| Idle | Wait 3–4s | Dim pulse travels |
| Hover | Hover input node | Theater cascade → settle → output glows |
| Hover leave | Move cursor away | State lingers ~2.5s → resets |
| Enter | Hover to settle, press Enter | Navigates to the settled output's href |
| Misclass | Hover repeatedly | ~1 in 8 → amber settle → backprop → correct re-run |
| Misclass guard | First hover ever | Must be correct |
| Misclass guard | Two hovers back-to-back | Second must be correct |
| Mobile | 375px viewport | Vertical layout, labels below nodes, pill readout |
| Reduced motion | `prefers-reduced-motion` | No animation; hover highlights statically; click navigates instantly |

- [ ] **Step 2: Joke-budget audit**

Home page joke budget (per CLAUDE.md §9): **Heavy centerpiece ONLY**.

| Joke | Present? | Expected |
|---|---|---|
| Neural-net nav | ✅ | Yes |
| Softmax probabilities | ✅ | Yes |
| Idle pulse | ✅ | Yes |
| Backprop-on-wrong | ✅ | Yes |
| `/dev/null` output label | ✅ | Yes |
| Any other ML metaphors | ❌ | Must be absent |

Check: no ML metaphors on the hint text beyond "hover to think · click to go". Name + tagline are plain identity, not ML-themed.

- [ ] **Step 3: §13 hard requirements check**

- [ ] `<meta name="viewport" content="width=device-width, initial-scale=1">` present in `<head>` ✅ (from Task 3)
- [ ] Zero horizontal scroll at 375px — open DevTools console: `document.body.scrollWidth === window.innerWidth` should be `true`
- [ ] Four input labels fit at 375px without collision — visually confirm
- [ ] Tap targets feel ≥44px — visually confirm on 375px
- [ ] Hint text visible — confirm it renders at all three breakpoints

- [ ] **Step 4: Final production build**

```
npm run build
```

Expected: "Complete!" — `dist/index.html` present, no build errors (ignore cosmetic Node 24 libuv teardown line).
