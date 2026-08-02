---
name: workflow-evals
description: Khung đánh giá hiệu năng AI Agent (Evaluation Framework) gồm 2 chế độ kiểm tra (Regression và File Mode), metrics xác định và phi xác định (LLM-as-Judge). Kích hoạt bằng lệnh @evals hoặc sau @review để đo lường khách quan chất lượng code.
---

# Khung Đánh giá AI Agent (`@evals`)

## 1. Bài kiểm tra Hồi quy (Regression Tests - Bắt buộc quét Code)
**MANDATORY:** Quét mã nguồn của bạn dựa trên các quy tắc sống còn sau đây trước khi đánh dấu một tính năng là ĐÃ XONG (DONE):
- **R1 (GC trong rAF):** TUYỆT ĐỐI KHÔNG dùng `.filter()`, `.map()`, `.reduce()` bên trong `requestAnimationFrame`.
- **R2 (Thuộc tính Layout):** CHỈ CHOP PHÉP animate `x, y, scale, opacity, rotation`. TUYỆT ĐỐI KHÔNG animate `top, left, width, height`.
- **R3 (QuickTo):** BẮT BUỘC dùng `gsap.quickTo()` cho các animation chạy liên tục theo `mousemove`/`scroll`.
- **R4 (Toán tử Sắp xếp):** Lệnh `.sort()` BẮT BUỘC phải có toán tử so sánh (comparator) `(a, b) => a - b`.
- **R5 (Hợp đồng DOM):** Trạng thái UI BẮT BUỘC phải lưu trong thuộc tính `data-*` phục vụ cho test tự động (E2E testing), không chỉ lưu bằng class CSS.
- **R6 (Chống chớp Trắng màn hình):** Các hiệu ứng chuyển trang (Route transitions) KHÔNG ĐƯỢC phép dùng `display: none` (gây chớp). Hãy dùng `autoAlpha`.
- **R7 (Timeline Định hướng):** Các animation cuộn trang BẮT BUỘC phải được gom thành một `gsap.timeline({ scrollTrigger })`. TUYỆT ĐỐI KHÔNG dùng nhiều event listeners scroll rời rạc, độc lập.

## 2. LLM làm Giám khảo (LLM-as-Judge - Chấm điểm định tính)
**MANDATORY:** Khi đánh giá chất lượng code hoặc khả năng đoạt giải Awwwards, hãy dựa trên các tiêu chí sau:
1. **Dễ đọc (Readability):** Tên biến tự giải thích được ý nghĩa. Ghi chú (Comments) giải thích *TẠI SAO*, không giải thích *LÀM GÌ*. Không viết code đánh đố quá thông minh (overly clever code).
2. **Tuân thủ V8 (V8 Compliance):** Không vi phạm bất kỳ quy tắc nào từ R1 đến R7 ở trên.
3. **Tính Khả dụng Awwwards (Trọng số 30%):** Tốc độ tải LCP/TTFB NHANH. Đã xử lý dự phòng (fallbacks) cho `prefers-reduced-motion`. Điều hướng bằng bàn phím (Keyboard navigation) hoạt động tốt.
4. **Tính Sáng tạo Awwwards (Trọng số 20%):** Concept chuyển động có định hướng (được biên đạo thống nhất), KHÔNG PHẢI "bát súp tween" (những hiệu ứng mờ dần - fades rời rạc, ngẫu nhiên).
5. **Tính Toàn vẹn DOM (DOM Integrity):** Trạng thái của ứng dụng (App state) có thể được đọc hoàn toàn thông qua các thuộc tính `data-*` mà không cần truy cập vào trạng thái ngầm của React/JS.

## 3. Tiêu chí Dừng bắt buộc (Hard Exit Criteria)
**FORBIDDEN:** Một tính năng CHỈ được coi là "Sẵn sàng lên Production" nếu:
1. Vượt qua toàn bộ bộ luật R1-R7 (Tuyệt đối không có ngoại lệ cho R1, R2, R6).
2. Đạt chuẩn Tính Khả dụng Awwwards (Không có bộ tải WebGL dài 6 giây chặn người dùng đọc nội dung).
3. Đã chạy Evals và xác nhận PASS rõ ràng. *Tuyệt đối không giả định code là hoàn hảo chỉ vì nó không báo lỗi văng app (crash).*
