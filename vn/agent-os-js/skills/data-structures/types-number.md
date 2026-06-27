---
name: types-number
description: Kỹ năng Agent chuyên biệt về cấu trúc dữ liệu types-number cho hệ thống JavaScript High-Performance.
---

# Number — Math, BigInt & Bitwise

JavaScript dùng IEEE 754 64-bit floating point cho mọi số. Ngưỡng an toàn: `Number.MAX_SAFE_INTEGER` = 2⁵³ - 1 ≈ 9 triệu tỷ.

---

## DO — Nên dùng

```
Math.floor(x)           → O(1)  ← Làm tròn xuống
Math.ceil(x)            → O(1)  ← Làm tròn lên
Math.round(x)           → O(1)  ← Làm tròn gần nhất
Math.min(a, b, ...)     → O(N)  ← N = số arguments (thường nhỏ → coi như O(1))
Math.max(a, b, ...)     → O(N)  ← Tương tự
Math.abs(x)             → O(1)  ← Giá trị tuyệt đối
Math.random()           → O(1)  ← [0, 1) — KHÔNG dùng cho crypto
Math.sqrt(x)            → O(1)  ← Căn bậc 2
Math.pow(x, y) / x**y   → O(1)  ← Lũy thừa
Math.PI                 → O(1)  ← 3.14159...
Math.sign(x)            → O(1)  ← Trả về -1, 0, hoặc 1
Math.trunc(x)           → O(1)  ← Cắt phần thập phân (không làm tròn)
parseInt(str, 10)       → O(1)  ← LUÔN truyền radix 10
parseFloat(str)         → O(1)  ← Parse chuỗi → số thực
Number.isFinite(x)      → O(1)  ← Kiểm tra không phải Infinity/NaN
Number.isNaN(x)         → O(1)  ← KHÔNG dùng global isNaN() (ép kiểu)
Number.isInteger(x)     → O(1)  ← Kiểm tra số nguyên
x.toFixed(2)            → O(1)  ← Format: (3.14159).toFixed(2) → '3.14'
```

---

## DON'T — Bẫy chí mạng

```javascript
// ❌ Floating Point: 0.1 + 0.2 ≠ 0.3
console.log(0.1 + 0.2 === 0.3); // false → 0.30000000000000004
// ✓ Fix 1: Nhân 100 → tính bằng cents → chia 100
const total = Math.round((0.1 + 0.2) * 100) / 100; // 0.3
// ✓ Fix 2: So sánh epsilon
Math.abs(a - b) < Number.EPSILON; // Đủ gần = bằng nhau

// ❌ parseInt() không có radix → hành vi bất ngờ
parseInt('08');     // 8 (OK hiện tại, nhưng ES3 parse octal → 0)
parseInt('0xFF');   // 255 (parse hex tự động)
// ✓ Luôn truyền radix
parseInt('08', 10); // 8 — tường minh, an toàn

// ❌ NaN === NaN → LUÔN false
NaN === NaN; // false ← JavaScript quirk
// ✓ Dùng Number.isNaN() (KHÔNG dùng global isNaN)
Number.isNaN(NaN);        // true
Number.isNaN('hello');    // false (đúng)
isNaN('hello');           // true (SAI — ép kiểu trước)

// ❌ Number.MAX_SAFE_INTEGER overflow
10000000000 * 10000000000; // 100000000000000000000 → mất precision
// ✓ Dùng BigInt cho số lớn
10000000000n * 10000000000n; // 100000000000000000000n → chính xác

// ❌ BigInt + Number = TypeError
1n + 1; // TypeError: Cannot mix BigInt and other types
// ✓ Ép kiểu tường minh
1n + BigInt(1); // 2n
Number(1n) + 1; // 2 (mất precision nếu BigInt lớn)
```

---

## Bitwise Operators — Hardware Speed

```javascript
// >> 1 = Math.floor(x / 2) — nhanh hơn ở cấp phần cứng
// << 1 = x * 2
// | 0  = Math.trunc(x) — cắt phần thập phân

// Binary Heap parent/child index:
const parentIdx     = (idx - 1) >> 1;   // ≡ Math.floor((idx-1) / 2)
const leftChildIdx  = (idx << 1) + 1;   // ≡ 2*idx + 1
const rightChildIdx = (idx << 1) + 2;   // ≡ 2*idx + 2

// Binary Search midpoint:
const mid = (lo + hi) >>> 1; // unsigned right shift, an toàn cho số dương

// ⚠️ CẢNH BÁO: Bitwise ép 32-bit signed integer
// Nếu x > 2,147,483,647 → lật bit → số âm → bug
// Frontend: mảng > 2.1 tỷ = không thực tế → >> 1 an toàn
// Backend/Interview: dùng Math.floor() cho an toàn tuyệt đối

// RGB Color manipulation:
const r = (color >> 16) & 0xFF; // Extract red channel
const g = (color >> 8) & 0xFF;  // Extract green channel
const b = color & 0xFF;         // Extract blue channel
```

