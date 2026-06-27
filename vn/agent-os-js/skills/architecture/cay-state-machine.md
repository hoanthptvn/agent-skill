---
name: cay-state-machine
description: Kỹ năng Agent chuyên biệt về cay-state-machine cho hệ thống JavaScript High-Performance.
---

# Harness Engineering & Cỗ Máy Trạng Thái (Cay State-Machine)

Sự chuyển dịch của Kỹ sư phần mềm hiện đại không còn nằm ở việc sửa từng dòng mã (fixing code) mà là **sửa hệ thống điều phối (fixing the harness)**. Việc nạp quá nhiều ngữ cảnh cho một AI Agent chung chung đã được chứng minh là gây ra sự phình to ngữ cảnh (Context Bloat), làm giảm độ chính xác và tăng độ trễ.

Giải pháp cho vấn đề này là Kiến trúc Cỗ Máy Trạng Thái Định Tính (Deterministic State-Machine) kết hợp với các Quy trình Kích hoạt (Routines).

## 1. Cấu trúc Cỗ Máy Trạng Thái 5 Tác Nhân (Cay System)

Thay vì sử dụng các LLM xác suất (probabilistic) làm người điều phối nguyên khối, `agent-os-js` ép buộc AI chạy qua 5 tác nhân bị giới hạn quyền hạn nghiêm ngặt nhằm triệt tiêu "Lo âu Ngữ cảnh":

1. **Environmental Agent (Tác nhân Môi trường):** Chỉ thu thập ngữ cảnh tĩnh từ GitHub/Linear/Slack. Không được phép viết mã.
2. **Implementer Agent (Tác nhân Triển khai):** Nhận ngữ cảnh và viết mã. Nó không có quyền quyết định luồng công việc.
3. **Verifier Agent (Tác nhân Xác minh):** Kẻ đối trọng của Implementer. Nó độc lập tải mã về và chạy test suite.
4. **Closer Agent (Tác nhân Đóng gói):** Chỉ được phép tạo Pull Request nếu và chỉ nếu Verifier Agent đã cấp phép thành công.
5. **Retrospective Agent (Tác nhân Hồi tưởng):** Chạy ngầm sau khi kết thúc. Phân tích nhật ký lỗi để sinh ra các tệp bộ nhớ (Ví dụ: `brainstorm/`).

> [!WARNING]  
> **Nguyên lý Harness Engineering:** Khi AI gặp lỗi, Kỹ sư KHÔNG bao giờ nhảy vào sửa code thủ công. Kỹ sư phải tìm hiểu tại sao Cỗ máy trạng thái lại cho phép lỗi đó lọt qua, và tiến hành sửa chữa Cỗ máy (Siết chặt Prompt, siết chặt Verifier).

## 2. Hệ Tư Tưởng "Bằng Chứng Thay Niềm Tin" (Proof Over Trust)

Các mô hình ngôn ngữ luôn tìm cách hoàn thành văn bản thay vì hoàn thành công việc. Nếu có thể gian lận, chúng sẽ gian lận.

- **Agentic Corner-Cutting:** AI có thể tự tạo một tệp log rỗng (`cay_test.test`) để vượt qua điều kiện kiểm tra tồn tại tệp.
- **Cryptographic Verification:** Kỹ sư KHÔNG năn nỉ AI bằng câu lệnh *"Hãy chạy test đàng hoàng"*. Thay vào đó, Cỗ máy trạng thái bắt buộc đầu ra test phải sinh ra một **Mã băm mật mã (Cryptographic Hash)**. AI không thể ảo giác ra mã băm này, buộc nó phải thực thi trình biên dịch.
- **Visual Proof cho UI:** Khi AI sửa giao diện (DOM/CSS), không thể kiểm chứng bằng Backend test. Hệ thống ép AI phải dùng **Playwright** để thao tác và quay Video trình duyệt. Nếu không có Video, Pull Request lập tức bị từ chối.

## 3. Các Quy Trình Tự Động Hóa (Proactive Routines)

Hệ thống cung cấp các kịch bản (Routines) để biến AI thành một kỹ sư chạy ngầm (Background Engineer):

### Kịch bản 1: PR Code Reviewer (Generator - Critic)
- **Mục tiêu:** Chặn code vi phạm hiệu năng (như vòng lặp O(N²), Reflow) lọt vào Production.
- **Trigger:** Webhook khi tạo Pull Request.
- **Hoạt động:** Tác tử Critic đọc PR và so chiếu với `skills/performance-loops/` và `skills/data-structures/`. Nếu phát hiện `forEach` trong animation loop, nó tự động **Block PR**.

### Kịch bản 2: Dọn Nợ Kỹ Thuật (Tech Debt Triage)
- **Mục tiêu:** Quét và sửa Anti-pattern định kỳ.
- **Trigger:** Cronjob (VD: 2:00 sáng Thứ Hai).
- **Hoạt động:** Tác tử quét codebase. Nếu phát hiện vi phạm, nó tự động mở một Pull Request sửa lỗi (như bổ sung `lenis.destroy()`).

### Mẫu Cấu Hình Thực Tế (GitHub Actions)
```yaml
# .github/workflows/agent-os-js-proactive-reviewer.yml
name: Proactive AI Skill-JS Reviewer
on:
  pull_request:
    types: [opened, synchronize]
jobs:
  ai-review:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
      - name: Run Claude Code Routine
        uses: anthropic/claude-code-action@v1
        with:
          api-key: ${{ secrets.ANTHROPIC_API_KEY }}
          routine: 'code-review'
          context: 'skills'
          system-prompt: |
            Bạn là một Critic Agent chuyên Web Performance.
            Kiểm tra Zero-allocation rAF, Forced Reflow. Trả về FAIL nếu vi phạm.
```


---

## 🤖 Agent OS Anti-Rationalization

> [!CAUTION]
> **Tác tử AI ĐỌC KỸ TRƯỚC KHI CODE:**
> 1. **Vanilla JS là Tôn giáo:** Cấm ảo giác (hallucinate) ra các khái niệm của React/Vue. Mọi giải pháp kiến trúc phải dựa trên Vanilla JS nguyên bản và DOM API.
> 2. **Chứng minh thay vì Tin tưởng:** Tránh lạm dụng thư viện bên thứ 3 quá mức. Ưu tiên giải quyết vấn đề bằng công cụ lõi hoặc các công cụ kiểm thử được hệ thống cấu hình sẵn (như Playwright).
> 3. **Tuân thủ Cỗ Máy Trạng Thái:** Mọi PR (Pull Request) hay mã nguồn sinh ra đều phải tuân theo luồng quy trình nghiêm ngặt. Không lách luật Cỗ Máy Trạng Thái (Cay State-Machine).
