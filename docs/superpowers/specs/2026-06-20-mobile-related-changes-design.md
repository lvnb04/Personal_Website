# Mobile-Related Changes — Design Spec

> **For the next session:** This is a standalone BUILD spec for the site's **mobile** experience
> (≤767px). It is a companion to `2026-06-20-inner-pages-design-unification-design.md` (the
> desktop/inner-pages frame redesign) — read that one too, but this doc owns everything mobile.
>
> **Why a separate doc:** mobile was found badly broken during a real-phone test (see §0). Two of
> the fixes are large enough to be their own efforts: (1) the **homepage mobile net was never
> actually built** (only the layer counts were swapped; the layout still renders the desktop
> landscape net into a ~70px sliver), and (2) the inner-page chrome needs a **hamburger menu**.
> Keeping them here avoids confusion with the desktop frame spec.
>
> **Decisions already locked by the author (do NOT re-litigate):**
> - Homepage **mobile freeze is LIFTED** — you MAY change the homepage layout for ≤767px ONLY.
>   Desktop (≥768px) homepage stays FROZEN (the `NeuralNet` desktop path is done and polished).
> - Inner-page mobile nav = **hamburger/kebab menu** (☰ top-right opens the nav list).
> - Blog post mobile text = **smaller body (~16–17px) + centered reading column**.
>
> Status: **SPEC — ready to implement next session.** Created 2026-06-20.

---

## 0. Observed problems (from a real-phone test, ~390px viewport)

**Homepage (`/`):**
1. **The net is invisible** — only a tiny faint cluster (~70px) in the screen center.
2. **The name collides with the nav words + social icons** at the top (all overlap).

**Inner index pages (`/about`, `/projects`, `/papers`, `/blog`):**
1. **Footer is asymmetric / badly placed** — socials, the `loss still decreasing` quip, and `rss`
   don't lay out cleanly; the quip wraps awkwardly.
2. **Header nav collides with the name** — "Bharateesha Lvn" and `about projects papers blog`
   are crammed onto one row and overlap.

