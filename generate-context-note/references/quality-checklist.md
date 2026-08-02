# Quality Checklist

Run this checklist after writing the Resource Context and before delivering it.

## Package structure

- [ ] Title is exactly `# Resource Context (Code): [Resource Name]`.
- [ ] Major sections appear in canonical order: Instructions, Dependencies, HTML, CSS, JavaScript, optional Additional Source Files, Documentation.
- [ ] Major sections are separated by `---`.
- [ ] Every code fence opens and closes on its own line.
- [ ] The document contains no introductory chat text, suggested filename, or closing commentary.

## Source fidelity

- [ ] Every supplied source file appears once and only once.
- [ ] Multiple files retain their exact relative paths and original order.
- [ ] HTML matches the supplied HTML exactly.
- [ ] CSS matches the supplied CSS exactly.
- [ ] JavaScript matches the supplied JavaScript exactly.
- [ ] Comments, whitespace, strings, selectors, attributes, constants, URLs, and versions are unchanged.
- [ ] No code was shortened, summarized, reformatted, repaired, or converted to another convention.
- [ ] Inline SVG, templates, shader strings, and embedded data remain intact.

## Dependencies

- [ ] Every external stylesheet, script, import, font import, and third-party service used by the source is accounted for.
- [ ] Browser load order matches the source.
- [ ] URLs and versions are copied exactly; none were reconstructed or changed to `latest`.
- [ ] Local resource files are not mislabeled as external dependencies.

## Documentation accuracy

- [ ] Every documented selector, attribute, state value, config key, default, unit, event, and keyboard key exists in the source.
- [ ] Required and optional labels match actual null guards and early-return behavior.
- [ ] Parent-child, sibling, and index relationships are explicit when behavior depends on them.
- [ ] Initialization order and duplicate-init guards are documented when relevant.
- [ ] Animation descriptions preserve direction, timing controls, easing behavior, and reduced-motion branches without inventing values.
- [ ] Accessibility state and focus behavior are included when present.
- [ ] Platform, API, asset, cleanup, and known-constraint sections appear only when supported by the source.
- [ ] Documentation does not repeat large source blocks or add unsolicited improvements.

## Final delivery

- [ ] Output is valid UTF-8 with no corrupted punctuation or characters.
- [ ] The completed file is saved as `context-ai/[ResourceName]_Context.md` when filesystem access is available.
- [ ] No supplied source or required documentation was silently omitted because of output length.
- [ ] Reopen the saved file and perform one final comparison against the original source before reporting completion.
