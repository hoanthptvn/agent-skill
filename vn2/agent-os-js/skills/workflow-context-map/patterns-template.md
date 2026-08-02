# PATTERNS — [Tên dự án]
> Công thức đã kiểm chứng từ code thật. KHÔNG tự thêm pattern chưa được verify.
> Mỗi pattern PHẢI có `Verified against` trỏ đến ít nhất 2 file thật trong codebase.
> Last updated: [ISO timestamp]
>
> 📌 AI: Đọc file này trước khi bắt đầu /build task liên quan đến feature mới.

---

## [TEMPLATE] Tên Pattern

> 🔴 XÓA SECTION NÀY sau khi đã thêm pattern thật. Đây chỉ là hướng dẫn.

```
Verified against:
- path/to/reference-file-1.js
- path/to/reference-file-2.js

### Các bước:
1. Bước cụ thể 1
2. Bước cụ thể 2
3. Bước cụ thể 3

Not touched:
- path/to/file-that-should-not-be-modified.js

Notes:
- Ghi chú quan trọng về pattern này
```

---

## Thêm một Animation Module mới

Verified against:
- [CHƯA VERIFY — Cập nhật sau khi /build module đầu tiên]

### Các bước:
1. Tạo file `src/animations/<tên-camelCase>.js`
2. Import rAF scheduler từ core — CẤM tự tạo `requestAnimationFrame` loop riêng
3. Dùng Object Pool cho particle/object nếu có — CẤM `new Object()` trong hot path
4. Export `init()` và `destroy()` lifecycle
5. Đăng ký trong `main.js` theo cùng pattern với module hiện có
6. Thêm `data-animation-status="idle"` trên root element (DOM Contract)
7. Cập nhật `CODEMAP.md`

Not touched:
- `src/core/` (chỉ đọc, không sửa)
- `src/vendor/` (không sửa)

Notes:
- frame budget ≤ 4ms JavaScript (V8 rAF Contract)
- Dùng `data-animation-status="running|paused|finished"` để debug

---

## Thêm một Component UI mới

Verified against:
- [CHƯA VERIFY — Cập nhật sau khi /build component đầu tiên]

### Các bước:
1. Tạo thư mục `src/components/<PascalCase>/`
2. File JS: `<PascalCase>.js` — export class với `init()` và `destroy()`
3. File CSS: `<PascalCase>.css` — BEM naming convention
4. Import CSS vào `css/style.css` hoặc file CSS tương ứng
5. Gắn `data-ui-component="<tên>"` trên root HTML element (DOM Contract)
6. Cập nhật `CODEMAP.md`

Not touched:
- `css/style.css` global design tokens (chỉ thêm @import, không sửa tokens)

---

## Thêm một trang/page mới (Vanilla HTML)

Verified against:
- [CHƯA VERIFY — Cập nhật sau khi /build page đầu tiên]

### Các bước:
1. Tạo file `pages/<tên-kebab-case>.html` (hoặc thư mục nếu có JS riêng)
2. Copy `<head>` structure từ `index.html` (CDN links, meta tags)
3. Thêm `data-page="<tên>"` trên `<body>` (DOM Contract cho page-specific JS)
4. Đăng ký route/link trong navigation component
5. Cập nhật `CODEMAP.md`

Not touched:
- PHP template nếu có (hỏi trước khi sửa)

---

## Debug Animation Jank (60fps fail)

Verified against:
- [CHƯA VERIFY]

### Checklist khi FPS drop:
1. Mở DevTools Performance tab → Record 3 giây
2. Tìm frame > 16ms → xem call stack
3. Kiểm tra: có `new Object()` trong rAF loop không? → Object Pool
4. Kiểm tra: có Regex trong hot path không? → `charCodeAt(0)` range check
5. Kiểm tra: có DOM read-write xen kẽ không? → Batch reads rồi writes
6. Kiểm tra: có `.filter().map()` chain trong loop không? → Single `for` loop
7. Chạy `/review` để AI audit V8 compliance

---

> **Nhắc nhở quan trọng:**
> Sau mỗi `/build` tạo pattern mới → cập nhật file này với `Verified against` thật.
> PATTERNS stale = AI suy luận sai pattern = bugs không cần thiết.
