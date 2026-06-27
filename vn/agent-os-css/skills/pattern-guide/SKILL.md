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
  --btn-bg:    var(--clr-accent);
  --btn-color: var(--clr-text-invert);

  background: var(--btn-bg);
  color:      var(--btn-color);
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
<p  data-animate="fade-up" style="--delay: 200ms">Paragraph</p>
```

```javascript
// JS: chỉ toggle class — không biết gì về CSS
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
    }
  });
});

document.querySelectorAll('[data-animate]').forEach(el => {
  observer.observe(el);
});
```

```css
/* CSS: tự xử lý animation */
[data-animate] {
  opacity: 0;
  transform: translateY(var(--fade-y, 24px));
  transition: opacity .5s var(--ease-out-expo),
              transform .5s var(--ease-out-expo);
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

## 4. color-mix() + @supports fallback (Dùng vừa — Học từ Nuxt UI)

```css
/* Fallback cho browser cũ */
.bg-accent-10 {
  background: oklch(var(--_accent-l) var(--_accent-c) var(--_accent-h) / .10);
}

/* Modern browser */
@supports (color: color-mix(in oklab, red, red)) {
  .bg-accent-10 {
    background: color-mix(in oklab, var(--clr-accent) 10%, transparent);
  }
}
```

**Dùng inline khi cần custom opacity:**

```css
.hero-badge {
  background: color-mix(in oklab, var(--clr-accent) 12%, transparent);
  border:     1px solid color-mix(in oklab, var(--clr-accent) 30%, transparent);
  color:      var(--clr-accent);
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
  background:    oklch(100% 0 0 / .05);      /* Nền trong suốt */
  border:        1px solid oklch(100% 0 0 / .12);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);       /* Safari */
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

## Bảng tổng hợp

| Pattern | Tần suất | Chuẩn |
|---|---|---|
| Component-scoped vars | Dùng mọi project | Quốc tế |
| data-animate + toggle | Dùng mọi project animation | Awwwards |
| @layer cascade | Dùng mọi project | W3C spec |
| color-mix() | Dùng khi cần opacity trên var | Nuxt UI / modern |
| Fluid container min() | Dùng mọi project | Quốc tế |
| Glassmorphism | Dùng khi thiết kế cần | Phong cách riêng |
| color-scheme | Dùng khi có dark mode | Nuxt UI / ít biết |


---

## 🤖 Agent OS Anti-Rationalization

> [!CAUTION]
> **Tác tử AI ĐỌC KỸ TRƯỚC KHI CODE:**
> 1. **Cấm lười biếng:** Không được lạm dụng `!important` để chữa cháy giao diện. BẮT BUỘC phải tuân thủ tầng Cascade (Cascade Layers - `@layer`).
> 2. **Cấm ngụy biện:** "Hardcode mã màu cho nhanh" là sai lầm chết người. Mọi màu sắc, khoảng cách (spacing), font-size đều PHẢI sử dụng CSS Variables (Design Tokens) như `var(--clr-bg)`, `var(--space-2)`.
> 3. **Bảo vệ Hệ thống:** Cấm nhồi nhét style trực tiếp vào thẻ HTML (Inline styles). Mọi tên class phải tuân thủ nguyên tắc BEM với tiền tố tiêu chuẩn (`c-`, `l-`, `u-`).
