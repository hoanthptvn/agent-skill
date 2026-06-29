---
name: workflow-reverse-interrogation
description: Kỹ năng điều tra và phỏng vấn ráo riết người dùng để thiết lập Ngữ cảnh Tiền tải (Context Front-loading) trước khi bắt đầu dự án hoặc tác vụ.
---

# Kỹ năng Truy vấn Đảo ngược (Reverse Interrogation / Crey)

## Khi nào nên dùng (When to use)

- Khi Người dùng gõ lệnh `/crey`, `/grillmey` hoặc yêu cầu "hãy phỏng vấn tôi về dự án này".
- Khi nhận một dự án hoàn toàn mới và thông tin đầu vào (Prompt ban đầu) quá mập mờ hoặc ngắn gọn.

## Quy trình bắt buộc (Process)

1. **Khởi tạo Bộ nhớ Checkpointing:**
   - Tự động tạo một thư mục tên là `brainstorm/` tại gốc dự án (hoặc kiểm tra nếu nó đã tồn tại).
   - Trong thư mục `brainstorm/`, đảm bảo có sẵn 3 file Markdown: `01-core-decisions.md`, `02-qa-log.md`, và `03-open-flags.md`.
2. **Truy vấn ráo riết (Relentless Interrogation):**
   - Đặt câu hỏi cho người dùng. CHỈ ĐƯỢC HỎI TỪNG BƯỚC MỘT (Step-by-step), không bao giờ tuôn ra 10 câu hỏi cùng lúc.
   - Tập trung vào các mâu thuẫn logic, các ràng buộc kỹ thuật (constraints), và các luồng ngoại lệ (edge cases).
3. **Cập nhật File Checkpoint liên tục:**
   - Mỗi khi người dùng trả lời, cập nhật ngay lập tức vào `02-qa-log.md`.
   - Nếu có một quyết định về cấu trúc hoặc thuật toán được thống nhất, cập nhật vào `01-core-decisions.md`.
4. **Xử lý Điểm mù bằng Open Flags:**
   - Nếu người dùng báo "Tôi không biết" hoặc "Chưa có thông tin", KHÔNG ÉP BUỘC. Đánh dấu nó vào tệp `03-open-flags.md` để họ có thể hỏi người khác sau.
5. **Đóng băng Kế hoạch:**
   - Khi không còn câu hỏi nào, tóm tắt lại và hỏi người dùng có muốn đóng băng luồng Crey để chuyển sang `/build` hay không.

## Bảng Chống Ngụy Biện (Anti-rationalization Table)

| Cớ của AI (AI's Excuse)                                                                                     | Phản biện bắt buộc của Hệ thống (System's Rebuttal)                                                                                                           |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Yêu cầu của người dùng khá rõ rồi, tôi sẽ viết code ngay để tiết kiệm thời gian."                          | **KHÔNG ĐƯỢC PHÉP.** Yêu cầu ngắn gọn là biểu hiện của "Sự tóm tắt quá mức" (Over-summarization). Phải kích hoạt phỏng vấn ít nhất 3 vòng để bóc tách vấn đề. |
| "Người dùng bận, tôi sẽ đặt luôn 5 câu hỏi một lúc để họ trả lời cho lẹ."                                   | **DỪNG LẠI.** Đặt nhiều câu hỏi cùng lúc gây quá tải nhận thức (Cognitive Overload). Chỉ được đặt TỐI ĐA 2 câu hỏi mỗi lượt phản hồi.                         |
| "Người dùng không biết câu trả lời về logic này, tôi sẽ tự giả định (hallucinate) một quy tắc để làm tiếp." | **SAI LẦM NGHIÊM TRỌNG.** Phải ghi nhận sự thiếu sót đó vào `03-open-flags.md` và tiếp tục hỏi về vấn đề khác. Không được tự bịa ra logic nghiệp vụ.          |

## Tiêu chí Thoát (Hard Exit Criteria)

Tác vụ Kỹ năng này chỉ được đánh dấu là HOÀN THÀNH khi và chỉ khi:

- Đã tồn tại thư mục `brainstorm/` trên hệ thống File.
- Tệp `01-core-decisions.md` có chứa ít nhất 1 quyết định kiến trúc hoặc cấu trúc dữ liệu rõ ràng.
- Tệp `02-qa-log.md` ghi lại ít nhất 1 chuỗi hỏi đáp.

---

## 🤖 Agent OS Anti-Rationalization

> [!CAUTION]
> **Tác tử AI ĐỌC KỸ TRƯỚC KHI CODE:**
>
> 1. **Cấm code vội vàng:** Tuyệt đối cấm viết code ngay khi prompt ban đầu quá ngắn. BẮT BUỘC khởi tạo thư mục `brainstorm/` và bắt đầu phỏng vấn.
> 2. **Cấm hỏi dồn dập (Max 2 câu):** Cấm biện minh "hỏi luôn 10 câu cho nhanh". Tràn ngập câu hỏi gây Cognitive Overload cho user. Chỉ được hỏi tối đa 2 câu mỗi lượt.
> 3. **Cấm tự bịa logic (Hallucination):** Khi user không biết, cấm tự giả định quy tắc nghiệp vụ. BẮT BUỘC ghi vào `03-open-flags.md` để treo cờ chờ xử lý.
