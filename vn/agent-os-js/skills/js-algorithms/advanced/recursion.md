---
name: recursion
description: Kỹ năng Agent chuyên biệt về recursion cho hệ thống JavaScript High-Performance.
---

# Recursion — Call Stack, Base Case, Pitfalls

Đệ quy là Design Pattern cho cấu trúc **phân nhánh đa chiều** (Tree, Graph, JSON lồng). Không dùng cho dữ liệu phẳng 1 chiều — dùng vòng lặp thay thế.

---

## Call Stack — Cơ chế vật lý

```
JavaScript = Single Thread = 1 Call Stack duy nhất

LIFO (Last In, First Out):
→ Hàm gọi sau → đặt lên đỉnh Stack → chạy xong trước → Pop ra

Giới hạn: ~10,000 frames trên Chrome
Vượt quá → "Maximum call stack size exceeded" → App crash
```

```javascript
// Minh họa Call Stack
function wakeUp() {
  eatBreakfast(); // wakeUp bị "đóng băng", đẩy xuống stack
  // ... tiếp tục sau khi eatBreakfast() return
}
function eatBreakfast() {
  drinkCoffee(); // eatBreakfast bị "đóng băng"
}
function drinkCoffee() {
  return "done"; // Pop → eatBreakfast tiếp → Pop → wakeUp tiếp → Pop
}
```

---

## 2 Thành phần bắt buộc

```javascript
// Thiếu 1 trong 2 → Stack Overflow → crash

function recursion(input) {
  if (/* Base Case */) return result; // ← LUÔN VIẾT DÒNG NÀY TRƯỚC TIÊN

  return recursion(smallerInput);    // Input phải tiến gần về Base Case
}
```

---

## Hai hình thái

```javascript
// 1. Action (Hành động) — chỉ thực thi, không cần gom kết quả
function countDown(num) {
  if (num <= 0) {
    console.log("Done!");
    return;
  }
  console.log(num);
  countDown(num - 1); // ← KHÔNG phải countDown(num--) → Infinite Loop!
}

// 2. Accumulation (Tích lũy) — phải return, chuỗi kết quả nảy ngược lên Stack
function sumRange(num) {
  if (num <= 1) return 1; // Base Case: kích hoạt Unwinding
  return num + sumRange(num - 1); // ← PHẢI có return, thiếu → undefined
}
// sumRange(4): 4 + sumRange(3) → frozen
//              3 + sumRange(2) → frozen
//              2 + sumRange(1) → returns 1
//              → 2+1=3 → 3+3=6 → 4+6=10 ← Cascade return ngược lên
```

---

## Recursion cho Nested Data — Tree/Graph

```javascript
// Tìm Node theo ID trong cây lồng nhau vô định
function findNodeById(treeNodes, targetId) {
  for (const node of treeNodes) {
    if (node.id === targetId) return node; // Base Case 1: tìm thấy

    if (node.children?.length > 0) {
      const found = findNodeById(node.children, targetId);
      if (found) return found; // ← PHẢI return! Không có → undefined nảy ngược
    }
  }
  return null; // Base Case 2: không có trong nhánh này
}

// Tính tổng dung lượng file tree
function calculateTotalSize(node) {
  if (node.type === "file") return node.size || 0; // Base Case

  let total = 0;
  for (const child of node.children ?? []) {
    total += calculateTotalSize(child); // Accumulation
  }
  return total;
}
```

---

## 3 Pitfalls — Nguyên nhân gây Stack Overflow

```javascript
// ✗ Pitfall 1: Không có Base Case → vòng lặp vô tận
function countdown(num) {
  console.log(num);
  countdown(num - 1); // Chạy đến âm vô cực → crash
}

// ✗ Pitfall 2: Base Case bằng console.log thay vì return
function factorial(num) {
  if (num === 1) console.log(1); // Không return → tiếp tục đệ quy xuống
  return num * factorial(num - 1);
}

// ✗ Pitfall 3: Quên return ở lời gọi đệ quy
function findNode(nodes, id) {
  for (const node of nodes) {
    if (node.id === id) return node;
    findNodeById(node.children, id); // ← Thiếu return → kết quả bị rớt → undefined
  }
}
```

---

## Guard Clauses — Lập trình phòng thủ

```javascript
// Luôn đặt Guard Clauses TRƯỚC Base Case
function factorialSafe(num) {
  // 1. Guard Clauses — chặn input nguy hiểm trước khi đẩy bất kỳ frame nào
  if (typeof num !== "number" || !Number.isInteger(num)) return null;
  if (num < 0) return 0; // Không để âm lọt vào → free-fall vô cực

  // 2. Base Case
  if (num <= 1) return 1; // Dùng <= 1 thay vì === 1 để vét cạn rủi ro

  // 3. Recursive call
  return num * factorialSafe(num - 1);
}

// ✓ Iterative thay thế — O(1) Space, KHÔNG BAO GIỜ Stack Overflow
function factorialIterative(num) {
  if (num < 0) return 0;
  let total = 1;
  for (let i = num; i > 1; i--) total *= i;
  return total;
}
```

