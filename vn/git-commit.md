---
name: git-commit
description: Kỹ năng tạo commit message tự động bằng cách phân tích git diff đã staged, tuân thủ chuẩn Conventional Commits và 7 nguyên tắc của Tim Pope.
---

# Kỹ năng: Tự động Tạo Commit Message (Pro Standard)

Khi người dùng yêu cầu tạo commit message (VD: `/commit`), Tác tử AI phải tuân thủ nghiêm ngặt chuẩn mực của các kỹ sư hàng đầu (dựa trên **Conventional Commits** và **7 nguyên tắc của Chris Beams/Tim Pope**).

## 1. Tự động thu thập ngữ cảnh:
- Chạy `git status` — xem trạng thái repository để biết file nào đã staged.
- Chạy `git diff --staged` — xem toàn bộ chi tiết mã nguồn đã thay đổi.

## 2. Tiêu chuẩn 7 Quy tắc vàng (The 7 Rules of a Great Commit):
1. Tách biệt Tiêu đề (Subject) và Thân bài (Body) bằng **một dòng trắng**.
2. Giới hạn Tiêu đề dưới **50 ký tự** (giúp hiển thị tốt trên GitHub/GitLab).
3. Viết hoa chữ cái đầu tiên của Tiêu đề (sau phần prefix).
4. **Không** dùng dấu chấm (`.`) ở cuối Tiêu đề.
5. **Bắt buộc dùng Thể mệnh lệnh (Imperative mood)** cho Tiêu đề (VD: `Add feature` thay vì `Added feature` hay `Adds feature`. Tiếng Việt: `Thêm...` thay vì `Đã thêm...`).
6. Cắt dòng ở Thân bài tại cột thứ **72** (Wrap body at 72 characters).
7. Trong Thân bài, giải thích **TẠI SAO (Why)** và **CÁI GÌ (What)**, tuyệt đối không diễn giải LÀM THẾ NÀO (How - vì code đã tự nói lên điều đó).

## 3. Quy chuẩn Tiền tố & Emoji (Conventional Commits + Gitmoji):
Sử dụng cấu trúc: `<emoji> <type>[(optional scope)]: <Subject>`

- ✨ `feat:` — Tính năng mới (Mới hoàn toàn)
- 🐛 `fix:` — Sửa lỗi (Fix bug)
- ♻️ `refactor:` — Tái cấu trúc (Không đổi logic, không thêm tính năng)
- 📝 `docs:` — Cập nhật tài liệu (README, comments)
- 🎨 `style:` — Định dạng code (Khoảng trắng, missing semi-colons, ko đổi logic)
- ✅ `test:` — Thêm hoặc sửa test cases
- ⚡ `perf:` — Tối ưu hiệu năng (Performance)
- 🏗️ `chore:` — Cập nhật build tasks, cấu hình (package.json, v.v.)

## 4. Định dạng Commit Message:
```text
<emoji> <type>(<scope_tùy_chọn>): <Tiêu đề sử dụng thể mệnh lệnh, dưới 50 ký tự>
<DÒNG TRẮNG BẮT BUỘC>
<Thân bài giải thích chi tiết TẠI SAO lại có thay đổi này.
Dòng này tự động ngắt xuống dòng nếu vượt quá 72 ký tự.>
```

## 5. Trình bày Kết quả & Hard Exit:
- Tóm tắt phân tích bằng gạch đầu dòng (Bullets).
- Cung cấp đề xuất commit message trong một khối mã (code block).
- Cung cấp lệnh git copy nhanh: `git commit -m "..." -m "..."`

> [!CAUTION]
> **TIÊU CHÍ THOÁT:** Không tự động chạy lệnh commit khi chưa có sự đồng ý rõ ràng. Chỉ chạy `git commit` khi người dùng nói "ok" hoặc "commit đi".
