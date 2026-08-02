# Examples — Output Skeletons

> **When to read this file:** When unsure about the output format. These skeletons show the exact structure for Mode A and Mode B outputs.

---

## Example (Mode A — skeleton)

**Input:** *(user pastes any HTML/CSS/JS resource)*

**Output structure:**
```
# Resource Context (Code): [Resource Name] ([Primary Library if any])

## Instructions for AI

You are receiving a production-ready resource. This resource has been professionally built, tested,
and works exactly as intended. Follow these rules strictly:

### Rules

1. **Do not modify, refactor, or "improve" any code unless the user explicitly asks you to.**
2. **Do not suggest structural changes, optimizations, or alternative approaches unprompted.**
3. **Do not remove, rename, or restructure any `data-` attributes.** They are used for DOM
   targeting in JavaScript and are essential to how this resource works.
4. **Respect the animation approach used.** [CSS / GSAP / rAF / ScrollTrigger — state which.]
   Do not convert between approaches unless the user asks.
5. **Wait for the user to tell you what they want.** Your only job is to understand the code
   and respond to specific requests.

### Response format

After reading everything below, respond with:
- A one-sentence summary of what this resource does.
- Then ask the user these questions:

1. **Are you integrating this into an existing project, and if so, what stack?**
2. **Do you want to adjust any visual styling?**
3. **Do you want to modify any animation behavior?**
4. **Do you need to adapt the markup to fit your structure?**
5. **Or is there something else entirely you'd like to do with this resource?**

Wait for the user to respond before writing any code.

---

## Dependencies

[All script/link tags in exact load order]

---

## HTML Architecture

<!-- Place inside [container] -->
```html
[Condensed DOM skeleton showing only JS-targeted elements with data-* attributes]
```

---

## CSS (Effect Layer)

```css
/* CSS variables for effect timing/behavior */
[--var: value]

/* Keyframes */
[@keyframes ...]

/* State selectors and transitions */
[[data-state] { ... }]
```

---

## JavaScript (Effect Logic)

### [functionName or Module]()

**Purpose:** [One sentence]
**Algorithm:**
1. [Step 1]
2. [Step 2]

**Constants:**
- `[NAME]` = `[value]` — [controls what]

**GSAP tweens:**
| Target | Method | From → To | Duration | Easing | Trigger |
|---|---|---|---|---|---|
| `[selector]` | `gsap.to()` | `[props]` | `[Xs]` | `[ease]` | `[event]` |


---

## Documentation for Resource

[One-line preamble describing what this resource does overall.]

### [PrimaryAttribute]
[① What it is] — Which element carries this attribute and its structural role.

[② Behavior] — Trigger: [event or lifecycle]. Method: [gsap.to / classList.add / etc.].
Properties: [prop: value]. Easing: [fn]. Duration: [Xs]. Initial state: [gsap.set values].

[③ Constraints] — Naming rules, required siblings, dependencies on other attributes.

### [StatusAttribute]
Which element carries this attribute. Lists every state value and what the script does in each:
- `"[value]"` — [what happens]
- `"[value]"` — [what happens]

### Tweaking [Behavior]

`const [variable] = [value]; // [what it controls]
const [variable] = [value]; // [what it controls]`

Suggested file name: [ResourceName]_Context.md
```

---

## Example (Mode B — skeleton)

**Input:** *(user pastes any HTML/CSS/JS resource)*

**Output structure:**
```
# Recreate this site as a single HTML file: [Resource Name]

You are an expert creative front-end developer. Produce a **single self-contained `index.html`**
that reproduces the project below **exactly** — same layout, sections, visuals, motion, and
interaction. Pure HTML/CSS/JS in one file: no build step, no framework, no bundler.
Hardcode every value given here as a fixed constant.

## What it is

[Cinematic description: visual mood, primary visual element, how scroll/interaction changes
the scene, typography, colors, key motion details. NOT technical — describe the experience.]

## Page shell & libraries

- DOCTYPE html, lang="en", UTF-8, responsive viewport.
- Font: `[import URL]`
- Libraries: `[CDN tags or importmap in exact load order]`
- Body: `min-height: [X]vh`. [Scroll model: fixed canvas / scroll-to-progress math.]
- [Custom cursor strategy if present.]

## Global CSS

```css
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { background: [color]; color: [color]; font-family: '[font]', sans-serif; }
body { min-height: [X]vh; overflow-x: hidden; }
[canvas / main container] { position: fixed; inset: 0; width: 100%; height: 100%; z-index: [n]; }
```

## Layout & sections

### [Component name — in exact DOM order, outermost first]
```html
[exact HTML markup]
```
```css
[component CSS]
```
[Behavior: what it does, transitions, how scroll/interaction affects it.]

### [Next component — same pattern]

## JavaScript logic

### [System name — e.g., "Scene setup", "Particle init", "Shader material"]
[1–3 sentences: what this block does and why.]
```js
[verbatim JS]
```

### [Next system — follow init order: globals → setup → events → animate loop]

## Interaction & animation loop

[What drives the loop: scroll, time, mouse. State lerp values. What updates each frame.]

```js
function animate() {
  requestAnimationFrame(animate);
  // [per-frame updates here]
}
```

[Event handlers: mousemove, resize, click — each with code block.]

## Fixed parameters (bake these in)

- **[Category]:** [param] `[value]`; [param] `[value]`.
- **[Category]:** [param] `[value]`.
[All numeric constants grouped by category: camera, lighting, material, timing, layout, etc.]

## Assets

| Asset | Usage | URL |
|-------|-------|-----|
| [filename] | [purpose] | [URL] |

## Initialization order

1. [First function call — e.g., create renderer, scene, camera]
2. [Second — e.g., load model (all following steps inside loader callback)]
3. [Third — e.g., add lights, fog, materials]
4. [Fourth — e.g., build particle system]
5. [Fifth — e.g., attach scroll and resize listeners]
6. [Last — call `animate()` to start the rAF loop]

Suggested file name: [ResourceName]_Prompt.md
```
