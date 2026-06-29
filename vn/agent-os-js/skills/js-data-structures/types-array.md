---
name: types-array
description: Kỹ năng Agent chuyên biệt về cấu trúc dữ liệu types-array cho hệ thống JavaScript High-Performance.
---

# Array — Big O & TypedArray

Danh sách có thứ tự (Ordered), cấp phát trên dải bộ nhớ liên tục, quản lý bằng Index.

---

## DO — Methods O(1) (Tốc độ ánh sáng)

```
arr[index]              → O(1)  ← Tính thẳng địa chỉ = base + index×size
arr.push(item)          → O(1)  ← Thêm vào ô nhớ kế tiếp ở đuôi (amortized)
arr.pop()               → O(1)  ← Giảm length, không dời gì cả
arr.length              → O(1)  ← Property, không phải hàm
arr.at(-1)              → O(1)  ← ES2022, truy cập phần tử cuối (thay arr[arr.length-1])
```

## CẢNH BÁO — Methods O(N) (Thận trọng)

```
arr.unshift(item)       → O(N)  ← CASCADE: toàn bộ phần tử lùi 1 index
arr.shift()             → O(N)  ← CASCADE: toàn bộ phần tử tiến 1 index
arr.splice(i, n)        → O(N)  ← Re-index từ vị trí i đến cuối
arr.slice(a, b)         → O(K)  ← Copy K phần tử sang vùng RAM mới
arr.concat(arr2)        → O(N)  ← Copy toàn bộ phần tử
arr.indexOf(val)        → O(N)  ← Duyệt từng phần tử
arr.includes(val)       → O(N)  ← Duyệt từng phần tử
arr.find(fn)            → O(N)  ← Worst case duyệt đến cuối
arr.findIndex(fn)       → O(N)  ← Tương tự find
arr.forEach(fn)         → O(N)  ← Duyệt mọi phần tử + closure mỗi vòng
arr.map(fn)             → O(N)  ← Duyệt + tạo mảng MỚI O(N) Space
arr.filter(fn)          → O(N)  ← Duyệt + tạo mảng MỚI O(N) Space
arr.reduce(fn)          → O(N)  ← Duyệt mọi phần tử
arr.flat(depth)         → O(N)  ← Flatten mảng lồng
arr.sort()              → O(N log N) ← Timsort (V8), MUTATE mảng gốc!
```

## ES2023 Immutable — Không mutate mảng gốc

```javascript
arr.toSorted((a, b) => a - b); // Trả về mảng MỚI đã sort, gốc không đổi
arr.toReversed(); // Trả về mảng MỚI đảo ngược
arr.toSpliced(1, 1, "new"); // Trả về mảng MỚI đã splice
arr.with(2, "new"); // Trả về mảng MỚI, thay phần tử tại index 2

// ⚠️ .sort() KHÔNG truyền comparator → sort theo Unicode string
[6, 4, 15, 10].sort(); // [10, 15, 4, 6] ← SAI!
[6, 4, 15, 10].sort((a, b) => a - b); // [4, 6, 10, 15] ← ĐÚNG

// Multi-criteria sort
items.toSorted((a, b) => a.age - b.age || a.name.localeCompare(b.name, "vi"));
```

---

## DON'T — Bẫy chí mạng

```javascript
// ❌ delete arr[i] → Holey Array → V8 hủy mọi tối ưu hóa
const arr = ["A", "B", "C", "D"];
delete arr[0]; // [empty, 'B', 'C', 'D'] ← V8 giáng cấp → Dictionary Mode → chậm 10-100×
// ✓ Fix: shift(), splice(), hoặc Swap-and-Pop

// ❌ .filter().map() chain → O(3N) + 2 mảng rác → GC spike
const result = data.filter((x) => x.active).map((x) => x.value * 2);
// ✓ Fix: Single pass
const result = [];
for (const x of data) {
  if (x.active) result.push(x.value * 2);
}

// ❌ [...result, item] trong vòng lặp → O(N²) — Spread là O(N), lồng trong loop
let result = [];
for (let i = 0; i < n; i++) result = [...result, arr[i]]; // Copy toàn bộ mỗi vòng
// ✓ Fix: push() là O(1) amortized
const result = [];
for (let i = 0; i < n; i++) result.push(arr[i]);

// ❌ unshift() cho danh sách tin nhắn
messages.unshift(newMessage); // O(N) — 100K tin nhắn = 100K re-index
// ✓ Fix: push() + CSS reverse
messages.push(newMessage);
// CSS: .message-list { display: flex; flex-direction: column-reverse; }
```

