---
name: binary-heap
description: Kỹ năng Agent chuyên biệt về binary-heap cho hệ thống JavaScript High-Performance.
---

# Binary Heap — Priority Queue

Array-based tree: không dùng Node/Pointer, lưu cây vào mảng phẳng → CPU Cache Locality.

---

## Bản chất — Array làm Cây

```
Cây nhị phân hoàn chỉnh ép vào Array (0-indexed):
  Node tại index n:
    Con trái:  2n + 1
    Con phải:  2n + 2
    Cha:       (n - 1) >> 1  ≡ Math.floor((n-1)/2)  [bitwise nhanh hơn]

Max Heap: Cha luôn >= Con (không có thứ tự Trái/Phải)
Min Heap: Cha luôn <= Con

Array: [41, 39, 33, 18, 27, 12]
Cây:        41
          /    \
        39      33
       /  \    /
      18  27  12

Không cần con trỏ left/right → tiết kiệm 2N pointer
Dữ liệu liên tiếp → CPU Cache L1/L2 Hit → nhanh hơn Node/Pointer
```

---

## insert() → bubbleUp()

```javascript
class MaxBinaryHeap {
  constructor() {
    this.values = [];
  }

  insert(element) {
    this.values.push(element); // Thêm cuối → giữ hình dạng cây
    this.bubbleUp();
  }

  bubbleUp() {
    let idx = this.values.length - 1;
    const el = this.values[idx];

    while (idx > 0) {
      const parentIdx = (idx - 1) >> 1; // Bitwise >> 1 = Math.floor / 2
      const parent = this.values[parentIdx];

      if (el <= parent) break; // Đúng vị trí → dừng

      // ES6 Destructuring swap — không cần biến temp
      [this.values[parentIdx], this.values[idx]] = [el, parent];
      idx = parentIdx; // Leo lên 1 tầng
    }
  }
}
// insert 1M phần tử: tối đa ~20 bước leo (chiều cao = log N)
// Time O(log N), Space O(1) — in-place
```

---

## extractMax() → sinkDown()

```javascript
extractMax() {
  if (this.values.length === 0) return undefined;

  const max = this.values[0];           // Giữ Root cũ
  const end = this.values.pop();        // Bốc phần tử bét bảng — O(1)

  // ⚠️ Edge case: nếu ban đầu chỉ có 1 phần tử
  // pop() xong mảng rỗng, KHÔNG gán ngược lại
  if (this.values.length > 0) {
    this.values[0] = end;               // Nhân viên bét bảng lên làm CEO
    this.sinkDown();
  }
  return max;
}

sinkDown() {
  let idx           = 0;
  const length      = this.values.length;
  const element     = this.values[0];

  while (true) {
    const leftIdx   = 2 * idx + 1;
    const rightIdx  = 2 * idx + 2;
    let swapIdx     = null;

    // Kiểm tra con trái
    if (leftIdx < length && this.values[leftIdx] > element) {
      swapIdx = leftIdx;
    }

    // Kiểm tra con phải — phải lớn hơn ELEMENT và lớn hơn CON TRÁI
    if (rightIdx < length) {
      const right = this.values[rightIdx];
      if (
        (swapIdx === null && right > element) ||
        (swapIdx !== null && right > this.values[leftIdx])
      ) {
        swapIdx = rightIdx;
      }
    }

    if (swapIdx === null) break;       // Đúng vị trí → dừng

    [this.values[idx], this.values[swapIdx]] = [this.values[swapIdx], element];
    idx = swapIdx;                     // Chìm xuống 1 tầng
  }
}
// AI bug: chỉ check right > element, quên check right > left → swap với đứa con nhỏ hơn!
// AI bug: bỏ sót if (values.length > 0) → gán ngược phần tử đã xóa trở lại
```

---

## Heap vs Array.sort()

