---
name: css-layout
description: Hướng dẫn kỹ thuật dàn trang cốt lõi, layout (Flexbox, Grid), Container linh hoạt và hệ thống Breakpoint / Responsive.
---

# Kỹ năng Dàn trang (CSS Layout)

## Thiết kế Responsive & Hệ thống Breakpoints

### Nguyên tắc Mobile-First

- Thiết kế cho màn hình Mobile trước, sau đó mở rộng lên màn hình lớn bằng `min-width`.
- Khi cần viết ngoại lệ cho Mobile, dùng `max-width: 767.98px` (bắt buộc dùng `.98px` để tránh kẹt breakpoint ở đúng 768px).
- CSS thuộc Media nào thì viết đúng trong Media đó. CSS nào dùng chung mới viết ở root. TUYỆT ĐỐI KHÔNG ghi đè CSS lung tung ở các media khác nhau.

### Hệ thống Breakpoints Tiêu chuẩn

```css
/* Mobile & Tablet nhỏ — Điểm cắt Mobile/Desktop chính */
@media (max-width: 767.98px) {
}

/* Tablet dọc & ngang */
@media (min-width: 768px) and (max-width: 1024px) {
}

/* Desktop */
@media (min-width: 1025px) {
}

/* Chỉ thiết bị hỗ trợ hover (chuột) — tránh stuck hover trên mobile */
@media (any-hover: hover) {
  .c-btn:hover {
    background: var(--color-accent-hover);
  }
}
```

---

## CSS Logical Properties

Sử dụng Logical Properties thay thế cho Physical Properties để giao diện tự động thích nghi với các ngôn ngữ LTR (Left-to-Right) và RTL (Right-to-Left).

```css
/* ❌ HẠN CHẾ SỬ DỤNG */
width: 100px;
height: 100px;
max-width: 500px;
margin-top: 20px;
margin-left: 20px;
padding-left: 10px;
top: 0;
right: 0;
bottom: 0;
left: 0;

/* ✅ SỬ DỤNG LOGICAL PROPERTIES */
inline-size: 100px;
block-size: 100px;
max-inline-size: 500px;
margin-block-start: 20px;
margin-inline-start: 20px;
padding-inline-start: 10px;
inset: 0;
```

## Nguyên lý Layout cốt lõi

- Sử dụng logical properties (`inline-size`, `block-size`, `margin-inline`, `padding-block`, `inset-inline-start`) cho kích thước layout và khoảng cách (spacing).
- Áp dụng mô hình tư duy **content-first vs layout-first**: dùng flexbox khi items quyết định flow, dùng grid khi bạn tự định nghĩa khung xương trước.

### Fluid container — min() (Container linh hoạt)

Quy chuẩn dựng container giới hạn chiều rộng chuẩn quốc tế:

```css
/* Cách cũ — 2 dòng */
max-width: 80rem;
padding-inline: var(--gutter);

/* Cách mới (NÊN DÙNG) — 1 dòng với biến */
--container: min(80rem, 100% - var(--gutter) * 2);
max-width: var(--container);
```

---

## Flexbox (Layout 1 Chiều)

Các item chảy theo một trục **chính (main)** duy nhất với sự căn chỉnh trên trục **chéo (cross)**. Rất hợp cho navbars, toolbars, các hàng item, và bất kỳ nhóm nào chỉ có 1 hàng hoặc 1 cột.

### ✅ ĐƯỢC LÀM (Do):

- Khởi tạo ngữ cảnh bằng `display: flex` và set trục chính với `flex-direction` (mặc định là `row`).
- Sử dụng `flex-wrap: wrap` bất cứ khi nào có khả năng tràn (overflow) — `nowrap` mà không có `overflow: auto/hidden` sẽ bị tràn trên viewport hẹp.
- Dùng cú pháp shorthand `flex` `<grow> <shrink> <basis>` (ví dụ, `flex: 1 1 250px`) thay vì định nghĩa rời rạc.
- Dùng `gap` (hoặc `row-gap`/`column-gap`) để tạo khoảng cách thay cho margins của thẻ con.
- Đẩy một item duy nhất ra xa cuối trục chính bằng `margin-inline-start: auto` (hoặc `margin-block-start: auto`) — mẹo cổ điển chuẩn nhất.
- Override alignment trên trục chéo cho mỗi item bằng `align-self`.
- Dùng `align-items` để căn giữa tất cả item trên trục chéo; dùng `margin: auto` cho một item duy nhất để nó tự căn đều ở cả 2 trục.
- Đặt `min-inline-size: 0` (hoặc `min-width: 0`) trên flex items chứa chữ dài không thể bẻ gãy (long URLs, code) để tránh overflow.

