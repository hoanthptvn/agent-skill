# Mode B — Recreation Prompt Structure

> **When to read this file:** Mode B only — these are the templates for Sections B1 through B10 of the Recreation Prompt.
>
> **Also read:** `code-conventions.md` — Mode B code must follow FLOCSS, BEM, data-*, and Mobile-first conventions.

---

## SECTION B1 — Title & Preamble

Open with this block:

```
# Recreate this site as a single HTML file: [Resource Name]

You are an expert creative front-end developer. Produce a **single self-contained `index.html`**
that reproduces the project below **exactly** — same layout, sections, visuals, motion, and
interaction. Pure HTML/CSS/JS in one file: no build step, no framework, no bundler.
Hardcode every value given here as a fixed constant.

Code conventions to follow strictly:
- **FLOCSS layers:** Foundation (no prefix) → Layout (`l-`) → Component (`c-`) → Project (`p-`) → Utility (`u-`). Declare styles in that order.
- **BEM naming:** `.block__element--modifier`. No nested elements (`.a__b__c` is invalid).
- **JS–HTML separation:** JavaScript selects elements exclusively via `[data-*]` attributes. Never use class selectors (`.className`) in JavaScript. Classes are the CSS layer's contract; `data-*` attributes are JavaScript's contract.
- **Mobile-first CSS:** Base styles target mobile. Use `min-width` media queries only. Group shared breakpoints into one `@media` block. Never repeat a property in a media query unless the value genuinely changes. When `max-width` is needed, always subtract `0.02px` (e.g., `max-width: 767.98px` not `768px`).
```

If the resource uses ES modules (Three.js, Mapbox GL, etc.), add the full `importmap` block here, with exact CDN version URLs.

---

## SECTION B2 — What it is

Write 3–6 sentences describing the resource as a visual and interactive experience — not as a technical summary. The reading AI will use this to calibrate the overall feel before seeing any code.

Cover: the visual mood, the primary element (3D model, particle field, animated grid), how scroll or interaction changes the scene, typography, color palette, and the key motion qualities (orbit, stagger, parallax).

Example tone: *"A cinematic, scroll-driven page centered on a glowing bronze horse rendered in WebGL on a deep-black stage. The camera orbits a full 360° as you scroll through 900vh. Molten sparks drift upward around the statue. The sole heading appears letter by letter in a blur-fade on load."*

---

## SECTION B3 — Page shell & libraries

Document the page skeleton in prose + code:
- `<!DOCTYPE>`, `lang`, `<title>`, `<meta charset>`, `<meta viewport>`
- Font loading strategy (CSS `@import` or `<link>`)
- All CDN `<script>` tags or `importmap` (exact version URLs — no "latest", no placeholders)
- The scroll model: `body` height in `vh`, how the canvas or main container is `position: fixed`, how the scroll position maps to progress
- Custom cursor setup (if any): which native cursor is hidden, how the custom element is structured

Include the actual code for each point.

---

## SECTION B4 — Global CSS

Output the complete global stylesheet in a fenced `css` code block:
- Universal reset (`*`, `html`, `body`)
- Background color, base font, text color
- Overflow and scrollbar-hiding rules
- `position: fixed` rules for the canvas and any full-viewport containers

---

## SECTION B5 — Layout & sections

Document every component in the page, **in exact DOM order** (top of `<body>` to bottom). DOM order determines z-index stacking — do not rearrange.

For each component:
1. A `###` heading with the component's name
2. The HTML markup in a fenced `html` block
3. The component's CSS in a fenced `css` block
4. A behavior description: what the element does, how it transitions, and how scroll or user input affects it

---

## SECTION B6 — JavaScript logic

Group the JavaScript into named sub-sections, each with:
1. A `###` heading for the system or function (e.g., "Scene setup", "Particle system", "Shader material")
2. 1–3 sentences explaining what this code does and its role in the overall experience
3. The verbatim JS in a fenced `js` block

**Order matters:** globals and constants first → setup functions → event listeners → animation loop last.

If the resource uses GLSL shaders, include the full vertex and fragment shader strings verbatim inside the JS function that creates the `ShaderMaterial`. Preserve all inline GLSL comments.

---

## SECTION B7 — Interaction & animation loop

This section documents the heartbeat of the resource: the `requestAnimationFrame` loop and all event listeners.

For the animation loop:
- Write a prose paragraph first: what drives it (scroll progress, elapsed time, mouse position), which values are lerped and by how much, what gets updated on every frame.
- Then output the complete `animate()` function in a fenced `js` block.

For each event listener (mousemove, resize, click, etc.):
- One sentence explaining what it does.
- Its code in a fenced `js` block.

---

## SECTION B8 — Fixed Parameters

Collect every hardcoded numeric value and constant into a single bulleted list, grouped by category. This is the most critical section for reproduction accuracy — every number the reading AI needs to hard-code must appear here.

Categories to cover (use only what applies): background, camera, renderer, lighting, material, geometry, particle system, animation timing, scroll math, layout, typography.

Example format:
```
## Fixed parameters (bake these in)

- **Background:** pure black `#000000`; fog density `0.01`.
- **Camera:** PerspectiveCamera(50, aspect, 0.1, 100); start position (0, 0.2, 3.0).
- **Renderer:** antialias on; pixelRatio `Math.min(dpr, 2)`; toneMapping ACESFilmic; exposure `2.2`.
- **Lighting:** ambient `#ffffff` @ intensity `0.1`; key SpotLight `#ffffff` @ `18.0` at (4, 6, 3).
- **Material:** roughness `0.42`; metalness `0.92`.
- **Animation:** orbit phi = `scroll * 2π`; radius = `4.2 - sin(scroll * π) * 0.6`.
- **Layout:** page height `900vh`; content padding `0 60px 40px 60px`.
```

---

## SECTION B9 — Assets

List every external file the resource loads — 3D models, images, video, JSON, fonts — in a markdown table:

```
## Assets

| Asset | Usage | URL |
|-------|-------|-----|
| [filename.ext] | [what it is used for] | [full URL] |
```

If an asset is generated in code (procedural canvas texture, noise, geometry), state that explicitly in the table: `| — | Spark texture: generated procedurally on canvas | — |`

---

## SECTION B10 — Initialization order

List the exact sequence of function calls required at startup. Incorrect order is one of the most common causes of broken effects in complex resources.

Example:
```
## Initialization order

1. Create renderer, scene, camera
2. Load GLTF model (async — all subsequent setup runs inside the loader callback)
3. Add lights and fog to scene
4. Build spark particle system
5. Attach scroll and resize listeners
6. Call `animate()` to start the rAF loop
```
