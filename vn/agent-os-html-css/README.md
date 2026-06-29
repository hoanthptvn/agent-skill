# Agent OS: Enterprise HTML & CSS Architecture

Bộ khung HTML & CSS nền production-ready. Copy vào project mới, sửa 4 dòng brand là chạy.

## Cấu trúc (Multi-File CSS + Semantic HTML)

```
agent-os-html-css/
├── css/                          ← ⭐ HỆ THỐNG CSS ĐA FILE
│   ├── base.css                  ← Reset, Tokens, Props, Typo, Layout, Component, Animation
│   └── utility.css               ← ~614 u-* utility classes
├── main.css                      ← File demo (import 2 file trên)
│
├── skills/                       ← 📚 [MỚI] Giàn giáo Kỹ năng (Agent Modular Skills)
│   ├── workflow-reverse-interrogation/ ← Kỹ năng Crey (UI/UX Brainstorming)
│   ├── workflow-figma-to-code/         ← Kỹ năng chuyển đổi thiết kế sang code
│   ├── workflow-visual-qa/             ← Kỹ năng soát lỗi QA giao diện
│   ├── html-structure/                 ← Kỹ năng viết HTML chuẩn Semantic, Accessibility, SEO
│   ├── css-architecture/               ← Cấu trúc & phân loại chi tiết (Multi-File CSS)
│   ├── css-layout/                     ← Kỹ thuật dàn trang (Flex/Grid) & Breakpoint
│   ├── css-design-tokens/              ← Hệ thống token (oklch, clamp)
│   ├── css-naming-conventions/         ← Cách đặt tên BEM, 3 tầng biến
│   ├── css-patterns/                   ← CSS patterns hay (Component vars, color-mix)
│   └── css-property-order/             ← Thứ tự sắp xếp thuộc tính CSS chuẩn mực
├── CLAUDE.md                     ← Meta-Skill Router (Orchestrator, Slash Commands)
├── SKILL.md                      ← Entry point: Bảng tra cứu Index
└── README.md
```

## Sử dụng

```html
<link rel="stylesheet" href="main.css" />
```

## Tùy chỉnh — sửa 4 dòng trong `foundation/tokens.css`

```css
--_accent-h: 280; /* Đổi hue (0-360) */
--font-display: "Tên Font", serif; /* Đổi font heading */
--font-body: "Tên Font", sans-serif; /* Đổi font body */
--clr-neutral-900: oklch(10% 0.005 280); /* Warm/cool gray */
```

## Naming Convention

| Layer      | Prefix     | Ví dụ                               |
| ---------- | ---------- | ----------------------------------- |
| Foundation | _(không)_  | `.h1`, `.caption`                   |
| Layout     | `l-`       | `.l-container`, `.l-grid--auto`     |
| Component  | `c-` + BEM | `.c-btn--outline`, `.c-card--glass` |
| Utility    | `u-`       | `.u-flex`, `.u-bg-primary`          |

## Slash Commands (Lệnh Điều Phối AI)

Hệ thống sử dụng các Lệnh vĩ mô để tải động Kỹ năng CSS (Progressive Disclosure):

| Lệnh     | Kích hoạt Kỹ năng                                                             |
| -------- | ----------------------------------------------------------------------------- |
| `/crey`  | Truy vấn Đảo ngược (Tạo thư mục `brainstorm/` và phỏng vấn ráo riết về UI/UX) |
| `/spec`  | Spec-driven development (Bắt buộc viết HTML Skeleton trước khi code CSS)      |
| `/plan`  | Bẻ nhỏ Layout -> Component -> Utility                                         |
| `/build` | Viết code CSS (Tuân thủ `var()` và `@layer`)                                  |
| `/test`  | Xác thực Cascade và Visual Drift                                              |

## Tài liệu (Kỹ năng Agent)

- [HTML Structure](skills/html-structure/SKILL.md) — Chuẩn HTML Semantic, Accessibility/ARIA và SEO tối ưu
- [Naming Conventions](skills/css-naming-conventions/SKILL.md) — 3 tầng biến, quy tắc đặt tên BEM
- [Pattern Guide](skills/css-patterns/SKILL.md) — Component vars, data-animate, @layer, color-mix
- [Architecture](skills/css-architecture/SKILL.md) — FLOCSS layers, chuẩn quốc tế vs phong cách riêng
- [Layout](skills/css-layout/SKILL.md) — Nguyên lý dàn trang Flex/Grid & Breakpoints
- [Token Guide](skills/css-design-tokens/SKILL.md) — Token system, oklch, clamp()
- [Property Order](skills/css-property-order/SKILL.md) — Thứ tự thuộc tính chuẩn Concentric CSS
- [Reverse Interrogation](skills/workflow-reverse-interrogation/SKILL.md) — Truy vấn UI/UX
- [Figma to Code](skills/workflow-figma-to-code/SKILL.md) — Chuyển thiết kế sang Code
- [Visual QA](skills/workflow-visual-qa/SKILL.md) — Kiểm thử giao diện 6 trục
