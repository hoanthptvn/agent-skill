---
name: vanilla-module-pattern
description: Kiến trúc Vanilla JS chuẩn cho creative sites (không React). Bao gồm: Module Pattern với init/destroy/resize interface chuẩn, Islands Architecture (static HTML default + selective hydration), PRPL Pattern cho Vite project, ESM Import Map cho buildless prototype, Complexity Budget (JS budget discipline). Kích hoạt khi user dùng HTML thuần, GSAP CDN, không framework, Vite+vanilla, hoặc hỏi về cách tổ chức code vanilla JS.
---

## Tổng quan
Cung cấp một kiến trúc module hóa cho các trang web sáng tạo (creative websites) bằng JS thuần. Nó ép buộc tuân thủ Kiến trúc Hòn đảo (Islands Architecture - mặc định HTML tĩnh, chỉ nạp thủy hóa - hydration - có chọn lọc), vòng đời module nghiêm ngặt (`init`/`destroy`/`resize`), mô hình PRPL cho Vite, và ngân sách độ phức tạp JS (JS complexity budgets). Điều này đảm bảo hiệu năng 60fps và ngăn chặn rò rỉ bộ nhớ (memory leaks) trong các dự án không dùng framework.

## Khi nào sử dụng
- Bạn đang xây dựng một dự án HTML/CSS/JS thuần (không dùng React, Next.js, Vue, v.v.).
- Dự án có vô số hiệu ứng animation nặng (dùng GSAP, WebGL, Three.js).
- Bạn đang xây dựng một bản nguyên mẫu (prototype) bằng ESM Import Map.
- Bạn đang tối ưu hóa kích thước gói (bundle size) và thời gian tải của một trang web JS thuần.

**KHI NÀO KHÔNG NÊN DÙNG:** Không dùng cho các dự án React hoặc Next.js. Hãy dùng `nextjs-fsd` hoặc `nextjs-app-router` thay thế.

## Quy trình

### 1. Kiến trúc Hòn đảo (Tĩnh là trên hết - Islands Architecture Static-First)

> [!IMPORTANT]
> **Đây là mô hình tư duy cốt lõi cho Awwwards Vanilla sites.** Trang = HTML tĩnh (cát), WebGL/GSAP sections = islands (đảo nổi). Chỉ "hydrate" (khởi động JS) khi island lọt vào tầm nhìn (viewport).

```
Page = Static HTML ("the sand") + Interactive Islands ("the islands")

┌─────────────────────────────────────────┐
│  <header>  (pure HTML/CSS — 0 JS)       │
├─────────────────────────────────────────┤
│  [ISLAND: Hero WebGL Scene]             │  ← JS chạy khi visible
│  data-island="hero-scene"              │
├─────────────────────────────────────────┤
│  <section>  About copy (pure HTML)      │
├─────────────────────────────────────────┤
│  [ISLAND: GSAP Scroll Sequence]         │  ← JS chạy khi visible
│  data-island="scroll-timeline"         │
├─────────────────────────────────────────┤
│  <footer>   (pure HTML/CSS — 0 JS)     │
└─────────────────────────────────────────┘
```

**Tại sao không "hydrate all" từ đầu:**
- WebGL scene ở dưới fold (ngoài màn hình hiện tại) → Đốt GPU ngay khi vừa load
- GSAP scroll sequence ở giữa trang → Làm nghẽn thời điểm First Paint (Vẽ lần đầu)
- Islands = chỉ "trả tiền" cho JS khi người dùng thực sự nhìn thấy

```javascript
// Island Loader — Khởi tạo (lazy init) từng module khi chúng lọt vào viewport
const islands = document.querySelectorAll('[data-island]');

const loader = new IntersectionObserver((entries) => {
  entries.forEach(async (entry) => {
    if (!entry.isIntersecting) return;
    loader.unobserve(entry.target); // Chỉ load đúng một lần

    const name = entry.target.dataset.island;
    // Dynamic import: Tự động chia nhỏ code (code split), chỉ fetch khi thực sự cần
    const { default: Island } = await import(`./islands/${name}.js`);
    const instance = new Island(entry.target);
    instance.init();

    // Lưu lại instance để có thể Cleanup khi island rời viewport (tùy nhu cầu)
    entry.target._island = instance;
  });
}, { rootMargin: '200px' }); // Load trước 200px trước khi phần tử thực sự lọt vào màn hình

islands.forEach(el => loader.observe(el));
```

