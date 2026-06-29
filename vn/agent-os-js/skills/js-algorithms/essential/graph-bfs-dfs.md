---
name: graph-bfs-dfs
description: Kỹ năng Agent chuyên biệt về graph-bfs-dfs cho hệ thống JavaScript High-Performance.
---

# Graph Traversal — DFS, BFS & Tree Traversal

DOM = Cây. Virtual DOM = Cây. Three.js Scene = Graph. Mọi hiệu ứng phức tạp đều quy về duyệt cây/đồ thị.

---

## Document — BFS vs DFS

```
BFS (Breadth-First): Loang như gợn sóng — xử lý hết siblings mỗi tầng
  Cần: Queue (FIFO)
  Dùng khi: "Gần nhất" / "Đường ngắn nhất" / Stagger Animation
  Space: O(W) — W = chiều rộng tầng lớn nhất

DFS (Depth-First): Đào sâu 1 nhánh trước khi quay lại
  Cần: Stack (LIFO) hoặc Call Stack (recursion)
  Dùng khi: Clone / Sort / Destroy / Scene Traversal
  Space: O(H) — H = chiều sâu cây

Quyết định:
  Cây Rộng → DFS (Stack nhỏ)
  Cây Sâu  → BFS (Queue nhỏ) hoặc Iterative DFS
  DOM HTML: Rộng + Nông → DFS an toàn (depth ≈ 15-30)

Queue.shift() O(N) vs Stack.pop() O(1):
  Iterative DFS + Stack LUÔN nhanh hơn BFS + Array shift()
  BFS chuẩn cần head pointer hoặc Linked List Queue
```

---

## BFS — head pointer O(1) (không dùng shift)

```javascript
function bfs(graph, start) {
  const visited = new Set([start]); // Đánh dấu start NGAY
  const queue = [start];
  const result = [];
  let head = 0; // head pointer thay shift() → O(1) dequeue

  while (head < queue.length) {
    const node = queue[head++]; // O(1) — không re-index
    result.push(node);

    for (const neighbor of graph.get(node) || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor); // Đánh dấu TRƯỚC khi push (tránh duplicate)
        queue.push(neighbor);
      }
    }
  }
  return result;
}
// ⚠️ Bỏ quên visited.add(start) → vòng lặp vô hạn quay lại start
```

### BFS Use Cases

```
Stagger Animation: BFS thu thập nodes theo tầng → gsap.to(nodes, { stagger: 0.1 })
Ripple Effect: BFS từ click point → lan tỏa ra grid cells
Three.js Frustum Culling: BFS kiểm tra node cha → cắt cả nhánh → 60fps
Mạng xã hội: Gợi ý kết bạn vòng 1, vòng 2
```

---

## DFS — True Iterative (post-pop visited)

```javascript
// True Iterative DFS — đánh dấu SAU khi pop (không phải khi push)
function dfsIterative(graph, start) {
  const visited = new Set();
  const stack = [start];
  const result = [];

  while (stack.length) {
    const node = stack.pop();
    if (visited.has(node)) continue; // Skip nếu đã xử lý
    visited.add(node); // Đánh dấu SAU pop
    result.push(node);

    // Lấy copy adjacency list — KHÔNG mutate gốc
    const neighbors = [...(graph.get(node) || [])];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) stack.push(neighbor);
    }
  }
  return result;
}
// True DFS: đường đi sâu hơn vì node có thể vào stack nhiều lần
// Fake DFS (đánh dấu khi push): bỏ lỡ đường đi sâu hơn
```

### Animation Chunking — 60fps DFS

```javascript
class ChunkedTraverser {
  #stack;
  #visited;
  #graph;
  #result;
  constructor(graph, start) {
    this.#graph = graph;
    this.#stack = [start];
    this.#visited = new Set();
    this.#result = [];
  }

  // Xử lý tối đa N nodes mỗi frame, kiểm tra deadline
  processChunk(maxNodes = 500) {
    let processed = 0;
    const deadline = performance.now() + 14; // 14ms ≈ safe for 60fps

    while (this.#stack.length && processed < maxNodes) {
      if (performance.now() > deadline) break; // Trả lại Main Thread
      const node = this.#stack.pop();
      if (this.#visited.has(node)) continue;
      this.#visited.add(node);
      this.#result.push(node);
      processed++;

      for (const neighbor of this.#graph.get(node) || []) {
        if (!this.#visited.has(neighbor)) this.#stack.push(neighbor);
      }
    }
    return this.#stack.length > 0; // true = còn việc
  }

  run(onComplete) {
    const step = () => {
      if (this.processChunk()) requestAnimationFrame(step);
      else onComplete(this.#result);
    };
    requestAnimationFrame(step);
  }
}
// Chỉ Iterative DFS mới làm được chunking — Recursive không pause được
```

