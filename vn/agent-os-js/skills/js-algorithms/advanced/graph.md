---
name: graph
description: Kỹ năng Agent chuyên biệt về graph cho hệ thống JavaScript High-Performance.
---

# Graph — Đồ thị và Graph Traversal

Graph mô phỏng mạng lưới thực tế: Google Maps, Facebook, Webpack Dependency Graph, UI Component relationships.
Khác Tree: không phân cấp, không có Root cố định, Node bình đẳng, có thể có Cycles.

---

## Adjacency List — Biểu diễn Graph

```
Adjacency Matrix vs Adjacency List:
  Matrix [V×V]: O(V²) space — tốn RAM cho Sparse Graph (Facebook 3B user, ~300 bạn/người)
  List   {key:[...]}: O(V+E) space — chỉ lưu kết nối thực tế → tối ưu

Undirected (Vô hướng): A-B → A có B trong list VÀ B có A trong list (bạn bè Facebook)
Directed   (Có hướng): A→B → chỉ A có B trong list (Twitter follower)
Weighted   (Có trọng số): Cạnh có giá trị (khoảng cách đường, chi phí)
```

```javascript
class Graph {
  constructor() {
    this.adjacencyList = {};
  }

  // O(1) — Guard: không ghi đè nếu đã tồn tại (xóa sạch bạn bè cũ!)
  addVertex(v) {
    if (!this.adjacencyList[v]) this.adjacencyList[v] = [];
  }

  // O(1) — Undirected: nối 2 chiều
  addEdge(v1, v2) {
    if (this.adjacencyList[v1] && this.adjacencyList[v2]) {
      this.adjacencyList[v1].push(v2);
      this.adjacencyList[v2].push(v1);
    }
  }

  // O(E) — filter() duyệt toàn bộ danh sách cạnh
  removeEdge(v1, v2) {
    this.adjacencyList[v1] = this.adjacencyList[v1].filter((v) => v !== v2);
    this.adjacencyList[v2] = this.adjacencyList[v2].filter((v) => v !== v1);
  }

  // O(V+E) — Phải cắt đứt TẤT CẢ cạnh trước khi delete vertex
  // Không làm → Dangling Reference → App crash khi duyệt đồ thị
  removeVertex(v) {
    if (!this.adjacencyList[v]) return;
    // while + pop(): vừa lấy ra xử lý vừa thu nhỏ mảng, không bị Index Shifting
    while (this.adjacencyList[v].length) {
      const adj = this.adjacencyList[v].pop();
      this.removeEdge(v, adj);
    }
    delete this.adjacencyList[v];
  }
}
```

### Nâng cấp: Set thay Array

```javascript
// ✗ Array: removeEdge dùng filter() = O(E)
// ✓ Set: adjacencyList[v].delete(neighbor) = O(1) tuyệt đối
// Quan trọng khi người nổi tiếng có 10M follower → filter() gây freeze

addVertex(v) { if (!this.adjacencyList[v]) this.adjacencyList[v] = new Set(); }
addEdge(v1, v2) { this.adjacencyList[v1].add(v2); this.adjacencyList[v2].add(v1); }
removeEdge(v1, v2) { this.adjacencyList[v1].delete(v2); this.adjacencyList[v2].delete(v1); }
```

---

## Graph Traversal — DFS và BFS

```
Tử huyệt: Graph có Cycles (A→B→A) → không có visited Set → Infinite Loop → crash
Luôn khởi tạo visited Set TRƯỚC TIÊN, đánh dấu NGAY KHI PUSH vào Queue/Stack
✗ AI bug: đánh dấu sau khi pop → cùng 1 node bị push vào Queue nhiều lần → Memory Leak
```