```html
<!-- HTML: Chuẩn Semantic đặt lên hàng đầu, JS chỉ là lớp đắp thêm (additive layer) -->
<section
  data-island="hero-scene"
  aria-label="Interactive hero visualization"
>
  <!-- Nội dung dự phòng (Fallback content) nếu JS tải thất bại hoặc user bật chế độ reduced-motion -->
  <img src="/hero-fallback.jpg" alt="Brand hero image" class="island-fallback" />
</section>
```

---

### 2. Mẫu Module (Giao diện chuẩn init/destroy/resize)

> [!NOTE]
> **Mỗi Vanilla JS module PHẢI implement 3 methods (phương thức):** `init()`, `destroy()`, `resize()`. Đây là bản hợp đồng (contract) giữa loader và island. Không có destroy → memory leak. Không có resize → vỡ bố cục khi xoay ngang điện thoại.

```javascript
// Template chuẩn cho mọi Vanilla JS animation module
// File: islands/hero-scene.js

export default class HeroScene {
  constructor(container) {
    this.el = container;
    this.renderer = null;
    this.rafId = null;
    this.io = null;
    this._bound = {
      resize: this._onResize.bind(this),
      tick:   this._tick.bind(this),
    };
  }

  // ─── PUBLIC API (Island Loader gọi những hàm này) ─────────────────

  init() {
    this._setupThree();    // khởi tạo renderer, scene, camera
    this._setupGSAP();     // bind scroll triggers
    this._setupIO();       // IntersectionObserver để pause RAF
    window.addEventListener('resize', this._bound.resize);
  }

  destroy() {
    // Cleanup theo đúng thứ tự: GSAP → RAF → IO → Three → Events
    ScrollTrigger.getAll()
      .filter(t => t.trigger === this.el || this.el.contains(t.trigger))
      .forEach(t => t.kill());

    cancelAnimationFrame(this.rafId);
    this.rafId = null;

    this.io?.disconnect();

    this.renderer?.dispose();       // giải phóng RAM của GPU
    this.renderer?.domElement?.remove();

    window.removeEventListener('resize', this._bound.resize);
  }

  resize() {
    if (!this.renderer) return;
    const { clientWidth: w, clientHeight: h } = this.el;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    ScrollTrigger.refresh(); // Tính toán lại (recalculate) các vị trí scroll
  }

  // ─── PRIVATE ──────────────────────────────────────────────────────

  _setupIO() {
    this.io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        this.rafId = requestAnimationFrame(this._bound.tick);
      } else {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    }, { threshold: 0.1 });
    this.io.observe(this.el);
  }

  _tick() {
    this.renderer.render(this.scene, this.camera);
    this.rafId = requestAnimationFrame(this._bound.tick);
  }

  _onResize() {
    this.resize();
  }
}
```

**3 hàm, 3 lý do sống còn:**

| Hàm (Method) | Tại sao bắt buộc |
|---|---|
| `init()` | Điểm bắt đầu (Entry point) rõ ràng — loader biết chính xác khi nào module sẵn sàng |
| `destroy()` | Giải phóng GPU memory, event listeners, vòng lặp RAF — chặn đứng rò rỉ (no leak) |
| `resize()` | Khi xoay màn hình điện thoại (Orientation change) hoặc window resize — canvas bắt buộc phải được cập nhật lại |

---

### 3. Mô hình PRPL cho Vite + GSAP

**PRPL = Push (Đẩy), Render (Vẽ), Pre-cache (Lưu đệm trước), Lazy-load (Tải trễ)**