---

## Swap-and-Pop — O(1) xóa phần tử giữa mảng

Khi **thứ tự không quan trọng** (particle system, danh sách ID ngẫu nhiên):

```javascript
// ✗ splice → O(N) re-index
items.splice(targetIndex, 1);

// ✓ Swap-and-Pop → O(1)
items[targetIndex] = items[items.length - 1]; // Đè bằng phần tử cuối
items.pop(); // Pop cuối O(1)

// Particle System 60fps:
// ✗ particles.splice(idx, 1)  → O(N) × 60/giây = sụp FPS
// ✓ particles[idx] = particles[particles.length-1]; particles.pop(); → 60fps ổn định
```

---

## Normalization — Array → Object/Map lookup O(1)

```javascript
// ✗ Tư duy Junior — O(N) mỗi lần tìm kiếm
const found = products.find((p) => p.id === 8888); // Duyệt đến khi gặp

// ✓ Tư duy Senior — Normalize 1 lần O(N), lookup mãi mãi O(1)
const productsMap = {};
for (const p of products) productsMap[p.id] = p; // O(N) một lần
const found = productsMap[8888]; // O(1) — tức thì

// Immutable State update (Proxy-based):
// ✗ state.users.map(u => u.id === id ? {...u, name} : u)  → O(N) mỗi update
// ✓ state.usersMap[id] = {...state.usersMap[id], name}    → O(1)
```

---

## Holey Array — V8 Anti-pattern

```javascript
// V8 phân loại Array thành 2 dạng:
//   PACKED_ELEMENTS — liên tục, tối ưu C++ struct → nhanh
//   HOLEY_ELEMENTS  — có lỗ hổng, Dictionary mode → chậm 10-100×

// Tạo Holey Array:
delete arr[0]; // ❌ → empty slot
new Array(100); // ❌ → 100 empty slots
const a = [];
a[99] = 1; // ❌ → 99 empty slots

// Tạo Packed Array:
Array.from({ length: 100 }, () => 0); // ✓
new Array(100).fill(0); // ✓
[...Array(100)].map((_, i) => i); // ✓ (nhưng tạo 2 mảng tạm)
```

---

## TypedArray — Float32Array, Uint32Array

Mảng số cố định kiểu, CPU Cache-friendly, zero GC. Dùng cho WebGL vertex, particle positions, DP tabulation.

> → Xem chi tiết: `types/types-typed-array.md` (STRIDE pattern, ArrayBuffer, Transferable, Audio API)

---

## Quick Reference

```
"Định luật Đầu-Đuôi":
  Đuôi (push, pop)                → O(1) ← Tốc độ ánh sáng
  Đầu/Giữa (shift, unshift, splice) → O(N) ← Thảm họa khi N lớn

Xóa phần tử:
  Cần giữ thứ tự → splice O(N)
  Không cần thứ tự → Swap-and-Pop O(1) ← Particle System

Tìm kiếm:
  1 lần          → arr.indexOf() O(N) native C++
  Nhiều lần      → Normalize thành Map/Object → O(1) lookup

Immutable (ES2023):
  toSorted(), toReversed(), toSpliced(), with() ← không mutate gốc

TUYỆT ĐỐI TRÁNH:
  delete arr[i]           → Holey Array → chậm 100×
  [...result, x] trong loop → O(N²) Space
  .filter().map() chain   → 2 mảng rác → GC spike
  .sort() thiếu comparator → sort theo string → SAI
```

---

## 🤖 Agent OS Anti-Rationalization

> [!CAUTION]
> **Tác tử AI ĐỌC KỸ TRƯỚC KHI CODE:**
>
> 1. **Cấm lười biếng:** Không dùng Object `{}` để tra cứu (lookup) liên tục. BẮT BUỘC dùng `Map` hoặc `Set` để đạt `O(1)`.
> 2. **Cấm ngụy biện:** "Dùng Array.indexOf cho nhanh" là sai lầm khi mảng lớn. Phải đổi sang `Set.has()` nếu cần tìm kiếm nhiều lần.
> 3. **Tối đa hóa Typed Arrays:** Xử lý tọa độ (x, y, z) 3D hoặc WebGL bắt buộc dùng `Float32Array`. Cấm dùng Array thường để lưu số thực cường độ cao.
