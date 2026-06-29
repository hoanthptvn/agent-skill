---
name: pathfinding
description: Kỹ năng Agent chuyên biệt về pathfinding cho hệ thống JavaScript High-Performance.
---

# Dynamic Programming & Greedy Algorithm

DP = "Những kẻ không nhớ quá khứ sẽ bị buộc phải lặp lại nó" — lưu kết quả bài con để tái sử dụng.

---

## Greedy vs DP — Chọn cái nào

```
Greedy (Tham lam):
  Luôn chọn Local Optimum (tốt nhất tại thời điểm hiện tại)
  Cực nhanh O(N), không cần lưu lịch sử
  Tử huyệt: Sai với Non-canonical coins [1, 3, 4], amount=6
    Greedy: 4+1+1=3 đồng — SAI
    Optimal: 3+3=2 đồng — ĐÚNG
  Dùng khi: tham lấy cái lớn nhất không phá hỏng kết quả toàn cục

DP (Quy hoạch động):
  Chia bài to → bài con, lưu kết quả (Cache) → tái dụng
  Chậm hơn O(N×A) nhưng chính xác tuyệt đối mọi trường hợp
  Dùng khi: bài yêu cầu "Số cách để..." hoặc "Min/Max tuyệt đối"

Nhận diện DP:
  "Số cách để..." (Number of ways)    → DP
  "Nhỏ nhất/Lớn nhất" (Min/Max)      → DP
  Overlapping Subproblems (tính lại cùng bài con nhiều lần) → DP
```

---

## Coin Change — Greedy (Số xu ít nhất)

```javascript
// BUG trong code gốc: for (let i = coins.length; i >= 0; i--)
// coins[coins.length] = undefined → total + undefined = NaN → while bỏ qua im lặng
// Silent Bug: chạy được trong JS nhưng sai → C++ đã crash ngay

function minCoinGreedy(coins, amount) {
  const result = [];
  let remaining = amount;

  // ✓ Fix Off-by-one: bắt đầu từ coins.length - 1
  for (let i = coins.length - 1; i >= 0; i--) {
    const coin = coins[i];
    const count = Math.floor(remaining / coin); // Toán học thay vòng lặp while

    for (let j = 0; j < count; j++) result.push(coin);
    remaining %= coin; // Cập nhật số dư bằng modulo

    if (remaining === 0) break; // Thoát sớm
  }
  return result;
}
// Time O(N) — chỉ duyệt mảng xu 1 lần, dùng phép chia thay while trừ dần
// Space O(K) — K là số xu trong kết quả

// ⚠️ Floating Point trap:
// 0.1 + 0.2 = 0.30000000000000004 → vòng lặp vô tận hoặc lỗi
// Quy tắc vàng: nhân 100 trước khi tính, chia 100 sau khi có kết quả
// amount = Math.round(dollarAmount * 100) → làm việc với cents (số nguyên)
```

---

## Coin Change — DP Bottom-Up (Đếm số cách)

```javascript
// LeetCode 322 (min coins) vs LeetCode 518 (count ways) — KHÁC NHAU HOÀN TOÀN
// AI thường trộn lẫn 2 bài này → luôn ghi rõ trong prompt

function coinChangeWaysDP(denominations, amount) {
  // ✓ Uint32Array: Typed Array của V8 → lưu số nguyên siêu tốc, CPU Cache friendly
  // ✗ new Array(amount+1).fill(0) → chậm hơn, sinh object GC rác
  const dp = new Uint32Array(amount + 1);
  dp[0] = 1; // Base case: 1 cách để đổi 0 đồng (không lấy xu nào)

  for (const coin of denominations) {
    // currentAmount bắt đầu từ coin (không thể dùng coin lớn hơn amount hiện tại)
    for (let cur = coin; cur <= amount; cur++) {
      // Công thức: số cách đổi cur = số cách cũ + số cách của (cur - coin)
      dp[cur] += dp[cur - coin];
    }
  }
  return dp[amount];
}
// Time O(N × A) — N loại xu × A mức tiền
// Space O(A) — mảng dp độ dài A+1

// ❌ Đệ quy Top-down (Memoization):
// Call Stack limit ≈ 10K frames → RangeError với amount lớn (vd: 14,511)
// ✓ Bottom-up Tabulation (for loop): an toàn 100%, không giới hạn amount

// ⚠️ RAM trap: amount = 1,000,000,000 → new Uint32Array(1B) → tab crash (Out of Memory)
// Cần validate amount trước khi chạy DP

// Pre-computing insight = DP philosophy trong WebGL:
// Tính phương trình ánh sáng PBR lúc load → lưu vào Lookup Texture (LUT)
// Lúc render GPU chỉ "tra bảng" thay vì tính lại mỗi pixel
// = DP Tabulation trên VRAM
```

