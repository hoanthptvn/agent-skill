---
name: workflow-performance
description: Chỉ thị của Agent OS về đo lường hiệu năng, Core Web Vitals, và đánh giá Lighthouse. Sử dụng khi cần tối ưu hóa trang web, đo lường trước/sau khi thiết kế lại, hoặc báo cáo điểm hiệu năng cho khách hàng.
license: MIT
---

# Chỉ thị Đo lường & Tối ưu Hiệu năng

## 1. Chọn đúng công cụ (Choosing the Right Tool)
**MANDATORY:**
- **Để chẩn đoán cục bộ (Diagnostics Local):** Dùng `npx lighthouse <url> --view`. TUYỆT ĐỐI KHÔNG dùng công cụ này để chứng minh hiệu năng với khách hàng (do việc bóp xung CPU - CPU throttling khiến kết quả không chính xác).
- **Để chấm điểm chuẩn mực (Benchmarking Client Reports):** Dùng giao diện UI tại [pagespeed.web.dev](https://pagespeed.web.dev). KHÔNG ĐƯỢC dùng PageSpeed Insights API ẩn danh (vì sẽ dính lỗi `429 Too Many Requests`).

## 2. Tối ưu hóa LCP (Largest Contentful Paint)
**MANDATORY:**
- **Tải trước Font chữ (Preload Fonts):** `<link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin />` (KHÔNG ĐƯỢC dùng `fonts.googleapis.com`).
- **Tải trước Ảnh Hero (Preload Hero Image):** `<link rel="preload" as="image" href="/hero.webp" fetchpriority="high" />`
- **FORBIDDEN:** KHÔNG ĐƯỢC giấu thẻ `<body>` hoặc phần hero bằng `opacity: 0` trong lúc chờ JS tải xong. Hãy để LCP được vẽ ngay lập tức, và chỉ animate các phần tử phụ (secondary elements) xung quanh nó.

## 3. Tối ưu hóa INP (Interaction to Next Paint)
**MANDATORY:**
- **Chỉ animate Transform/Opacity:** TUYỆT ĐỐI KHÔNG animate `width`, `height`, `top`, `left`, hoặc `margin`.
- **Ngừng đập vỡ bố cục (Stop Layout Thrashing):** Gộp toàn bộ lệnh đọc DOM (Batch DOM reads), sau đó mới Gộp toàn bộ lệnh ghi DOM. Không bao giờ trộn lẫn chúng.
- **Lập chốt chặn cho Vòng lặp nặng (Gate Heavy Loops):** Tạm dừng các bộ đếm giờ (tickers) của WebGL/GSAP khi chúng nằm ngoài màn hình bằng `IntersectionObserver`.

## 4. Tối ưu hóa CLS (Cumulative Layout Shift)
**MANDATORY:**
- Giữ sẵn không gian cho các phương tiện (media) bằng cách dùng `min-height` hoặc các kích thước (dimensions) rõ ràng.
- **FORBIDDEN:** KHÔNG ĐƯỢC set `will-change: transform` vĩnh viễn. Hãy thêm nó ngay trước lúc cần (JIT - Just in time) và xóa nó đi khi animation hoàn tất.

## 5. Tiêu chí Dừng Bắt buộc (Hard Exit Criteria)
**FORBIDDEN:** Không bao giờ trình bày một bản báo cáo hiệu năng trừ khi:
- Điểm chuẩn (Benchmarks) được lấy từ `pagespeed.web.dev`.
- Phần tử hero của LCP KHÔNG bị giấu đi bởi độ mờ (`opacity-gated`) từ JS.
- Các font chữ phải là file `.woff2` tự lưu trữ (self-hosted) và được tải trước (preloaded).
- Hệ thống phân cấp Tiêu đề (Heading hierarchy) phải tuân thủ chuẩn ngữ nghĩa (semantic) khắt khe mà không bị nhảy cóc cấp độ (ví dụ H1 -> H3).
