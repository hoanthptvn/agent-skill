# Animation Core — LERP, Easing, rAF, Virtual Scroll

Deep reference cho animation engineering bằng JS thuần: toán học nội suy, easing, rAF architecture.

---

## LERP — Linear Interpolation

```javascript
// Công thức: current + (target - current) * factor
// factor = 0.1 → slow, smooth (UI follow)
// factor = 0.3 → medium (scroll parallax)
// factor = 0.8 → fast, snappy (immediate response)

function lerp(current, target, factor) {
  return current + (target - current) * factor;
}

// Mouse follower với LERP
let mouseX = 0, mouseY = 0;
let currentX = 0, currentY = 0;

document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

function tick() {
  currentX = lerp(currentX, mouseX, 0.1);
  currentY = lerp(currentY, mouseY, 0.1);
  cursor.style.transform = `translate(${currentX}px, ${currentY}px)`;
  requestAnimationFrame(tick);
}
tick();

// Dừng khi đủ gần (tránh vòng lặp vô hạn)
function lerpWithSnap(current, target, factor, threshold = 0.01) {
  if (Math.abs(target - current) < threshold) return target;
  return current + (target - current) * factor;
}
```

---

## Easing Functions

```javascript
const easing = {
  easeInQuad:  t => t * t,
  easeOutQuad: t => t * (2 - t),
  easeInOutQuad: t => t < 0.5 ? 2*t*t : -1 + (4-2*t)*t,
  easeOutElastic: t => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10*t) * Math.sin((t*10-0.75)*c4) + 1;
  },
  easeOutBack: t => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t-1, 3) + c1 * Math.pow(t-1, 2);
  },
};

// Dùng với rAF animation
function animate(el, from, to, duration, easeFn = easing.easeOutQuad) {
  const start = performance.now();
  function step(now) {
    const elapsed = now - start;
    const t = Math.min(elapsed / duration, 1);
    const value = from + (to - from) * easeFn(t);
    el.style.transform = `translateY(${value}px)`;
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
```

---

## DOM Recycling — Virtual Scroll

```javascript
// Chỉ render số items trong viewport — không render 10,000 items
class VirtualScroller {
  constructor(container, items, itemHeight) {
    this.container  = container;
    this.items      = items;
    this.itemHeight = itemHeight;
    this.visibleCount = Math.ceil(window.innerHeight / itemHeight) + 2; // Buffer
    this.pool       = [];
    this._init();
  }

  _init() {
    // Set container height để scrollbar đúng
    this.container.style.height = `${this.items.length * this.itemHeight}px`;

    // Create DOM pool (chỉ visibleCount elements)
    for (let i = 0; i < this.visibleCount; i++) {
      const el = document.createElement('div');
      el.className = 'virtual-item';
      el.style.position = 'absolute';
      el.style.height = `${this.itemHeight}px`;
      el.style.width = '100%';
      this.container.appendChild(el);
      this.pool.push(el);
    }

    this.container.parentElement.addEventListener('scroll', () => this._update());
    this._update();
  }

  _update() {
    const scrollTop = this.container.parentElement.scrollTop;
    const startIdx  = Math.floor(scrollTop / this.itemHeight);

    this.pool.forEach((el, poolIdx) => {
      const dataIdx = startIdx + poolIdx;
      if (dataIdx >= this.items.length) { el.style.display = 'none'; return; }
      el.style.display = '';
      el.style.transform = `translateY(${dataIdx * this.itemHeight}px)`;
      el.textContent = this.items[dataIdx]; // Render data
    });
  }
}

// Bước tiếp theo: dùng Binary Search tìm startIdx → xem essential/binary-search.md
```

---

## rAF Architecture — Time Slicing

```javascript
// Time slicing: chia heavy work ra nhiều frames để tránh long task > 50ms

function processLargeDataset(items, processOne, onComplete) {
  const BUDGET_MS = 8; // 8ms budget per frame (để còn 8ms cho browser)
  let idx = 0;

  function processChunk() {
    const deadline = performance.now() + BUDGET_MS;
    while (idx < items.length && performance.now() < deadline) {
      processOne(items[idx++]);
    }
    if (idx < items.length) requestAnimationFrame(processChunk);
    else onComplete?.();
  }

  requestAnimationFrame(processChunk);
}

// Ví dụ: Parse 10,000 rows CSV không block UI
processLargeDataset(
  csvRows,
  row => dataStore.push(parseRow(row)),
  () => renderTable(dataStore)
);
```

