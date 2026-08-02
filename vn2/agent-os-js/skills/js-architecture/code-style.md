---
name: code-style
description: Kỹ năng Agent chuyên biệt về code-style cho hệ thống JavaScript High-Performance.
---

# Code Style — Viết code con người đọc hiểu

Quy tắc bắt buộc khi AI viết code từ bộ agent-os-js này. Mục tiêu: con người đọc 1 lần hiểu ngay, không cần "giải mã".

---

## Nguyên tắc tổng quát

```
1. Viết cho NGƯỜI ĐỌC, không viết cho máy chạy
2. Rõ ràng > Ngắn gọn > Thông minh
3. Comment giải thích TẠI SAO, không giải thích CÁI GÌ
4. Tên biến/hàm phải tự giải thích — nếu cần comment → tên chưa tốt
5. 1 dòng code = 1 việc duy nhất
```

---

## ❌ Lỗi phổ biến AI hay mắc

### 1. Nhồi nhiều logic vào 1 dòng

```javascript
// ❌ AI hay viết: chain dài sinh ra mảng rác (Garbage Collection)
const result = arr
  .filter((x) => x > 0)
  .map((x) => x * 2)
  .reduce((a, b) => a + b, 0);

// ✅ Chuẩn Awwwards: Vòng lặp For phẳng (Zero GC Allocation)
let totalValue = 0;
for (const item of arr) {
  if (item > 0) {
    totalValue += item * 2;
  }
}
```

### 2. Ternary lồng nhau

```javascript
// ❌ AI hay viết: ternary chain
const label = score > 90 ? "A" : score > 70 ? "B" : score > 50 ? "C" : "F";

// ✅ Con người đọc được: if/else hoặc lookup table
let label;
if (score > 90) label = "A";
else if (score > 70) label = "B";
else if (score > 50) label = "C";
else label = "F";

// ✅ Hoặc function riêng:
function getGrade(score) {
  if (score > 90) return "A";
  if (score > 70) return "B";
  if (score > 50) return "C";
  return "F";
}
```

**Quy tắc ternary**: Chỉ dùng khi **1 điều kiện, 2 nhánh đơn giản, trên 1 dòng**.

```javascript
// ✅ Ternary đơn giản — OK
const direction = velocity > 0 ? "forward" : "backward";

// ❌ Ternary phức tạp — KHÔNG
const result = isActive
  ? hasPermission
    ? doAction()
    : showError()
  : redirectToLogin();
```

### 3. Destructuring quá sâu

```javascript
// ❌ AI hay viết: destructure 1 lần lấy hết
const {
  data: {
    user: {
      profile: { name, avatar },
    },
  },
} = response;

// ✅ Con người đọc được: tách từng bước, rõ nguồn gốc
const responseData = response.data;
const userProfile = responseData.user.profile;
const userName = userProfile.name;
const userAvatar = userProfile.avatar;
```

### 4. Tên biến quá ngắn hoặc quá chung

```javascript
// ❌ Biến 1 chữ (ngoại trừ loop counter i, j)
const d = new Date();
const t = performance.now();
const p = document.querySelector(".card");
const r = el.getBoundingClientRect();

// ✅ Tên tự giải thích
const currentDate = new Date();
const startTime = performance.now();
const cardElement = document.querySelector(".card");
const cardRect = el.getBoundingClientRect();

// ❌ Tên quá chung
const data = fetchProducts();
const items = document.querySelectorAll(".card");
const result = calculateTotal();

// ✅ Tên rõ ngữ cảnh
const productList = fetchProducts();
const cardElements = document.querySelectorAll(".card");
const orderTotal = calculateTotal();
```

**Ngoại lệ cho phép tên ngắn:**

```javascript
// ✅ Loop counter i, j — chuẩn industry, ai cũng hiểu
for (let i = 0; i < particles.length; i++) { ... }

// ✅ Arrow function parameter khi context rõ ràng
products.find(product => product.id === targetId);  // ← "product" rõ hơn "p" hoặc "x"
users.some(user => user.isAdmin);                   // ← "user" rõ hơn "u"

// ❌ KHÔNG chấp nhận
products.find(x => x.id === targetId);  // "x" là gì?
users.some(u => u.isAdmin);             // "u" là gì?
```

### 5. Comment vô nghĩa (giải thích cái gì)