```javascript
// vite.config.js — Cấu hình Vite tự động tách code (code split) theo các hòn đảo (islands)
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // Tách từng island thành các chunk độc lập
        // Trình duyệt chỉ tải (download) island nào thực sự cần
        manualChunks(id) {
          if (id.includes('islands/hero-scene'))   return 'island-hero';
          if (id.includes('islands/scroll-timeline')) return 'island-scroll';
          if (id.includes('islands/product-3d'))  return 'island-product';
          if (id.includes('three'))               return 'vendor-three';
          if (id.includes('gsap'))                return 'vendor-gsap';
        }
      }
    }
  }
});
```

```html
<!-- index.html — Đẩy (Push) critical CSS, Tải trước (Preload) critical assets -->
<head>
  <!-- P: Push — CSS quan trọng (critical CSS) được nhúng thẳng inline, không tốn thêm request -->
  <style>/* các styles above-the-fold đặt inline ở đây */</style>

  <!-- P: Preload — tải trước ảnh hero image, font chữ hero -->
  <link rel="preload" href="/hero.avif" as="image" type="image/avif" />
  <link rel="preload" href="/fonts/editorial.woff2" as="font" crossorigin />

  <!-- TUYỆT ĐỐI KHÔNG preload island JS — lazy load nó qua IntersectionObserver -->
</head>

<body>
  <!-- R: Render — HTML/CSS render ngay tức thì (instant), không phải chờ JS -->
  <section data-island="hero-scene">
    <img src="/hero-fallback.jpg" alt="..." /><!-- ảnh dự phòng (fallback) -->
  </section>

  <!-- L: Lazy-load — Các islands chỉ được nạp theo nhu cầu (on demand) -->
  <script type="module" src="/src/main.js"></script>
</body>
```

**Danh sách kiểm tra PRPL cho các website sáng tạo tĩnh (creative Vanilla sites):**

```
□ Critical CSS đặt inline thẳng trong thẻ <head> (tối đa khoảng 14KB)
□ Ảnh Hero preloaded (tải trước) bằng thẻ <link rel="preload">
□ Font chữ preloaded (phải là chuẩn woff2, có thuộc tính crossorigin)
□ JS của các Island KHÔNG ĐƯỢC preload — phải lazy load thông qua IO
□ Vite manualChunks: tách riêng các gói vendor-gsap, vendor-three ra
□ Các vendor chunks được dùng chung nếu web có nhiều islands (để không bị trùng lặp code)
□ Lần vẽ đầu tiên (First paint) tốn đúng 0 byte JS (pure HTML/CSS render)
```

---

### 4. ESM Import Map (Bản mẫu Nguyên gốc không cần Build - Buildless Prototype)

> [!NOTE]
> **Dành cho việc dựng Prototype chớp nhoáng (Prototyping nhanh)** — không cần Vite, không cần cài npm. Code và chạy thẳng ngay trong trình duyệt nhờ thẻ `importmap`. Rất phù hợp để test nhanh một hiệu ứng GSAP trước khi quyết định tích hợp nó vào dự án chính.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Creative Prototype</title>

  <!-- Import Map: phân giải (resolve) các tên gói rỗng (bare specifiers) → trỏ thẳng ra CDN URLs -->
  <!-- Không cần thư mục node_modules, không cần bundler (Vite/Webpack) -->
  <script type="importmap">
  {
    "imports": {
      "gsap":                   "https://esm.sh/gsap@3.12.5",
      "gsap/ScrollTrigger":     "https://esm.sh/gsap@3.12.5/ScrollTrigger",
      "gsap/SplitText":         "https://esm.sh/gsap@3.12.5/SplitText",
      "three":                  "https://esm.sh/three@0.170.0",
      "three/addons/":          "https://esm.sh/three@0.170.0/examples/jsm/",
      "lenis":                  "https://esm.sh/lenis@1.1.18"
    }
  }
  </script>
</head>
<body>
  <!-- Nội dung Prototype -->

  <script type="module">
    // Cú pháp import trực tiếp y hệt dự án React/Vite, nhưng KHÔNG CẦN chạy lệnh npm install
    import gsap from 'gsap';
    import { ScrollTrigger } from 'gsap/ScrollTrigger';
    import * as THREE from 'three';
    import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

    gsap.registerPlugin(ScrollTrigger);

    // Bắt đầu code Prototype ở đây — hoàn toàn không cần quá trình build (build step)
    console.log('GSAP version:', gsap.version);
  </script>
