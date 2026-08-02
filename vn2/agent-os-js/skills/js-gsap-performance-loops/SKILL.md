---
name: js-gsap-performance-loops
description: Chỉ thị của Agent OS về Hiệu năng JS, Thu gom Rác (Garbage Collection), tối ưu GSAP, và giữ khung hình 60fps. Sử dụng khi cần tối ưu hóa animation, giảm thiểu giật lag cuộn trang, viết vòng lặp rAF, hoặc sửa lỗi rò rỉ bộ nhớ.
license: MIT
---

# Chỉ thị Hiệu năng JS & GSAP

## 1. Ngân sách Khung hình (Frame Budget - 16.67ms)
Để đạt chuẩn 60fps mượt mà, tổng thời gian xử lý một khung hình không được vượt quá 16.67ms.
- **rAF callback (JavaScript):** ≤ 4ms
- **Style/Layout (Browser):** ≤ 3ms
- **Paint (Browser):** ≤ 5ms
- **Composite (Browser):** ≤ 2ms
Nếu JavaScript chạy quá 4ms, nó sẽ đẩy các tiến trình sau trễ nhịp dẫn đến rớt khung hình (jank).

## 2. Quy tắc "Không Cấp Phát" (Zero-Allocation) trong Hot Path
**MANDATORY:** Trong các vùng code chạy liên tục (Hot Path) như `requestAnimationFrame`, `mousemove`, hoặc `scroll`, bạn TUYỆT ĐỐI KHÔNG ĐƯỢC sinh rác bộ nhớ (Garbage Collection Spikes).
- **Cấm `new Object()` hoặc tạo mảng `[]`:** Hãy dùng Bể Đối tượng (Object Pools) hoặc mảng khởi tạo sẵn (TypedArrays như `Float32Array`).
- **Cấm tạo Closure mới mỗi frame:** Không dùng `.forEach()`, vì nó cấp phát một hàm ẩn danh (closure) cho mỗi vòng lặp. Dùng vòng lặp `for (let i = 0)`.
- **Cấm nối chuỗi mảng:** Không dùng `.map().filter().reduce()`. Chúng tạo ra các mảng tạm thời trên Heap, ép Garbage Collector phải dọn dẹp liên tục gây giật lag. Dùng một vòng lặp phẳng duy nhất.
- **Cấm Query DOM:** Không dùng `document.querySelector`. Phải Query đúng 1 lần khi khởi tạo và lưu vào biến (Cache).
- **Cấm Spread syntax:** Không dùng `[...arr]` hoặc `{...obj}` vì chúng sao chép toàn bộ dữ liệu.

## 3. Các loại vòng lặp JavaScript (Loop Selection)
Sử dụng đúng loại vòng lặp để tối ưu hiệu năng:
- **`for (let i = 0)`:** BẮT BUỘC dùng cho rAF hot path, TypedArray, hoặc khi cần truy xuất index.
- **`for...of`:** Tốt cho các iterable thông thường hoặc chuỗi Unicode (không dùng trong hot path).
- **`while`:** Dùng cho Queue, BFS, hoặc điều kiện con trỏ.
- **`forEach`:** CHỈ ĐƯỢC DÙNG để khởi tạo (init/setup) một lần. Không dùng trong vòng lặp liên tục.
- **`for...in`:** TUYỆT ĐỐI CẤM dùng cho Mảng (Array). Chỉ dùng để duyệt Object và phải kèm `hasOwnProperty`.
- **`do...while`:** Dùng khi vòng lặp chắc chắn phải chạy ít nhất 1 lần (ví dụ: Retry pattern).

## 4. Tối ưu Animation (Hardware Acceleration)
- **Thuộc tính ưu tiên:** CHỈ ĐƯỢC animate các thuộc tính thân thiện với GPU (compositor-friendly): `x`, `y`, `scale`, `rotation`, `opacity`.
- **Cấm đụng Layout:** TUYỆT ĐỐI KHÔNG animate `width`, `height`, `top`, `left`, `margin`, `padding`.
- **Kỷ luật `will-change`:** CHỈ thêm `will-change: transform;` vào đúng phần tử đang chuẩn bị animate. Không gắn bừa bãi toàn trang.

