---
name: workflow-spec
description: Kỹ năng viết tài liệu đặc tả kỹ thuật (Spec-Driven Development) trước khi bắt tay code. Kích hoạt bằng lệnh @spec.
---

# Quy trình Lập Đặc tả Kỹ thuật (`@spec`)

## 1. Khi nào nên dùng (When to Use)
**MANDATORY:** Kích hoạt khi người dùng gõ lệnh `@spec`, hoặc sau khi quy trình `@crey` hoàn tất, hoặc khi một task đủ phức tạp và cần một hợp đồng kỹ thuật (technical contract) rõ ràng trước khi bắt đầu code.

## 2. Quy trình (Process)
**MANDATORY:** Tạo file `specs/<feature>.spec.md` với chính xác 5 phần sau:
1. **Mục tiêu (Goal):** 1 câu mô tả ngắn gọn và tiêu chí thành công có thể đo lường được.
2. **Hợp đồng Đầu vào / Đầu ra (Input / Output Contract):** Sử dụng bảng Markdown để định nghĩa chính xác kiểu dữ liệu (types) và các ràng buộc (constraints).
3. **Thuật toán / Cấu trúc dữ liệu (Algorithm / Data Structure):** Phương pháp được chọn, độ phức tạp Big-O, và lý do đánh đổi (trade-off justification).
4. **Trường hợp Ngoại lệ (Edge Cases - Tối thiểu 3):** Bắt buộc phải bao gồm lỗi null/empty (rỗng), giá trị biên (boundary values), và 1 lỗi đặc thù của nghiệp vụ (domain-specific case).
5. **Hợp đồng DOM (DOM Contract):** Khai báo rõ ràng các thuộc tính `data-*` bắt buộc phải có (nếu tính năng có liên quan đến UI).

## 3. Quy tắc Chống biện hộ (Anti-Rationalization Rules)
- **FORBIDDEN:** "Yêu cầu này đơn giản mà, tôi cứ thế code luôn." **Thực tế:** Bản đặc tả là bắt buộc. Những task "đơn giản" thường che giấu vô số trường hợp ngoại lệ.
- **FORBIDDEN:** "Tôi sẽ viết bản đặc tả sau khi code xong." **Thực tế:** Bản đặc tả là một bản hợp đồng, không phải tài liệu tham khảo (documentation). Code mà không có bản đặc tả là hành vi không được phép.
- **FORBIDDEN:** Bỏ trống Phần 4 (Trường hợp Ngoại lệ). **Thực tế:** Bạn BẮT BUỘC phải liệt kê ít nhất 3 trường hợp ngoại lệ. Nếu không thể nghĩ ra, hãy kích hoạt `@crey` để phỏng vấn người dùng.

## 4. Tiêu chí Dừng bắt buộc (Hard Exit Criteria)
**FORBIDDEN:** TUYỆT ĐỐI KHÔNG viết bất kỳ dòng code nào hoặc thoát khỏi giai đoạn `@spec` cho đến khi:
- File đặc tả (spec file) đã tồn tại với đầy đủ 5 phần đã hoàn thành.
- Người dùng đã xác nhận rõ ràng bằng văn bản cho phép bản đặc tả (ví dụ: gõ "Tiến hành đi", "OK").
