---
name: pattern-guide
description: Kỹ năng Agent chuyên biệt về pattern-guide cho hệ thống CSS.
---

# Pattern Guide — CSS patterns hay học từ Awwwards & Nuxt UI

## 1. Component-scoped variables (Dùng nhiều — Chuẩn quốc tế)

Mỗi component khai báo local vars, bên ngoài override qua vars thay vì sửa file gốc.

```css
/* File gốc: components.css */
.btn {
  --btn-bg: var(--clr-accent);
  --btn-color: var(--clr-text-invert);

  background: var(--btn-bg);
  color: var(--btn-color);
}

/* Override tại nơi dùng — KHÔNG đụng file gốc */
.hero .btn {
  --btn-bg: white;
  --btn-color: black;
}
```

**Tại sao?**

- File gốc không bị modify → dễ update
- Override có scope rõ ràng → debug nhanh
- Specificity thấp → không cần `!important`

---

## 2. data-animate + class toggle (Dùng nhiều — Chuẩn Awwwards)

Tách hoàn toàn logic (JS) khỏi presentation (CSS):

```html
<!-- HTML: khai báo kiểu animate + delay -->
<h1 data-animate="fade-up" style="--delay: 0ms">Headline</h1>
<p data-animate="fade-up" style="--delay: 200ms">Paragraph</p>
```

```javascript
// JS: chỉ toggle class — không biết gì về CSS
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
    }
  });
});

document.querySelectorAll("[data-animate]").forEach((el) => {
  observer.observe(el);
});
```

```css
/* CSS: tự xử lý animation */
[data-animate] {
  opacity: 0;
  transform: translateY(var(--fade-y, 24px));
  transition:
    opacity 0.5s var(--ease-out-expo),
    transform 0.5s var(--ease-out-expo);
  transition-delay: var(--delay, 0ms);
}

[data-animate].is-visible {
  opacity: 1;
  transform: translateY(0);
}
```

**Tại sao?**

- JS chỉ 5 dòng, tái sử dụng mãi
- Thêm animation mới = chỉ thêm CSS, không sửa JS
- Performance tốt: dùng CSS transition thay JS animation

---

## 3. @layer cascade (Dùng nhiều — Chuẩn quốc tế W3C)

```css
@layer reset, tokens, base, layout, components, animations, utilities;
```

**Thứ tự cascade**: layer SAU luôn thắng layer TRƯỚC.

- `utilities` luôn thắng → không cần `!important`
- Import thứ tự nào cũng được, miễn khai báo layer order đúng

---

## 4. Tạo Sắc độ (Tints), Gradients & `color-mix()` (Chuẩn Modern CSS)

### Tạo Sắc độ (Generating Tints)

- Ưu tiên dùng Design Token đã định sẵn thay vì tự generate động bằng CSS.
- **KHÔNG ĐƯỢC** chỉ đơn thuần điều chỉnh kênh lightness trong `oklch`/`oklab` (`oklab(from var(--primary) 0.9 a b)`). Trình duyệt chưa implement gamut mapping tốt, màu sẽ bị sai lệch.
- **NÊN** dùng `color-mix()` để trộn với trắng/đen (ưu tiên `in oklab` cho an toàn dải màu).
- Tránh dùng `color-mix()` trộn với màu quá 30% trắng/đen để tránh bị mờ nhạt (washed out).

```css
/* Trộn màu an toàn với color-mix */
.bg-accent-10 {
  background: color-mix(in oklab, var(--clr-accent) 10%, transparent);
}
```

### Gradients và Không gian nội suy (Interpolation Color Space)

Dùng `in oklch` hoặc `in oklab` cụ thể cho gradients hoặc `color-mix()`. KHÔNG dùng `in srgb`.

- `in oklch`: bảo tồn độ rực tốt, nhưng dễ bay màu (out of bounds) với các cặp màu xa nhau.
- `in oklab`: an toàn, nhưng dễ bị nhợt ở vùng giữa gradient.

#### Fallback cho Gradient trên Trình duyệt Cũ (Trước 2024)

Trình duyệt cũ không hiểu `linear-gradient(in oklab, ...)`. Phải dùng biến an toàn:

```css
:root {
  --in-oklab: ; /* Rỗng mặc định */
}

@supports (background: linear-gradient(in oklab, white, black)) {
  :root {
    --in-oklab: in oklab;
  }
}

.c-card {
  /* Nếu ko support, --in-oklab rỗng -> linear-gradient(to bottom, ...) hợp lệ */
  background: linear-gradient(
    to bottom var(--in-oklab),
    var(--accent-color),
    var(--darker)
  );
}
```

---

## 5. Fluid container — min() (Dùng nhiều — Chuẩn quốc tế)

```css
--container: min(80rem, 100% - var(--gutter) * 2);
```

**Tương đương:**

```css
/* Cách cũ — 2 dòng */
max-width: 80rem;
padding-inline: var(--gutter);

/* Cách mới — 1 biến */
max-width: var(--container);
```

---

## 6. Glassmorphism (Dùng ít — Phong cách riêng)

```css
.card--glass {
  background: oklch(100% 0 0 / 0.05); /* Nền trong suốt */
  border: 1px solid oklch(100% 0 0 / 0.12);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px); /* Safari */
}
```

**Lưu ý**: `backdrop-filter` tốn GPU. Chỉ dùng cho 1-2 element, không apply hàng loạt.

---

## 7. color-scheme (Dùng ít biết — Học từ Nuxt UI)

```css
body {
  color-scheme: light;
}

.dark body {
  color-scheme: dark;
}
```

**Tác dụng**: Browser tự điều chỉnh:

