---
name: flip-sort
description: Kỹ năng Agent chuyên biệt về flip-sort cho hệ thống JavaScript High-Performance.
---

# Sorting — JS .sort(), Comparator & Insertion Sort

Trong Production, luôn dùng `.sort()` / `.toSorted()` (V8 Timsort). Chỉ cần hiểu Bubble/Insertion cho Nearly Sorted (Drag & Drop, Z-depth 60fps).

---

## Document — JS Sort Gotcha

```javascript
// ❌ KHÔNG truyền comparator → sort theo Unicode string
[6, 4, 15, 10].sort()         // [10, 15, 4, 6] ← SAI!
['banana', 'apple'].sort()    // ['apple', 'banana'] ← Đúng
['b', 'A', 'a'].sort()        // ['A', 'a', 'b'] ← Uppercase trước

// ✓ Luôn truyền comparator cho số
[6, 4, 15, 10].sort((a, b) => a - b)  // [4, 6, 10, 15] ← Tăng dần
[6, 4, 15, 10].sort((a, b) => b - a)  // [15, 10, 6, 4] ← Giảm dần
```

### Comparator — Inversion of Control

```
comparator(a, b) < 0  → a đứng trước b (giữ nguyên)
comparator(a, b) > 0  → b đứng trước a (swap)
comparator(a, b) = 0  → giữ nguyên vị trí (stable)
```

### Comparator Cheatsheet

```javascript
(a, b) => a - b                                      // Số tăng dần
(a, b) => b - a                                      // Số giảm dần
(a, b) => a.name.localeCompare(b.name, 'vi')         // Chuỗi tiếng Việt
(a, b) => (a.year - b.year) || (b.rating - a.rating) // Multi-criteria
(a, b) => Number(b.isActive) - Number(a.isActive)    // Boolean: true lên đầu
```

### Immutable Sort (State Management)

```javascript
// ⚠️ .sort() MUTATE mảng gốc → UI Proxy không phát hiện thay đổi
// ✓ ES6 clone:
const sorted = [...data].sort((a, b) => a.age - b.age);
// ✓ ES2023 immutable:
const sorted = data.toSorted((a, b) => a.age - b.age); // Gốc không đổi
```

---

## Big O — Bảng so sánh

```
Algorithm       Best      Average   Worst     Space   Stable  Use When
─────────────────────────────────────────────────────────────────────────
Bubble Sort     O(N)      O(N²)     O(N²)     O(1)    Yes     Nearly sorted
Selection Sort  O(N²)     O(N²)     O(N²)     O(1)    No      Min writes (Flash)
Insertion Sort  O(N)      O(N²)     O(N²)     O(1)    Yes     Nearly sorted, small N
Timsort (V8)    O(N)      O(N logN) O(N logN) O(N)    Yes     Built-in .sort()
```

---

## Thực hành — Bubble Sort (noSwaps Flag)

```javascript
function bubbleSort(arr, comparator = (a, b) => a - b) {
  let noSwaps;
  for (let i = arr.length; i > 0; i--) {
    noSwaps = true;
    for (let j = 0; j < i - 1; j++) {
      if (comparator(arr[j], arr[j + 1]) > 0) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]; // ES6 swap
        noSwaps = false;
      }
    }
    if (noSwaps) break; // Mảng đã sorted → thoát O(N)
  }
  return arr;
}
// [1,2,3,4,5] → 1 vòng, 0 swap, break → O(N)
// Nearly Sorted: Drag & Drop, WebGL Z-depth
```

### Insertion Sort — Shift thay Swap

```javascript
const insertionSort = (arr, comparator = (a, b) => a - b) => {
  const result = [...arr]; // Clone — không mutate gốc
  for (let i = 1; i < result.length; i++) {
    const currentVal = result[i]; // "Bốc lá bài"
    let j = i - 1;
    // Shift: đẩy phần tử lớn hơn sang phải (1 write thay 3 của swap)
    while (j >= 0 && comparator(result[j], currentVal) > 0) {
      result[j + 1] = result[j]; // Shift right
      j--;
    }
    result[j + 1] = currentVal; // Đặt lá bài đúng vị trí
  }
  return result;
};
// Best case O(N) — Nearly sorted, while loop hầu như không chạy
// WebSocket live data: tin mới chen vào mảng gần-sorted → Insertion thắng
```

---

## FLIP Animation — Sort UI mượt mà

