---
name: workflow-reverse-interrogation
description: Kỹ năng điều tra và phỏng vấn ráo riết người dùng để thiết lập Ngữ cảnh Tiền tải (Context Front-loading) về UI/UX và Design System trước khi code CSS.
---

# Kỹ năng Truy vấn Đảo ngược (Reverse Interrogation / Crey)

## Khi nào nên dùng (When to use)

- Khi Người dùng gõ lệnh `/crey`, `/grillmey` trong dự án UI.
- Khi người dùng đưa một bức ảnh thiết kế (Figma/Image) và bảo "hãy code CSS cho trang này" mà không nói thêm lời nào.

## Quy trình bắt buộc (Process)

1. **Khởi tạo Bộ nhớ Checkpointing:**
   - Tự động tạo một thư mục tên là `brainstorm/` tại gốc dự án.
   - Tạo 3 file Markdown: `01-core-decisions.md` (Design tokens, Spacing scale), `02-qa-log.md`, và `03-open-flags.md`.
2. **Truy vấn ráo riết (UI/UX Focus):**
   - Đặt câu hỏi về: Bảng màu (Color palette), Font chữ (Typography), Trạng thái tương tác (Hover, Focus, Active, Disabled).
   - Truy vấn về Responsive: Mobile-first hay Desktop-first? Điểm ngắt (Breakpoints) ở đâu?
   > [!IMPORTANT]
   > CHỈ ĐƯỢC HỎI TỐI ĐA 2 CÂU MỖI LẦN để tránh làm quá tải người dùng.
3. **Cập nhật File Checkpoint liên tục:**
   - Cập nhật quyết định về Breakpoints và Tokens vào `01-core-decisions.md`.
4. **Xử lý Điểm mù bằng Open Flags:**
   - Nếu người dùng chưa có thiết kế cho Mobile, ghi nhận vào `03-open-flags.md` để họ tham vấn Designer sau. Không tự bịa ra giao diện.
5. **Đóng băng Kế hoạch:**
   - Kết thúc phỏng vấn và gợi ý dùng lệnh `/spec` để viết tài liệu Hợp đồng DOM (HTML Skeleton).

## Bảng Chống Ngụy Biện (Anti-rationalization Table)

| Cớ của AI (AI's Excuse)                                                             | Phản biện bắt buộc của Hệ thống (System's Rebuttal)                                                                                                                     |
| ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Chỉ là một cái nút bấm thôi, tôi sẽ dùng luôn màu #333 và padding 10px cho lẹ."    | **KHÔNG ĐƯỢC PHÉP.** Trong CSS, không có gì "chỉ là một cái nút". Phải hỏi xem nút đó thuộc Component nào, Design Token cho màu và khoảng cách là gì.                   |
| "Người dùng đưa Figma rồi, tôi sẽ chuyển đổi 1-1 sang CSS tuyệt đối bằng Fixed px." | **DỪNG LẠI.** Code tĩnh bằng pixel (px) sẽ giết chết Responsive. Phải phỏng vấn xem có thể dùng `rem`, `clamp()` hoặc Flex/Grid để layout tự thích ứng không.           |
| "Giao diện không có trạng thái Hover, tôi sẽ để trống."                             | **SAI LẦM.** Designer thường quên vẽ trạng thái Hover/Focus. Kỹ sư phải chủ động hỏi "Trạng thái Hover của thẻ này xử lý thế nào?". Nếu không biết, ghi vào Open Flags. |

## Tiêu chí Thoát (Hard Exit Criteria)

Tác vụ Kỹ năng này chỉ được đánh dấu là HOÀN THÀNH khi và chỉ khi:

- Đã tồn tại thư mục `brainstorm/`.
- Tệp `01-core-decisions.md` có chốt ít nhất 1 quy định về Design Token (Biến màu hoặc Spacing).
- Tệp `02-qa-log.md` ghi lại ít nhất 1 chuỗi hỏi đáp.

---

## 🤖 Agent OS Anti-Rationalization

> [!CAUTION]
> **Tác tử AI ĐỌC KỸ TRƯỚC KHI CODE:**
>
> 1. **Cấm lười biếng:** Không được lạm dụng `!important` để chữa cháy giao diện. BẮT BUỘC phải tuân thủ tầng Cascade (Cascade Layers - `@layer`).
> 2. **Cấm ngụy biện:** "Hardcode mã màu cho nhanh" là sai lầm chết người. Mọi màu sắc, khoảng cách (spacing), font-size đều PHẢI sử dụng CSS Variables (Design Tokens) như `var(--clr-bg)`, `var(--space-2)`.
> 3. **Bảo vệ Hệ thống:** Cấm nhồi nhét style trực tiếp vào thẻ HTML (Inline styles). Mọi tên class phải tuân thủ nguyên tắc BEM với tiền tố tiêu chuẩn (`c-`, `l-`, `u-`).
