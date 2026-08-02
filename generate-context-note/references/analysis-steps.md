# Analysis Steps

> **When to read this file:** Always — both Mode A and Mode B must complete these steps before writing any output.

---

## Step 0 — Assess Scale

Before doing anything else, count the source files and estimate output size.

**Split triggers — use the 5-part set if ANY of these are true:**
- 4 or more JS files with more than 50 lines each
- Any single JS file > 300 lines
- Any WebGL, Canvas 2D, or physics simulation file is present alongside other large files
- Total CSS > 500 lines across multiple components

**Decision:**
- None of the triggers match → **single file**, continue to Step 1.
- Any trigger matches → **5-part set**, generate one part per response, then output `<!-- NEXT PART: Ask me for Part [N+1]: [Name] -->` at the end of each response.

---

### The 5-Part Set (Mode A only)

Each file must open with a **Part Header** as the very first lines of output. Copy this block exactly, substituting `[ResourceName]`, `[N]`, and `[Part Name]`:

```markdown
> **[ResourceName] — Part [N] of 5: [Part Name]**
> Read order: `_00_Index.md` → `_01_Markup.md` → `_02_Logic.md` → `_03_Effects.md` → `_04_Docs.md`
> **Start with `_00_Index.md`** — it contains Instructions for AI, dependencies, and the full file scope.
```

---

**Part 0 — `[ResourceName]_00_Index.md`**

The master entry point. Any AI should read this first.

Contains:
- Part Header (as above, but "Part 0 of 5: Master Index")
- Full **Instructions for AI** block (Section 2) — rules, response format, 5 questions
- Full **Dependencies** section (Section 3) — all CDN scripts and stylesheets in load order
- **File Scope** table listing every source file, its size, and which Part it appears in:

```
## File Scope

| File | Lines | Part |
|------|-------|------|
| index.html | 154 | Part 1 — Markup |
| css/style.css | 620 | Part 1 — Markup |
| js/main.js | 87 | Part 2 — Logic |
| js/modules/lenis-scroll.js | 40 | Part 2 — Logic |
| js/simulation.js | 665 | Part 3 — Effects |
| js/footer.js | 822 | Part 3 — Effects |
```

- **Suggested folder and file names** for all 5 parts — folder: `context-ai/`, files: `[ResourceName]_00_Index.md` through `[ResourceName]_04_Docs.md`

---

**Part 1 — `[ResourceName]_01_Markup.md`**

Contains:
- Part Header
- **HTML Architecture** (condensed templates, JS-targeted elements only)
- **CSS Architecture** (effect layer only: variables, keyframes, transitions, state selectors)
- Full **File Structure** section (if multi-page)

---

**Part 2 — `[ResourceName]_02_Logic.md`**

Contains:
- Part Header
- **JavaScript Effect Logic** — non-visual JS modules (routing, scroll, cursor, nav, preloader, animated-copy, utilities). Apply the complexity rule from Section 6: simple logic → algorithm + constants; complex logic with non-obvious sequencing → verbatim.
- Each file preceded by a `### filename.js` heading
- Excludes: WebGL, Canvas, shader, particle, and physics files (those go in Part 3)

---

**Part 3 — `[ResourceName]_03_Effects.md`**

Contains:
- Part Header
- Full **visual-effect files verbatim**: WebGL fluid simulations, Canvas 2D renderers, particle systems, GLSL shaders, physics solvers, and any file whose primary output is a visual element
- Each file preceded by a `### filename.js` heading
- These files are **never summarized** — always verbatim, always in full

---

**Part 4 — `[ResourceName]_04_Docs.md`**

Contains:
- Part Header
- Full **Section 7 — Documentation** for the entire resource:
  - One-line preamble
  - data-\* attribute reference (all attributes, 3-part pattern)
  - CSS variables with defaults and per-variable effect descriptions
  - JS configuration constants (Tweaking sections)
  - Animation Flow
  - Initialization order
  - Assets table
  - Fixed Parameters reference list
  - WebGL/Canvas pipeline documentation (config object, shader program roles, FBO architecture, render pipeline order, pointer mapping, canvas attachment, cleanup)
  - Any platform notes

