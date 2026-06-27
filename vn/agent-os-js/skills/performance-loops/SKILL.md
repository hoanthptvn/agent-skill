---
name: performance-loops
description: Kỹ năng Agent chuyên biệt về tối ưu vòng lặp (Performance Loops) cho hệ thống JavaScript High-Performance.
---

# Loops — Chọn đúng cho từng tình huống

Vòng lặp sai = O(N²) ẩn, GC spike, Infinite Loop. Chọn đúng = 60fps mọi lúc.

---

## for (let i) — Performance Critical

```javascript
// Nhanh nhất — V8 JIT (Turbofan) tối ưu mạnh nhất cho dạng này
// Dùng khi: cần index, rAF hot path, TypedArray, backward iteration
for (let i = 0; i < arr.length; i++) { /* ... */ }

// Cache length nếu mảng không đổi trong loop (micro-optimization)
for (let i = 0, len = arr.length; i < len; i++) { /* ... */ }

// Lặp ngược — an toàn khi xóa phần tử (splice không ảnh hưởng phía trước)
for (let i = arr.length - 1; i >= 0; i--) {
  if (shouldRemove(arr[i])) arr.splice(i, 1);
}

// TypedArray — BẮT BUỘC dùng for(let i)
const positions = new Float32Array(3000);
for (let i = 0; i < positions.length; i += 3) {
  positions[i]     += velocityX; // x
  positions[i + 1] += velocityY; // y
  positions[i + 2] += velocityZ; // z
}
```

---

## for...of — Default cho mọi Iterable

```javascript
// Dùng cho: Array, Set, Map, NodeList, String, Generator
// Unicode safe (xử lý Emoji/Surrogate Pairs đúng)
for (const item of arr) { /* ... */ }
for (const char of str) { /* ... */ } // 🚀 = 1 phần tử, không bị chẻ
for (const [key, value] of map) { /* ... */ }
for (const node of document.querySelectorAll('.card')) { /* ... */ }

// ✓ Hỗ trợ break / continue / return
for (const item of arr) {
  if (item === target) return item; // Thoát ngay
  if (item < 0) continue;          // Bỏ qua
}

// ⚠️ Không dùng cho Object — dùng for...in hoặc Object.entries()
```

---

## while — Queue, BFS, Pointer Pattern

```javascript
// BFS Queue — head pointer O(1) thay shift() O(N)
let head = 0;
while (head < queue.length) {
  const node = queue[head++]; // O(1) dequeue
  // ... xử lý node, push hàng xóm vào cuối queue
}

// Two Pointer — mảng sorted
let left = 0, right = arr.length - 1;
while (left < right) {
  const sum = arr[left] + arr[right];
  if (sum === target) return [left, right];
  sum < target ? left++ : right--;
}

// Animation loop condition
while (stack.length && processed < 500) { // Chunking — tối đa 500 nodes/frame
  const node = stack.pop();
  processed++;
}
```

---

## forEach — Chỉ init/setup, KHÔNG hot path

```javascript
// ⚠️ Tạo closure (hàm ẩn danh) MỖI iteration → GC phải dọn
// ⚠️ KHÔNG hỗ trợ break, continue, return (chỉ return khỏi callback)

// ✓ OK cho setup 1 lần
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', handleClick);
});

// ❌ KHÔNG trong rAF — closure allocation mỗi frame
function tick() {
  particles.forEach(p => updateParticle(p)); // ❌ closure mỗi vòng
  requestAnimationFrame(tick);
}
// ✓ Fix:
function tick() {
  for (let i = 0; i < particles.length; i++) updateParticle(particles[i]);
  requestAnimationFrame(tick);
}

// ❌ KHÔNG khi cần break sớm
arr.forEach(item => {
  if (item === target) return; // Chỉ break CALLBACK, vòng lặp vẫn chạy tiếp!
});
// ✓ Fix: dùng for...of hoặc for(let i)
```

---

## .map / .filter / .reduce — KHÔNG chain trong hot path

```javascript
// Mỗi method tạo 1 mảng MỚI trên Heap → chain = N mảng rác → GC spike

// ❌ O(3N) + 2 mảng tạm
const result = arr
  .filter(x => x > 0)     // Mảng mới #1
  .map(x => x * 2)        // Mảng mới #2
  .reduce((a, b) => a + b, 0);

// ✓ O(N) + 0 allocation
let result = 0;
for (const x of arr) { if (x > 0) result += x * 2; }

// ✓ OK cho init/setup (không phải hot path)
const sortedNames = users
  .filter(u => u.active)
  .map(u => u.name)
  .sort((a, b) => a.localeCompare(b, 'vi'));
```

---

## for...in — Chỉ cho Object, KHÔNG cho Array

```javascript
// Duyệt enumerable properties (bao gồm prototype chain)
for (const key in obj) {
  if (obj.hasOwnProperty(key)) { /* ... */ } // Guard prototype
}

// ❌ KHÔNG dùng cho Array — duyệt cả prototype methods + index là string
for (const i in arr) {
  console.log(typeof i); // "string" — không phải number!
}
// ✓ Dùng for...of hoặc for(let i) cho Array

// ✓ Kiểm tra Object empty O(1)
function isEmpty(obj) { for (const _ in obj) return false; return true; }
```

---

## do...while — Hiếm, chạy ít nhất 1 lần

```javascript
// Body chạy TRƯỚC khi kiểm tra điều kiện
let attempt = 0;
do {
  result = tryConnect();
  attempt++;
} while (!result && attempt < 3);
// Retry pattern — ít nhất 1 lần, tối đa 3 lần
```

