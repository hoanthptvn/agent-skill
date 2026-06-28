---
name: agent-os-js
description: Hệ Điều Hành Tác Nhân (Agent OS) chuyên tối ưu hóa JavaScript cho frontend production — dispatch table chọn thuật toán, V8 engine rules, rAF 60fps contract. Hãy sử dụng khi có yêu cầu tối ưu hóa Vanilla JS.
---

# Agent OS: High-Performance Vanilla JS

## Overview

Bộ quy tắc tối ưu JavaScript cho frontend production. Trong kỷ nguyên **Agent OS**, hệ thống hoạt động dựa trên các **Slash Commands** (`/crey`, `/build`, `/test`) và tuân thủ chặt chẽ:

1. **Phơi bày Lũy tiến (Progressive Disclosure)** — Chỉ kéo (pull) kỹ năng trong `skills/` khi thực sự cần.
2. **Dispatch Table** — nhìn bài toán → map ra thuật toán đúng O(N) thay O(N²).
3. **V8 Engine Rules** — viết code theo cách V8 JIT optimize, không de-opt.
4. **rAF Contract** — giữ frame budget ≤ 4ms JavaScript, 0 allocation trong hot path.
5. **Chống Ngụy Biện (Anti-rationalization)** — Mọi tác vụ phải kèm theo bằng chứng (Log/Terminal) mới được thoát.

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

| Anti-pattern                           | Vấn đề                             | Fix                                        |
| -------------------------------------- | ---------------------------------- | ------------------------------------------ |
| `arguments` keyword                    | V8 de-optimization                 | `...args` rest params                      |
| `delete obj[key]`                      | Phá Hidden Classes                 | `obj[key] = undefined` hoặc `Map.delete()` |
| `.filter().map().reduce()` chain       | O(3N) + 2 temp arrays              | Single `for` loop                          |
| `arr.sort()` không comparator          | Sort theo string → sai             | Luôn truyền `(a,b) => a-b`                 |
| `new Set(arr).size` khi cần O(1) space | O(N) memory                        | Fast/Slow Pointer in-place                 |
| Regex trong rAF                        | State Machine nặng 55-80% chậm hơn | `charCodeAt(0)` range check                |
| Thêm property sau constructor          | Phá Hidden Class → de-opt          | Khai báo đầy đủ từ đầu                     |
| `delete arr[i]`                        | Holey Array → chậm 100×            | Swap-and-Pop hoặc splice                   |

---

## AI Mistakes — Bảng tổng hợp

| Tình huống        | AI hay làm                                  | Đúng phải làm                                 |
| ----------------- | ------------------------------------------- | --------------------------------------------- |
| Loop trong loop   | `arr1.forEach(x => arr2.includes(x))` O(N²) | `new Set(arr2)` → O(N)                        |
| Tìm kiếm sorted   | `.find()` O(N)                              | Binary Search O(log N)                        |
| DOM list render   | Re-render toàn bộ                           | Virtual Scroll (chỉ viewport)                 |
| Dedup array       | `[...new Set(arr)]`                         | Fast/Slow pointer in-place nếu cần O(1) space |
| Sort + render     | `.sort()` mutate state                      | `.toSorted()` immutable                       |
| Per-frame alloc   | `new Object()` trong rAF                    | Object Pool                                   |
| Regex trong rAF   | `/[a-z]/i.test(char)`                       | `charCodeAt(0)` range check                   |
| Read-Write xen kẽ | `getRect()` rồi `style=` trong loop         | Batch reads → Batch writes                    |
| Chain methods     | `.filter().map().reduce()`                  | Single `for` loop                             |

---

## Tham chiếu chi tiết

> Xem `CLAUDE.md` để biết cách AI agent đọc đúng file theo context.

### Phase 0 — Hệ tư tưởng AI & Kiến trúc (Architecture)

| Kỹ năng                                 | Nội dung                                                                       |
| --------------------------------------- | ------------------------------------------------------------------------------ |
| `skills/reverse-interrogation/SKILL.md` | Kích hoạt `/crey`. Tạo thư mục `brainstorm/`. Phỏng vấn bóc tách ngữ cảnh.     |
| `skills/architecture/SKILL.md`          | Master Index dẫn đến các chuẩn Code Style và AI Security (Chống XSS, Sandbox). |
| `skills/dom-testing/SKILL.md`           | Hợp đồng DOM với `data-*`, Self-healing qua Playwright, Chống ngụy biện Test.  |

### Phase 1 — Cấu trúc dữ liệu Vanilla JS (`skills/data-structures/`)

> ⭐ **Bắt buộc đọc**: `skills/data-structures/SKILL.md` — Router điều hướng chọn đúng kiểu dữ liệu.

