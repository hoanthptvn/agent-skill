---
name: premium-ui-mindset
description: Tư duy luận giải và thiết kế UI/UX ở cấp độ SOTD (Site of the Day). Sử dụng khi cần code UI cao cấp, animations, CSS kiến trúc chuẩn mực.
license: MIT
---

# Kỹ năng: Tư duy Premium UI (Awwwards 60fps)

## MỤC ĐÍCH
Kỹ năng này trang bị cho AI tư duy luận giải và thiết kế UI/UX ở cấp độ SOTD (Site of the Day). 
**QUAN TRỌNG:** KHÔNG BAO GIỜ copy/paste code mẫu một cách máy móc. Bạn phải dùng TƯ DUY phân tích vấn đề và tự code giải pháp dựa trên các bước luận giải, nguyên tắc kiến trúc và nguyên tắc hiệu năng bên dưới.

## CHUẨN MỰC KIẾN TRÚC CSS
Hệ thống bắt buộc tuân thủ các chuẩn mực kiến trúc chuyên nghiệp:

### 1. Media Queries & Responsive
- Khi viết CSS cho màn hình nhỏ, bắt buộc dùng `max-width` với giá trị tận cùng là `.98px` để tránh hiện tượng kẹt/trùng breakpoint (ví dụ: `max-width: 767.98px`).
- CSS thuộc Media nào thì viết đúng trong Media block đó. CSS nào dùng chung mới viết ở root (ngoài media).
- **TUYỆT ĐỐI KHÔNG** ghi đè CSS lung tung rải rác ở các media khác nhau gây khó kiểm soát.

### 2. CSS Logical Properties
Sử dụng Logical Properties thay thế cho Physical Properties để giao diện tự động thích nghi với các hệ ngôn ngữ LTR (Left-to-Right) và RTL (Right-to-Left).
```css
/* ✅ BẮT BUỘC SỬ DỤNG (Logical Properties) */
inline-size: 100px; /* thay cho width */
block-size: 100px; /* thay cho height */
max-inline-size: 500px; /* thay cho max-width */
margin-block-start: 20px; /* thay cho margin-top */
margin-inline-start: 20px; /* thay cho margin-left */
padding-inline-start: 10px; /* thay cho padding-left */
inset: 0; /* thay cho top, right, bottom, left */
```

### 3. Tiền tố phân cấp (Class Prefixing)
Sử dụng các tiền tố bắt buộc để phân tách trách nhiệm của class, giúp dễ đoán nguồn gốc và mức độ ảnh hưởng (cascade):
- `l-` (Layout): Quản lý bộ khung, container, khoảng cách vĩ mô (VD: `.l-container`, `.l-grid`). Ưu tiên thấp.
- `c-` (Component): Giao diện độc lập, tái sử dụng (VD: `.c-btn`, `.c-card`). Ưu tiên trung bình.
- `p-` (Page): Dành riêng cho trang cụ thể (VD: `.p-top`, `.p-company`). Ưu tiên khá cao (override).
- `u-` (Utility): Class tiện ích đơn mục đích, ghi đè mạnh (VD: `.u-mt-4`, `.u-hidden`). Ưu tiên rất cao.
- `is-` / `has-` (State): Trạng thái, thường do JS điều khiển (VD: `.is-active`, `.has-error`). Ưu tiên cao nhất.

### 4. Thứ tự sắp xếp thuộc tính CSS (Property Order)
Bắt buộc tuân thủ thứ tự khai báo thuộc tính CSS từ trên xuống dưới trong mọi class để đảm bảo code sạch và dễ bảo trì:
1. **GENERATED CONTENT**: `content`
2. **POSITIONING**: `position`, `inset` (`top`, `right`...), `z-index`
3. **DISPLAY & LAYOUT**: `display`, `flex`, `grid`, `gap`, `align-items`, `justify-content`
4. **BOX MODEL**: `margin`, `padding`, `width`/`height` (`inline-size`/`block-size`), `box-sizing`
5. **TYPOGRAPHY**: `font-family`, `font-size`, `font-weight`, `line-height`, `text-align`, `color`
6. **VISUAL**: `background`, `border`, `border-radius`, `box-shadow`, `opacity`, `clip-path`
7. **TRANSFORMS & MOTION**: `transform`, `transform-origin`, `transition`, `animation`
8. **INTERACTION & MISC**: `pointer-events`, `cursor`, `user-select`, `overflow`