---

## Helper Method vs Pure Recursion — Gom nhiều giá trị

```javascript
// VẤN ĐỀ: Khai báo result = [] bên trong hàm đệ quy → bị reset mỗi lần gọi!

// Pattern 1: Helper Method — Closure bảo vệ result
// Tốt hơn cho: Cây dữ liệu lớn, mutate an toàn, WebGL scene graph
function collectOddValues(arr) {
  const result = []; // Protected by Closure — không bao giờ bị reset

  function traverse(index) {
    if (index === arr.length) return;
    if (arr[index] % 2 !== 0) result.push(arr[index]);
    traverse(index + 1); // Pointer index, KHÔNG dùng .slice()!
  }

  traverse(0);
  return result;
}

// Pattern 2: Pure Recursion — Immutable, phù hợp Kiến trúc State Management
// Dùng Spread để nối, KHÔNG .slice() trong body
function collectOddValuesPure(arr, index = 0) {
  if (index === arr.length) return [];
  const curr = arr[index] % 2 !== 0 ? [arr[index]] : [];
  return [...curr, ...collectOddValuesPure(arr, index + 1)];
}

// Pattern 3: Default Params — Senior One-liner (không cần Helper wrapper)
function collectOdds(arr, index = 0, result = []) {
  if (index === arr.length) return result;
  if (arr[index] % 2 !== 0) result.push(arr[index]);
  return collectOdds(arr, index + 1, result);
}
```

### .slice() trong Recursion — Cạm bẫy O(N²)

```javascript
// ✗ Video gốc dùng .slice(1) — O(N²) Space ẩn!
function collectBad(arr) {
  if (!arr.length) return [];
  // .slice(1) tạo bản sao mới O(N) mỗi lần gọi → 10K phần tử = 50M thao tác
  const rest = collectBad(arr.slice(1));
  return arr[0] % 2 !== 0 ? [arr[0], ...rest] : rest;
}

// ✓ Dùng pointer index — O(N) Time, O(N) Space (chỉ result + Stack)
function collectGood(arr, index = 0, result = []) {
  if (index === arr.length) return result;
  if (arr[index] % 2 !== 0) result.push(arr[index]);
  return collectGood(arr, index + 1, result);
}
```

---

## requestAnimationFrame — Giả đệ quy, thực ra không

```javascript
// rAF tự gọi lại nhưng KHÔNG nổ Stack — tại sao?
function animate() {
  // ... update state ...
  requestAnimationFrame(animate); // Giao cho Web API, hàm này POP ngay lập tức
}
animate();
// animate() kết thúc và pop khỏi Stack ngay.
// ~16ms sau, Call Stack trống, Web API mới push animate() tiếp.
// → Stack chỉ chứa 1 frame tại 1 thời điểm → không bao giờ overflow
```

---

## Iterative Tree Traversal — Khi cây quá sâu

```javascript
// Nếu cây > 10,000 tầng → đệ quy nổ Stack
// Giải pháp: Mô phỏng Call Stack bằng Array (lưu ở Heap, không giới hạn)
function iterativeDFS(root) {
  if (!root) return [];
  const result = [];
  const stack = [root]; // Stack giả bằng Array

  while (stack.length) {
    const node = stack.pop();
    result.push(node.val);
    // Push con vào stack thay vì gọi đệ quy
    if (node.right) stack.push(node.right);
    if (node.left) stack.push(node.left);
  }
  return result;
}
```

---

## Circular Reference — Bẫy trong Deep Clone

```javascript
// ✗ Node A → Node B → Node A → Infinite Loop → Stack Overflow
function deepCloneBad(obj) {
  if (typeof obj !== "object" || obj === null) return obj;
  const clone = {};
  for (const key in obj) clone[key] = deepCloneBad(obj[key]); // Không detect vòng!
  return clone;
}

// ✓ WeakMap phát hiện circular reference
function deepClone(obj, seen = new WeakMap()) {
  if (typeof obj !== "object" || obj === null) return obj;
  if (seen.has(obj)) return seen.get(obj); // Đã thấy → trả về ref cũ
  const clone = Array.isArray(obj) ? [] : {};
  seen.set(obj, clone); // Đăng ký trước khi đệ quy vào con
  for (const key in obj) clone[key] = deepClone(obj[key], seen);
  return clone;
}
```

---

## Quick Reference