```javascript
class Graph {
  // 1. DFS Recursive — thanh lịch, rủi ro Stack Overflow với graph sâu
  depthFirstSearchRecursive(start) {
    const result = [];
    const visited = new Set();

    const dfs = (vertex) => {
      if (!vertex) return;
      visited.add(vertex);
      result.push(vertex);
      for (const neighbor of this.adjacencyList[vertex]) {
        if (!visited.has(neighbor)) dfs(neighbor);
      }
    };

    dfs(start);
    return result;
  }

  // 2. DFS Iterative — an toàn, không giới hạn Call Stack
  // ⚠️ Kết quả KHÁC recursive vì LIFO lấy phần tử cuối trước
  // Recursive: ưu tiên hàng xóm ĐẦU (push stack sau → pop trước = hàng xóm CUỐI)
  // → Để kết quả giống recursive: reverse() mảng hàng xóm trước khi push
  depthFirstSearchIterative(start) {
    const stack = [start];
    const result = [];
    const visited = new Set([start]); // Đánh dấu ngay khi push!

    while (stack.length > 0) {
      const curr = stack.pop(); // LIFO
      result.push(curr);
      for (const neighbor of this.adjacencyList[curr]) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          stack.push(neighbor);
        }
      }
    }
    return result;
  }

  // 3. BFS — tìm đường ngắn nhất trong unweighted graph
  // ✗ queue.shift() = O(N) reindex → BFS thực tế O(N²) với mảng lớn
  // ✓ Head pointer = O(1) dequeue
  breadthFirstSearch(start) {
    const queue = [start];
    const result = [];
    const visited = new Set([start]);
    let head = 0; // Con trỏ thay thế shift()

    while (head < queue.length) {
      const curr = queue[head++]; // O(1) — không dịch chuyển mảng
      result.push(curr);
      for (const neighbor of this.adjacencyList[curr]) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    return result;
  }
}
```

---

## DFS vs BFS — Quyết định

```
              DFS (Stack/Recursion)           BFS (Queue)
Chiến lược:   Đi sâu theo một nhánh          Lan tỏa theo từng vòng
Cấu trúc:     Stack LIFO                     Queue FIFO
Space:        O(H) — chiều sâu max            O(W) — chiều rộng max
Shortest:     KHÔNG (có thể bỏ sót)          CÓ — guaranteed trong unweighted graph

Dùng DFS khi:
  Thám hiểm, đếm components, detect cycle
  DOM traversal (HTML Rộng+Nông → DFS an toàn, depth ≈ 15-30)
  Webpack: detect Circular Dependency (A import B, B import A)
  Three.js scene.traverse(): tính World Matrix từ cha xuống con

Dùng BFS khi:
  Tìm đường ngắn nhất (Shortest Path) — unweighted
  "Gợi ý kết bạn" (vòng 1, vòng 2)
  Next.js prefetch: quét link cấp 1 trên màn hình → tải ngầm
  Ripple Animation → xem phần dưới

DFS Recursive vs Iterative:
  Recursive: Call Stack limit ≈ 10K → RangeError với graph sâu
  Iterative: Stack Array → kiểm soát Heap, an toàn với mọi kích thước
  Production: luôn ưu tiên Iterative
```

---

## DFS — Iterative True vs Fake

```javascript
// Thứ tự duyệt KHÁC NHAU giữa Recursive và Iterative — đây không phải bug!
// Recursive: đọc hàng xóm trái → phải, chui ngay vào nhánh ĐẦU TIÊN
// Iterative: push hàng xóm vào Stack, pop() rút phần tử CUỐI — bị đảo ngược
// Fix: push hàng xóm theo thứ tự reversed để ra kết quả giống Recursive

// ❌ FAKE DFS — đánh dấu trước khi pop (AI thường mắc)
// Vô tình bỏ qua đường đi sâu hơn vì đỉnh bị đánh dấu sớm từ nhánh nông
dfsIterativeFake(start) {
  const stack = [start];
  const visited = new Set([start]); // ❌ đánh dấu khi push
  while (stack.length) {
    const curr = stack.pop();
    // nếu curr bị đánh dấu từ nhiều hướng → chỉ 1 hướng thắng, hướng còn lại bị bỏ
    for (const n of this.adjacencyList[curr]) {
      if (!visited.has(n)) { visited.add(n); stack.push(n); }
    }
  }
}

// ✓ TRUE DFS — đánh dấu SAU KHI pop (đúng chuẩn)
dfsIterative(start) {
  const stack   = [start];
  const result  = [];
  const visited = new Set();

  while (stack.length) {
    const curr = stack.pop();
    if (visited.has(curr)) continue; // Một đỉnh có thể bị push nhiều lần — check khi pop
    visited.add(curr);
    result.push(curr);

    // Push theo thứ tự thường → pop() ra ngược → nếu muốn giống Recursive: reverse trước
    // for (const n of [...this.adjacencyList[curr]].reverse()) { if(!visited.has(n)) stack.push(n); }
    for (const n of this.adjacencyList[curr]) { if (!visited.has(n)) stack.push(n); }
  }
  return result;
}

// Arrow Function — giải quyết lỗi `this` mất context
// function dfs() {} bên trong class → this = undefined (strict mode)
// const dfs = () => {}  → Lexical Binding → this = class instance
// ES5 workaround: const self = this; — rườm rà, không dùng

// 3 cách bind this:
//   1. ES5: const adjacencyList = this.adjacencyList;  ← rườm rà
//   2. .bind(this):  (function dfs(){...}).bind(this)  ← tường minh nhưng dài
//   3. Arrow Function: const dfs = (v) => {...}        ← luôn dùng trong class

// Circular Reference trong deep clone:
//   DFS Object lồng nhau → dùng WeakMap làm visited (thay Set)
//   WeakMap tự GC khi object không còn reference → không Memory Leak
//   const seen = new WeakMap(); if(seen.has(obj)) return; seen.set(obj, true);
```