### ❌ KHÔNG ĐƯỢC LÀM (Do not):

- Đừng dùng `justify-self` trên flex items — nó chỉ áp dụng cho grid. Hãy dùng auto margins.
- Đừng dùng `order` hoặc `flex-direction: *-reverse` để sắp xếp nội dung tương tác. Trình tự DOM đọc theo tab bàn phím vẫn giữ nguyên, gây rối.
- Đừng nhầm lẫn `space-around` (nửa khoảng trống ở hai đầu) với `space-evenly` (khoảng trống đều đặn trước, giữa, sau).
- Đừng quên sự đảo trục: khi `flex-direction: column`, thì `justify-content` căn chỉnh trục dọc, còn `align-items` căn chỉnh trục ngang.
- Đừng bắt container và children co giãn chéo để lấp nhau — đây là nguồn cội overflow ngớ ngẩn.
- Đừng set cả `flex-basis` và `width`/`inline-size` trên cùng 1 thẻ — `flex-basis` đè chết `width`.

---

## Grid và Subgrid (Layout 2 Chiều)

Xác định hàng VÀ cột một cách dứt khoát. Subgrid giúp grid con kế thừa track từ grid cha, khiến cháu chắt thẳng hàng một cách kỳ diệu.

### Cách chọn Grid features:

- **Biết chính xác cần bao nhiêu cột?**
  - Có → dùng explicit tracks (`grid-template-columns: 200px 1fr`, `repeat(3, 1fr)`).
  - Cột khác biệt (sidebar + main) → dùng `grid-template-areas`.
  - Không biết (responsive) → dùng `repeat(auto-fit, minmax(min, 1fr))`.
- **Cần đặt item vào đúng tọa độ cụ thể?**
  - Có → dùng `grid-column: <start> / <end>` hoặc `grid-area: <name>`.
  - Chỉ cần trải đều trên n cột → dùng `grid-column: span <n>`.
- **Thẻ con (như title trong card) cần thẳng hàng với thẻ bên cạnh?**
  - Có → dùng `subgrid`.
  - Số lượng item thay đổi liên tục? → subgrid 1 trục.
  - Số lượng cố định? → subgrid 2 trục.

### ✅ ĐƯỢC LÀM (Do):

- Dùng `grid-template-areas` cho layout cấp độ Page — đặt tên cho từng phân vùng.
- Dùng `repeat(auto-fit, minmax(200px, 1fr))` cho layout thẻ bài (card grids) tự co giãn responsive tuyệt hảo.
- Dùng `fr` chia đều tỉ lệ và `minmax(min, max)` để khống chế an toàn.
- Dùng subgrid để giải quyết lỗi "ragged edge" (chữ ngắn chữ dài) ở danh sách thẻ bài (card lists).

### ❌ KHÔNG ĐƯỢC LÀM (Do not):

- Đừng mong `auto-fit`/`auto-fill` lấy width từ thẻ con — nó tính từ cục argument trong hàm `repeat()`.
- Đừng dùng `grid-auto-flow: dense` cho các thứ cần tương tác (interactive). Đảo ngược order thị giác làm lú tab keyboard.
- Đừng lạm dụng subgrid ở cả 2 trục nếu số lượng item nhảy nhót lung tung.
- Đừng nhầm `justify-items`/`align-items` (căn chỉnh bên trong cell) với `justify-content`/`align-content` (căn chỉnh nguyên cái lưới bên trong thẻ wrap bự).
- Đừng dùng `repeat(auto-fit/auto-fill, ...)` nếu container không có size rõ ràng.

---

## 🤖 Agent OS Anti-Rationalization

> [!CAUTION]
> **Tác tử AI ĐỌC KỸ TRƯỚC KHI CODE:**
>
> 1. **Cấm lười biếng:** Không được lạm dụng `!important` để chữa cháy giao diện. BẮT BUỘC phải tuân thủ tầng Cascade (Cascade Layers - `@layer`).
> 2. **Cấm ngụy biện:** "Hardcode mã màu cho nhanh" là sai lầm chết người. Mọi màu sắc, khoảng cách (spacing), font-size đều PHẢI sử dụng CSS Variables (Design Tokens) như `var(--clr-bg)`, `var(--space-2)`.
> 3. **Bảo vệ Hệ thống:** Cấm nhồi nhét style trực tiếp vào thẻ HTML (Inline styles). Mọi tên class phải tuân thủ nguyên tắc BEM với tiền tố tiêu chuẩn (`c-`, `l-`, `u-`).