---

## Infinity & NaN — Sentinel Values

```javascript
// Infinity — dùng cho khởi tạo min/max (Dijkstra, DP)
let minVal = Infinity;   // Bất kỳ số nào cũng < Infinity
let maxVal = -Infinity;  // Bất kỳ số nào cũng > -Infinity

Infinity + 10;       // Infinity — không bao giờ sai logic
10 / 0;              // Infinity
-10 / 0;             // -Infinity
Number.isFinite(x);  // Kiểm tra trước khi dùng

// NaN — "Not a Number" nhưng typeof NaN === 'number' 🤯
0 / 0;               // NaN
parseInt('abc');      // NaN
Math.sqrt(-1);        // NaN

// NaN lây nhiễm: NaN + bất kỳ = NaN → Silent Bug
// ✓ Kiểm tra đầu vào trước khi tính toán
if (Number.isNaN(input)) throw new Error('Invalid number');
```

---

## Thực hành — Animation & Frontend

```javascript
// LERP — Linear Interpolation (công thức animation cốt lõi)
// current + (target - current) * factor
function lerp(current, target, factor) {
  return current + (target - current) * factor;
}
// factor = 0.1 → smooth (mouse follow), 0.8 → snappy (UI response)

// Clamping — giới hạn giá trị trong khoảng
function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}
// opacity = clamp(scrollProgress, 0, 1);

// Map Range — chuyển đổi khoảng giá trị
function mapRange(val, inMin, inMax, outMin, outMax) {
  return outMin + ((val - inMin) / (inMax - inMin)) * (outMax - outMin);
}
// scrollY [0, 1000] → opacity [0, 1]
// mapRange(scrollY, 0, 1000, 0, 1);

// Random trong khoảng [min, max]
function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

// Gauss formula — O(1) thay O(N) loop
const sumTo = (n) => n * (n + 1) / 2;
// ⚠️ N > √(MAX_SAFE_INTEGER) ≈ 94,906,265 → dùng BigInt
const sumToBig = (n) => { const b = BigInt(n); return (b * (b + 1n)) / 2n; };
```

---

## Quick Reference

```
O(1): Math.floor/ceil/round/abs/sqrt/sign/trunc, charCodeAt, toFixed
O(1): parseInt(str, 10), parseFloat(str), Number.isNaN/isFinite/isInteger

Bẫy:
  0.1 + 0.2 ≠ 0.3           → nhân 100, tính cents, chia 100
  parseInt() thiếu radix     → luôn truyền 10
  NaN === NaN → false        → dùng Number.isNaN()
  N * N > MAX_SAFE_INTEGER   → dùng BigInt(n)
  BigInt + Number            → TypeError, phải ép kiểu

Bitwise (nhanh hơn Math.*):
  >> 1   = chia 2 làm tròn xuống (32-bit limit)
  << 1   = nhân 2
  | 0    = Math.trunc()
  >>> 1  = unsigned shift (midpoint an toàn)
  & 0xFF = extract byte (RGB color)

Sentinel Values:
  Infinity  = khởi tạo distances (Dijkstra), min/max search
  -Infinity = khởi tạo max search
  NaN       = kiểm tra đầu vào, lây nhiễm Silent Bug

Animation:
  lerp(current, target, factor) = smooth motion
  clamp(val, 0, 1) = giới hạn opacity/progress
  mapRange() = scroll position → animation value
```


---

## 🤖 Agent OS Anti-Rationalization

> [!CAUTION]
> **Tác tử AI ĐỌC KỸ TRƯỚC KHI CODE:**
> 1. **Cấm lười biếng:** Không dùng Object `{}` để tra cứu (lookup) liên tục. BẮT BUỘC dùng `Map` hoặc `Set` để đạt `O(1)`.
> 2. **Cấm ngụy biện:** "Dùng Array.indexOf cho nhanh" là sai lầm khi mảng lớn. Phải đổi sang `Set.has()` nếu cần tìm kiếm nhiều lần.
> 3. **Tối đa hóa Typed Arrays:** Xử lý tọa độ (x, y, z) 3D hoặc WebGL bắt buộc dùng `Float32Array`. Cấm dùng Array thường để lưu số thực cường độ cao.
