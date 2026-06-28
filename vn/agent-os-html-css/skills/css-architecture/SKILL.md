---
name: css-architecture
description: Kỹ năng Agent chuyên biệt về css-architecture cho hệ thống CSS.
---

# Architecture Guide — Cấu trúc file CSS

## Tiêu chuẩn Cấu trúc Dự án (Target Project Structure)

Khi xây dựng dự án web thực tế cho khách hàng, AI Agent phải tuân thủ cấu trúc thư mục tiêu chuẩn sau:

```
project/
├── common/                  ← PHP và cấu hình dùng chung (BỎ QUA KHI LINT CODE)
│   ├── include_disp.php     ← Code HTML/PHP dùng chung (Header, Footer, Navigation...)
│   └── seo.yaml             ← Lưu trữ meta cấu hình SEO (title, description, keywords)
├── common_img/              ← Hình ảnh dùng chung toàn trang
├── css/                     ← ⭐ HỆ THỐNG CSS ĐA FILE (MULTI-FILE CSS)
│   ├── sanitize.css         ← Cấu hình khởi đầu (Reset/Normalize)
│   ├── base.css             ← Tokens, Typography, Layout móng & Component cốt lõi
│   ├── top.css              ← CSS dành riêng cho trang chủ (Home)
│   ├── content.css          ← Component dùng chung cho các trang con
│   ├── form.css             ← Component dùng riêng cho form (Contact/Entry - load cùng base & content)
│   ├── utility.css          ← Các class dùng chung (.u-*)
│   └── [thư viện bên thứ 3] ← Không chỉnh sửa
├── images/                  ← Hình ảnh trang chủ (dùng cho index.html)
├── js/
│   ├── common.js            ← ⭐ FILE JS CHÍNH — code JS của toàn trang
│   └── [thư viện bên thứ 3] ← GSAP, Lenis, Three.js... (không chỉnh sửa)
├── index.html               ← ⭐ TRANG CHỦ
│
├── company/                 ← Trang con (ví dụ)
│   ├── index.html           ← HTML trang con
│   └── images/              ← Hình ảnh riêng trang con
│
└── [trang-con-khác]/
    ├── index.html
    └── images/
```

### Quy tắc Kiến trúc Dự án:

1. **Quản lý CSS Đa File (Multi-File CSS System):**
   - Không nén tất cả CSS vào một file khổng lồ khi bàn giao nếu dự án yêu cầu chia trang.
   - Trang chủ (index.html) chỉ load: `sanitize.css` + `base.css` + `top.css` + `utility.css`.
   - Các trang con (ví dụ `/company/index.html`) load: `sanitize.css` + `base.css` + `content.css` + `utility.css`.
   - Các trang có Form (Liên hệ, Đăng ký) load thêm: `form.css`.
2. **Khử trùng lặp qua PHP include:**
   - Các khối HTML lặp lại (Header, Footer, Nav) phải được cắt và đưa vào `common/include_disp.php` (hoặc include tương đương) để quản lý tập trung.
3. **Cấu hình SEO tập trung:**
   - Đọc và đồng bộ thẻ `<title>`, `<meta name="description">` từ file `common/seo.yaml`.
4. **Bảo vệ môi trường lint (Linting Guard):**
   - Trình linter hoặc AI Validator **không quét lint** đối với thư mục `common/` vì đây là code PHP và cấu hình tĩnh.

---

## Phân loại chi tiết (The Multi-File System)

### 🟢 CORE BUNDLE — `css/base.css`

Đây là tệp trọng tâm chứa toàn bộ định nghĩa cốt lõi của website. Bao gồm:

1. `@layer` definitions.
2. `Tokens`: Màu sắc, typography scale, spacing variables (`--clr-*`, `--text-*`).
3. `Properties`: CSS Custom Properties, an toàn (`--ui-*`).
4. `Typography`: Style mặc định cho heading, đoạn văn, link (`.h1`-`.h6`, `.body-lg`).
5. `Layouts`: Khung lưới, container (`.l-container`, `.l-grid`, `.l-stack`).
6. `Components`: Các component dùng chung toàn site (ví dụ: `.c-btn`, `.c-card`).
7. `Animations`: Khai báo `@keyframes` và các mẫu `data-animate`.

**Dùng khi**: Bắt đầu bất kỳ trang nào. Bắt buộc import.

### 🟡 UTILITIES — `css/utility.css`