### 5. Hệ thống 3 Tầng Biến CSS (The 3-Layer System)
Để quản lý Design System linh hoạt và dễ bảo trì, mọi biến CSS (Custom Properties) phải tuân theo cấu trúc 3 tầng phân cấp rõ ràng:
- **Tầng 1 — Primitive (Design Tokens):** Các giá trị vật lý gốc, không mang ngữ cảnh UI. (VD: `--color-blue-500: #3b82f6;`, `--space-4: 1rem;`). Chỉ định nghĩa ở `:root`.
- **Tầng 2 — Semantic (Ý nghĩa UI):** Ánh xạ từ Tầng 1 sang các biến mang ý nghĩa chức năng. (VD: `--color-primary: var(--color-blue-500);`, `--bg-surface: var(--color-white);`). Định nghĩa ở `:root` hoặc `[data-theme]`.
- **Tầng 3 — Component Tokens (Biến Component):** Biến cục bộ nội bộ, chỉ tồn tại trong phạm vi của một component. (VD: `.c-btn { --btn-bg: var(--color-primary); background: var(--btn-bg); }`). Cực kỳ hữu ích để override giao diện nhanh chóng bằng cách gọi inline CSS từ HTML (VD: `style="--btn-bg: red"`).

### 6. Chống chớp sáng (Zero-Flash Theme Toggles / FOUC Prevention)
- **TUYỆT ĐỐI KHÔNG** dùng `useEffect` (trong React) hoặc JS chạy sau để thiết lập theme (sáng/tối) ở lần render đầu tiên, vì sẽ gây chớp sáng mù mắt (FOUC).
- Bắt buộc dùng một thẻ `<script>` đồng bộ (inline) đặt ngay trong `<head>` để xác định và gán `data-theme` trước khi trình duyệt kịp render.

### 7. Trải nghiệm Đọc (Typography & Measure)
- **Độ dài dòng (Measure):** Giới hạn độ dài các khối văn bản đọc (như bài viết) bằng đơn vị `ch` để duy trì nhịp điệu đọc ổn định (ví dụ: `max-width: 66ch;`). Tuyệt đối không hardcode pixel cố định như `1200px`.

## 3 BƯỚC LUẬN GIẢI KHI LÀM UI COMPONENT

### Step 1: Semantic HTML & Hooking (Hợp đồng DOM)
- Class **chỉ dành cho CSS**. Tuyệt đối cấm dùng JS query selector vào CSS class (ví dụ `.c-btn`, `.is-active`).
- **BẮT BUỘC** đẩy toàn bộ trạng thái (state) và logic ra ngoài HTML thông qua các thuộc tính `data-*` (ví dụ `data-component="dropdown"`, `data-action="toggle"`, `data-state="open"`). Tuyệt đối không giấu trạng thái logic bên trong bộ nhớ JS nội bộ.
  - **Lý do dùng `data-*` thay class**: `data-*` biến HTML thành một "Hợp đồng DOM" (Machine-readable) giúp AI agent và hệ thống test có thể đọc hiểu trạng thái thật của ứng dụng một cách tự động.
  - **NGOẠI LỆ CỰC KỲ QUAN TRỌNG**: Nếu thành phần hoàn toàn là HTML/CSS tĩnh, không có tương tác JS, GSAP hay nhu cầu quản lý State, thì **TUYỆT ĐỐI KHÔNG** thêm `data-attribute` thừa thãi vào HTML.
- Đảm bảo tính tiếp cận (A11y): `aria-expanded`, `aria-hidden`, button luôn có `aria-label`.

### Step 2: CSS State Management & Animation (Chuẩn Awwwards)
- Tách hoàn toàn logic (JS) khỏi presentation (CSS) bằng kỹ thuật **`data-` + class toggle**:
  - HTML tuyệt đối không dùng inline CSS. Chỉ dùng `data-attribute` để cấu hình: `<h1 data-animate="fade-up" data-delay="200">...</h1>`
  - CSS tự xử lý animation cơ bản:
    ```css
    [data-animate] { opacity: 0; transform: translateY(var(--fade-y, 24px)); transition: opacity 0.5s var(--ease-out-expo), transform 0.5s var(--ease-out-expo); }
    [data-animate].is-visible { opacity: 1; transform: translateY(0); }
    ```
  - JS (`IntersectionObserver`) đảm nhận việc gán class `.is-visible` và set inline CSS động (chỉ JS/GSAP mới được quyền set inline CSS):
    ```javascript
    document.querySelectorAll("[data-animate]").forEach((el) => {
      if (el.dataset.delay) el.style.transitionDelay = `${el.dataset.delay}ms`;
      observer.observe(el);
    });
    ```
