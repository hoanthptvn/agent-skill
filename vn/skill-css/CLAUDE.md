# CLAUDE.md — CSS Foundation Routing

## Khi User yêu cầu CSS → đọc file này trước

### Routing Table

| Intent | File | Layer |
|---|---|---|
| Bắt đầu project mới | `main.css` | All |
| Thiết lập design tokens | `foundation/tokens.css` | tokens |
| CSS reset | `foundation/reset.css` | reset |
| Heading / text classes | `foundation/typography.css` | foundation |
| Container / grid / layout | `layout/layout.css` | layout |
| Button / card / tag | `object/components.css` | components |
| Scroll animation / reveal | `foundation/animations.css` | animations |
| Helper classes | `object/utilities.css` | utilities |
| Dark mode | `foundation/tokens.css` → `.dark {}` | tokens |
| Color opacity trên var | `object/utilities.css` → `color-mix` | utilities |

### Giải thích chi tiết

| Cần hiểu gì | Đọc |
|---|---|
| Token naming, 3 tầng biến, oklch | `references/naming-conventions.md` |
| Component vars, data-animate, @layer | `references/pattern-guide.md` |
| Cấu trúc file, FLOCSS layers | `references/architecture.md` |

### Rules khi generate CSS

1. **PHẢI dùng semantic token** — `var(--clr-surface)`, KHÔNG `var(--clr-neutral-100)`
2. **PHẢI khai báo local vars** trong component — `--btn-bg`, `--card-radius`, etc.
3. **KHÔNG dùng `!important`** — @layer đã xử lý cascade
4. **PHẢI dùng `data-*` attribute** cho JS hooks — KHÔNG style class
5. **PHẢI dùng `clamp()`** cho font-size — KHÔNG hardcode px
6. **PHẢI dùng `var(--space-X)`** cho spacing — KHÔNG hardcode rem/px
7. **Prefix bắt buộc** — `l-*` layout, `c-*` component, `u-*` utility, `is-/has-` state

### @layer order (FLOCSS)

```
properties → reset → tokens → foundation → layout → components → animations → utilities
```

Layer SAU luôn thắng layer TRƯỚC. Utilities luôn có priority cao nhất — không cần `!important`.

### FLOCSS Prefix Quick Reference

```
l-container    l-grid     l-stack    l-cluster     ← Layout
c-btn          c-card     c-tag      c-divider     ← Component (BEM)
c-btn--outline c-card--glass                       ← BEM Modifier
u-flex         u-text-sm  u-bg-primary             ← Utility
```
