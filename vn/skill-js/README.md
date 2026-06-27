# skill-js — Tối ưu JavaScript cho Animation Frontend

> Các pattern performance JavaScript cho dự án GSAP / Three.js / Lenis / Awwwards-level.

## Bắt đầu nhanh

**Điểm vào theo AI agent:**
- **Claude / Gemini**: Đọc `CLAUDE.md` → `SKILL.md`
- **Cursor / Copilot / GPT**: Đọc README này → rồi mở `SKILL.md`
- **Bất kỳ AI nào**: Bắt đầu với `references/algorithms/gsap-algorithm-guide.md` cho các quyết định liên quan đến GSAP

## 3 Nguyên tắc cốt lõi

1. **Zero-allocation trong rAF** — Không `new Object()`, không `.map()/.filter()`, không Regex trong hot path
2. **O(1) hoặc O(log N) trong render loop** — O(N) chỉ được phép ở init
3. **Iterative > Recursive** — V8 Call Stack giới hạn ~10K frames

## Sơ đồ file

```
skill-js/
├── README.md                ← File này (điểm vào chung cho mọi AI)
├── SKILL.md                 ← Registry đầy đủ: Dispatch Table, V8 rules, danh mục file
├── CLAUDE.md                ← Hướng dẫn routing cho Claude/Gemini
│
└── references/
    ├── code-style.md        ← ⚠️ Quy tắc viết code cho AI
    ├── types/               ← Kiểu dữ liệu: DO/DON'T, Big O, V8 pitfalls
    │   └── README.md
    ├── loops/               ← Các pattern vòng lặp + rAF frame budget
    │   └── README.md
    └── algorithms/          ← Algorithm → Ánh xạ hiệu ứng
        ├── README.md
        ├── gsap-algorithm-guide.md  ← ⭐ Khi nào dùng algo với GSAP
        ├── essential/       ← Dùng hàng ngày: scroll, layout, interaction, particles
        │   └── README.md
        └── advanced/        ← Phức tạp: WebGL sort, heap, state machine
            └── README.md
```

## Vấn đề nào mở file nào?

| Tôi cần... | Mở file này |
|---|---|
| Chọn loop / tránh GC | `loops/loops.md` |
| Dùng String/Array/Object đúng cách | `types/types-*.md` |
| Quyết định GSAP có cần algorithm không | `algorithms/gsap-algorithm-guide.md` |
| Xây dựng particle system / rAF loop | `algorithms/essential/animation-loop.md` |
| Virtual Scroll / Timeline scrub | `algorithms/essential/binary-search.md` |
| Scroll skew / velocity effect | `algorithms/essential/sliding-window.md` |
| Card sort FLIP animation | `algorithms/essential/flip-sort.md` |
| Filter UI / Tag cloud | `algorithms/essential/frequency-counter.md` |
| Ripple wave / BFS stagger | `algorithms/essential/graph-bfs-dfs.md` |
| Hover detection 10K+ phần tử | `algorithms/essential/spatial-hash.md` |
| Pinch-to-zoom / dedup in-place | `algorithms/essential/two-pointers.md` |
| Pathfinding / Maze animation | `algorithms/essential/pathfinding.md` |
| Z-depth sort WebGL 100K | `algorithms/advanced/radix-sort.md` |
| Priority queue / task scheduler | `algorithms/advanced/binary-heap.md` |
| State machine / scene graph | `algorithms/advanced/graph.md` |
| Deep clone / memoization | `algorithms/advanced/recursion.md` |

