# Resource Context Output Template

Use the following section order. Keep the headings exactly as shown unless a conditional subsection is explicitly allowed below.

## Contents

1. [Canonical structure](#canonical-structure)
2. [Source preservation rules](#source-preservation-rules)
3. [Multiple source files](#multiple-source-files)
4. [Dependency section rules](#dependency-section-rules)
5. [Conditional source categories](#conditional-source-categories)
6. [Output boundaries](#output-boundaries)

## Canonical structure

````markdown
# Resource Context (Code): [Resource Name]

## Instructions for AI

You are receiving a production-ready resource. This resource has been professionally built, tested, and works exactly as intended. Follow these rules strictly:

### Rules

1. **Do not modify, refactor, or "improve" any code unless the user explicitly asks you to.**
2. **Do not suggest structural changes, optimizations, or alternative approaches unprompted.**
3. **Do not remove, rename, or restructure any `data-` attributes.** They are used for DOM targeting in JavaScript and are essential to how this resource works.
4. **Respect the animation approach used.** Animations may be CSS-based, JavaScript-based, or a combination. Do not convert between approaches unless the user asks.
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

---

## Dependencies (External Scripts)

[Exact dependency declarations in browser load order]

---

## HTML

```html
[Complete HTML source, unchanged]
```

---

## CSS

```css
[Complete CSS source, unchanged]
```

---

## JavaScript

```js
[Complete JavaScript source, unchanged]
```

---

## Documentation for Resource

[Source-specific implementation documentation]
````

## Source preservation rules

- Copy source blocks exactly as supplied, including comments, indentation, blank lines, quote style, attribute order, and semicolons.
- Do not replace text, image URLs, SVG paths, tokens, or content with placeholders.
- Do not convert selectors to `data-*`, rename classes, impose a different code convention, change breakpoints, or restructure responsive CSS.
- Do not repair apparent mistakes. Document a source-confirmed limitation under `### Known Constraints` when it materially affects integration.
- Do not duplicate inline source into separate sections. Keep it in the same category where it appeared.

## Multiple source files

When a category contains multiple files, add a level-three heading with the exact relative path before each code block:

````markdown
## JavaScript

### js/main.js

```js
[exact file contents]
```

### js/cursor.js

```js
[exact file contents]
```
````

Use the same pattern for HTML and CSS. Preserve the user's file order. Never combine separate files into one code block.

## Dependency section rules

- Reproduce external `<link>` and `<script>` declarations exactly when they were supplied.
- Use `<!-- CSS -->` and `<!-- JS -->` labels when both categories exist.
- Include CSS `@import` dependencies under `### Fonts or CSS imports` only when they are already present in the source.
- For JavaScript module imports that cannot be represented as script tags, show the exact import statements under `### Module imports`.
- If no external dependency exists, write: `No external scripts or stylesheets are required.`
- Do not list the resource's own local source files as external dependencies.

## Conditional source categories

Add `## Additional Source Files` after JavaScript only when the user supplied standalone files that are not HTML, CSS, or JavaScript, such as JSON or separate GLSL files. Label each one with its exact path and use the closest correct fence language.

Do not add empty HTML, CSS, JavaScript, or Additional Source Files sections. When one of the three primary categories was not supplied, write a plain sentence in that section stating: `No [category] source was supplied for this resource.`

## Output boundaries

- Place `---` between every major level-two section.
- Put every opening and closing code fence on its own line.
- Do not add a preamble such as “Here is your context note.”
- Do not add a suggested filename inside the document.
- Do not add commentary after the Documentation section.
