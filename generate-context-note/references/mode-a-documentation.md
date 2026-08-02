# Mode A — Section 7: Documentation Rules

> **When to read this file:** Mode A only — these are all rules for writing Section 7 (Documentation for Resource). Every rule is conditional ("if the source has X → document it as Y"). Scan all rules to determine which apply to the current resource.

---

## Section 7 — Documentation for Resource

**Start with a one-line preamble** — before any `###` sections, write one sentence describing what the script or resource does in plain terms. Example:
> *The script `initMegaNavDirectionalHover()` drives a morphing dropdown on desktop (hover intent, directional panel switching) and a slide-over panel on mobile (≤ 991 px).*

**If the resource requires third-party setup** (API key, access token, external service account), document this BEFORE the attribute sections in dedicated `###` blocks. Each setup section must:
- State what the service is and why this resource needs it (one sentence).
- Show the exact config key the user must paste the value into, as an inline code snippet.
- Link to the service's registration or documentation page.
- If the library offers rich customization (map styles, themes), briefly explain that and link to it.

Example setup sections:
```
### API Token
This resource requires a Mapbox access token... paste it into `mapboxToken` in the config:
`const cfg = { mapboxToken: "pk.eyJ...", };`
Create a free account at [mapbox.com](https://www.mapbox.com/) and copy your token from the dashboard.

### Map Style
The visual style of the map is controlled by `mapStyle`... [See Mapbox Studio](https://www.mapbox.com/mapbox-studio).
```

---

## Documentation Depth

**Choose depth based on `data-*` attribute count:**

### FEW (1–3 unique attribute names) → Summary sections

Pick relevant sections (minimum 2):

| Section heading | When to use |
|---|---|
| `### HTML Setup` | Markup has special placement or usage requirements |
| `### Key Attributes` | Explains all `data-*` attributes together in one place |
| `### CSS Variables` | Resource uses CSS custom properties for configuration |
| `### Configuration Options` | JS constants or variables a user would tune |
| `### Animation Details` | Animation has named parameters or tuning options |
| `### Asset Dependencies` | External JSON, fonts, or images must be hosted |
| `### Browser Support` | Known limitations by browser or device |
| `### More Documentation` | Official docs for the library used exist |

### MANY (4+ unique attribute names) → Per-attribute sections

Create one `###` section per significant `data-*` attribute or concept, following this order:

---

## The 28 Documentation Items

Each item below is a conditional rule. If the source code exhibits the described pattern, include the corresponding section. If not, skip it.