```javascript
// Bước 1: FIRST — lưu vị trí cũ
const firstPositions = items.map(el => el.getBoundingClientRect());

// Bước 2: Sort data (không đụng DOM)
data.sort((a, b) => a.price - b.price);

// Bước 3: LAST — render + lưu vị trí mới
renderItems(data);
const lastPositions = items.map(el => el.getBoundingClientRect());

// Bước 4: INVERT + PLAY — GSAP animate
items.forEach((el, i) => {
  const dx = firstPositions[i].left - lastPositions[i].left;
  const dy = firstPositions[i].top - lastPositions[i].top;
  gsap.fromTo(el, { x: dx, y: dy }, { x: 0, y: 0, duration: 0.4 });
});
// DOM Write tối thiểu, GSAP GPU transform → 60fps
```

---

## Filter FLIP — Show/Hide Items mượt mà

```javascript
// Bài toán: Click filter "Electronics" → chỉ hiện items đó, items khác biến
// Frequency Counter group → FLIP reveal/hide

const grouped = new Map(); // Build 1 lần O(N)
for (const p of products) {
  if (!grouped.has(p.category)) grouped.set(p.category, []);
  grouped.get(p.category).push(p);
}

function filterFlip(selectedCategory) {
  const allEls = document.querySelectorAll('.card');

  // FIRST: lưu vị trí cũ của tất cả
  const firstRects = new Map();
  allEls.forEach(el => firstRects.set(el, el.getBoundingClientRect()));

  // Quyết định show/hide (không đụng DOM layout ngay)
  const visible = grouped.get(selectedCategory) || []; // O(1) lookup
  const visibleIds = new Set(visible.map(p => p.id));

  // LAST: thay đổi visibility → DOM reflow xảy ra
  allEls.forEach(el => {
    el.style.display = visibleIds.has(+el.dataset.id) ? '' : 'none';
  });

  // INVERT + PLAY: chỉ animate items vẫn visible
  allEls.forEach(el => {
    if (el.style.display === 'none') return;
    const first = firstRects.get(el);
    const last  = el.getBoundingClientRect();
    const dx = first.left - last.left;
    const dy = first.top  - last.top;
    if (dx === 0 && dy === 0) return; // Không di chuyển → skip
    gsap.fromTo(el,
      { x: dx, y: dy, opacity: 0 },
      { x: 0,  y: 0,  opacity: 1, duration: 0.4, ease: 'power2.out' }
    );
  });
}
```

---

## DON'T — Bẫy Sort

```javascript
// ❌ Sort DOM trực tiếp → N lần reflow
items.forEach(item => parent.appendChild(item));
// ✓ Sort data trong memory → render 1 lần
const sorted = [...data].toSorted((a, b) => a.order - b.order);
parent.innerHTML = sorted.map(d => `<li>${d.name}</li>`).join('');

// ❌ Selection Sort → Unstable → đảo thứ tự phần tử bằng nhau → UX bug
// ✓ Production dùng .sort() (Timsort — Stable)

// ❌ ES6 Swap [a,b]=[b,a] trong rAF hot path → tạo array tạm
// ✓ Temp var: const t = a; a = b; b = t; → Zero GC
```

---

## Quick Reference

```
Production:     .sort((a,b) => a-b) hoặc .toSorted() ← LUÔN DÙNG
Nearly Sorted:  Bubble (noSwaps) hoặc Insertion → O(N) best
Immutable:      .toSorted() (ES2023) hoặc [...arr].sort()
FLIP Animation: FIRST → sort data → LAST → INVERT+PLAY (GSAP)

Bẫy:
  .sort() thiếu comparator → string sort → SAI
  localeCompare('vi') cho tiếng Việt
  mutate state trong JS thuần (nếu track bằng reference) → UI không update
  DOM sort trực tiếp → N reflows → jank
```

---

## 🤖 Agent OS Anti-Rationalization

> [!CAUTION]
> **Tác tử AI ĐỌC KỸ TRƯỚC KHI CODE:**
> 1. **Cấm lười biếng:** Không được dùng các hàm native `O(N)` (như `find`, `indexOf`, `filter`) khi dữ liệu có thể áp dụng thuật toán `O(log N)` hoặc `O(1)`.
> 2. **Cấm biện minh:** "Dữ liệu nhỏ nên dùng Array.sort() cho nhanh" là ngụy biện. Trong môi trường 60fps, vi phạm độ phức tạp thời gian sẽ dẫn đến Frame Drop.
> 3. **Không tạo rác (Zero GC):** Cấm khởi tạo Object/Array mới (`new Object`, `map`, `filter`) bên trong vòng lặp Render/Animation. Trọng tâm là tái sử dụng mảng phẳng (Parallel Arrays).
