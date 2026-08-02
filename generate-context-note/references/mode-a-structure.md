# Mode A — Sections 1–6 Structure

> **When to read this file:** Mode A only — these are the templates for Sections 1 through 6 of the Context Note.

---

## SECTION 1 — Title

```
# Resource Context (Code): [Resource Name]
```

- Name the resource's primary function in 2–5 words. If a specific library is used, append it in parentheses: `Radial Cards Slider (GSAP)`.

---

## SECTION 2 — Instructions for AI

Always output this block exactly as written. Apply conditional rules below.

````
## Instructions for AI

You are receiving a production-ready resource. This resource has been professionally built, tested, and works exactly as intended. Follow these rules strictly:

### Rules

1. **Do not modify, refactor, or "improve" any code unless the user explicitly asks you to.**
2. **Do not suggest structural changes, optimizations, or alternative approaches unprompted.**
3. **Do not remove, rename, or restructure any `data-` attributes.** They are used for DOM targeting in JavaScript and are essential to how this resource works.
4. **Respect the animation approach used.** Animations may be CSS-based, JavaScript-based (typically GSAP), or a combination. Do not convert between approaches unless the user asks.
5. **Wait for the user to tell you what they want.** Your only job is to understand the code and respond to specific requests.

### Response format

After reading everything below, respond with:
- A one-sentence summary of what this resource does.
- Then ask the user these questions to understand what they need:

1. **Are you integrating this into an existing project, and if so, what stack?**
2. **Do you want to adjust any visual styling?**
3. **Do you want to modify any animation behavior?**
4. **Do you need to adapt the markup to fit your structure?**
5. **Or is there something else entirely you'd like to do with this resource?**

Wait for the user to respond before writing any code. Do not assume what they need.
````

**Conditional rule logic:**
- No `data-*` attributes found → **remove Rule 3**
- No animation found → **remove Rule 4**
- Special constraint exists (load order, class names, etc.) → **add a new numbered rule** describing it
- The total must always be exactly **5 rules**. If a rule is removed, re-number the remaining rules.

---

## SECTION 3 — Dependencies

List all external stylesheets and scripts in correct load order. Use HTML comment labels (`<!-- CSS -->` / `<!-- JS -->`) when both types are present.

```
## Dependencies

<!-- CSS -->
<link href="[css-url]" rel="stylesheet">

<!-- JS -->
<script src="[js-url-1]"></script>
<script src="[js-url-2]"></script>
```

If none: write `No external scripts are used in this resource.`

If fonts are loaded via CSS `@import`, list them in a `### Fonts (loaded via CSS)` subsection after the scripts.

If the library has official documentation worth linking, add a `### More Documentation` line at the end of the Dependencies section pointing to it.

---

## SECTION 3b — File Structure (multi-page only)

If the resource has multiple HTML pages or multiple CSS/JS files, add a `## File Structure` section showing the file tree. Use a plain code block (no language tag). If the resource is a single component (one HTML + one CSS + one JS) — **skip this section entirely**.

---

## SECTION 4 — HTML Structure (Effect Layer)

**Document only the HTML elements that the JS needs to select and manipulate.**

The goal: give AI the exact skeleton it needs to wire up the effect. Everything purely visual or textual can be omitted or reduced to a placeholder.

**Include:**
- Every element that carries a `data-*` attribute — exact attribute name and value
- Parent containers required for the effect's structural logic (overflow wrappers, perspective parents, clip containers)
- Sibling relationships the JS depends on (e.g., `.trigger` must be adjacent to `.panel`)
- Repeated elements: one instance + `<!-- × N items -->`

**Omit:**
- Text content → replace with `[Text]`
- Decorative/style-only wrappers JS never touches
- Icon markup, SVGs, images (unless JS targets them)
- Typography sub-elements (spans inside headings added only for styling)

**Always add a placement note** stating where this markup belongs in the page.

**Example:**
```html
<!-- Place inside <main>, one per page section -->
<section class="c-panel" data-panel="about">
  <div class="c-panel__track" data-panel-track>
    <div class="c-panel__item" data-panel-item> <!-- × 4 items -->
      <span class="c-panel__label">[Label]</span>
    </div>
  </div>
  <button class="c-panel__trigger" data-panel-next>[Text]</button>
</section>
```

**Multi-file:** Use a `### filename` sub-heading before each template block.

---