1. **Structure** — outermost container first, innermost last (e.g., Container → Collection → List → Item → Card).
2. **State/Status** — attributes that change dynamically (e.g., `data-*-status`, `data-*-drag-status`).
3. **Controls** — interactive elements (prev/next buttons, dot navigation, numbered controls).
4. **CSS Variables** — in their own `### CSS Variables` section. Present all variables in a fenced `css` code block with inline comments showing defaults. After the code block, write **one sentence per variable** explaining the visual effect of increasing or decreasing its value.
5. **JS Configuration** — if the JS has named constants that control behavior (speed, easing, overscan, etc.), document them in a `### Tweaking [Behavior]` section listing all variables with their defaults and inline comments.
6. **Animation flow** — if the resource has a multi-step reveal or choreographed sequence (e.g., load → stagger title → fade description → scroll triggers next section), add a `### Animation Flow` section that describes the complete user experience from first paint to final scroll position as a numbered timeline. This helps AI understand the full choreography, not just individual parts.
7. **Init / Bootstrap order** — add a `### Initialization` section listing the exact order functions must be called at startup (e.g., "1. split titles, 2. create scene, 3. attach events, 4. start animate loop"). Incorrect order is a common cause of broken effects.
8. **Assets** — if the resource uses external files (images, 3D models, JSON, video), add a `### Assets` section with a markdown table: `| File | Usage | URL |`. Do not omit any asset.
9. **Fixed parameters** — for complex resources with many hardcoded numeric values (WebGL scenes, physics simulations, complex scroll math), add a `### Fixed Parameters` section that collects ALL critical constants in one place as a bulleted reference list. Group by category (camera, lighting, materials, animation timing, layout). This gives AI a single lookup table to cross-reference any value.
10. **Shaders** — if the resource includes custom GLSL shaders (vertex/fragment), document the shader's purpose, its uniform inputs, and what each major section of the shader code does. Do not paraphrase the shader — the verbatim code is in the JS section — but explain the visual effect of each numbered section (e.g., "Section 3 computes layered sine waves for the liquid-metal fold pattern").
11. **Utility notes** — overflow handling, responsive tips, resize behavior.
12. **Value Pattern** — if multiple attributes share the same value format (e.g., comma-separated strings like `"-5, 2, 6"` or CSS values like `"-13.75em, 0em, 13em"`), add a single `### Value Pattern` section explaining the format once. State: the separator used, how many values are expected, what happens when fewer values than elements are provided (loop / clamp / fallback), and the unit convention (px, em, rem, %). This prevents repeated explanation in every per-attribute section.
13. **Minimal HTML Structure** — for any resource with 4+ data-\* attributes, end the documentation with a `### Minimal HTML Structure` section. This is a complete, copy-paste-ready HTML snippet showing every data-\* attribute in use simultaneously on the minimal possible markup. Include HTML comments for variants if multiple layouts are supported. This is the single most actionable output for a developer integrating the resource.
14. **Required HTML overview** — when the resource has 3+ data-\* attributes, open the Documentation section with a `### Required HTML Structure` section (before the per-attribute sections). Show a condensed HTML structure with all attributes present, then a bullet list: `- **data-x** — one-sentence role, then "Required" or "Optional — [what happens if omitted]"`. This gives integrators a fast overview before they read the details.
15. **Non-obvious workarounds** — if the source code contains a comment flagging a workaround, hack, or non-obvious decision (e.g., `// cheeky workaround`, `// Safari fix`, `// buffer trick`), document it as a named section or inline note explaining the problem it solves and why the code is written that way. Do not silently copy the comment — surface it as explicit knowledge.
16. **Credits** — if the source code or a README references an external inspiration, original author, or base implementation (e.g., a CodePen, a library, a tutorial), add a `### Credits` section at the very end with the reference and a markdown link.
17. **CSS Lookup Table** — if the documentation includes a set of pre-calculated CSS values for the user to choose from (e.g., aspect ratio options, breakpoint presets, spacing scales), add a `### [Feature] Reference` section containing the full CSS snippet as a fenced code block. Label each option with a comment. Example: `[data-aspect-ratio="16:9"] { padding-top: 56.25%; } /* Landscape HD */`.
18. **SPA cleanup API** — if the script exposes a cleanup/destroy function for SPA use (e.g., removing observers, event listeners, timers on page leave), document: the function name, what it tears down, and show a real framework integration example (e.g., BarbaJS `barba.hooks.leave()`, Swup hook, or Vue `onUnmounted`). Do not just mention "a cleanup function exists" — show the actual usage.
19. **Device capability detection** — if the script uses `window.matchMedia` to differentiate behavior between hover/pointer devices and touch devices, document: the media query used, what `true` and `false` mean for each mode, and how each `data-media-mode` value maps to actual behavior on each device type.
20. **`prefers-reduced-motion`** — if the script checks `window.matchMedia("(prefers-reduced-motion: reduce)")`, document the accessibility behavior: what animation is skipped or replaced, what the user sees instead (e.g., immediate opacity swap), and how it is detected at init vs. on live change.
21. **Extension points** — if the script has comment-marked extension points (e.g., `// Runs once on first load`, `// YOUR FUNCTIONS GO BELOW HERE`, `// Add your init calls here`), document these as a `### Extension Points` section listing each slot, when it fires in the lifecycle, and what type of code belongs there.
22. **Temporary DOM manipulation** — if the script creates temporary DOM elements for an animation and tears them down afterward (e.g., a cube wrapper built for a 3D transition), document the full create → animate → teardown lifecycle: which elements are created, how they are inserted relative to existing DOM, what GSAP properties are set on each, and what the `onComplete` callback removes and restores.
23. **Known Issues / Potential Issues** — if the documentation or code comments mention a known compatibility problem (e.g., "overflow: hidden breaks FLIP animation", "Safari requires webkit attribute"), add a `### Known Issues` section near the end of the Documentation. Format: **Issue** + **Symptom** + **Fix or workaround**. This section protects integrators from silent failures caused by external CSS or HTML choices.
24. **Callback API** — if the script exposes lifecycle callbacks as a function options object (e.g., `createLightbox(el, { onStart, onOpen, onClose, onCloseComplete })`), document each callback in a `### Callbacks` section: name, when it fires in the lifecycle, and a practical integration example (e.g., `onStart: () => lenis.stop()`). This is distinct from the SPA cleanup API — these are user-supplied hooks, not internal cleanup functions.
25. **Dual / mirrored list architecture** — if the HTML requires two parallel, identically ordered lists of the same content (one for the trigger grid, one for the modal/lightbox), document this as a hard architectural constraint: both lists must contain the same items in the same order, what happens if they are out of sync (animation targets wrong item), and how the script pairs them (by index).
26. **Multi-class state system** — if the script applies multiple independent CSS classes to the same element simultaneously (e.g., `.is--error`, `.is--success`, `.is--filled`), document ALL classes in a `### State Classes` section. For each class: what it signals, what adds it, what removes it, and which other classes it can coexist with. Distinguish from a single-class toggle (`.is-active`) — here each class represents a separate dimension of state.
27. **Security / anti-spam features** — if the script includes bot protection or spam prevention (e.g., time-delta check, honeypot field, rate limit), document in a `### Security` section: the mechanism, the threshold, what happens on detection, and how to adjust or disable it.
28. **Related resources** — if the documentation references a simpler or more advanced version of the same resource, or links to companion tools, add a `### Related Resources` section at the end listing them with their purpose and link (if available).

