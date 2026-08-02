---
name: workflow-plan
description: Kỹ năng lập kế hoạch vi-tác vụ (Micro-task Planning) ở cấp độ kiến trúc thuật toán — bẻ nhỏ công việc thành các bước độc lập, có thể kiểm thử và rollback. Kích hoạt bằng lệnh @plan.
license: MIT
---

# Quy trình Lập kế hoạch Vi-tác vụ (`@plan`)

## 1. Chuẩn mực ACID trong Lập Kế Hoạch (Planning)

**MANDATORY:** Bẻ nhỏ các tính năng thành các vi-tác vụ (micro-tasks) bên trong file `specs/<feature>.plan.md` sử dụng tiêu chí ACID:
- **A**tomic (Nguyên tử): 1 task = 1 hành động duy nhất, giải quyết đúng 1 vấn đề logic. Nếu một task yêu cầu vừa query DB vừa vẽ UI, task đó CHƯA đạt chuẩn nguyên tử.
- **C**onsistent/Complete (Hoàn chỉnh & Nhất quán): Có thể commit được mà không làm hỏng ứng dụng. Không bao giờ commit code ở trạng thái nửa vời (broken state).
- **I**nvertible (Đảo ngược được): Dễ dàng rollback nếu có lỗi.
- **D**emonstrable (Chứng minh được): Bắt buộc phải xác minh được tính đúng đắn (xuất ra console log, thay đổi trạng thái DOM, hoặc kết quả Test).

## 2. Ràng buộc Kiến trúc & Thuật toán trong Từng Task

Mỗi task lập ra KHÔNG CHỈ là "Sẽ làm gì" mà phải xác định "Làm bằng thuật toán nào". 

**FORBIDDEN:**
- KHÔNG dùng `switch-case` hoặc `if-else` lồng nhau (nesting > 2) trong các task xử lý logic phức tạp. 
- KHÔNG tạo rác bộ nhớ (Garbage Collection) bừa bãi trong các task animation/vòng lặp.

**MANDATORY:**
- **Dispatch Table (O(1)):** Yêu cầu chỉ định rõ việc sử dụng Bảng Điều Phối (Dispatch Table) dạng `Map` hoặc `Object` mapping thay cho các chuỗi `if/switch` dài dòng.
- **Object Pool (O(1) Allocation):** Đối với các task xử lý WebGL, Canvas, GSAP Ticker, yêu cầu ghi rõ chiến lược sử dụng Object Pool thay vì khởi tạo đối tượng mới liên tục.

## 3. Định dạng Bắt buộc của Một Task (Required Format)

```markdown
# Plan: [Tên Tính Năng]

## Danh sách Task
### TASK-01: [Tên Hành động Nguyên tử]
- **Mục tiêu:** [Giải quyết đúng 1 vấn đề]
- **Thuật toán/Mô hình:** [Ví dụ: Dispatch Table / State Machine / Object Pool / Observer Pattern]
- **File:** `src/...`
- **Proof (Bằng chứng):** [Kết quả Console/DOM mong đợi]
- **Dependency:** TASK-00 / NONE
- **Risk:** `⚠️ HIGH RISK` (nếu đang sửa đổi code cũ hoặc đụng tới V8 Hidden Classes)
```

## 4. Chỉ thị Thực thi Kỷ luật Thép

- **FORBIDDEN:** Cấm viết Code "Big-Bang". TUYỆT ĐỐI KHÔNG code toàn bộ tính năng cùng một lúc.
- **MANDATORY:** Dừng lại và xác minh chính xác kết quả "Proof" bằng mắt thường hoặc test tự động trước khi chuyển sang task tiếp theo.
- **FORBIDDEN:** Không bắt đầu một task phụ thuộc (dependent task) nếu task cha (parent task) của nó chưa vượt qua bước Proof. Hậu quả của việc này là nợ kỹ thuật (Technical Debt) chồng chất và phình to.
