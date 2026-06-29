---
name: css-patterns
description: Kỹ năng Agent chuyên biệt hướng dẫn các Design Pattern hiện đại cho HTML/CSS (Component-scoped vars, data-animate, container min...).
---

# Pattern Guide — CSS Patterns Hiện Đại

## 1. Component-scoped variables (Chuẩn quốc tế)

Mỗi component khai báo local vars, bên ngoài override qua vars thay vì sửa file gốc.

```css
/* File gốc: components.css */
.c-btn {
  --btn-bg: var(--clr-accent);
  --btn-color: var(--clr-text-invert);

  background: var(--btn-bg);
  color: var(--btn-color);
}

/* Override tại nơi dùng — KHÔNG đụng file gốc */
.p-hero .c-btn {
  --btn-bg: white;
  --btn-color: black;
}
```

**Tại sao?**
- File gốc không bị modify → dễ update
- Override có scope rõ ràng → debug nhanh
- Specificity thấp → không cần `!important`

---

## 2. data-animate + class toggle (Chuẩn Awwwards)

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

## 3. Gradients và Không gian nội suy (Interpolation Color Space)

Dùng `in oklch` hoặc `in oklab` cụ thể cho gradients. KHÔNG dùng `in srgb`.

- `in oklch`: bảo tồn độ rực tốt, nhưng dễ bay màu (out of bounds) với các cặp màu xa nhau.
- `in oklab`: an toàn, nhưng dễ bị nhợt ở vùng giữa gradient.

```css
.c-card {
  background: linear-gradient(
    to bottom in oklab,
    var(--clr-accent),
    var(--clr-darker)
  );
}
```

---

## 4. Selectors và Phân vùng (Selectors & Scoping)

Ưu tiên CSS selectors hơn JS để nhắm mục tiêu element phức tạp.

- **NÊN** dùng `:has()` để style cho element cha dựa trên trạng thái của element con (ví dụ: `label:has(:checked)` thay vì tự add class `label.has-checked` bằng JS).
- **KHÔNG NÊN** lồng `:has()` hoặc sử dụng pseudo-elements bên trong nó.
- **NÊN** dùng `:is()` hoặc `:where()` thay vì trùng lặp CSS rules cho các fallbacks.
- **NÊN** dùng `:not()` thay vì overrides để loại trừ các states/targets không liên quan.
- **KHÔNG NÊN** sử dụng global resets (style trên `*`) vì chúng không thể bị ghi đè bởi cascade layers (trừ khi dùng `!important`).

## 5. Tiêu chuẩn Chất lượng & Hiệu suất

### Animation Performance (60fps)

```css
/* ✅ Composite-only = Đảm bảo 60fps */
.c-card {
  translate: 0 0;
  opacity: 1;
  transition:
    translate var(--dur-fast),
    opacity var(--dur-fast);
}
```

- Không dùng animation trên các thuộc tính layout (`top`, `left`, `width`, `height`, `margin`). Hãy dùng thuộc tính composite (`transform`, `translate`, `scale`, `opacity`).
- Thuộc tính `will-change` chỉ nằm trên các element thực sự đang có animation (thường được toggle bằng JS class, không gắn cứng vĩnh viễn).

---

## 🤖 Agent OS Anti-Rationalization

> [!CAUTION]
> **Tác tử AI ĐỌC KỸ TRƯỚC KHI CODE:**
>
> 1. **Cấm lười biếng:** Không được lạm dụng `!important` để chữa cháy giao diện. BẮT BUỘC phải tuân thủ tầng Cascade (Cascade Layers - `@layer`).
> 2. **Cấm ngụy biện:** "Hardcode mã màu cho nhanh" là sai lầm chết người. Mọi màu sắc, khoảng cách (spacing), font-size đều PHẢI sử dụng CSS Variables (Design Tokens) như `var(--clr-bg)`, `var(--space-2)`.
> 3. **Bảo vệ Hệ thống:** Cấm nhồi nhét style trực tiếp vào thẻ HTML (Inline styles). Mọi tên class phải tuân thủ nguyên tắc BEM với tiền tố tiêu chuẩn (`c-`, `l-`, `u-`).
