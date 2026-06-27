---
name: git-commit
description: Kỹ năng tạo commit message tự động bằng cách phân tích git diff đã staged.
---

# Kỹ năng: Tự động Tạo Commit Message

Khi người dùng yêu cầu tạo commit message (VD: `/commit`, "tạo commit cho tôi"), Tác tử AI phải tuân thủ nghiêm ngặt quy trình 6 bước sau:

## 1. Tự động thu thập ngữ cảnh:
- Chạy `git status` — xem trạng thái repository để biết file nào đã staged.
- Chạy `git diff --staged` — xem toàn bộ chi tiết mã nguồn đã thay đổi.

## 2. Phân tích & Suy luận:
Phân tích các thay đổi và tạo commit message. 
**BẮT BUỘC:** Dùng thì hiện tại và giải thích rõ **"TẠI SAO"** (Why) có thay đổi này, không chỉ mô tả bề mặt **"CÁI GÌ"** (What) đã thay đổi.

## 3. Quy chuẩn Emoji & Tiền tố:
Dùng một trong các loại commit với emoji chuẩn sau đây:
- ✨ `feat:` — Tính năng mới
- 🐛 `fix:` — Sửa lỗi
- 🔨 `refactor:` — Tái cấu trúc code
- 📝 `docs:` — Tài liệu
- 🎨 `style:` — Giao diện/định dạng
- ✅ `test:` — Kiểm thử
- ⚡ `perf:` — Hiệu suất

## 4. Định dạng Commit Message:
```text
<emoji> <loại>: <mô_tả_ngắn_gọn_bằng_chữ_thường>

<nội_dung_giải_thích_tại_sao_(tùy_chọn_nhưng_rất_khuyến_khích)>
```

## 5. Trình bày Kết quả:
- Hiện tóm tắt ngắn gọn các thay đổi đã staged.
- Trình bày đề xuất commit message trong một khối mã (code block).
- **Hỏi xác nhận từ người dùng** trước khi thực sự commit.

## 6. Tiêu chí Thoát (Hard Exit):
> [!CAUTION]
> **KHÔNG tự động chạy lệnh commit** khi chưa có sự đồng ý rõ ràng (VD: "ok", "commit đi"). Chỉ gọi lệnh `git commit` sau khi người dùng đã phê duyệt đề xuất.
