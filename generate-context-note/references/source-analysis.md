# Source Analysis

Read this file before creating the Resource Context. Perform the analysis silently.

## 1. Establish the source scope

Record every supplied file or labeled code block in its original order:

| Category | Include |
|---|---|
| HTML | Documents, fragments, templates, inline SVG, accessibility attributes |
| CSS | Stylesheets, inline style blocks, imports, media queries, keyframes |
| JavaScript | Scripts, modules, inline scripts, configuration, initialization |

Do not treat a file as optional because it appears generic. A reset, helper, or initialization file may still be required for the resource to work.

## 2. Name the resource

Choose a two-to-five-word name describing the primary behavior. Add the main library in parentheses only when it materially identifies the resource, such as `Store Locator (Mapbox)` or `Bouncy Content Tabs (GSAP)`.

Do not add `Osmo Supply` to the title unless the supplied resource actually belongs to Osmo Supply. The output format may be Osmo-style without claiming Osmo authorship.

## 3. Inventory exact dependencies

Find every external dependency in the source:

- `<link href>` stylesheets
- `<script src>` scripts
- CSS `@import` declarations
- JavaScript `import` and dynamic `import()` declarations
- library-specific plugins registered in code
- fonts, images, videos, JSON, models, workers, and remote data
- API tokens, style IDs, project IDs, or other third-party setup

Preserve exact URLs, versions, and browser load order. Do not replace a pinned version with `latest` and do not invent a CDN URL for a package import.

## 4. Inventory the integration contract

Trace all selectors and public integration points:

- every `data-*` attribute read or written by JavaScript
- state attributes and every value assigned to them
- CSS classes added, removed, or toggled by JavaScript
- required parent, child, sibling, ordering, and index relationships
- ARIA attributes, roles, generated IDs, `tabindex`, and keyboard controls
- required HTML attributes such as `muted`, `playsinline`, or `type="module"`
- optional elements guarded by null checks and required elements that cause early return

For each configurable attribute, determine its exact fallback or behavior when it is missing or malformed.

## 5. Trace behavior and animation

For each event or lifecycle path, record:

1. Trigger: load, click, hover, pointer movement, keyboard, scroll, resize, observer, or custom event.
2. Target elements and how they are selected.
3. Initial state, including CSS defaults and every `gsap.set()` call.
4. State mutations, DOM operations, and accessibility updates.
5. Animation method and exact properties, values, duration, delay, stagger, easing, and timeline position.
6. Direction, wrap, clamp, lerp, measurement, or responsive formulas.
7. Cleanup, reset, kill, destroy, and duplicate-initialization guards.
8. Reduced-motion or device-capability branches.

Inspect nested timelines, callbacks, conditional branches, resize handlers, and reset functions. Do not infer animation values from appearance or common practice.

## 6. Inventory configuration

Record the exact default and purpose of:

- configuration-object properties
- top-level constants
- CSS custom properties that control behavior
- breakpoints and media queries
- observer thresholds and margins
- debounce or timeout durations
- renderer, canvas, shader, physics, or particle parameters

Distinguish milliseconds from seconds, pixels from relative units, and longitude-latitude order from latitude-longitude order.

## 7. Determine useful documentation sections

Select only sections that help another developer integrate or adjust this specific resource. Typical sections include setup, attributes, states, interaction, timing, accessibility, responsive behavior, platform integration, assets, cleanup, and known constraints.

Do not create empty sections or generic advice unrelated to the source.
