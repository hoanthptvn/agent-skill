---
name: radix-sort
description: Kỹ năng Agent chuyên biệt về radix-sort cho hệ thống JavaScript High-Performance.
---

# Sorting Advanced — Merge Sort, Quick Sort, Radix Sort

Thuật toán sắp xếp nâng cao cho large N, WebGL Z-depth, và data pipeline.

---

## Big O — So sánh đầy đủ

```
Algorithm       Best      Average   Worst     Space     Stable  Use When
──────────────────────────────────────────────────────────────────────────────
Merge Sort      O(NlogN)  O(NlogN)  O(NlogN)  O(N)      Yes     Stable, large N, immutable
Quick Sort      O(NlogN)  O(NlogN)  O(N²)*    O(logN)   No      Large N, cache-friendly, in-place
Radix Sort      O(N×K)    O(N×K)    O(N×K)    O(N+K)    Yes     Integer sort, K nhỏ

* Quick Sort worst case khi không dùng Random/Median-of-3 Pivot
```

---

## Quick Sort — Pivot + In-place Partition

```javascript
const swap = (arr, i, j) => { [arr[i], arr[j]] = [arr[j], arr[i]]; };

function pivot(arr, comparator = (a,b) => a-b, start = 0, end = arr.length - 1) {
  // Random Pivot — phá vỡ Worst Case O(N²)
  const randomIdx = Math.floor(Math.random() * (end - start + 1)) + start;
  swap(arr, start, randomIdx);

  const pivotVal = arr[start];
  let swapIdx = start; // "Người gác cổng" — ranh giới vùng nhỏ hơn pivot

  for (let i = start + 1; i <= end; i++) {
    if (comparator(pivotVal, arr[i]) > 0) {
      swapIdx++;
      swap(arr, swapIdx, i); // Ném số nhỏ vào vùng gác cổng
    }
  }
  swap(arr, start, swapIdx); // Pivot về đúng vị trí vĩnh viễn
  return swapIdx;
}

function quickSort(arr, comparator = (a, b) => a - b) {
  const core = (arr, left, right) => {
    if (left < right) {
      const pivotIndex = pivot(arr, comparator, left, right);
      core(arr, left, pivotIndex - 1);  // Phe trái (pivot ± 1: đã đúng chỗ)
      core(arr, pivotIndex + 1, right); // Phe phải
    }
    return arr;
  };
  return core([...arr], 0, arr.length - 1); // Clone → immutable
}
```

### Quick Sort — Tại sao In-place quan trọng

```
✗ AI thường viết:
  arr.filter(x => x < pivot)   → O(N) Space mỗi lần → GC Thrashing
  [...quickSort(left), pivot, ...quickSort(right)] → thêm spread

✓ In-place — 1 mảng duy nhất trên RAM
  Dùng (left, right) pointers kẹp ranh giới
  CPU đọc/ghi liên tiếp → CPU Cache Locality → nhanh hơn 2-3× Merge Sort

Security — Algorithmic Complexity Attack:
  Hacker gửi mảng sorted → Quick Sort O(N²) → CPU treo
  ✓ Random Pivot → xác suất worst case ≈ 0
  ✓ IntroSort: Quick → Heap khi quá sâu → Insertion cho mảng nhỏ
```

---

## Merge Sort — Stable O(N log N)

```javascript
// Merge helper — hợp nhất 2 mảng đã sorted
function merge(arr1, arr2, comparator = (a, b) => a - b) {
  const result = [];
  let i = 0, j = 0;
  while (i < arr1.length && j < arr2.length) {
    comparator(arr1[i], arr2[j]) <= 0
      ? result.push(arr1[i++])
      : result.push(arr2[j++]);
  }
  while (i < arr1.length) result.push(arr1[i++]);
  while (j < arr2.length) result.push(arr2[j++]);
  return result;
}

function mergeSort(arr, comparator = (a, b) => a - b) {
  if (arr.length <= 1) return arr;
  const mid = arr.length >> 1;
  return merge(
    mergeSort(arr.slice(0, mid), comparator),
    mergeSort(arr.slice(mid), comparator),
    comparator
  );
}
```

### Merge Sort vs Quick Sort