```
Dùng Đệ quy khi: Tree, Graph, JSON lồng, DOM traversal, Nested components
KHÔNG dùng khi: Mảng phẳng 1 chiều, Tính tổng, Giai thừa → Dùng vòng lặp

Space Complexity:
  Đệ quy: O(D) — D = độ sâu tối đa (Call Stack)
  Vòng lặp: O(1) — không tốn Call Stack

Thần chú dòng số 1:
  if (Base Case) return; // Viết TRƯỚC khi viết logic

num-- trong đệ quy → INFINITE LOOP → luôn dùng num - 1

Khi thấy "Maximum call stack size exceeded":
  1. Thiếu/Sai Base Case
  2. Input không tiến gần về Base Case (gọi f(num) thay vì f(num-1))

Debug: console.trace() thay vì console.log để xem toàn bộ Call Stack
```

---

## Memoization — Cứu fib khỏi O(2^N)

```javascript
// ✗ Naive fib — O(2^N): fib(50) → hàng nghìn tỷ phép tính → Tab đứng hình
function fib(n) {
  if (n <= 2) return 1;
  return fib(n - 1) + fib(n - 2); // Tính lại subproblem đã giải nhiều lần
}

// ✓ Memoization — O(N) Time, O(N) Space: Lưu kết quả đã tính vào cache
function fib(n, memo = {}) {
  if (n <= 2) return 1;
  if (memo[n]) return memo[n]; // Có rồi → lấy từ cache, không đệ quy
  memo[n] = fib(n - 1, memo) + fib(n - 2, memo); // Tính 1 lần, lưu cache
  return memo[n];
}
// fib(50): 50 lần tính thay vì hàng nghìn tỷ lần

// ✓ Bottom-up DP (Iterative) — O(N) Time, O(1) Space — An toàn nhất
function fibIterative(n) {
  if (n <= 2) return 1;
  let prev2 = 1,
    prev1 = 1;
  for (let i = 3; i <= n; i++) {
    [prev2, prev1] = [prev1, prev2 + prev1];
  }
  return prev1;
}

// Khi nào dùng Memoization:
// Spec có: "Overlapping Subproblems" (fib, coin change, grid paths)
// → fib(n-1) và fib(n-2) đều gọi lại fib(n-2) → kết quả trùng → cache
```

---

## productOfArray — .slice() O(N²) → Index Pointer O(N)

```javascript
// ✗ .slice(1) trong đệ quy = tạo N bản copy → O(N²) Space
function productOfArrayBad(arr) {
  if (arr.length === 0) return 1;
  return arr[0] * productOfArrayBad(arr.slice(1)); // 10K phần tử = 50M thao tác
}

// ✓ Index Pointer — giữ nguyên tham chiếu mảng gốc, không copy gì cả
function productOfArray(arr, index = 0) {
  if (index === arr.length) return 1;
  return arr[index] * productOfArray(arr, index + 1);
}
// O(N) Space (Call Stack) — không sinh rác bộ nhớ

// Tương tự: isPalindrome với Pointer thay vì .slice()
function isPalindrome(str, left = 0, right = str.length - 1) {
  if (left >= right) return true; // Chạm nhau ở giữa → đối xứng
  if (str[left] !== str[right]) return false;
  return isPalindrome(str, left + 1, right - 1); // Không cắt chuỗi!
}
```

---

## Nested Object Traversal — 3 Bug chết người phổ biến

### Bug 1: typeof null === 'object' (Tử huyệt của JS)

```javascript
// ✗ Tất cả AI và Junior thường quên check null
function traverseBad(obj) {
  for (const key in obj) {
    if (typeof obj[key] === "object") {
      // typeof null === 'object' → CRASH!
      traverseBad(obj[key]); // Nếu obj[key] là null → Cannot read properties of null
    }
  }
}

// ✓ Guard Clause chuẩn — Plain Object check
const isPlainObject = (val) =>
  val !== null && typeof val === "object" && !Array.isArray(val);
// Hoặc: Object.prototype.toString.call(val) === '[object Object]'

function traverseGood(obj) {
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue; // Né Prototype
    const val = obj[key];
    if (isPlainObject(val))
      traverseGood(val); // Lặn xuống Object con
    else if (Array.isArray(val)) {
      /* xử lý array */
    } else if (val === null) {
      /* xử lý null */
    } else {
      /* Primitive: string, number, boolean */
    }
  }
}
```

### Bug 2: return trong loop → ngắt vòng lặp, bỏ sót keys

