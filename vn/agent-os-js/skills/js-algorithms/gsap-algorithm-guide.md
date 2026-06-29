---
name: gsap-algorithm-guide
description: Cẩm nang hướng dẫn ánh xạ các bài tập GSAP sang lý thuyết thuật toán. Giúp AI quyết định khi nào dùng thuật toán (BFS, Binary Search, DP) kết hợp GSAP, và khi nào chỉ cần dùng API thuần của GSAP.
---

# Khi nào dùng Algorithm với GSAP — Decision Guide

Mỗi algorithm trong thư mục `algorithms/` đều có **use case thực chiến cụ thể** với GSAP/Three.js/Lenis. File này giúp bạn quyết định: dùng hay không, dùng ở đâu, thay thế bằng gì nếu GSAP đã xử lý sẵn.

---

## Bảng quyết định nhanh

```
VẤN ĐỀ                                          DÙNG GÌ
──────────────────────────────────────────────────────────────────────────────
Animate 1 element từ A → B, duration cố định    → GSAP thuần (không cần algo)
Timeline sequence, stagger, ease                → GSAP thuần (không cần algo)
Tìm element tại vị trí scroll (100K items)      → Binary Search
Stagger theo thứ tự BFS từ điểm click           → Graph BFS + GSAP stagger
Card sort visual (FLIP animation)               → .toSorted() + GSAP fromTo
Scroll velocity → skew effect                   → Sliding Window (avg 5 frames)
Autocomplete / filter realtime                  → Frequency Counter + Hash Map
Z-depth sort 100K particles/frame               → Radix Sort + TypedArray
Pathfinding trong WebGL scene                   → Dijkstra (DP)
Ripple effect lan tỏa theo wave                 → Graph BFS
Unique items, dedup array                       → Set (không cần algo phức tạp)
Kiểm tra 2 mảng trùng lặp                      → Frequency Counter
```

---

## GSAP làm tất cả — Không cần Algorithm

Những tình huống này GSAP đã handle hoàn toàn, **không cần viết thêm thuật toán**:

```javascript
// ✅ GSAP xử lý hoàn toàn — code ngắn, không cần algo:
gsap.to('.box', { x: 100, duration: 1, ease: 'power2.out' });
gsap.from('.card', { opacity: 0, stagger: 0.1 });
gsap.timeline().to(a, {...}).to(b, {...}).to(c, {...});
ScrollTrigger.create({ trigger: '.section', ... });
```

**Nguyên tắc**: Nếu GSAP API đã mô tả đúng ý bạn → dùng luôn, không cần thêm.

---

## Từng Algorithm — Dùng khi nào với GSAP

---

### 1. Binary Search — `essential/binary-search.md`

**Vấn đề cần giải**: _Tìm vị trí/item trong mảng có thứ tự theo giá trị thực (scroll offset, timestamp)._

#### ✅ CẦN DÙNG — GSAP Timeline Scrubbing

```javascript
// Bài toán: Timeline 500 keyframes, mỗi pixel scroll → tìm keyframe hiện tại
// gsap.to() animate đến đúng keyframe → cần biết keyframe nào đang active

const keyframes = [
  { time: 0, state: { opacity: 0, y: 100 } },
  { time: 250, state: { opacity: 1, y: 0 } },
  { time: 500, state: { opacity: 1, y: -50 } },
  // ... 500 keyframes
];

// ❌ arr.find() → O(N) mỗi pixel scroll = lag
const active = keyframes.find((k) => k.time <= scrollY);

// ✅ Binary Search → O(log N) = 9 bước cho 500 keyframes
function findKeyframe(keyframes, scrollY) {
  let lo = 0,
    hi = keyframes.length - 1,
    result = 0;
  while (lo <= hi) {
    const mid = lo + ((hi - lo) >> 1);
    if (keyframes[mid].time <= scrollY) {
      result = mid;
      lo = mid + 1;
    } else hi = mid - 1;
  }
  return keyframes[result];
}

// Trong ScrollTrigger callback:
ScrollTrigger.create({
  onUpdate: (self) => {
    const ms = self.progress * totalDuration;
    const kf = findKeyframe(keyframes, ms); // O(log N)
    gsap.to(el, { ...kf.state, duration: 0.1 });
  },
});
```