## SECTION 5 — CSS (Effect Layer)

**Document only the CSS that the effect depends on to function correctly. Style CSS belongs in Section 7 as prose — not here.**

The separation:
- **Effect CSS** (required here) = the CSS without which the effect breaks or looks wrong
- **Style CSS** (prose in Section 7) = colors, fonts, spacing, layout that AI can create freely

**Include — verbatim:**
- **CSS custom properties for effect behavior** — `--duration`, `--easing`, `--offset`, `--lerp` etc. Omit color/font variables unless the effect reads them.
- **`@keyframes`** — exact numeric states.
- **CSS transitions on JS-manipulated elements** — the property, duration, and easing curve exactly.
- **State selectors** — every CSS rule triggered by a `data-*` value or JS-toggled class: `[data-item="active"]`, `.is--open`, `.is--revealed`.
- **Structural position rules** — `position: fixed/absolute/sticky`, `z-index`, `overflow: hidden`, `pointer-events: none` on any container the effect depends on.
- **Effect-specific transforms** — `perspective`, `transform-style: preserve-3d`, `clip-path`, `mix-blend-mode`, `will-change`.

**Omit:**
- Colors, backgrounds, gradients → describe in Section 7
- Font-family, font-size, letter-spacing → describe in Section 7
- Margins, paddings, gaps used only for spacing → describe in Section 7
- Responsive breakpoints that don't change effect behavior

**Example:**
```css
/* Effect timing */
:root {
  --panel-duration: 0.7s;
  --panel-easing: cubic-bezier(0.76, 0, 0.24, 1);
}

/* Structural requirement */
.c-panel { position: relative; overflow: hidden; }
.c-panel__track { position: absolute; inset: 0; }

/* States JS toggles */
.c-panel__item {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity var(--panel-duration) var(--panel-easing),
              transform var(--panel-duration) var(--panel-easing);
}
[data-panel-item="active"] { opacity: 1; transform: translateY(0); }
```

---

## SECTION 6 — JavaScript (Effect Logic)

**The JS IS the effect. The goal is high-fidelity reproduction — not code compression.**

**Two formats depending on complexity:**

---

### Simple effects (CSS state toggles, basic scroll reveals, few tweens)

Document as **algorithm + constants table** — no verbatim code needed:

```
### [functionName]()

**Purpose:** [One sentence describing what this function does]

**Algorithm:**
1. On `DOMContentLoaded`, query all `[data-panel]` elements.
2. For each: attach `click` listener on `[data-panel-next]`.
3. On click: find current `[data-panel-item="active"]`, remove state, advance index (wraps), set next item to `"active"`.
4. If `window.innerWidth <= 991`: skip — mobile uses a different interaction.

**Constants:**
| Name | Value | Controls |
|---|---|---|
| `STAGGER` | `0.12` | Delay between item reveals |
| `THRESHOLD` | `0.8` | Scroll % to trigger reveal |

**GSAP tweens:**
| Target | Method | From → To | Duration | Easing | Trigger |
|---|---|---|---|---|---|
| `[data-panel-item]` | `gsap.from()` | `y: 40, opacity: 0` | `0.7s` | `power3.out` | ScrollTrigger `top 80%` stagger `0.12s` |

**Events:**
- `click` on `[data-panel-next]` → advance to next item
- `resize` on `window` → re-query breakpoint, kill/reinit if crossing 991px
```

---

### Complex effects (GSAP choreography, WebGL, Canvas 2D, physics, fluid simulation)

Include the effect JS **verbatim**. Complex timing sequences, shader code, physics math, and multi-step choreography cannot be accurately reproduced from a prose description — the exact code structure and values must be present.

**What to include verbatim:**
- The core effect function(s) — animation timeline, render loop, shader programs
- Init function showing the exact startup sequence and parameter values
- Any resize/cleanup handler that affects effect state

**What to omit even here:**
- Generic utility functions with no effect on output (pure debounce, generic `lerp` helper if not customized)
- Barba.js / Swup boilerplate (→ put in `## [Framework] Boilerplate JavaScript` section instead)

Format: fenced `js` code block, one `### [filename or functionName]` heading per module.

---

**Multi-file:** Use `### filename.js` heading before each module's section.

**Framework boilerplate:** Copy Barba.js/Swup files verbatim as `## [Framework] Boilerplate JavaScript` — these are short, standard, and integrators need them exact.