---

## Writing Rules for Each Section

Use the `data-*` attribute name as context for the heading (e.g., `### Container` for `data-infinite-grid-init`).

Each section must follow this **3-part pattern:**

**① What it is** — One sentence: which element carries the attribute and what role it plays in the structure.

**② What the script does to it** — Describe the exact animation behavior:
- **Trigger:** What causes it — on load, on scroll (ScrollTrigger), on hover, on click, or on a custom event.
- **GSAP method:** Which method is used — `gsap.set()`, `gsap.to()`, `gsap.from()`, `gsap.fromTo()`, or a timeline (`tl.to()`, `tl.fromTo()`, `tl.set()`).
- **Properties & values:** List every animated CSS property and its from/to value. For `autoAlpha` (GSAP shorthand for `opacity` + `visibility`), note it explicitly. For `y`, `x`, `xPercent`, `scale`, specify the numeric values.
- **Easing & duration:** State the easing function (e.g., `power3.out`, `expo.inOut`) and duration in seconds.
- **Initial state:** If the script calls `gsap.set()` on init or in a reset function to set the element's starting state before any animation, document those property values — they are critical for the animation to work correctly.
- **Timeline position:** If the animation is part of a GSAP timeline with multiple steps, state when it fires relative to the timeline start (e.g., "fires at position `0`", "fires at position `0.1`", "fires after the previous step").

**③ Constraints / relationships** — If this attribute must match another attribute by value (e.g., `data-dropdown-toggle="products"` must pair with `data-nav-content="products"`), state the naming rule explicitly. If this element depends on a sibling or parent attribute being present, say so.

---

## Additional Writing Rules

