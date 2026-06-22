# Homepage Layout + Output Redesign — Implementation Plan

> **For agentic workers:** This is a BUILD plan for the next session. The homepage neural-net hero
> (`src/components/NeuralNet.astro` + `src/pages/index.astro` + dials in `src/config/constants.ts`)
> is already live and heavily polished. This doc adds a set of UX/layout upgrades the author
> requested after reviewing the live result state. **Read the HARD GUARDRAILS first.** Do the tasks
> roughly in the order listed (T1 → T6); T6 (navigation) is intentionally LAST and may be dropped.
>
> Status: **IN PROGRESS** (updated 2026-06-20 during implementation session).
> **Done:** T1, T2, T3 (+ funnel/diamond reshape & `papers` rename, beyond original scope), T5.
> **Remaining:** T4 (caption right-align — small, was deferred until after T5), a responsive
> multi-width hardening pass (verify 1280/1440/1920/2560 + ultrawide; tighten clamp bounds and
> the hand-tuned vector offsets), and T6 (navigation — still LAST + provisional, needs author
> re-confirm now that T5 has landed). See the per-task "STATUS" notes below.
>
> **Implementation notes / deviations from original spec:**
> - Winner color (T1) ended up **teal** with **iris runners-up** (author chose to swap from the
>   originally-planned iris winner). All winner cues — readout word, winning output node glow,
>   and the `argmax →` caption — are bound to teal; the net's general firing path stays iris.
> - T3 grew the net **vertically** (taller diamond) rather than horizontally, because widening
>   collided with the side elements. viewBox **900×620 → 900×720** (tall), plus a **funnel
>   silhouette** (`funnelMinSpread: 0.55` dial in `constants.ts` — input/output layers vertically
>   compressed toward center, middle layer full-height → `><` diamond). Author loves the diamond.
> - **`publications` → `papers`** rename: `site.ts` label changed (id + href stay `/publications`,
>   route untouched). Output tiles render `/{label}` so they show `/papers`; the `argmax` caption
>   matches. This shortened the longest word on both sides and reclaimed layout room.
> - **Key constraint learned:** `.nn-center` is screen-CENTERED and, on wide screens, **height-capped**
>   by `max-height: 98vh` — so on ≥~1400px the net width is set by `aspect-ratio × height`, NOT by
>   `--nn-net-w`/the reservation. Lowering the reservation only fills margin on narrower screens.
>   To make the net bigger on wide screens you must change the aspect ratio (wider = shorter), which
>   trades against the tall diamond. The side margins on wide screens are inherent to the tall shape.
> - The output **vector** now has its own right inset (`right: calc(--nn-vec-edge + 0.75rem)`) so the
>   wider winner readout box doesn't touch it — this is a hand-tuned offset that the responsive pass
>   should re-verify across widths.

---

## ⚠️ HARD GUARDRAILS — do NOT violate

### G1 — THE NET SIZE NEVER DECREASES. EVER.
The neural net is the hero. Across ALL changes in this doc (and any future work), the rendered net
**must be the same size or LARGER** than it is right now — **never smaller**, in either dimension.

- The size dial is `--nn-net-w` in `NeuralNet.astro` (`.nn-root`):
  **current value `min(84rem, calc(100vw - 28rem))`**. The viewBox is `900×620`, `aspect-ratio: 900/620`
  is locked, and `.nn-center` has `max-height: 96vh`. Because aspect ratio is locked, the net scales
  **uniformly** — growing width grows height proportionally.
- On wide screens the **`84rem` cap is the active limiter** (that is why there are black bands above
  and below the net in the result screenshot — the net is width-capped, not vertically full).
- **Allowed:** raise the `84rem` cap, reduce the `28rem` side reservation, raise `max-height`.
  All of these GROW the net.
- **Forbidden:** lowering the cap, increasing the side reservation, shrinking `max-height`, changing
  the `900×620` viewBox to be smaller, or any change whose net effect is a smaller rendered net at
  ANY common viewport (verify at 1280 / 1440 / 1920 wide).
