---
name: js-optimization
description: JavaScript optimization patterns cho frontend production — dispatch table chọn thuật toán, V8 engine rules, rAF 60fps contract, anti-pattern detection. Use when choosing loop/algorithm, optimizing hot path, debugging jank/GC, hoặc review code JS performance. Tham chiếu chi tiết → references/
---

# JS Optimization — Chọn đúng Pattern, Code đúng lần đầu

## Overview

Bộ quy tắc tối ưu JavaScript cho frontend production (GSAP, Three.js, Lenis, Awwwards). Bốn nguyên tắc:
1. **Dispatch Table** — nhìn bài toán → map ra thuật toán đúng O(N) thay O(N²)
2. **V8 Engine Rules** — viết code theo cách V8 JIT optimize, không de-opt
3. **rAF Contract** — giữ frame budget ≤ 4ms JavaScript, 0 allocation trong hot path
4. **Code Style** — viết cho CON NGƯỜI đọc hiểu, không viết ngắn gọn quá mức → `references/code-style.md`

---

## Dispatch Table — Nhìn bài toán → Chọn pattern

```
"Đếm / Tần suất / Gom nhóm"     → Frequency Counter (Map)          O(N)
"Sorted + Tìm cặp / Range"       → Multiple Pointers                O(N), O(1) space
"Xóa trùng tại chỗ / TypedArray" → Fast/Slow Pointers (in-place)   O(N), O(1) space
"Mảng con liên tiếp / Window"    → Sliding Window                   O(N), O(1) space
"Sorted + Tìm kiếm / Offset"     → Binary Search                    O(log N)
"Cây / JSON sâu / DOM"           → Recursion + Accumulator          O(N)
"translateY / Stagger delay"     → DP Rolling Vars                  O(N)
"Chuỗi con / Highlight"          → Naive String Search              O(N*M) small M
"WebSocket live / Nearly sorted" → Insertion Sort                   O(N) best case
"Infinite scroll / Merge feeds"  → Merge Helper                     O(N+M)
"Grid ripple / Scene graph"      → Graph DFS/BFS                    O(V+E)
```

---

## V8 Engine Gotchas

| Anti-pattern | Vấn đề | Fix |
|---|---|---|
| `arguments` keyword | V8 de-optimization | `...args` rest params |
| `delete obj[key]` | Phá Hidden Classes | `obj[key] = undefined` hoặc `Map.delete()` |
| `.filter().map().reduce()` chain | O(3N) + 2 temp arrays | Single `for` loop |
| `arr.sort()` không comparator | Sort theo string → sai | Luôn truyền `(a,b) => a-b` |
| `new Set(arr).size` khi cần O(1) space | O(N) memory | Fast/Slow Pointer in-place |
| Regex trong rAF | State Machine nặng 55-80% chậm hơn | `charCodeAt(0)` range check |
| Thêm property sau constructor | Phá Hidden Class → de-opt | Khai báo đầy đủ từ đầu |
| `delete arr[i]` | Holey Array → chậm 100× | Swap-and-Pop hoặc splice |

---

## AI Mistakes — Bảng tổng hợp

| Tình huống | AI hay làm | Đúng phải làm |
|---|---|---|
| Loop trong loop | `arr1.forEach(x => arr2.includes(x))` O(N²) | `new Set(arr2)` → O(N) |
| Tìm kiếm sorted | `.find()` O(N) | Binary Search O(log N) |
| DOM list render | Re-render toàn bộ | Virtual Scroll (chỉ viewport) |
| Dedup array | `[...new Set(arr)]` | Fast/Slow pointer in-place nếu cần O(1) space |
| Sort + render | `.sort()` mutate state | `.toSorted()` immutable |
| Per-frame alloc | `new Object()` trong rAF | Object Pool |
| Regex trong rAF | `/[a-z]/i.test(char)` | `charCodeAt(0)` range check |
| Read-Write xen kẽ | `getRect()` rồi `style=` trong loop | Batch reads → Batch writes |
| Chain methods | `.filter().map().reduce()` | Single `for` loop |

---

## Tham chiếu chi tiết

> Xem `CLAUDE.md` để biết cách AI agent đọc đúng file theo context.

### Phase 1 — Kiểu dữ liệu (`references/types/`)

| File | Nội dung |
|---|---|
| `types/types-string.md` | charCodeAt vs Regex, for...of Unicode, concat trap O(N²), Naive String Search |
| `types/types-number.md` | BigInt, Infinity, bitwise >>1 <<1, floating point, Math.*, LERP/clamp |
| `types/types-array.md` | Big O Đầu/Đuôi, Swap-and-Pop, Holey Array, TypedArray, ES2023 toSorted() |
| `types/types-object.md` | V8 Hidden Classes, delete pitfall, Dispatch Table, Normalization, isEmpty O(1) |
| `types/types-map-set.md` | Map vs Set vs WeakMap, O(1) CRUD, DOM association, decision table |
| `types/types-typed-array.md` | Float32Array/Uint32Array, STRIDE pattern, WebGL buffer, Audio API, Transferable |

### Phase 2 — Vòng lặp (`references/loops/`)

| File | Nội dung |
|---|---|
| `loops/loops.md` | for/for...of/while/forEach/.map chain, rAF Frame Budget ≤ 4ms, DO NOT list, Batch DOM, Cleanup/Destroy |

### Code Style — Quy tắc viết code (`references/code-style.md`)

| File | Nội dung |
|---|---|
| `code-style.md` | Đặt tên biến/hàm, comment WHY not WHAT, ternary rules, destructure depth, early return, ví dụ trước/sau |

### Phase 3 — Thuật toán (`references/algorithms/`)

> ⭐ **Đọc trước**: `algorithms/gsap-algorithm-guide.md` — map từng algorithm → khi nào dùng với GSAP, khi nào không cần.

#### Essential (`algorithms/essential/`)

| File | Nội dung | Hiệu ứng thực chiến |
|---|---|---|
| `essential/animation-loop.md` | rAF, LERP, Object Pool, TypedArray | Particle system, smooth loop |
| `essential/binary-search.md` | Binary Search O(log N) | Virtual Scroll, GSAP timeline scrub |
| `essential/sliding-window.md` | Sliding Window | Scroll skew/tilt, FPS monitor |
| `essential/flip-sort.md` | .sort() + FLIP Animation | Card sort, Live feed sort |
| `essential/frequency-counter.md` | Frequency Counter + Map | Filter UI, Tag cloud, Faceted search |
| `essential/graph-bfs-dfs.md` | Graph BFS/DFS | Ripple wave, Scene traverse, Stagger |
| `essential/spatial-hash.md` | Hash Table + Spatial Hash | Hover detect 10K+, DOM rect cache |
| `essential/two-pointers.md` | Multiple Pointers | Pinch-to-zoom, Particle compact |
| `essential/pathfinding.md` | Dijkstra + DP | Pathfinding animation, Maze |

#### Advanced (`algorithms/advanced/`)

| File | Nội dung | Hiệu ứng thực chiến |
|---|---|---|
| `advanced/radix-sort.md` | Merge/Quick/Radix Sort | Z-depth 100K WebGL particles |
| `advanced/binary-heap.md` | Binary Heap, Min PQ | Task scheduler, Priority queue |
| `advanced/graph.md` | Adjacency List, Map+Set | State Machine, Complex scene |
| `advanced/recursion.md` | Recursion + WeakMap | Deep clone, Memoized animation |
