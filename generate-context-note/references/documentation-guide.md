# Documentation Guide

Write practical integration documentation after the complete source. Match the concise, source-led style of an Osmo Resource Context: explain what developers must add, preserve, configure, or expect.

## Contents

1. [Writing style](#writing-style)
2. [Section order](#section-order)
3. [Attribute documentation](#attribute-documentation)
4. [Behavior and animation](#behavior-and-animation)
5. [Special systems](#special-systems)
6. [Accuracy boundaries](#accuracy-boundaries)

## Writing style

- Address the integrating developer directly: “Add…”, “Keep…”, “Set…”, “The script…”.
- Prefer short paragraphs over exhaustive schema tables.
- Explain why a requirement matters when removing it would break behavior.
- Use exact inline code for selectors, attributes, state values, config keys, constants, and API calls.
- Include small source excerpts only when they make setup clearer. Do not repeat large blocks already present above.
- Keep the tone factual and practical. Do not add praise, marketing language, optimization suggestions, or speculative improvements.
- Use headings based on concepts developers recognize, such as `### Wrapper`, `### Button`, `### Active State`, or `### Customizing Timings`.

## Section order

Choose only applicable sections and generally order them as follows:

1. Third-party setup: API token, account, map style, project ID, required service.
2. `## Implementation` when the resource has several structural subsections.
3. Required outer wrapper or initialization attribute.
4. Child structure in DOM order.
5. Controls and interaction.
6. State and accessibility behavior.
7. Configuration and animation timing.
8. Responsive or reduced-motion behavior.
9. Platform integration such as Webflow CMS.
10. Cleanup, known constraints, or browser requirements.

For a small component, omit the `## Implementation` wrapper and place `###` sections directly under `## Documentation for Resource`, as in `### Init`, `### Button`, and `### Panel`.

## Attribute documentation

For every public `data-*` attribute, explain the applicable points:

- which element carries it
- whether it is required or optional, based on the actual guards in code
- what the script reads from or writes to it
- accepted values and exact fallback behavior
- required parent, child, sibling, or matching-index relationship
- state values assigned during the lifecycle
- related ARIA attributes, generated IDs, or `tabindex` changes

Group attributes that form one concept. Do not force one section per attribute when a single paragraph is clearer.

Examples of useful source-led statements:

- “Add `[data-tabs-init]` to the wrapper that contains both the navigation and panels.”
- “The ghost element is optional; the null guard allows the tabs to work without it.”
- “Buttons and panels are paired by index, so both lists must remain in the same order.”
- “The script sets `[data-active="true"]` on the selected card and marker.”

Do not label an element optional unless the source explicitly tolerates its absence. Do not claim a fallback exists unless the code implements one.

## Behavior and animation

Describe visible behavior in plain language and connect it to exact source controls:

- event or lifecycle trigger
- direction and ordering
- elements affected
- state changes
- CSS transition or GSAP timeline behavior
- reduced-motion alternative
- responsive branch
- cleanup or reset behavior

When developers can tune the effect, add a section such as `### Customizing Timings` or `### Configuration`. List each public config key with its exact default and explain what increasing or decreasing it changes.

Avoid copying every tween into a large audit table. The full code is already present. Surface the constants and relationships a developer is likely to adjust or must preserve.

Document keyboard behavior when listeners exist, including exact keys and guard conditions. Document generated accessibility state such as `aria-selected`, `aria-controls`, `aria-pressed`, roles, IDs, and focus movement.

## Special systems

### Third-party services

Document an API token or project setup before implementation details. Identify the exact config key and link only to an authoritative setup page when the source or user supplies the link. Never expose a secret token or transform a placeholder into a real credential.

### Assets and lazy loading

Explain where asset URLs come from, when they are assigned, required hosting or CORS behavior visible in the source, and any required video attributes. Do not invent asset dimensions or licensing information.

### WebGL, Canvas, shaders, and physics

Keep all implementation code verbatim in the source sections. In documentation, explain the pipeline at a useful integration level:

- canvas creation or required canvas element
- renderer/context initialization
- major render or simulation passes
- pointer and resize mapping
- animation-loop start and stop conditions
- configurable parameters
- cleanup behavior

Do not restate every shader line in prose.

### Platform integration

Add a platform section only when the source structure, comments, or supplied context establishes it. For Webflow, explain Designer-only CSS, CMS-bound attributes, and how rendered collection items are read. For an SPA, document a real destroy function only if one exists.

### Known constraints

Use `### Known Constraints` only for behavior proven by the source or its comments. State the symptom and the exact requirement or workaround without proposing a refactor.

## Accuracy boundaries

- Describe source behavior, not what similar libraries usually do.
- Do not infer visuals that cannot be determined from source or supplied screenshots.
- Do not claim browser support beyond explicit feature use or source comments.
- Do not add official-documentation links from memory when exact URLs are uncertain.
- Do not describe an unused CSS class, attribute, or config property as part of the public integration contract.
- Do not omit a behavior merely because it is accessibility-only, responsive-only, or inside an error/cleanup branch.