#### ✅ CẦN DÙNG — Virtual Scroll với GSAP

```javascript
// Danh sách 100K items, chỉ render ~20 items trong viewport
// Mỗi scroll event → tìm item đầu tiên trong viewport

const cumulativeHeights = [0, 80, 160, 250, ...]; // sorted, tính 1 lần

function findFirstVisible(heights, scrollTop) {
  let lo = 0, hi = heights.length - 1;
  while (lo <= hi) {
    const mid = lo + ((hi - lo) >> 1);
    heights[mid] <= scrollTop ? (lo = mid + 1) : (hi = mid);
  }
  return Math.max(0, lo - 1);
}

lenis.on('scroll', ({ scroll }) => {
  const startIdx = findFirstVisible(cumulativeHeights, scroll);
  renderVisibleItems(startIdx, startIdx + 20);
  // Sau đó GSAP animate các items mới xuất hiện:
  gsap.from(newItems, { opacity: 0, y: 20, stagger: 0.05 });
});
```

#### ❌ KHÔNG CẦN — Animate đơn giản

```javascript
// Không cần Binary Search khi chỉ animate vài elements cố định
gsap.to(".hero", { opacity: 1, y: 0 }); // Dùng GSAP thẳng
```

---

### 2. Graph BFS/DFS — `essential/graph-traversal.md`

**Vấn đề cần giải**: _Animation lan tỏa theo mối quan hệ — không phải stagger đơn giản._

#### ✅ CẦN DÙNG — Ripple / Wave Effect từ điểm click

```javascript
// Bài toán: Grid 20×20 = 400 cells. Click vào cell → wave lan ra xung quanh
// Stagger đơn giản của GSAP không biết "hàng xóm" là cell nào

function buildGrid(rows, cols) {
  const adj = new Map();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = r * cols + c;
      const neighbors = [];
      if (r > 0) neighbors.push((r - 1) * cols + c); // trên
      if (r < rows - 1) neighbors.push((r + 1) * cols + c); // dưới
      if (c > 0) neighbors.push(r * cols + c - 1); // trái
      if (c < cols - 1) neighbors.push(r * cols + c + 1); // phải
      adj.set(id, neighbors);
    }
  }
  return adj;
}

function rippleFrom(startCell, graph, cells) {
  const visited = new Set([startCell]);
  const queue = [startCell];
  let head = 0;
  let delay = 0;

  while (head < queue.length) {
    const node = queue[head++];
    const el = cells[node]; // DOM element

    // GSAP animate từng "tầng" BFS với delay tăng dần
    gsap.to(el, {
      scale: 1.3,
      backgroundColor: "#6366f1",
      duration: 0.3,
      delay,
    });

    for (const neighbor of graph.get(node) || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
    delay += 0.03; // Mỗi bước BFS = +30ms delay → tạo wave
  }
}

gridEl.addEventListener("click", (e) => {
  const cellIdx = +e.target.dataset.idx;
  rippleFrom(cellIdx, grid, allCells);
});
```

#### ✅ CẦN DÙNG — Three.js Scene Graph Traversal

```javascript
// Bài toán: Animate toàn bộ mesh con trong scene theo thứ tự cha → con

function animateSceneTree(root) {
  const stack = [root];
  let delay = 0;

  while (stack.length) {
    const obj = stack.pop();

    // GSAP animate mỗi mesh với delay tăng (PreOrder DFS)
    if (obj.isMesh) {
      gsap.from(obj.material, { opacity: 0, duration: 0.5, delay });
      delay += 0.05;
    }

    // DFS: push children vào stack
    for (const child of obj.children) stack.push(child);
  }
}

animateSceneTree(scene);
```

#### ❌ KHÔNG CẦN — Stagger tuyến tính đơn giản

```javascript
// Không cần Graph khi chỉ muốn stagger theo thứ tự array
gsap.to(".card", { opacity: 1, stagger: 0.1 }); // GSAP tự xử lý
```

