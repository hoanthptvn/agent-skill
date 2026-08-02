---
name: workflow-context-map
description: Kỹ năng tạo "bộ nhớ dài hạn" cho codebase. Tự động sinh CODEMAP.md (bản đồ file) và PATTERNS.md (công thức đã kiểm chứng) để AI session sau không cần explore lại codebase từ đầu. Kích hoạt bằng lệnh @map.
---

# Quy trình Lập bản đồ Ngữ cảnh (`@map`)

## 1. Điều kiện Kích hoạt (Trigger Conditions)
**MANDATORY:** Thực thi `@map` ngay sau `@crey` (trước `@spec`), hoặc khi bắt đầu phiên làm việc mới trên một mã nguồn (codebase) có sẵn, hoặc sau khi có thay đổi lớn về mặt cấu trúc dự án.

## 2. Bước 1: Quét hệ thống (SCAN - Verify Reality)
**FORBIDDEN:** KHÔNG ĐƯỢC "ảo giác" (hallucinate) ra cấu trúc mã nguồn. Bạn BẮT BUỘC phải đọc trực tiếp hệ thống file thực tế.
*(Sử dụng các công cụ duyệt file tích hợp thay vì đoán mò cấu trúc).*

## 3. Bước 2: Tạo CODEMAP.md (Generate CODEMAP.md)
**MANDATORY:** Tạo file `CODEMAP.md` tại thư mục gốc dự án. File này phải **dưới 18,000 ký tự**.
Định dạng:
- Mỗi dòng: `path/to/file.js — [động từ + mô tả ngắn gọn]`
- **FORBIDDEN:** Không bao giờ đưa một file vào bản đồ mà chưa đọc ít nhất 10 dòng đầu tiên của file đó để xác nhận mục đích của nó.
- Phân nhóm theo: Điểm đầu vào (Entry Points), Modules Animation, Components, Tiện ích Cốt lõi (Đánh dấu là NOT TOUCHED), Styles, Config.

## 4. Bước 3: Tạo PATTERNS.md (Generate PATTERNS.md)
**MANDATORY:** Tạo file `PATTERNS.md`. Mỗi design pattern BẮT BUỘC phải ghi rõ `Đã kiểm chứng tại: [file1, file2]`.
**FORBIDDEN:** TUYỆT ĐỐI KHÔNG tự bịa ra (hallucinate) một pattern dựa trên kiến thức chung của bạn. Nếu pattern đó không tồn tại ở ít nhất 2 file trong mã nguồn, thì nó không phải là một pattern của dự án này.

## 5. Bước 4: Tạo PROJECT_RULES.md (Generate PROJECT_RULES.md)
**MANDATORY:** Định nghĩa các ràng buộc cứng:
- Stack Công nghệ (ví dụ: Vanilla JS, Phiên bản GSAP).
- Luật V8 Engine (Không cấp phát bộ nhớ trong rAF - Zero-allocation).
- Hợp đồng DOM (`data-*` attributes để quản lý trạng thái).

## 6. Tiêu chí Dừng bắt buộc (Hard Exit Criteria)
**FORBIDDEN:** KHÔNG ĐƯỢC thoát khỏi `@map` cho đến khi:
1. `CODEMAP.md` đã được tạo và < 18,000 ký tự.
2. Mọi file ghi trong CODEMAP đều đã được xác minh là có thật.
3. `PATTERNS.md` đã được tạo và tất cả các pattern đều có nguồn `Đã kiểm chứng tại`.
4. `PROJECT_RULES.md` đã được tạo.
