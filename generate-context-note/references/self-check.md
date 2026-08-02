# Self-Check & Verification

> **When to read this file:** Always — run the appropriate checklist before producing final output.

---

## Step 4 — Self-Check

Before outputting, verify the items relevant to your mode:

### Shared (both modes)

- [ ] Every code fence opens and closes on its own line
- [ ] No encoding corruption — special characters preserved correctly
- [ ] `---` horizontal rules separate each major section
- [ ] All external dependencies listed in correct load order

### Mode A only

- [ ] Code Trace (Step 1.5) completed for every animation before writing Section 7
- [ ] Title format: `Resource Context (Code): [Name]`
- [ ] Instructions for AI has exactly 5 rules, with correct conditional rules applied
- [ ] **HTML Architecture:** condensed DOM template present, all `data-*` attributes shown with exact names/values, text replaced with placeholders
- [ ] **CSS Architecture:** all effect-related CSS variables included verbatim (timing, easing, transform values — NOT color/font vars), all `@keyframes` included verbatim, state selectors and structural position rules present
- [ ] **JS Architecture:** every function documented with purpose + algorithm + all numeric constants + GSAP tween table
- [ ] No verbatim CSS/HTML/JS bulk copy — file must be 20-40% of original source size
- [ ] All numeric constants captured (durations, delays, lerp factors, pixel values, stagger amounts)
- [ ] All GSAP tween parameters captured: method, target, properties+values, duration, easing, trigger
- [ ] All `data-*` attribute names spelled exactly as in source
- [ ] Documentation starts with a one-line preamble before the `###` sections
- [ ] Documentation uses correct depth (summary for 1–3 attributes, per-attribute for 4+)
- [ ] CSS variables documented with defaults and per-variable effect description (if present)
- [ ] JS configuration variables documented in a Tweaking section (if present)
- [ ] Third-party setup sections documented before attribute docs (if applicable)
- [ ] Animation documentation includes: trigger, method, properties+values, easing, duration, initial state
- [ ] ScrollTrigger / SplitText / Lenis specifics documented (if used)
- [ ] Kill/reset pattern documented (if present)
- [ ] Animation Flow, Init order, Assets table, Fixed Parameters, Shader docs included (if applicable)
- [ ] WebGL/Canvas files included verbatim with full pipeline documentation (if present)
- [ ] Custom cursor: lerp factor(s), elements moved, all state classes + triggers, magnetic attraction radius (if applicable)
- [ ] Non-WebGL rAF loop: all per-frame vars, lerp formula, CSS property written, start/stop condition (if applicable)
- [ ] Preloader: completion trigger, progress logic, hide tween, onComplete callback, minimum display time (if applicable)
- [ ] IntersectionObserver: threshold, rootMargin, class added, one-shot vs continuous (if applicable)
- [ ] Fallback values documented for every configurable `data-*` attribute (if applicable)
- [ ] Optional/Required label present for every `data-*` attribute (if applicable)
- [ ] CSS tweaking points documented as named sections if key behavior is CSS-controlled (if applicable)
- [ ] Non-obvious workarounds surfaced as explicit documentation, not just copied comments (if present)
- [ ] Value Pattern section present if multiple attributes share the same format (if applicable)
- [ ] Required HTML Structure overview at start of Documentation (if 3+ data-* attributes)
- [ ] Minimal HTML Structure section present for resources with 4+ data-* attributes (if applicable)
- [ ] Credits section present if source references an inspiration or base implementation (if applicable)
- [ ] CSS status hook attributes documented with all values + CSS usage example (if applicable)
- [ ] Lazy asset loading pattern documented — which attr holds URL, when src is set (if applicable)
- [ ] Required video HTML attributes (`muted`, `playsinline`, etc.) documented (if `<video>` present)
- [ ] Device capability detection documented if `matchMedia` used (if applicable)
- [ ] CSS Lookup Table section present if pre-calculated CSS option set provided (if applicable)
- [ ] SPA cleanup API documented with real framework integration example (if applicable)
- [ ] `prefers-reduced-motion` accessibility behavior documented (if `matchMedia` reduce used)
- [ ] Extension points documented as `### Extension Points` section (if comment-marked slots present)
- [ ] Temporary DOM manipulation create→animate→teardown lifecycle documented (if applicable)
- [ ] Framework boilerplate HTML/JS included as separate sections (if framework boilerplate provided)
- [ ] "No HTML/CSS provided" explicit statement in code block (if section is empty)
- [ ] Known Issues section present if compatibility gotchas mentioned in code or docs (if applicable)
- [ ] Callbacks section with lifecycle + practical example (if callback API present)
- [ ] Dual/mirrored list architectural constraint documented (if parallel lists required)
- [ ] GSAP Flip: getState → DOM op → from() + CSS incompatibilities documented (if Flip used)
- [ ] Keyboard navigation key map in `### Keyboard Navigation` section (if keydown listeners present)
- [ ] `is-active` class state documented, distinguished from data-attribute state machine (if applicable)
- [ ] Multi-class state system (`### State Classes`) with all classes + coexistence rules (if applicable)
- [ ] Security/anti-spam section with mechanism, threshold, adjustment guide (if applicable)
- [ ] DOM element private property flag documented (e.g., `__validationStarted`) (if applicable)
- [ ] Progressive validation activation conditions documented per field type (if applicable)
- [ ] Custom submit interception pattern: wrapper + hidden real submit documented (if applicable)
- [ ] HTML attribute repurposing documented with non-standard meaning noted (if applicable)
- [ ] Grouped field validation constraints on GROUP element documented (if applicable)
- [ ] Related Resources section present if companion/simpler/advanced versions referenced (if applicable)
- [ ] File saved to `context-ai/[ResourceName]_Context.md`
- [ ] **5-part set only:** Part Header present in every file, File Scope table in `_00_Index.md`, all 5 parts complete with correct filenames

