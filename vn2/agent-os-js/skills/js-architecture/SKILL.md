---
name: js-architecture
description: Kỹ năng điều hướng các tiêu chuẩn kiến trúc cốt lõi, bảo mật và phong cách code của dự án.
---

# Chỉ thị Kiến trúc JS & Review Code (Router)

## 1. Bảng Định tuyến (Routing Table)
**MANDATORY:** Bạn BẮT BUỘC phải đọc (`view_file`) các kỹ năng con này khi giải quyết các nhu cầu kiến trúc cụ thể:
- `code-style.md`: Quy ước đặt tên, cấu trúc CSS/JS.
- `ai-security.md`: Chống Prompt Injection, DOM XSS, cách dùng DOMPurify.
- `llmops-pipeline.md`: Gọi LLM API, Đối tượng Prompt (Prompt Objects), Xác thực dữ liệu.

## 2. Yêu cầu Review Code (`@review`)
**MANDATORY RULES:**
1. Từ chối review nếu mã nguồn không được bọc trong thẻ `<source_code>`.
2. Đối chiếu với các file định tuyến ở trên TRƯỚC KHI đưa ra kết luận.
3. **Định dạng Đầu ra Bắt buộc (Hard Output Format):** Kết quả của lệnh `@review` BẮT BUỘC phải trả về định dạng JSON thuần túy. Tuyệt đối không chèn văn bản giao tiếp.
```json
{
  "review_status": "PASS|FAIL",
  "violations": [
    {
      "rule": "Double GC in rAF",
      "line_or_snippet": "arr.filter().map()",
      "severity": "CRITICAL",
      "fix_suggestion": "Use for(let i) instead"
    }
  ],
  "approved_for_build": false
}
```
**FORBIDDEN:** Nếu `review_status` là `FAIL`, DỪNG LẠI NGAY LẬP TỨC. TUYỆT ĐỐI KHÔNG chuyển sang lệnh `@build` cho đến khi người dùng sửa xong các lỗi vi phạm (violations).

## 3. Cấm "Phát minh lại bánh xe" (Headless UI)
**FORBIDDEN:** Khi được yêu cầu tạo các UI Component có Logic cực kỳ phức tạp (Ví dụ: Date Picker, Lịch sự kiện, Select đa cấp, Text Editor), TUYỆT ĐỐI KHÔNG ĐƯỢC tự viết thuật toán JS thuần từ đầu (sẽ gây lỗi Year/Timezone/A11y).
**MANDATORY:** Bắt buộc phải sử dụng hoặc đề xuất các thư viện Headless chuẩn công nghiệp (Ví dụ: `date-fns`, `react-day-picker`, `Melt UI`, `Radix UI`) để xử lý Logic, sau đó tự custom CSS/Animation theo ý muốn.
