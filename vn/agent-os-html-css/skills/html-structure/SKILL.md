---
name: html-structure
description: Kỹ năng xây dựng cấu trúc HTML Semantic chuẩn Enterprise, tối ưu Accessibility (A11y/ARIA), SEO và xác lập giao thức tương tác DOM Contract (data-*).
---

# Kỹ năng: Kiến trúc Cấu trúc HTML (Semantic, SEO & Accessibility)

> **Dành cho AI Agent:** Đây là hướng dẫn tiêu chuẩn cho việc xây dựng HTML Skeleton. Đọc kỹ để đảm bảo cấu trúc trang luôn có tính tháo rời cao, chuẩn SEO, đạt chuẩn tiếp cận tiếp cận (A11y) và không lạm dụng `div` vô tội vạ.

---

## 1. Cấu trúc Layout Semantic (Tránh Div-Soup)

Tuyệt đối không lạm dụng thẻ `<div>`. Sử dụng các thẻ HTML5 Semantic để phân định ranh giới rõ ràng cho layout:

- `<header>`: Phần đầu trang hoặc đầu section (chứa logo, navigation, search bar).
- `<nav>`: Danh sách liên kết điều hướng chính (luôn chứa bên trong thẻ `<ul>`/`<li>`).
- `<main>`: Nội dung chính và độc nhất của tài liệu. Chỉ được xuất hiện **duy nhất 1 thẻ** `<main>` trên mỗi trang.
- `<article>`: Khối nội dung độc lập, có thể tái sử dụng hoặc tự phát hành (ví dụ: bài viết blog, thẻ card sản phẩm).
- `<section>`: Phân đoạn nội dung có chủ đề cụ thể (luôn phải bắt đầu bằng một thẻ heading từ `<h2>` đến `<h6>`).
- `<aside>`: Nội dung phụ trợ hoặc liên quan gián tiếp (sidebar, quảng cáo, danh mục lọc).
- `<footer>`: Phần chân trang hoặc chân của một section.

---

## 2. Giao thức Tương tác (DOM Contract)

Bắt buộc tách biệt vai trò của HTML/JS và CSS để tối ưu hóa khả năng bảo trì:

- **Style (CSS):** Trị nhậm bởi Class BEM (`c-btn`, `l-grid`, `u-flex`).
- **Interaction (JS & Testing):** Trị nhậm bởi các thuộc tính `data-*`.
  - _Quy tắc:_ JS không được ràng buộc sự kiện hoặc truy vấn DOM dựa trên các class CSS trang trí. Bắt buộc dùng `data-js-*` hoặc `data-action`.
  - _Ví dụ:_ Dùng `data-js-toggle="modal"` thay vì `.js-modal-toggle`.
- **UI States (Trạng thái giao diện):**
  - Tránh dùng class như `.active`, `.open` để JS thay đổi style trực tiếp.
  - Sử dụng thuộc tính trạng thái chuẩn `aria-*` hoặc `data-state`.
  - _Ví dụ:_
    - Nút Menu đang mở: `<button data-state="open" aria-expanded="true">` ✅
    - Tránh dùng: `<button class="active">` ❌

---

## 3. Khả năng tiếp cận (Accessibility - A11y) & SEO

Một website premium phải thân thiện với cả công cụ tìm kiếm và trình đọc màn hình cho người khiếm thị:

### Cấp bậc Heading (SEO Hierarchy)

- **Duy nhất một `<h1>`** trên toàn trang, là tiêu đề chính lớn nhất.
- Heading không được nhảy cấp (ví dụ: từ `<h1>` nhảy thẳng xuống `<h3>` mà không có `<h2>` ở giữa).
- Không dùng thẻ heading chỉ nhằm mục đích làm to chữ. Nếu muốn chữ to, hãy sử dụng Utility classes của CSS (`.h1`, `.h2`).

### Tích hợp Dự án Thực tế (Cấu trúc PHP/YAML)

- **SEO Config:** Bắt buộc đồng bộ và đọc cấu hình từ file `common/seo.yaml` để tự động điền các trường `<title>`, `<meta name="description">` và `<meta name="keywords">`.
- **Cắt khối dùng chung (Include):** Các khối markup lặp lại (Header, Footer, Navigation) bắt buộc phải cắt ra đưa vào `common/include_disp.php` để tránh nhân bản mã nguồn.

