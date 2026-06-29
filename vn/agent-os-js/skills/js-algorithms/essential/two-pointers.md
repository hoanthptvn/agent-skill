---
name: two-pointers
description: Kỹ năng Agent chuyên biệt về two-pointers cho hệ thống JavaScript High-Performance.
---

# Multiple Pointers — O(1) Space Pattern

Thu hẹp phạm vi bằng cách nhích con trỏ thông minh — không tốn thêm RAM.

Dùng khi: "Đã Sorted, Tìm cặp, So sánh 2 chuỗi, Xóa trùng tại chỗ"

---

## Document — 2 biến thể

```
Opposite Ends (Kẹp 2 đầu):
  left = 0, right = arr.length - 1
  Dựa vào tổng/hiệu → nhích trái hoặc phải
  Yêu cầu: mảng SORTED
  Ứng dụng: sumZero, averagePair, isPalindrome, 3Sum

Fast & Slow (Đuổi bắt cùng chiều):
  slow = 0, fast = 1 (hoặc cùng bắt đầu)
  fast chạy trước dò đường, slow chỉ di chuyển khi tìm thấy giá trị mới
  Ứng dụng: removeDuplicates, countUniqueValues, isSubsequence
  → O(1) Space — không tạo Set/Array mới

Naming Convention:
  ✓ left/right — Opposite Ends
  ✓ slow/fast — Fast & Slow
  ✗ i, j — gây nhầm lẫn với nested loop
```

---

## Thực hành — Opposite Ends

### sumZero — Bập bênh

```javascript
// ✗ O(N²) — Nested loop
function sumZeroNaive(arr) {
  for (let i = 0; i < arr.length; i++)
    for (let j = i + 1; j < arr.length; j++)
      if (arr[i] + arr[j] === 0) return [arr[i], arr[j]];
}

// ✓ O(N) — Two Pointers kẹp 2 đầu (mảng SORTED)
function sumZero(arr) {
  let left = 0,
    right = arr.length - 1;
  // ⚠️ TỬ HUYỆT: left < right (KHÔNG phải <=)
  // Nếu <=: [-1, 0, 1] → 2 pointers trỏ cùng 0 → 0+0=0 → SAI
  while (left < right) {
    const sum = arr[left] + arr[right];
    if (sum === 0) return [arr[left], arr[right]];
    sum > 0 ? right-- : left++; // Bập bênh: dương→hạ phải, âm→nâng trái
  }
}
```

### averagePair & isPalindrome

```javascript
function averagePair(arr, target) {
  if (!arr.length) return false;
  let left = 0,
    right = arr.length - 1;
  while (left < right) {
    const avg = (arr[left] + arr[right]) / 2;
    if (avg === target) return true;
    avg > target ? right-- : left++;
  }
  return false;
}

function isPalindrome(str) {
  let left = 0,
    right = str.length - 1;
  while (left < right) {
    if (str[left] !== str[right]) return false;
    left++;
    right--;
  }
  return true;
}
```

### 3Sum — O(N²) thay O(N³)

```javascript
function threeSum(arr) {
  arr.sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < arr.length - 2; i++) {
    if (i > 0 && arr[i] === arr[i - 1]) continue; // Skip duplicate
    let left = i + 1,
      right = arr.length - 1;
    while (left < right) {
      const sum = arr[i] + arr[left] + arr[right];
      if (sum === 0) {
        result.push([arr[i], arr[left], arr[right]]);
        while (left < right && arr[left] === arr[left + 1]) left++;
        while (left < right && arr[right] === arr[right - 1]) right--;
        left++;
        right--;
      } else if (sum < 0) left++;
      else right--;
    }
  }
  return result;
}
```

---

## Thực hành — Fast & Slow

### countUniqueValues — In-place O(1) Space

```javascript
// ✗ return new Set(arr).size — O(N) Space không cần thiết
// ✓ O(N) Time, O(1) Space (mảng SORTED)
function countUniqueValues(arr) {
  if (!arr.length) return 0;
  let slow = 0;
  for (let fast = 1; fast < arr.length; fast++) {
    if (arr[fast] !== arr[slow]) {
      slow++;
      arr[slow] = arr[fast]; // Ghi đè unique mới vào đúng vị trí
    }
  }
  return slow + 1;
}
// [1,1,2,3,3,4] → arr[0..3] = [1,2,3,4] → return 4
```

