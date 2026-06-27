---
name: types-typed-array
description: Kỹ năng Agent chuyên biệt về cấu trúc dữ liệu types-typed-array cho hệ thống JavaScript High-Performance.
---

# TypedArray — Float32Array, Uint32Array & ArrayBuffer

TypedArray = vùng nhớ liên tục cố định kiểu. CPU Cache-friendly, zero GC khi dùng đúng cách. Backbone của WebGL, Audio API, và DP hiệu năng cao.

---

## DO — Khi nào dùng TypedArray

```
Float32Array  → Particle positions, WebGL vertex, LERP values, audio samples
Uint32Array   → DP tabulation (integer), pixel data (RGBA), index buffers
Int32Array    → Signed integers, Z-depth, difference arrays
Uint8Array    → Binary protocol, image manipulation, packed booleans
Uint16Array   → Index buffer WebGL (max 65535 vertices)
Float64Array  → High precision physics (thường không cần trên frontend)
```

---

## DON'T — Bẫy TypedArray

```javascript
// ❌ TypedArray KHÔNG có .push(), .pop(), .splice(), .filter(), .map()
const buf = new Float32Array(100);
buf.push(1.0); // TypeError: buf.push is not a function

// ❌ Kích thước CỐ ĐỊNH — không thể resize
const buf = new Float32Array(100);
// buf có đúng 100 phần tử, mãi mãi
// ✓ Fix: pre-allocate đủ lớn từ đầu

// ❌ Giá trị mặc định = 0 — không cần fill(0) (lãng phí)
const dp = new Uint32Array(1001); // Tự động 0, không cần .fill(0)

// ❌ Set giá trị ngoài range → silent truncate
const u8 = new Uint8Array(1);
u8[0] = 300; // Không error! Lưu 44 (300 % 256) — Silent Bug!
// ✓ Clamp trước: Math.min(Math.max(val, 0), 255)

// ❌ .filter() / .map() trả về TypedArray mới — KHÔNG hoạt động như Array
const result = new Float32Array([1, 2, 3]).filter(x => x > 1);
// result là Float32Array([2, 3]) nhưng cú pháp khác Array
// ✓ Dùng pointer partition (xem mẫu bên dưới)
```

---

## Particle System — Float32Array với STRIDE

```javascript
// Thay vì Array of Objects: [{x, y, vx, vy}, ...] → O(N) GC pressure
// ✓ Structure of Arrays: một Float32Array liên tục → CPU Cache-friendly

const NUM_PARTICLES = 10_000;
const STRIDE = 4; // x, y, vx, vy

const particles = new Float32Array(NUM_PARTICLES * STRIDE);

// Đọc/ghi theo stride
function getX(i)  { return particles[i * STRIDE + 0]; }
function getY(i)  { return particles[i * STRIDE + 1]; }
function setVx(i, v) { particles[i * STRIDE + 2] = v; }
function setVy(i, v) { particles[i * STRIDE + 3] = v; }

// rAF loop — O(N), zero allocation
function update() {
  for (let i = 0; i < NUM_PARTICLES; i++) {
    const base = i * STRIDE;
    particles[base + 0] += particles[base + 2]; // x += vx
    particles[base + 1] += particles[base + 3]; // y += vy
  }
}
// V8 JIT: nhận dạng STRIDE pattern → auto-vectorize với SIMD → nhanh gấp 4-8×
```

---

## DP Tabulation — Uint32Array

```javascript
// Coin Change: O(amount × coins) — Uint32Array nhanh hơn Array[] cho số nguyên
function coinChange(coins, amount) {
  const dp = new Uint32Array(amount + 1); // Tự động fill 0, không cần .fill()
  dp[0] = 1;

  for (const coin of coins) {
    for (let i = coin; i <= amount; i++) {
      dp[i] += dp[i - coin];
    }
  }
  return dp[amount];
}

// Dijkstra distances — Float32Array (cho weights float)
function initDistances(n) {
  const dist = new Float32Array(n);
  dist.fill(Infinity);
  dist[0] = 0;
  return dist;
}
```

---

## WebGL Vertex Buffer

```javascript
// Tạo mesh quad (2 triangles)
const vertices = new Float32Array([
  // x,    y,    z,    u,    v  (position + UV)
  -1.0, -1.0, 0.0, 0.0, 0.0,
   1.0, -1.0, 0.0, 1.0, 0.0,
   1.0,  1.0, 0.0, 1.0, 1.0,
  -1.0,  1.0, 0.0, 0.0, 1.0,
]);

const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);

// Upload lên GPU — KHÔNG copy, transfer ownership
const vbo = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
// gl.STATIC_DRAW: upload 1 lần, dùng nhiều lần (static geometry)
// gl.DYNAMIC_DRAW: upload nhiều lần (particles cập nhật mỗi frame)
```

### Cập nhật GPU buffer mỗi frame (Particles)

