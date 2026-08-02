---
name: binary-search
description: Kỹ năng Agent chuyên biệt về binary-search cho hệ thống JavaScript High-Performance.
---

# Binary Search — O(log N) Iterative

Chia đôi dữ liệu, loại bỏ nửa không cần thiết. Yêu cầu: Dữ liệu **Sorted**.

Dùng khi: "Sorted + Tìm kiếm / Vị trí / Tần suất"

---

## Document — Sức mạnh O(log N)

```
N = 1,000,000:
  .indexOf() → O(N)      → 1,000,000 bước
  Binary Search → O(log N) → 20 bước ← Nhanh hơn 50,000 lần

Dấu hiệu nhận diện:
  i *= 2 hoặc i /= 2 trong vòng lặp → O(log N)
  "Sorted" + "Tìm kiếm" → BINARY SEARCH

Trade-off:
  Sort: O(N log N) — ĐẮT hơn Linear Search O(N)
  KHÔNG sort chỉ để Binary Search 1 lần
  Binary Search chỉ có lãi khi:
    → Dữ liệu đã sorted từ API
    → Sort 1 lần lúc init, search hàng ngàn lần sau đó
```

---

## Thực hành — Iterative O(1) Space

```javascript
const binarySearch = (arr, target) => {
  // Early Bailout
  if (!arr.length || target < arr[0] || target > arr[arr.length - 1]) return -1;

  let left = 0,
    right = arr.length - 1;

  while (left <= right) {
    // ← PHẢI có =
    const mid = left + Math.floor((right - left) / 2); // ← Tránh Integer Overflow

    if (arr[mid] === target) return mid; // Found → Early Exit
    arr[mid] < target
      ? (left = mid + 1) // ← PHẢI +1
      : (right = mid - 1); // ← PHẢI -1
  }
  return -1;
};
```

### Bẫy chí mạng

```javascript
// ❌ Thiếu = → bỏ sót phần tử cuối (start === end → skip)
while (left < right)
  // Sai
  while (left <= right)
    // Đúng

    // ❌ left = mid → INFINITE LOOP → Tab crash
    left = mid; // Sai (khi left=mid=right → stuck)
left = mid + 1; // Đúng

// ❌ Tràn số (Java/C++ mindset)
Math.floor((left + right) / 2); // Có thể overflow 32-bit
left + Math.floor((right - left) / 2); // An toàn

// Bitwise >> 1 — nhanh hơn nhưng 32-bit limit
const mid = (left + right) >>> 1; // unsigned shift, OK cho mảng < 2.1 tỷ
```

---

## Boundary Search — Tìm ranh giới

```javascript
// countZeroes — [1,1,1,0,0,0]: Tìm first zero index
function countZeroes(arr) {
  let left = 0,
    right = arr.length - 1,
    firstZeroIdx = -1;
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    if (arr[mid] === 0) {
      firstZeroIdx = mid;
      right = mid - 1; // Ép trái để tìm sớm hơn (KHÔNG return ngay)
    } else {
      left = mid + 1;
    }
  }
  return firstZeroIdx === -1 ? 0 : arr.length - firstZeroIdx;
}

// sortedFrequency — đếm tần suất 1 số trong sorted array
function sortedFrequency(arr, num) {
  const findBound = (arr, num, findFirst) => {
    let lo = 0,
      hi = arr.length - 1,
      res = -1;
    while (lo <= hi) {
      const mid = lo + ((hi - lo) >> 1);
      if (arr[mid] === num) {
        res = mid;
        findFirst ? (hi = mid - 1) : (lo = mid + 1);
      } else arr[mid] < num ? (lo = mid + 1) : (hi = mid - 1);
    }
    return res;
  };
  const first = findBound(arr, num, true);
  return first === -1 ? 0 : findBound(arr, num, false) - first + 1;
}
```

### Rotated Array — Phỏng vấn kinh điển

