---
name: design-tokens
description: Kỹ năng Agent chuyên biệt về design-tokens cho hệ thống CSS.
---

# Token Guide — Hệ thống biến CSS

## Tại sao dùng CSS Custom Properties (tokens)?

Thay vì hardcode `#3b82f6` khắp nơi, đặt tên có ý nghĩa:

- Dễ thay đổi toàn project bằng 1 dòng
- Dark mode chỉ cần đổi 10 dòng semantic
- AI agent đọc hiểu ý nghĩa, không phải đoán hex code

---

## 2 tầng token

### Tầng 1 — Primitive (giá trị thô)

```css
--clr-neutral-100: oklch(95% 0 0);
--clr-neutral-900: oklch(10% 0 0);
```

Đây là **palette gốc** — không bao giờ thay đổi giữa light/dark mode.

### Tầng 2 — Semantic (ý nghĩa)

```css
--clr-bg: var(--clr-neutral-0); /* Light mode: trắng */
--clr-surface: var(--clr-neutral-100); /* Card, panel */
--clr-text: var(--clr-neutral-900); /* Body text */
```

**Rule bắt buộc**: Component chỉ dùng semantic, không bao giờ dùng primitive trực tiếp.

```css
/* ❌ Sai */
.card {
  background: var(--clr-neutral-100);
}

/* ✅ Đúng */
.card {
  background: var(--clr-surface);
}
```

### Dark mode chỉ đổi tầng 2

```css
.dark {
  --clr-bg: var(--clr-neutral-950);
  --clr-surface: var(--clr-neutral-800);
  --clr-text: var(--clr-neutral-50);
}
/* Component KHÔNG cần thay đổi gì */
```

---

## Prefix naming — chuẩn quốc tế

| Prefix           | Dùng cho           | Ví dụ                                    |
| ---------------- | ------------------ | ---------------------------------------- |
| `--clr-`         | Color              | `--clr-bg`, `--clr-text`, `--clr-accent` |
| `--text-`        | Font size          | `--text-sm`, `--text-hero`               |
| `--leading-`     | Line height        | `--leading-tight`, `--leading-normal`    |
| `--tracking-`    | Letter spacing     | `--tracking-tight`, `--tracking-caps`    |
| `--weight-`      | Font weight        | `--weight-bold`, `--weight-medium`       |
| `--space-`       | Spacing            | `--space-1`, `--space-section`           |
| `--radius-`      | Border radius      | `--radius-md`, `--radius-full`           |
| `--z-`           | Z-index            | `--z-modal`, `--z-overlay`               |
| `--dur-`         | Duration           | `--dur-fast`, `--dur-slow`               |
| `--ease-`        | Easing             | `--ease-out-expo`, `--ease-spring`       |
| `--shadow-`      | Box shadow         | `--shadow-md`, `--shadow-glow`           |
| `--blur-`        | Blur               | `--blur-glass`                           |
| `--glass-`       | Glassmorphism      | `--glass-bg`, `--glass-blur`             |
| `--perspective-` | 3D                 | `--perspective-sm`                       |
| `--text-shadow-` | Text shadow        | `--text-shadow-glow`                     |
| `--drop-shadow-` | Filter shadow      | `--drop-shadow-md`                       |
| `--_`            | Private (internal) | `--_accent-l`, `--_accent-h`             |

**`--_` prefix**: biến nội bộ, không dùng trực tiếp trong component.
Chỉ dùng để tính toán biến khác (VD: `--clr-accent` dùng `--_accent-l`).

---

## oklch — Tại sao không dùng hex / hsl?

```
oklch(Lightness%  Chroma  Hue)
      ↑            ↑       ↑
      Độ sáng     Độ bão  Hue (0-360)
      0-100%      hòa
```

**Lợi thế:**

- **Perceptually uniform**: `50%` lightness TRÔNG giống 50% sáng thật (hsl thì không)
- **Interpolation đẹp**: gradient oklch không bị "muddy" ở giữa
- **W3C khuyến nghị** cho color systems mới

