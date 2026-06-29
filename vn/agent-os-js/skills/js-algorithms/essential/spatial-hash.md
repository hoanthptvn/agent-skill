---
name: spatial-hash
description: Kỹ năng Agent chuyên biệt về spatial-hash cho hệ thống JavaScript High-Performance.
---

# Hash Table — Bảng Băm

Hash Table = Array được "buff" bởi Toán học. Key-Value thay vì chỉ số số. O(1) lookup.

---

## Bản chất — Array ẩn + Hash Function

```
Tư duy:  Đổi Space (RAM) lấy Time (tốc độ)
Lookup:  Tìm theo tên/ID → Hash Table O(1)
         Tìm theo thứ tự/chỉ số → Array O(1)

Hash Function: "pink" → toán học → index 3 → array[3] = "#ff69b4"
Deterministic: cùng input → luôn cùng output (bất biến)
```

```javascript
class HashTable {
  constructor(size = 53) {
    // Kích thước NÊN là số nguyên tố
    this.keyMap = new Array(size);
  }

  _hash(key) {
    let total = 0;
    const PRIME = 31; // Số nguyên tố: phân bổ đều nhất
    const limit = Math.min(key.length, 100); // Giới hạn 100 ký tự → O(1) thay O(N)

    for (let i = 0; i < limit; i++) {
      const val = key.charCodeAt(i) - 96; // a=1, b=2...
      total = (total * PRIME + val) % this.keyMap.length; // % ép về [0, size-1]
    }
    return total;
  }
}
// Tại sao số nguyên tố? "Cô độc" → phép nhân*mod tạo phân bổ pseudo-random
// Bitwise nhanh hơn toán học: total * 31 ≡ (total << 5) - total (V8 Engine)
// KHÔNG dùng cho mật khẩu: Non-cryptographic → dễ bị Hash Collision DoS
```

---

## Separate Chaining — Xử lý Xung đột

```javascript
// Xung đột là tất yếu (Pigeonhole Principle): "salmon" và "darkblue" → cùng index 4
// Separate Chaining: mỗi ô = "giỏ" chứa nhiều cặp [key, value]
// Linear Probing: mỗi ô chỉ 1 giá trị, đụng thì chạy xuống ô kế

set(key, value) {
  const idx = this._hash(key);
  this.keyMap[idx] ??= []; // ES2021 Nullish Assignment — khởi tạo giỏ nếu chưa có

  const bucket = this.keyMap[idx];

  // BUG của Junior: push() mù quáng → cùng key xuất hiện 2 lần → get() luôn trả về cái cũ
  // FIX: kiểm tra nếu key đã có thì UPDATE thay vì push thêm
  for (let i = 0; i < bucket.length; i++) {
    if (bucket[i][0] === key) {
      bucket[i][1] = value; // Ghi đè
      return;
    }
  }
  bucket.push([key, value]); // Key mới → thêm vào giỏ
}

get(key) {
  const bucket = this.keyMap[this._hash(key)];
  if (bucket) {
    // for...of + Destructuring: đọc như văn xuôi, không dùng anonymous callback
    for (const [k, v] of bucket) {
      if (k === key) return v;
    }
  }
  return undefined;
}
// ✗ bucket.find(item => item[0] === key) → anonymous function → GC rác → tụt FPS
// ✓ for...of thuần túy → không sinh rác bộ nhớ
// Load Factor > 0.75 → JS Map tự Rehash (tạo mảng mới gấp đôi + chuyển dữ liệu)
```

---

## keys() + values() — O(N), không phải O(N²)

```javascript
keys() {
  const result = [];
  for (const bucket of this.keyMap) {
    if (bucket) {
      for (const [k] of bucket) result.push(k);
      // Nếu set() đúng (chặn duplicate), không cần check includes ở đây
    }
  }
  return result;
}

values() {
  const result = [];
  const seen   = new Set(); // O(1) lookup thay vì Array.includes() O(K)

  for (const bucket of this.keyMap) {
    if (bucket) {
      for (const [, v] of bucket) {
        if (!seen.has(v)) { seen.add(v); result.push(v); }
      }
    }
  }
  return result;
}

// ❌ BUG trong video gốc: arr.includes() bên trong 2 vòng lặp lồng nhau → O(N²)
// 10K items → 100M phép tính → Main Thread đóng băng
// ✓ Set.has() O(1) → tổng thể O(N) chuẩn

// Lazy Iterator của JS Map (không phải Array):
// map.keys() trả về Iterator, không phải Array → lazy evaluation → RAM O(1)
// [...map.values()] mới là Array → tạo toàn bộ copy trong RAM ngay lập tức
// ❌ Cấm gọi [...map.values()] trong requestAnimationFrame → GC Thrashing

// Khử trùng 1 dòng: const unique = [...new Set(duplicated)]
// Object.keys(obj) / Object.values(obj) / Object.entries(obj)
```

---

## Object {} vs Map — Khi nào dùng cái nào