**Blog post (`/blog/[slug]`):**
1. Same broken header (name + nav collision).
2. **The epoch element is not visible** (it's `display:none` ≤767px today — see §4).
3. **The kebab / "On this page" menu button** is unclear / missing in practice.
4. **First paragraph not centered; default font feels too big** — content needs a centered,
   comfortably-sized reading column.

---

## 1. Root-cause analysis (so the fix targets the cause, not symptoms)

### 1a. Homepage invisible net — THE key finding
- `NeuralNet.astro` → `buildModel()` always uses a **landscape `900×720` viewBox** and lays layers
  out **left→right**, regardless of `isMobile`. Mobile only swaps `layersMobile = [4,5,5,5]`
  (fewer nodes) — the *layout direction is still horizontal*.
- `.nn-center` width = `--nn-net-w: min(96rem, calc(100vw - 20rem))`. The `20rem` (≈320px) side
  reservation is for the **desktop** nav + vectors. On a ~390px phone that leaves
  `390 - 320 = ~70px` for the whole net → the landscape net is crushed into a 70px sliver.
- **Conclusion:** the CLAUDE.md §13 mobile net (`direction: "vertical"`, input row at top, single
  output pill at bottom) was **never implemented**. This must be built, not tuned. See §3.

### 1b. Homepage name/nav/socials collision
- On `/`, the name (`.home-identity`, fixed top-left), socials (`.home-socials`, fixed top-right)
  are fine on desktop. The **input nav labels** live in `.nn-left` (fixed left rail, vertically
  centered). At mobile the net is supposed to go vertical with inputs as a **top row** — but since
  the vertical layout doesn't exist, the left-rail nav + the top name overlap. Fixed by §3
  (vertical net puts inputs in a labeled top row, clear of the name).

### 1c. Inner-page header collision + footer
- Comes from the OLD `Header.astro` bar (name + nav on one flex row, `height:3.5rem`) and
  `Footer.astro` bar. The desktop frame spec already replaces these with floating corners, but its
  **mobile** behavior (hamburger, footer stacking) is specified here in §4–§5.

### 1d. Blog post text size/centering
- `Post.astro` reading column uses `--measure` (46rem) with `.container` padding `1.25rem`. On
  mobile the body inherits `font-body` at the global `1rem`/`line-height:1.6`, but the post may set
  a larger prose size. The column should be centered with even gutters and the base size trimmed.
  See §6.

---

## 2. Detection rules (use the right tool for each — CLAUDE.md §13)
- **Layout/visual** → CSS media queries, mobile-first (`min-width` to add desktop).
- **JS behavior (net config, hamburger)** → `window.matchMedia("(max-width: 767px)")` + a `change`
  listener (handles tablet rotation). The net already wires `mq.change → rebuildNetwork`; reuse it.
- **Hover vs tap (net interaction)** → `window.matchMedia("(hover: hover)")`. Never `ontouchstart`,
  never UA sniffing.
- Breakpoints: **mobile ≤767px · tablet 768px · desktop ≥1024px.**

---

## 3. Homepage mobile net — BUILD the vertical layout (`NeuralNet.astro`)

**Goal (CLAUDE.md §13):** a vertical top→bottom net that fills the phone screen; inputs as a
labeled row at the top; a single result readout pill at the bottom; tap = quick pass → navigate;
second tap = skip; idle pulse travels downward; NO hover-theater, NO backprop on mobile.

### 3a. Vertical model in `buildModel()`
- Add a **direction** branch. When `isMobile`, build the model **transposed**: layers stack
  top→bottom instead of left→right.
  - Use a **portrait viewBox**, e.g. `W = 420, H = 760` (tune; tall portrait to match a phone).
  - Layer axis = **vertical** (`y` advances per layer: `y = pad + (usableH/(layers.length-1))*li`).
  - Node spread = **horizontal** within each layer (`x` spreads across `usableW`), with the same
    funnel logic applied to the X spread instead of Y.
  - `layersMobile = [4, 5, 5, 5]` (4 inputs, 3 hidden; **no separate 5-output row** — output is a
    single pill, §3c).
- Keep the **seed** (`20260618`) so topology is deterministic. The mobile net is allowed to be a
  different shape than desktop (different viewBox/orientation) — it is NOT required to be the same
  logo, only deterministic.
- Implementation approach: factor the per-axis math so `buildModel` computes
  `(layerAxisPos, spreadAxisPos)` then maps to `(x,y)` based on `direction`. Cleanest is a small
  `direction` variable (`"horizontal" | "vertical"`) derived from `isMobile`.

### 3b. `.nn-center` sizing on mobile (CSS)
- The desktop `--nn-net-w: min(96rem, calc(100vw - 20rem))` and `aspect-ratio: 900/720` MUST be
  overridden ≤767px:
  ```css
  @media (max-width: 767px) {
    .nn-root { --nn-net-w: 100vw; }      /* no desktop side reservation on mobile */
    .nn-center {
      width: min(92vw, 30rem);            /* fill the phone width, small gutter */
      aspect-ratio: 420 / 760;            /* portrait, matches the mobile viewBox */
      max-height: 78vh;                   /* leave room for top name row + bottom pill */
      top: 50%; left: 50%;                /* stays centered */
    }
  }
  ```
- The desktop `.nn-left` (left nav rail), `.nn-vec-col` vectors, and `.nn-right` readout column are
  **hidden ≤767px** (`display:none`) — mobile uses input labels under the top nodes + a single
  bottom pill instead (§3c, §3d).

### 3c. Output = single readout pill (bottom)
- Replace the 5-row desktop readout with ONE pill at the bottom on mobile:
  `→ projects · 0.93` style. Markup: a `.nn-mobile-readout` element (mono, accent winner),
  `position: fixed; bottom: <above the guide line>; left: 50%; transform: translateX(-50%)`.
  Hidden at rest; shown after a tap-pass settles.
- Do NOT render the desktop per-section output tiles or the softmax vector on mobile.

### 3d. Inputs = labeled top row
- The 4 input nodes form the **top row** of the vertical net. Each input's **label**
  (`about · projects · papers · blog`) renders **below its node** (CLAUDE.md §13:
  `"publications" → "papers"` already done for width). Labels are the tap targets (≥44px incl.
  node + label + padding).
- This top row sits **below the name** (`--edge-pad + name height`), so it never collides with the
  top-left name (fixes §0 homepage #2). Verify the 4 labels fit at 375px without colliding —
  shrink label font toward `--t-2xs` (11px floor) if needed, never below.

### 3e. Interaction (mobile)
- Already partly wired: `wireButtons` routes mobile clicks to `handleBtnClick` (quick pass →
  navigate). Keep that. Ensure:
  - **Tap** an input label/node → quick forward pass down the vertical net → navigate.
  - **Second tap** during the pass → skip → navigate now (existing `isCommitting` path).
  - **No hover-theater, no backprop** (already guarded by `isMobile` returns at lines ~383/407/419).
  - **Idle pulse** travels **downward** on mobile (the idle pulse uses layer index; with the
    vertical model it naturally flows top→bottom — verify).
- `prefers-reduced-motion`: tap navigates instantly, no pass (existing reduced check in
  `handleBtnClick`).

### 3f. Name + socials on mobile homepage
- Keep name top-left, socials top-right (they're fine), but ensure the **input top row** starts
  below them. If 4 social icons (GitHub/LinkedIn/X) + name still feel tight at 375px, reduce the
  social icon `font-size` ≤767px. The guide line (`click once… double-click…`) stays at the bottom
  but must sit **above** the readout pill — re-stack if they overlap.

### 3g. Rebuild on rotation
- The existing `matchMedia("(max-width:767px)") change → renderNetwork()` already rebuilds on
  breakpoint cross. Confirm it also re-runs the vertical/horizontal branch correctly (it calls
  `buildModel` which reads `isMobile`). ✓ — just verify after building.

---

## 4. Inner-page mobile chrome — hamburger nav (`Header.astro`)

> Desktop frame (floating name top-left + nav top-right) is specced in the inner-pages doc §A.
> This is the **≤767px** behavior of that same `Header`.

- **Name** stays top-left (serif, fixed, → home) — same as desktop.
- **Nav** collapses into a **hamburger/kebab button (☰)** fixed **top-right** (where the desktop
  nav row is). Tapping it opens the nav list.
- **Menu panel:** on tap, a small panel/sheet appears (top-right anchored, or a full-width
  drop sheet) listing `about · projects · papers · blog` vertically, mono, the active item
  accented. Tap an item → navigate. Tap outside / a close affordance → collapse.
  - **No browser storage** (CLAUDE.md §12) — open/closed is in-memory JS state only.
  - Keyboard accessible: button is a real `<button aria-expanded>`; items are real `<a>`; focus
    trap is optional but Esc should close.
  - Animate open/close with `--ease`; respect `prefers-reduced-motion` (no slide, just toggle).
- **Tap target** ≥44px for the hamburger and each menu item.
- This fixes §0 inner #2 (name/nav collision) — the nav is no longer a row competing with the name.
- **Implementation note:** the hamburger needs a tiny bit of JS (toggle a class, click-outside to
  close). Keep it self-contained in `Header.astro` (script + styles in the component). The desktop
  nav row and the mobile hamburger are the same nav data, shown via CSS media query
  (`≥768px` = row, `≤767px` = hamburger button + panel).

---

## 5. Inner-page mobile footer (`Footer.astro`)

- Desktop: borderless row, quip centered, socials left, rss right (inner-pages doc §A5).
- **Mobile ≤767px:** stack cleanly so it's symmetric (fixes §0 inner #1):
  - **Socials row** centered on its own line (GitHub · LinkedIn · X · Email), tap targets ≥44px,
    even gap.
  - **Quip** (`loss still decreasing`) centered on the next line, `--text-ghost`, **no wrap mid-word**
    (`white-space: nowrap` if it fits, else allow a clean 2-line center).
  - **rss** centered below, or tucked with the socials — keep it visible but quiet.
  - Everything centered = symmetric. No border. Stays in normal flow at content end / viewport
    bottom (the sticky-footer flex from `Base.astro`).

---

## 6. Blog post mobile reading (`Post.astro` + `Toc.astro`)

### 6a. Centered, comfortably-sized reading column (fixes §0 post #4)
- Reading column: `max-width: min(var(--measure), 100% - 2rem)` and `margin-inline: auto` so it's
  **centered with even gutters** (CLAUDE.md §13 universal req). Verify the first paragraph and all
  prose are centered as a column, not flush-left with a big right gap.
- **Body font ≤767px:** target **~16–17px** base (`1rem`–`1.0625rem`) with `line-height ~1.6`.
  If the post prose currently renders larger (the author reports it "feels big"), set the mobile
  prose size explicitly. Headings scale down proportionally. Do not go below 16px for body
  (readability).

### 6b. Epoch element on mobile (fixes §0 post #2)
- Today `.progress-label` is `display:none` ≤767px (CLAUDE.md §13 said "hide label on mobile, keep
  the bar"). The author now WANTS the epoch element visible on mobile.
- **Change:** show the epoch label on mobile, repositioned to not collide with the hamburger.
  Options (pick during build, default = **A**):
  - **A (default):** keep the 3px progress **bar** at `top:0`; show the **epoch label** as a small
    pill pinned bottom-center or bottom-left (above the footer), `--t-2xs` mono, so it doesn't fight
    the top hamburger. It reads as a quiet "epoch 1/1 · NN% → converged ✓" status.
  - **B:** show it top-right but BELOW the hamburger button (stacked), matching the desktop
    "under the nav" rule.
- Keep the reading-focus peek/hide behavior if it still makes sense on mobile; if it conflicts,
  simplify to always-visible-but-dim on mobile.

### 6c. TOC on mobile (the "On this page" / kebab — fixes §0 post #3)
- ≤1000px the rail is replaced by a collapsed **"On this page ↓"** row that taps open into a list
  (CLAUDE.md §11 + §13). The author couldn't find this — verify the **`Toc variant="mobile"`** is:
  - Rendered on the post page (it is — `Post.astro` line ~81), and
  - Visibly tappable (clear affordance, ≥44px), and
  - Not hidden behind the hamburger or overlapping the title.
- If the mobile TOC affordance is unclear, make its label explicit (`On this page ▾`) and give it a
  visible bordered/tappable style. This is the "kebab/menu button" the author asked about on the
  post page (distinct from the nav hamburger in §4 — one is page-nav, this is in-article sections).
- **Clarify in build:** there are now potentially TWO menu-ish buttons on a post page — the nav
  **hamburger** (top-right, site sections) and the **"On this page"** TOC toggle (in-article).
  Keep them visually distinct and spaced so they're not confused (e.g. hamburger top-right corner;
  "On this page" as a full-width row under the title).

---

## 7. Universal mobile hard requirements (every page — CLAUDE.md §13)
- Viewport meta present (`width=device-width, initial-scale=1`) — already in layouts. ✓ verify.
- **Zero horizontal scroll:** verify `body.scrollWidth === window.innerWidth` at **375px** on
  every page (home, about, projects, papers, blog index, blog post).
- Touch targets ≥44px everywhere (nav items, hamburger, TOC toggle, tiles, social icons).
- Reading column / containers: `max-width: min(var(--measure), 100% - 2rem)`.
- Code blocks & tables: `overflow-x:auto` on their containers — never widen the page.
- Images: `max-width:100%; height:auto`.
- Tile grid: `repeat(auto-fit, minmax(280px,1fr))` → collapses to 1 column (already set —verify).
- Nav never wraps to two rows (solved by hamburger, §4).
- Term popovers (in posts): tap-to-toggle, viewport-aware (existing — verify on real phone).
- Top fade + content top-padding (inner-pages doc §A4) still apply on mobile so content clears the
  fixed name/hamburger.

---

## 8. File-by-file change summary (mobile)

| File | Mobile change |
|---|---|
| `src/components/NeuralNet.astro` | Build the **vertical** net (`buildModel` direction branch, portrait viewBox); `.nn-center` mobile sizing; hide desktop rail/vectors/readout ≤767px; single bottom **readout pill**; input labels under top-row nodes; verify tap-pass/idle-down/rebuild-on-rotate. (§3) |
| `src/config/constants.ts` | (Maybe) add mobile viewBox dims / `direction` dial if not hardcoded; `layersMobile` already `[4,5,5,5]`. |
| `src/components/Header.astro` | ≤767px: nav → **hamburger button + panel** (in-memory toggle, a11y, reduced-motion); desktop row hidden on mobile via media query. (§4) |
| `src/components/Footer.astro` | ≤767px: **centered stacked** socials / quip / rss; symmetric; borderless. (§5) |
| `src/layouts/Post.astro` | ≤767px: centered reading column; **smaller base font (~16–17px)**; **show epoch** label repositioned; ensure TOC "On this page" affordance is clear + distinct from the nav hamburger. (§6) |
| `src/components/Toc.astro` | ≤1000px mobile TOC: explicit `On this page ▾` tappable affordance, ≥44px, no overlap. (§6c) |
| `src/layouts/Base.astro` | Ensure top fade + content top-padding work at mobile widths with the hamburger. (§7) |

> **Depends on:** the inner-pages desktop frame (`2026-06-20-inner-pages-design-unification-design.md`)
> should be implemented first or together — the hamburger (§4) and footer (§5) are the mobile
> branches of that same `Header`/`Footer` redesign. The **homepage vertical net (§3)** is
> independent and can be built in parallel.

---

## 9. Verification (do on a REAL phone + DevTools device mode at 375 / 414 / 768)
Use `npm run dev -- --host` → open the printed Network URL on the phone (same Wi-Fi).

1. **Homepage:** the vertical net is clearly visible and fills the screen; 4 input labels fit under
   the top nodes without collision; name + socials don't overlap the net; tap an input → pass runs
   downward → navigates; second tap skips; idle pulse flows down; bottom readout pill shows after a
   pass. No horizontal scroll.
2. **Inner pages:** name top-left, **hamburger top-right**; tapping ☰ opens the nav list; active
   item accented; footer is centered/symmetric (socials, quip, rss); no name/nav collision.
3. **Blog post:** reading column centered with even gutters; body font ~16–17px (not oversized);
   **epoch label visible** (and not colliding with the hamburger); **"On this page"** TOC toggle is
   obvious and distinct from the nav hamburger; prev/next reachable.
4. **All pages:** `body.scrollWidth === innerWidth` at 375px (zero horizontal scroll); tap targets
   ≥44px; code blocks/tables/images never widen the page; reduced-motion respected.

---

## 10. Self-review checklist
- Root cause for the invisible net identified (landscape model squeezed by `100vw-20rem`), fix is a
  real vertical-layout build, not a tweak. ✓
- Each observed problem (§0) maps to a numbered fix (§3–§6) and a verification step (§9). ✓
- Locked author decisions (homepage-mobile freeze lifted, hamburger, smaller+centered post text)
  encoded as constraints, not re-asked. ✓
- Two potentially-confusing buttons on the post page (nav hamburger vs in-article TOC toggle)
  explicitly called out to keep distinct (§6c). ✓
- Dependency on the desktop frame spec stated; homepage net flagged as independently buildable. ✓
- No browser storage anywhere (hamburger/TOC state in-memory). ✓
- Open micro-choices (epoch placement A/B) have a default and are flagged. ✓