- If an element has multiple states (e.g., `data-menu-open="false"` / `"true"`), list every state and describe what the script does when it enters that state.
- **Data-attribute state machine:** If a `data-*` attribute takes multiple named values that map to different CSS states (e.g., `data-item="hidden"`, `data-item="visible"`, `data-item="transition-out"`), document it as a `### States` section. For each state value: (a) what CSS rule selects it and what `transition` / `transform` it applies, (b) what JS action sets this value and when, (c) the lifecycle order — e.g., `hidden` → `visible` → `transition-out` → `removed`. This is a pure CSS animation system — not GSAP.
- If animation is **conditional** (desktop only, mobile only, scroll position), state the condition clearly.
- If multiple elements animate **in sequence** (stagger), describe the order, the stagger amount, and what triggers the chain.
- Do not copy JavaScript comments as documentation. Re-express them as plain behavior descriptions a non-developer can understand.
- **Prose-first for complex animations:** If a visual effect is geometrically or mathematically complex (3D cube transitions, fluid simulations, physics-based motion), add a `### How It Works` prose section before any technical documentation. Write 2–3 plain paragraphs that explain the visual illusion, the geometry, and the cleanup — as if explaining to a developer who cannot see the animation running.
- **Function Registry documentation:** If the script has structured initialization functions with a defined firing order (e.g., `initOnceFunctions`, `initBeforeEnterFunctions`, `initAfterEnterFunctions`), document them in the Initialization section with: (a) name, (b) when it fires in the SPA lifecycle, (c) what belongs inside it.
- **`prefers-reduced-motion` accessibility:** If the script uses `window.matchMedia("(prefers-reduced-motion: reduce)")`, document: the detection pattern, what animation is replaced (e.g., immediate opacity swap), and that it also listens for live changes via `addEventListener("change", ...)`. Note: this is an accessibility requirement, not optional.
- **Inline cfg snippets:** When describing a config value, show a partial snippet of just the relevant key(s) — not the full object. Format: `` `const cfg = { key: value, }` `` inline in the text, not in a separate code block. Use this for individual settings (zoom, duration, offset), not for the full Tweaking section.
- **Derived constants:** If a JS constant is calculated from a DOM measurement at runtime (e.g., `stepDistance = cardWidth * 0.5`), document the formula, what measurement it uses, and how to change the feel by adjusting the multiplier. This is different from a hardcoded constant because its actual value depends on the rendered layout.
- **DOM clone lifecycle:** If the script uses `cloneNode()` to spawn elements dynamically, document the full lifecycle: spawn → attribute/state change → CSS transition → removal. State which setTimeout values control each phase and what to adjust to change the timing rhythm.
- **Fallback values:** For every configurable `data-*` attribute, explicitly state what happens when the attribute is absent or malformed (e.g., "falls back to `0, 4, -4`", "defaults to `true`", "feature is disabled"). This is essential for integrators who want to use default behavior without setting every attribute.
- **Optional vs Required:** For every `data-*` attribute, explicitly label it as **Required** or **Optional**. If optional, state what happens when it is omitted (e.g., "Optional — the carousel will still work without it; the press animation will be skipped").
- **CSS tweaking points:** If a key visual behavior is controlled by a CSS property (not a JS constant), document it in a dedicated `### [Feature]` section. Examples: `perspective`, `transform-style`, `aspect-ratio`, `top` offset. Show the property, its default value, and a plain-English description of what happens when you increase or decrease it.
- **Two-ways pattern:** If a feature can be configured in two different ways (e.g., HTML-driven vs. JS array), document both methods clearly, label them ("Option 1", "Option 2" or "From HTML" / "From config array"), and explain when to use each.
- **"Can be removed" notes:** If a section of code is optional for simpler integrations (e.g., a resize debouncer, a platform-specific helper, a feature guard), note this explicitly: *"If you already handle breakpoint reinitialisation elsewhere, this helper can be removed."* This prevents integrators from cargo-culting code they don't need.
- **Platform notes:** If the resource has a known integration path with a specific platform (Webflow CMS, React, etc.), add a dedicated `### [Platform]` section at the end of the documentation describing how to wire it up.
- **DOM element private property flag:** If the script attaches a custom property directly to a DOM element to track internal state (e.g., `input.__validationStarted = false`), document: the property name, its possible values, what it controls, and what sets/unsets it. This is invisible to CSS and other scripts — flag it explicitly so integrators know JS uses this element as a state carrier.
- **Progressive validation:** If validation feedback (error/success classes) is deliberately delayed until after the user has interacted with a field, document the activation condition per field type: (a) for text/textarea: when `__validationStarted` becomes true (e.g., "after the first valid-length input event"), (b) for select: on `change`, (c) for checkboxes/radio: on `change` or `blur`. State clearly that pristine (untouched) fields show no error class.
- **Custom submit interception:** If the script intercepts the submit action using a wrapper element (e.g., `[data-submit]`) that validates before programmatically triggering the real `input[type="submit"]`, document both elements: the wrapper (what it handles, what it checks) and the hidden real submit (why it is hidden, that it is triggered via `.click()` only on validation pass).
- **HTML attribute repurposing:** If standard HTML attributes are used for non-standard purposes (e.g., `min`/`max` on `type="text"` for character count limits, not numeric range), document the repurposed meaning explicitly and note that it differs from the browser's native behavior for those attributes.
- **Grouped field validation constraints:** If validation constraints (`min`/`max`) are placed on a GROUP container element rather than individual inputs (e.g., `[data-radiocheck-group min="2" max="3"]`), document: which attribute carries the constraint, how the script reads it, and what the validation rule means semantically (e.g., "user must select between 2 and 3 checkboxes").