```javascript
const positionBuf = new Float32Array(NUM_PARTICLES * 2); // x, y

function tick() {
  // Update positions trong JS
  for (let i = 0; i < NUM_PARTICLES; i++) {
    positionBuf[i * 2] += velocityX;
    positionBuf[i * 2 + 1] += velocityY;
  }

  // Upload lên GPU — gl.DYNAMIC_DRAW đã hint "sẽ update thường xuyên"
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, positionBuf); // Chỉ update, không re-allocate

  requestAnimationFrame(tick);
}
```

---

## ArrayBuffer & DataView — Binary Protocol

```javascript
// Đọc binary file format (GLTF, WAV header, custom protocol)
const buffer = new ArrayBuffer(12);
const view = new DataView(buffer);

view.setFloat32(0, 3.14, true);   // Offset 0, little-endian
view.setInt32(4, 100, true);       // Offset 4
view.setUint32(8, 0xDEADBEEF, true); // Offset 8

// Đọc lại
console.log(view.getFloat32(0, true)); // 3.14
console.log(view.getInt32(4, true));   // 100

// WebSocket binary protocol
socket.binaryType = 'arraybuffer';
socket.onmessage = (e) => {
  const view = new DataView(e.data);
  const type = view.getUint8(0);
  const x    = view.getFloat32(1, true);
  const y    = view.getFloat32(5, true);
};
```

---

## Audio — Float32Array & Web Audio API

```javascript
const audioCtx = new AudioContext();

// Tạo buffer 1 giây stereo, 44100 Hz
const buffer = audioCtx.createBuffer(2, 44100, 44100);

// Channel data = Float32Array, giá trị trong [-1.0, 1.0]
const leftChannel  = buffer.getChannelData(0); // Float32Array(44100)
const rightChannel = buffer.getChannelData(1);

// Generate sine wave
for (let i = 0; i < 44100; i++) {
  const t = i / 44100;
  leftChannel[i]  = Math.sin(2 * Math.PI * 440 * t); // 440Hz = A4
  rightChannel[i] = leftChannel[i];
}
// Không tạo object mới trong vòng lặp → zero GC
```

---

## Transferable Objects — Web Worker không copy

```javascript
// ❌ postMessage({data: typedArray}) → COPY toàn bộ buffer (chậm với 100K items)
worker.postMessage({ positions: positionBuf });

// ✓ Transferable → ZERO COPY — ownership chuyển sang Worker (buffer trong JS = detached)
worker.postMessage({ positions: positionBuf }, [positionBuf.buffer]);
// positionBuf.byteLength === 0 sau khi transfer!

// Worker gửi lại:
worker.onmessage = ({ data }) => {
  // data.positions là buffer đã xử lý — nhận lại ownership
  renderParticles(data.positions);
};
```

---

## Pointer Partition — Thay thế .filter() trên TypedArray

```javascript
// Compact particles còn sống: không tạo array mới, mutate in-place
// (TypedArray không có .filter() trả về cùng kiểu)
function compactAlive(positions, alive, count) {
  let writeIdx = 0;
  for (let i = 0; i < count; i++) {
    if (alive[i]) {
      positions[writeIdx * 2]     = positions[i * 2];     // x
      positions[writeIdx * 2 + 1] = positions[i * 2 + 1]; // y
      writeIdx++;
    }
  }
  return writeIdx; // Số particle còn sống
}
// O(N) time, O(1) space — không tạo buffer mới
```

---

## Quick Reference

```
Float32Array  → Positions, colors, normals, audio samples (float 32-bit)
Uint32Array   → DP tabulation, index data (unsigned int 32-bit)
Uint8Array    → RGBA pixels, binary data, packed booleans
Uint16Array   → WebGL index buffer (max 65,535 vertices)

Kích thước cố định → pre-allocate đủ lớn từ đầu
Default value = 0 → không cần fill(0)
Uint8: 300 → 44 (silent truncate, không throw)

STRIDE pattern (SoA):
  [x0, y0, vx0, vy0, x1, y1, vx1, vy1, ...]
  base = i * STRIDE → V8 SIMD auto-vectorize → 4-8× nhanh hơn

Transferable: postMessage(data, [buffer]) → ZERO COPY
Web Worker: Radix Sort + TypedArray → 100K sort ~2ms → 60fps

DON'T:
  .push() / .pop() → không tồn tại trên TypedArray
  Viết quá range → silent truncate
  .fill(0) trên TypedArray mới → lãng phí (đã = 0)
  gl.bufferData() mỗi frame thay gl.bufferSubData() → re-allocate GPU
```


---

## 🤖 Agent OS Anti-Rationalization

> [!CAUTION]
> **Tác tử AI ĐỌC KỸ TRƯỚC KHI CODE:**
> 1. **Cấm lười biếng:** Không dùng Object `{}` để tra cứu (lookup) liên tục. BẮT BUỘC dùng `Map` hoặc `Set` để đạt `O(1)`.
> 2. **Cấm ngụy biện:** "Dùng Array.indexOf cho nhanh" là sai lầm khi mảng lớn. Phải đổi sang `Set.has()` nếu cần tìm kiếm nhiều lần.
> 3. **Tối đa hóa Typed Arrays:** Xử lý tọa độ (x, y, z) 3D hoặc WebGL bắt buộc dùng `Float32Array`. Cấm dùng Array thường để lưu số thực cường độ cao.