## 5. Tối ưu Cập nhật GSAP (High-Frequency Updates)
Khi cần liên tục cập nhật giá trị dựa trên sự kiện (như con trỏ chuột `mousemove`):
**MANDATORY:** KHÔNG ĐƯỢC gọi `gsap.to()` liên tục. Phải dùng `gsap.quickTo()`.
```javascript
const xTo = gsap.quickTo('.cursor', 'x', { duration: 0.4, ease: 'power3' });
window.addEventListener('mousemove', (e) => xTo(e.clientX));
```

## 6. Chống Lỗi Đập Bố cục (Layout Thrashing)
Cưỡng bức Bố cục Đồng bộ (Forced Synchronous Layouts) xảy ra khi bạn đọc (Read) và ghi (Write) DOM xen kẽ nhau trong một vòng lặp, khiến trình duyệt phải tính toán lại toàn bộ layout O(N²).
**MANDATORY:** Gom nhóm (Batch). Thực hiện TẤT CẢ lệnh Read trước, sau đó mới thực hiện TẤT CẢ lệnh Write.
```javascript
// GOM NHÓM ĐÚNG CÁCH (Batching)
const rects = [];
for (const el of cards) rects.push(el.getBoundingClientRect()); // Batch Read
for (let i = 0; i < cards.length; i++) {
  cards[i].style.transform = `translateX(${rects[i].x}px)`; // Batch Write
}
```

## 7. Vòng lặp RAF Duy nhất (Lenis + GSAP)
Để tránh hiện tượng giật cuộn (scroll jank) khi có 2 vòng lặp rAF chạy song song:
**MANDATORY:** Lái (Drive) tiến trình của Lenis bằng bộ đếm Ticker của GSAP.
```javascript
const lenis = new Lenis({ autoRaf: false }); // Tắt loop tự động
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000)); // GSAP kéo theo Lenis
gsap.ticker.lagSmoothing(0); // Tắt lag smoothing để chống xung đột
```

## 8. Hợp đồng Dọn dẹp Chặt chẽ (Strict Cleanup Contract)
Khi tháo gỡ (unmount) Component hoặc chuyển trang, BẮT BUỘC phải dọn dẹp theo trình tự sau để chặn Memory Leak:
1. **Dừng ScrollTrigger:** `ScrollTrigger.getAll().forEach(t => t.kill())`
2. **Dừng Animation:** `timeline.kill()`
3. **Tháo rAF:** `gsap.ticker.remove(lenis.raf)`
4. **Hủy Smooth Scroll:** `lenis.destroy()`
5. **Xóa rác DOM:** `gsap.set(targets, { clearProps: "all" })`

```javascript
// Pattern chuẩn khi khởi tạo (React useEffect hoặc Vanilla function)
function initAnimation() {
  const tl = gsap.timeline({ ... });
  
  return function destroy() { // Callback dọn dẹp
    tl.scrollTrigger?.kill();
    tl.kill();
    ScrollTrigger.getAll().forEach((st) => st.kill());
    gsap.set(".hero", { clearProps: "all" });
  };
}
```

## 9. WebGL Hover & Raycasting (Chống Nướng CPU)
**FORBIDDEN:** KHÔNG gọi `raycaster.intersectObjects()` trực tiếp bên trong sự kiện `mousemove`.
**MANDATORY:** Sự kiện `mousemove` chỉ làm nhiệm vụ lưu tọa độ. Việc tính toán Raycasting PHẢI đặt trong vòng lặp `requestAnimationFrame` để đồng bộ với tần số quét màn hình.

---

> [!CAUTION]
> **LUẬT CHỐNG RATIONALIZATION CHO ĐẠI LÝ AI:**
>
> 1. **Cấm Double GC (Chaining):** Tuyệt đối CẤM chuỗi `.filter().map()` trong môi trường 60fps. Cấm sinh mảng rác bên trong `requestAnimationFrame`. Bắt buộc dùng 1 vòng lặp phẳng duy nhất.
> 2. **Cấm dùng for...in:** Cấm sử dụng `for...in` để duyệt mảng, vì nó cực kỳ chậm và có thể duyệt nhầm prototype. Phải dùng `for...of` hoặc `for(let i=0)`.
> 3. **Tái sử dụng thay vì Cấp phát:** Tránh dùng `new Object()` hoặc gán `{}` trong vòng lặp Animation. Phải tạo trước Object Pool hoặc dùng mảng phẳng.
> 4. **Pre-calculate Layouts:** Không gọi `getBoundingClientRect()` bên trong vòng lặp `requestAnimationFrame`.