---

## Animation Chunking — DFS không block Main Thread

```javascript
// Vấn đề: scene.traverse() (DFS đệ quy) trên 100K nodes → block 2 giây → rớt FPS thảm hại
// Đệ quy KHÔNG thể "tạm dừng" → phải chạy đến xong
// Iterative CÓ THỂ tạm dừng và tiếp tục frame sau

class ChunkedTraverser {
  #stack = [];
  #visited = new Set();
  #isRunning = false;

  start(root) {
    this.#stack = [root];
    this.#isRunning = true;
    this.#tick();
  }

  #tick() {
    if (!this.#isRunning || !this.#stack.length) return;

    const frameStart = performance.now();
    let processed = 0;

    while (this.#stack.length && processed < 500) {
      // Tối đa 500 nodes/frame
      const node = this.#stack.pop();
      if (this.#visited.has(node)) continue;
      this.#visited.add(node);

      this.#processNode(node); // update material, calculate matrix, v.v.

      if (node.children) for (const c of node.children) this.#stack.push(c);
      processed++;

      // Time budget: nhường browser nếu đã dùng quá 14ms
      if (performance.now() - frameStart > 14) break;
    }

    if (this.#stack.length) {
      requestAnimationFrame(() => this.#tick()); // Hẹn frame sau làm tiếp
    }
  }
}
// → Scene Graph 100K nodes xử lý mượt 60fps thay vì block 2 giây
// → Chỉ Iterative DFS mới làm được: lưu stack ra ngoài, tiếp tục frame sau
```

---

## BFS — Visited Rules & Mutation Guard

```javascript
// Colt Steele Bug: quên đánh dấu start → start bị hàng xóm push lại vào Queue → vòng lặp
// Rule: ĐÁNH DẤU NGAY KHI PUSH — không phải khi pop

bfs(start) {
  if (!this.adjacencyList[start]) return [];
  const queue   = [start];
  const result  = [];
  const visited = new Set([start]); // ✓ Đánh dấu start ngay lập tức
  let head      = 0; // O(1) dequeue thay shift() O(N)

  while (head < queue.length) {
    const curr = queue[head++];
    result.push(curr);

    for (const neighbor of this.adjacencyList[curr]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor); // ✓ Đánh dấu TRƯỚC KHI push
        queue.push(neighbor);
      }
    }
  }
  return result;
}

// Mutation Guard khi đảo chiều:
// ✗ this.adjacencyList[curr].reverse() → mutate mảng GỐC → phá cấu trúc đồ thị
// ✓ [...this.adjacencyList[curr]].reverse() → clone trước, reverse bản sao
// ✓ this.adjacencyList[curr].slice().reverse() → tương đương

// BFS cho Flood Fill (Canvas):
// Công cụ "xô đổ màu" quét pixel kề cạnh cùng màu → lan ra cho đến viền
// Mỗi pixel = 1 node, 4 hàng xóm (trên/dưới/trái/phải) = 4 edges
// BFS đảm bảo lan theo từng vòng → hiệu ứng lan màu tự nhiên

// Spatial Navigation (Smart TV):
// Khi bấm D-Pad → BFS quét Virtual DOM Grid
// Tìm element Focusable gần nhất theo khoảng cách vật lý → di chuyển focus

// State Management insight:
// Colt quên setVisited(start) = quên setIsLoading(true) ngay khi bấm Submit
// → User bấm 3 lần → 3 API request rác
// Triết lý: cắm cờ NGAY KHI ra quyết định hành động, không đợi kết quả
```

---

## Ripple Animation với BFS + GSAP

