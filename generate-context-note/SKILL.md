---
name: generate-context-note
description: Generate an Osmo-style Resource Context document from complete, working HTML, CSS, and JavaScript source code. Preserve the supplied source verbatim, list exact dependencies, and add concise implementation documentation for data attributes, configuration, animation, interaction, accessibility, and platform integration. Use when a user asks to turn a finished web component, GSAP effect, Webflow resource, or frontend code sample into an AI context note, resource context file, Osmo-style context, or documentation package. Do not use for prompts that ask an AI to rebuild a site from a description.
---

# Generate Resource Context Note

Transform a working frontend resource into a self-contained Markdown context file that follows the structure and practical documentation style used by Osmo Supply resource contexts.

## Core contract

- Preserve every supplied HTML, CSS, and JavaScript source block verbatim. Do not shorten, refactor, reformat, rename, repair, or modernize the code.
- Preserve source-file order, dependency order, comments, whitespace, selectors, attributes, constants, URLs, and library versions.
- Explain how to integrate and configure the resource after the complete source code. Do not replace source code with an architecture summary.
- Derive every technical claim from the supplied source. Never invent missing behavior, defaults, assets, dependencies, or setup steps.
- Produce one Resource Context format only.

## Required workflow

1. Read every supplied source file completely before writing output.
2. Read [references/source-analysis.md](references/source-analysis.md) and inventory the resource, dependencies, source files, public attributes, state, configuration, events, and animation behavior.
3. Read [references/output-template.md](references/output-template.md) and write the sections in its exact order.
4. Read [references/documentation-guide.md](references/documentation-guide.md) and include only documentation sections supported by the source.
5. Read [references/quality-checklist.md](references/quality-checklist.md), compare the finished document against the original source, and correct every discrepancy before delivery.

Do not write while still scanning the source. Complete the analysis first, then create the document.

## Scope rules

- Treat the files or code blocks explicitly supplied by the user as the complete source scope unless the user names a narrower component.
- Preserve separate files as separate labeled code blocks. Never silently merge files or omit a file because it looks like boilerplate.
- Include HTML, CSS, and JavaScript even when one category is short or contains no animation.
- Include inline SVG, shader strings, templates, configuration objects, and embedded data exactly where they occur in the source.
- If a referenced local file is unavailable, state that it was not supplied; do not reconstruct it.
- Ask one concise clarification only when the requested component boundary cannot be determined safely. Otherwise generate immediately.

## Output file

When filesystem access is available, save the finished document to:

```text
context-ai/[ResourceName]_Context.md
```

Use a concise PascalCase resource name derived from the component's primary function, for example:

- `context-ai/BouncyContentTabs_Context.md`
- `context-ai/StoreLocatorMapbox_Context.md`
- `context-ai/InfiniteDraggableGrid_Context.md`

Create `context-ai/` when needed. If the user explicitly requests regeneration, update the existing matching context file; otherwise do not overwrite an unrelated file.

## Delivery behavior

- When saving a file, return a short completion message with a link to the file. Do not paste the entire document into chat unless requested.
- When no writable filesystem is available, output only the complete Markdown document with no introductory or closing commentary.
- Never claim completion if any supplied source file or required section is missing.