**Công cụ pick**: https://oklch.com

---

## color-mix() — Học từ Nuxt UI

Khi cần opacity trên CSS variable:

```css
/* ❌ Không hoạt động — var() không dùng được trong alpha channel */
background: oklch(var(--_accent-l) var(--_accent-c) var(--_accent-h) / 10%);

/* ✅ color-mix giải quyết */
background: color-mix(in oklab, var(--clr-accent) 10%, transparent);
```

**Tại sao oklab thay vì srgb?**

- oklab interpolation trông tự nhiên hơn
- Tránh hiện tượng màu bị xám ở giữa khi mix

---

## Fluid typography — clamp()

```css
--text-hero: clamp(5rem, 11vw, 10rem);
/*                 ↑      ↑      ↑
               Mobile   Scale   Desktop max
               min      theo viewport */
```

**Lợi thế**: 1 dòng thay cho 3-4 media queries.
**Không cần** `@media` breakpoint cho font size nữa.

---

## 8pt grid — Spacing

Mọi spacing = bội số 8px (`0.5rem`):

```
--space-1:  8px
--space-2:  16px
--space-3:  24px
--space-4:  32px
...
```

**Tại sao 8pt?**

- Chia hết cho 2, 4 → subpixel alignment tốt
- Chuẩn Material Design, Apple HIG đều dùng
- Mắt người nhận ra rhythm tốt hơn

---

## Spacing System (PC → SP)

Rút từ patterns thực tế của project, quy chuẩn khoảng cách giữa PC và Mobile:

### Section Spacing

| Phần                     | Desktop (PC) | Mobile (SP) | CSS                                   |
| ------------------------ | ------------ | ----------- | ------------------------------------- |
| Section padding-block    | `80–120px`   | `48–64px`   | `var(--space-96)` → `var(--space-64)` |
| Section title → nội dung | `40–60px`    | `24–32px`   | `margin-block-end: var(--space-48)`   |
| Card gap trong grid      | `24–30px`    | `16–20px`   | `gap: var(--space-24)`                |
| Header padding-block     | `12–20px`    | `12–16px`   | `var(--space-16)`                     |
| Footer padding           | `40–80px`    | `24–40px`   | `padding: var(--space-40)`            |
| Container padding-inline | `40–64px`    | `16–24px`   | Đã có trong `.l-container-*`          |

### Component Spacing

| Phần                          | Giá trị                                   |
| ----------------------------- | ----------------------------------------- |
| Button padding                | `padding: 12px 24px` → mobile `10px 20px` |
| Form field gap (label→input)  | `4–8px`                                   |
| List item vertical gap        | `8–16px`                                  |
| Inline icon gap (icon + text) | `8px`                                     |
| **Spacing bội 4px**           | 4, 8, 12, 16, 24, 32, 48...               | Dùng design tokens `var(--space-*)` |

---

## 🤖 Agent OS Anti-Rationalization

> [!CAUTION]
> **Tác tử AI ĐỌC KỸ TRƯỚC KHI CODE:**
>
> 1. **Cấm lười biếng:** Không được lạm dụng `!important` để chữa cháy giao diện. BẮT BUỘC phải tuân thủ tầng Cascade (Cascade Layers - `@layer`).
> 2. **Cấm ngụy biện:** "Hardcode mã màu cho nhanh" là sai lầm chết người. Mọi màu sắc, khoảng cách (spacing), font-size đều PHẢI sử dụng CSS Variables (Design Tokens) như `var(--clr-bg)`, `var(--space-2)`.
> 3. **Bảo vệ Hệ thống:** Cấm nhồi nhét style trực tiếp vào thẻ HTML (Inline styles). Mọi tên class phải tuân thủ nguyên tắc BEM với tiền tố tiêu chuẩn (`c-`, `l-`, `u-`).