```javascript
// ❌ Comment thừa — code đã nói rồi
let count = 0; // Khởi tạo biến count bằng 0
count++; // Tăng count lên 1
const isActive = true; // Set isActive thành true

// ✅ Comment giải thích TẠI SAO
let count = 0; // Reset mỗi frame — particle system yêu cầu đếm lại

// ✅ Comment giải thích QUYẾT ĐỊNH
// Dùng for(let i) thay forEach vì đây là rAF hot path — tránh closure allocation
for (let i = 0; i < particles.length; i++) {
  updateParticle(particles[i]);
}

// ✅ Comment cảnh báo HẬU QUẢ
// ⚠️ getBoundingClientRect() gây force reflow — KHÔNG gọi trong loop
// Đã cache kết quả ở init, chỉ invalidate khi resize
const cachedRect = rectCache.get(element);
```

### 6. "Thông minh" quá mức (Clever code)

```javascript
// ❌ Bitwise thay boolean — khó hiểu với junior
const isEven = !(num & 1);
const half = num >> 1;

// ✅ Rõ ý đồ — ai cũng hiểu
const isEven = num % 2 === 0;
const half = Math.floor(num / 2);

// ⚠️ NGOẠI LỆ: bitwise CHỈ dùng trong rAF hot path (đã ghi trong types-number.md)
// Khi đó BẮT BUỘC phải comment giải thích:
const half = num >> 1; // Bitwise right shift = Math.floor(num/2), nhanh hơn trong rAF loop
```

---

## Quy tắc đặt tên

```
Biến:       camelCase, tên danh từ/cụm danh từ
            scrollPosition, particleCount, isVisible, hasLoaded

Hàm:        camelCase, tên động từ/cụm động từ
            calculateDistance(), updateParticles(), handleClick()

Hằng số:    UPPER_SNAKE_CASE — chỉ cho giá trị KHÔNG ĐỔI toàn cục
            MAX_PARTICLES, FRAME_BUDGET_MS, API_BASE_URL

Boolean:    Prefix is/has/should/can
            isActive, hasPermission, shouldAnimate, canScroll

DOM:        Suffix Element/Elements/El/Node
            cardElement, headerEl, allCardElements

Event:      Prefix handle/on
            handleClick, onScroll, handleResize

Private:    Prefix _
            _rafId, _isRunning, _cache
```

---

## Cấu trúc hàm

### Hàm ngắn, 1 việc duy nhất

```javascript
// ❌ Hàm "god function" — làm quá nhiều việc
function processData(rawData) {
  // validate
  // transform
  // filter
  // sort
  // render
  // animate
  // 200 dòng...
}

// ✅ Tách nhỏ — mỗi hàm 1 trách nhiệm
function validateProducts(rawData) { ... }    // 10–20 dòng
function transformProducts(validData) { ... } // 10–20 dòng
function renderProductCards(products) { ... }  // 10–20 dòng
function animateCardEntrance(cards) { ... }    // 10–20 dòng
```

### Early return — Tránh lồng sâu

```javascript
// ❌ Lồng 4 tầng if
function updateParticle(particle) {
  if (particle) {
    if (particle.active) {
      if (particle.life > 0) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 0.01;
      }
    }
  }
}

// ✅ Early return — phẳng, dễ đọc
function updateParticle(particle) {
  if (!particle) return;
  if (!particle.active) return;
  if (particle.life <= 0) return;

  particle.x += particle.vx;
  particle.y += particle.vy;
  particle.life -= 0.01;
}
```

---

## Comment cheat sheet

```
// ← Giải thích TẠI SAO chọn cách này (quyết định kỹ thuật)
// ← Cảnh báo side effect hoặc gotcha
// ← Đánh dấu TODO / FIXME / HACK (tạm thời)

// ❌ KHÔNG comment:
// ← Giải thích code đã tự giải thích
// ← Mô tả lại tên biến/hàm bằng lời
// ← Comment cũ, không còn đúng (xóa đi!)
```

---

## Áp dụng vào bộ agent-os-js

Khi AI đọc code example trong `algorithms/` và `types/`, lưu ý:

```
1. Code ví dụ trong agent-os-js viết NGẮN vì mục đích TÀI LIỆU (dạy thuật toán)
2. Khi AI VIẾT CODE CHO USER — phải MỞ RỘNG ra theo quy tắc trên
3. Tên biến i, j, lo, hi trong ví dụ thuật toán là CHUẨN (industry convention)
   Nhưng trong code production phải đổi: startIndex, endIndex, leftPointer
4. Comment trong ví dụ giải thích CÁI GÌ (vì đang dạy) — nhưng
   Comment trong code production phải giải thích TẠI SAO
```

### Ví dụ chuyển đổi