---

## Frontend Use Cases

```
Vanilla JS Closure Caching = DP Memoization:
  Tham số đầu vào không đổi (Overlapping Subproblems) → trả về kết quả đã cache
  Tham số thay đổi → tính toán lại rồi lưu cache mới

DOM Diffing (Virtual DOM Reconciliation):
  Bài toán gốc: so sánh 2 cây DOM = DP (Longest Common Subsequence) O(N³)
  DOM Heuristics (Greedy): giả định attribute data-key và tên thẻ không đổi → O(N)
  → Đánh đổi: không hoàn toàn chính xác nhưng đủ nhanh cho 60fps

Greedy trong UI:
  Text Justification: nhét nhiều chữ nhất vào 1 dòng
  Masonry Grid (Pinterest): nhét ảnh vào cột thấp nhất
  Critical Rendering Path: tải LCP Image/Critical CSS trước (Greedy bandwidth)

DP trong State Management:
  Dependency Graph: khi state A thay đổi → tính toán B, C phụ thuộc
  = DP Topological Order (chỉ tính lại những gì phụ thuộc vào A)
```

---

## Quick Reference

```
Nhận diện Greedy vs DP:
  Bài có thể chứng minh: lấy cái lớn nhất luôn đúng → Greedy
  Bài cần thử mọi con đường rồi so sánh → DP
  "Số cách..." → DP
  "Min/Max tuyệt đối..." → DP

Greedy Coin Change:
  Off-by-one: i = coins.length - 1 (không phải coins.length)
  Math.floor(remaining / coin) thay vì while loop
  Floating Point: nhân 100 → làm việc với cents

DP Bottom-Up template:
  const dp = new Uint32Array(amount + 1); // Typed Array → nhanh hơn Array
  dp[0] = base_case;
  for (item of items)
    for (amount = item; amount <= target; amount++)
      dp[amount] += dp[amount - item]; // hoặc logic phù hợp

Chọn Tabulation vs Memoization:
  Tabulation (Bottom-up, for loop): LUÔN dùng trong browser → an toàn với mọi N
  Memoization (Top-down, recursion): Call Stack limit ≈ 10K → KHÔNG dùng

Performance:
  Greedy:  O(N) time, O(K) space — K là kích thước kết quả
  DP:      O(N×A) time, O(A) space
  Cả hai: KHÔNG dùng với floating point trực tiếp

Câu thần chú:
  Greedy: "Tham bát bỏ mâm" — nhanh nhưng hên xui
  DP:     "Tra bảng lịch sử" — chậm hơn nhưng chính xác tuyệt đối
```

---

## Dijkstra's Algorithm — Shortest Path (Weighted Graph)