```
Merge Sort:  O(N) Space — tạo mảng mới mỗi merge → GC
Quick Sort:  O(log N) Space — in-place → Cache Locality → nhanh hơn 2-3×

Merge Sort stable → sort objects không đảo thứ tự bằng nhau → UX tốt
Quick Sort unstable → có thể đảo → cần Random Pivot

Production: V8 Timsort = Merge Sort + Insertion Sort hybrid → luôn dùng .sort()
```

---

## Radix Sort — Phá giới hạn O(N log N)

```javascript
// Helpers — Math operations, zero allocation
const getDigit = (num, i) => Math.floor(Math.abs(num) / Math.pow(10, i)) % 10;
const digitCount = (num) => num === 0 ? 1 : Math.floor(Math.log10(Math.abs(num))) + 1;
const mostDigits = (nums) => {
  let max = 0;
  for (const num of nums) max = Math.max(max, digitCount(num));
  return max;
};
// ✗ num.toString()[i] → tạo String mỗi lần → GC Thrashing

// Core (positive only)
const radixSortCore = (nums) => {
  const maxDigitCount = mostDigits(nums);
  for (let k = 0; k < maxDigitCount; k++) {
    const buckets = Array.from({ length: 10 }, () => []);
    for (const num of nums) buckets[getDigit(num, k)].push(num);
    nums = buckets.flat();
  }
  return nums;
};

// Production — handles negatives
const radixSort = (nums) => {
  const negatives = nums.filter(n => n < 0);
  const positives = nums.filter(n => n >= 0);
  const sortedNeg = radixSortCore(negatives.map(Math.abs)).reverse().map(n => -n);
  return [...sortedNeg, ...radixSortCore(positives)];
};
```

### Radix Sort — WebGL Z-depth (Real use case)

```javascript
// Three.js: Sort 100K particles theo Z-depth mỗi frame
// Quick Sort: O(N log N) × 60 = FPS drop
// Radix-256 + TypedArray + Web Worker:
const worker = new Worker('radix-worker.js');
const depthBuffer = new Int32Array(NUM_PARTICLES);
worker.postMessage({ buffer: depthBuffer }, [depthBuffer.buffer]); // transferable
worker.onmessage = ({ data }) => { renderParticles(data.sortedBuffer); };
// Sort 100K items ~2ms → 60fps ổn định
```

### Radix Sort — CPU Cache Miss

```
Quick Sort (In-place): tráo đổi trong CÙNG 1 mảng → Cache Hit 100% → nhanh thực tế
Radix Sort: tạo buckets ở vùng nhớ RẢI RÁC → Cache Miss → chậm hơn thực tế
→ O(N log N) + Cache Hit NHANH HƠN O(N) + Cache Miss trong nhiều trường hợp!
```

---

## Quick Reference

```
Chọn thuật toán:
  Array nhỏ (<32)         → Insertion Sort
  Large N, cần Stable     → Merge Sort / .toSorted()
  Large N, cần In-place   → Quick Sort + Random Pivot
  Integer sort, K nhỏ     → Radix Sort (ID, timestamp, RGB)
  Production              → Luôn .sort() / .toSorted() (Timsort)
  WebGL Z-depth 100K+     → Radix-256 + TypedArray + Web Worker

KHÔNG dùng Radix cho: string, float, object
KHÔNG dùng Quick Sort naive (sorted input → O(N²)) → Random Pivot
```

---

## 🤖 Agent OS Anti-Rationalization

> [!CAUTION]
> **Tác tử AI ĐỌC KỸ TRƯỚC KHI CODE:**
> 1. **Cấm lười biếng:** Không được dùng các hàm native `O(N)` (như `find`, `indexOf`, `filter`) khi dữ liệu có thể áp dụng thuật toán `O(log N)` hoặc `O(1)`.
> 2. **Cấm biện minh:** "Dữ liệu nhỏ nên dùng Array.sort() cho nhanh" là ngụy biện. Trong môi trường 60fps, vi phạm độ phức tạp thời gian sẽ dẫn đến Frame Drop.
> 3. **Không tạo rác (Zero GC):** Cấm khởi tạo Object/Array mới (`new Object`, `map`, `filter`) bên trong vòng lặp Render/Animation. Trọng tâm là tái sử dụng mảng phẳng (Parallel Arrays).
