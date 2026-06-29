---
name: figma-to-code
description: Chuyển đổi thiết kế Figma thành HTML/CSS chuẩn production với spacing, tokens và responsive chính xác. Dùng khi được cấp link Figma, ảnh chụp màn hình hoặc file thiết kế để lập trình.
---

# Figma to Code

## Tổng quan

Quy trình có cấu trúc từ tài nguyên thiết kế đến HTML/CSS pixel-perfect. Không bao giờ bắt đầu code trước khi trích xuất toàn bộ design tokens. Không bao giờ ước lượng giá trị — hãy đo đạc từ Figma Inspect.

## Khi nào dùng

- Được cung cấp một URL / link Figma để triển khai
- Được cung cấp ảnh chụp màn hình / thiết kế đã xuất để code
- Bắt đầu một trang hoặc một section mới hoàn toàn

## Khi nào KHÔNG dùng

- Sửa đổi code hiện có mà không có bản thiết kế đối chiếu
- Debug CSS hiện có

## Quy trình

### Bước 1: TRÍCH XUẤT — Design Tokens từ Figma

```
Mở panel Figma Inspect (sidebar bên phải) cho mỗi phần tử.

COLORS (Màu sắc): Chọn phần tử → Inspect → Fill/Stroke → copy mã hex chính xác
FONTS (Phông chữ): Chọn văn bản → Inspect → font-family, size, weight, line-height, letter-spacing
SPACING (Khoảng cách): Chọn container → Inspect → các giá trị padding, gap
RADIUS (Bo góc): Chọn card/button → Inspect → corner radius
SHADOWS (Đổ bóng): Chọn phần tử → Inspect → Effect → copy các giá trị chính xác
```

**Token Map — viết trước khi code bất cứ thứ gì:**

### Bước 2: CẤU TRÚC — HTML Semantic Skeleton

### Bước 3: CSS — Token-First

### Bước 4: RESPONSIVE

### Bước 5: KIỂM TRA

```
□ Mở ở 375px — bố cục mobile chính xác
□ Mở ở 1280px — bố cục desktop chính xác
□ Màu sắc khớp với Figma (dùng công cụ color picker trong DevTools)
□ Typography khớp (tab Computed so với Figma Inspect)
□ Khoảng cách khớp (Box Model overlay)
□ Các trạng thái hover đã được triển khai
□ Không có lỗi console
```

## Tích hợp Figma MCP

```
1. get_figma_data(fileKey)        → toàn bộ dữ liệu thiết kế
2. download_figma_images(nodes)   → xuất hình ảnh/icon
3. Trích xuất tokens từ dữ liệu   → viết các biến :root
4. Triển khai HTML/CSS            → pixel-perfect
```

---

## 🤖 Agent OS Anti-Rationalization

> [!CAUTION]
> **Tác tử AI ĐỌC KỸ TRƯỚC KHI CODE:**
>
> 1. **Cấm lười biếng:** Không được lạm dụng !important để chữa cháy giao diện. BẮT BUỘC phải tuân thủ tầng Cascade (Cascade Layers - @layer).
> 2. **Cấm ngụy biện:** "Hardcode mã màu cho nhanh" là sai lầm chết người. Mọi màu sắc, khoảng cách (spacing), font-size đều PHẢI sử dụng CSS Variables (Design Tokens) như ar(--clr-bg), ar(--space-2).
> 3. **Bảo vệ Hệ thống:** Cấm nhồi nhét style trực tiếp vào thẻ HTML (Inline styles). Mọi tên class phải tuân thủ nguyên tắc BEM với tiền tố tiêu chuẩn (c-, l-, u-).