| File                                          | Nội dung                                                                        |
| --------------------------------------------- | ------------------------------------------------------------------------------- |
| `skills/data-structures/types-string.md`      | charCodeAt vs Regex, for...of Unicode, concat trap O(N²), Naive String Search   |
| `skills/data-structures/types-number.md`      | BigInt, Infinity, bitwise >>1 <<1, floating point, Math.*, LERP/clamp           |
| `skills/data-structures/types-array.md`       | Big O Đầu/Đuôi, Swap-and-Pop, Holey Array, TypedArray, ES2023 toSorted()        |
| `skills/data-structures/types-object.md`      | V8 Hidden Classes, delete pitfall, Dispatch Table, Normalization, isEmpty O(1)  |
| `skills/data-structures/types-map-set.md`     | Map vs Set vs WeakMap, O(1) CRUD, DOM association, decision table               |
| `skills/data-structures/types-typed-array.md` | Float32Array/Uint32Array, STRIDE pattern, WebGL buffer, Audio API, Transferable |

### Phase 2 — Vòng lặp Hiệu năng (`skills/performance-loops/`)

| File                                | Nội dung                                                                                               |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `skills/performance-loops/SKILL.md` | for/for...of/while/forEach/.map chain, rAF Frame Budget ≤ 4ms, DO NOT list, Batch DOM, Cleanup/Destroy |

### Phase 3 — Thuật toán (`skills/algorithms/`)

> ⭐ **Bắt buộc đọc**: `skills/algorithms/SKILL.md` — Master Router phân luồng thuật toán.
> 💡 _Mẹo: `skills/algorithms/gsap-algorithm-guide.md` hướng dẫn khi nào kết hợp thuật toán với GSAP._

#### Essential (`skills/algorithms/essential/`)

| File                                               | Nội dung                           | Hiệu ứng thực chiến                  |
| -------------------------------------------------- | ---------------------------------- | ------------------------------------ |
| `skills/algorithms/essential/animation-loop.md`    | rAF, LERP, Object Pool, TypedArray | Particle system, smooth loop         |
| `skills/algorithms/essential/binary-search.md`     | Binary Search O(log N)             | Virtual Scroll, GSAP timeline scrub  |
| `skills/algorithms/essential/sliding-window.md`    | Sliding Window                     | Scroll skew/tilt, FPS monitor        |
| `skills/algorithms/essential/flip-sort.md`         | .sort() + FLIP Animation           | Card sort, Live feed sort            |
| `skills/algorithms/essential/frequency-counter.md` | Frequency Counter + Map            | Filter UI, Tag cloud, Faceted search |
| `skills/algorithms/essential/graph-bfs-dfs.md`     | Graph BFS/DFS                      | Ripple wave, Scene traverse, Stagger |
| `skills/algorithms/essential/spatial-hash.md`      | Hash Table + Spatial Hash          | Hover detect 10K+, DOM rect cache    |
| `skills/algorithms/essential/two-pointers.md`      | Multiple Pointers                  | Pinch-to-zoom, Particle compact      |
| `skills/algorithms/essential/pathfinding.md`       | Dijkstra + DP                      | Pathfinding animation, Maze          |

#### Advanced (`skills/algorithms/advanced/`)

| File                                        | Nội dung                | Hiệu ứng thực chiến            |
| ------------------------------------------- | ----------------------- | ------------------------------ |
| `skills/algorithms/advanced/radix-sort.md`  | Merge/Quick/Radix Sort  | Z-depth 100K WebGL particles   |
| `skills/algorithms/advanced/binary-heap.md` | Binary Heap, Min PQ     | Task scheduler, Priority queue |
| `skills/algorithms/advanced/graph.md`       | Adjacency List, Map+Set | State Machine, Complex scene   |
| `skills/algorithms/advanced/recursion.md`   | Recursion + WeakMap     | Deep clone, Memoized animation |

### Phase 4 — Thư viện GSAP Chính Chủ (LAZY LOAD)

> ⚠️ **LAZY LOAD RULE:** Tuyệt đối KHÔNG đọc các module này trừ khi Người dùng yêu cầu dùng thư viện GSAP (ví dụ: "hãy viết animation dùng gsap" hoặc "tôi muốn hiệu ứng cuộn trang ScrollTrigger").

| File                                 | Nội dung                                                         |
| ------------------------------------ | ---------------------------------------------------------------- |
| `skills/gsap-core/SKILL.md`          | Core API, Tweens, Easing, Timeline vs Delay, autoAlpha, Stagger. |
| `skills/gsap-scrolltrigger/SKILL.md` | Animation bám cuộn, Pinning, Scrub, Observer.                    |
| `skills/gsap-timeline/SKILL.md`      | Trình tự thời gian phức tạp (Position Parameter).                |
| `skills/gsap-plugins/SKILL.md`       | Flip, Draggable, SplitText, ScrambleText, MorphSVG.              |
| `skills/gsap-utils/SKILL.md`         | Hàm tiện ích: clamp, mapRange, random, toArray.                  |
| `skills/gsap-performance/SKILL.md`   | Tối ưu 60fps GSAP, will-change, Batching.                        |
