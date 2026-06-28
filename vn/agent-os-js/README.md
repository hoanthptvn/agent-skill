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
│   ├── reverse-interrogation/ ← Kỹ năng Crey (Brainstorming)
│   ├── architecture/        ← Code Style, Quy tắc Naming và AI Security
│   ├── dom-testing/         ← Kỹ năng Agent-Native Verification (DOM Contract)
│   ├── data-structures/     ← Tối ưu hóa Kiểu dữ liệu JS
│   ├── performance-loops/   ← Tối ưu hóa Vòng lặp (60fps)
│   └── algorithms/          ← Thuật toán Vanilla JS
├── CLAUDE.md                ← Meta-Skill Router (Orchestrator, Slash Commands)
├── SKILL.md                 ← Entry point: Dispatch Table & Cảnh báo ngách
└── README.md
```

## Slash Commands (Lệnh Điều Phối)

| Lệnh | Kích hoạt Kỹ năng |
|---|---|
| `/crey` | Truy vấn Đảo ngược (Tạo thư mục `brainstorm/` và phỏng vấn ráo riết) |
| `/spec` | Spec-driven development (Bắt buộc viết tài liệu trước khi code) |
| `/plan` | Bẻ nhỏ tác vụ thành vi mô |
| `/build` | Viết code Vanilla JS (Áp dụng TDD) |
| `/test` | Xác thực Hợp đồng DOM (Sử dụng data-* attributes) |
| `/review`| Đánh giá Code Style và Tối ưu rác bộ nhớ (Garbage Collection) |

## Vấn đề nào mở file nào?

| Tôi cần... | Mở Kỹ năng tương ứng |
|---|---|
| Khởi tạo dự án (Phỏng vấn) | `/crey` (Kích hoạt kỹ năng `skills/reverse-interrogation/SKILL.md`) |
| Xử lý String / Regex | `skills/data-structures/types-string.md` |
| Xử lý Number / Math | `skills/data-structures/types-number.md` |
| Tối ưu Array / List | `skills/data-structures/types-array.md` |
| Typed Arrays (WebGL/Audio) | `skills/data-structures/types-typed-array.md` |
| Object / Hash Map | `skills/data-structures/types-object.md` |
| Map vs Set | `skills/data-structures/types-map-set.md` |
| Vòng lặp tối ưu 60fps | `skills/performance-loops/SKILL.md` |
| Playwright Testing (Self-healing) | `skills/dom-testing/SKILL.md` |
| Naming & Quy tắc Code | `skills/architecture/code-style.md` |
| Scroll skew / velocity effect | `skills/algorithms/essential/sliding-window.md` |
| Card sort FLIP animation | `skills/algorithms/essential/flip-sort.md` |
| Filter UI / Tag cloud | `skills/algorithms/essential/frequency-counter.md` |
| Ripple wave / BFS stagger | `skills/algorithms/essential/graph-bfs-dfs.md` |
| Hover detection 10K+ phần tử | `skills/algorithms/essential/spatial-hash.md` |
| Pinch-to-zoom / dedup in-place | `skills/algorithms/essential/two-pointers.md` |
| Pathfinding / Maze animation | `skills/algorithms/essential/pathfinding.md` |
| Z-depth sort WebGL 100K | `skills/algorithms/advanced/radix-sort.md` |
| Priority queue / task scheduler | `skills/algorithms/advanced/binary-heap.md` |
| State machine / scene graph | `skills/algorithms/advanced/graph.md` |
| Deep clone / memoization | `skills/algorithms/advanced/recursion.md` |
| Animation thư viện GSAP (Core) | `skills/gsap-core/SKILL.md` (Chỉ dùng khi được yêu cầu) |
| Scroll animation (GSAP) | `skills/gsap-scrolltrigger/SKILL.md` (Chỉ dùng khi được yêu cầu) |
| Animation nhiều bước (Timeline) | `skills/gsap-timeline/SKILL.md` (Chỉ dùng khi được yêu cầu) |

