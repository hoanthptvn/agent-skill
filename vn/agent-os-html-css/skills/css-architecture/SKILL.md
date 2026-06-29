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



## 🤖 Agent OS Anti-Rationalization

> [!CAUTION]
> **Tác tử AI ĐỌC KỸ TRƯỚC KHI CODE:**
>
> 1. **Cấm viết CSS Spaghetti:** Cấm lười biếng viết tất cả CSS vào một file khổng lồ. BẮT BUỘC phải phân rã theo cấu trúc Multi-File (Base, Layout, Component, Utility).
> 2. **Cấm lạm dụng @import sai chỗ:** Không dùng `@import` phân tán bên trong các file CSS con. Mọi `@import` phải được quy tụ tại một tệp `main.css` duy nhất để trình duyệt có thể cache và tối ưu tải.
> 3. **Tôn trọng Tầng Cascade:** Cấm dùng `!important` để đè style. Phải sử dụng `@layer` (VD: `@layer base, utilities;`) để giải quyết xung đột.
