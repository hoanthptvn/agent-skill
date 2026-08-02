# Code Conventions

> **When to read this file:** Mode B only — these conventions apply when AI generates new code. Mode A relies on extracting exact parameters and algorithms from the source, so these conventions are informational only for Mode A.

---

## 1. FLOCSS — CSS Architecture

Styles are organized into four layers, in this load order:

| Layer | Prefix | Purpose | Examples |
|---|---|---|---|
| **Foundation** | *(none)* | Resets, base element styles | `* { }`, `html { }`, `body { }` |
| **Layout** | `l-` | Page structure and containers | `.l-header`, `.l-main`, `.l-grid` |
| **Component** | `c-` | Reusable, self-contained UI parts | `.c-button`, `.c-card`, `.c-modal` |
| **Project** | `p-` | Page-specific, non-reusable parts | `.p-hero`, `.p-nav`, `.p-about` |
| **Utility** | `u-` | Single-purpose overrides | `.u-hidden`, `.u-sr-only`, `.u-mt-16` |

Each layer is self-contained. Lower layers must not reference upper layers.

## 2. BEM — Class Naming

All CSS classes use **Block\_\_Element--Modifier** notation:

```css
/* Block */
.c-card { }

/* Element (part of the block) */
.c-card__title { }
.c-card__image { }

/* Modifier (variant of block or element) */
.c-card--featured { }
.c-card__title--large { }
```

Rules:
- Block names are short, lowercase, hyphen-separated nouns.
- `__` (double underscore) separates a block from its child element.
- `--` (double hyphen) separates a block or element from its modifier.
- Never nest BEM elements: `.c-card__header__title` is wrong — use `.c-card__title` instead.

## 3. JS–HTML Separation via `data-*` Attributes

**JavaScript never selects elements by class name.** Classes are owned by CSS. JavaScript owns `data-*` attributes.

```html
<!-- Class = styling responsibility (CSS) -->
<!-- data-* = behavior responsibility (JS) -->
<button class="c-button c-button--primary" data-modal-trigger="contact">
  Contact
</button>
```

```js
// ✅ Correct — JS selects by data-attribute
const trigger = document.querySelector('[data-modal-trigger]');

// ❌ Wrong — JS must never select by class
const trigger = document.querySelector('.c-button--primary');
```

This decoupling means CSS classes can be renamed, reorganized, or removed without ever breaking JavaScript behavior. `data-*` attribute names are the stable contract between HTML and JS.

**When documenting (Mode A):** Identify whether the source follows these conventions. If it does, note it in the preamble. Document `data-*` attributes as the JS interface; document class names as the CSS styling layer separately.

**When rebuilding (Mode B):** All generated code must follow these three conventions exactly. Never use class selectors in JavaScript. Never write CSS outside the FLOCSS layer it belongs to.

## 4. Mobile-First CSS

Base styles target mobile. Media queries using `min-width` add or adjust styles for larger viewports. **Never write a property at base level and then override it in a media query with the same intent** — structure the base correctly so the media query is purely additive.

**Wrong — override pattern:**
```css
.c-card {
  flex-direction: column; /* mobile */
}

@media (min-width: 768px) {
  .c-card {
    flex-direction: column; /* repeated unnecessarily */
    font-size: 16px;
  }
}
```

**Correct — additive pattern:**
```css
.c-card {
  flex-direction: column; /* mobile base — applies to all sizes */
  font-size: 14px;
}

@media (min-width: 768px) {
  .c-card {
    font-size: 16px; /* only what genuinely differs on desktop */
  }
}
```

**Media query organization:**

- **Shared breakpoint** — if two or more components change at the same breakpoint, group them into one shared `@media` block. Do not repeat the same breakpoint for each component separately.
- **Component-specific breakpoint** — if only one component uses a breakpoint, it gets its own `@media` block scoped to that component.

```css
/* ✅ Shared — multiple components at the same breakpoint */
@media (min-width: 768px) {
  .l-grid { grid-template-columns: repeat(2, 1fr); }
  .c-card { flex-direction: row; }
  .p-hero__title { font-size: 48px; }
}

/* ✅ Component-specific — only this component at this breakpoint */
@media (min-width: 1024px) {
  .p-hero__title { font-size: 64px; }
}
```

**When documenting (Mode A):** Note whether the source uses mobile-first. Identify shared vs component-specific `@media` blocks. Flag any override patterns if present.

**When rebuilding (Mode B):** Always write mobile-first. Group shared breakpoints. Add only genuinely different values in media queries — never repeat a property that doesn't change.

**`max-width` rule — always subtract `.98px`:**

When a `max-width` query is required, always use the breakpoint value minus `0.02px` to prevent a device sitting exactly on the boundary from matching both `min-width` and `max-width` simultaneously. Breakpoint values themselves are flexible — choose whatever fits the design:

```css
/* ✅ Correct — subtract .02px from whatever breakpoint you choose */
@media (max-width: 767.98px) { }
@media (max-width: 991.98px) { }

/* ❌ Wrong — exact integer risks overlap with a matching min-width */
@media (max-width: 768px) { }
```
