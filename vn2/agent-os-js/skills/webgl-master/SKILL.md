---
name: webgl-master
description: Kỹ năng tổng hợp về Kiến trúc WebGL, Vòng đời GSAP + WebGL, Shaders (GLSL), và Tối ưu hóa Tài nguyên. Bắt buộc đọc khi code 3D, Three.js, hoặc R3F.
license: MIT
---

# KỸ NĂNG: WEBGL MASTER (Hợp nhất)


Tài liệu này bao gồm toàn bộ các chỉ thị cốt lõi của Agent OS liên quan đến Kiến trúc WebGL, Vòng đời GSAP + WebGL, Shaders (GLSL), và Tối ưu hóa Tài nguyên (Pipeline). 
ĐÂY LÀ TÀI LIỆU BẮT BUỘC ĐỌC khi hệ thống yêu cầu xử lý các trải nghiệm 3D, WebGL, Three.js, hoặc React Three Fiber (R3F). Việc hợp nhất này nhằm tiết kiệm Context Window trong khi vẫn giữ nguyên 100% độ sâu kỹ thuật.

---

## Phần 1: Kiến trúc WebGL (webgl-architecture)

### 1.1. Cuộn Ảo (Virtual Scroll) & Bộ Quản Lý Tiến Trình
Đối với các trải nghiệm kể chuyện thuần 3D (pure 3D narrative experiences), **TUYỆT ĐỐI KHÔNG** dùng thanh cuộn DOM mặc định (native DOM scrolling).
- Bạn phải triển khai một bộ máy Cuộn Ảo bắt các sự kiện `wheel` và `touch` để chi phối một biến `globalProgress` (từ 0 đến 1).
- Mọi hiệu ứng Camera, Shader, và Animation đều phải liên kết chặt chẽ với biến `globalProgress` này thông qua phép nội suy tuyến tính (Linear Interpolation - LERP).

```javascript
// Ví dụ xử lý tiến trình cuộn mượt mà (Smooth Scrubbing)
let targetProgress = 0;
let currentProgress = 0;

window.addEventListener('wheel', (e) => {
    targetProgress += e.deltaY * 0.001;
    targetProgress = Math.max(0, Math.min(1, targetProgress)); // Clamp 0-1
});

// Trong rAF loop
function update() {
    currentProgress += (targetProgress - currentProgress) * 0.05; // Lerp
    camera.position.z = THREE.MathUtils.lerp(10, -50, currentProgress);
    requestAnimationFrame(update);
}
```

### 1.2. Vòng đời Phân đoạn (Segment Lifecycle)
Chia trải nghiệm WebGL dài thành các "phân đoạn" (segments) để quản lý bộ nhớ. Mỗi phân đoạn phải tuân thủ nghiêm ngặt class interface sau:

```javascript
class WebGLSegment {
  constructor(scene) {
    this.scene = scene;
    this.isActive = false;
  }
  
  // Khởi tạo geometry/material khi cuộn tới gần
  enter() {
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);
    this.isActive = true;
  }
  
  // Cập nhật các giá trị dựa trên tiến trình cục bộ (local progress 0..1)
  scrub(progress) {
    if (!this.isActive) return;
    this.mesh.rotation.y = progress * Math.PI * 2;
  }
  
  // Animation nhàn rỗi chạy mỗi khung hình (rAF)
  update(deltaTime) {
    if (!this.isActive) return;
    this.mesh.position.y = Math.sin(Date.now() * 0.001) * 0.5;
  }
  
  // BẮT BUỘC: Giải phóng bộ nhớ chống tràn RAM
  teardown() {
    this.scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    this.isActive = false;
  }
}
```

### 1.3. Quản lý Chất lượng Tự thích ứng (Adaptive Quality)
Bởi vì sức mạnh GPU của thiết bị người dùng là không thể đoán trước, bộ render phải tự động điều chỉnh:
- Giám sát thời gian render trung bình `avgMs` bằng `performance.now()`.
- Nếu `avgMs > 22` (dưới 45fps liên tục): Tự động giảm `renderer.setPixelRatio(1)`, vô hiệu hóa Post-processing nặng (như SSAO, DoF).
- Nếu `avgMs < 12` (trên 80fps): Kích hoạt lại các tính năng độ họa cao.
- **Giới hạn DPR:** `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))`. Không bao giờ render ở DPR = 3 vì gây lãng phí băng thông GPU.