### Thuộc tính ARIA & Alt

- **Hình ảnh:** Bắt buộc có thuộc tính `alt`. Nếu ảnh chỉ mang tính trang trí (decorative), dùng `alt=""` kèm `aria-hidden="true"`.
- **Nút không chữ (Icon Buttons):** Nút chỉ chứa icon bắt buộc phải có `aria-label` để trình đọc hiểu công dụng.
  - _Ví dụ:_ `<button aria-label="Đóng cửa sổ"><svg>...</svg></button>`
- **Trạng thái động:** Cập nhật `aria-expanded="true/false"` cho các menu dropdown, `aria-hidden="true/false"` cho các modal ẩn/hiện.

---

## 4. Tải dữ liệu hiệu năng (Asset Loading)

- **Hình ảnh:** Bắt buộc sử dụng thuộc tính `loading="lazy"` để trì hoãn tải các ảnh ngoài màn hình.
- **Tránh giật layout (Layout Shift):** Luôn khai báo kích thước gốc `width` và `height` trên thẻ `<img>` để trình duyệt giữ chỗ trước khi ảnh tải xong.

---

## Các Quy Tắc HTML Cốt Lõi (HTML Rules)

### Cấu trúc cơ bản

- 1 `<h1>` duy nhất trên mỗi trang. Hệ thống heading không được skip bậc (từ h1 phải xuống h2, rồi mới tới h3).
- Dùng `<button>` cho các hành động (click để mở, đổi trạng thái), dùng `<a>` cho chuyển hướng trang (navigation).
- Các nút dạng Icon (không có text) bắt buộc phải có `aria-label`.
- Link ra ngoài (External link): bắt buộc có `target="_blank" rel="noopener"`.
- Không dùng thẻ `<div>` khi có element semantic phù hợp (`<header>`, `<main>`, `<section>`, `<article>`, `<nav>`, `<footer>`).

### Trích dẫn, Hình ảnh & Mã nguồn (Quotes, Figures, Code)

- **NÊN** dùng `<blockquote>` cho các đoạn trích dẫn dài, kèm `cite` cho nguồn. Không dùng `<blockquote>` chỉ để tạo indent (thụt lề).
- **NÊN** dùng `<figure>` cho nội dung độc lập (hình ảnh, code) có chú thích `<figcaption>` (làm con đầu hoặc cuối). Không dùng `<figure>` bừa bãi cho ảnh đơn lẻ không cần chú thích.
- **NÊN** dùng `<cite>` để xác định **tiêu đề** tác phẩm (sách, web), không phải tên tác giả.
- **NÊN** dùng `<code>` cho mã inline, và bọc trong `<pre>` cho khối mã. Thêm `tabindex="0"` vào `<pre>` nếu nó có cuộn (scrollable). Không dùng `<pre>` độc lập thiếu `<code>`.

### Tối ưu Hiệu suất & Hình ảnh (Performance & Images)

- **NÊN** dùng `fetchpriority="high"` cho phần tử LCP (Largest Contentful Paint) (ví dụ: ảnh hero). Không lạm dụng nó.
- **NÊN** dùng `<link rel="preload" as="image">` + `fetchpriority="high"` cho ảnh hero background định nghĩa trong CSS.
- **NÊN** áp dụng `loading="lazy"` cho ảnh/iframe ngoài màn hình (below the fold). Tuyệt đối **KHÔNG** dùng `loading="lazy"` cho ảnh LCP (ảnh hiển thị ngay lúc đầu).
- **NÊN** chỉ định `width` và `height` trên mọi thẻ `<img>` và `<video>` để chống lỗi Layout Shift (CLS).
- **NÊN** sử dụng `srcset` trên `<img>` hoặc thẻ `<picture>` (kèm `<img>` fallback) để kiểm soát định dạng, kích cỡ, crop.

### Media Elements (Video/Audio)

- **NÊN** khai báo hình ảnh `poster` cho `<video>`.
- **NÊN** dùng thẻ `<track>` cho phụ đề (subtitles/captions).
- Các video làm hình nền (background video) phải: `muted`, bỏ thuộc tính `controls`, thêm `role="none"` hoặc `aria-hidden="true"`.
- **KHÔNG NÊN** loại bỏ controls gốc nếu chúng đủ tốt, và KHÔNG ẩn các thẻ có thể focus (như iframe tương tác) bằng `role="none"`.