- Scrollbar color (tối/sáng)
- Form control mặc định
- System UI colors

Không khai báo = browser đoán → có thể sai khi OS dark mode bật.

---

## 8. Selectors và Phân vùng (Selectors & Scoping)

Ưu tiên CSS selectors hơn JS để nhắm mục tiêu element phức tạp.

- **NÊN** dùng `:has()` để style cho element cha dựa trên trạng thái của element con (ví dụ: `label:has(:checked)` thay vì tự add class `label.has-checked` bằng JS).
- **KHÔNG NÊN** lồng `:has()` hoặc sử dụng pseudo-elements bên trong nó.
- **NÊN** dùng `:nth-child(<An+B> of <selector>)` khi cần style cho mỗi element thứ n thuộc một loại nhất định (ví dụ: `details:nth-child(1 of [open])`).
- **NÊN** dùng `:is()` hoặc `:where()` thay vì trùng lặp CSS rules cho các fallbacks. Không dùng cách này cho các pseudo-elements (vì không được hỗ trợ).
- **NÊN** dùng `:not()` thay vì overrides để loại trừ các states/targets không liên quan.
- **KHÔNG NÊN** sử dụng global resets (style trên `*`) vì chúng không thể bị ghi đè bởi web components hoặc cascade layers (trừ khi dùng `!important`). Hãy reset cho các loại element cụ thể.

---

## 9. Quản lý Focus (Focus Management)

- **NÊN** dùng `:focus-visible` để định nghĩa custom focus rings, không dùng `:focus`.
- **NÊN** ưu tiên `outline` hơn `box-shadow` cho focus rings, và ghép nối với `outline-offset` để tách biệt trực quan vòng ring ra khỏi element.
- **KHÔNG NÊN** loại bỏ focus rings mặc định (`outline: none`) mà không cung cấp style thay thế hiển thị rõ ràng.
- Nếu buộc phải dùng `box-shadow` cho focus rings, hãy cung cấp fallback `outline` cho High Contrast Mode bằng media query `forced-colors`.

---

## Bảng tổng hợp

| Pattern               | Tần suất                      | Chuẩn             |
| --------------------- | ----------------------------- | ----------------- |
| Component-scoped vars | Dùng mọi project              | Quốc tế           |
| data-animate + toggle | Dùng mọi project animation    | Awwwards          |
| @layer cascade        | Dùng mọi project              | W3C spec          |
| color-mix()           | Dùng khi cần opacity trên var | Nuxt UI / modern  |
| Fluid container min() | Dùng mọi project              | Quốc tế           |
| Glassmorphism         | Dùng khi thiết kế cần         | Phong cách riêng  |
| color-scheme          | Dùng khi có dark mode         | Nuxt UI / ít biết |

---

## Tiêu chuẩn Chất lượng & Hiệu suất (Quality & Performance Standards)

### Visual Fidelity (Độ trung thực thị giác)

Để kiểm tra độ trung thực thị giác (Màu sắc, Typography, Spacing, Responsive...), **BẮT BUỘC** sử dụng kỹ năng chuyên biệt [Visual QA Testing](../visual-qa-testing/SKILL.md) với hệ thống 6 trục kiểm tra nghiêm ngặt.

### Chất lượng CSS & Hiệu suất (CSS Quality & Performance)

- ✅ **Thứ tự CSS (Outside-In):** Luôn xếp CSS theo thứ tự: 1. Position (`inset`, `z-index`) → 2. Display/Layout (`grid`, `flex`, `gap`) → 3. Box Model (`inline-size`, `padding`) → 4. Typography (`font`) → 5. Visual (`background`, `color`) → 6. Animation (`scale`, `transition`).
- Quy tắc đặt tên BEM nhất quán. Tất cả giá trị dùng CSS custom properties (`var(--token)`), cấm hardcode.
- Không có số ảo (magic numbers) mà không có comment giải thích tại sao.
- Không dùng `!important` (trừ CSS reset hoặc utility thực sự hợp lệ).
- Không có CSS chết (những rule không khớp thẻ HTML nào).
- Google Fonts được tải với `display=swap`.

### Animation Performance (60fps)

```css
/* ✅ Composite-only = Đảm bảo 60fps */
.c-card {
  translate: 0 0;
  opacity: 1;
  transition:
    translate var(--transition-base),
    opacity var(--transition-base);
}
```

- Không dùng animation trên các thuộc tính layout (`top`, `left`, `width`, `height`). Hãy dùng thuộc tính composite (`transform`, `translate`, `scale`, `opacity`).
- Thuộc tính `will-change` chỉ nằm trên các element thực sự đang có animation (thường được toggle bằng JS class, không gắn cứng vĩnh viễn).

---

## 🤖 Agent OS Anti-Rationalization

> [!CAUTION]
> **Tác tử AI ĐỌC KỸ TRƯỚC KHI CODE:**
>
> 1. **Cấm lười biếng:** Không được lạm dụng `!important` để chữa cháy giao diện. BẮT BUỘC phải tuân thủ tầng Cascade (Cascade Layers - `@layer`).
> 2. **Cấm ngụy biện:** "Hardcode mã màu cho nhanh" là sai lầm chết người. Mọi màu sắc, khoảng cách (spacing), font-size đều PHẢI sử dụng CSS Variables (Design Tokens) như `var(--clr-bg)`, `var(--space-2)`.
> 3. **Bảo vệ Hệ thống:** Cấm nhồi nhét style trực tiếp vào thẻ HTML (Inline styles). Mọi tên class phải tuân thủ nguyên tắc BEM với tiền tố tiêu chuẩn (`c-`, `l-`, `u-`).
