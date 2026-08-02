---
name: workflow-simplify
description: Đơn giản hóa code (Code Simplification). Sử dụng khi code hoạt động đúng nhưng quá phức tạp, khó đọc, hoặc lạm dụng kỹ thuật (over-engineered) không cần thiết.
license: MIT
---

# Chỉ thị Đơn giản hóa Code (`@simplify`)

## 1. Mục tiêu (Goal)
**MANDATORY:** Tối ưu hóa để tăng tốc độ ĐỌC HIỂU của con người, KHÔNG PHẢI để tối ưu số dòng code. Việc chia nhỏ một logic phức tạp thành các hàm có tên rõ ràng luôn ưu việt hơn là viết gộp bằng toán tử 3 ngôi lồng nhau (nested ternaries).

## 2. Quy tắc Thực thi (Execution Rules)
- **Quy tắc 1 (Bảo toàn Hành vi - Preserve Behavior):** TUYỆT ĐỐI KHÔNG thay đổi hành vi hiện tại của hệ thống (timing animation, xử lý lỗi, ranh giới API).
- **Quy tắc 2 (Tuân thủ Cấu trúc - Follow Conventions):** Tôn trọng kiến trúc đã được thiết lập. Đừng phá bỏ mô hình FSD hoặc Module pattern chỉ để giảm bớt số dòng code.
- **Quy tắc 3 (Rõ ràng > Thông minh - Clarity > Cleverness):** Viết code thật rõ ràng. Tránh "bát súp tween". Dùng các tính năng có sẵn (native) của GSAP (như `stagger: 0.1`) thay vì tự code thủ công tính toán dựa trên `index`.
- **Quy tắc 4 (Hàng rào Chesterton - Chesterton's Fence):** **FORBIDDEN:** TUYỆT ĐỐI KHÔNG xóa hoặc sửa một hàm bọc (wrapper) hoặc một khối logic trừ khi bạn có thể giải thích rõ ràng TẠI SAO nó lại được đặt ở đó ngay từ ban đầu.
- **Quy tắc 5 (Phạm vi - Scope):** **FORBIDDEN:** Không refactor tiện tay (drive-by refactoring). Chỉ đơn giản hóa đúng phần code mà bạn được giao nhiệm vụ xử lý.

## 3. Quy tắc Chống biện hộ (Anti-Rationalization Rules)
- **FORBIDDEN:** "Tôi đã gộp 5 hàm lại thành 1 hàm lớn." **Thực tế:** Bạn vừa tạo ra một hàm ôm đồm quá nhiều trách nhiệm (multi-responsibility function). Hãy tách chúng ra.
- **FORBIDDEN:** "Tôi dùng toán tử 3 ngôi lồng nhau (nested ternary) để code chỉ còn 1 dòng." **Thực tế:** Toán tử 3 ngôi lồng nhau làm cạn kiệt bộ nhớ làm việc của con người (human working memory). Hãy dùng `if/else` hoặc bảng tra cứu (lookup tables).
