---
name: agent-native-verification
description: Sử dụng khi cần viết hoặc sửa mã JavaScript tương tác với DOM (Vanilla JS). Kỹ năng này buộc hệ thống phải tuân thủ "DOM Contract" để máy tự động có thể đọc được trạng thái.
---

# Kỹ năng Kiểm thử Gốc cho Tác tử (Agent-Native Verification)

## Khi nào nên dùng (When to use)
- Khi Người dùng gõ lệnh `/test`.
- Bất cứ khi nào bạn viết Vanilla JS thao tác lên DOM (thêm/xóa class, trigger animation, cập nhật trạng thái UI).

## Quy trình bắt buộc (Process)

1. **Thiết lập Hợp đồng DOM (The DOM Contract):** 
   - Tuyệt đối không dùng tên class CSS (như `.active`, `.bg-blue`) để lưu trữ logic trạng thái. 
   - Mọi trạng thái quan trọng phải được ánh xạ ra thuộc tính `data-*` trên HTML (Ví dụ: `data-card-state="active"`, `data-animation-status="running"`).
2. **Kích hoạt Giao thức Tự chẩn đoán (Self-healing Loop):**
   - Viết các đoạn mã kiểm thử (hoặc sử dụng Playwright) để mô phỏng tương tác người dùng.
   - Script kiểm thử phải bóc tách trạng thái dựa trên các thuộc tính `data-*` vừa tạo.
3. **Phơi bày Trạng thái Ẩn:**
   - Trong quá trình animation (VD: dùng GSAP hoặc `requestAnimationFrame`), phải cập nhật `data-animation-status` tương ứng để AI Agent khác có thể "nhìn thấy" trạng thái bên trong.

## Bảng Chống Ngụy Biện (Anti-rationalization Table)

| Cớ của AI (AI's Excuse) | Phản biện bắt buộc của Hệ thống (System's Rebuttal) |
|---|---|
| "Component này chỉ để làm đẹp (trang trí), không cần dùng thuộc tính data-* làm gì cho dài dòng." | **KHÔNG ĐƯỢC PHÉP.** Trong kỷ nguyên AI, mọi thành phần UI đều phải có khả năng đọc bởi trình duyệt không giao diện (headless browser). Bắt buộc phải gắn `data-ui-component="name"` và `data-state="..."`. |
| "Tôi sẽ dùng `element.classList.contains('active')` trong JS để kiểm tra trạng thái cho nhanh." | **DỪNG LẠI.** Class CSS là không đáng tin cậy và có thể bị kỹ sư CSS thay đổi. Phải dùng `element.getAttribute('data-state') === 'active'`. Sửa lại code ngay lập tức. |
| "Người dùng chỉ đưa cho tôi hình ảnh, tôi sẽ tự đoán cấu trúc HTML." | **SAI LẦM.** Yêu cầu người dùng cung cấp HTML Specs hoặc tự viết ra một bộ khung HTML trơ (skeleton) để xác thực cấu trúc DOM 2D/3D trước khi thêm CSS/JS. |

## Tiêu chí Thoát (Hard Exit Criteria)

Tác vụ Kỹ năng này chỉ được đánh dấu là HOÀN THÀNH khi và chỉ khi:
- Mọi logic JS thao tác trạng thái đều gắn liền với việc cập nhật một thuộc tính `data-*`.
- Đã xuất trình Log Terminal hoặc Video Playwright chứng minh rằng quá trình chuyển đổi trạng thái (state transition) diễn ra chính xác mà không phụ thuộc vào CSS Class.


---

## 🤖 Agent OS Anti-Rationalization

> [!CAUTION]
> **Tác tử AI ĐỌC KỸ TRƯỚC KHI CODE:**
> 1. **Vanilla JS là Tôn giáo:** Cấm ảo giác (hallucinate) ra các khái niệm của React/Vue. Mọi giải pháp kiến trúc phải dựa trên Vanilla JS nguyên bản và DOM API.
> 2. **Kiểm thử độc lập (DOM Contract):** Tuyệt đối không kiểm tra trạng thái bằng class CSS (`.active`). Bắt buộc dùng `data-*` để các trình duyệt headless hoặc Tác tử khác có thể đọc được trạng thái.