### rAF với Timestamp (Delta Time)

```javascript
// Delta time: animation speed không phụ thuộc frame rate
let lastTime = 0;

function tick(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.1); // cap at 100ms
  lastTime = timestamp;

  // dt = 0.016 @ 60fps, 0.033 @ 30fps — velocity nhất quán
  particles.forEach(p => {
    p.x += p.vx * dt * 60; // Normalize to 60fps
    p.y += p.vy * dt * 60;
  });

  render();
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
```

### Cleanup Pattern

```javascript
class AnimationSystem {
  constructor() {
    this._rafId    = null;
    this._handlers = new Map();
    this._active   = false;
  }

  start() {
    if (this._active) return;
    this._active = true;
    const loop = (t) => {
      if (!this._active) return;
      this._handlers.forEach(fn => fn(t));
      this._rafId = requestAnimationFrame(loop);
    };
    this._rafId = requestAnimationFrame(loop);
  }

  stop() {
    this._active = false;
    cancelAnimationFrame(this._rafId);
  }

  add(key, fn) { this._handlers.set(key, fn); }
  remove(key)  { this._handlers.delete(key); }
}

// Usage
const anim = new AnimationSystem();
anim.add('particles', (t) => updateParticles(t));
anim.add('cursor',    (t) => updateCursor(t));
anim.start();

// Cleanup khi unmount
window.addEventListener('beforeunload', () => anim.stop());
```

---

## Dirty Flag — Tránh recompute mỗi frame

```javascript
let dirty = true;
let cachedLayout = null;

function onResize() { dirty = true; } // Chỉ đánh dấu
window.addEventListener('resize', onResize);

function tick() {
  if (dirty) {
    cachedLayout = computeExpensiveLayout(); // Chỉ chạy khi cần
    dirty = false;
  }
  renderFrame(cachedLayout);
  requestAnimationFrame(tick);
}
```

---

## TypedArray cho particle/bulk data

```javascript
// ✗ Object array: Cache miss, GC pressure
const particles = Array.from({ length: 1000 }, () => ({ x: 0, y: 0, vx: 0, vy: 0 }));

// ✓ TypedArray: Contiguous memory, SIMD-friendly, zero GC
const STRIDE = 4; // x, y, vx, vy
const buf = new Float32Array(1000 * STRIDE);
// buf[i*STRIDE+0]=x, buf[i*STRIDE+1]=y, buf[i*STRIDE+2]=vx, buf[i*STRIDE+3]=vy

// Update loop — for-i, no allocation
for (let i = 0; i < 1000; i++) {
  buf[i*STRIDE+0] += buf[i*STRIDE+2]; // x += vx
  buf[i*STRIDE+1] += buf[i*STRIDE+3]; // y += vy
}
```

---

> **Batch Read → Batch Write** — xem `loops/loops.md` (mục "Batch DOM reads")

---

## Object Pool — Zero-GC Particle System

```javascript
class ObjectPool {
  constructor(factory, resetFn, initialSize = 50) {
    this._factory  = factory;
    this._resetFn  = resetFn;
    this._pool     = Array.from({ length: initialSize }, factory);
    this._active   = [];
  }

  acquire() {
    const obj = this._pool.pop() ?? this._factory();
    this._active.push(obj);
    return obj;
  }

  release(obj) {
    const idx = this._active.indexOf(obj);
    if (idx !== -1) {
      this._active.splice(idx, 1);
      this._resetFn(obj);
      this._pool.push(obj);
    }
  }

  releaseAll() {
    while (this._active.length) this.release(this._active[0]);
  }
}

// Usage — particle system
const particlePool = new ObjectPool(
  () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0, active: false }),
  (p) => { p.x = p.y = p.vx = p.vy = p.life = 0; p.active = false; }
);

function spawnParticle(x, y) {
  const p = particlePool.acquire();
  p.x = x; p.y = y; p.vx = Math.random() * 2 - 1; p.vy = -3; p.life = 1; p.active = true;
}
// 0 new objects → 0 GC → 60fps ổn định
```