```javascript
// BFS tìm shortest path bằng số bước nhảy (unweighted)
// Dijkstra tìm shortest path bằng tổng chi phí (weighted)
// Greedy: luôn mở rộng đỉnh rẻ nhất hiện hành → khi lần đầu chạm đích = đường tối ưu

// Weighted Graph — Adjacency List thay đổi cấu trúc:
// ✗ A: ['B', 'C']
// ✓ A: [{ node: 'B', weight: 9 }, { node: 'C', weight: 5 }]

class WeightedGraph {
  constructor() {
    this.adjacencyList = new Map();
  }

  addVertex(v) {
    if (!this.adjacencyList.has(v)) this.adjacencyList.set(v, []);
  }
  addEdge(v1, v2, weight) {
    this.adjacencyList.get(v1).push({ node: v2, weight });
    this.adjacencyList.get(v2).push({ node: v1, weight }); // Undirected
  }

  dijkstra(start, finish) {
    const pq = new MinBinaryHeapPQ();
    const distances = new Map(); // khoảng cách ngắn nhất từ start đến mỗi đỉnh
    const previous = new Map(); // "dấu chân" — đỉnh liền trước trên đường tối ưu
    const path = [];

    // 1. Khởi tạo: start=0, còn lại=Infinity
    for (const v of this.adjacencyList.keys()) {
      distances.set(v, v === start ? 0 : Infinity);
      previous.set(v, null);
      pq.enqueue(v, v === start ? 0 : Infinity);
    }
    // Infinity: lớn hơn mọi số, Infinity+10 = Infinity → không bao giờ sai logic

    // 2. Vòng lặp tham lam
    while (pq.values.length) {
      const { val: smallest } = pq.dequeue(); // Luôn lấy đỉnh rẻ nhất

      // EARLY EXIT: chạm đích → backtrack dấu chân
      if (smallest === finish) {
        let curr = smallest;
        while (previous.get(curr)) {
          path.push(curr);
          curr = previous.get(curr);
        }
        break;
      }

      if (distances.get(smallest) === Infinity) continue; // Disconnected graph

      for (const { node: next, weight } of this.adjacencyList.get(smallest)) {
        const candidate = distances.get(smallest) + weight;
        if (candidate < distances.get(next)) {
          // Phá kỷ lục!
          distances.set(next, candidate);
          previous.set(next, smallest); // Ghi dấu chân
          pq.enqueue(next, candidate); // Ném lại vào PQ với priority mới
        }
      }
    }
    // Backtrack ra ngược từ finish→start, cần đảo ngược + nối start vào đầu
    return path.concat(start).reverse();
    // path.concat(start).reverse() — trick O(N): push cuối + reverse thay unshift O(N) mỗi lần
  }
}
```

---

## Priority Queue — Min Binary Heap (Engine của Dijkstra)

