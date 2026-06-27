# Sliding Window — Tái sử dụng tính toán

"Thay vì tính lại từ đầu, chỉ tính sự thay đổi (diff)." Rẻ hơn hàng nghìn lần.

Dùng khi: "Liên tiếp (Contiguous), Mảng con/Chuỗi con, Dài nhất/Ngắn nhất"

---

## Document — 2 dạng cửa sổ

```
Fixed Window (Kích thước cố định K):
  Tính tổng K phần tử đầu → trượt: cộng phần tử mới, trừ phần tử rời đi
  O(N) thay O(N×K) ← tiết kiệm K lần tính

Dynamic Window (Kích thước thay đổi):
  end mở rộng cửa sổ → khi thỏa điều kiện → start co lại từ trái
  Tìm min/max length thỏa mãn điều kiện

⚠️ Off-by-one:
  windowLength = end - start + 1  ← phải +1 (inclusive range)
  windowLength = end - start      ← SAI khi start = end

Naming: windowStart/windowEnd hoặc start/end
```

---

## Thực hành — Fixed Window

### maxSubarraySum

```javascript
// ✗ O(N×K) — Tính lại tổng từ đầu mỗi vòng
function maxSubarraySumNaive(arr, k) {
  let max = -Infinity;
  for (let i = 0; i <= arr.length - k; i++) {
    let sum = 0;
    for (let j = i; j < i + k; j++) sum += arr[j]; // Tính lại K phần tử
    max = Math.max(max, sum);
  }
  return max;
}

// ✓ O(N) — Sliding Window: trừ cũ, cộng mới
function maxSubarraySum(arr, k) {
  if (arr.length < k) return null;
  let windowSum = 0;
  for (let i = 0; i < k; i++) windowSum += arr[i]; // Tổng K đầu tiên
  let max = windowSum;

  for (let i = k; i < arr.length; i++) {
    windowSum += arr[i] - arr[i - k]; // Cộng mới, trừ cũ — O(1) per step
    max = Math.max(max, windowSum);
  }
  return max;
}
```

---

## Thực hành — Dynamic Window

### minSubArrayLen

```javascript
// Tìm độ dài ngắn nhất của mảng con có tổng >= target
function minSubArrayLen(arr, target) {
  let total = 0, start = 0, minLen = Infinity;
  for (let end = 0; end < arr.length; end++) {
    total += arr[end]; // Mở rộng cửa sổ
    while (total >= target) { // Co cửa sổ từ trái khi thỏa
      minLen = Math.min(minLen, end - start + 1); // +1 inclusive!
      total -= arr[start++]; // Co lại
    }
  }
  return minLen === Infinity ? 0 : minLen;
}
```

### findLongestSubstring — Kết hợp Frequency Counter

```javascript
// Tìm chuỗi con dài nhất KHÔNG có ký tự trùng
function findLongestSubstring(str) {
  let maxLength = 0, windowStart = 0;
  const charIndexMap = new Map(); // Map → không bị Prototype chain bug

  for (let windowEnd = 0; windowEnd < str.length; windowEnd++) {
    const char = str[windowEnd];

    // Nếu đã gặp và vẫn TRONG cửa sổ → co cửa sổ lại
    if (charIndexMap.has(char) && charIndexMap.get(char) >= windowStart) {
      windowStart = charIndexMap.get(char) + 1;
    }

    charIndexMap.set(char, windowEnd); // Cập nhật vị trí mới nhất
    maxLength = Math.max(maxLength, windowEnd - windowStart + 1);
  }
  return maxLength;
}
```

---

## Frontend Use Cases

### Scroll Velocity → Skew Effect (Lenis + GSAP)

```javascript
// Bài toán: tính velocity trung bình 5 frames → skew/tilt mượt
// Dùng Circular Buffer — không tạo array mới mỗi frame

const WINDOW = 5;
const velocityBuf = new Float32Array(WINDOW); // TypedArray: zero GC
let bufIdx = 0, windowSum = 0;

lenis.on('scroll', ({ velocity }) => {
  // Sliding Window: trừ cũ, cộng mới → O(1) thay O(N)
  windowSum -= velocityBuf[bufIdx];
  windowSum += velocity;
  velocityBuf[bufIdx] = velocity;
  bufIdx = (bufIdx + 1) % WINDOW;

  const avgVelocity = windowSum / WINDOW; // Trung bình mượt, không giật
  gsap.to('.content', { skewY: avgVelocity * 0.02, duration: 0.1, overwrite: true });
});
```

### FPS Monitor — Tự điều chỉnh chất lượng

```javascript
const FPS_WINDOW = 60;
const frameTimes = new Float32Array(FPS_WINDOW).fill(16.67);
let fpsSum = 16.67 * FPS_WINDOW, fpsIdx = 0, lastT = performance.now();

function tick() {
  const now = performance.now(), dt = now - lastT; lastT = now;
  fpsSum -= frameTimes[fpsIdx];
  fpsSum += dt;
  frameTimes[fpsIdx] = dt;
  fpsIdx = (fpsIdx + 1) % FPS_WINDOW;

  const fps = 1000 / (fpsSum / FPS_WINDOW);
  if (fps < 30) reduceQuality(); // Tự giảm particle count
  requestAnimationFrame(tick);
}

```

```
Khác:
  Virtual Scrolling — Viewport = "cửa sổ" trượt qua 10K DOM nodes
  Real-time Search — Debounce window trên input stream
  Canvas rendering — chỉ vẽ objects trong viewport window

Space: O(1) ← Chân ái của Animation (không GC, không Jank)
  Circular Buffer (Float32Array) thay new Array() — zero allocation
```

---

## Quick Reference

```
Fixed Window:   O(N) Time, O(1) Space — trượt K phần tử cố định
Dynamic Window: O(N) Time, O(1) Space — mở rộng/co lại theo điều kiện

Nhận diện:
  "Tổng lớn nhất K phần tử liên tiếp"     → Fixed Window
  "Chuỗi con ngắn nhất thỏa mãn..."       → Dynamic Window
  "Chuỗi con dài nhất không trùng..."      → Dynamic + Map

Off-by-one:
  end - start + 1 ← PHẢI +1 cho inclusive range
```