```javascript
// Grid 400 ô (Graph vô hướng: mỗi ô nối với 4 ô kề)
// User click ô → gợn sóng màu lan tỏa ra

function rippleFromClick(clickedCell, grid, gsap) {
  const visited = new Set([clickedCell]);
  const queue = [{ cell: clickedCell, dist: 0 }];
  let head = 0;

  while (head < queue.length) {
    const { cell, dist } = queue[head++];

    gsap.to(cell.element, {
      backgroundColor: "#00ffcc",
      delay: dist * 0.05, // Hàng xóm xa hơn → delay lớn hơn → sóng loang dần
      duration: 0.3,
    });

    for (const neighbor of getNeighbors(cell, grid)) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push({ cell: neighbor, dist: dist + 1 });
      }
    }
  }
}
// BFS đảm bảo dist chính xác → animation loang đều như sóng nước thực sự
```

---

## Quick Reference

```
Big O (Adjacency List):
  addVertex:     O(1)
  addEdge:       O(1)
  removeEdge:    O(E) với Array, O(1) với Set ← dùng Set khi E lớn
  removeVertex:  O(V+E)
  DFS/BFS:       O(V+E) — mỗi đỉnh thăm 1 lần, mỗi cạnh kiểm tra 1 lần

Adjacency List Space: O(V+E) — tối ưu cho Sparse Graph
Adjacency Matrix Space: O(V²) — chỉ dùng cho Dense Graph nhỏ

visited Set quy tắc:
  ✓ Đánh dấu NGAY KHI PUSH vào Queue/Stack
  ✗ Đánh dấu sau khi pop → node bị push nhiều lần → Memory Leak

removeVertex quy tắc:
  1. Xóa toàn bộ cạnh TRƯỚC (dùng removeEdge với từng hàng xóm)
  2. SAU ĐÓ mới delete khỏi adjacencyList
  Bỏ qua bước 1 → Dangling Reference → crash

BFS shift() trap:
  shift() = O(N) re-index → BFS thực tế O(N²) với mảng lớn
  Fix: let head = 0; queue[head++] → O(1) dequeue

Frontend use cases:
  Webpack/Vite: Dependency Graph → detect circular imports
  Facebook: "Bạn của bạn" gợi ý kết bạn (BFS level 1, 2)
  Google Maps: Dijkstra trên Weighted Graph
  Three.js: scene.traverse() = DFS PreOrder
  DOM: nextElementSibling/previousElementSibling = Linked List
  Ripple Animation: BFS + dist × delay → GSAP stagger tự nhiên
  Node-based UI: WebGL Node Editor, Blender Material = Graph visualization
```

---

## Map + Set Upgrade — Production Grade

```javascript
// ✗ Object + Array (code học thuật):
//   Key bị ép về String → DOM Node làm Key bị ép "[object Object]"
//   Array.filter() trong removeEdge → O(E) + tạo mảng rác
//   delete obj.key → phá vỡ V8 Hidden Classes → Dictionary Mode (chậm)

// ✓ Map + Set (Production):
class ProGraph {
  constructor() {
    this.adjacencyList = new Map(); // Key là bất cứ thứ gì, không bị ép String
  }

  addVertex(v) {
    if (!this.adjacencyList.has(v)) this.adjacencyList.set(v, new Set());
  }

  addEdge(v1, v2) {
    // Defensive: guard clause trước khi thao tác
    if (!this.adjacencyList.has(v1) || !this.adjacencyList.has(v2)) {
      console.warn(`[Graph] Vertex không tồn tại: ${v1} hoặc ${v2}`);
      return;
    }
    this.adjacencyList.get(v1).add(v2);
    this.adjacencyList.get(v2).add(v1); // Xóa dòng này nếu Directed Graph
  }

  removeEdge(v1, v2) {
    // Set.delete() O(1) — không tạo mảng rác như filter()
    this.adjacencyList.get(v1)?.delete(v2);
    this.adjacencyList.get(v2)?.delete(v1);
  }

  removeVertex(v) {
    if (!this.adjacencyList.has(v)) return;

    // for...of trên Set an toàn khi delete (không bị index shifting như forEach+splice)
    for (const neighbor of this.adjacencyList.get(v)) {
      this.adjacencyList.get(neighbor)?.delete(v); // Cắt dây từ hàng xóm trỏ về v
    }
    // Map.delete() an toàn, không phá V8 Hidden Classes
    this.adjacencyList.delete(v);
  }
}
```

### Tại sao `delete obj.key` nguy hiểm

```
V8 tối ưu Object bằng Hidden Classes (ngầm tạo cấu trúc C++ struct-like)
→ Truy xuất thuộc tính cực nhanh

delete obj.key → phá vỡ Hidden Class
→ V8 chuyển Object sang Dictionary Mode (Hash Table chậm chạp)
→ Mọi truy xuất sau đó đều chậm hơn đáng kể

✓ Dùng Map.delete() thay vì delete obj.key
✓ Hoặc gán null: obj.key = null (giữ Hidden Class)
✗ Không bao giờ delete trong code performance-critical
```