```javascript
// Naive PQ: Array.sort() O(N log N) mỗi enqueue + shift() O(N) mỗi dequeue
// → Dijkstra tổng: O(V² log V) → freeze Main Thread với 5000 nodes
// Binary Heap PQ: O(log N) enqueue + O(log N) dequeue
// → Dijkstra tổng: O((V+E) log V) → 1-2ms thay vì 50-100ms

class MinBinaryHeapPQ {
  constructor() {
    this.values = [];
  }

  enqueue(val, priority) {
    this.values.push({ val, priority });
    this.#bubbleUp();
  }

  dequeue() {
    if (!this.values.length) return undefined;
    const min = this.values[0];
    const end = this.values.pop();
    if (this.values.length) {
      this.values[0] = end;
      this.#sinkDown();
    }
    return min;
  }

  #bubbleUp() {
    let idx = this.values.length - 1;
    const el = this.values[idx];
    while (idx > 0) {
      const pIdx = (idx - 1) >> 1; // Bitwise >> 1 = Math.floor((idx-1)/2), nhanh hơn ở CPU
      const p = this.values[pIdx];
      if (el.priority >= p.priority) break; // Min Heap: dừng nếu con >= cha
      [this.values[pIdx], this.values[idx]] = [el, p]; // Destructuring swap, không cần temp
      idx = pIdx;
    }
  }

  #sinkDown() {
    let idx = 0;
    const el = this.values[0];
    const n = this.values.length;
    while (true) {
      const lIdx = (idx << 1) + 1; // << 1 = ×2, nhanh hơn 2*idx ở cấp phần cứng
      const rIdx = (idx << 1) + 2;
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

// Encapsulation: Dijkstra chỉ gọi .enqueue() và .dequeue()
// Thay Naive PQ → Binary Heap PQ: Dijkstra KHÔNG cần sửa 1 dòng logic nào
// → Separation of Concerns: logic nghiệp vụ tách biệt hoàn toàn với data structure

// GC Warning: new {val, priority} mỗi enqueue → hàng ngàn object rác
// WebGL Game Engine cấp: dùng parallel Float32Array thay object literals → 0 GC
// const vals = new Float32Array(MAX); const pris = new Float32Array(MAX);

// Dijkstra limitations:
//   Trọng số âm → KHÔNG dùng (bị loop vô tận) → dùng Bellman-Ford
//   Không biết hướng đích → lan tỏa mọi hướng → A* thêm heuristic (ước tính khoảng cách)
//   A* = Dijkstra + "la bàn" → tối ưu 70% tính toán trong game 2D/3D
// Web Workers: đồ thị lớn → ném dijkstra vào Worker → postMessage kết quả về Main Thread
// GSAP: path.map(id→tọa độ) → CatmullRomCurve3 (Three.js) hoặc MotionPathPlugin → camera bay
```

---

## Fibonacci — Memoization Closure + BigInt

```javascript
// ❌ Naive Recursion: O(2^N) — tính fib(50) treo trình duyệt vĩnh viễn
// Nguyên nhân: Overlapping Subproblems — fib(3) được tính lại hàng triệu lần

// ❌ AI sai: let memo = {} ở Global Scope → Memory Leak + State Pollution giữa các components

// ✓ Memoization + Closure: cache ẩn trong closure, không bẩn scope ngoài
const memoFib = (function () {
  const memo = new Map(); // Map nhanh hơn {} cho numeric keys liên tục

  return function fib(n) {
    if (n <= 2) return 1n; // BigInt: fib(79) vượt Number.MAX_SAFE_INTEGER
    if (memo.has(n)) return memo.get(n); // Cache hit O(1)
    const result = fib(n - 1) + fib(n - 2);
    memo.set(n, result); // Ghi sổ tay
    return result;
  };
})(); // IIFE: tạo closure ngay lập tức, memo không bao giờ bị reset

// Time O(N) — mỗi fib(k) chỉ tính đúng 1 lần
// Space O(N) — O(N) call stack + O(N) memo
// ⚠️ Call Stack limit ≈ 10K: memoFib(15000) → RangeError: Maximum call stack size exceeded
// → Memoization vẫn chết với N lớn → cần Tabulation
```

---

## Fibonacci — Tabulation Bottom-Up + O(1) Space

