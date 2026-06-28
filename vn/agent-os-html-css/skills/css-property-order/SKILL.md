---
name: css-property-order
description: Kỹ năng Agent chuyên biệt quy định THỨ TỰ SẮP XẾP THUỘC TÍNH CSS (CSS Property Order) chuẩn mực.
---

# CSS Property Order — Quy chuẩn Sắp xếp Thuộc tính (Concentric CSS)

Trong mọi project thuộc hệ sinh thái này, Tác tử AI (Agent) và Lập trình viên **BẮT BUỘC** phải tuân thủ thứ tự sắp xếp thuộc tính CSS từ ngoài vào trong (Outside-In / Concentric CSS) để đảm bảo tính nhất quán, dễ đọc và tối ưu hiệu suất.

Bất kỳ class CSS nào cũng phải sắp xếp các thuộc tính theo đúng 8 nhóm dưới đây:

## Bảng Thứ tự Chi tiết

### 1. GENERATED CONTENT
*Nội dung được tạo ra bởi CSS (Pseudo-elements).*
- `content`
- `quotes`

### 2. POSITIONING
*Định vị phần tử trong không gian (ra khỏi luồng tài liệu thông thường).*
- `position`
- `z-index`
- `inset` (`top`, `right`, `bottom`, `left`)
- `inset-block` (`inset-block-start`, `inset-block-end`)
- `inset-inline` (`inset-inline-start`, `inset-inline-end`)

### 3. DISPLAY & LAYOUT
*Cách phần tử hiển thị và quản lý luồng nội dung bên trong.*
- `display`
- `visibility`
- **Container Queries**: `container`, `container-type`, `container-name`
- **Flexbox**: `flex`, `flex-grow`, `flex-shrink`, `flex-basis`, `flex-flow`, `flex-direction`, `flex-wrap`
- **Grid**: `grid`, `grid-template`, `grid-template-areas`, `grid-template-columns`, `grid-template-rows`, `grid-auto-columns`, `grid-auto-rows`, `grid-auto-flow`, `grid-area`, `grid-column`, `grid-column-start`, `grid-column-end`, `grid-row`, `grid-row-start`, `grid-row-end`
- **Gap**: `gap`, `row-gap`, `column-gap`
- **Alignment**: `place-content`, `place-items`, `place-self`, `align-content`, `align-items`, `align-self`, `justify-content`, `justify-items`, `justify-self`, `order`
- **Float**: `float`, `clear`

### 4. BOX MODEL
*Kích thước, khoảng cách và thanh cuộn của hộp.*
- `box-sizing`
- **Size**: `width`, `min-width`, `max-width`, `inline-size`, `min-inline-size`, `max-inline-size`, `height`, `min-height`, `max-height`, `block-size`, `min-block-size`, `max-block-size`, `aspect-ratio`
- **Spacing**: `margin`, `margin-top`, `margin-right`, `margin-bottom`, `margin-left`, `margin-block`, `margin-block-start`, `margin-block-end`, `margin-inline`, `margin-inline-start`, `margin-inline-end`
- **Padding**: `padding`, `padding-top`, `padding-right`, `padding-bottom`, `padding-left`, `padding-block`, `padding-block-start`, `padding-block-end`, `padding-inline`, `padding-inline-start`, `padding-inline-end`
- **Overflow & Scroll**: `overflow`, `overflow-x`, `overflow-y`, `overflow-wrap`, `overscroll-behavior`, `scroll-behavior`, `scroll-snap-type`, `scroll-snap-align`, `scroll-margin`, `scroll-padding`

### 5. TYPOGRAPHY
*Kiểu chữ và định dạng văn bản.*
- `font`, `font-family`, `font-size`, `font-weight`, `font-style`, `font-variant`, `font-size-adjust`, `font-stretch`, `line-height`, `font-feature-settings`, `font-kerning`
- `text-align`, `text-align-last`, `text-transform`, `text-decoration`, `text-decoration-line`, `text-decoration-style`, `text-decoration-color`, `text-decoration-thickness`, `text-underline-offset`, `text-decoration-skip-ink`, `text-indent`, `text-justify`, `text-overflow`, `text-rendering`, `text-shadow`, `text-wrap`
- `letter-spacing`, `word-spacing`, `word-break`, `word-wrap`, `white-space`, `vertical-align`
- `list-style`, `list-style-position`, `list-style-type`, `list-style-image`

### 6. VISUAL
*Ngoại hình trực quan (Màu sắc, Background, Border).*
- `color`, `caret-color`, `accent-color`, `opacity`
- **Background**: `background`, `background-color`, `background-image`, `background-repeat`, `background-attachment`, `background-position`, `background-clip`, `background-origin`, `background-size`, `background-blend-mode`
- **Border**: `border`, `border-width`, `border-style`, `border-color`, `border-top`, `border-right`, `border-bottom`, `border-left`, `border-radius`, `border-top-left-radius`, `border-top-right-radius`, `border-bottom-right-radius`, `border-bottom-left-radius`
- **Outline**: `outline`, `outline-width`, `outline-style`, `outline-color`, `outline-offset`
- **SVG**: `fill`, `fill-opacity`, `stroke`, `stroke-width`, `stroke-dasharray`, `stroke-dashoffset`
- **Effects**: `box-shadow`, `box-decoration-break`, `filter`, `backdrop-filter`, `mix-blend-mode`, `clip`, `clip-path`, `mask`
- **Media**: `object-fit`, `object-position`

### 7. TRANSFORMS & MOTION
*Biến đổi hình học và Hiệu ứng chuyển động.*
- `transform`, `transform-origin`, `translate`, `rotate`, `scale`
- `transition`, `transition-property`, `transition-duration`, `transition-timing-function`, `transition-delay`
- `animation`, `animation-name`, `animation-duration`, `animation-timing-function`, `animation-delay`, `animation-iteration-count`, `animation-direction`, `animation-fill-mode`, `animation-play-state`

### 8. INTERACTION & MISC
*Tương tác người dùng và các thuộc tính khác.*
- `cursor`
- `pointer-events`
- `touch-action`
- `user-select`
- `resize`
- `will-change`

---

## 🤖 Agent OS Anti-Rationalization

> [!CAUTION]
> **Tác tử AI ĐỌC KỸ TRƯỚC KHI CODE:**
> 
> 1. **Tuyệt đối tuân thủ Order:** Khi tạo hoặc sửa bất kỳ block CSS nào, PHẢI tuân thủ 100% trật tự thuộc tính ở trên (Ví dụ: `display` phải luôn đứng trên `margin`, và `margin` phải luôn đứng trên `color`).
> 2. **Không ngoại lệ:** Thứ tự này áp dụng cho mọi Layer (Reset, Layout, Components, Utilities). Việc viết code lộn xộn sẽ bị đánh dấu là vi phạm tiêu chuẩn của Project.