---

## rAF Frame Budget — ≤ 4ms JavaScript

```
16.67ms total per frame (60fps)
├── rAF callback:   ≤ 4ms   (JavaScript)
├── Style/Layout:   ≤ 3ms   (browser)
├── Paint:          ≤ 5ms   (browser)
└── Composite:      ≤ 2ms   (browser)

Nếu JS > 4ms → frame drop → jank
```

### DO NOT list trong rAF hot path

```javascript
// ❌ KHÔNG BAO GIỜ trong requestAnimationFrame callback:
new Object()                      // GC allocation
arr.map() / filter() / reduce()   // Tạo array mới mỗi frame
arr.forEach(fn)                   // Closure allocation mỗi iteration
document.querySelector()          // DOM query — O(N) DOM scan
el.getBoundingClientRect()        // Force layout reflow
Object.keys() / values()          // Tạo Array mới
JSON.parse() / JSON.stringify()   // String allocation
/regex/.test()                    // State Machine overhead — chậm 55-80%
[...arr]                          // Spread = copy toàn bộ

// ✓ LUÔN trong rAF:
// - Precompute ở init, cache kết quả
// - Reuse objects với .set() thay vì new
// - Dirty Flag: chỉ recompute khi state thay đổi
// - for (let i) thay forEach
// - TypedArray cho bulk data (Float32Array)
// - Object Pool thay vì create/destroy
```

### Batch DOM reads → Batch DOM writes

```javascript
// ❌ Read-Write xen kẽ → mỗi write gây Forced Reflow → N lần reflow
for (const el of cards) {
  const rect = el.getBoundingClientRect(); // Read → force layout
  el.style.transform = `translateX(${rect.x}px)`; // Write → invalidate layout
  // Vòng sau: getBoundingClientRect phải tính lại layout → O(N²) reflows
}

// ✓ Batch reads trước → Batch writes sau → 1 lần reflow
const rects = [];
for (const el of cards) rects.push(el.getBoundingClientRect()); // Batch reads
for (let i = 0; i < cards.length; i++) {
  cards[i].style.transform = `translateX(${rects[i].x}px)`; // Batch writes
}
```

---

## Quick Reference

```
Chọn vòng lặp:
  rAF hot path / TypedArray / cần index   → for (let i)
  Mọi iterable / Unicode string           → for...of
  Queue / BFS / Pointer / condition        → while
  Init/setup 1 lần                         → forEach OK
  Object enumeration                       → for...in + hasOwnProperty
  Chạy ít nhất 1 lần                       → do...while

TUYỆT ĐỐI TRÁNH:
  .forEach() trong rAF                    → closure mỗi frame
  .map().filter().reduce() chain          → 2+ mảng rác → GC spike
  Read-Write DOM xen kẽ trong loop        → O(N²) reflows
  /regex/ trong hot path                  → chậm 55-80%
  new Object() trong rAF                  → GC allocation

Frame Budget 60fps:
  ≤ 4ms JavaScript per frame
  Vượt → jank → rớt FPS
```

---

## Cleanup / Destroy — Tránh Memory Leak

Khi navigate hoặc unmount component, phải dọn dẹp **đúng thứ tự**. Bỏ qua → memory leak, zombie animation, scroll listener rác.

```javascript
// === Destroy Pattern chuẩn ===
function initAnimation() {
  const lenis = new Lenis();
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.section',
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
    }
  });

  tl.to('.hero', { opacity: 0, y: -100 });

  // Lenis rAF loop
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // ✅ Return destroy function — gọi khi unmount
  return function destroy() {
    // 1. Kill GSAP trước (dừng animation)
    tl.scrollTrigger?.kill();
    tl.kill();

    // 2. Kill toàn bộ ScrollTrigger liên quan
    ScrollTrigger.getAll().forEach(st => st.kill());

    // 3. Destroy Lenis (dừng rAF loop + remove listeners)
    lenis.destroy();

    // 4. Clear inline styles GSAP để lại
    gsap.set('.hero', { clearProps: 'all' });
  };
}

// Sử dụng:
const destroy = initAnimation();
// Khi navigate đi: destroy();
```

### Thứ tự destroy

```
1. ScrollTrigger.kill()   ← dừng theo dõi scroll trước
2. timeline.kill()        ← dừng animation
3. lenis.destroy()        ← dừng smooth scroll + rAF
4. gsap.set(clearProps)   ← xóa inline styles
5. removeEventListener()  ← dọn event thủ công (nếu có)

⚠️ Đảo thứ tự → race condition:
   kill Lenis trước ScrollTrigger → ScrollTrigger cố đọc scroll position đã chết → lỗi
```



---

## 🤖 Agent OS Anti-Rationalization

> [!CAUTION]
> **Tác tử AI ĐỌC KỸ TRƯỚC KHI CODE:**
> 1. **Cấm lười biếng:** Không dùng `forEach`, `map`, `filter` trong hot path (Render/Animation Loop). BẮT BUỘC dùng `for (let i = 0)`.
> 2. **Cấm biện minh:** "Viết Functional Programming cho dễ đọc" là ngụy biện. Hàm callback tạo ra Overhead function call và rác bộ nhớ (GC Thrashing).
> 3. **Kiểm soát GC:** Tuyệt đối không tạo Closure hoặc Anonymous function bên trong vòng lặp hiệu năng cao.
