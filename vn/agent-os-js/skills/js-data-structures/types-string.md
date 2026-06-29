---
name: types-string
description: Kỹ năng Agent chuyên biệt về cấu trúc dữ liệu types-string cho hệ thống JavaScript High-Performance.
---

# String — Methods & Performance

String trong JS là **immutable** (bất biến). Mọi thao tác đều tạo chuỗi MỚI trên Heap → GC phải dọn chuỗi cũ.

---

## DO — Nên dùng

```
str.charCodeAt(i)       → O(1)  ← So sánh số nguyên, nhanh nhất CPU
str.charAt(i) / str[i]  → O(1)  ← Truy cập ký tự theo index
str.length              → O(1)  ← Property, không phải hàm
str.includes(sub)       → O(N)  ← Native C++, nhanh hơn tự viết
str.indexOf(sub)        → O(N)  ← Trả về vị trí đầu tiên, -1 nếu không có
str.startsWith(prefix)  → O(M)  ← M = prefix length, thoát sớm
str.endsWith(suffix)    → O(M)  ← Kiểm tra đuôi file, extension
str.toLowerCase()       → O(N)  ← Tạo chuỗi mới, gọi 1 lần lưu biến
str.slice(start, end)   → O(K)  ← K = end - start, tạo chuỗi mới
str.padStart(len, ch)   → O(1)  ← Format số: '5'.padStart(2, '0') → '05'
str.repeat(n)           → O(N)  ← Tạo chuỗi lặp, VD border pattern
str.trim()              → O(N)  ← Xóa khoảng trắng đầu/cuối
str.replace(a, b)       → O(N)  ← Thay thế lần đầu tiên
str.replaceAll(a, b)    → O(N)  ← Thay thế toàn bộ (ES2021)
```

---

## DON'T — Không dùng trong hot path

```javascript
// ❌ str += trong vòng lặp → O(N²) Space — string immutable nên mỗi += tạo bản sao MỚI
let result = "";
for (let i = 0; i < 10000; i++) {
  result += "a"; // Cấp phát chuỗi mới mỗi vòng: 1, 2, 3... N ký tự
}
// ✓ Fix: push vào array, join 1 lần cuối
const parts = [];
for (let i = 0; i < 10000; i++) parts.push("a"); // O(1) amortized mỗi push
const result = parts.join(""); // 1 lần cấp phát duy nhất

// ❌ Regex trong rAF → V8 tạo State Machine nặng nề, chậm 55-80%
/[a-z0-9]/i.test(char); // KHÔNG trong requestAnimationFrame
// ✓ Fix: charCodeAt — so sánh số nguyên, thao tác nhanh nhất CPU có thể làm
function isAlphaNumeric(char) {
  const code = char.charCodeAt(0);
  return (
    (code > 47 && code < 58) || // '0'=48 ... '9'=57
    (code > 64 && code < 91) || // 'A'=65 ... 'Z'=90
    (code > 96 && code < 123)
  ); // 'a'=97 ... 'z'=122
}

// ❌ split('') với Emoji → Surrogate Pairs bị chẻ đôi
"Hi 🚀".split(""); // ['H','i',' ','�','�'] ← ký tự rác
// ✓ Fix: Array.from() hoặc for...of
Array.from("Hi 🚀"); // ['H','i',' ','🚀'] ← an toàn

// ❌ .slice() trong vòng lặp tìm kiếm → tạo string mới mỗi vòng → GC Thrashing
for (let i = 0; i < str.length; i++) {
  if (str.slice(i, i + pattern.length) === pattern) count++;
}
// ✓ Fix: i + j pointer — zero allocation
for (let j = 0; j < pattern.length; j++) {
  if (str[i + j] !== pattern[j]) {
    break;
  }
}
```

---

## for...of vs for(let i) — Unicode Safety

```javascript
// ❌ for(let i) CÓ THỂ cắt đôi Emoji (Surrogate Pairs)
const str = "Hello 🚀";
for (let i = 0; i < str.length; i++) {
  console.log(str[i]); // 🚀 bị tách thành 2 ký tự rác
}
// str.length = 8 (không phải 7 — Emoji chiếm 2 code units)

// ✓ for...of — Unicode-safe tuyệt đối
for (const char of str) {
  console.log(char); // 'H', 'e', 'l', 'l', 'o', ' ', '🚀'
}

// ✓ Array.from() khi cần index
const chars = Array.from(str); // ['H','e','l','l','o',' ','🚀']
chars.length; // 7 — đúng!

// '👨‍👩‍👧‍👦'.length === 11 → Family Emoji = 7 code points nối bằng ZWJ
// Rule: App toàn cầu → Array.from(string) trước khi đếm/duyệt ký tự
// Naive Search (ASCII only) → string[i] vẫn OK vì không có Surrogate
```