---

## Phần 2: Vòng đời GSAP & WebGL (gsap-webgl-lifecycle)

### 2.1. Bug "Nút Back" trong Next.js/React (Popstate Bug)
Khi kết hợp GSAP ScrollTrigger và WebGL Canvas toàn màn hình trong Next.js (SPA router):
- **Vấn đề:** Nếu người dùng nhấn phím Back/Forward, component có thể bị unmount nhưng WebGL Context và ScrollTrigger instances vẫn chạy ngầm, gây ra lỗi Canvas đen thui hoặc ScrollTrigger tính toán sai tọa độ.
- **Giải pháp:** Bắt buộc phải gom tất cả animation khởi tạo vào trong `gsap.context()` (với Vanilla/React cũ) hoặc `useGSAP()` (React 18+).

```jsx
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function WebGLHero() {
  const container = useRef();

  useGSAP(() => {
    // Toàn bộ ScrollTrigger ở đây sẽ tự động bị kill() khi route thay đổi
    gsap.to(".webgl-canvas", {
      scrollTrigger: {
        trigger: ".webgl-canvas",
        start: "top top",
        end: "+=2000",
        scrub: true,
        pin: true
      },
      opacity: 0
    });
  }, { scope: container });

  return <div ref={container}><canvas className="webgl-canvas" /></div>;
}
```

### 2.2. Xây dựng lại Scene (Scene Rebuild)
- Khi điều hướng quay lại trang chứa WebGL, hệ thống phải tự động `re-init` lại các geometries và textures nếu chúng đã bị `dispose()` trước đó.
- Canvas nên được giữ ở root layout (Global State) nếu muốn làm hiệu ứng chuyển trang liên mạch bằng shader.

---

## Phần 3: Hiệu ứng WebGL (gsap-webgl-effects)

### 3.1. Chuyển cảnh Hình ảnh (Image Displacement)
Thay vì làm mờ ảnh (CSS opacity fade), hãy dùng WebGL Fragment Shader với Displacement Map:
- Truyền 2 textures (`texture1` và `texture2`) cùng 1 `displacementMap`.
- Sử dụng GSAP `gsap.to()` tween một biến `uProgress` từ 0 đến 1.

```javascript
// GSAP điều khiển Uniform của Shader
const material = new THREE.ShaderMaterial({
  uniforms: {
    uProgress: { value: 0.0 },
    tTex1: { value: texture1 },
    tTex2: { value: texture2 },
    tDisp: { value: dispTexture }
  },
  vertexShader: vShader,
  fragmentShader: fShader
});

// Chuyển cảnh khi click
document.body.addEventListener('click', () => {
  gsap.to(material.uniforms.uProgress, {
    value: 1,
    duration: 1.5,
    ease: "power2.inOut"
  });
});
```

### 3.2. Cấu hình Sản phẩm 3D (Car/Product Configurator)
- Sử dụng HDRI Environment Map để chiếu sáng vật lý chân thực (PBR).
- Tách rời dữ liệu trạng thái (State) ra khỏi logic WebGL bằng EventBus. Nếu người dùng chọn màu xe đỏ trên UI (DOM), bắn event `EventBus.emit('colorChange', '#FF0000')`.
- WebGL scene bắt event này và tween màu sắc bằng `gsap.to(material.color, { r: 1, g: 0, b: 0 })`.

---

## Phần 4: Lập trình Shader (webgl-glsl)

### 4.1. Vertex Shader (Cấu trúc cơ bản)
Chịu trách nhiệm thay đổi tọa độ 3D. Luôn tuân thủ ma trận chuẩn của Three.js:
```glsl
varying vec2 vUv;
void main() {
  vUv = uv;
  // Tính toán vị trí màn hình cuối cùng
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
```

