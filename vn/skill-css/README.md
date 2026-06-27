# skill-css — CSS Foundation (FLOCSS + BEM)

Bộ CSS nền production-ready. Copy vào project mới, sửa 4 dòng brand là chạy.

## Cấu trúc (FLOCSS)

```
skill-css/
├── main.css                      ← 1 dòng import = dùng tất cả
│
├── foundation/                   ← 🟢 Mọi dự án đều cần
│   ├── properties.css            ← Safe defaults --ui-* composite vars
│   ├── reset.css                 ← CSS reset chuẩn quốc tế
│   ├── tokens.css                ← ~250 CSS variables (3 tầng)
│   ├── typography.css            ← Heading, body, label classes
│   └── animations.css            ← Keyframes, data-animate
│
├── layout/                       ← 🔵 Hầu hết dự án cần
│   └── layout.css                ← l-container, l-grid, l-stack, l-cluster
│
├── object/                       ← 🟡 Tùy phong cách
│   ├── components.css            ← c-btn, c-card, c-tag (BEM)
│   └── utilities.css             ← ~614 u-* utility classes
│
└── references/                   ← 📚 Tài liệu
    ├── naming-conventions.md     ← Cách đặt tên, 3 tầng biến, pattern
    ├── pattern-guide.md          ← CSS patterns hay
    ├── architecture.md           ← Cấu trúc & phân loại chi tiết
    └── token-guide.md            ← Hệ thống token
```

## Sử dụng

```html
<link rel="stylesheet" href="main.css">
```

## Tùy chỉnh — sửa 4 dòng trong `foundation/tokens.css`

```css
--_accent-h: 280;                            /* Đổi hue (0-360) */
--font-display: 'Tên Font', serif;           /* Đổi font heading */
--font-body: 'Tên Font', sans-serif;         /* Đổi font body */
--clr-neutral-900: oklch(10% .005 280);      /* Warm/cool gray */
```

## Naming Convention

| Layer | Prefix | Ví dụ |
|-------|--------|-------|
| Foundation | *(không)* | `.h1`, `.caption` |
| Layout | `l-` | `.l-container`, `.l-grid--auto` |
| Component | `c-` + BEM | `.c-btn--outline`, `.c-card--glass` |
| Utility | `u-` | `.u-flex`, `.u-bg-primary` |

## Tài liệu

- [Naming Conventions](references/naming-conventions.md) — 3 tầng biến, quy tắc đặt tên, composite pattern
- [Pattern Guide](references/pattern-guide.md) — Component vars, data-animate, @layer, color-mix
- [Architecture](references/architecture.md) — FLOCSS layers, chuẩn quốc tế vs phong cách riêng
- [Token Guide](references/token-guide.md) — Token system, oklch, clamp()
