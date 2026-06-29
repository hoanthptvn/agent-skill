---
name: css-naming-conventions
description: Kỹ năng Agent chuyên biệt quy định Tiêu chuẩn đặt tên Class CSS theo chuẩn BEM và Namespacing cho hệ thống.
---

# BEM Naming Conventions & Namespacing

> Tài liệu phân tích cách đặt tên Class CSS trong production-grade, áp dụng theo mô hình BEM cải tiến và kiến trúc FLOCSS của hệ thống. TUYỆT ĐỐI KHÔNG dùng file này để tra cứu cách đặt tên Biến CSS (CSS Variables) — hãy tham khảo `css-design-tokens`.

---

## Mục lục

1. [Tổng quan về Namespacing](#1-tổng-quan-về-namespacing)
2. [Cú pháp BEM Chuẩn](#2-cú-pháp-bem-chuẩn)
3. [Page Namespace Pattern](#3-page-namespace-pattern)
4. [Từ điển Đặt tên Component (6 Nhóm)](#4-từ-điển-đặt-tên-component)
5. [Class Order trên HTML](#5-class-order-trên-html)

---

## 1. Tổng quan về Namespacing

Hệ thống sử dụng các tiền tố (Prefix) bắt buộc để phân tách trách nhiệm của từng class. Điều này giúp Agent và lập trình viên dễ dàng đoán được nguồn gốc và mức độ ảnh hưởng của class đó.

| Prefix | Ý nghĩa | Ví dụ | Mức độ ưu tiên (Cascade) |
|---|---|---|---|
| `l-` | **Layout**: Quản lý bộ khung, container, khoảng cách macro. | `.l-container`, `.l-grid` | Thấp (Nền tảng) |
| `c-` | **Component**: Thành phần giao diện độc lập, tái sử dụng. | `.c-btn`, `.c-card` | Trung bình |
| `p-` | **Page**: Namespace dành riêng cho một trang cụ thể. | `.p-top`, `.p-company` | Khá cao (Override) |
| `u-` | **Utility**: Class tiện ích đơn mục đích, ghi đè mạnh. | `.u-mt-4`, `.u-hidden` | Rất cao |
| `is-` / `has-` | **State**: Trạng thái (thường được JS toggle). | `.is-active`, `.has-error` | Cao nhất (Ngang ngửa Utility) |

> **Lưu ý:** Prefix `js-` chỉ dùng để DOM query cho Javascript, KHÔNG BAO GIỜ được dùng để viết style CSS.

---

## 2. Cú pháp BEM Chuẩn

Hệ thống tuân thủ BEM (Block, Element, Modifier).

### Quy tắc cốt lõi:
- **Block**: Cấu trúc độc lập có ý nghĩa riêng (VD: `.c-card`).
- **Element** (`__`): Thành phần con bên trong Block (VD: `.c-card__title`).
- **Modifier** (`--`): Biến thể về hình dáng, trạng thái của Block (VD: `.c-card--featured`).

### Lỗi CẤM KỴ: Không lồng Element (No Grandchildren)
**TUYỆT ĐỐI KHÔNG** được tạo ra Element của Element (VD: `Block__Element__Element`). Dù cấu trúc HTML lồng nhau sâu đến mấy, tên class Element vẫn phải là con trực tiếp của Block.

```html
<!-- ❌ SAI: Lồng Element -->
<div class="c-card">
  <div class="c-card__body">
    <h3 class="c-card__body__title">...</h3> <!-- Sai -->
  </div>
</div>

<!-- ✅ ĐÚNG: Flat BEM -->
<div class="c-card">
  <div class="c-card__body">
    <h3 class="c-card__title">...</h3> <!-- Đúng -->
  </div>
</div>
```

---

## 3. Page Namespace Pattern (`.p-`)

**Nguyên tắc:** Tên trang là namespace chung. Mỗi section là Modifier của namespace đó. KHÔNG gộp chung `.p-` với `.l-` hay `.c-` để tránh xung đột CSS.

```css
.p-[trang]                 ← Base: namespace của trang
.p-[trang]--[section]      ← Modifier: phân biệt section
.p-[trang]__[element]      ← Element: phần tử bên trong
```

**Bảng namespace theo trang:**

| Trang      | File                 | Namespace    |
| ---------- | -------------------- | ------------ |
| Trang chủ  | `index.html`         | `.p-top`     |
| Giới thiệu | `company/index.html` | `.p-company` |
| Dịch vụ    | `service/index.html` | `.p-service` |
| Tin tức    | `news/index.html`    | `.p-news`    |
| Liên hệ    | `contact/index.html` | `.p-contact` |

---

## 4. Từ điển Đặt tên Component (6 Nhóm)

Phải bám sát các tên class BEM tiêu chuẩn này khi xây dựng Component để đảm bảo tính nhất quán trên toàn hệ thống.

### Nhóm 1 — Nhập liệu & Tương tác

| Component              | Class BEM                     | Ghi chú / Cấu trúc                                                                   |
| ---------------------- | ----------------------------- | ------------------------------------------------------------------------------------ |
| Button                 | `.c-btn`                      | Elements: `__prepend` `__body` `__append` · Modifier: `--primary` `--ghost` `--icon` |
| Floating Action Button | `.c-fab`                      | Dùng `position: fixed`, z-index: 100                                                 |
| Input Group            | `.c-input-group`              | Elements: `__label` `__input` `__help` · Modifier: `--error`                         |
| Textarea               | `.c-textarea`                 | Elements: `__label` `__field` `__help`                                               |
| Select / Dropdown      | `.c-select`                   | Dùng `<select>` native + `appearance: none`                                          |
| Checkbox               | `.c-checkbox`                 | Elements: `__input` `__body` `__label` `__help`                                      |

### Nhóm 2 — Hiển thị Dữ liệu

| Component  | Class BEM    | Ghi chú                                                     |
| ---------- | ------------ | ----------------------------------------------------------- |
| Table      | `.c-table`   | Elements: `__head` `__row` `__cell` `__foot`                |
| List       | `.c-list`    | Elements: `__item` `__icon` `__text` · Modifier: `--second` |
| Avatar     | `.c-avatar`  | Modifier: `--sm` `--md` `--lg`                              |
| Badge      | `.c-badge`   | Wrapper bọc ngoài target element                            |
| Chip / Tag | `.c-chip`    | Elements: `__label` `__icon`                                |

### Nhóm 3 — Phản hồi Trạng thái

| Component        | Class BEM              | Ghi chú                                              |
| ---------------- | ---------------------- | ---------------------------------------------------- |
| Dialog / Modal   | `.c-dialog`            |                                                      |
| Alert            | `.c-alert`             | Modifier: `--success` `--warning` `--error` `--info` |
| Snackbar / Toast | `.c-toast`             |                                                      |
| Skeleton         | `.c-skeleton`          | Dùng cho loading state                               |

### Nhóm 4 — Bề mặt & Container

| Component        | Class BEM      | Ghi chú                                                                                                             |
| ---------------- | -------------- | ------------------------------------------------------------------------------------------------------------------- |
| Card             | `.c-card`      | Elements: `__aside` `__figure` `__image` `__header` `__title` `__subtitle` `__body` `__copy` `__footer` `__actions` |
| Accordion        | `.c-accordion` | Elements: `__item` `__trigger` `__content`                                                                          |
| App Bar / Header | `.c-header`    | Elements: `__logo` `__nav` `__actions`                                                                              |
| Banner           | `.c-banner`    | Elements: `__body` `__actions`                                                                                      |

### Nhóm 5 — Điều hướng

| Component          | Class BEM        | Ghi chú                                                   |
| ------------------ | ---------------- | --------------------------------------------------------- |
| Navigation (chính) | `.c-nav`         | Elements: `__list` `__item` `__link`                      |
| Tabs               | `.c-tabs`        | Elements: `__list` `__item` `__link` `__section` `__body` |
| Breadcrumbs        | `.c-breadcrumbs` | Elements: `__list` `__item` `__link`                      |
| Pagination         | `.c-pagination`  | Elements: `__list` `__item` `__link`                      |

### Nhóm 6 — Semantic Suffix Block (Mở rộng Block)

Khi cùng "loại" component (VD: Card) xuất hiện nhiều nơi nhưng có **cấu trúc HTML hoàn toàn khác biệt** và gắn liền với ngữ nghĩa cụ thể:

| Block             | Domain                 | Elements đặc trưng                  |
| ----------------- | ---------------------- | ----------------------------------- |
| `.c-card-team`    | Nhân sự / thành viên   | `__avatar` `__name` `__role`        |
| `.c-card-price`   | Bảng giá / gói dịch vụ | `__badge` `__amount` `__features`   |
| `.c-card-product` | Sản phẩm thương mại    | `__media` `__rating` `__cta`        |
| `.c-card-news`    | Bài viết / tin tức     | `__thumbnail` `__category` `__date` |

Và nếu `.c-card-product` cần có biến thể nổi bật: `<article class="c-card-product c-card-product--featured">`

---

## 5. Class Order trên HTML

Thứ tự các class trên 1 thẻ HTML phải luôn theo logic từ "Bao quát" đến "Cụ thể" để dễ đọc:
`[Layout] → [Component] → [Modifier] → [Visual State] → [Utility]`

**Ví dụ đúng:**
```html
<article class="l-stack c-card c-card--glass is-active u-m-4">
```
*Giải thích:* Nó nằm trong Stack Layout (`l-stack`), nó là Card Component (`c-card`), phiên bản Kính (`c-card--glass`), đang được chọn (`is-active`), và bị ép margin 4 (`u-m-4`).

---

## 🤖 Agent OS Anti-Rationalization

> [!CAUTION]
> **Tác tử AI ĐỌC KỸ TRƯỚC KHI CODE:**
>
> 1. **Cấm đặt tên Cảm tính:** Tuyệt đối cấm đặt tên class CSS theo kiểu mô tả ngoại hình (`.red-text`, `.big-box`). BẮT BUỘC tuân thủ BEM với tiền tố tiêu chuẩn (`c-`, `l-`, `u-`).
> 2. **Phân định ranh giới Biến (CSS Variables):** Cấm nhầm lẫn giữa Biến Giao diện (`--ui-*`) và Biến Nguyên thủy (`--clr-*`). Component chỉ được phép consume (tiêu thụ) biến Semantic.
> 3. **Bảo vệ Trạng thái JS:** Không dùng class CSS (như `.active`) để đánh dấu trạng thái logic. Phải dùng `is-active` hoặc Data Attributes (`data-state="active"`).