- **Mô hình 3-State Visibility:** Thay vì `display: none`, hãy thiết kế 3 state: `active` (opacity 1, pointer-events auto), `transition-out` (opacity 0, visible), và `not-active` (opacity 0, pointer-events none).
- Chỉ animate `transform, opacity, clip-path`. Tuyệt đối không animate `width, height, top, left`.

### Step 3: JS GSAP Performance (60fps)
- Cấm lạm dụng `gsap.to()` trong sự kiện `mousemove`/`scroll`. Dùng `gsap.quickTo()` hoặc `gsap.quickSetter()`.
- Component phải là **Multi-instance**: Hàm JS phải duyệt qua mảng `document.querySelectorAll()` và khởi tạo GSAP context cục bộ bằng `gsap.context(..., element)` để tránh conflict.
- Luôn dọn dẹp bằng `gsap.matchMedia()` cleanup.
- Ưu tiên sử dụng các Easing đỉnh cao (Premium CustomEase) được định nghĩa tại `gsap-choreography` thay vì ease mặc định.

## 8 NGUYÊN LÝ THÉP (KHÔNG ĐƯỢC VI PHẠM)
1. **Zero JS-Class:** Không bao giờ cho phép JS gọi `.class`.
2. **Layer Stacking:** Bố cục z-index phải tự nhiên bằng cách `position: absolute` và thứ tự DOM, không lạm dụng `z-index: 9999`.
3. **Fluid Unit:** Sử dụng `em` cho Typography, `rem` cho Spacing, bọc trong hàm `clamp()`.
4. **CSS Watch Pattern:** JS không đo breakpoint. CSS khai báo `--offset: 10px;` và JS đọc qua `getComputedStyle`.
5. **No Layout Thrashing:** GSAP Flip cho thay đổi DOM thay vì animate padding/margin.
6. **Scrub Easing:** `scrollTrigger: { scrub: true }` BẮT BUỘC phải đi kèm `ease: "none"`.
7. **Filter Caching:** Với bài toán Live Search/Filter, khởi tạo danh sách vào `Map/Set` từ đầu (O(1)), tránh query DOM lại mỗi khi gõ phím.
8. **Double-Layer Optical Illusion:** Khi làm hiệu ứng phức tạp (như wipe text), lồng 2 layer với `clip-path` thay vì dùng JS tính toán vất vả.

## BÀI HỌC CHỐNG ẢO TƯỞNG KHI CLONE GIAO DIỆN (UI CLONING ANTI-PATTERNS)
Khi được yêu cầu clone một trang web (đặc biệt là các trang Awwwards/SOTD), Agent BẮT BUỘC phải tuân thủ quy trình sau để tránh bệnh "tự ảo tưởng" (Assumption Bias):

1. **Quy tắc "Mắt thấy mới tin" (Visual Verification First)**
   - Không được phép tự "chế" ra các hiệu ứng (Custom Cursor, Percentage Preloader, Clip-path bung nở) nếu người dùng không yêu cầu hoặc không có bằng chứng hình ảnh. Sự cao cấp (Premium) thường nằm ở Cấu trúc hình học (Geometry) và Khoảng trắng (Negative Space) chứ không phải nhồi nhét GSAP.
   - Khi clone một trang web mới, TUYỆT ĐỐI không chỉ tin vào DOM HTML/CSS (vì HTML không phản ánh đúng vị trí thực tế của Grid, Absolute, hoặc WebGL). Phải dùng `browser_subagent` để chụp ảnh màn hình (Screenshots) trước khi thiết kế Layout.

2. **Quy tắc Trích xuất (Asset & Layout Exactness)**
   - Bố cục phải được thiết kế chính xác từng Pixel (Pixel-perfect) dựa trên ảnh chụp màn hình (Ví dụ: tỷ lệ chia 40-60, thẻ vuông tỷ lệ 1:1).
   - Tôn trọng Typography: Typo trên các trang cao cấp thường đóng vai trò như các bức tường hình học (Structural Elements). Cần phân biệt rõ giữa *Hiển thị đồ họa (Display Typo)* và *Văn bản đọc hiểu (Readability Typo)*. Không lạm dụng `clamp()` bừa bãi nếu trang gốc yêu cầu Font chữ cố định lấn màn hình.
## OUTPUT MONG MUỐN
- Khi viết code, AI hãy chỉ ra rõ đoạn nào là Step 1, Step 2, Step 3.
- Mọi class CSS sinh ra phải là White-label (dựa trên class prefixing quy định ở trên, VD: `c-card`, `l-grid`, `u-mb-20`). Không chứa tên của bất kỳ agency hay framework cụ thể nào.