```
Array.sort() mỗi lần insert mới: O(N log N) → nghẽn Main Thread
MaxBinaryHeap insert + extractMax: O(log N) mỗi thao tác

Ví dụ: streaming 10K giá chứng khoán, lấy max liên tục
  Array.sort(): 10K × O(N log N) = catastrophic
  MaxHeap:      10K × O(log N)   = ~130K bước tổng cộng

Nhược điểm: Random search trong Heap = O(N)
  Anh em lộn xộn (không có thứ tự Trái/Phải) → phải scan toàn bộ
```

---

## Priority Queue — Frontend Use Cases

```
Concurrent Task Scheduling (Min Heap):
  Task gõ phím (High Priority) vs load data ngầm (Low Priority)
  Min Heap dựa trên expirationTime → extractMin() lấy task khẩn nhất
  → UI không bị đơ giật khi background loading

Network Request Manager:
  Hero Banner image → priority cao → gần đỉnh Heap
  Footer image → priority thấp → chìm xuống
  extractMax() quyết định fetch file nào trước

Pathfinding — A*, Dijkstra:
  Game Canvas, Map routing
  Min Heap lấy node có chi phí nhỏ nhất → O(log N) mỗi bước

WebGL Z-Depth Sorting (Three.js):
  10K particles, khoảng cách Z thay đổi 60fps
  Max Heap sort Z → vẽ hạt xa trước (Painter's Algorithm)
  Array.sort() mỗi frame → sập, Heap O(log N) → 60fps ổn định

GSAP ScrollTrigger Queue:
  Nhiều animation tranh nhau kích hoạt
  Heap-like structure ưu tiên element nằm giữa Viewport nhất
```

---

## Quick Reference

```
Big O:
  insert:      O(log N) — leo lên ≤ chiều cao cây
  extractMax:  O(log N) — chìm xuống ≤ chiều cao cây
  peek max:    O(1)     — luôn là values[0]
  search:      O(N)     — không có thứ tự ngang → scan toàn bộ

Toán học Heap (0-indexed):
  Con trái:  2n + 1
  Con phải:  2n + 2
  Cha:       (n-1) >> 1  [bitwise = Math.floor nhanh hơn ở hardware]

Quy tắc swap (extractMax sinkDown):
  Phải swap với đứa con LỚN NHẤT trong 2 đứa (không phải chỉ lớn hơn cha)
  Logic: (swapIdx === null && right > el) || (swapIdx !== null && right > left)

ES6 Destructuring swap:
  [arr[i], arr[j]] = [arr[j], arr[i]] — không cần biến temp

Edge case tử thần extractMax:
  if (values.length > 0) mới gán values[0] = end
  Bỏ qua → gán lại phần tử đã xóa → dữ liệu rác

Iterative > Recursive cho bubbleUp/sinkDown:
  Đệ quy deep data → Maximum call stack exceeded → dùng while loop

Hình ảnh:
  insert → "Bong bóng khí" (chui vào đáy, nhẹ → sủi lên đỉnh)
  extractMax → "Hòn đá" (bốc đỉnh, ném sỏi bé lên, nặng → chìm xuống đúng chỗ)

Heap vs BST:
  BST: O(log N) search tất cả, có thứ tự Trái < Cha < Phải
  Heap: O(1) peek max/min, O(log N) insert/extract, O(N) search ngẫu nhiên
  Dùng Heap khi: chỉ cần lấy max/min liên tục (Priority Queue)
  Dùng BST khi: cần search, sort, range queries
```

---

## Priority Queue — Min Heap

