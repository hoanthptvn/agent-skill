---
name: workflow-seo
description: Chỉ thị của Agent OS về SEO, dữ liệu có cấu trúc (JSON-LD), và tối ưu các chỉ số Core Web Vitals (sử dụng hình ảnh có chỉ đạo nghệ thuật - art-directed imagery). Sử dụng cho ngành khách sạn, nhà hàng, thương mại điện tử, và các trang đích có tỷ lệ chuyển đổi cao.
license: MIT
---

# Chỉ thị Kỹ thuật SEO & Kết quả nhiều dạng (Rich Results)

## 1. Dữ liệu có cấu trúc (Structured Data - JSON-LD)
**MANDATORY:** Bạn BẮT BUỘC phải chèn (inject) JSON-LD schema (ví dụ: `Restaurant`, `Hotel`) vào thẻ `<head>` hoặc thông qua Next.js Metadata để đạt được Google Rich Results.
- **FORBIDDEN:** TUYỆT ĐỐI KHÔNG BIỆN HỘ: "Tôi không cần JSON-LD, Google sẽ tự quét text." Thực tế: Google sẽ KHÔNG trao Rich Results (giờ mở cửa, giá cả) nếu không có Schema.org JSON-LD chặt chẽ.

## 2. Hình ảnh thế hệ mới có Chỉ đạo Nghệ thuật (Art-Directed Next-Gen Imagery)
**MANDATORY:** Bắt buộc phục vụ các tập hợp hình ảnh đáp ứng (responsive image sets). Một chiếc điện thoại di động TUYỆT ĐỐI KHÔNG BAO GIỜ phải tải xuống bức ảnh hero kích thước khổng lồ của màn hình desktop.
- Sử dụng thẻ `<picture>` đi kèm `<source media="...">` cho tính năng cắt cúp theo ý đồ nghệ thuật (art-directed cropping).
- Phục vụ hình ảnh ở định dạng `AVIF` hoặc `WebP`.
- Trong Next.js, CHỈ DÙNG `<Image priority>` cho các ứng viên sẽ hiển thị LCP (Largest Contentful Paint).
- **FORBIDDEN:** Không bao giờ được phép chỉ phụ thuộc vào `background-size: cover` hay những thẻ `<img>` đơn giản cho ảnh hero trên các trang web nặng về mặt hình ảnh (visually heavy sites).

## 3. Tích hợp Bên thứ ba (Booking Widgets)
**MANDATORY:** Các widget đặt chỗ (OpenTable, Resy) BẮT BUỘC phải được load bên trong một modal/dialog theo yêu cầu (ví dụ: chỉ load khi người dùng bấm "Đặt bàn").
- **FORBIDDEN:** KHÔNG BAO GIỜ được nhúng trực tiếp các iframes đặt chỗ của bên thứ 3 vào luồng load trang (page flow) ban đầu. Nó sẽ kéo sập điểm số LCP/INP của web.

## 4. Tiêu chí Dừng bắt buộc (Hard Exit Criteria)
**FORBIDDEN:** Không được phép đánh dấu các tác vụ SEO là ĐÃ XONG (DONE) cho đến khi:
- JSON-LD đã được định dạng và chèn chính xác.
- Hình ảnh hero sử dụng thẻ `<picture>` hoặc `srcset` để phân phối đúng kích cỡ cho thiết bị di động.
- Các widget nặng của bên thứ ba đã được hoãn tải (deferred) hoặc đặt vào bên trong các modals.