</body>
</html>
```

**Khi nào dùng importmap so với Vite:**

| | ESM Importmap (không cần build) | Vite |
|---|---|---|
| **Lên Prototyping** | ✅ Chạy ngay lập tức (Instant start) | ✅ |
| **Hot Reload (HMR)** | ❌ Phải tự F5 lại trang bằng tay | ✅ |
| **Hỗ trợ TypeScript** | ❌ | ✅ |
| **Build ra Production** | ❌ (Không thể dọn rác code thừa - no tree-shaking) | ✅ |
| **Phù hợp nhất cho** | Prototype nháp, làm demo, thử nghiệm ý tưởng (proof-of-concept) | Đẩy Production cho các website sáng tạo lớn |

> **Luật Thép:** Dựng prototype hiệu ứng GSAP nhanh bằng importmap (chỉ tốn 5 phút setup) → nếu hiệu ứng OK, hãy copy mã nguồn tích hợp (integrate) vào dự án Vite. TUYỆT ĐỐI KHÔNG BAO GIỜ mang importmap lên chạy trên môi trường production.

---

### 5. Ngân sách Độ phức tạp (Kỷ luật Ngân sách JS - JS Budget Discipline)

> [!IMPORTANT]
> **"Chỉ tiêu xài Ngân sách JS của bạn cho những tương tác mang lại giá trị cao nhất (high-value interactions)."** Mỗi một KB JS sinh ra = tăng độ trễ (latency) + thời gian phân tích cú pháp (parse time). Các web sáng tạo cực kỳ dễ mắc bệnh tiêu lố (over-spend) do lòng tham muốn nhét hiệu ứng ở khắp mọi ngóc ngách. Ngân sách = một đường thẳng cấm vượt qua (giới hạn cứng).

```
Ví dụ về Ngân sách JS cho Creative Site (Tối đa 200KB sau khi đã nén gzipped):

vendor-gsap:      ~30KB  (Lõi core + ScrollTrigger + SplitText)
vendor-three:     ~60KB  (Bản build rút gọn nhất của Three.js)
island-hero:      ~15KB  (hero WebGL scene)
island-scroll:    ~10KB  (scroll choreography - vũ đạo cuộn trang)
island-product:   ~20KB  (3D product viewer)
main:             ~10KB  (loader + utility)
────────────────────────
Tổng cộng (Total): ~145KB  ← Đang rất an toàn, dưới budget

KHÔNG BAO GIỜ THÊM EFFECT MỚI nếu tổng dung lượng vượt qua mốc 200KB gzipped.
```

**Bộ câu hỏi quyết định "thêm hay bỏ" (add or cut):**

```
Trước khi nhồi thêm bất kỳ một hiệu ứng JS mới nào:

1. Hiệu ứng này có phải là "khoảnh khắc biểu tượng" (signature moment) khiến user phải ghi nhớ khi rời site không?
   → KHÔNG: Lập tức từ bỏ, đừng thêm.
   → CÓ: Đi tiếp xuống câu 2.

2. Hiệu ứng này có thể suy thoái một cách thanh lịch (degrade gracefully) nếu lỡ JS bị lỗi tải không?
   → KHÔNG: Phải làm xong một bộ HTML dự phòng (fallback) trước rồi mới được viết JS.
   → CÓ: Đi tiếp xuống câu 3.

3. Tổng dung lượng gói (bundle) sau khi thêm cái này vào có nằm dưới ngưỡng ngân sách an toàn không?
   → KHÔNG: Bạn bắt buộc phải gạch bỏ (cut) một hiệu ứng rườm rà khác ra khỏi trang nếu muốn thêm cái mới này vào.
   → CÓ: Cho phép thêm.
