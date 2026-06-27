---
name: prompt-anatomy
description: Kỹ năng Agent chuyên biệt về prompt-anatomy cho hệ thống JavaScript High-Performance.
---

# Giải phẫu Cấu trúc Câu lệnh Sản xuất (Production Prompt Anatomy)

Để chuyển đổi một chỉ thị mơ hồ thành một cỗ máy xử lý dữ liệu mạnh mẽ, các Tác tử AI (đặc biệt là dòng Claude) trong hệ thống `agent-os-js` phải tuân thủ kiến trúc Prompt gồm 5 thành phần cốt lõi. Việc thiếu vắng bất kỳ thành phần nào cũng có thể dẫn đến suy giảm chất lượng, tăng độ trễ hoặc ảo giác (hallucination).

## 1. Kiến trúc 5 Lớp của Câu lệnh Tiêu chuẩn

1. **Ngữ cảnh & Vai trò (Task Context & Persona):**
   - Thiết lập "Tâm trí" cho AI: *“Bạn là một Senior Frontend Architect chuyên tối ưu GSAP và WebGL.”*
   - Mục đích: Giới hạn không gian tìm kiếm tri thức của mô hình, ngăn chặn việc sinh ra mã rác.
2. **Dữ liệu Đầu vào Động (Dynamic Content):**
   - Nội dung thực tế cần xử lý (ví dụ: Code của người dùng, lỗi console).
   - *Best Practice:* Sử dụng placeholder như `{{CODE_BLOCK}}` để chống xao nhãng.
3. **Hướng dẫn & Quy tắc Chi tiết (Detailed Instructions):**
   - Định tuyến luồng tư duy. Bắt buộc mô hình tuân thủ quy tắc 0-allocation và rAF.
4. **Hệ thống Ví dụ (Few-Shot Examples):**
   - Cung cấp mẫu "Mã xấu" vs "Mã chuẩn" để định chuẩn phán đoán.
5. **Nhắc nhở & Định dạng Đầu ra (Reminders & Output Formatting):**
   - Khắc phục hiện tượng "Quên lãng ở giữa" (lost in the middle). Nhắc lại lệnh cấm tuyệt đối ở cuối câu lệnh và yêu cầu định dạng đầu ra (XML/JSON).

## 2. Kỹ thuật Biên giới Nhận thức bằng XML

Mô hình Claude được tinh chỉnh để coi thẻ XML là các vách ngăn vật lý không thể xuyên thủng. 
- **Quy tắc:** Mọi dữ liệu nền, từ điển, hoặc mã nguồn tĩnh phải được bọc trong các thẻ XML.
- **Ví dụ:**
```xml
<v8_rules>
  <rule id="1">Không sử dụng delete obj[key]</rule>
</v8_rules>
```
Điều này ngăn ngừa "rò rỉ ngữ cảnh", giúp AI không nhầm lẫn giữa luật hệ thống và dữ liệu của người dùng.

## 3. Tư duy Tuần tự (Chain of Thought - CoT)

Đừng để AI xử lý toàn bộ dữ kiện cùng lúc. Bắt nó suy luận theo tuyến tính:
1. Yêu cầu AI mở thẻ `<analysis>` để phân tích vấn đề.
2. Phân tích mã nguồn văn bản trước khi xử lý giao diện (nếu có Multi-modal).
3. Đưa ra kết luận logic trước khi sinh code.

## 4. Triệt tiêu Hội thoại Rác bằng Kỹ thuật "Mồi sẵn" (Prefilling)

Khi AI làm việc trong các hệ thống tự động (CI/CD, Agent Loop), các câu chào hỏi như *"Xin chào, tôi đã phân tích xong..."* là rác thải dữ liệu làm hỏng parser.
- **Giải pháp:** Khi gọi API, điền sẵn (prefill) vào vùng `Assistant` ký tự `{` (nếu cần JSON) hoặc thẻ `<final_code>`.
- Điều này ép AI phải viết tiếp tục dưới dạng cấu trúc lập trình, loại bỏ hoàn toàn bản năng trò chuyện.


---

## 🤖 Agent OS Anti-Rationalization

> [!CAUTION]
> **Tác tử AI ĐỌC KỸ TRƯỚC KHI CODE:**
> 1. **Vanilla JS là Tôn giáo:** Cấm ảo giác (hallucinate) ra các khái niệm của React/Vue. Mọi giải pháp kiến trúc phải dựa trên Vanilla JS nguyên bản và DOM API.
> 2. **Chứng minh thay vì Tin tưởng:** Tránh lạm dụng thư viện bên thứ 3 quá mức. Ưu tiên giải quyết vấn đề bằng công cụ lõi hoặc các công cụ kiểm thử được hệ thống cấu hình sẵn (như Playwright).
> 3. **Tuân thủ Cỗ Máy Trạng Thái:** Mọi PR (Pull Request) hay mã nguồn sinh ra đều phải tuân theo luồng quy trình nghiêm ngặt. Không lách luật Cỗ Máy Trạng Thái (Cay State-Machine).