```
Dùng Object ({}):
  Static keys — biết trước các trường (config, API payload)
  V8 Hidden Classes tối ưu object tĩnh cực nhanh
  switch/case → Object map: { success: 'check.svg', error: 'alert.svg' }

Dùng Map:
  Dynamic keys — key sinh ra từ server/user input
  Key không chỉ là String (có thể là DOM Node, Object, Number)
  Cần .size O(1) thay vì Object.keys().length O(N)
  Thêm/xóa key liên tục

Prototype Pollution risk với Object:
  user input key = "__proto__" hay "toString" → phá vỡ Object
  ✓ new Map() an toàn tuyệt đối, không có prototype

Set = Hash Table chỉ có Key (không có Value):
  Check membership O(1)
  Dedup: const unique = [...new Set(arr)]
  visited Set trong DFS/BFS (xem tree-traversal.md)

WeakMap — Hash Table tự dọn rác:
  Key PHẢI là Object (DOM Node)
  Khi DOM Node bị xóa → GC tự dọn entry trong WeakMap
  Lưu GSAP Timeline liên kết với DOM: weakmap.set(element, timeline)
  → Không bao giờ Memory Leak dù component unmount
```

---

## Design Patterns với Hash Table

```javascript
// 1. Data Normalization (State Management)
// ❌ Array: update user → array.map() O(N) mỗi lần
const users_array = [{ id: "u1", name: "A" }];

// ✓ Hash Map: update user → users['u1'].name O(1)
const users_map = { u1: { name: "A" } };
// Render list: Object.values(users_map).map(u => <UserCard />)

// 2. Caching / Memoization
const cache = new Map();
async function fetchUser(id) {
  if (cache.has(id)) return cache.get(id); // Hit: O(1), không gọi API
  const data = await api.getUser(id);
  cache.set(id, data);
  return data;
}

// 3. Khử switch/case
const statusConfig = {
  success: { icon: "check.svg", color: "#00ff00" },
  error: { icon: "alert.svg", color: "#ff0000" },
  pending: { icon: "spinner.svg", color: "#ffff00" },
};
const config = statusConfig[status]; // O(1) thay vì switch O(N)

// 4. String-to-Color (Avatar màu ngẫu nhiên nhưng deterministic)
function nameToColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = (hash << 5) - hash + name.charCodeAt(i);
  return `hsl(${Math.abs(hash) % 360}, 70%, 60%)`;
}
// "John" → luôn ra cùng màu (Deterministic) mà không cần lưu DB

// 5. Cache Busting (Webpack/Vite)
// main.[contenthash].js — Hash đọc nội dung code
// Code thay đổi → hash thay đổi → browser tải file mới (không dùng cache)
// Code giữ nguyên → hash giữ nguyên → browser dùng cache (không tốn network)
```

---

## Quick Reference

```
Big O:
  insert:  O(1) avg, O(N) worst (hàm băm tệ, mọi item vào cùng 1 bucket)
  delete:  O(1) avg
  lookup:  O(1) avg — đây là sức mạnh cốt lõi
  keys/values: O(M+N) — M = kích thước array nền, N = số phần tử thực

Space: O(N) — phải tạo dư chỗ trống (Sparse Array) để tránh collision

Hàm băm cốt lõi:
  Math.min(key.length, 100) → O(1) thay O(N)
  Prime multiplier (31) + Prime array size (53) → phân bổ đều
  total % arrayLen → luôn trong [0, size-1] (Vòng kim cô Modulo)

Collision Handling:
  Separate Chaining: mỗi bucket = Linked List hoặc Array
    set() phải UPDATE nếu key tồn tại (không push mù quáng)
    get() dùng for...of + Destructuring (không dùng .find() callback)
  Bucket > 8 items → Java HashMap tự chuyển sang Red-Black Tree O(log N)

WeakMap cho DOM:
  weakmap.set(domNode, gsapTimeline) → GC tự dọn khi node bị remove
  Không bao giờ Memory Leak

WebGL:
  Tuyệt đối không array.find() trong requestAnimationFrame
  Cache texture/geometry vào Map lúc Init → Map.get(id) khi render
  Spatial Hashing: hash(x,y,z) → grid index → check va chạm O(N) thay O(N²)
```

---

## 🤖 Agent OS Anti-Rationalization

> [!CAUTION]
> **Tác tử AI ĐỌC KỸ TRƯỚC KHI CODE:**
>
> 1. **Cấm lười biếng:** Không được dùng các hàm native `O(N)` (như `find`, `indexOf`, `filter`) khi dữ liệu có thể áp dụng thuật toán `O(log N)` hoặc `O(1)`.
> 2. **Cấm biện minh:** "Dữ liệu nhỏ nên dùng Array.sort() cho nhanh" là ngụy biện. Trong môi trường 60fps, vi phạm độ phức tạp thời gian sẽ dẫn đến Frame Drop.
> 3. **Không tạo rác (Zero GC):** Cấm khởi tạo Object/Array mới (`new Object`, `map`, `filter`) bên trong vòng lặp Render/Animation. Trọng tâm là tái sử dụng mảng phẳng (Parallel Arrays).