---

## Animation-Specific Rules (GSAP, ScrollTrigger, SplitText, Lenis)

- **ScrollTrigger:** Document `trigger` element, `start` and `end` values (e.g., `"top 80%"`, `"bottom top"`), `scrub` value, and whether `pin` or `markers` are used.
- **SplitText:** State what type of split is used (`lines`, `words`, `chars`), what the initial state of the split elements is (e.g., `autoAlpha: 0, y: 40`), and how they animate in (stagger direction, duration, easing).
- **Lenis:** Document the Lenis config options used (`duration`, `easing`, `smoothWheel`) and how it connects to GSAP ticker if a `gsap.ticker` integration is present.
- **Directional animation:** If the animation direction depends on scroll direction or user interaction direction (e.g., slide left vs. slide right based on which panel is active), document the logic used to determine direction.
- **Kill / reset pattern:** If the script has a function to kill running animations and reset elements to their initial state before re-animating (common in ScrollTrigger refreshes), document what properties get cleared and to what values.
- **GSAP Flip:** If the script uses the GSAP Flip plugin, document: (a) the element whose state is captured with `Flip.getState()`, (b) the DOM operation that happens between `getState()` and `Flip.from()` (e.g., `appendChild` to a new parent), (c) the `Flip.from()` options (`absolute`, `duration`, `ease`, `onComplete`), and (d) any CSS incompatibilities that break the Flip calculation (e.g., `overflow: hidden` on parent elements).
- **Factory function pattern:** If the script uses a factory function (e.g., `createLightbox(container, options)`) that initializes one instance per container element, document: the factory function signature, the options object with all accepted keys, the selector used to find container elements, and how multiple instances are created (e.g., `forEach` loop over `querySelectorAll`).
- **`is-active` CSS class state:** If the script toggles a CSS class (e.g., `.is-active`) to show/hide elements or change state, document which elements receive this class, what CSS applies to `.is-active` vs the default state, and what JS action adds/removes it. Distinguish clearly from data-attribute state machine (which uses attribute values instead of classes).
- **Keyboard navigation:** If the script adds `keydown` listeners, document the full key map in a `### Keyboard Navigation` section: key name, what action it triggers, and any guard conditions (e.g., "only active when lightbox is open"). Also note whether the key listener is scoped to the container or attached to `document`.
- **Custom cursor (lerp-based):** If the script drives a cursor-follow effect with linear interpolation, document in a `### Custom Cursor` section: the lerp factor(s), the element(s) moved each frame, all cursor state classes and what triggers each, magnetic attraction parameters (radius, target selector) if present, whether `requestAnimationFrame` or GSAP ticker drives the loop, and the kill/stop condition.
- **Non-WebGL `requestAnimationFrame` loop:** If the script runs a per-frame update loop outside of a WebGL render pipeline, document in a `### [Feature] Loop` section: all state variables tracked per frame and their initial values, the lerp formula and its factor, what DOM property or CSS variable is written each frame, and whether the loop runs forever or self-terminates.
- **Preloader sequence:** If a preloader runs before page content is revealed, document in a `### Preloader` section: what triggers completion, whether a progress counter is used and how it increments, the tween or transition that hides the preloader, and exactly what the completion callback does — this callback often enables scroll or fires the first hero animation and is critical for the page to function.
- **IntersectionObserver (component reveal):** If `IntersectionObserver` is used to reveal elements on scroll without ScrollTrigger, document: the `threshold` and `rootMargin` values, which class is added on intersection, whether the observer is one-shot or continuous, and the element selector.


