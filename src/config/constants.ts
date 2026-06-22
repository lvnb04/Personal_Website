// src/config/constants.ts
// ─────────────────────────────────────────────────────────────────────────────
// SINGLE PLACE TO EDIT raw constant values for the whole site.
// This file holds only primitive values/data — it imports nothing from the app.
// Consumers should import the assembled `site` object from `./site`, never these
// directly, so the app has one stable interface and one place to change values.
// ─────────────────────────────────────────────────────────────────────────────

// ── Identity ────────────────────────────────────────────────────────────────
export const NAME = "Bharateesha Lvn";
export const TAGLINE =
  "CS grad · building ML systems & the infra that runs them";

// ── Contact / social ─────────────────────────────────────────────────────────
export const EMAIL = "bharateesha.lvn@gmail.com";
export const GITHUB_URL = "https://github.com/lvnb04";
export const LINKEDIN_URL = "https://www.linkedin.com/in/lvnb";
export const X_URL = "https://x.com/Bharateesha3";

// ── Sections ──────────────────────────────────────────────────────────────────
// Order drives nav order AND neural-net input node order.
// Add/reorder here → reflected in Header nav and the home network automatically.
export const SECTIONS = [
  { id: "about", label: "about", href: "/about" },
  { id: "projects", label: "projects", href: "/projects" },
  { id: "publications", label: "papers", href: "/papers" },   // id stays "publications" (stable net key); user-facing route is /papers
  { id: "blog", label: "blog", href: "/blog" },
] as const;

// ── Footer ─────────────────────────────────────────────────────────────────────
export const FOOTER_QUIP = "loss still decreasing";

// ── Deploy ─────────────────────────────────────────────────────────────────────
// Used for canonical URLs, OG tags, RSS. Update at deploy time.
export const SITE_URL = "https://bharateesha.com";

// ── About page ───────────────────────────────────────────────────────────────
// All About copy lives here. `temperature` 0.0 → professional voice, 1.0 → playful.
// VOICE changes only — FACTS (education, skills, contact) are identical at both temps.
// To edit the About page, change values here only.
export const ABOUT = {
  heading: "About",

  // Resamples on temperature (voice differs, facts identical).
  intro: {
    professional:
      "I'm a Computer Science graduate from PES University, focused on machine learning and AI. " +
      "I work across the stack — training and evaluating models, building multi-agent systems, and " +
      "constructing the real-time infrastructure that runs them in production. " +
      "I care most about the parts that decide whether a system actually works: " +
      "data quality, evaluation, and behaviour under load.",
    playful:
      "CS grad from PES University, currently overfitting to machine learning and AI. " +
      "I work end to end — train the model, wire up the multi-agent pipeline, then build the backend " +
      "that keeps it standing once real traffic shows up. Most of my time goes to the unglamorous parts: " +
      "data quality, evaluation, and whatever the system does when nobody's watching.",
  },

  // Career timeline — newest first. Add/remove a node here (no code change).
  // Facts (period, title, org) never resample; only `description` changes voice.
  experience: {
    label: { professional: "experience", playful: "training history" },
    timeline: [
      {
        period: "Jan 2026 — present",
        current: true,
        title: "AI Intern",
        org: "LeadSquared",
        description: {
          professional:
            "Building real-time voice AI agents on a cascaded STT-LLM-TTS architecture, aiming to acheive low latency workloads.",
          playful:
            "Making bots that actually listen — STT → LLM → TTS in real time, so sales reps can hand off the boring calls.",
        },
      },
      {
        period: "Jun – Aug 2025",
        title: "AI Engineering Intern",
        org: "Pearson",
        description: {
          professional:
            "Built an LLM-powered browser automation platform for UX audits (90%+ time reduction, 1500+ hours saved/yr); designed multi-agent systems with Google ADK, Semantic Kernel, and LangGraph.",
          playful:
            "Built an LLM-driven audit bot that made a days-long manual process take minutes — then wired up multi-agent systems with Google ADK and LangGraph to keep it running autonomously.",
        },
      },
      {
        period: "Jun – Jul 2024",
        title: "Computer Vision Research Intern",
        org: "CDSAML",
        description: {
          professional:
            "AuthoGraph — a CNN that identifies authorship from handwritten Kannada text, with applications in forensics and document authentication.",
          playful:
            "AuthoGraph — a CNN that fingerprints who handwrote a line of Kannada. Forensics, basically.",
        },
      },
    ],
  },

  // Section labels resample (voice); their bodies are facts and do NOT change.
  now: {
    label: { professional: "now", playful: "current epoch" },
    body: "Building real-time voice AI agents.",
  },
  education: {
    label: { professional: "education", playful: "pretraining" },
    body: "B.Tech in CSE (AI and ML) · PES University · 2026.",
  },
  skills: {
    label: { professional: "skills", playful: "learned weights" },
    groups: [
      { group: "ML", items: "PyTorch · PyG · Transformers · Graph Neural Nets · scikit-learn · NLP · CV · LangGraph · Google ADK" },
      { group: "deploy", items: "Docker · FastAPI · AWS · AWS CDK · MySQL · Node.js" },
      { group: "tooling", items: "Python · C++ · SQL · Git · Linux · Jupyter" },
    ],
  },
  learning: {
    label: { professional: "currently learning", playful: "currently fine-tuning" },
    professional: "Real-time audio streaming infrastructure, and distributed multi-agent orchestration patterns.",
    playful: "Low-latency audio pipelines — and figuring out how to stop multi-agent systems from talking over each other.",
  },
  contact: {
    label: "contact",
  },

  resumeHref: "https://drive.google.com/file/d/1xSWsgyNawDt_cH6Mf3zDuSZUQBA7ZosS/view?usp=sharing", // drop the real file in public/
};