```javascript
// === Trong agent-os-js (tài liệu dạy) ===
let lo = 0,
  hi = arr.length - 1;
while (lo <= hi) {
  const mid = lo + ((hi - lo) >> 1);
  if (arr[mid] <= scrollY) {
    lo = mid + 1;
  } else hi = mid - 1;
}

// === AI viết cho user (production) ===
let searchStart = 0;
let searchEnd = keyframes.length - 1;
let activeKeyframeIndex = 0;

// Binary search: tìm keyframe gần nhất <= scroll hiện tại
// Dùng thay .find() vì danh sách 500+ keyframes — O(log N) thay O(N)
while (searchStart <= searchEnd) {
  const midIndex = searchStart + Math.floor((searchEnd - searchStart) / 2);

  if (keyframes[midIndex].scrollOffset <= currentScrollY) {
    activeKeyframeIndex = midIndex;
    searchStart = midIndex + 1; // Tiếp tục tìm bên phải
  } else {
    searchEnd = midIndex - 1; // Thu hẹp về bên trái
  }
}
```

---

## Quy trình AI viết code (Step-by-Step Workflow)

Để tránh tình trạng "nhảy cóc" (viết code vội vàng rồi phải sửa lại do vi phạm GC hoặc Style), Tác tử AI **BẮT BUỘC** tuân thủ quy trình 5 bước sau khi generate code:

**Bước 1: Xác định Thuật toán (Planning)**
- Không gõ code ngay. Hãy tự hỏi: "Dữ liệu có lớn không? Cần dùng thuật toán nào trong `js-algorithms`?" (VD: Cần tìm kiếm -> Binary Search; Cần update DOM liên tục -> GSAP quickTo).

**Bước 2: Xây dựng Bộ khung Phẳng (Flat Structure)**
- Viết logic lõi bằng vòng lặp `for...of` hoặc `for(let i)`.
- Áp dụng Early Return để san phẳng các khối `if/else` lồng nhau.
- *Tuyệt đối không dùng `.map().filter()` để nháp.*

**Bước 3: Đặt tên cho Con người (Humanizing)**
- Thay thế toàn bộ các biến viết tắt (như `p`, `idx`, `arr`, `rect`) thành tên ngữ nghĩa (như `particle`, `currentIndex`, `productData`, `boundingCoordinates`).
- Kiểm tra lại: Đọc đoạn code lên thành tiếng có thành một câu tiếng Anh có nghĩa không?

**Bước 4: Loại bỏ "Phép thuật" (De-clevering)**
- Chuyển đổi các đoạn bitwise `>> 1` (nếu không ở trong rAF) về `Math.floor`.
- Xóa các toán tử Ternary lồng nhau và thay bằng `if/else` hoặc Function.

**Bước 5: Chú thích (Why-Commenting)**
- Xóa bỏ mọi comment mô tả hàm đang làm gì.
- Thêm comment giải thích: Tại sao lại chọn cách tiếp cận này? (VD: `// Tránh tạo mảng rác để giữ 60fps`).

---

## Quick Reference

```
RÕ RÀNG > NGẮN GỌN > THÔNG MINH

1 dòng = 1 việc
1 hàm ≤ 30 dòng, 1 trách nhiệm
Tên biến tự giải thích — không cần comment
Comment = TẠI SAO, không phải CÁI GÌ
Ternary: chỉ 1 điều kiện, 2 nhánh đơn
Destructure: tối đa 2 cấp
Early return > Lồng if
for(let i) trong loop OK — "x", "n", "d" ngoài loop KHÔNG OK
Bitwise: chỉ rAF hot path + BẮT BUỘC comment

Ngoại lệ trong tài liệu agent-os-js:
  Ví dụ thuật toán dùng i, j, lo, hi — chuẩn industry
  AI viết production code phải đổi sang tên rõ nghĩa
```

---

## 🤖 Agent OS Anti-Rationalization

> [!CAUTION]
> **Tác tử AI ĐỌC KỸ TRƯỚC KHI CODE:**
>
> 1. **Cấm lười biếng viết chuỗi (Chaining):** Cấm biện minh "Dùng .map().filter() code ngắn hơn và đẹp hơn". Đẹp với máy nhưng giết chết bộ nhớ (GC). BẮT BUỘC dùng vòng lặp phẳng.
> 2. **Cấm viết tắt để tiết kiệm Token:** Cấm biện minh "Tên biến ngắn gọn (như `e`, `v`, `d`) để code bớt dài". Tên biến PHẢI tự giải thích (self-documenting).
> 3. **Cấm comment rác:** Cấm bình luận kiểu `// Duyệt qua mảng và nhân đôi` hoặc `// Render giao diện`. Chỉ được giải thích quyết định kỹ thuật: TẠI SAO làm vậy (VD: `// Zero GC: Dùng Map thay vì Object để tránh cấp phát`).