---

## Animation-Specific Rules (CSS-transition-based, no GSAP)

- **CSS transition documentation:** When animations are driven by CSS `transition` (not GSAP), document for each transition: (a) which property is animated (`transform`, `opacity`, etc.), (b) duration and easing in the exact CSS cubic-bezier or keyword form, (c) what JS action triggers the state change (e.g., `setAttribute('data-x', 'visible')`), (d) what initial and final CSS values are applied per state.
- **`void` reflow trick:** If the script forces a layout reflow between two state changes (e.g., `void clone.getBoundingClientRect()`) to prevent CSS from batching transitions, document this explicitly and explain why removing it would break the animation.
- **CSS status hook:** If a `data-*` attribute's purpose is to expose JS state to CSS for styling (not to configure JS behavior), document it in a `### Status` section with the label **"CSS styling hook — JS writes, CSS reads."** List every possible value (`not-active`, `loading`, `playing`, `paused`, etc.), what triggers each value, and a usage example showing how CSS selects it: `[data-media-status="playing"] .cover-image { opacity: 0; }`.
- **Lazy asset loading:** If a media URL (video src, image src, JSON URL) is stored in a `data-*` attribute and only applied to the element by JS when needed, document this explicitly: state which attribute holds the URL, when JS sets the actual `src`, and why this prevents unnecessary network requests on page load.
- **Required media attributes:** If the resource uses `<video>`, document which HTML attributes are required for browser autoplay policies to allow silent autoplay: `muted`, `loop`, `playsinline`, `webkit-playsinline`. Note that removing any of these will break autoplay on mobile or Safari.
- **Device capability detection:** If the script uses `window.matchMedia` to split behavior between hover-capable and touch-only devices, document the exact query used, what the `true` branch does vs the `false` branch, and how each `data-*-mode` value maps to actual behavior on each device type.

---

## Canvas / WebGL Pipeline Documentation

> When WebGL, Canvas 2D, or GPU simulations are present.

These are complex visual systems. Without proper documentation, another AI cannot understand, modify, or debug them. Document each of the following in dedicated `###` sub-sections:

- **Config object:** List every property with its default value and what it controls visually. Use a fenced `js` code block showing the full config, with inline comments for each property.
- **WebGL context setup:** Document extensions requested (`OES_texture_half_float`, etc.), blend mode, power preference, alpha setting. State which WebGL version (1 or 2).
- **Shader programs:** For each shader program, document:
  - **Name** and its role in the pipeline (e.g., "advection — moves velocity/dye fields forward in time")
  - **Uniforms** with their types and what values are passed in
  - The full GLSL source is already in the JS section (verbatim) — reference it, don't repeat it
- **Framebuffer architecture:** Document single vs double-buffered FBOs, their dimensions relative to the viewport, texture filtering (`LINEAR` vs `NEAREST`), and the swap pattern.
- **Render pipeline order:** List the exact sequence of passes per frame as a numbered list (e.g., 1. advect velocity, 2. advect dye, 3. compute curl, 4. apply vorticity, 5. compute divergence, 6. clear pressure, 7. solve pressure (N iterations), 8. gradient subtraction, 9. display).
- **Pointer / input mapping:** How mouse/touch coordinates are normalized to UV space, how velocity is computed from delta movement, and the scale factor applied.
- **Canvas attachment:** How the canvas enters the DOM (createElement + appendChild vs pre-existing element), CSS applied to it (position, z-index, mix-blend-mode, pointer-events), and any visibility transitions.
- **Cleanup / destroy:** If a cleanup function exists, document what it removes and how to trigger it.
- **IntersectionObserver gating:** If the simulation only runs when visible, document the observer setup, thresholds, and what happens when the element leaves the viewport.