---

## Tree Traversal — DFS 3 biến thể

```
PreOrder:  Cha → Trái → Phải  → Clone, Serialize, DOM diff
InOrder:   Trái → Cha → Phải  → BST → kết quả sorted tự động
PostOrder: Trái → Phải → Cha  → Cleanup, Destroy, WebGL dispose
```

```javascript
// Recursive (gọn nhưng Stack Overflow nếu >10K nodes)
function dfsTree(root, type = "preOrder") {
  const data = [];
  const traverse = (node) => {
    if (!node) return;
    if (type === "preOrder") data.push(node.value);
    traverse(node.left);
    if (type === "inOrder") data.push(node.value);
    traverse(node.right);
    if (type === "postOrder") data.push(node.value);
  };
  traverse(root);
  return data;
}

// Iterative PreOrder — Stack + pop() O(1)
function dfsPreOrderIterative(root) {
  if (!root) return [];
  const data = [],
    stack = [root];
  while (stack.length) {
    const node = stack.pop();
    data.push(node.value);
    // LIFO: nhét PHẢI trước, TRÁI sau → Trái được pop trước
    if (node.right) stack.push(node.right);
    if (node.left) stack.push(node.left);
  }
  return data;
}
// ⚠️ AI bug: nhét Trái trước → Phải được pop trước → sai thứ tự!
```

### Tree Use Cases

```
PreOrder (Cha TRƯỚC):
  Serialize/Clone: Cha phải tồn tại trước mới có "hộp" chứa Con
  Virtual DOM Diff: Cha diff trước, cache match → skip cả nhánh
  Three.js scene.traverse(): World Matrix Cha → nhân xuống Con
  GSAP: animate từ ngoài Parent vào trong Child

InOrder (Cha GIỮA — BST only):
  BST InOrder → kết quả sorted tăng dần (không cần .sort())
  Flatten 10K sản phẩm O(N) vs Array.sort() O(N log N)

PostOrder (Cha SAU):
  Cleanup: xóa Con trước Cha — xóa Cha trước → Memory Leak!
  WebGL: geometry.dispose() → material.dispose() → Scene cuối cùng
  GSAP: animate nổ tung từ Core ra ngoài
```

---

## Mutation Guards

```javascript
// ❌ .reverse() mutate adjacency list gốc → sai logic cho lần traverse sau
for (const n of graph.get(node).reverse()) {
  /* ... */
}

// ✓ slice().reverse() hoặc spread
for (const n of [...graph.get(node)].reverse()) {
  /* ... */
}

// ❌ while (queue.length) { queue.shift() } → O(N²)
// ✓ head pointer: while (head < queue.length) { queue[head++] }

// Arrow Function this:
// ❌ function dfs() { this.adjacencyList } → this = undefined (strict mode)
// ✓ Arrow: const dfs = () => { this.adjacencyList } → lexical this
// ✓ Hoặc: dfs.bind(this) / const self = this;
```

---

## Quick Reference

```
BFS: Queue + head pointer O(1) → "gần nhất", Stagger, Ripple
DFS: Stack + pop O(1) → Clone, Sort BST, Cleanup, Scene Traversal

True DFS: visited sau pop → đường đi sâu hơn
Fake DFS: visited khi push → bỏ lỡ đường tối ưu

Tree DFS:
  PreOrder  → Clone/Serialize (Cha trước)
  InOrder   → BST sorted output (Cha giữa)
  PostOrder → Cleanup/Destroy (Cha sau)

Animation:
  ChunkedTraverser: 500 nodes/frame + performance.now() deadline
  Chỉ Iterative mới pause/resume được
  shift() → O(N²) — dùng head pointer hoặc Linked List Queue

⚠️ Mutation:
  .reverse() mutate gốc → dùng [...arr].reverse()
  Arrow function → lexical this → an toàn trong class methods
```

---

## 🤖 Agent OS Anti-Rationalization

> [!CAUTION]
> **Tác tử AI ĐỌC KỸ TRƯỚC KHI CODE:**
>
> 1. **Cấm DFS cho Đường ngắn nhất:** DFS đệ quy KHÔNG TÌM ĐƯỢC đường đi ngắn nhất. Nếu yêu cầu tìm đường ngắn nhất, BẮT BUỘC phải dùng BFS (Queue).
> 2. **Cấm dùng .shift() cho Queue:** Khi triển khai BFS trên mảng rất lớn, TUYỆT ĐỐI CẤM dùng `queue.shift()` (vì nó là O(N)). Phải dùng 2 mảng in/out hoặc biến đếm Pointer Index `queue[head++]`.
> 3. **Chống tràn Call Stack:** Không dùng DFS đệ quy cho đồ thị sâu hàng ngàn node. Phải dùng DFS Iterative (với Stack tự tạo).
