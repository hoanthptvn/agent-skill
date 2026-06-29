---
name: agent-os-html-css
description: Hệ Điều Hành Tác Nhân (Agent OS) chuyên về kiến trúc HTML & CSS — Kiến trúc Multi-File CSS, HTML Semantic, Accessibility, Design Tokens, @layer, Component Patterns.
---

# Agent OS: Enterprise HTML & CSS Architecture

## Overview

Bộ khung HTML & CSS nền production-ready theo kiến trúc **Multi-File CSS** & HTML Semantic:

```
css/sanitize.css — Reset cơ bản
css/base.css     — Reset, Tokens, Properties, Typography, Layout, Components, Animations
css/utility.css  — Single-purpose helpers (u-*)
css/top.css      — Home page styles
css/content.css  — Sub-page styles
css/form.css     — Form styles
```

Chi tiết tham chiếu → `skills/`

---

## Dispatch Table — Bài toán → File

```
"Cần cấu trúc HTML chuẩn Semantic"      → skills/html-structure/SKILL.md
"Cần tối ưu SEO, Accessibility, LCP"    → skills/html-structure/SKILL.md
"Bắt đầu project mới / Setup CSS"       → css/base.css
"Cần design token system (oklch)"       → css/base.css → skills/css-design-tokens/SKILL.md
"Cần CSS reset / typography"            → css/base.css
"Cần heading/text classes"              → css/base.css
"Cần container/grid/layout"             → css/base.css → skills/css-layout/SKILL.md
"Cần button/card components"            → css/base.css
"Cần scroll animation"                  → css/base.css
"Cần helper utilities"                  → css/utility.css
"Cần dark mode"                         → css/base.css (section DARK MODE)
"Cần color-mix(), :has(), Focus"        → skills/css-patterns/SKILL.md
"Hiểu BEM, Naming 3 tầng, Namespace"    → skills/css-naming-conventions/SKILL.md
"Hiểu CSS pattern hay & Performance"    → skills/css-patterns/SKILL.md
"Hiểu cấu trúc file CSS"                → skills/css-architecture/SKILL.md
"Thứ tự thuộc tính CSS"                 → skills/css-property-order/SKILL.md
```

---

## Bảng Kỹ năng Agent (Agent Skills)

### Kỹ năng Điều phối (Master Workflows)

| Kỹ năng                                 | Nội dung                                                                   |
| --------------------------------------- | -------------------------------------------------------------------------- |
| `skills/workflow-reverse-interrogation/SKILL.md` | Lệnh `/crey`. Tạo thư mục `brainstorm/`. Phỏng vấn UI/UX và Design System. |
| `skills/workflow-figma-to-code/SKILL.md`         | Trích xuất tokens, xây dựng cấu trúc Semantic, Code CSS Token-First.       |
| `skills/workflow-visual-qa/SKILL.md`             | So sánh mã code với thiết kế theo cấu trúc 6 trục, dùng cho lệnh `/test`.  |

### Phase 1 — Kỹ năng HTML (Markup Modules)

| Kỹ năng                          | Nội dung                                                                                 |
| -------------------------------- | ---------------------------------------------------------------------------------------- |
| `skills/html-structure/SKILL.md` | Chuẩn viết HTML Semantic, ARIA Roles, Accessibility, SEO, DOM Contracts, Media Elements. |

### Phase 2 — Kỹ năng CSS (CSS Modules)

| Kỹ năng                              | Nội dung                                                                                              |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `skills/css-architecture/SKILL.md`   | Cấu trúc dự án, Multi-File CSS (Base, Utility, Top, Content), CSS Comment Hierarchy.  |
| `skills/css-layout/SKILL.md`         | Kỹ thuật Layout (Flexbox, Grid), Container, Breakpoints, Logical Properties.          |
| `skills/css-design-tokens/SKILL.md`  | Hệ thống Token 3 tầng, hàm `oklch`, typography scale, fluid clamps, Spacing System.   |
| `skills/css-naming-conventions/SKILL.md` | Tiền tố (`c-`, `l-`, `u-`), biến `--ui-*`, `--_*`. Quy tắc 3 tầng Naming (BEM).   |
| `skills/css-patterns/SKILL.md`       | CSS patterns hay (Local vars, color-mix, data-animate, selectors).                    |
| `skills/css-property-order/SKILL.md` | Thứ tự sắp xếp thuộc tính CSS chuẩn Concentric CSS.                                   |

### Phase 3 — Chất lượng & Phân phối (QA & Delivery)

