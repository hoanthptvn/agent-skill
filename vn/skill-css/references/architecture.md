# Architecture Guide — Cấu trúc file CSS

## Tổng quan cấu trúc

```
skill-css/
├── SKILL.md                    ← AI dispatch table
├── CLAUDE.md                   ← AI routing instructions
├── README.md                   ← Human overview
├── main.css                    ← Entry point (import tất cả)
│
├── foundation/                       ← 🟢 MỌI dự án đều cần
│   ├── reset.css               ← CSS reset (chuẩn quốc tế)
│   └── tokens.css              ← CSS variables (chuẩn quốc tế)
│
├── layout/ / foundation/                       ← 🔵 HẦU HẾT dự án cần
│   ├── typography.css           ← Heading, body, label classes
│   └── layout.css              ← Container, grid, stack, cluster
│
├── object/                   ← 🟡 TÙY phong cách / nhu cầu
│   ├── components.css          ← Button, card, tag, divider
│   ├── animations.css          ← Keyframes, data-animate
│   └── utilities.css           ← Helper classes, color-mix
│
└── references/                 ← 📖 Tài liệu
    ├── token-guide.md          ← Giải thích hệ thống token
    ├── pattern-guide.md        ← CSS patterns hay
    └── architecture.md         ← File này
```

---

## Phân loại chi tiết

### 🟢 CORE — Mọi dự án đều cần (chuẩn quốc tế)

| File | Nội dung | Tại sao bắt buộc |
|---|---|---|
| `foundation/reset.css` | Box model, body, form, media reset | Không reset = mỗi browser hiển thị khác |
| `foundation/tokens.css` | ~250 CSS variables | Không token = hardcode khắp nơi, dark mode bất khả thi |

**Dùng khi**: Bắt đầu bất kỳ dự án nào.
**Không bao giờ bỏ**.

### 🔵 BASE — Hầu hết dự án cần (chuẩn quốc tế)

| File | Nội dung | Khi nào BỎ |
|---|---|---|
| `layout/ / foundation/typography.css` | `.h1`–`.h6`, `.body-lg`, `.label` | Khi dùng framework có sẵn typography |
| `layout/ / foundation/layout.css` | `.container`, `.grid-12`, `.stack`, `.cluster` | Khi dùng CSS Grid riêng hoàn toàn |

**Dùng khi**: 90% dự án.
**Bỏ khi**: framework đã cung cấp (VD: Tailwind đã có container).

### 🟡 OPTIONAL — Tùy phong cách (phong cách riêng / Awwwards)

| File | Nội dung | Khi nào DÙNG |
|---|---|---|
| `object/components.css` | `.btn`, `.card`, `.tag`, `.divider` | Cần component nhanh, không tự viết |
| `object/animations.css` | `@keyframes`, `data-animate` pattern | Dự án có scroll animation, reveal effect |
| `object/utilities.css` | `.sr-only`, `.truncate`, `color-mix` | Cần helper nhanh, không dùng Tailwind |

**Dùng khi**: Dự án Awwwards, motion-heavy, hoặc cần prototype nhanh.
**Bỏ khi**: Đã có design system riêng (VD: Radix, Shadcn).

---

## Cách import theo nhu cầu

### Full stack (khuyến nghị cho project mới)

```html
<link rel="stylesheet" href="main.css">
```

### Chỉ core (tối thiểu)

```css
@layer reset, tokens;
@import "foundation/reset.css"  layer(reset);
@import "foundation/tokens.css" layer(tokens);
```

### Core + base (không cần component/animation)

```css
@layer reset, tokens, base, layout;
@import "foundation/reset.css"       layer(reset);
@import "foundation/tokens.css"      layer(tokens);
@import "layout/ / foundation/typography.css"  layer(base);
@import "layout/ / foundation/layout.css"      layer(layout);
```

### Thêm layer cho project

```css
/* Khai báo thêm layer 'page' SAU utilities */
@layer reset, tokens, base, layout, components, animations, utilities, page;

/* Import bình thường */
@import "main.css";

/* Style riêng vào layer page */
@layer page {
  .hero { background: var(--clr-accent); }
}
```

---

## Chuẩn quốc tế vs Phong cách riêng

### Chuẩn quốc tế (dùng toàn cầu)

- **CSS Reset**: Josh Comeau / Andy Bell — được 90%+ developers dùng
- **CSS Custom Properties**: W3C standard, mọi browser hỗ trợ
- **oklch()**: W3C Color Level 4 spec
- **clamp()**: W3C standard, fluid typography
- **@layer**: W3C Cascade Layers spec
- **8pt grid**: Google Material Design + Apple HIG
- **BEM naming**: Block__Element--Modifier — chuẩn Yandex, dùng toàn cầu
- **:focus-visible**: W3C accessibility requirement

### Phong cách riêng (Awwwards / motion-heavy)

- **data-animate pattern**: Awwwards sites hay dùng, không phải W3C standard
- **Glassmorphism**: Xu hướng thiết kế, có thể lỗi thời
- **text-shadow-glow**: Chỉ dùng cho hero effect
- **Component styles**: `.btn`, `.card` — mỗi project thiết kế khác

### Học từ Nuxt UI (ít người biết nhưng rất hay)

- **color-scheme**: Ít developer khai báo, nhưng ảnh hưởng scrollbar, form
- **color-mix()**: Giải quyết bài toán opacity trên CSS variable
- **@supports fallback**: Progressive enhancement cho feature mới