```javascript
// Priority Queue: Khái niệm trừu tượng, Binary Heap = "động cơ" tối ưu
// Array thuần: enqueue O(1), nhưng dequeue (tìm min) O(N) → chậm
// Min Heap: enqueue O(log N), dequeue O(log N) — mức ưu tiên nhỏ = quan trọng hơn

class PQNode {
  constructor(val, priority) {
    this.val = val;
    this.priority = priority;
  }
}

class PriorityQueue {
  constructor() {
    this.values = [];
  }

  enqueue(val, priority) {
    this.values.push(new PQNode(val, priority));
    this.#bubbleUp();
  }

  #bubbleUp() {
    let idx = this.values.length - 1;
    const el = this.values[idx];
    while (idx > 0) {
      const pIdx = (idx - 1) >> 1;
      const parent = this.values[pIdx];
      if (el.priority >= parent.priority) break; // MIN HEAP: dừng nếu >= cha
      [this.values[pIdx], this.values[idx]] = [el, parent];
      idx = pIdx;
    }
  }

  dequeue() {
    if (!this.values.length) return undefined;
    const min = this.values[0];
    const end = this.values.pop();
    if (this.values.length > 0) {
      // Edge case: tránh zombie data
      this.values[0] = end;
      this.#sinkDown();
    }
    return min;
  }

  #sinkDown() {
    let idx = 0;
    const el = this.values[0];
    const n = this.values.length;
    while (true) {
      const lIdx = 2 * idx + 1,
        rIdx = 2 * idx + 2;
      let swap = null;
      if (lIdx < n && this.values[lIdx].priority < el.priority) swap = lIdx;
      if (rIdx < n) {
        const r = this.values[rIdx];
        if (
          (swap === null && r.priority < el.priority) ||
          (swap !== null && r.priority < this.values[lIdx].priority)
        )
          swap = rIdx;
      }
      if (swap === null) break;
      [this.values[idx], this.values[swap]] = [this.values[swap], el];
      idx = swap;
    }
  }
}

// Ứng dụng:
const tasks = new PriorityQueue();
tasks.enqueue("Xử lý click user", 1); // Cấp bách nhất
tasks.enqueue("Tải CSS background", 5);
tasks.enqueue("Render Hero image", 2);
console.log(tasks.dequeue().val); // "Xử lý click user"
```

---

## Stable Priority Queue — Tie-Breaker

```javascript
// Khi 2 task cùng priority → phải FIFO (vào trước ra trước)
// ✗ Date.now() → V8 quá nhanh, 2 task cùng ms → không phân biệt được
// ✓ Auto-increment integer → an toàn tuyệt đối

class StablePriorityQueue {
  #counter = 0;
  #values = [];

  enqueue(val, priority) {
    this.#values.push({ val, priority, order: this.#counter++ });
    this.#bubbleUp();
  }

  #bubbleUp() {
    let idx = this.#values.length - 1;
    const el = this.#values[idx];
    while (idx > 0) {
      const pIdx = (idx - 1) >> 1;
      const p = this.#values[pIdx];
      // TIE-BREAKER: cùng priority → dừng nếu order lớn hơn (vào sau)
      if (el.priority > p.priority) break;
      if (el.priority === p.priority && el.order > p.order) break;
      [this.#values[pIdx], this.#values[idx]] = [el, p];
      idx = pIdx;
    }
  }
  // dequeue + sinkDown: thêm tie-breaker tương tự
}
```

---

## Lazy Deletion — O(1) Cancel

```javascript
// User bấm Cancel một task đang trong Heap
// ✗ Tìm trong Heap để xóa = O(N) → phá vỡ hiệu năng
// ✓ Lazy Deletion: đánh dấu cancelled, bỏ qua khi dequeue

class LazyPriorityQueue {
  #values    = [];
  #cancelled = new Set(); // ID của các task bị cancel

  enqueue(id, priority) { ... }

  cancel(id) { this.#cancelled.add(id); }  // O(1)

  dequeue() {
    while (this.#values.length) {
      const top = this.#values[0]; // peek
      if (!this.#cancelled.has(top.id)) return this.#extractTop(); // O(log N)
      this.#extractTop(); // Vứt đi, lấy tiếp
    }
    return undefined;
  }
}
// → Tốc độ cancel O(1), không ảnh hưởng đến structure của Heap
```

---

## Parallel Arrays — Zero GC (Data-Oriented Design)