### isSubsequence — Cùng chiều

```javascript
function isSubsequence(str1, str2) {
  let i = 0; // Pointer cho str1
  for (let j = 0; j < str2.length; j++) {
    if (str1[i] === str2[j]) i++;
    if (i === str1.length) return true;
  }
  return false;
}
```

### removeDuplicates (LeetCode #26)

```javascript
function removeDuplicates(arr) {
  if (!arr.length) return 0;
  let slow = 0;
  for (let fast = 1; fast < arr.length; fast++) {
    if (arr[fast] !== arr[slow]) arr[++slow] = arr[fast];
  }
  return slow + 1;
}
```

---

## Frontend Use Cases

### Pinch-to-Zoom — 2 Touch Pointers

```javascript
// touches[0] và touches[1] = 2 pointers → tính khoảng cách → scale
let prevDist = 0,
  currentScale = 1;
const scaleTo = gsap.quickTo(target, "scale", { duration: 0.1 });

canvas.addEventListener("touchstart", (e) => {
  if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    prevDist = Math.sqrt(dx * dx + dy * dy);
  }
});

canvas.addEventListener("touchmove", (e) => {
  if (e.touches.length < 2) return;
  const dx = e.touches[0].clientX - e.touches[1].clientX;
  const dy = e.touches[0].clientY - e.touches[1].clientY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  currentScale *= dist / prevDist; // Multiple Pointers: ratio 2 điểm
  scaleTo(currentScale); // Zero GC thay vì gsap.to() liên tục
  prevDist = dist;
});
```

### Particle Compact In-place — Fast/Slow Pointer

```javascript
// Xóa particle đã chết khỏi Float32Array — KHÔNG tạo array mới
// slow = writeIdx (cursor ghi), fast = readIdx (cursor đọc)
const STRIDE = 4; // x, y, vx, vy

function compactParticles(buf, alive, count) {
  let slow = 0; // writeIdx
  for (let fast = 0; fast < count; fast++) {
    if (alive[fast]) {
      // Copy stride sang vị trí slow
      buf[slow * STRIDE] = buf[fast * STRIDE];
      buf[slow * STRIDE + 1] = buf[fast * STRIDE + 1];
      buf[slow * STRIDE + 2] = buf[fast * STRIDE + 2];
      buf[slow * STRIDE + 3] = buf[fast * STRIDE + 3];
      slow++;
    }
  }
  return slow; // Số particle còn sống
}
// O(N) Time, O(1) Space — không GC, không allocation
```

```
Space: O(1) ← Không tạo array mới, không GC, 60fps ổn định
Yêu cầu: Opposite Ends cần mảng SORTED
         Fast/Slow KHÔNG cần sorted
```

---

## Quick Reference

```
Time: O(N) | Space: O(1)

Opposite Ends: left/right kẹp 2 đầu, mảng SORTED
  sumZero, averagePair, isPalindrome, 3Sum

Fast & Slow: slow/fast cùng chiều
  countUniqueValues, removeDuplicates, isSubsequence

Bẫy:
  left <= right khi cần 2 index khác nhau → dùng <
  new Set(arr).size khi cần O(1) space → dùng Fast/Slow
```

---

## 🤖 Agent OS Anti-Rationalization

> [!CAUTION]
> **Tác tử AI ĐỌC KỸ TRƯỚC KHI CODE:**
>
> 1. **Cấm lười biếng:** Không được dùng các hàm native `O(N)` (như `find`, `indexOf`, `filter`) khi dữ liệu có thể áp dụng thuật toán `O(log N)` hoặc `O(1)`.
> 2. **Cấm biện minh:** "Dữ liệu nhỏ nên dùng Array.sort() cho nhanh" là ngụy biện. Trong môi trường 60fps, vi phạm độ phức tạp thời gian sẽ dẫn đến Frame Drop.
> 3. **Không tạo rác (Zero GC):** Cấm khởi tạo Object/Array mới (`new Object`, `map`, `filter`) bên trong vòng lặp Render/Animation. Trọng tâm là tái sử dụng mảng phẳng (Parallel Arrays).
