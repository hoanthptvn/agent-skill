---
name: workflow-build
description: Kỹ năng xây dựng code theo quy trình Incremental Implementation + Test-Driven Development (TDD). Áp dụng V8 Engine Rules và rAF Contract. Kích hoạt bằng lệnh @build.
---

# Quy trình Lập trình Xây dựng Code (`@build`)

## 1. Kiểm tra Khởi tạo Dự án (Project Initialization Check)
**MANDATORY:** Trước khi viết code, phải kiểm tra các thư viện phụ thuộc (dependencies).
- **Node.js:** Kiểm tra xem `gsap` hoặc `lenis` có cần cập nhật không.
- **Vanilla/CDN:** Kiểm tra HTML xem đã có script tags chưa. Phải đọc changelog trước để tránh lỗi do tính năng bị loại bỏ (breaking changes) nếu dùng các phiên bản cũ.

## 2. Vòng lặp Thực thi (Đỏ → Xanh → Tối ưu → Chứng minh)
**MANDATORY:** Bạn BẮT BUỘC phải thực thi vòng lặp này một cách tuần tự cho MỖI vi-tác vụ (micro-task) đã được định nghĩa trong `@plan`.

### Bước 1: RED (Xác định Lỗi / Failure)
Định nghĩa rõ ràng các trường hợp rủi ro (edge cases): *"Đoạn code này sẽ LỖI nếu [X xảy ra]."*

### Bước 2: GREEN (Viết Code Tối thiểu & Tuân thủ V8)
Viết một lượng code vừa đủ để vượt qua bài kiểm tra rủi ro ở Bước 1, đồng thời tuân thủ tuyệt đối luật của V8 Engine:
- **FORBIDDEN:** Không cấp phát bộ nhớ (Zero-allocation) trong rAF. Không dùng `new Object()`, không dùng `.map()/.filter()` bên trong `requestAnimationFrame`.
- **FORBIDDEN:** Tránh De-optimizations. Không dùng `delete obj[key]` (hãy set nó thành `undefined`), không dùng từ khóa `arguments` (hãy dùng `...args`), không dùng Regex trong vòng lặp (hãy dùng `charCodeAt`).
- **FORBIDDEN:** Không dùng `delete arr[i]` (hãy dùng thuật toán Swap-and-Pop).

### Bước 3: REFACTOR (Tối ưu & Làm sạch)
- Sử dụng early returns (return sớm) thay vì IF lồng nhau để giảm bớt độ phức tạp khi đọc code.
- **MANDATORY:** Ghi chú (Comments) phải giải thích *TẠI SAO* đoạn code lại tồn tại, tuyệt đối không giải thích *code đang làm gì*.

### Bước 4: PROOF (Tiêu chí Hoàn thành bắt buộc)
**FORBIDDEN:** KHÔNG ĐƯỢC đánh dấu một task là XONG (DONE) nếu không có bằng chứng cụ thể:
- Một dòng console log xuất ra trạng thái mong đợi.
- Một sự thay đổi trên DOM (`data-animation-status="running"`).
- Kết quả test hoặc chỉ số đo lường hiệu năng (`console.time`).
*(Việc AI nói "Code chạy không có lỗi" KHÔNG được tính là bằng chứng hợp lệ.)*

## 3. Quy tắc Chống biện hộ (Anti-Rationalization Rules)
- **FORBIDDEN:** Tuyệt đối không viết toàn bộ tính năng cùng một lúc (batching). Phải thực thi và xác minh từng task một.
- **FORBIDDEN:** Nếu một task vi phạm quy tắc bộ nhớ V8 (ví dụ: tạo object trong vòng lặp render), nó lập tức bị đánh trượt và BẮT BUỘC phải viết lại từ đầu.