- **If another element needs room, take it from PADDING/INSETS of that element — never from the net.**
  Vectors, nav words, output rows must shrink/tighten to make room; the net only ever gains space.

### G2 — Preserve the existing frozen mechanics (from the prior plan)
- `.nn-center` stays `position:fixed`, screen-centered. Do not change its centering/anchoring (you may
  change its *size* only in the GROW direction per G1).
- Seed is the logo: never reseed (`seed = 20260618`). `layersDesktop = [4,7,10,7,5]`.
- Additive motion only — animations settle back to the exact rest state.
- No browser storage (CLAUDE.md §12). No `<form>`.
- Everything stays in `NeuralNet.astro` / `index.astro` / `AmbientNet.astro`, with dials in `constants.ts`.

### G3 — Verify after every visual task
Author runs `npm run dev` and eyeballs live; you can also screenshot at 1280 / 1440 / 1920 wide.
Check each time: net unchanged-or-larger (G1), no element overlap, no horizontal scroll, mono/colors
on-brand. Mobile (≤767px) layout must not regress.

---

## Token reference (verified against `src/styles/global.css`, 2026-06-20)
```
--accent:        #7c8cff   (iris-blue — active path, links, the chosen WINNER)
--accent-bright: #a8b1ff   (firing peak / glow highlight)
--hover:         #5fd3c4   (teal — runners-up readout)
--amber:         #e3b341   (backprop / wrong-answer ONLY)
--text:          #e6edf3 ; --text-dim: #c9d1d9 ; --text-faint: #7d8590
--text-ghost:    #484f58   (dimmest — hints, /dev/null)
--t-2xs: 11px (smallest allowed) ; --t-xs: 12px ; --t-sm: 14px
--edge-pad: clamp(1.5rem, 4vw, 3.5rem)   (name top-left / socials top-right inset)
```

## Current layout (verified against `NeuralNet.astro`, 2026-06-20)
```
[ nav @ left:0.4rem ] [ input-vec @ left:--nn-vec-edge ] [ NET fills middle ] [ output-vec @ right:--nn-vec-edge ] [ tiles @ right:0.2rem ]
```
- `--nn-vec-edge: clamp(10rem, 11vw, 11rem)` (vector inset from each screen edge).
- `--nn-net-w: min(84rem, calc(100vw - 28rem))` — the `28rem` = total side reservation (≈14rem/side).
- `.nn-vec-col` width `34px`, hidden at rest (`opacity:0`), revealed during a pass.
- `.nn-caption` (the `argmax → …` line) is `position:fixed; top:3.5rem; right:1.5rem` — **overlaps the
  socials**, which sit at `top:--edge-pad; right:--edge-pad`.
- Output readout `.nn-right`: per-section `.nn-output-tile` = stacked `path` / `prob%` / `go →`,
  plus a separate `#nn-output-vec` showing the raw softmax (`0.04 / 0.05 / 0.8 / …`). **The softmax is
  shown twice** (vector decimals AND per-word %).

---

## T1 — Winner output color: white → accent iris-blue
**STATUS: ✅ DONE — but author swapped the choice to TEAL winner / IRIS runners-up** (not the iris
winner originally planned). `.nn-tile-winner` → `--hover` (teal) + teal bloom; `.nn-tile-revealed`
→ `--accent` (iris, dimmed 0.65). Winner node glow + `argmax` caption also teal. Folded into T5.

**Why:** Winner `.nn-out-path` is hardcoded `#ffffff` while runners-up are teal and the accent is iris —
white-among-green reads backwards. Author chose **iris-blue** (ties the winner to the network's own
firing color).

**File:** `NeuralNet.astro` (`.nn-tile-winner` rules, ~l.1763–1773).

```css
/* WAS: color:#ffffff for path, var(--text) for prob */
.nn-tile-winner .nn-out-path {
  color: var(--accent-bright);
  text-shadow: 0 0 14px rgba(124, 140, 255, 0.55);   /* keep the iris bloom */
}
.nn-tile-winner .nn-out-prob {
  color: var(--accent);
  font-weight: 600;
  opacity: 1;
}
```
Leave runners-up (`.nn-tile-revealed` → `--hover` teal) and `/dev/null` (`--text-ghost`) as-is.
Leave the WRONG/amber state (`.nn-tile-wrong`) as-is — amber is reserved for backprop.

