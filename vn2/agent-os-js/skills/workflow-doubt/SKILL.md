---
name: workflow-doubt
description: Áp dụng tư duy Doubt-Driven Development. Sử dụng khi Agent chuẩn bị đưa ra một quyết định kiến trúc quan trọng (vd: Next.js Caching, WebGL vs DOM, GSAP structure) để ngăn chặn "ảo giác tự tin" (confident hallucinations).
license: MIT
---

# Quy trình Tư duy Phản biện (`@doubt`)

## 1. Khi nào nên dùng (When to Use)
**MANDATORY:** Sử dụng cho các quyết định kiến trúc quan trọng để ngăn chặn "ảo giác tự tin" (confident hallucinations).
- Các chiến lược Next.js Caching (ISR so với Dynamic).
- Lựa chọn kiến trúc WebGL hay DOM thuần.
- Các timeline GSAP phức tạp, cần đồng bộ cao.
- Các thay đổi về cấu trúc CSS.
- **FORBIDDEN:** TUYỆT ĐỐI KHÔNG dùng quy trình này cho các luật cơ bản hoặc định dạng code (code formatting) đơn giản.

## 2. Chu kỳ Phản biện 5 Bước (The 5-Step Doubt Cycle)
**MANDATORY:** Bắt buộc chạy chu kỳ suy nghĩ này khi đưa ra các lựa chọn kiến trúc lớn:
- **Bước 1: CLAIM (Tuyên bố):** Nêu rõ quyết định và tại sao nó lại quan trọng.
- **Bước 2: EXTRACT (Tách biệt):** Cô lập đoạn code/hợp đồng (contract). Xóa bỏ mọi sự biện hộ.
- **Bước 3: DOUBT (Phản biện thù địch):** Đóng vai một Senior Developer cực kỳ khó tính và thù địch. Chủ động bới móc tìm kiếm Rò rỉ bộ nhớ (Memory Leaks), Lỗi giật cuộn trang (Scroll Jank), hoặc Hydration Errors. TUYỆT ĐỐI KHÔNG ĐƯỢC KHEN NGỢI.
- **Bước 4: RECONCILE (Dàn xếp):** Đối mặt với các lỗ hổng vừa tìm thấy. Sửa chúng hoặc chấp nhận đánh đổi (trade-off) một cách rõ ràng.
- **Bước 5: STOP (Dừng):** Kết thúc chu kỳ khi không còn lỗ hổng nghiêm trọng nào (tối đa 3 vòng lặp).

## 3. Quy tắc Chống biện hộ (Anti-Rationalization Rules)
- **FORBIDDEN:** "Tôi đã viết đoạn GSAP này hoàn hảo rồi, không cần phản biện." **Thực tế:** Animation phức tạp rất dễ biến thành một "Bát súp Tween" lộn xộn. Sự tự tin thái quá thường dẫn đến hiệu năng tụt thê thảm dưới mức 60fps.
- **FORBIDDEN:** "Phản biện tốn thời gian quá, cứ ship code đi." **Thực tế:** Đi sửa bug bộ nhớ đệm (caching) trên môi trường Production tốn gấp 10 lần thời gian. Hãy phản biện từ sớm.

## 4. Tiêu chí Dừng bắt buộc (Hard Exit Criteria)
**FORBIDDEN:** Không được thoát khỏi chu kỳ phản biện trừ khi:
1. Quyết định (CLAIM) đã được gọi tên rõ ràng.
2. Các rủi ro cụ thể về hiệu năng/kiến trúc đã bị tấn công (DOUBT).
3. Code đã được sửa đổi dựa trên những lời phê bình thù địch (RECONCILE).