```

---

## Các Lời Biện Hộ Phổ Biến (Common Rationalizations)
| Lời Biện Hộ | Thực Tế |
|---|---|
| "Thôi tôi cứ tải thẳng luôn cái WebGL scene này từ đầu cho nhanh, cũng chả sao." | RẤT CÓ SAO! Nó sẽ làm nghẽn luồng chính (main thread) của trình duyệt và vắt kiệt sức mạnh GPU ngay cả khi cái Scene đó còn chưa thèm xuất hiện trên màn hình. Hãy dùng Lazy hydrate qua IntersectionObserver. |
| "Cái hiệu ứng này đơn giản xìu, tôi chả cần viết hàm destroy() làm gì." | Mọi thay đổi trên DOM và mọi event listener gắn vào đều là một ổ Rò rỉ Bộ nhớ (memory leak) tiềm năng. Bạn BẮT BUỘC phải implement hàm `destroy()` để tự tay kết liễu các ScrollTriggers và hủy các vòng lặp RAF. |
| "Tôi dùng luôn import maps đưa lên production cho lẹ, khỏi build." | Import maps CHỈ DÀNH cho việc xây dựng mẫu thử (rapid prototyping). Lên môi trường Production đòi hỏi phải vẩy lá tìm sâu (tree-shaking) và chẻ nhỏ code (code-splitting) bằng Vite (sử dụng manualChunks) để đáp ứng kỷ luật về Ngân sách hiệu năng. |
| "Thêm một tí tẹo hiệu ứng GSAP nữa chắc không chết ai đâu." | Mọi hiệu ứng thêm vào đều cộng dồn thời gian phân tích và thực thi. Nếu bạn đã vượt ngưỡng ngân sách JS là 200KB, bạn bắt buộc PHẢI CẮT BỎ một thứ khác. Không khoan nhượng. |
| "Người dùng thời nay máy nào chả bật JS sẵn, mấy cái thẻ HTML fallback dự phòng thật vớ vẩn rác rưởi." | Code Fallback HTML là bệ phóng cho SEO, để tăng cường lũy tiến (progressive enhancement), và suy thoái thanh lịch (graceful degradation). LUÔN LUÔN phải có một thẻ `<img class="island-fallback">` dự bị ở đó. |

## Dấu hiệu Vi phạm (Red Flags)
- Sử dụng thẻ import tĩnh (Top-level static imports) ở tận trên cùng file cho những module nặng khủng khiếp (WebGL/GSAP) thay vì dùng dynamic imports bọc gọn bên trong `IntersectionObserver`.
- Một Vanilla JS class tự viết lại dám vắng mặt hai hàm sinh tử `destroy()` hoặc `resize()`.
- Thiếu lệnh sát thủ `ScrollTrigger.kill()` hoặc `cancelAnimationFrame()` bên trong ruột của hàm `destroy()`.
- File cấu hình `vite.config.js` thiếu vắng cấu hình `manualChunks` để chia tách `vendor-gsap` và `vendor-three`.
- Một thẻ `<section data-island>` nhưng lại trống hoác bên trong (thiếu nội dung HTML fallback).

## Xác minh (Verification)
- [ ] HTML phải chuẩn ngữ nghĩa (semantic) và phải chứa sẵn nội dung dự phòng (fallback content) trước khi khối JS kịp thực thi.
- [ ] Mọi JS module phải implement đủ 3 hàm `init()`, `destroy()`, và `resize()`.
- [ ] Các modules được lazy-loaded thông qua `IntersectionObserver` (Kiến trúc Hòn đảo).
- [ ] Critical CSS đã được đính kèm nội tuyến (inlined) vào trong thẻ `<head>` (< 14KB) và các font chữ cốt lõi (core fonts) đã được thiết lập preloaded.
- [ ] `vite.config.js` sử dụng `manualChunks` để bóc tách rõ ràng giữa code của thư viện (vendor) và code của island.
- [ ] Tổng dung lượng file JS đã nén gzipped nằm trong mức ngân sách độ phức tạp cho phép (ví dụ: tối đa 200KB).
- [ ] Hàm `destroy()` dọn dẹp sạch sẽ toàn bộ các event listeners, kết liễu toàn bộ ScrollTriggers, và giải phóng (dispose) hoàn toàn RAM của WebGL renderers.
- [ ] Hàm `resize()` gọi chuẩn xác lệnh `ScrollTrigger.refresh()` và cập nhật lại toàn bộ lưới chiếu (camera projections).