```javascript
// BUG: return bên trong for...in → vòng lặp dừng ngay, bỏ sót keys còn lại
function collectStringsBug(obj, res = []) {
  for (const key in obj) {
    if (typeof obj[key] === "string") res.push(obj[key]);
    else if (isPlainObject(obj[key])) {
      return collectStringsBug(obj[key], res); // ← return sớm → bỏ sót key sau!
    }
  }
  return res;
}
// { a: { deep: "foo" }, b: "bar" } → chỉ trả về ["foo"], bỏ mất "bar"!

// ✓ Không return khi đang gom dữ liệu — để vòng lặp chạy hết
function collectStrings(obj, res = []) {
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
    const val = obj[key];
    if (typeof val === "string") res.push(val);
    else if (isPlainObject(val)) collectStrings(val, res); // Không return!
  }
  return res; // Chỉ return sau khi for...in chạy xong toàn bộ
}

// Nguyên tắc: return bên trong loop chỉ dùng khi TÌM 1 KẾT QUẢ (Search/Find)
// Khi GOM NHIỀU KẾT QUẢ (Collect/Filter/Flatten) → KHÔNG bao giờ return sớm trong loop
```

### Bug 3: .concat() và Spread trong flatten — O(N²) Space

```javascript
// ✗ .concat() tạo mảng mới mỗi lần → O(N²) Space
function flattenBad(arr) {
  let newArr = [];
  for (let item of arr) {
    if (Array.isArray(item))
      newArr = newArr.concat(flattenBad(item)); // Clone!
    else newArr.push(item);
  }
  return newArr;
}

// ✗ Spread Operator — tương tự .concat()
// return [arr[0], ...flatten(arr.slice(1))]; // Đốt RAM nhanh

// ✓ Accumulator Reference — 1 mảng duy nhất, không clone
function flatten(arr, result = []) {
  for (let i = 0; i < arr.length; i++) {
    if (Array.isArray(arr[i]))
      flatten(arr[i], result); // Xách giỏ đi sâu
    else result.push(arr[i]); // Nhét vào giỏ O(1)
  }
  return result;
}

// ✓ Native (Production) — C++ compiled, nhanh nhất
arr.flat(Infinity); // ES2019 — luôn nhanh hơn hàm JS custom
```

### stringifyNumbers — Immutable + Full Type Guard

```javascript
// ✓ Chuẩn Senior: Immutable + null guard + Array.isArray + Prototype safe
function stringifyNumbers(obj) {
  const newObj = {};
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
    const val = obj[key];
    if (isPlainObject(val))
      newObj[key] = stringifyNumbers(val); // Lặn xuống
    else if (typeof val === "number")
      newObj[key] = String(val); // Convert
    else newObj[key] = val; // Giữ nguyên
  }
  return newObj; // Immutable — không mutate obj gốc
}
```

---

## CPU Cache — Tại sao In-place Pointer nhanh hơn Set/Map

```
Khi mảng JS chỉ chứa số → V8 lưu liên tục trên RAM (Contiguous Memory)
→ CPU L1/L2 Cache dự đoán và nạp sẵn dữ liệu tiếp theo (Spatial Locality)
→ 2 pointers quét cạnh nhau → Cache Hit Rate gần 100%

Set/Map → Phân mảnh bộ nhớ (Hash Table = nhiều vùng RAM rời rạc)
→ CPU phải đi lấy dữ liệu ở nhiều nơi → Cache Miss → Chậm hơn

In-place Pointer O(1) > Set O(N) không chỉ vì ít RAM mà còn vì Cache!
```

---

## Move Zeroes — Ứng dụng Fast/Slow Pointer

```javascript
// Đẩy toàn bộ số 0 về cuối, giữ nguyên thứ tự số khác
// Tư duy: slow = mỏ neo cho "số khác 0", fast = trinh sát tìm số khác 0
function moveZeroes(arr) {
  let slow = 0; // Vị trí tiếp theo sẽ đặt số khác 0

  for (let fast = 0; fast < arr.length; fast++) {
    if (arr[fast] !== 0) {
      arr[slow] = arr[fast]; // Đặt số khác 0 vào đúng chỗ
      if (slow !== fast) arr[fast] = 0; // Điền 0 vào chỗ fast nếu đã dịch
      slow++;
    }
  }
  return arr;
}
// [0,1,0,3,12] → [1,3,12,0,0]
// O(N) Time, O(1) Space, không tạo mảng mới
```

---

## 🤖 Agent OS Anti-Rationalization

> [!CAUTION]
> **Tác tử AI ĐỌC KỸ TRƯỚC KHI CODE:**
>
> 1. **Cấm đệ quy vô hạn:** Cấm viết đệ quy mà không có Base Case (điều kiện dừng) rõ ràng đặt ở NGAY ĐẦU hàm.
> 2. **Chống tràn Stack:** Không dùng Đệ quy (Recursion) để duyệt các mảng/cây quá lớn (> 10,000 depth) vì sẽ dính lỗi "Maximum call stack size exceeded". Phải đổi sang Iterative + Stack/Queue tự tạo.
> 3. **Tối ưu Tail Call:** Với các engine hiện đại, cố gắng dùng Tail Call Optimization, nhưng tốt nhất vẫn là vòng lặp phẳng cho các logic tính toán nặng.