---

### 3. Sorting + FLIP — `essential/sorting-basic.md`

**Vấn đề cần giải**: _Sort danh sách và animate các card bay về đúng vị trí mới._

#### ✅ CẦN DÙNG — FLIP Animation (Filter/Sort UI)

```javascript
// Bài toán: Click "Sort by price" → cards bay về vị trí mới mượt mà

function flipSort(cards, data, comparator) {
  // FIRST: Lưu vị trí cũ trước khi sort
  const first = cards.map((el) => el.getBoundingClientRect());

  // Sort DATA (không đụng DOM)
  data.sort(comparator); // ← .sort() cần comparator!

  // LAST: Re-render DOM theo thứ tự mới
  renderCards(data);
  const last = cards.map((el) => el.getBoundingClientRect());

  // INVERT + PLAY: GSAP animate từ vị trí cũ về mới
  for (let i = 0; i < cards.length; i++) {
    const el = cards[i];
    const dx = first[i].left - last[i].left;
    const dy = first[i].top - last[i].top;
    gsap.fromTo(
      el,
      { x: dx, y: dy },
      { x: 0, y: 0, duration: 0.5, ease: "power2.out" },
    );
  }
}

document.querySelector("#sort-price").addEventListener("click", () => {
  flipSort(cardEls, productData, (a, b) => a.price - b.price);
});
```

#### ✅ CẦN DÙNG — Insertion Sort cho Nearly-Sorted live data

```javascript
// WebSocket trả về tin tức mới, cần chen vào mảng đã sorted
// Insertion Sort O(N) best case thay vì .sort() O(N log N)

const feed = []; // đã sorted theo timestamp

ws.onmessage = ({ data }) => {
  const item = JSON.parse(data);
  // Insertion Sort online: chen item vào đúng vị trí
  let i = feed.length - 1;
  feed.push(item);
  while (i >= 0 && feed[i].ts > item.ts) {
    feed[i + 1] = feed[i];
    i--;
  }
  feed[i + 1] = item;

  // GSAP animate item mới chen vào
  gsap.from(newItemEl, { height: 0, opacity: 0, duration: 0.3 });
};
```

#### ❌ KHÔNG CẦN — Sort tĩnh 1 lần

```javascript
// Chỉ sort 1 lần lúc init, không animate → dùng .toSorted() luôn
const sorted = data.toSorted((a, b) => a.price - b.price);
renderCards(sorted); // Không cần thuật toán riêng
```

---

### 4. Sliding Window — `essential/patterns-sliding-window.md`

**Vấn đề cần giải**: _Tính giá trị trung bình của N frame gần nhất để tạo hiệu ứng mượt._

#### ✅ CẦN DÙNG — Scroll Velocity → Skew Effect

```javascript
// Bài toán: Tính scroll velocity trung bình 5 frames để làm skew/tilt effect
// Sliding Window tránh tính lại từ đầu mỗi frame

const WINDOW = 5;
const scrollHistory = new Array(WINDOW).fill(0); // Circular buffer
let windowSum = 0;
let historyIdx = 0;

lenis.on("scroll", ({ velocity }) => {
  // Sliding Window: trừ giá trị cũ, cộng giá trị mới
  windowSum -= scrollHistory[historyIdx];
  windowSum += velocity;
  scrollHistory[historyIdx] = velocity;
  historyIdx = (historyIdx + 1) % WINDOW;

  const avgVelocity = windowSum / WINDOW; // Không tính lại từ đầu

  // GSAP apply skew dựa trên velocity trung bình
  gsap.to(".content", { skewY: avgVelocity * 0.02, duration: 0.1 });
});
```

#### ✅ CẦN DÙNG — FPS Monitoring