### while + pop() vs for...of — Mutation Bug

```javascript
// ❌ Bug khi vừa lặp vừa xóa phần tử của cùng mảng (nếu dùng forEach):
// for (const neighbor of this.adjacencyList[v]) {
//   this.removeEdge(v, neighbor); // removeEdge chứa filter() → thu ngắn mảng
//   // Vòng lặp tiếp tục với index cũ → "nhảy cóc" bỏ sót phần tử!
// }

// ✓ while + pop() (cách học thuật an toàn):
while (this.adjacencyList[v].length) {
  const neighbor = this.adjacencyList[v].pop(); // Rút từ CUỐI, không ảnh hưởng index
  this.removeEdge(v, neighbor);
}

// ✓ for...of trên Set (cách Production):
// Set hỗ trợ modification-safe iteration → không bị nhảy cóc
for (const neighbor of this.adjacencyList.get(v)) {
  this.adjacencyList.get(neighbor)?.delete(v);
}

// Lặp an toàn với Array:
//   Lặp ngược: for (i = arr.length-1; i >= 0; i--) arr.splice(i, 1)
//   while + pop(): thu nhỏ từ cuối, không ảnh hưởng phần tử trước
```

### Big O Comparison

```
Thao tác          Adjacency List (Set)   Adjacency Matrix
Space             O(V+E) ✅             O(V²) ❌
addVertex         O(1) ✅               O(V²) ❌ — phải clone/resize toàn bộ lưới
addEdge           O(1) ✅               O(1) ✅
removeEdge        O(1) ✅               O(1) ✅
Query (A-B?)      O(1) ✅               O(1) ✅
removeVertex      O(E) ✅               O(V) ✅
Sparse Graph      ✅ Rất tốt            ❌ Lãng phí — FB 3B user × 300 bạn
Dense Graph       ❌ Kém hơn            ✅ Khi E ≈ V²

removeVertex với Array:  O(E²) ← while-pop gọi filter() O(E) bên trong
removeVertex với Set:    O(E)  ← for...of gọi Set.delete() O(1)
→ Với node có 10K kết nối: Array=100M phép tính, Set=10K phép tính
```

### Additional Use Cases

```
State Machines (XState): Idle→Loading→Error = Directed Graph (Đồ thị có hướng)
Dependency Graph (State Manager): khi A đổi → tính B, C phụ thuộc → re-render chính xác
N8N / Figma Prototyping = Graph visualization (kéo thả nodes + edges)
GSAP cleanup: gsap.killTweensOf(element) = removeEdge giữa GSAP Engine và DOM
Scene Graph (Three.js): Parent tịnh tiến → Matrix Multiplication xuống Con (Directed)
  car.add(wheel1) = addEdge(car, wheel1) trong Directed Scene Graph

Soft Delete cho removeVertex (Production):
  node.isDeleted = true → O(1)
  UI ẩn ngay lập tức (mượt mà)
  Background Job dọn dẹp thật sự lúc rảnh
  → Tránh Hard Delete O(E) block Main Thread với node nhiều kết nối

Immutability với UI State:
  Map.set() / Set.add() mutate trực tiếp → Hệ thống Proxy bỏ qua re-render
  Dùng Immer.js (enableMapSet()) → viết code mutate bình thường
  Tự trả về mảng/object mới → State Manager nhận ra thay đổi → re-render
```

---

## 🤖 Agent OS Anti-Rationalization

> [!CAUTION]
> **Tác tử AI ĐỌC KỸ TRƯỚC KHI CODE:**
>
> 1. **Cấm dùng Ma trận kề sai bối cảnh:** Cấm dùng Adjacency Matrix (O(V²)) cho đồ thị thưa thớt (Sparse Graph - như mạng lưới user). BẮT BUỘC dùng Adjacency List (Map/Object).
> 2. **Tránh Vòng lặp Vô tận (Infinite Cycle):** Đồ thị KHÔNG giống Tree. Tuyệt đối cấm duyệt (Traverse) mà không có biến `visited` (dùng `Set`) để đánh dấu các node đã đi qua.
> 3. **Tránh tạo rác (GC) khi duyệt:** Không cấp phát mảng Array mới (`[]`) bên trong thân hàm đệ quy duyệt Graph.
