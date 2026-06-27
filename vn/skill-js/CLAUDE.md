# CLAUDE.md — Hướng dẫn cho AI Agent

Bộ tài liệu JavaScript optimization cho frontend production (GSAP, Three.js, Lenis, Awwwards-level).

## Quy tắc đọc

1. **SKILL.md** là entry point — đọc trước, chứa Dispatch Table + V8 Gotchas + AI Mistakes
2. Tìm file chi tiết theo **thư mục** bên dưới, không đoán tên file
3. **Tên file = Hiệu ứng** (VD: `scroll-velocity-skew.md` = hiệu ứng scroll skew, dùng Sliding Window)
4. Mỗi file có format: **nửa đầu = Document** (DO/DON'T, Big O), **nửa sau = Practice** (code thực chiến)
5. Giữ tiếng Việt, trừ thuật ngữ chuyên môn giữ nguyên English

---

## Cấu trúc thư mục

```
skill-js/
├── SKILL.md                          ← Entry point: Dispatch Table, V8 rules, AI Mistakes
├── CLAUDE.md                         ← File này — hướng dẫn cho AI
│
└── references/
    ├── code-style.md            ← ⚠️ BẮT BUỘC: quy tắc viết code cho người đọc
    ├── types/                   ← Phase 1: Kiểu dữ liệu (DO / DON'T)
    │   ├── types-string.md           ← charCodeAt vs Regex, Unicode, concat O(N²)
    │   ├── types-number.md           ← BigInt, bitwise, floating point, LERP/clamp
    │   ├── types-array.md            ← Swap-and-Pop, Holey Array, TypedArray, toSorted()
    │   ├── types-object.md           ← V8 Hidden Classes, delete pitfall, Dispatch Table
    │   ├── types-map-set.md          ← Map vs Set vs WeakMap, O(1) CRUD
    │   └── types-typed-array.md      ← Float32Array, STRIDE, WebGL buffer, Transferable
    │
    ├── loops/                        ← Phase 2: Vòng lặp & Iteration
    │   └── loops.md                  ← for/for...of/while/forEach, rAF ≤ 4ms, Cleanup/Destroy
    │
    └── algorithms/                   ← Phase 3: Thuật toán (tên file = hiệu ứng)
        │
        ├── gsap-algorithm-guide.md   ← ⭐ ĐỌC ĐẦU: khi nào dùng algo với GSAP
        │
        ├── essential/                ← Dùng hàng ngày
        │   ├── animation-loop.md      ← rAF, LERP, Object Pool, TypedArray
        │   ├── binary-search.md       ← Virtual Scroll, GSAP timeline scrub
        │   ├── sliding-window.md      ← Scroll skew/tilt, FPS monitor
        │   ├── flip-sort.md           ← Card sort FLIP, Live feed
        │   ├── frequency-counter.md   ← Filter UI, Tag cloud, Faceted
        │   ├── graph-bfs-dfs.md       ← Ripple wave, Scene traverse, Stagger
        │   ├── spatial-hash.md        ← Hover 10K+, DOM rect cache
        │   ├── two-pointers.md        ← Pinch-to-zoom, Particle compact
        │   └── pathfinding.md         ← Pathfinding animation, Maze, DP
        │
        └── advanced/                 ← Hiệu ứng phức tạp
            ├── radix-sort.md          ← Z-depth 100K WebGL particles
            ├── binary-heap.md         ← Task scheduler, Priority queue
            ├── graph.md               ← State Machine, Complex scene
            └── recursion.md           ← Deep clone, Memoized animation
```

---

## Routing — Khi nào đọc file nào

```
User hỏi về String/Number/Array/Object/Map/Set       → types/
User hỏi về TypedArray, Float32Array, WebGL buffer   → types/types-typed-array.md
User hỏi về loop, forEach, rAF, frame budget         → loops/
User cần cleanup, destroy, unmount, memory leak       → loops/loops.md (mục "Cleanup / Destroy")

User viết code / AI viết code cho user                → code-style.md  ← ĐỌC TRƯỚC KHI VIẾT

User hỏi "khi nào dùng algo với GSAP"               → algorithms/gsap-algorithm-guide.md  ← ĐỌC ĐẦU

User làm Particle system / rAF loop                  → essential/animation-loop.md
User làm Virtual Scroll / GSAP scrub timeline        → essential/binary-search.md
User làm Scroll skew / tilt / FPS monitor            → essential/sliding-window.md
User làm Card sort FLIP / Live feed sort             → essential/flip-sort.md
User làm Filter UI / Tag cloud / Faceted search      → essential/frequency-counter.md
User làm Ripple / Wave / BFS stagger                 → essential/graph-bfs-dfs.md
User làm Hover detection 10K+ / spatial              → essential/spatial-hash.md
User làm Pinch-to-zoom / Particle compact            → essential/two-pointers.md
User làm Pathfinding / Maze / DP animation           → essential/pathfinding.md

User làm Z-depth sort WebGL 100K                     → advanced/radix-sort.md
User làm Task scheduler / Priority queue             → advanced/binary-heap.md
User làm State Machine / Complex graph               → advanced/graph.md
User làm Deep clone / Memoization                   → advanced/recursion.md
```

---

## 3 Nguyên tắc cốt lõi

1. **Zero-allocation trong rAF** — Không `new Object()`, không `.map()/.filter()`, không Regex trong hot path
2. **O(1) hoặc O(log N)** — Mọi thao tác trong render loop phải ≤ O(log N). O(N) chỉ chấp nhận ở init
3. **Iterative > Recursive** — V8 Call Stack limit ~10,000 frames. Luôn dùng while + Stack/Queue
