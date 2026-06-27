---
name: frequency-counter
description: Kỹ năng Agent chuyên biệt về frequency-counter cho hệ thống JavaScript High-Performance.
---

# Frequency Counter — O(N²) → O(N)

"Dùng RAM để mua tốc độ" — tốn thêm O(N) Space để đổi lấy O(1) lookup.

Dùng khi: "Đếm, Tần suất, Tìm trùng lặp, Chỉ xuất hiện 1 lần"

---

## Document — Bản chất

```
Thay vì lặp lồng nhau (vòng ngoài × vòng trong = O(N²)),
tạo Map/Set/Object đếm tần suất TRƯỚC → tra cứu O(1) sau.

Pattern nhập/xuất kho:
  Chuỗi 1: lặp qua → cộng dồn vào Map (nhập kho)
  Chuỗi 2: lặp qua → trừ dần từ Map (xuất kho)
  Kết quả: nếu Map còn 0 → match, còn dương/âm → mismatch

Cú pháp vàng:
  obj[key] = (obj[key] || 0) + 1   ← ghi nhớ suốt đời
  obj[key] = (obj[key] ?? 0) + 1   ← ES2020 Nullish (chính xác hơn khi key=0)
```

---

## Thực hành — sameSquared

```javascript
// ✗ O(N²) — .includes() là vòng lặp ẩn bên trong vòng lặp ngoài
function sameSquaredNaive(arr1, arr2) {
  for (const val of arr1) {
    if (!arr2.includes(val ** 2)) return false; // O(N) hidden!
    arr2.splice(arr2.indexOf(val ** 2), 1);
  }
  return true;
}

// ✓ O(N) — Frequency Counter
function sameSquared(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  const freq1 = new Map();
  const freq2 = new Map();
  for (const val of arr1) freq1.set(val, (freq1.get(val) || 0) + 1);
  for (const val of arr2) freq2.set(val, (freq2.get(val) || 0) + 1);
  for (const [key, count] of freq1) {
    if (freq2.get(key ** 2) !== count) return false;
  }
  return true;
}
```

### validAnagram — 1 Object trick (50% ít RAM)

```javascript
function validAnagram(str1, str2) {
  if (str1.length !== str2.length) return false;
  const lookup = {};
  for (const char of str1) lookup[char] = (lookup[char] || 0) + 1; // Nhập kho
  for (const char of str2) {
    if (!lookup[char]) return false; // !undefined hoặc !0 → false → mismatch
    lookup[char] -= 1;               // Xuất kho
  }
  return true;
}
// ✗ AI hay dùng: str1.split('').sort().join('') === str2... → O(N log N)
// ✗ AI one-liner: split → filter → includes chain → 3 mảng tạm O(N) Space × 3
```

### areThereDuplicates & findAllDuplicates

```javascript
function areThereDuplicates(...args) {
  return new Set(args).size !== args.length; // O(N) Time, O(N) Space
}

function findAllDuplicates(arr) {
  const freq = new Map();
  const result = [];
  for (const val of arr) freq.set(val, (freq.get(val) || 0) + 1);
  for (const [key, count] of freq) { if (count === 2) result.push(key); }
  return result;
}
```

### Faceted Search — 10,000 sản phẩm

```javascript
function buildFacets(products) {
  const facets = { size: {}, color: {}, brand: {} };
  for (const p of products) {
    facets.size[p.size]   = (facets.size[p.size] || 0) + 1;
    facets.color[p.color] = (facets.color[p.color] || 0) + 1;
    facets.brand[p.brand] = (facets.brand[p.brand] || 0) + 1;
  }
  return facets; // Sidebar filter count O(1) per facet
}
```

---

## Frontend Use Cases

```
Virtual DOM Diffing — data-key attribute → HashMap → O(1) diff thay O(N)
Client-side Sidebar Filter — gom nhóm 10K objects theo category
Autocomplete — Frequency sort theo lượt dùng
.includes() trong .filter() → O(N²) → Set.has() → O(N)
```

---

## Quick Reference

```
Time:  O(N) — 2-3 vòng lặp nối tiếp = O(2N) → O(N)
Space: O(N) — Map/Object lưu tần suất

Nhận diện:
  "Đếm" / "Tần suất" / "Trùng lặp" / "Anagram" → Frequency Counter

⚠️ GC Warning:
  new Map() bên trong rAF → tạo rác mỗi frame → GC Pause → Jank
  ✓ Khởi tạo Map 1 lần ở init, .clear() để tái sử dụng
```

---

## 🤖 Agent OS Anti-Rationalization

> [!CAUTION]
> **Tác tử AI ĐỌC KỸ TRƯỚC KHI CODE:**
> 1. **Cấm lười biếng:** Không được dùng các hàm native `O(N)` (như `find`, `indexOf`, `filter`) khi dữ liệu có thể áp dụng thuật toán `O(log N)` hoặc `O(1)`.
> 2. **Cấm biện minh:** "Dữ liệu nhỏ nên dùng Array.sort() cho nhanh" là ngụy biện. Trong môi trường 60fps, vi phạm độ phức tạp thời gian sẽ dẫn đến Frame Drop.
> 3. **Không tạo rác (Zero GC):** Cấm khởi tạo Object/Array mới (`new Object`, `map`, `filter`) bên trong vòng lặp Render/Animation. Trọng tâm là tái sử dụng mảng phẳng (Parallel Arrays).
