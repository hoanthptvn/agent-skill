---
name: workflow-reverse-interrogation
description: Kỹ năng điều tra và phỏng vấn ráo riết người dùng để thiết lập Ngữ cảnh Tiền tải (Context Front-loading) trước khi bắt đầu dự án hoặc tác vụ.
---

# Quy trình Phỏng vấn Đảo ngược (`@crey`)

## 1. Khi nào nên dùng (When to Use)
**MANDATORY:** Kích hoạt khi người dùng sử dụng lệnh `@crey` (hoặc `@grillmey`), hoặc khi một yêu cầu (prompt) dự án/tác vụ mới quá mơ hồ hoặc bị tóm tắt quá mức. TUYỆT ĐỐI KHÔNG bắt đầu viết code dựa trên các yêu cầu mơ hồ.

## 2. Khởi tạo Điểm lưu trữ (Checkpoint Initialization)
**MANDATORY:** Tạo một thư mục `brainstorm/` tại gốc dự án (project root) với 3 file sau:
1. `01-core-decisions.md` (Quyết định cốt lõi)
2. `02-qa-log.md` (Nhật ký Hỏi - Đáp)
3. `03-open-flags.md` (Các vấn đề còn bỏ ngỏ)

## 3. Quy tắc Phỏng vấn ráo riết (Relentless Interrogation Rules)
- **FORBIDDEN:** KHÔNG ĐƯỢC hỏi quá 2 câu hỏi trong một lượt chat (turn). Việc dồn ép người dùng bằng 10 câu hỏi cùng lúc sẽ gây quá tải nhận thức (cognitive overload).
- **MANDATORY:** Tập trung các câu hỏi vào các trường hợp ngoại lệ (edge cases), các mâu thuẫn logic, và các giới hạn kỹ thuật (technical constraints).
- **FORBIDDEN:** KHÔNG ĐƯỢC ảo giác (hallucinate) ra logic nghiệp vụ. Nếu người dùng không biết câu trả lời, hãy ghi chú nó vào `03-open-flags.md` và tiếp tục công việc khác.

## 4. Lưu trữ Liên tục (Continuous Checkpointing)
**MANDATORY:** 
- Ngay lập tức gắn thêm (append) mọi cặp Hỏi & Đáp vào file `02-qa-log.md`.
- Di chuyển các quyết định về thuật toán hoặc kiến trúc đã được chốt (agreed-upon) vào file `01-core-decisions.md`.

## 5. Tiêu chí Dừng bắt buộc (Hard Exit Criteria)
**FORBIDDEN:** KHÔNG ĐƯỢC thoát khỏi `@crey` (hoặc chuyển sang `@plan` / `@build`) cho đến khi:
- Thư mục `brainstorm/` và 3 file bên trong nó đã tồn tại.
- `01-core-decisions.md` chứa ít nhất một quyết định rõ ràng về kiến trúc/cấu trúc dữ liệu.
- `02-qa-log.md` chứa ít nhất một chuỗi Hỏi & Đáp đã được lưu.
