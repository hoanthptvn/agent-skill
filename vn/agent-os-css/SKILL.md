---
name: agent-os-css
description: Hệ Điều Hành Tác Nhân (Agent OS) chuyên về kiến trúc CSS — FLOCSS architecture, design tokens, reset, @layer, component patterns, animation system. Use when bắt đầu project mới, thiết lập design system, dark mode, hoặc tìm CSS pattern cho animation.
---

# Agent OS: Enterprise CSS Architecture

## Overview

Bộ CSS nền production-ready theo kiến trúc FLOCSS:

```
foundation/   — Reset, Tokens, Properties, Typography, Animations
layout/       — Page-level containers (l-*)
object/
  components/ — Reusable UI components (c-* + BEM)
  utilities/  — Single-purpose helpers (u-*)
```

Chi tiết tham chiếu → `skills/`

---

## Dispatch Table — Bài toán → File

```
"Bắt đầu project mới"            → foundation/reset.css + foundation/tokens.css
"Cần design token system"        → foundation/tokens.css → skills/design-tokens/SKILL.md
"Cần CSS reset"                  → foundation/reset.css
"Cần heading/text classes"       → foundation/typography.css
"Cần container/grid/layout"      → layout/layout.css
"Cần button/card components"     → object/components.css
"Cần scroll animation"           → foundation/animations.css
"Cần helper utilities"           → object/utilities.css
"Cần dark mode"                  → foundation/tokens.css (section DARK MODE)
"Cần color opacity trên var"     → object/utilities.css (color-mix pattern)
"Hiểu naming convention"         → skills/naming-conventions/SKILL.md
"Hiểu CSS pattern hay"           → skills/pattern-guide/SKILL.md
"Hiểu cấu trúc file"            → skills/css-architecture/SKILL.md

---

## Bảng Kỹ năng Agent (Agent Skills)

### Phase 0 — Hệ tư tưởng AI & CSS Architecture

| Kỹ năng | Nội dung |
|---|---|
| `skills/reverse-interrogation/SKILL.md` | Lệnh `/crey`. Tạo thư mục `brainstorm/`. Phỏng vấn UI/UX và Design System. |

### Phase 1 — Kỹ năng CSS (CSS Modules)

| Kỹ năng | Nội dung |
|---|---|
| `skills/css-architecture/SKILL.md` | Hiểu về FLOCSS, các Layer và quy tắc phân loại file. |
| `skills/design-tokens/SKILL.md` | Hệ thống Token 3 tầng, hàm `oklch`, typography scale. |
| `skills/naming-conventions/SKILL.md` | Tiền tố (`c-`, `l-`, `u-`), biến `--ui-*`, `--_*`. |
| `skills/pattern-guide/SKILL.md` | Các mẫu code CSS (Local vars, color-mix, data-animate). |

---

## Quick Start

### Import tất cả (khuyến nghị)
```html
<link rel="stylesheet" href="main.css">
```

### Import tối thiểu (chỉ foundation)
```css
@layer reset, tokens;
@import "foundation/reset.css"  layer(reset);
@import "foundation/tokens.css" layer(tokens);
```

---

## Tùy chỉnh project — sửa 4 dòng trong foundation/tokens.css

```css
--_accent-h: 280;                                    /* Hue: 0-360 */
--font-display: 'Tên Font', serif;                   /* Hero heading */
--font-body: 'Tên Font', sans-serif;                 /* Body text */
--clr-neutral-900: oklch(10% .005 280);              /* Warm/cool gray */
```

---

## Naming Convention (FLOCSS + BEM)

| Layer | Prefix | Pattern | Ví dụ |
|-------|--------|---------|-------|
| Foundation | *(không prefix)* | — | `.h1`, `.label`, `.caption` |
| Layout | `l-` | `l-block--modifier` | `.l-container`, `.l-grid--auto` |
| Component | `c-` | `c-block__element--modifier` | `.c-btn--outline`, `.c-card--glass` |
| Utility | `u-` | `u-property-value` | `.u-flex`, `.u-bg-primary` |
| State | `is-` / `has-` | — | `.is-visible`, `.has-error` |

### CSS Variable Prefixes

```
--clr-*       Design tokens — màu sắc primitive
--text-*      Design tokens — typography scale
--space-*     Design tokens — spacing named tokens
--spacing     Design token  — base unit (0.25rem)
--shadow-*    Design tokens — box shadow
--radius-*    Design tokens — border radius
--ease-*      Design tokens — easing curves
--animate-*   Design tokens — animation shorthand

--ui-*        Semantic tokens — interaction / action colors
--ui-primary  --ui-error  --ui-text-muted  --ui-bg-elevated

--ui-*        Internal vars — composite properties (private)
--ui-shadow   --ui-ring-shadow  --ui-translate-x  --ui-blur

--_*          Private primitives — không dùng bên ngoài tokens.css
--_accent-l   --_accent-c  --_accent-h
```

---

## Rules bắt buộc

1. **Dùng semantic token** — không hardcode primitive: `var(--clr-surface)` ✅ không `var(--clr-neutral-100)` ❌
2. **Component dùng local vars** — `.c-btn { --btn-bg: ...; background: var(--btn-bg); }`
3. **@layer ordering** — utilities luôn thắng, không cần `!important`
4. **data-animate** — JS chỉ toggle class, CSS xử lý visual
5. **Negative utilities** — `.u--top-px` (double dash sau `u-`)

---

## File Map

```
agent-os-css/
├── main.css                      ← Entry point (@layer order + @import)
├── foundation/
│   ├── properties.css            ← 🟢 Safe defaults --ui-* composite vars
│   ├── reset.css                 ← 🟢 Browser reset chuẩn quốc tế
│   ├── tokens.css                ← 🟢 Design tokens + Semantic tokens
│   ├── typography.css            ← 🔵 Heading/body text classes
│   └── animations.css            ← 🟡 @keyframes + data-animate pattern
├── layout/
│   └── layout.css                ← 🔵 l-container, l-grid, l-stack, l-cluster
├── object/
│   ├── components.css            ← 🟡 c-btn, c-card, c-tag, c-divider
│   └── utilities.css             ← 🟡 ~614 u-* utility classes
└── skills/                       ← 📚 Giàn giáo Kỹ năng (Agent Modular Skills)
    ├── reverse-interrogation/    ← Kỹ năng Crey (UI/UX Brainstorming)
    ├── css-architecture/         ← Cấu trúc & phân loại chi tiết (FLOCSS layers)
    ├── design-tokens/            ← Hệ thống token (oklch, clamp)
    ├── naming-conventions/       ← Cách đặt tên, 3 tầng biến, pattern
    └── pattern-guide/            ← CSS patterns hay (Component vars, data-animate)
```