**Note:** if T5's output redesign is chosen, fold this color into that work instead of doing it twice.

---

## T2 — Caption: two lines (loss + argmax), below the socials, on every settled result
**STATUS: ✅ DONE** as specced. Markup is now a 2-line `<div>` (`.nn-cap-loss` / `.nn-cap-argmax`);
`showCaption(loss, argmax, state)`; positioned `top: calc(--edge-pad + 2.6rem); right: --edge-pad`.
Argmax line colored teal (`--hover`) to match the swapped winner. (Final right-edge flush check =
T4, below.)

**Why:** (a) the single caption overlaps the social icons; (b) loss is only shown on the wrong/backprop
path, not on a normal correct settle — author wants BOTH a loss line and an argmax line at every result.

**Files:** `NeuralNet.astro` — caption markup (l.83), `showCaption`/`hideCaption` (l.884–893), the two
settle call-sites (l.1006 corrected-rerun, l.1031 correct pass), `.nn-caption` CSS (l.1826–1840).

**Markup** — replace the single `<p class="nn-caption">` with a 2-line block:
```html
<div class="nn-caption mono" id="nn-caption" aria-hidden="true">
  <span class="nn-cap-loss"></span>
  <span class="nn-cap-argmax"></span>
</div>
```

**CSS** — position BELOW the socials, right-aligned, two stacked lines, never overlapping:
```css
.nn-caption {
  position: fixed;
  /* socials sit at top:--edge-pad with ~1.65rem glyph height; clear them with a gap */
  top: calc(var(--edge-pad) + 2.6rem);
  right: var(--edge-pad);              /* share the socials' right edge (aligned frame) */
  display: flex; flex-direction: column; align-items: flex-end; gap: 0.15rem;
  font-family: var(--font-mono);
  font-size: var(--t-xs);              /* 12px */
  color: var(--text-faint);
  text-align: right; white-space: nowrap;
  pointer-events: none; z-index: 10;
  opacity: 0; transition: opacity 0.3s;
}
.nn-caption.visible { opacity: 1; }
.nn-cap-loss   { color: var(--text-faint); }          /* dim, secondary */
.nn-cap-argmax { color: var(--accent); }              /* iris — matches the winner */
/* amber override when backprop/wrong is showing */
.nn-caption.is-wrong .nn-cap-loss   { color: var(--amber); }
.nn-caption.is-wrong .nn-cap-argmax { color: var(--amber); }
```

**JS — `showCaption` becomes 2-field.** Replace the single-string API with `(loss, argmax, state)`:
```js
function showCaption(lossText, argmaxText, state /* "ok" | "wrong" */) {
  const cap = document.getElementById("nn-caption");
  if (!cap) return;
  cap.querySelector(".nn-cap-loss").textContent   = lossText || "";
  cap.querySelector(".nn-cap-argmax").textContent = argmaxText || "";
  cap.classList.toggle("is-wrong", state === "wrong");
  cap.classList.add("visible");
}
```
Update the three call-sites:
- Correct pass (l.1031): `showCaption("loss 0.04 ✓", \`argmax → ${href}\`, "ok");`
- Corrected re-run (l.1006): `showCaption("loss 0.04 ✓", \`argmax → ${href}\`, "ok");`
- Wrong/backprop (l.982): `showCaption("loss 0.87 — backpropagating…", "", "wrong");`
  (argmax line empty until the corrected re-run fills it).