```javascript
// ✗ new Node() mỗi enqueue → GC Thrashing → Jank trong WebGL 60fps loop
// ✓ Parallel Arrays: không tạo Object → không sinh rác bộ nhớ

class FastPriorityQueue {
  #vals = [];
  #pris = [];

  enqueue(val, priority) {
    this.#vals.push(val);
    this.#pris.push(priority);
    // bubbleUp: hoán đổi cả 2 mảng song song
  }

  #swap(i, j) {
    [this.#vals[i], this.#vals[j]] = [this.#vals[j], this.#vals[i]];
    [this.#pris[i], this.#pris[j]] = [this.#pris[j], this.#pris[i]];
  }
}
// → 0 Object allocation → GC không bao giờ chạy → 120fps ổn định
```

---

## Advanced Patterns

```
Heap vs BST — Guaranteed Balance:
  BST: có thể thoái hóa thành Linked List O(N) (khi insert sorted data)
  Heap: Complete Tree rule → luôn cân bằng → O(log N) WORST CASE guaranteed
  → Heap an toàn hơn BST cho Priority Queue production

Heap vs Array.sort():
  Array.sort() mỗi lần insert: O(N log N) → Main Thread freeze
  Heap: insert O(log N) + dequeue O(log N) → từng thao tác nhỏ, không block

K-Nearest Neighbors (Bounded Max-Heap):
  100K particles, tìm 5 hạt gần chuột nhất mỗi frame 60fps
  ✗ Array.sort() toàn bộ: O(N log N) × 60 = sập
  ✓ Bounded Max-Heap kích thước 5:
    Duyệt qua 100K hạt O(N), với mỗi hạt:
      Nếu heap chưa đầy → push O(log 5)
      Nếu hạt gần hơn max trong heap → extractMax + insert O(log 5)
    Tổng: O(N log K) → với K=5, O(N log 5) ≈ O(N) thực tế

Time-Slicing với performance.now():
  Animation canvas nặng → tính toán vật lý > 16ms → frame drop
  Đẩy tasks vào PQ, dequeue từng cái, check thời gian:
    while (pq.values.length) {
      const task = pq.dequeue();
      runTask(task);
      if (performance.now() - frameStart > 14) break; // nhường cho browser render
    }
  Tasks còn lại trong PQ → làm tiếp frame sau

Decrease-Key (Update Priority trong Heap):
  Duy trì HashMap song song: { id → heapIndex }
  Update priority + bubbleUp: O(log N)
  Câu hỏi phỏng vấn Big Tech phổ biến

5-giây quyết định:
  Lấy Max/Min liên tục          → Heap
  Random search liên tục        → HashMap O(1)
  Search + Sort toàn bộ         → BST
  Cancel task đang chờ          → Heap + Lazy Deletion Set
  Zero GC, WebGL 60fps          → Parallel Arrays Heap
  K-nearest realtime            → Bounded Heap size K

log₂(1,000,000) ≈ 20 — khắc cốt ghi tâm
  1 triệu tasks → tối đa 20 vòng lặp trong Heap
```

---

## 🤖 Agent OS Anti-Rationalization

> [!CAUTION]
> **Tác tử AI ĐỌC KỸ TRƯỚC KHI CODE:**
>
> 1. **Cấm lười biếng sort liên tục:** Khi cần lấy min/max liên tục trong một tập dữ liệu động, CẤM dùng mảng thường và `.sort()` mỗi lần thêm/xóa. BẮT BUỘC dùng PriorityQueue / Binary Heap.
> 2. **Cẩn thận chỉ số Toán học:** Khi thao tác Heap bằng Array, tuyệt đối tuân thủ công thức: left child = `2n + 1`, right child = `2n + 2`, parent = `Math.floor((n - 1) / 2)`.
> 3. **Cấm dùng Object/Node rời rạc:** Binary Heap BẮT BUỘC phải dùng Flat Array (Mảng 1 chiều) để mô phỏng cây nhằm tận dụng CPU Cache (Zero GC).