---

## Thực hành — Naive String Search

```javascript
/**
 * Tìm kiếm chuỗi con — O(N×M) worst | O(N) best | O(1) Space
 * Dùng cho: Find & Replace, Syntax Highlight, Profanity Filter
 */
const naiveStringSearch = (longStr, shortStr) => {
  if (!shortStr || shortStr.length > longStr.length) return 0; // Early Bailout

  let count = 0;
  const limit = longStr.length - shortStr.length; // Boundary Optimization

  for (let i = 0; i <= limit; i++) {
    let isMatch = true;
    for (let j = 0; j < shortStr.length; j++) {
      if (longStr[i + j] !== shortStr[j]) {
        // i+j look-ahead, zero allocation
        isMatch = false;
        break; // Fail-fast: thoát ngay khi sai
      }
    }
    if (isMatch) count++;
  }
  return count;
};

// Boundary Optimization:
//   longStr=10, shortStr=3 → limit=7, tiết kiệm 2 vòng lặp vô nghĩa
//   N=1,000,000, M=100 → tiết kiệm 99 × 1,000,000 phép tính thừa
```

### Production — Dùng Native C++ Engine

```javascript
// Native luôn nhanh hơn JS thuần 10-100× (C++ + SIMD instructions)
str.indexOf(pattern); // Vị trí đầu tiên
str.indexOf(pattern, fromIdx); // Tìm từ vị trí cụ thể
str.split(pattern).length - 1; // Đếm nhanh (tạo mảng tạm)
str.match(new RegExp(pattern, "g"))?.length ?? 0; // RegExp mạnh nhất

// Tự viết Naive Search khi:
//   Cần trả về tọa độ [start, end] mỗi match (cho <mark> highlight)
//   Cần case-insensitive unicode-safe tùy chỉnh
//   Học thuật toán / phỏng vấn

// Khi O(N×M) quá chậm (DNA, log file lớn):
//   KMP: O(N+M) — có trí nhớ, không lặp lại
//   Web Worker: đẩy sang background thread giữ 60fps
```

### charCount — Đếm ký tự (O(1) Space)

```javascript
// Space là O(1) vì bảng chữ cái EN + số = tối đa 36 keys
// Dù str dài 1 triệu ký tự → object tối đa 36 entries → HẰNG SỐ
function charCount(str) {
  const result = {};
  for (let char of str) {
    if (isAlphaNumeric(char)) {
      char = char.toLowerCase();
      result[char] = (result[char] || 0) + 1;
    }
  }
  return result;
}
```

---

## Quick Reference

```
O(1):  str[i], str.length, charCodeAt(i)
O(M):  startsWith, endsWith (M = prefix/suffix length)
O(N):  includes, indexOf, toLowerCase, slice, trim, replace, replaceAll, split
O(N²): str += trong vòng lặp ← TUYỆT ĐỐI TRÁNH

Unicode:
  for...of / Array.from()  → an toàn với Emoji
  for(let i) / str[i]      → chẻ Surrogate Pairs → ký tự rác
  '👨‍👩‍👧‍👦'.length === 11    → KHÔNG TIN .length cho Unicode

rAF hot path:
  ✓ charCodeAt() — so sánh số nguyên
  ✗ Regex — State Machine chậm 55-80%
  ✗ str += — O(N²) memory, GC spike
  ✗ .slice() trong loop — tạo string mới mỗi vòng
```

---

## 🤖 Agent OS Anti-Rationalization

> [!CAUTION]
> **Tác tử AI ĐỌC KỸ TRƯỚC KHI CODE:**
>
> 1. **Cấm lười biếng:** Không dùng Object `{}` để tra cứu (lookup) liên tục. BẮT BUỘC dùng `Map` hoặc `Set` để đạt `O(1)`.
> 2. **Cấm ngụy biện:** "Dùng Array.indexOf cho nhanh" là sai lầm khi mảng lớn. Phải đổi sang `Set.has()` nếu cần tìm kiếm nhiều lần.
> 3. **Tối đa hóa Typed Arrays:** Xử lý tọa độ (x, y, z) 3D hoặc WebGL bắt buộc dùng `Float32Array`. Cấm dùng Array thường để lưu số thực cường độ cao.