---

## JS Hooks & DOM Contracts

### Nguyên tắc cốt lõi

Class **chỉ dành cho CSS**. Tuyệt đối không giấu trạng thái logic bên trong bộ nhớ JS nội bộ.

**BẮT BUỘC** đẩy toàn bộ trạng thái (state) ra ngoài HTML thông qua các thuộc tính `data-*`:

```html
<!-- Root component -->
<div class="c-slider" data-slider="wrapper">
  <!-- Child roles -->
  <div data-slider="slide">
    <button data-slider="next-button">
      <!-- Config options -->
      <div data-slider-autoplay="true" data-slider-duration="4">
        <!-- State -->
        <div data-slider="slide" data-state="active"></div>
      </div>
    </button>
  </div>
</div>
```

**Ví dụ state attributes:**

- `data-state="loading"` — trạng thái tải
- `data-is-active="true"` — trạng thái kích hoạt
- `data-cart-total="5"` — dữ liệu đếm

### Lý do dùng `data-*` thay class

`data-*` biến HTML thành một "Hợp đồng DOM" (Machine-readable) giúp AI agent và hệ thống test có thể đọc hiểu trạng thái thật của ứng dụng một cách tự động.

### Ngoại lệ quan trọng

> **LƯU Ý CỰC KỲ QUAN TRỌNG:** Nếu thành phần hoàn toàn là HTML/CSS tĩnh, không có tương tác JS, GSAP hay nhu cầu quản lý State, thì **TUYỆT ĐỐI KHÔNG** thêm `data-attribute` thừa thãi vào HTML.

---

## Khả năng truy cập (Accessibility - A11y)

- Độ tương phản màu ≥ 4.5:1 (đối với chữ thường), ≥ 3:1 (đối với chữ lớn).
- Trạng thái Focus (`:focus-visible`) phải nhìn thấy rõ ràng trên mọi phần tử tương tác.
- Không dùng màu sắc làm cách duy nhất để truyền đạt thông tin (ví dụ: lỗi thì phải có text báo lỗi hoặc icon cảnh báo, không chỉ đổi viền đỏ).
- Chỉ dùng thuộc tính ARIA khi HTML gốc không đủ đáp ứng.

---

## 🚫 Bảng Chống Ngụy Biện (Anti-rationalization Table)

| Cớ của AI (AI's Excuse)                                                                       | Phản biện bắt buộc của Hệ thống (System's Rebuttal)                                                                                                          |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| "Tôi dùng `div` và `span` hết cho nhanh, tí nữa CSS lên vẫn đẹp như thường."                  | **KHÔNG ĐƯỢC PHÉP.** HTML sai semantic sẽ giết chết điểm SEO và không thể tiếp cận bởi Screen Reader. Phải sửa ngay sang thẻ chuẩn.                          |
| "Gắn sự kiện click vào class `.c-button--primary` rất tiện, đỡ phải tạo thuộc tính `data-*`." | **SAI LẦM.** Khi Designer yêu cầu thay đổi kiểu dáng nút từ primary sang secondary, class bị sửa dẫn đến JS bị vỡ (gãy DOM Contract). Phải dùng `data-js-*`. |
| "Nút Close có hình chữ X rõ ràng rồi, không cần viết chữ hay aria-label làm gì."              | **THIẾU CHUYÊN NGHIỆP.** Người khiếm thị không nhìn thấy hình chữ X. Screen Reader sẽ đọc là "button" không có nhãn. Phải thêm `aria-label="Đóng"`.          |

---

## 🏁 Tiêu chí Thoát (Hard Exit Criteria)

Tác vụ viết HTML chỉ được coi là hoàn thành khi:

1. Đảm bảo cấu trúc Heading phân cấp tuyến tính (không nhảy cóc).
2. Toàn bộ các tương tác bằng Javascript đều được liên kết thông qua thuộc tính `data-*`.
3. Kiểm tra bằng công cụ kiểm thử không có thẻ `<img>` nào thiếu thuộc tính `alt`.


## 🤖 Agent OS Anti-Rationalization

- KHÔNG tự tiện bỏ qua các rules naming convention (BEM/Utility).
- KHÔNG viết custom inline styles.
- KHÔNG suy diễn tự tạo file mới nếu chưa có trong kiến trúc.
- BẮT BUỘC tuân thủ Outside-In hierarchy khi code UI.
