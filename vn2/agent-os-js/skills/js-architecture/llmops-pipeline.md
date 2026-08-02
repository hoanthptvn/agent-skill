---
name: llmops-pipeline
description: Kỹ năng Agent chuyên biệt về kiến trúc gọi API LLM (LLMOps), Prompt Object, Validation Pipeline và Conversation Manager.
---

# Tư duy LLMOps & Production Prompts (AI Enterprise)

Khi tích hợp Trí tuệ Nhân tạo (AI/LLM) vào một ứng dụng JavaScript, việc gửi một chuỗi văn bản (string) cho AI và nhận về kết quả là một **món nợ kỹ thuật (technical debt)** khổng lồ. Trong môi trường Sản xuất (Production), API của bạn sẽ sập nếu AI trả về sai định dạng, và chi phí sẽ "thủng trần" nếu bạn không biết tối ưu bộ nhớ đệm (Cache) và Quản trị Lịch sử.

Tệp này định nghĩa "Kiến trúc API Hoàn Hảo" (Silicon Valley Standards) để xây dựng một **Hệ thống AI Siêu Tốc, Siêu Rẻ và Không thể sập (Crash-proof AI System)**.

> ⚠️ **BẢO MẬT API KEY:** Mọi kiến trúc dưới đây (gọi API LLM) BẮT BUỘC phải được thực thi ở lớp Backend-for-Frontend (BFF - Node.js, Next.js API, Edge Functions). TUYỆT ĐỐI KHÔNG gọi trực tiếp OpenAI/Anthropic SDK từ Vanilla JS trên trình duyệt.

