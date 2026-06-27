# Agent OS: Enterprise CSS Architecture

Bộ CSS nền production-ready. Copy vào project mới, sửa 4 dòng brand là chạy.

## Cấu trúc (FLOCSS)

```
agent-os-css/
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
├── skills/                       ← 📚 [MỚI] Giàn giáo Kỹ năng (Agent Modular Skills)
│   ├── reverse-interrogation/    ← Kỹ năng Crey (UI/UX Brainstorming)
│   ├── css-architecture/         ← Cấu trúc & phân loại chi tiết (FLOCSS layers)
│   ├── design-tokens/            ← Hệ thống token (oklch, clamp)
│   ├── naming-conventions/       ← Cách đặt tên, 3 tầng biến, pattern
│   └── pattern-guide/            ← CSS patterns hay (Component vars, data-animate)
├── CLAUDE.md                     ← Meta-Skill Router (Orchestrator, Slash Commands)
├── SKILL.md                      ← Entry point: Bảng tra cứu Index
└── README.md
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

## Slash Commands (Lệnh Điều Phối AI)

Hệ thống sử dụng các Lệnh vĩ mô để tải động Kỹ năng CSS (Progressive Disclosure):

| Lệnh | Kích hoạt Kỹ năng |
|---|---|
| `/crey` | Truy vấn Đảo ngược (Tạo thư mục `brainstorm/` và phỏng vấn ráo riết về UI/UX) |
| `/spec` | Spec-driven development (Bắt buộc viết HTML Skeleton trước khi code CSS) |
| `/plan` | Bẻ nhỏ Layout -> Component -> Utility |
| `/build` | Viết code CSS (Tuân thủ `var()` và `@layer`) |
| `/test` | Xác thực Cascade và Visual Drift |

## Tài liệu (Kỹ năng Agent)

- [Naming Conventions](skills/naming-conventions/SKILL.md) — 3 tầng biến, quy tắc đặt tên, composite pattern
- [Pattern Guide](skills/pattern-guide/SKILL.md) — Component vars, data-animate, @layer, color-mix
- [Architecture](skills/css-architecture/SKILL.md) — FLOCSS layers, chuẩn quốc tế vs phong cách riêng
- [Token Guide](skills/design-tokens/SKILL.md) — Token system, oklch, clamp()