```javascript
// Đo FPS trung bình 60 frames để tự điều chỉnh quality
const FPS_WINDOW = 60;
const frameTimes = new Array(FPS_WINDOW).fill(16.67);
let windowSum = 16.67 * FPS_WINDOW;
let frameIdx = 0;
let lastTime = performance.now();

function tick() {
  const now = performance.now();
  const dt = now - lastTime;
  lastTime = now;

  windowSum -= frameTimes[frameIdx];
  windowSum += dt;
  frameTimes[frameIdx] = dt;
  frameIdx = (frameIdx + 1) % FPS_WINDOW;

  const avgFPS = 1000 / (windowSum / FPS_WINDOW);
  if (avgFPS < 30) reduceParticleCount(); // Tự điều chỉnh

  requestAnimationFrame(tick);
}
```

#### ❌ KHÔNG CẦN — Ease/Lerp đơn giản

```javascript
// GSAP ease đã là "window" rồi, không cần tự tính
gsap.to(el, { x: 100, ease: "power2.out" }); // Không cần Sliding Window
```

---

### 5. Frequency Counter — `essential/patterns-frequency-counter.md`

**Vấn đề cần giải**: _Phân loại, lọc, đếm tần suất để quyết định animate nhóm nào._

#### ✅ CẦN DÙNG — Group Animation theo Category

```javascript
// Bài toán: 500 sản phẩm, click filter "Electronics" → chỉ animate nhóm đó

// ❌ O(N²): filter + includes mỗi lần click
btn.addEventListener("click", () => {
  const visible = products.filter((p) => p.category === selected);
});

// ✅ Build Map 1 lần O(N) → lookup O(1) mãi mãi
const grouped = new Map();
for (const p of products) {
  if (!grouped.has(p.category)) grouped.set(p.category, []);
  grouped.get(p.category).push(p);
}

btn.addEventListener("click", () => {
  const visible = grouped.get(selected) || []; // O(1)
  const hidden = products.filter((p) => !visible.includes(p)); // dùng Set để O(N)

  gsap.to(hiddenEls, { opacity: 0, scale: 0.8, duration: 0.3 });
  gsap.to(visibleEls, { opacity: 1, scale: 1, duration: 0.3 });
});
```

#### ✅ CẦN DÙNG — Stagger theo tần suất

```javascript
// Animate tags/keywords: tag nào xuất hiện nhiều nhất → scale lớn hơn
const freq = new Map();
for (const tag of allTags) freq.set(tag, (freq.get(tag) || 0) + 1);
const max = Math.max(...freq.values());

for (let i = 0; i < tagEls.length; i++) {
  const el = tagEls[i];
  const count = freq.get(el.dataset.tag) || 0;
  const scale = 0.8 + (count / max) * 0.8; // scale từ 0.8 đến 1.6
  gsap.to(el, { scale, duration: 0.5 });
}
```

#### ❌ KHÔNG CẦN — Stagger tất cả không phân loại

```javascript
gsap.to(".tag", { opacity: 1, stagger: 0.05 }); // GSAP đủ
```

---

### 6. Multiple Pointers — `essential/patterns-pointers.md`

**Vấn đề cần giải**: _Xử lý 2 điểm đồng thời (multi-touch, pinch, compare 2 timelines)._

#### ✅ CẦN DÙNG — Pinch-to-Zoom với 2 fingers

```javascript
// touches[0] và touches[1] = 2 pointers, tính khoảng cách
let prevDistance = 0;

canvas.addEventListener("touchmove", (e) => {
  if (e.touches.length < 2) return;

  // Multiple Pointers: 2 touch points
  const dx = e.touches[0].clientX - e.touches[1].clientX;
  const dy = e.touches[0].clientY - e.touches[1].clientY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const scale = distance / prevDistance;
  gsap.to(target, { scale: currentScale * scale, duration: 0.1 });
  prevDistance = distance;
});
```

#### ✅ CẦN DÙNG — Xóa trùng particle in-place

```javascript
// Particle system: xóa particle đã chết, không tạo array mới
let writeIdx = 0;
for (let readIdx = 0; readIdx < particles.length; readIdx++) {
  if (particles[readIdx].alive) {
    particles[writeIdx++] = particles[readIdx]; // Fast pointer ghi đè
  }
}
particles.length = writeIdx; // Trim
```

#### ❌ KHÔNG CẦN — Pinch trên library có sẵn