```javascript
function findRotatedIndex(arr, target) {
  let left = 0,
    right = arr.length - 1;
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    if (arr[mid] === target) return mid;
    if (arr[left] <= arr[mid]) {
      // Nửa TRÁI sorted
      target >= arr[left] && target < arr[mid]
        ? (right = mid - 1)
        : (left = mid + 1);
    } else {
      // Nửa PHẢI sorted
      target > arr[mid] && target <= arr[right]
        ? (left = mid + 1)
        : (right = mid - 1);
    }
  }
  return -1;
}
```

---

## Frontend Production — Use Cases

```javascript
// Virtual Scroll — tìm item tại vị trí scroll O(log N)
const offsets = [0, 50, 130, 200, 310, ...]; // Sorted, tính 1 lần khi init
function findItemAtScroll(offsets, scrollTop) {
  let lo = 0, hi = offsets.length - 1;
  while (lo <= hi) {
    const mid = lo + ((hi - lo) >> 1);
    if (offsets[mid] <= scrollTop) lo = mid + 1; else hi = mid;
  }
  return Math.max(0, lo - 1);
  // 100K items → 17 bước → không Jank
}

// GSAP Timeline Scrubbing — tìm keyframe theo ms
function findKeyframe(keyframes, currentMs) {
  let lo = 0, hi = keyframes.length - 1, result = 0;
  while (lo <= hi) {
    const mid = lo + ((hi - lo) >> 1);
    if (keyframes[mid].time <= currentMs) { result = mid; lo = mid + 1; }
    else hi = mid - 1;
  }
  return keyframes[result];
}

// Data Visualization — hover tìm timestamp gần nhất
function findNearest(timestamps, hoverX) {
  let lo = 0, hi = timestamps.length - 1;
  while (lo <= hi) {
    const mid = lo + ((hi - lo) >> 1);
    if (timestamps[mid] === hoverX) return mid;
    timestamps[mid] < hoverX ? (lo = mid + 1) : (hi = mid - 1);
  }
  return lo;
}
```

---

## Hierarchy — Tốc độ tìm kiếm

```
Tìm 1 lần              → arr.indexOf() / arr.find() O(N), native C++
Tìm nhiều lần (sorted) → Binary Search O(log N)
Tìm liên tục vô hạn   → Hash Map / Set.has() O(1)
```

---

## Quick Reference

```
Time: O(log N) | Space: O(1) — iterative, KHÔNG recursion

3 bẫy chí mạng:
  while (left < right)  → thiếu = → miss phần tử cuối
  left = mid            → thiếu +1 → Infinite Loop
  (left + right) / 2    → Integer Overflow (32-bit)

Frontend:
  Virtual Scroll    → Binary Search trên cumulativeHeights[]
  GSAP Timeline     → Binary Search trên sorted keyframes[]
  Data Visualization → Binary Search trên timestamps[]
  Three.js Raycasting → BVH/Octree (Binary Search 3D)
```

---

## 🤖 Agent OS Anti-Rationalization

> [!CAUTION]
> **Tác tử AI ĐỌC KỸ TRƯỚC KHI CODE:**
>
> 1. **Cấm quét mảng tuyến tính (O(N)):** Tuyệt đối cấm dùng `Array.prototype.find()` hoặc `.indexOf()` trên một mảng ĐÃ ĐƯỢC SORTED. Bắt buộc dùng Binary Search.
> 2. **Chống tràn bộ nhớ (Integer Overflow):** Khi tính điểm giữa `mid`, cấm viết `(left + right) / 2`. BẮT BUỘC dùng công thức an toàn `left + Math.floor((right - left) / 2)` hoặc Bitwise `>> 1`.
> 3. **Bẫy vô hạn (Infinite Loop):** Cảnh báo lỗi chí mạng: luôn cập nhật `left = mid + 1` và `right = mid - 1`. Cấm gán `left = mid` sẽ gây đứng trình duyệt (Tab Crash).
