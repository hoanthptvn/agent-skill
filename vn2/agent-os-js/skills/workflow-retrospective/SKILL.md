---
name: workflow-retrospective
description: Kỹ năng Hồi tưởng (Retrospective Agent) — phân tích log thất bại sau mỗi lần chạy code (run/sprint), tìm ra quy luật lỗi lặp lại, và ghi lại cảnh báo ngắn gọn vào các file bộ nhớ chuyên biệt (memory/*.md). Kích hoạt bằng lệnh @retro. Đây là cơ chế "tự học" duy nhất giúp hệ thống tránh lặp lại lỗi cũ mà không cần sự can thiệp thủ công của con người.
---

# Quy trình Rút kinh nghiệm Hồi tưởng (`@retro`)

## 1. Khi nào nên dùng (When to Use)
**MANDATORY:** Chạy lệnh `@retro` sau khi `@evals` trả về kết quả TỪ CHỐI (`REJECT`), hoặc khi một lỗi lặp lại ≥ 2 lần, hoặc khi kết thúc một chu kỳ phát triển (sprint).

## 2. Bước 1: Thu thập Dữ liệu Lỗi (Collect Failure Data)
**MANDATORY:** Đọc dữ liệu lỗi theo thứ tự sau:
1. `specs/*.evals.json` (Kết quả test hồi quy)
2. `brainstorm/03-open-flags.md` (Các vấn đề chưa được giải quyết)
3. Lịch sử cuộc hội thoại hiện tại.
**FORBIDDEN:** KHÔNG ĐƯỢC chạy `@retro` nếu không có dữ liệu lỗi. Hãy hướng dẫn người dùng chạy lệnh `@evals` trước.

## 3. Bước 2: Phân loại và Ghi vào Bộ nhớ (Categorize and Write to Memory)
**MANDATORY:** Tạo mới hoặc cập nhật các file trong thư mục `memory/` dựa trên lĩnh vực của lỗi (ví dụ: `gsap.md`, `scrolltrigger.md`, `lenis.md`, `js-perf.md`, `dom-testing.md`, `general.md`).

**MANDATORY:** Mỗi cảnh báo (warning) BẮT BUỘC phải tuân theo định dạng chính xác sau:
```markdown
## [YYYY-MM-DD] — [Tên Lỗi Ngắn Gọn]
**Quy luật (Pattern):** [1 dòng mô tả quy luật code gây lỗi]
**Bẫy (Trap):** `[Đoạn code ngắn gây ra lỗi]`
**Cách sửa (Fix):** `[Đoạn code đúng]`
**Nguồn (Source):** [evals.json / conversation]
```

## 4. Các Ràng buộc Khắt khe về File Bộ nhớ (Strict Memory File Constraints)
**WARNING:** Các file bộ nhớ phải thật nhỏ gọn để ngăn ngừa phình to ngữ cảnh (Context Bloat).
- **MANDATORY:** Mỗi file bộ nhớ theo lĩnh vực (domain memory) BẮT BUỘC phải **≤ 30 dòng** (chứa tối đa khoảng 5-6 cảnh báo).
- **MANDATORY:** Mỗi cảnh báo BẮT BUỘC phải **≤ 5 dòng**.
- **MANDATORY:** Nếu một file vượt quá 30 dòng, hãy XÓA cảnh báo CŨ NHẤT (Cơ chế xoay vòng FIFO).

## 5. Quy tắc Nâng cấp (Escalation Rules)
- **FORBIDDEN:** TUYỆT ĐỐI KHÔNG ĐƯỢC đề xuất cập nhật các file `SKILL.md` cốt lõi trừ khi có chính xác một lỗi xảy ra ≥ 3 lần.
- **MANDATORY:** Nếu một lỗi xảy ra ≥ 3 lần, hãy xuất ra một đề xuất để thêm nó vào phần Chống biện hộ (Anti-Rationalization) của file `SKILL.md` liên quan. Phải đợi người dùng xác nhận trước khi sửa file `SKILL.md`.

## 6. Định dạng Đầu ra (Output Format)
**MANDATORY:** Trả ra một file `specs/retro-[date].json` chứa:
`date`, `source_files`, `total_failures_analyzed`, `patterns_found`, `memory_files_updated`, `escalations_proposed`, và một mảng `warnings`.

## 7. Tiêu chí Dừng bắt buộc (Hard Exit Criteria)
**FORBIDDEN:** TUYỆT ĐỐI KHÔNG thoát khỏi `@retro` trừ khi:
1. Đã đọc dữ liệu lỗi.
2. Ít nhất một file trong thư mục `memory/` đã được cập nhật (hoặc tạo mới).
3. Báo cáo `specs/retro-[date].json` đã được sinh ra.
4. KHÔNG CÓ file bộ nhớ nào vượt quá độ dài 30 dòng.