```javascript
// Nếu đã dùng Draggable của GSAP hoặc Hammer.js → không cần tự viết
Draggable.create(".box", { type: "x,y", inertia: true });
```

---

### 7. Hash Table / Map — `essential/hash-table.md`

**Vấn đề cần giải**: _Cache kết quả tốn kém (getBoundingClientRect, DOM query) để không tính lại._

#### ✅ CẦN DÙNG — Cache DOM measurements

```javascript
// getBoundingClientRect() gây reflow — cực đắt nếu gọi nhiều lần
const rectCache = new WeakMap();

function getCachedRect(el) {
  if (rectCache.has(el)) return rectCache.get(el);
  const rect = el.getBoundingClientRect(); // Chỉ gọi 1 lần
  rectCache.set(el, rect);
  return rect;
}

// ScrollTrigger onUpdate: gọi 100 lần/giây → cache cứu 99 lần/giây
ScrollTrigger.create({
  onUpdate: (self) => {
    const rect = getCachedRect(heroEl); // O(1) từ lần 2 trở đi
    gsap.to(el, { y: rect.top * self.progress });
  },
});
```

#### ✅ CẦN DÙNG — Spatial Hashing cho hover detection

```javascript
// 10,000 particles, chuột hover → tìm particles gần chuột
// ❌ O(N) loop → lag
// ✅ Spatial Hash: chia không gian thành ô lưới → O(1) lookup

const CELL = 50; // 50px per cell
const grid = new Map();

function getKey(x, y) {
  return `${Math.floor(x / CELL)},${Math.floor(y / CELL)}`;
}

function buildSpatialHash(particles) {
  grid.clear();
  for (const p of particles) {
    const key = getKey(p.x, p.y);
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key).push(p);
  }
}

canvas.addEventListener("mousemove", ({ offsetX, offsetY }) => {
  const nearby = grid.get(getKey(offsetX, offsetY)) || [];
  for (const p of nearby) {
    // GSAP animate particles gần chuột
    gsap.to(p.el, { scale: 1.5, duration: 0.2 });
  }
});
```

#### ❌ KHÔNG CẦN — Số lượng element nhỏ

```javascript
// < 100 elements → hover detector đơn giản đủ rồi
for (const el of document.querySelectorAll(".dot")) {
  el.addEventListener("mouseenter", () => gsap.to(el, { scale: 1.5 }));
}
```

---

### 8. Dynamic Programming / Dijkstra — `essential/dynamic-programming.md`

#### ✅ CẦN DÙNG — Animation Pathfinding

```javascript
// Bài toán: Marble lăn từ điểm A → B theo đường ngắn nhất trong maze
// Dijkstra tìm path trước → GSAP animate theo path

function animatePath(path, marbleEl) {
  const tl = gsap.timeline();
  for (let i = 0; i < path.length; i++) {
    const { x, y } = cellToPixel(path[i]);
    tl.to(marbleEl, { x, y, duration: 0.15, ease: "none" });
  }
}

const path = dijkstra(maze, startNode, endNode);
animatePath(path, document.querySelector(".marble"));
```

#### ❌ KHÔNG CẦN — Path cố định, không tính toán

```javascript
// Path biết trước → GSAP MotionPath trực tiếp
gsap.to(".dot", {
  motionPath: { path: "#svgPath", align: "#svgPath" },
  duration: 2,
});
```

---

## Tóm tắt — Bảng cuối

| Algorithm             | GSAP cần khi                               | GSAP không cần khi          |
| --------------------- | ------------------------------------------ | --------------------------- |
| **Binary Search**     | Keyframe lookup, Virtual Scroll >10K items | Vài items cố định           |
| **Graph BFS/DFS**     | Ripple effect, Scene tree traverse, Maze   | Stagger đơn giản theo array |
| **Sorting + FLIP**    | Cards bay về vị trí mới, Live feed sort    | Sort tĩnh không animate     |
| **Sliding Window**    | Scroll velocity avg, FPS monitor           | Ease GSAP đã đủ             |
| **Frequency Counter** | Filter group animation, Tag scale by freq  | Stagger đều toàn bộ         |
| **Multiple Pointers** | Pinch-to-zoom, Particle compact in-place   | Draggable của GSAP          |
| **Hash Table**        | Cache DOM rects, Spatial hover detection   | < 100 elements              |
| **Dijkstra / DP**     | Pathfinding animation, Maze solver         | Path cố định → MotionPath   |