Use a believable low loss for correct settles (≈ `0.03`–`0.05`). Keep it static per the Joke Budget
(no random/rotating values). The mobile rule that hides chrome can leave the caption as-is (it's
overlay, `top`-anchored; verify it doesn't collide on narrow screens — if it does, hide it ≤767px).

---

## T3 — Grow the net (G1: increase only) + thin the vectors
**STATUS: ✅ DONE — but solved by GROWING VERTICALLY + reshaping, not horizontal growth.** Widening
collided with the nav/readout, so instead: viewBox **H 620→720** (tall diamond), **funnel
silhouette** (`funnelMinSpread: 0.55` in `constants.ts` — ends pinched, middle full), vectors thinned
(`26px` col / `3px` bracket / tighter spacing), `--nn-vec-edge` now `clamp(7rem,7.5vw,9rem)`,
`--nn-net-w` `min(96rem, 100vw-20rem)`, `max-height: 98vh`. `publications→papers` rename freed room.
Output vector has its own inset (`+0.75rem`). **The original 3a CSS block below is SUPERSEDED** —
see the implementation notes at the top of this doc for the actual final values + the height-cap
constraint. Vectors at 11px floor preserved (3b honored).

**Why:** the net is width-capped (`84rem`) and leaves vertical black bands. Author wants it bigger in
BOTH dimensions while every other element keeps "just enough" room (no padding bloat).

**File:** `NeuralNet.astro` `.nn-root` tokens (l.1491–1495) and `.nn-center` (l.1656–1670), `.nn-vec-col`
(l.1571–1598).

**Step 3a — raise the cap, cut the reservation, raise max-height (all GROW the net):**
```css
.nn-root {
  /* vectors pulled closer to the edge so the freed middle goes to the net */
  --nn-vec-edge: clamp(7rem, 8vw, 8.5rem);     /* was clamp(10rem,11vw,11rem) */
  /* reservation cut from 28rem → ~22rem; cap raised 84rem → ~100rem */
  --nn-net-w: min(100rem, calc(100vw - 22rem)); /* was min(84rem, 100vw - 28rem) */
}
.nn-center { max-height: 98vh; }                /* was 96vh */
```
**Reservation floor (do not go below):** the LEFT side must clear the longest nav word —
`"publications"` ≈ 7rem at `--t-sm` mono — plus the input vector + gaps. The RIGHT side must clear the
longest output label (`"/publications"`) + `go`/affordance + output vector. ~22rem total (≈11rem/side)
is about the safe floor without overlap. If T5 narrows the output area, the right reservation can drop
further and the net grows MORE — re-tune `--nn-net-w` downward in the `100vw - Xrem` term (smaller X =
bigger net), never the cap downward.

**Verify (G1):** at 1920 wide, net should now fill ~98vh tall (height-capped) and be visibly wider than
before; at 1440 and 1280, confirm it grew or held — NEVER shrank — and nav/vectors/outputs don't collide.

**Step 3b — thin the vector columns** (less horizontal footprint, numbers still legible at 11px):
```css
.nn-vec-col { width: 26px; }            /* was 34px */
.nn-bracket { width: 3px; }             /* was 4px */
.nn-vec-values { gap: 0.32rem; padding: 0.28rem 0; }  /* was 0.4rem / 0.35rem */
```
Keep `.nn-vec-row` at `--t-2xs` (11px floor). Do NOT shrink numbers below 11px (CLAUDE.md §4 / the
"no more 7px" note in code). The point is a slimmer column, not smaller text.

> If T5 removes/merges the output vector, `#nn-output-vec` may go away entirely — even more room for the net.

---

## T4 — Top-corner alignment polish (Apple-grade frame)
**STATUS: ⏳ REMAINING (next up).** Was intentionally deferred until T5 finished (T5 reshaped the
right side). The caption is already structurally flush-right (`right: --edge-pad`, same as the
socials), but author perceives a small misalignment — needs a live eyeball against the FINAL layout
and a possible small nudge so the caption's right edge meets the social-icon glyph edge. This is
author requirement #1.

**Why:** make the chrome read as a deliberate frame: name (top-left) and socials+caption (top-right)
share a clean baseline; guide centered at bottom (already is).

- Ensure the name (`.home-name`, index.astro) and `.home-socials` share the same `top: --edge-pad`
  baseline (they already do — verify after T2 that the caption stacks cleanly *under* the socials with
  even spacing, right edges aligned to `--edge-pad`).
- Keep the bottom guide line as-is (already retuned: `--text-faint 70% / #b9a8ff 30%`, opacity 1).
- No new chrome, no labels on the net. Whitespace carries the calm (CLAUDE.md §12).

This is a verification/nudge task, not a big build — fold into T2/T3 verification.

---

## T5 — Output readout redesign (the right-side area) — PICK ONE next session
**STATUS: ✅ DONE — built to a custom author spec (not A–D verbatim).** Output rows now mirror the
INPUT nav buttons (same mono, `0.92rem`). The **winner** gets a bordered box echoing the clicked-input
outline (teal `--hover` border + soft glow), with the path word + `%` + `go →` **centered inside the
box**. **Runners-up are word-only** (no per-row %) and reveal **sequentially** after the winner
(existing 650ms + 220ms stagger). The duplicate-softmax problem is resolved: only the winner shows a
`%`; all raw decimals stay in the `#nn-output-vec` PROBABILITIES bracket (the "math artifact"). T1's
teal winner is folded in. `go →` recolored to teal. Closest to **Option A/B** intent.

**Why:** the current output readout is not Apple-grade. Concrete problems (from the result screenshot):
1. **Duplicate softmax:** `#nn-output-vec` shows `0.04/0.05/0.8/0.08/0.03` AND each word shows
   `4%/5%/80%/8%/3%` — the same data twice, two number columns competing.  **Author wants this
   resolved (unify/dedupe), not just restyled.**
2. **Disconnection:** the prob vector and its matching label (`/projects ↔ 0.05`) aren't visually bound;
   the eye must map row-to-row across a gap.
3. **Weak winner focal:** `/publications 80% go →` doesn't clearly read as "THE answer"; `go →` is tiny.
4. **Busy:** five right-aligned mono rows + a bracketed decimal vector = a lot of small text stacked.

**Constraints for ALL options:** respects G1 (narrower output area = MORE net room, good); keep the
softmax "real math" story somewhere (CLAUDE.md §10 values the chars→ids→embedding→logits→softmax chain
— don't delete the math, just stop showing the *probabilities* twice); winner uses iris (T1); runners-up
teal; `/dev/null` ghost; argmax/loss now live in the caption (T2), so the readout itself doesn't need to
repeat the argmax.

### Option A — Bind label + prob into one unit, drop the separate % (RECOMMENDED starting point)
Each row becomes a single bound element: `label` on the left of its row, the probability as a compact
value (or micro-bar) on the right of the SAME row — so `/projects` and its weight read as one thing.
Remove the per-word standalone `%` duplication; the row's value IS the prob. Keep `#nn-output-vec`
(the raw decimals) as the dim "math artifact" OR drop it (see Option B).
```
            /about        ▁  4%
            /projects     ▁  5%
  ────────  /publications ████ 80%   ◀ winner (iris, larger, bloom)
            /blog         ▁  8%
            /dev/null     ·  3%      (ghost)
```
*Pros:* binds label↔weight, kills the row-mapping gap, gives a calm single column, winner clearly focal.
*Cons:* introduces a tiny bar element (new markup); must keep it subtle so it doesn't fight the net.

### Option B — Drop the duplicate number column entirely; keep ONE representation
Keep the bracketed `PROBABILITIES` vector as the ONLY softmax display (it's the on-brand "math"
artifact), and reduce the word column to **labels only** (no %). The vector shows the numbers; the words
are pure navigation. Winner word = iris + bloom; the winner's vector row also brightens to iris so the
eye links them.
```
  about-words (labels only)        PROBABILITIES
            /about                   ┌ 0.04 ┐
            /projects                │ 0.05 │
            /publications  ◀ winner  │ 0.80 │ ◀ iris row
            /blog                    │ 0.08 │
            /dev/null                └ 0.03 ┘
```
*Pros:* simplest dedupe, narrowest word column (net grows most), keeps the elegant bracket vector.
*Cons:* numbers live away from labels (still some mapping) — mitigate by brightening the winner's vector
row to match the winner word.

### Option C — Winner-focal hierarchy (de-emphasize the losers hard)
Keep labels + a single value each, but push the hierarchy: winner is large/iris/bloom and clearly a
link; runners-up collapse to very dim small rows; `/dev/null` nearly invisible. The result reads as
"the answer is /publications" with the alternatives as quiet context.
```
            /about  4%   /projects 5%   /blog 8%   /dev/null 3%   ← tiny, dim, single line
                      ┌─────────────────────────┐
                      │  /publications   0.80    │  ← big iris focal, the link
                      └─────────────────────────┘
```
*Pros:* strongest "this is the answer" moment, very Apple (clear focal + quiet context).
*Cons:* changes the column rhythm most; the single-line losers need careful spacing to not look cramped.

### Option D — Single weight-bar visualization (no number columns at all)
Replace BOTH number columns with one elegant horizontal weight bar per label (bar length = prob), value
shown only on the winner. The softmax becomes a *picture* of confidence rather than digits.
```
  /about        ▏
  /projects     ▎
  /publications ████████  80%   ◀ iris, the only number shown
  /blog         ▍
  /dev/null     ▏
```
*Pros:* calmest, most modern; instantly legible confidence; minimal text. Keeps the bracket vector
optional as the "raw math" easter egg on hover.
*Cons:* loses the explicit per-class numbers (some may want them); bars must be subtle on the dark bg.

**Recommendation:** start from **A** or **B** (both dedupe and bind/clarify). Author to choose next
session after T1–T4 land and the layout is re-evaluated. Whatever is chosen, fold T1 (winner iris) into it.

---

## T6 — Navigation model — DOCUMENT, BUILD LAST, RE-EVALUATE
**STATUS: ⏳ REMAINING — NOT STARTED, still provisional.** T1–T5 have now landed, so the precondition
("review the post-T5 homepage and re-confirm") is ready. Author has NOT yet re-confirmed the
auto-navigate-after-hold behavior. Today the net still lingers + resets (no auto-nav, no true
double-click skip). Do not build until author confirms.

**Decision (locked for now, but provisional):** keep the CURRENT intent —
> **one click → the network process runs → result displays → wait a beat → auto-navigate to the target
> page. DOUBLE-CLICK → skip the wait and go to the page directly.**

**Why this is LAST / provisional:** the author wants to re-evaluate whether the auto-navigate-after-wait
is still the right call *after* T1–T5 change how the result looks and feels. The output redesign (T5) may
make the result moment compelling enough that the timing/skip behavior should change. **Do not finalize
T6 until the author reviews the post-T5 homepage and confirms.**

**Rationale captured (so it isn't "fixed" the wrong way by a future agent):**
- The hero effort is NOT wasted by navigating, because the **forward-pass theater plays on the click and
  is shown during the readable hold BEFORE navigating** — the user sees the magic, then arrives.
- **Idle breathing + idle pulses** own the *resting* state (before any click) — they justify themselves
  independently of navigation; a click ends idle, so they never compete.
- The hold-before-nav is what keeps the click-theater meaningful — **do not tune the hold to zero**, or
  the animation becomes a thing the user never sees.

**Current code (for reference when building):**
- `runClickPass` (NeuralNet.astro ~l.957) plays the pass and currently calls `scheduleAutoReset` on
  settle (l.1007, l.1032) — it does NOT auto-navigate today; it lingers then resets. To honor the locked
  decision, the settle handlers should instead schedule a navigation after a hold (e.g. ~700–900ms),
  cancelable by `animToken` change.
- Instant skips already exist: 2nd click on same section → `handleBtnClick` navigates (l.1169);
  `Enter` when settled → navigates (l.1204); winner tile is clickable via `setOutputClickable`.
- The guide line currently reads `click once to see the magic · double-click to miss it` (verbatim,
  author wants it kept). The "double-click to miss it" copy should map to the **double-click = skip**
  mechanic — wire an actual `dblclick`/second-click skip so copy and mechanic finally agree (today
  there's no true double-click handler; see the flag in the prior plan).
- The tiny `.nn-go` "go →" affordance: if T5 redesigns the readout, the explicit "go" may be removed
  (auto-nav handles it) or replaced by a clearer cue — decide alongside T5.

**Do NOT build T6 until T1–T5 are in and the author has re-confirmed.**

---

## Suggested order
1. **T1** winner iris (tiny, isolated) — or fold into T5.  → ✅ DONE (as TEAL, folded into T5)
2. **T2** caption two-lines-below-socials (markup + JS + CSS).  → ✅ DONE
3. **T3** grow the net + thin vectors (the big visual win; G1-critical).  → ✅ DONE (vertical + funnel)
4. **T4** top-corner alignment verify (rolls into T2/T3 checks).  → ⏳ REMAINING (next up)
5. **T5** output redesign — author picks an option, then build it (folds in T1).  → ✅ DONE
6. **T6** navigation — only after author re-evaluates the post-T5 homepage.  → ⏳ REMAINING (provisional)

## REMAINING WORK (as of 2026-06-20 session end)
1. **T4 — caption right-edge flush with socials** (author req #1). Small, next up. Live eyeball + nudge.
2. **Responsive / multi-width hardening pass** (author asked: "is this only for my laptop?"). The
   layout uses `clamp()`/`vw`/`vh` so it scales, BUT the gaps were hand-tuned at the author's ~1920px
   screen and several offsets are fixed `rem` (the output-vector `+0.75rem`, the insets). Verify at
   **1280 / 1440 / 1920 / 2560 + ultrawide**, tighten clamp bounds + offsets so gaps hold everywhere.
   Mobile (≤767px) is a separate, already-specced path (`[4,5,5,5]` vertical) — re-verify it didn't
   regress from the viewBox/funnel changes. Best done by actually rendering at each width, not math
   (math is what kept producing collisions this session).
3. **T6 — navigation** (auto-nav-after-hold + true double-click skip). Provisional; needs author
   re-confirm now that the post-T5 result looks different.

**Dropped this session:** an idea to animate the input nav words from a centered idle position to the
clamped-left position on click and back on idle — author decided it's not needed (would compete with
the forward-pass theater).

## Additional improvement ideas (beyond the author's list — optional, propose before building)
- **Hue budget discipline:** the page currently carries iris (net/winner), teal (runners-up), green-ish
  accents, purple (boot weave), amber (wrong). That's a lot. Consider locking the *steady-state* palette
  to **iris = the network/answer, teal = alternatives, amber = error only**; keep purple strictly to the
  boot moment. Fewer hues = more premium. (No action unless author agrees.)
- **Vector reveal choreography:** the input/output vectors currently fade in (`opacity 0→1`). A subtle
  per-row stagger (top→bottom) on reveal would feel more "values streaming in" and match the boot care.
- **Winner node ↔ winner readout link:** when the winner settles, a one-shot faint connector glow from
  the winning OUTPUT node to its readout row would visually bind the net's answer to the text (currently
  they're separate). Must be subtle + settle back (additive only, G2).
- **Reduced-motion parity:** whatever T5 adds (bars/glows), provide a static equivalent under
  `prefers-reduced-motion: reduce`.
- **Result lingers long enough to read on auto-nav (if T6 stays auto-nav):** ensure the hold ≥ time to
  read the winner + caption; test with a real reader, not just by feel.
- **Mobile output:** verify the chosen T5 design degrades to the mobile single-result readout
  (`outputDisplay:"single"`, CLAUDE.md §13) — don't let a desktop bar/column break the `[4,5,5,5]`
  vertical mobile net.

---

## Self-review
- **G1 stated first and repeated** in T3 with explicit allowed/forbidden lists + verify steps. ✓
- **No code changed this session** — author explicitly deferred; this is a plan only. ✓
- **All 5 author points covered:** caption overlap+loss (T2), vector width (T3b), winner color (T1),
  go-button/navigation (T6), net-size-only-grows (G1/T3). ✓
- **Output redesign = several options to pick from** (A–D) with sketches + tradeoffs, dedupe flagged
  (author chose: yes, unify the duplicate softmax). ✓
- **Navigation documented as last + provisional** with rationale so it isn't mis-"fixed". ✓
- **Additional ideas** included as optional, propose-before-building. ✓