Chứa hàng loạt các class đơn mục đích (`.u-*`) hỗ trợ tinh chỉnh padding, margin, width, height, colors mà không cần viết thêm CSS tùy chỉnh. Luôn nằm ở layer cuối cùng để ghi đè (thay vì dùng `!important`).

**Dùng khi**: Xử lý responsive nhanh, tinh chỉnh spacing/colors trực tiếp trên HTML. Bắt buộc import.

### 🔵 PAGE-SPECIFIC & OVERRIDES — `css/top.css` / `css/content.css`

Chứa các style rất đặc thù không tái sử dụng được ở nơi khác.

- `top.css`: Chứa hero section, layout riêng của index.html (VD: `.p-top`).
- `content.css`: Chứa các block tĩnh trên trang giới thiệu, dịch vụ (VD: `.p-company`, `.p-service`).

**Dùng khi**: Cắt giao diện theo từng trang. Import tương ứng.

---

## Cách import theo nhu cầu

### Full stack (khởi tạo project)

Trong môi trường dev (như `main.css`), có thể import tất cả:

```css
@layer reset, tokens, base, layout, components, animations, utilities, page;

@import "sanitize.css" layer(reset);
@import "base.css"; /* Base tự quản lý layer bên trong */
@import "utility.css" layer(utilities);
@import "top.css" layer(page);
```

### Thêm layer cho file page (VD: top.css)

```css
/* Trong file top.css */
@layer page {
  .p-top__hero {
    background: var(--clr-accent);
  }
}
```

---

## Hệ thống Comment CSS (CSS Comment Hierarchy)

Để duy trì sự đồng nhất và dễ dàng tracking file outline, toàn bộ các file CSS phải tuân thủ nghiêm ngặt 3 cấp độ (Level) comment sau đây:

### Cấp 1 (Level 1) - Phân vùng lớn (Major Sections)
Dùng cho các nhóm cực lớn như `FOUNDATION`, `LAYOUT`, `COMPONENT`. Khung viền sử dụng dấu bằng `=`.
```css
/*====================================================================================
1. NAME.
====================================================================================*/
```

### Cấp 2 (Level 2) - Phân vùng con (Sub-sections)
Dùng cho các thành phần con bên trong Level 1 (ví dụ `1.1. SETUP`, `3.1. TEXT`). Khung viền sử dụng dấu gạch ngang `-`.
```css
/*------------------------------------------------------------------------------------
1.1. NAME.
------------------------------------------------------------------------------------*/
```

### Cấp 3 (Level 3) - Khối chi tiết (Detail blocks)
Dùng cho các nhóm nhỏ bên trong một component. Khung viền tối giản hóa thành comment 1 dòng tiêu chuẩn để tránh nhiễu loạn thị giác, sử dụng 10 dấu bằng `=` ở mỗi bên để tạo sự đậm nét và nhấn mạnh.
```css
  /* ========== 1.1.1 NAME ========== */
```

### Cấp 4 (Level 4) - Khối con siêu nhỏ (Sub-detail blocks)
Dùng cho các phần tử con nằm sâu bên trong Level 3 (ví dụ: các trạng thái của nút, hoặc các mục nhỏ trong reset). Khung viền tối giản hóa thành comment 1 dòng tiêu chuẩn để tránh nhiễu loạn thị giác, sử dụng 10 dấu gạch ngang `-` ở mỗi bên để tăng độ dài và sự nổi bật. Tiền tố đánh số có thêm dấu chấm ở cuối (ví dụ `1.1.1.1.`).
```css
  /* ---------- 1.1.1.1. NAME ---------- */
```

### Chú thích (Description / Notes)
Ngoài việc chia tách khu vực (Level 1-4), khi cần viết giải thích kỹ thuật, lý do sử dụng, hay mẹo dành cho Developers, hãy áp dụng quy tắc:

**1. Chú thích ngắn gọn (1 dòng):**
Kéo chú thích lên nằm cùng hàng với thuộc tính CSS tương ứng.
```css
  --breakpoint-2xl: 96rem; /* 1536px */
  --clr-text-toned: var(--clr-neutral-600); /* Secondary label */
```

**2. Chú thích dài / Mô tả kỹ thuật (Nhiều dòng):**
Tuyệt đối không dùng comment block lộn xộn. Bắt buộc dùng định dạng **DocBlock (JSDoc)**.
```css
  /**
   * HAI CÁCH dùng spacing (đều hợp lệ):
   * CÁCH 1 — Named tokens (agent-os-css style):
   * padding: var(--space-4);     → 2rem
   * gap:     var(--space-2);     → 1rem
   */
```

---

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
