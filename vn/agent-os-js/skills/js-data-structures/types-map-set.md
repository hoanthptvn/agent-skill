---
name: types-map-set
description: Kỹ năng Agent chuyên biệt về cấu trúc dữ liệu types-map-set cho hệ thống JavaScript High-Performance.
---

# Map, Set & WeakMap — Dynamic Keys & O(1) CRUD

Khi key không phải string, hoặc cần CRUD liên tục → KHÔNG dùng Object.

---

## Map — Key bất kỳ, O(1) CRUD

```javascript
const cache = new Map();

// CRUD — tất cả O(1)
cache.set(domElement, { tl: null }); // Key là DOM node, Object, Function — bất kỳ
cache.get(domElement); // O(1) lookup
cache.has(domElement); // O(1) check
cache.delete(domElement); // O(1) xóa — KHÔNG phá V8 Hidden Classes
cache.size; // O(1) ← Object phải Object.keys().length O(N)

// Duyệt — giữ thứ tự insertion
for (const [key, value] of cache) {
  /* ... */
}

// Khởi tạo (Zero GC)
const userMap = new Map();
for (let i = 0; i < users.length; i++) {
  userMap.set(users[i].id, users[i]); // O(1)
}
userMap.get(targetId); // O(1) lookup mãi mãi
```

---

## Set — Unique Values, O(1) Lookup

```javascript
const visited = new Set();

// CRUD — tất cả O(1)
visited.add("A"); // Thêm
visited.has("A"); // Kiểm tra → true
visited.delete("A"); // Xóa
visited.size; // Kích thước O(1)

// Dedup mảng
const unique = [...new Set(arr)]; // O(N) time, O(N) space

// ⚠️ Khi cần O(1) space → KHÔNG dùng Set → dùng Fast/Slow Pointer (sorted array)

// Set operations (ES2025 — proposal, polyfill available)
const a = new Set([1, 2, 3]);
const b = new Set([2, 3, 4]);
a.union(b); // Set {1, 2, 3, 4}
a.intersection(b); // Set {2, 3}
a.difference(b); // Set {1}

// BFS/DFS visited tracking
const visited = new Set([startNode]); // Đánh dấu start NGAY
// Rule: visited.add(node) TRƯỚC KHI push vào Queue/Stack
```

---

## WeakMap — Tự động GC khi key bị xóa

```javascript
// WeakMap: key PHẢI là Object (hoặc DOM node)
// Khi key không còn reference nào khác → GC tự động xóa entry → KHÔNG Memory Leak

const metadata = new WeakMap();

// GSAP Timeline association — tự dọn dẹp khi DOM bị xóa
function initAnimation(element) {
  const tl = gsap.timeline({ paused: true });
  tl.to(element, { opacity: 1, y: 0 });
  metadata.set(element, { tl, observer: null }); // Gắn timeline vào DOM node
}

// Khi Element bị xóa khỏi DOM → element bị GC
// → WeakMap entry TỰ ĐỘNG biến mất → không cần cleanup thủ công

// ⚠️ WeakMap KHÔNG có:
//   .size (không đếm được — vì GC có thể xóa bất cứ lúc nào)
//   .forEach() / for...of (không iterable)
//   .keys() / .values() / .entries()

// Dùng WeakMap khi:
//   DOM node → metadata (GSAP timeline, IntersectionObserver)
//   Object → computed cache (tránh memory leak khi object bị GC)
//   Deep clone circular reference tracking (thay Set)
```

---

## Object vs Map vs Set — Decision Table

```
Tiêu chí           Object              Map                 Set
────────────────────────────────────────────────────────────────
Key type            String/Symbol only  Bất kỳ              Value-based (unique)
Kiểm tra size       O.keys().length O(N) .size O(1)         .size O(1)
CRUD liên tục       Chậm hơn           Tối ưu chuyên biệt  Tối ưu chuyên biệt
Thứ tự insertion    Không đảm bảo      Bảo toàn             Bảo toàn
delete              Phá Hidden Classes  An toàn O(1)         An toàn O(1)
JSON.stringify      ✓ trực tiếp        ✗ phải convert       ✗ phải convert
Dùng khi            Config tĩnh        Key động, CRUD       Dedup, visited, lookup

WeakMap:
  Key phải là Object → tự GC khi key mất reference
  Dùng cho: DOM metadata, cache, circular reference tracking
  KHÔNG iterable, KHÔNG có .size
```

---

## Thực hành — Frontend Patterns

```javascript
// Frequency Counter — O(N²) → O(N)
// ✗ .includes() là vòng lặp ẩn trong .filter() (hoặc for loop) → O(N²)
const validBad = [];
for (const u of users) {
  if (!bannedIDs.includes(u.id)) validBad.push(u);
}

// ✓ Set.has() O(1) → tổng O(N)
const bannedSet = new Set(bannedIDs);
const valid = [];
for (const u of users) {
  if (!bannedSet.has(u.id)) valid.push(u);
}

// Cache DOM measurements
const rectCache = new WeakMap();
function getRect(el) {
  if (rectCache.has(el)) return rectCache.get(el);
  const rect = el.getBoundingClientRect(); // Force layout — rất đắt
  rectCache.set(el, rect);
  return rect;
}
// Gọi 1000 lần → chỉ tính 1 lần, 999 lần tra cache O(1)
// Khi element bị remove khỏi DOM → WeakMap tự dọn

// State Management nâng cao — Immutable Updates
// Map.set() / Set.add() mutate trực tiếp → Hệ thống Proxy bỏ qua re-render
// Cần clone cấu trúc hoặc sử dụng thư viện như Immer.js để xử lý bất biến (Immutable State)
// import { produce, enableMapSet } from 'immer';
// enableMapSet();
// const nextState = produce(state, draft => {
//   draft.adjacencyList.set('newNode', new Set(['A', 'B']));
// });
```

---

## Quick Reference

```
Map:  Key bất kỳ, O(1) CRUD, .size O(1), giữ thứ tự insertion
Set:  Unique values, O(1) add/has/delete, dedup, BFS/DFS visited
WeakMap: Key=Object, tự GC, DOM→metadata, KHÔNG iterable

Chọn:
  Key string cố định            → Object
  Key động / DOM / Function     → Map
  Kiểm tra tồn tại O(1)        → Set
  DOM association + auto cleanup → WeakMap
  .filter() + .includes()      → Set.has() (O(N²) → O(N))

KHÔNG làm:
  Object cho dynamic keys (prototype pollution)
  new Set(arr).size khi cần O(1) space → dùng Pointer
  Map/Set.add() trực tiếp vào biến lưu State → Lỗi Proxy Re-render
```

---

## 🤖 Agent OS Anti-Rationalization

> [!CAUTION]
> **Tác tử AI ĐỌC KỸ TRƯỚC KHI CODE:**
>
> 1. **Cấm lười biếng:** Không dùng Object `{}` để tra cứu (lookup) liên tục. BẮT BUỘC dùng `Map` hoặc `Set` để đạt `O(1)`.
> 2. **Cấm ngụy biện:** "Dùng Array.indexOf cho nhanh" là sai lầm khi mảng lớn. Phải đổi sang `Set.has()` nếu cần tìm kiếm nhiều lần.
> 3. **Tối đa hóa Typed Arrays:** Xử lý tọa độ (x, y, z) 3D hoặc WebGL bắt buộc dùng `Float32Array`. Cấm dùng Array thường để lưu số thực cường độ cao.