---

## Step 1 — Analyze (silent)

Read the source code and determine:

| Question | Look for |
|---|---|
| Resource name? | Primary function in 2–5 words |
| External libraries? | `<script src>`, `<link href>` pointing to CDN/remote URLs |
| How many `data-*` attributes? | Count unique attribute names: 1–3 = few, 4+ = many |
| CSS custom properties? | Any `--variable-name` declarations |
| Animation present? | CSS transitions/keyframes, GSAP, `requestAnimationFrame` |
| External assets? | JSON files, remote images, fonts, 3D models |
| Init pattern? | `DOMContentLoaded`, `window.onload`, class instantiation |
| JS configuration variables? | Named constants at the top of a function that control behavior |
| Multi-page resource? | Multiple HTML pages with separate CSS/JS files per page |
| Fonts via CSS? | `@import url(...)` or `@font-face` declarations |
| WebGL / Three.js? | (Mode B) `import * as THREE`, canvas setup, renderer |
| Custom GLSL shaders? | (Mode B) `vertexShader` / `fragmentShader` strings, `ShaderMaterial` |
| Scroll-driven layout? | (Mode B) `min-height: Xvh`, scroll-to-progress math, lerp smoothing |
| FLOCSS used? | CSS class prefixes: `l-`, `c-`, `p-`, `u-` |
| BEM used? | Class names with `__` and `--` separators |
| JS/HTML separated? | JS selects via `[data-*]` only, never by `.className` |
| Mobile-first CSS? | Base styles without `@media`; breakpoints use `min-width` only |
| Self-initializing IIFE? | Visual-effect scripts that run immediately via `(function(){...})()` or top-level code — these must still be included verbatim |

**Hunt list — places AI commonly misses values (check every one explicitly):**

- `gsap.set()` calls buried inside **reset, cleanup, or resize functions** (not just at init)
- Animations inside **conditional blocks** (`if (window.innerWidth > 991)`, `if (prefersReducedMotion)`) — document the condition, not just the animation
- **Nested timeline steps** — trace each `.to()`, `.from()`, `.fromTo()` in order and note its position label (`"<"`, `"+= 0.1"`, `"label"`)
- **Stagger chains** — capture the stagger amount, the element order, and what triggers the chain
- **Uniform values computed from other constants** — e.g. `uTime.value += delta * speedFactor`, document the full formula
- **CSS variables set by JavaScript** — `el.style.setProperty('--progress', value)` — these drive visual state and are easy to overlook
- **Event-triggered state resets** — `resize`, `visibilitychange`, `popstate` handlers that reset animation state
- **Cursor lerp factor** — often a bare decimal constant at the top of the cursor function; it controls how the cursor *feels* and is easy to overlook
- **rAF loop variables** — all vars holding per-frame state and their initial values; without these, AI cannot reconstruct the loop
- **Preloader completion trigger** — the exact condition that ends the preloader and what its completion callback calls next; this determines whether scroll, Lenis, and hero animations actually initialize

---

## Step 1.5 — Code Trace (Mode A, skip for Mode B)

Before writing a single line of documentation, trace every animation in the resource from start to finish. For each animation, write a private mental note (do not output it) answering:

1. **Trigger** — What event or lifecycle call fires this animation? (`DOMContentLoaded`, `ScrollTrigger onEnter`, `mouseover`, `click`)
2. **Initial state** — What does `gsap.set()` apply before the tween runs? List every property and value. If no `gsap.set()` exists, what is the element's natural CSS state?
3. **Tween method** — `gsap.to()`, `gsap.from()`, `gsap.fromTo()`, `tl.to()`, `tl.fromTo()`?
4. **Animated properties** — Every CSS property changed, and the exact from/to values.
5. **Easing and duration** — The exact easing function string (e.g. `"power3.out"`) and duration in seconds.
6. **Timeline position** — If in a timeline, at what position does this step fire? (`0`, `"<"`, `"+= 0.2"`, a named label)
7. **Kill/reset** — Is there a function that kills this tween and resets its target elements? What properties get cleared and to what values?

Only after completing this trace for **every animation** should you begin writing Section 7.