### 4.2. Fragment Shader & Tối ưu hóa (GLSL Optimization)
Chịu trách nhiệm tô màu từng pixel. Dùng `highp float` trên thiết bị iOS (Adreno/Mali GPUs) để tránh lỗi dải màu (color banding).
**TUYỆT ĐỐI KHÔNG** dùng cấu trúc điều kiện `if/else` trong hàm main của Fragment Shader (do kiến trúc SIMD của GPU).
Thay thế bằng toán học nội suy:
```glsl
uniform sampler2D tTex1;
uniform sampler2D tTex2;
uniform sampler2D tDisp;
uniform float uProgress;
varying vec2 vUv;

void main() {
  vec4 disp = texture2D(tDisp, vUv);
  
  // Méo tọa độ UV dựa trên uProgress
  vec2 distortedUv1 = vUv + disp.rg * uProgress * 0.1;
  vec2 distortedUv2 = vUv - disp.rg * (1.0 - uProgress) * 0.1;
  
  vec4 color1 = texture2D(tTex1, distortedUv1);
  vec4 color2 = texture2D(tTex2, distortedUv2);
  
  // Trộn mượt mà thay vì dùng if/else
  gl_FragColor = mix(color1, color2, uProgress);
}
```

---

## Phần 5: Hiệu ứng Halftone & Particle Grid (webgl-halftone)

### 5.1. Kỹ thuật Particle Grid
Để tạo hiệu ứng ảnh được tạo từ hàng ngàn điểm ảnh rời rạc:
1. Lấy dữ liệu màu từ một hình ảnh mẫu (Sampling).
2. Map tọa độ UV thành các lưới hạt thông qua `gl_PointSize`.
3. Cập nhật kích thước hoặc độ mờ của từng hạt bằng biến `uTime` hoặc độ lệch chuột (`uMouse`).

### 5.2. Sửa lỗi "Washed Out Ghost"
Trong hệ thống hạt có độ trong suốt (alpha blending), đôi khi vùng rìa của hạt bị quầng sáng trắng mờ.
**Khắc phục:** Sử dụng kỹ thuật Pre-multiplied Alpha. Trộn màu kênh RGB với kênh Alpha trước khi xuất kết hợp với cấu hình blending của Three.js.
```glsl
// Trong Fragment Shader
gl_FragColor = vec4(rgb * alpha, alpha);
```
```javascript
// Trong Three.js Material
const mat = new THREE.ShaderMaterial({
  transparent: true,
  blending: THREE.NormalBlending,
  premultipliedAlpha: true
});
```

---

## Phần 6: Đường ống Tài nguyên (webgl-pipeline)

### 6.1. Chuẩn bị Asset (Models & Textures)
- **TUYỆT ĐỐI KHÔNG** sử dụng file `.obj` hay `.gltf` chưa nén cho Production.
- **BẮT BUỘC:** Nén hình học (geometry) bằng **Draco Compression** (giảm từ 50MB xuống 2-3MB). Tự host bộ giải mã (Draco decoder) qua CDN hoặc thư mục `/public/draco/`.
```javascript
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);
```
- **Textures:** Sử dụng chuẩn **KTX2 (Basis Universal)** cho các file ảnh kích thước lớn. KTX2 truyền thẳng vào VRAM của GPU mà không cần CPU giải nén, chống giật (stutter) khi load trang và giảm RAM điện thoại rõ rệt.
- Đối với textures PNG/JPG thông thường, luôn bọc bằng `createImageBitmap(image)` để giải nén trên luồng phụ (worker thread) trước khi upload lên GPU.

### 6.2. Compile Shaders trước (Shader Pre-warming)
Khi gặp một vật liệu/shader mới, WebGL cần vài chục mili-giây để biên dịch (compile). Điều này gây ra hiện tượng "giật cục" (jank) ngay khi shader xuất hiện.
**Giải pháp:** Trong màn hình tải (Preloader), hãy 강제 render (force render) tất cả các materials quan trọng ra một khung hình kích thước 1x1 pixel hoặc phía sau camera để GPU biên dịch sẵn toàn bộ shaders.
```javascript
// Compile trước shaders để tránh giật lag
renderer.compile(scene, camera);
```
Khi vào trải nghiệm thật sẽ mượt mà 60fps ngay từ khung hình đầu tiên.