// ── Temperature control (About) ────────────────────────────────────────────────
// A short two-stop slider (step = 1): dragging snaps to 0.0 or 1.0 — no dead values
// in between. The 0.0 / 1.0 readout keeps the ML "sampling temperature" flavor; states
// are intentionally unlabelled so visitors discover that 1.0 flips the page voice.
// Resets to `default` on reload (no storage).
export const TEMPERATURE = {
  label: "temperature",
  default: 0, // 0.0 = professional voice, 1.0 = playful voice
  step: 1, // snap straight between the two ends
};

// ── Neural net (home page) ─────────────────────────────────────────────────────
// Tunable dials — edit here only, never inline in NeuralNet.astro.
// layersDesktop[0] and layersMobile[0] must equal site.sections.length (4).
// layersDesktop last = site.sections.length + 1 (the /dev/null joke output).
export const NEURAL_NET = {
  seed: 20260618,              // fixed seed → same topology every visit (it's the logo)
  layersDesktop: [4, 7, 10, 7, 5] as number[], // inputs · hidden×3 (wide middle) · outputs
  // Mobile (portrait): 5 layers mirroring the desktop diamond. The odd count puts the
  // center layer exactly in the middle, so the boot weave's two halves are symmetric
  // (both ends draw inward and meet at the center — same as desktop). No separate output
  // row — the last layer is the pass target; the result shows as a single bottom pill.
  layersMobile: [4, 8, 11, 8, 6] as number[],
  // Funnel silhouette: vertical spread of the END layers (input/output) relative to the
  // MIDDLE layer. 1.0 = uniform rectangle; lower = ends pinched toward center (>< shape).
  // 0.55 ≈ ends span ~55% of the middle layer's height — a clear funnel without crowding.
  funnelMinSpread: 0.55,
  // Full mesh: every neuron connects to every neuron in the next layer.
  // Resting opacity is seeded per-edge between these bounds (woven texture, not flat).
  // Idle resting net (tier 2) — subtle: clearly "there" but quieter than the
  // breathing peak (tier 3) and well below the click activation (tier 1).
  edgeOpacityMin: 0.10,        // resting opacity floor (per-edge, seeded) — dim but clearly "there" on pitch-black
  edgeOpacityMax: 0.26,        // resting opacity ceiling
  // Breathing (tier 3) — a slow brightness swell on the idle net. Larger than the
  // resting spread so the breath is clearly visible (dim rest → noticeably brighter → settle).
  // Raised so the breath reads clearly against the near-black background on both desktop
  // and mobile (rest 0.10–0.26 → peak ~0.65–0.81; alive and legible, settles back to rest).
  breathPeriodMs: 10000,        // ms per full breath (slow + deliberate = character)
  breathAmount: 1.20,          // peak opacity lift added at the top of the breath (desktop)
  breathAmountMobileMul: 1.0,  // mobile breath now matches desktop (same period AND swing) so the
  // breathing reads at the SAME speed/feel as desktop — a larger swing over the same period
  // made the brightness ramp faster per frame and read as "faster breathing" on mobile
  passMs: 850,                 // (legacy) forward-pass duration knob; wave now uses waveLayerGapMs
  waveLayerGapMs: 360,         // pause between layers firing — each layer snaps on, then
  // holds this long before the wave continues (slow, stepped)
  waveLayerGapFastMs: 200,     // tighter gap for the misclass green RE-run (still stepped)
  waveLayerGapMobileMs: 440,   // MOBILE tap-pass per-layer hold — larger than desktop's so each
  // layer clearly snaps on, HOLDS, then the next fires (hop-by-hop). Mobile has no input/output
  // vector beats bracketing the pass, so a bigger inter-layer gap restores the deliberate,
  // watchable feel. Desktop is untouched (still uses waveLayerGapMs).
  outputVecProbDelay: 1000,    // ms after the output vec appears (logits) before it
  // shows probabilities — tiles only react AFTER this, so
  // the answer is read FROM the probability vector
  subPathCount: 3,             // # of branching paths lit brighter + carrying particles
  pulseMs: 280,                // ms for one particle to traverse an edge
  pulseTrail: 3,               // trailing dots behind each particle
  bootStartDelayMs: 2040,      // beats 1+2 (name reveal, then socials one-by-one) land FIRST, then the net builds
  bootLayerStaggerMs: 260,     // delay between layers materializing (was 120 — slower, watchable)
  bootNodeStaggerMs: 55,       // delay between nodes within a layer (was 35)
  bootNodeFadeMs: 460,         // per-node fade+scale duration
  bootPhaseGapMs: 520,         // deliberate PAUSE inserted between each boot phase
  bootEdgeStaggerMs: 360,      // gap between convergence rounds — ≈ draw time so each round lands before the next starts
  bootEdgeDrawMs: 400,         // edge stroke-draw duration per round (snappier; each hop reads as a finished beat)
  bootWeaveColor: "#b9a8ff",   // light-purple stroke while weaving (engaging, distinct from rest blue)
  bootWeaveWidth: 1.6,         // heavier stroke during weave so edges forming are clearly visible
  bootWeaveOpacity: 0.78,      // weave-crest opacity (brightened — same hue, more luminous)
  bootFlushHoldMs: 320,        // hold the whole net at the weave crest once all edges are woven
  bootFlushFadeMs: 1500,       // then GRADUALLY fade color/width/opacity → dim rest (no abrupt switch-off)
  bootBtnRiseMs: 340,          // per-button fade-up duration
  bootBtnStaggerMs: 210,       // gap between buttons; ≈ riseMs so the next begins as the prior lands
  guideTypeMs: 36,             // ms per character of the guide-line typewriter
  idleIntervalMin: 3200,       // ms between idle pulses
  idleIntervalMax: 4200,
  misclassRate: 0.12,          // fraction of hovers that misclassify (~10–15%)
  mobileBreakpoint: 767,       // px; ≤ this → mobile layout
  dblClickWindowMs: 220,       // first click defers theater this long; a 2nd click within = double-click → plain-link nav, no net-flash
  settledLingerMs: 6000,       // how long settled state lingers before auto-reset (gives user time to click winner tile)
  driftAmplitude: 4,           // px of ambient node drift (the "alive" wobble)
  driftPeriodMin: 5200,        // ms — slowest node drift cycle
  driftPeriodMax: 8200,        // ms — fastest node drift cycle
};