## 📑 Mục lục
1. [Prompt Object (Thực thể hạng nhất)](#1-prompt-object-thực-thể-hạng-nhất)
2. [Nghệ thuật Few-shot Prompting & Ngân sách Ví dụ](#2-nghệ-thuật-few-shot-prompting--ngân-sách-ví-dụ)
3. [Quản trị Trí nhớ (Memory Management & Caching)](#3-quản-trị-trí-nhớ-memory-management--caching)
4. [Kỷ luật Lấy JSON Nguyên chất](#4-kỷ-luật-lấy-json-nguyên-chất)
5. [The Ultimate Conversation Manager (Kiến trúc 6 Trụ cột)](#5-the-ultimate-conversation-manager-kiến-trúc-6-trụ-cột)
6. [Agent OS Anti-Rationalization](#-agent-os-anti-rationalization)

---

## 1. Prompt Object (Thực thể hạng nhất)

**Chấm dứt việc "Trò chuyện". Bạn đang viết một Hợp đồng (Contract) với AI.**
Tuyệt đối không trộn lẫn Lệnh hệ thống (Luật tĩnh) và Dữ liệu người dùng (Động) vào một biến chuỗi duy nhất. Prompt phải được đóng gói thành một Object hoặc Class có phiên bản (version) và hàm băm (hash) rõ ràng.

### ✅ Chuẩn mực Production
```javascript
const TicketClassifierPrompt = {
  name: "ticket-classifier",
  version: "v1.2.0",
  model: "claude-3-opus",
  fingerprint: "71b19d06a60b", // Hash chống quên đổi version
  system_template: `Bạn là AI phân loại ticket. CẤM trả lời bằng văn xuôi.`,
  user_template: (ticketText) => `<ticket>\n${ticketText}\n</ticket>`
};
```

---

## 2. Nghệ thuật Few-shot Prompting & Ngân sách Ví dụ

Không phải cứ nhồi nhiều ví dụ là AI sẽ thông minh hơn. Nhiều ví dụ rác sẽ làm nổ hóa đơn API (Token Cost) của bạn.

1. **Tín hiệu cao (High-Signal):** Mỗi ví dụ phải dạy AI một điều nó chưa biết (ví dụ xử lý ngoại lệ, từ chối khéo). Nếu AI tự làm tốt nhờ Rule, loại bỏ ví dụ đó.
2. **Ngân sách Ví dụ (Few-shot Budget):** Đặt một giới hạn Token cứng (VD: 800 Tokens) cho toàn bộ tập Ví dụ.
3. **Thuật toán Tham lam (Greedy):** Code tự động lấy ví dụ quan trọng nhất bỏ vào Prompt. Nếu ví dụ tiếp theo làm tổng số Token vượt 800, LẬP TỨC BỎ QUA nó. Không bao giờ được phép bẻ đôi một ví dụ.

---

## 3. Quản trị Trí nhớ (Memory Management & Caching)

Sự thật phũ phàng: API của LLM hoàn toàn **"Mất trí nhớ" (Stateless)**. Nếu bạn liên tục gửi lại toàn bộ lịch sử trò chuyện (Unbounded History), bạn sẽ dính **Bẫy "Quả cầu tuyết"**, dẫn đến tràn bộ nhớ và đốt sạch tiền API.

### 3.1. Prompt Caching (Tối ưu 90% Chi phí)
Với các System Rules dài, Caching là "Chén thánh". Cơ chế Cache quét từ trên xuống dưới (Prefix-based). **Cấm nhét dữ liệu động (Timestamp, User ID) lên đầu Prompt**, nếu không Cache sẽ đứt gãy.

### 3.2. Trí nhớ Dài hạn (Summarization)
Với "Quá khứ xa", ngầm gọi API để tóm tắt lịch sử thành 3-5 câu. Đặt đoạn tóm tắt này vào một "Neo bối cảnh" (Context Anchor) bằng lượt hỏi-đáp giả (Fake User-Assistant turn).

### 3.3. Trí nhớ Ngắn hạn (Windowing & Pruning)
Với "Quá khứ gần", thiết lập Token Budget (VD: < 2500 tokens). Khi số Token của lịch sử thô vượt 2500, dao "cắt cái rụp" vứt bỏ các tin nhắn cũ đi. Lịch sử cũ sẽ không biến mất vì đã nằm gọn trong Bản tóm tắt (3.2).

---

## 4. Kỷ luật Lấy JSON Nguyên chất

1. **Nhúng Lược đồ (Embed Schema):** Vẽ thẳng JSON mẫu vào System Prompt.
2. **Ví dụ Tiêu cực (Negative Examples):** Chỉ đích danh lỗi. VD: *"KHÔNG trả về null, trả về []"*.
3. **Mớm XML hoặc Partial JSON (Prefill):** Nhét sẵn `{` vào cuối Payload để khóa luồng suy luận. 

---

## 5. The Ultimate Conversation Manager (Kiến trúc 6 Trụ cột)

Đây là bản thiết kế tối thượng, kết hợp toàn bộ Tầng Bối Cảnh (Context Layers) và Tầng Phòng Thủ (Defenses). Dưới đây là mô phỏng Code chuẩn Mực Enterprise.

```javascript
class ConversationManager {
  constructor(promptObject) {
    this.prompt = promptObject;
    this.tokenBudget = 2500;
  }

  async processTurn(userInput, history) {
    // 🛡️ BẢO VỆ 1: Kiểm tra trước khi bay (Pre-flight Check)
    if (this.estimateTokens(history) > this.tokenBudget) {
      history = await this.summarizeAndPrune(history); // Cắt tỉa & Tóm tắt
    }

    const payload = this.buildPayload(userInput, history);
    
    try {
      const response = await this.callApi(payload);
      
      // 🛡️ BẢO VỆ 2: Cạo rào chắn Markdown (Fence Stripping)
      const cleanJsonStr = this.stripFence(response);
      
      // 🛡️ BẢO VỆ 3: Xác thực Schema & Cầu dao ngắt mạch
      return await this.validateAndSelfCorrect(cleanJsonStr); 
    } catch (error) {
      // 🛡️ BẢO VỆ 4: Đỡ đòn sau chuyến bay (Post-flight Catch)
      logger.error("API Failed gracefully", error);
      return { fallback: true, message: "Hệ thống đang bận." };
    }
  }

  buildPayload(userInput, prunedHistory) {
    return {
      model: this.prompt.model,
      system: [
        // 🏛️ TRỤ CỘT 1: LỚP SIÊU TĨNH (Cắm cờ Cache tiết kiệm 90%)
        { type: "text", text: this.prompt.system_template },
        { type: "text", text: this.getHighSignalExamplesUnderBudget(800), 
          cache_control: { type: "ephemeral" } } // 🚩 Mốc Cache Siêu tiết kiệm
      ],
      messages: [
        // 🏛️ TRỤ CỘT 2: NEO TÓM TẮT QUÁ KHỨ XA (Fake Turn)
        { role: "user", content: `Tóm tắt quá khứ: ${prunedHistory.summary}` },
        { role: "assistant", content: "Tôi đã nắm rõ bối cảnh." },

        // 🏛️ TRỤ CỘT 3: CỬA SỔ CẮT TỈA QUÁ KHỨ GẦN
        ...prunedHistory.recentMessages,

        // 🏛️ TRỤ CỘT 4: MỚM LỜI LƯỢT HIỆN TẠI (Prefill)
        { role: "user", content: userInput },
        { role: "assistant", content: "{" } // 🚩 Ép AI xuất JSON 100%
      ]
    };
  }
}
```

---

## 🤖 Agent OS Anti-Rationalization

> [!CAUTION]
> **Tác tử AI ĐỌC KỸ TRƯỚC KHI CODE:**
>
> 1. **Cấm nối chuỗi bừa bãi:** BẮT BUỘC tạo `Prompt Object`.
> 2. **Cấm bỏ qua Prefill:** BẮT BUỘC nhúng ký tự `{` hoặc Partial JSON vào vai trò `assistant` cuối mảng `messages` để ép khuôn JSON.
> 3. **Cấm tin tưởng JSON:** BẮT BUỘC bọc qua hàm `stripFence()` và kiểm tra qua thư viện Schema.
> 4. **Cấm Lỗi "Đốt tiền" (Bẫy Cache Miss):** TUYỆT ĐỐI CẤM nhét biến động (`Timestamp`, `User_ID`) vào phần `system` đầu Prompt.
> 5. **Cấm Bẫy "Quả cầu tuyết" (Unbounded History):** CẤM gửi toàn bộ lịch sử chat nguyên bản vào API. BẮT BUỘC nén (Summarize) và cắt tỉa (Prune).
> 6. **Cấm Vung tay quá trán (No Example Spamming):** CẤM nhồi nhét ví dụ dài dòng. CẮM cờ kiểm soát Token Budget cho phần Few-shot.
