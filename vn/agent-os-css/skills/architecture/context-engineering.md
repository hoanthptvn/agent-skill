---
name: context-engineering
description: Kỹ năng Agent chuyên biệt về context-engineering cho hệ thống CSS.
---

# Kỹ nghệ Ngữ cảnh (Context Engineering) & Tác nhân Quản lý

Để đảm bảo các Tác tử AI (AI Agents) tương tác an toàn và hiệu quả với hệ thống codebase phức tạp, `agent-os-js` áp đặt các quy tắc khắt khe về mặt quản trị vòng đời của Không gian ngữ cảnh (Context Window) và Phân rã thực thể (Virtualization).

## 1. Giới hạn Toán học (The Dumbzone - 40%)

Khi cửa sổ ngữ cảnh bị nạp quá 40% dung lượng, AI sẽ rơi vào "Vùng Suy giảm Nhận thức" (Dumbzone). Nó sẽ bị mất tập trung, ảo giác (hallucinate) và sinh ra mã rác.
- **Quy tắc:** KHÔNG BAO GIỜ nạp toàn bộ Repository vào phiên làm việc.
- **Giải pháp:** Bắt buộc nén thông tin thành Markdown trước khi đưa lại cho Tác tử Chính (Intentional Context Compression).

## 2. Kỷ luật Phân nhánh Ngữ cảnh (Context Forking)

Việc liên tục bắt AI sửa lỗi trong cùng một phiên chat sẽ tạo ra "Vòng lặp Phản hồi Tiêu cực", gây ô nhiễm không gian làm việc.
- **Quy tắc:** Nếu AI sinh ra mã lỗi, sử dụng API sai, hoặc lạc lối về mặt kiến trúc -> Dừng ngay cuộc hội thoại.
- **Giải pháp:** Mở một phiên làm việc mới (Context Forking). Chỉ cung cấp các tiền đề đúng và yêu cầu nó bắt đầu lại trong trạng thái não bộ hoàn toàn "sạch".

## 3. Sự Ảo hóa (Virtualization) và Phân rã 3 Thực thể

Hệ thống AI cấp doanh nghiệp không còn là một khối nguyên khối (monolith) gọi API đơn thuần, mà được chia thành 3 tài nguyên độc lập:

1. **Khối Não Bộ (Agents Endpoint):** Chứa định nghĩa vai trò, prompt hệ thống và tri thức (chỉ tư duy ngôn ngữ, không lưu trạng thái).
2. **Khối Đôi Tay (Environment/Sandbox):** Môi trường thực thi cục bộ (như Container), nơi các file được sửa, mã nguồn được biên dịch.
3. **Khối Cầu Nối (Session):** Bản ghi nhật ký (append-only log) đồng bộ hóa giữa Não và Tay. Nó lưu trữ trạng thái thực thi liên tục. Sự cố đứt mạng không làm mất bộ nhớ vì Session có thể tự phục hồi.

## 4. Quản trị Bán kính Sát thương (Blast Radius) & Auto-mode

Trao quyền thao tác repo cho AI tiềm ẩn rủi ro phá hủy hệ thống.
- **Sai lầm:** Sử dụng mô hình Human-in-the-loop liên tục (bắt người dùng duyệt từng file). Khảo sát cho thấy con người sẽ duyệt 93% yêu cầu một cách cẩu thả do hội chứng **"Mệt mỏi vì phê duyệt" (Approval Fatigue)**.
- **Giải pháp:** Sử dụng Chế độ tự động (Auto-mode) bên trong một **Sandbox bị cô lập** (Khối Đôi tay). Nếu AI phá hỏng Sandbox, hệ thống vật lý không bị ảnh hưởng.

## 5. Điều phối Đa Tác nhân (Sub-agents)

Để tránh hiện tượng **"Lo âu ngữ cảnh" (Context Anxiety)** — nơi AI kết thúc vội vã công việc vì sợ tràn bộ nhớ — hệ thống áp dụng cơ chế Dispatcher / Sub-agents.
- **Dispatcher Agent:** Nhận diện vấn đề siêu tốc và phân luồng.
- **Sub-agents:** Các tác tử cấp dưới mang ngữ cảnh độc lập, chuyên giải quyết từng góc nhỏ của repo (ví dụ: Tác tử chuyên refactor loop). Đảm bảo mỗi bộ não chỉ tải đúng phần tri thức nó cần.


---

## 🤖 Agent OS Anti-Rationalization

> [!CAUTION]
> **Tác tử AI ĐỌC KỸ TRƯỚC KHI CODE:**
> 1. **Cấm lười biếng:** Không được lạm dụng `!important` để chữa cháy giao diện. BẮT BUỘC phải tuân thủ tầng Cascade (Cascade Layers - `@layer`).
> 2. **Cấm ngụy biện:** "Hardcode mã màu cho nhanh" là sai lầm chết người. Mọi màu sắc, khoảng cách (spacing), font-size đều PHẢI sử dụng CSS Variables (Design Tokens) như `var(--clr-bg)`, `var(--space-2)`.
> 3. **Bảo vệ Hệ thống:** Cấm nhồi nhét style trực tiếp vào thẻ HTML (Inline styles). Mọi tên class phải tuân thủ nguyên tắc BEM với tiền tố tiêu chuẩn (`c-`, `l-`, `u-`).