---

## Nguyên tắc quyết định

```
1. GSAP API mô tả đúng ý → Dùng GSAP, không cần algo
2. Dữ liệu lớn (>1000 items) + thao tác lặp lại → Cần algo tối ưu
3. Quan hệ giữa elements (hàng xóm, cha/con) → Graph traversal
4. Cần tính giá trị từ lịch sử frames → Sliding Window
5. Lookup O(1) thay loop O(N) → Hash Map / Set
6. Sorted data + tìm kiếm nhanh → Binary Search
```

---

## Bảng Chống Ngụy Biện (Anti-rationalization Table)

| Cớ của AI (AI's Excuse)                                                                                                 | Phản biện bắt buộc của Hệ thống (System's Rebuttal)                                                                                                                                                                     |
| ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `"GSAP có hàm stagger rồi, tôi không cần dùng BFS để tạo hiệu ứng sóng (ripple) cho grid."`                             | **SAI LẦM.** Hàm stagger của GSAP chỉ delay theo index mảng tĩnh (1D). Để tạo hiệu ứng lan tỏa không gian (2D/3D) dựa trên điểm click, BẮT BUỘC phải dùng thuật toán Graph BFS để tính toán delay dựa trên khoảng cách. |
| `"Tôi sẽ dùng vòng lặp for() duyệt 10,000 phần tử DOM để tìm phần tử hiển thị trên màn hình rồi dùng GSAP animate nó."` | **DỪNG LẠI.** Vòng lặp `O(N)` trong sự kiện Scroll sẽ làm giật lag trình duyệt trầm trọng. Nếu danh sách đã được sắp xếp (chiều cao cộng dồn), BẮT BUỘC phải dùng Binary Search `O(log N)` để tìm phần tử.              |
| `"Tôi muốn filter sản phẩm có animation mượt, tôi sẽ ẩn/hiện DOM bằng display: none kết hợp GSAP fade."`                | **KHÔNG ĐƯỢC PHÉP.** Việc đổi cấu trúc DOM đột ngột không thể tạo ra animation di chuyển mượt mà. Phải sử dụng mô hình FLIP Animation kết hợp hàm `.sort()` hoặc Frequency Counter.                                     |

## Tiêu chí Thoát (Hard Exit Criteria)

- Nếu tác vụ chỉ là animate cơ bản (từ A -> B, stagger mảng đơn giản), AI phải tải `skills/gsap-core/SKILL.md` và bỏ qua thuật toán.
- Nếu tác vụ xử lý trên 1000+ items hoặc cấu trúc logic phức tạp (Maze, Ripple, Hash), AI BẮT BUỘC phải tự động tải và áp dụng một thuật toán trong danh sách trên trước khi viết `gsap.to()`.

---

## 🤖 Agent OS Anti-Rationalization

> [!CAUTION]
> **Tác tử AI ĐỌC KỸ TRƯỚC KHI CODE:**
>
> 1. **Cấm lười biếng CSS:** Không dùng CSS Transitions (`transition: all 0.3s`) để code Animation. BẮT BUỘC dùng GSAP.
> 2. **Vanilla JS Thuần Túy:** Hệ thống này KHÔNG dùng React/Vue. Cấm đề xuất các hook như `useGSAP()` hay `useEffect`. Phải tự quản lý bộ nhớ thủ công bằng `ScrollTrigger.kill()` và `timeline.kill()` khi hủy element hoặc chuyển trang (ví dụ Barba.js/Pjax).
> 3. **Bảo vệ Main Thread:** Không animate `width`, `height`, `top`, `left`. BẮT BUỘC animate `x`, `y`, `scale`, `opacity`, `rotation` để kích hoạt GPU Hardware Acceleration.