### Mode B only

- [ ] Title format: `Recreate this site as a single HTML file: [Name]`
- [ ] "What it is" section has a rich visual/experiential description (not just technical)
- [ ] Page shell section covers DOCTYPE, fonts, importmap/CDN, scroll model, cursor
- [ ] Every component documented in DOM order with HTML + CSS + behavior
- [ ] JS grouped by function with prose before each code block
- [ ] Animation loop fully documented with lerp values and per-frame updates
- [ ] Init/bootstrap order stated (which function calls which, and in what sequence)
- [ ] Fixed Parameters section covers ALL numeric constants, grouped by category
- [ ] Assets table complete — no external file omitted
- [ ] Shader code included verbatim with section-by-section visual effect descriptions
- [ ] File saved to `context-ai/[ResourceName]_Prompt.md`

---

## Step 4.5 — Verification Pass (both modes)

Before producing the final output, go back to the source code and verify each of these against the actual code — not from memory:

### Numeric values
- Every number in the documentation (duration, easing duration, stagger, delay, lerp factor, pixel value, vh amount, `min-height`) — find it in the source and confirm it matches exactly.
- Every color value (`#000000`, `rgba(...)`) — confirm it is the value in the source, not an approximation.

### Animation behavior
- Every `gsap.set()` initial state — find the exact call in the source, including calls inside reset or resize functions.
- Every `from` and `to` value in each tween — confirm against the actual tween call.
- Every `ScrollTrigger` `start` and `end` value — confirm the exact string (e.g. `"top 80%"` not `"top center"`).

### Structural accuracy
- Every `data-*` attribute name — confirm the exact spelling used in the source HTML.
- Every CSS variable name and its default value — find the declaration in the CSS.
- Every external URL in Dependencies — confirm it is the exact URL in the source, not a reconstructed one.

### Completeness
- Every external file (image, model, JSON, font) referenced anywhere in the code — confirm it appears in the Assets section.
- Every JS configuration constant — confirm it appears in the Tweaking or Fixed Parameters section.

If any value in your documentation does not match the source exactly, correct it before outputting.