| Kỹ năng                             | Nội dung                                                                                                      |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `../git-commit.md`                  | Áp dụng luật Conventional Commits trước khi Push/Deploy (dùng cho lệnh `/ship`).                              |

---

## Quick Start

### Import tất cả (khuyến nghị cho dev)

```html
<link rel="stylesheet" href="main.css" />
```

### Import Multi-File tiêu chuẩn trên HTML

```html
<link rel="stylesheet" href="css/sanitize.css" />
<link rel="stylesheet" href="css/base.css" />
<!-- CSS riêng cho từng trang -->
<link rel="stylesheet" href="css/top.css" />
<link rel="stylesheet" href="css/utility.css" />
```

---

## Tùy chỉnh project — cấu hình Tokens trong css/base.css

```css
--_accent-h: 280; /* Hue: 0-360 */
--font-display: "Tên Font", serif; /* Hero heading */
--font-body: "Tên Font", sans-serif; /* Body text */
--clr-neutral-900: oklch(10% 0.005 280); /* Warm/cool gray */
```

---

## Naming Convention (BEM & Hậu tố Semantic)

| Layer        | Prefix           | Pattern                      | Ví dụ                           |
| ------------ | ---------------- | ---------------------------- | ------------------------------- |
| Base         | _(không prefix)_ | —                            | `.h1`, `.label`, `.caption`     |
| Layout       | `l-`             | `l-block--modifier`          | `.l-container`, `.l-grid--auto` |
| Component    | `c-`             | `c-block__element--modifier` | `.c-btn--outline`, `.c-card`    |
| Suffix Block | `c-*-domain`     | `c-card-price`               | `.c-card-price`, `.c-card-team` |
| Utility      | `u-`             | `u-property-value`           | `.u-flex`, `.u-bg-primary`      |
| State        | `is-` / `has-`   | —                            | `.is-visible`, `.has-error`     |
| JS Hook      | `data-*`         | `data-state="active"`        | `data-animate="fade-up"`        |

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

--_*          Private primitives — không dùng bên ngoài @layer tokens
--_accent-l   --_accent-c  --_accent-h
```

---

## Rules bắt buộc

1. **Dùng semantic token** — không hardcode primitive: `var(--clr-surface)` ✅ không `var(--clr-neutral-100)` ❌
2. **Component dùng local vars** — `.c-btn { --btn-bg: ...; background: var(--btn-bg); }`
3. **@layer ordering** — utilities luôn thắng, không cần `!important`
4. **JS Hooks & DOM Contracts** — JS chỉ điều khiển thuộc tính `data-*`, không toggle class để quản lý logic. CSS xử lý visual.
5. **Thứ tự CSS (Outside-In)** — 1. Position → 2. Display/Layout → 3. Box Model → 4. Typography → 5. Visual → 6. Animation.

---

## File Map

```
agent-os-html-css/
├── main.css                      ← Entry point (@layer order + @import css/*)
├── css/
│   ├── sanitize.css              ← 🟢 Browser reset chuẩn quốc tế
│   ├── base.css                  ← 🟢 Bundle (Tokens, Typography, Layout, Components, Animations)
│   ├── utility.css               ← 🟡 ~800 u-* utility classes
│   ├── top.css                   ← 🔵 CSS đặc thù cho trang chủ (Home)
│   ├── content.css               ← 🔵 CSS dùng chung cho các trang con
│   └── form.css                  ← 🟡 CSS riêng cho các trang có form
└── skills/                       ← 📚 Giàn giáo Kỹ năng (Agent Modular Skills)
    ├── workflow-reverse-interrogation/ ← Kỹ năng Crey (UI/UX Brainstorming)
    ├── workflow-figma-to-code/         ← Kỹ năng chuyển đổi thiết kế sang code
    ├── workflow-visual-qa/             ← Kỹ năng soát lỗi QA giao diện
    ├── html-structure/                 ← Chuẩn Semantic, Accessibility, SEO, HTML Rules
    ├── css-architecture/               ← Kiến trúc Multi-File, Breakpoints, Logical Properties
    ├── css-layout/                     ← Nguyên lý Layout (Flex/Grid), Container linh hoạt
    ├── css-design-tokens/              ← Hệ thống token (oklch, clamp)
    ├── css-naming-conventions/         ← Cú pháp BEM 3 tầng, Hậu tố Semantic, Dictionary
    ├── css-patterns/                   ← Patterns chất lượng cao (Outside-In, color-mix, :has)
    └── css-property-order/             ← Quy chuẩn sắp xếp thuộc tính CSS
```
