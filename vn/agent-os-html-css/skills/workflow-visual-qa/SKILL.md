---
name: visual-qa-testing
description: Kiểm tra chất lượng giao diện — so sánh code với thiết kế, kiểm tra độ chính xác theo từng breakpoint và trạng thái tương tác. Dùng khi component hoặc trang đã hoàn chỉnh và cần duyệt trước khi merge.
---

# Visual QA Testing

## Tổng quan

So sánh có hệ thống giữa code với bản thiết kế. Không nhìn lướt qua — kiểm tra theo cấu trúc 6 trục. Thất bại nhanh: 1 vấn đề chặn = kết luận CẦN SỬA.

## Khi nào dùng

- Component / trang đã hoàn chỉnh, sẵn sàng review
- Sau bất kỳ thay đổi CSS nào ảnh hưởng tới bố cục hoặc giao diện
- Trước khi merge vào nhánh chính
- Sau khi triển khai responsive

## Khi nào KHÔNG dùng

- Đang làm dở (chờ cho đến khi section hoàn tất)
- Đang debug CSS

## Quy trình

### Bước 1: Chuẩn bị

- [ ] Mở Figma đặt cạnh trình duyệt
- [ ] Trình duyệt: đúng chiều rộng theo spec thiết kế (thường 1440px desktop, 375px mobile)
- [ ] Zoom cả hai cùng tỉ lệ

### Bước 2: Kiểm tra 6 trục

**Trục 1 — Màu sắc**

- [ ] Màu nền chính xác (dùng DevTools color picker so với Figma)
- [ ] Màu chữ chính xác
- [ ] Màu viền chính xác
- [ ] Màu trạng thái hover
- [ ] Kiểm tra: có khác biệt opacity không?

**Trục 2 — Typography**

- [ ] `font-family` đã load (tab Network → Fonts)
- [ ] `font-size` khớp (Figma Inspect → browser Computed)
- [ ] `font-weight` (400/500/600/700 — không xấp xỉ)
- [ ] `line-height` (giá trị không đơn vị, ví dụ 1.5 không phải 24px)
- [ ] `letter-spacing` (giá trị em)
- [ ] `text-transform` (none/uppercase/capitalize)

**Trục 3 — Spacing**

- [ ] Margin/padding đúng (±2px sai số cho phép)
- [ ] Gap trong flex/grid đúng
- [ ] Padding section (trên/dưới)
- [ ] Spacing bên trong component
> **Công cụ:** Dùng DevTools Box Model overlay

**Trục 4 — Cấu trúc bố cục**

- [ ] Số cột / cấu trúc grid đúng
- [ ] Thứ tự phần tử đúng
- [ ] Căn chỉnh (trái/giữa/phải) đúng
- [ ] Container max-width đúng
- [ ] Tỷ lệ khung hình ảnh giữ nguyên

**Trục 5 — Responsive (kiểm tra từng mức)**

- [ ] **375px**  — mobile
- [ ] **768px**  — tablet
- [ ] **1024px** — desktop nhỏ
- [ ] **1280px** — desktop
- [ ] **1440px** — rộng

> **Quy tắc mỗi mức:** kiểm tra cột thu gọn, thay đổi cỡ chữ, điều chỉnh spacing

**Trục 6 — Trạng thái tương tác**

- [ ] **Hover:** màu/gạch chân/scale đúng
- [ ] **Focus:** viền rõ ràng (không bị xóa)
- [ ] **Active:** có phản hồi
- [ ] **Disabled:** opacity/cursor đúng
- [ ] **Loading:** skeleton/spinner có mặt

### Bước 3: So sánh ảnh chụp

```javascript
// Chụp tại các breakpoint chính xác:
// 375px, 768px, 1280px

// DevTools: Ctrl+Shift+P → "Capture full size screenshot"
// So sánh lồng với bản xuất từ Figma
```

### Bước 4: Kết luận

> [!IMPORTANT]
> **DUYỆT** — tất cả 6 trục qua, không có vấn đề chặn
> **CẦN SỬA** — 1+ vấn đề chặn, liệt kê cụ thể cần sửa

---

## Lỗi thường gặp

| Vấn đề                | Nguyên nhân gốc                   | Kiểm tra                        |
| --------------------- | --------------------------------- | ------------------------------- |
| Font trông mỏng hơn   | Load weight 400, thiết kế cần 700 | Network → tab Fonts             |
| Spacing hơi lệch      | Chuyển đổi rem/px                 | Computed → so sánh px chính xác |
| Màu trông sai         | Opacity trên phần tử cha          | Kiểm tra tất cả ancestor        |
| Mobile vỡ bố cục      | Width hardcode                    | Computed width tại 375px        |
| Hover không hoạt động | Lỗi :hover specificity            | DevTools → Force state          |

## Checklist

- [ ] Màu chính xác (không xấp xỉ)
- [ ] Tất cả font-weight đã load
- [ ] Spacing trong khoảng ±2px
- [ ] Tất cả 4 breakpoint qua
- [ ] Tất cả trạng thái tương tác có mặt
- [ ] Không có lỗi console
- [ ] Keyboard navigation hoạt động

---

## 🤖 Agent OS Anti-Rationalization

> [!CAUTION]
> **Tác tử AI ĐỌC KỸ TRƯỚC KHI CODE:**
>
> 1. **Cấm lười biếng:** Không được lạm dụng !important để chữa cháy giao diện. BẮT BUỘC phải tuân thủ tầng Cascade (Cascade Layers - @layer).
> 2. **Cấm ngụy biện:** "Hardcode mã màu cho nhanh" là sai lầm chết người. Mọi màu sắc, khoảng cách (spacing), font-size đều PHẢI sử dụng CSS Variables (Design Tokens) như `var(--clr-bg)`, `var(--space-2)`.
> 3. **Bảo vệ Hệ thống:** Cấm nhồi nhét style trực tiếp vào thẻ HTML (Inline styles). Mọi tên class phải tuân thủ nguyên tắc BEM với tiền tố tiêu chuẩn (c-, l-, u-).
