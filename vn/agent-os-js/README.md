# Agent OS: High-Performance Vanilla JS

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
agent-os-js/
├── skills/          ← [MỚI] Giàn giáo Kỹ năng (Modular Skills)
│   ├── workflow-reverse-interrogation/ ← Kỹ năng Crey (Brainstorming)
│   ├── workflow-dom-testing/         ← Kỹ năng Agent-Native Verification (DOM Contract)
│   ├── js-architecture/              ← Code Style, Quy tắc Naming và AI Security
│   ├── js-data-structures/           ← Tối ưu hóa Kiểu dữ liệu JS
│   ├── js-performance-loops/         ← Tối ưu hóa Vòng lặp (60fps)
│   ├── js-algorithms/                ← Thuật toán Vanilla JS
│   ├── gsap-core/                    ← Kỹ năng Core API của GSAP
│   ├── gsap-scrolltrigger/           ← Kỹ năng GSAP ScrollTrigger
│   ├── gsap-timeline/                ← Kỹ năng GSAP Timeline
│   ├── gsap-plugins/                 ← Kỹ năng GSAP Plugins (Flip, Draggable)
│   ├── gsap-utils/                   ← Kỹ năng tiện ích Toán học của GSAP
│   └── gsap-performance/             ← Kỹ năng tối ưu 60fps cho GSAP
├── CLAUDE.md                ← Meta-Skill Router (Orchestrator, Slash Commands)
├── SKILL.md                 ← Entry point: Dispatch Table & Cảnh báo ngách
└── README.md
```

## Slash Commands (Lệnh Điều Phối)

| Lệnh      | Kích hoạt Kỹ năng                                                    |
| --------- | -------------------------------------------------------------------- |
| `/crey`   | Truy vấn Đảo ngược (Tải `workflow-reverse-interrogation/SKILL.md`)   |
| `/spec`   | Viết tài liệu Spec-driven development trước khi code                 |
| `/plan`   | Bẻ nhỏ tác vụ thành vi mô                                            |
| `/build`  | Viết code Vanilla JS (Áp dụng TDD)                                   |
| `/test`   | Xác thực Hợp đồng DOM (Tải `workflow-dom-testing/SKILL.md`)          |
| `/review` | Đánh giá Code Style và Garbage Collection (Tải `js-architecture/SKILL.md`) |

## Vấn đề nào mở file nào?

| Tôi cần...                        | Mở Kỹ năng tương ứng                                                |
| --------------------------------- | ------------------------------------------------------------------- |
| Khởi tạo dự án (Phỏng vấn)        | `/crey` (Kích hoạt kỹ năng `skills/workflow-reverse-interrogation/SKILL.md`) |
| Xử lý String / Regex              | `skills/js-data-structures/types-string.md`                            |
| Xử lý Number / Math               | `skills/js-data-structures/types-number.md`                            |
| Tối ưu Array / List               | `skills/js-data-structures/types-array.md`                             |
| Typed Arrays (WebGL/Audio)        | `skills/js-data-structures/types-typed-array.md`                       |
| Object / Hash Map                 | `skills/js-data-structures/types-object.md`                            |
| Map vs Set                        | `skills/js-data-structures/types-map-set.md`                           |
| Vòng lặp tối ưu 60fps             | `skills/js-performance-loops/SKILL.md`                                 |
| Playwright Testing (Self-healing) | `skills/workflow-dom-testing/SKILL.md`                                       |
| Naming & Quy tắc Code             | `skills/js-architecture/code-style.md`                                 |
| Scroll skew / velocity effect     | `skills/js-algorithms/essential/sliding-window.md`                     |
| Card sort FLIP animation          | `skills/js-algorithms/essential/flip-sort.md`                          |
| Filter UI / Tag cloud             | `skills/js-algorithms/essential/frequency-counter.md`                  |
| Ripple wave / BFS stagger         | `skills/js-algorithms/essential/graph-bfs-dfs.md`                      |
| Hover detection 10K+ phần tử      | `skills/js-algorithms/essential/spatial-hash.md`                       |
| Pinch-to-zoom / dedup in-place    | `skills/js-algorithms/essential/two-pointers.md`                       |
| Pathfinding / Maze animation      | `skills/js-algorithms/essential/pathfinding.md`                        |
| Z-depth sort WebGL 100K           | `skills/js-algorithms/advanced/radix-sort.md`                          |
| Priority queue / task scheduler   | `skills/js-algorithms/advanced/binary-heap.md`                         |
| State machine / scene graph       | `skills/js-algorithms/advanced/graph.md`                               |
| Deep clone / memoization          | `skills/js-algorithms/advanced/recursion.md`                           |
| Animation thư viện GSAP (Core)    | `skills/gsap-core/SKILL.md` (Chỉ dùng khi được yêu cầu)             |
| Scroll animation (GSAP)           | `skills/gsap-scrolltrigger/SKILL.md` (Chỉ dùng khi được yêu cầu)    |
| Animation nhiều bước (Timeline)   | `skills/gsap-timeline/SKILL.md` (Chỉ dùng khi được yêu cầu)         |
