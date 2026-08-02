---
name: workflow-dom-testing
description: Sử dụng khi cần viết hoặc sửa mã JavaScript tương tác với DOM (Vanilla JS). Kỹ năng này buộc hệ thống phải tuân thủ "DOM Contract" để máy tự động có thể đọc được trạng thái. Kích hoạt bằng lệnh @test.
---

# Quy trình Kiểm thử Nội tại Agent (`@test`)

## 1. Hợp đồng DOM (The DOM Contract)
**MANDATORY:** Bạn BẮT BUỘC phải ánh xạ toàn bộ các trạng thái UI quan trọng vào các thuộc tính `data-*` trên thẻ HTML (ví dụ: `data-card-state="active"`, `data-animation-status="running"`).
**FORBIDDEN:** TUYỆT ĐỐI KHÔNG sử dụng CSS class names (như `.active`, `.bg-blue`) để lưu trữ hoặc kiểm tra logic trạng thái. Class CSS chỉ dùng để trang trí (styling) và cực kỳ thiếu tin cậy để dùng cho việc test.

## 2. Phơi bày Trạng thái Ẩn (Exposing Hidden State)
**MANDATORY:** Trong quá trình chạy animation (GSAP, rAF), bạn BẮT BUỘC phải cập nhật `data-animation-status="running|finished"` để các Agent khác và các trình duyệt không giao diện (headless browsers như Playwright) có thể "nhìn thấy" trạng thái bên trong. Không cho phép các animation hoạt động kiểu hộp đen (blackbox).

## 3. Vòng lặp Tự phục hồi (Self-Healing Loop)
**MANDATORY:** Viết các tập lệnh test (hoặc dùng Playwright) để mô phỏng tương tác người dùng và kiểm chứng các thay đổi trạng thái DUY NHẤT dựa trên các thuộc tính `data-*`.

## 4. Quy tắc Chống biện hộ (Anti-Rationalization Rules)
- **FORBIDDEN:** "Tôi sẽ kiểm tra bằng `classList.contains('active')`." **DỪNG LẠI.** Bạn phải dùng `getAttribute('data-state') === 'active'`.
- **FORBIDDEN:** "Người dùng vừa đưa tôi một bức ảnh, tôi sẽ đoán cấu trúc HTML." **DỪNG LẠI.** Bạn phải hỏi người dùng về HTML Specs hoặc tự viết một khung xương (skeleton) HTML để xác minh DOM trước khi thêm CSS/JS.
- **FORBIDDEN:** TUYỆT ĐỐI KHÔNG truy vấn các phần tử DOM (query elements) hoặc add classes mà chưa xác minh phần tử đó thực sự tồn tại trong bộ khung HTML.

## 5. Tiêu chí Dừng bắt buộc (Hard Exit Criteria)
**FORBIDDEN:** Không được thoát khỏi lệnh `@test` cho đến khi:
- Toàn bộ logic trạng thái đã được ánh xạ vào thuộc tính `data-*`.
- Bạn đã cung cấp một bản Terminal Log hoặc Playwright Video chứng minh quá trình chuyển đổi trạng thái hoạt động hoàn toàn độc lập với CSS class.