```javascript
// Tabulation: xây nhà từ móng lên, không có hàm nào "chờ" hàm nào
// Vòng lặp for chạy 10M vòng vẫn sống → Call Stack = 1 frame duy nhất

// Tabulation O(N) time, O(N) space:
function fibTabulation(n) {
  if (n <= 2) return 1n;
  const table = [0n, 1n, 1n]; // index 0 bỏ qua
  for (let i = 3; i <= n; i++) table[i] = table[i - 1] + table[i - 2];
  return table[n];
  // BigInt: console.log(fibTabulation(10000)) → in số dài hàng ngàn ký tự, không Infinity
}

// ✓ O(1) Space — Space Optimization (chỉ cần 2 biến):
// fib(N) chỉ phụ thuộc fib(N-1) và fib(N-2) → không cần mảng dài N
function fibUltimate(n) {
  if (n <= 2) return 1n;
  let prev2 = 1n,
    prev1 = 1n,
    current;
  for (let i = 3; i <= n; i++) {
    current = prev1 + prev2; // Cộng 2 biến trước
    prev2 = prev1; // Tịnh tiến cuốn chiếu
    prev1 = current;
  }
  return current;
}
// 10K vòng lặp = 0 bytes RAM thêm ngoài 3 biến BigInt
// V8 JIT (Turbofan) tối ưu vòng lặp for cực mạnh → thực tế nhanh hơn đệ quy

// Khi nào dùng cái nào:
//   Memoization (Top-down): graph rẽ nhánh, lazy evaluation — chỉ tính nhánh đi qua
//   Tabulation (Bottom-up): chuỗi tuyến tính như Fibonacci, Coin Change — tính toàn bộ
//   O(1) Space: khi công thức chỉ dụng K trạng thái liền trước — luôn ưu tiên

// Frontend analogies:
//   Memoization = Vanilla JS Closure Caching
//   Tabulation = getBoundingClientRect() lúc init, lưu mảng, dùng lại khi scroll
//   O(1) Space = GSAP prev frame state (vị trí trước) → tính vị trí hiện tại
//   LUT = Pre-compute sin/cos lookup table lúc load → Float32Array → O(1) lookup trong rAF

// BigInt caveats:
//   1n + 1 → TypeError — không mix BigInt với Number
//   Math.sqrt(BigInt) → không hỗ trợ — phải ép: Number(bigintVal)
//   JSON.stringify({n: 1n}) → TypeError — không serialize được trực tiếp
```

---

## Dijkstra Quick Reference

```
Big O:
  Naive PQ (Array.sort + shift):  O(V² log V) — freeze với 5000+ nodes
  Binary Heap PQ:                  O((V+E) log V) — 1-2ms trong browser

Công thức Dijkstra:
  distances[start] = 0, distances[others] = Infinity
  previous[all]    = null
  loop: dequeue smallest → Early Exit nếu là finish
        với mỗi neighbor: candidate = distances[curr] + weight
        nếu candidate < distances[neighbor] → cập nhật + enqueue lại

Backtracking path:
  path.concat(start).reverse() — O(N) thay vì unshift() O(N) mỗi phần tử

Không dùng Dijkstra khi:
  Trọng số âm → Bellman-Ford
  Bản đồ 2D có tọa độ → A* (Dijkstra + heuristic khoảng cách Euclidean)
  Unweighted graph → BFS đơn giản hơn

Bitwise operators trong PQ:
  Parent:     (idx - 1) >> 1   ≡ Math.floor((idx-1) / 2)
  Left child: (idx << 1) + 1   ≡ 2*idx + 1
  Right child:(idx << 1) + 2   ≡ 2*idx + 2

Fibonacci comparison:
  Naive:       O(2^N) time, O(N) space  — crash N=50
  Memoization: O(N) time, O(N) space   — crash N>10K (Call Stack)
  Tabulation:  O(N) time, O(N) space   — safe mọi N
  O(1) Space:  O(N) time, O(1) space   — tối ưu tuyệt đối
```

---

## 🤖 Agent OS Anti-Rationalization

> [!CAUTION]
> **Tác tử AI ĐỌC KỸ TRƯỚC KHI CODE:**
>
> 1. **Cấm lười biếng:** Không được dùng các hàm native `O(N)` (như `find`, `indexOf`, `filter`) khi dữ liệu có thể áp dụng thuật toán `O(log N)` hoặc `O(1)`.
> 2. **Cấm biện minh:** "Dữ liệu nhỏ nên dùng Array.sort() cho nhanh" là ngụy biện. Trong môi trường 60fps, vi phạm độ phức tạp thời gian sẽ dẫn đến Frame Drop.
> 3. **Không tạo rác (Zero GC):** Cấm khởi tạo Object/Array mới (`new Object`, `map`, `filter`) bên trong vòng lặp Render/Animation. Trọng tâm là tái sử dụng mảng phẳng (Parallel Arrays).
