---
name: gsap-plugins
description: Kỹ năng GSAP chính thức cho các plugins — đăng ký (registration), ScrollToPlugin, ScrollSmoother, Flip, Draggable, Inertia, Observer, SplitText, ScrambleText, SVG và physics plugins.
license: MIT
---

# GSAP Plugins (Các Tiện ích Mở rộng)

## 1. Tổng quan & Cài đặt

- **Mục đích:** Hướng dẫn sử dụng các GSAP plugins.
- **Cài đặt:** Chạy `npm install gsap`. Tất cả plugins nâng cao đã được tích hợp mặc định trong gói tiêu chuẩn (Miễn phí 100%).

## 2. Quy tắc Đăng ký (Registration)

**BẮT BUỘC:** Bạn phải gọi `gsap.registerPlugin()` cho mọi plugin trước khi sử dụng chúng. Nếu không, animation sẽ bị lỗi hoặc không hoạt động. Đăng ký ở cấp cao nhất (top-level) của file component.

```javascript
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { Flip } from "gsap/Flip";
import { Draggable } from "gsap/Draggable";

gsap.registerPlugin(ScrollToPlugin, Flip, Draggable);
```

## 3. Các Plugins Giao diện & Tương tác (DOM / UI)

### 3.1. Flip (Hoạt hình thay đổi Layout)
Dùng để tạo animation mượt mà khi một phần tử thay đổi trạng thái layout (thêm/xóa class, đổi cha con, grid sang list).
- **Quy trình:** Lưu trạng thái bằng `Flip.getState()` -> Đổi DOM -> Chạy animation bằng `Flip.from()`.
- **Cấu hình (Flip.from vars):**
  - **`absolute`** (Boolean): Chuyển thành `position: absolute` lúc animate để tránh giật layout (Mặc định: `false`).
  - **`nested`** (Boolean): Bật đo đạc cho thẻ con lồng nhau.
  - **`scale`** (Boolean): Dùng scale thay vì width/height để hiệu năng cao hơn (Mặc định: `true`).
  - **`duration`, `ease`**: Tùy chọn tween chuẩn.

```javascript
gsap.registerPlugin(Flip);
const state = Flip.getState(".item");
// [Thay đổi DOM tại đây]
Flip.from(state, { duration: 0.5, ease: "power2.inOut", absolute: true });
```

### 3.2. Draggable (Kéo thả)
Cho phép phần tử có thể kéo, vuốt, xoay bằng chuột hoặc cảm ứng.
- **Cấu hình (Draggable.create):**
  - **`type`** (String): Trục cho phép kéo: `"x"`, `"y"`, `"x,y"`, `"rotation"`, `"scroll"`.
  - **`bounds`** (Selector/Object): Giới hạn không gian kéo (vd: `"#container"`).
  - **`inertia`** (Boolean): Kích hoạt trượt quán tính sau khi thả (yêu cầu `InertiaPlugin`).
  - **`edgeResistance`** (Number 0-1): Độ nặng khi kéo đụng biên.
  - **`onDrag`, `onDragEnd`** (Function): Callbacks sự kiện.

```javascript
gsap.registerPlugin(Draggable, InertiaPlugin);
Draggable.create(".box", { type: "x,y", bounds: "#container", inertia: true });
```

### 3.3. Observer (Quan sát Tương tác)
Dùng để bắt sự kiện scroll, vuốt (swipe) độc lập với vị trí thanh cuộn. Thường dùng cho hiệu ứng cuộn toàn màn hình (full-page slider).
- **Cấu hình (Observer.create):**
  - **`target`** (Selector): Khu vực bắt sự kiện.
  - **`type`** (String): Loại sự kiện `"touch,pointer,wheel"`.
  - **`tolerance`** (Number): Khoảng cách (px) cần vuốt trước khi trigger (Mặc định: 10).
  - **`onUp`, `onDown`, `onLeft`, `onRight`** (Function): Callbacks khi người dùng vuốt/cuộn về các hướng.

```javascript
gsap.registerPlugin(Observer);
Observer.create({
  target: window,
  type: "wheel,touch",
  onUp: () => console.log("Vuốt lên"),
  onDown: () => console.log("Vuốt xuống"),
});
```

## 4. Các Plugins Xử lý Văn bản (Text)

### 4.1. SplitText (Tách chữ)
Tách văn bản thành từng ký tự (chars), từng từ (words), hoặc từng dòng (lines) nằm trong các thẻ `<div>` riêng biệt để dễ dàng làm hiệu ứng lệch nhịp (stagger).
- **Cấu hình (SplitText.create):**
  - **`type`** (String): `"chars,words,lines"`. Chỉ tách mức độ bạn cần để tối ưu.
  - **`charsClass`, `wordsClass`, `linesClass`** (String): Class CSS gán cho phần tử. Thêm `++` (vd: `char++`) để tự động đánh số (`char1`, `char2`).
  - **`autoSplit`** (Boolean): Tự động tính toán lại dòng khi thay đổi kích thước màn hình.
  - **`onSplit`** (Function): Hàm chạy sau khi tách xong.
- **Khôi phục:** Luôn gọi `split.revert()` khi unmount component để tránh rò rỉ DOM.

```javascript
gsap.registerPlugin(SplitText);
const split = SplitText.create(".heading", { type: "chars,words", charsClass: "char" });
gsap.from(split.chars, { y: 50, opacity: 0, stagger: 0.05 });
// Cleanup sau này: split.revert();
```

## 5. Các Plugins Đồ họa SVG

### 5.1. DrawSVG (Vẽ nét viền SVG)
Làm hiệu ứng "tự vẽ" nét đứt/nét liền cho các thẻ `<path>`, `<line>`, `<rect>`. Yêu cầu phần tử phải có thuộc tính `stroke`.
- **Định dạng dữ liệu (`drawSVG`):** Truyền chuỗi tỷ lệ `"Bắt_Đầu Kết_Thúc"`.
- Ví dụ: `"0% 100%"` (vẽ toàn bộ), `"20% 80%"` (chỉ vẽ khúc giữa). Nếu chỉ truyền `"100%"`, tương đương `"0% 100%"`.

```javascript
gsap.registerPlugin(DrawSVGPlugin);
gsap.from(".my-path", { drawSVG: "0%", duration: 2 });
```

### 5.2. MorphSVG (Biến đổi hình khối SVG)
Biến dạng mượt mà từ một `<path>` này sang một `<path>` khác, không cần cùng số lượng điểm ảnh.
- **Cấu hình:**
  - **`shape`** (Selector/String): Hình dạng muốn biến thành.
  - **`type`** (String): Dùng `"rotational"` để xoay mượt, hoặc `"linear"` (mặc định).
  - **`shapeIndex`** (Number): Đổi điểm bắt đầu nếu hình biến dạng bị lộn xộn/méo mó quá mức.
- **Tiện ích:** Dùng `MorphSVGPlugin.convertToPath("circle, rect")` trước nếu bạn muốn morph các hình học cơ bản.

```javascript
gsap.registerPlugin(MorphSVGPlugin);
MorphSVGPlugin.convertToPath("circle, rect"); // Ép về path
gsap.to("#circle-path", { morphSVG: "#star-path", duration: 1 });
```

### 5.3. MotionPath (Chạy theo đường dẫn SVG)
Làm phần tử DOM/SVG di chuyển bám theo một đường path.
- **Cấu hình:**
  - **`path`** (Selector): Đường ray.
  - **`align`** (Selector): Đưa phần tử khớp gốc với đường ray.
  - **`alignOrigin`** (Array): `[0.5, 0.5]` để căn vào tâm phần tử.
  - **`autoRotate`** (Boolean): Xoay đầu phần tử theo hướng uốn cong của path.

```javascript
gsap.registerPlugin(MotionPathPlugin);
gsap.to(".plane", { motionPath: { path: "#flight-path", align: "#flight-path", autoRotate: true } });
```

## 6. ScrollToPlugin & ScrollSmoother (Cảnh báo)

- **ScrollToPlugin:** Animates cuộn tới tọa độ `y` hoặc `x`.
- **ScrollSmoother:** Plugin cuộn mượt nguyên bản của GSAP.

> [!CAUTION]
> **LUẬT CHỐNG RATIONALIZATION CHO ĐẠI LÝ AI:**
>
> 1. **CẤM SỬ DỤNG SCROLLSMOOTHER:** Trong dự án này, hệ thống bắt buộc sử dụng thư viện **Lenis** cho smooth scrolling để đạt hiệu năng phần cứng tối đa. Bạn TUYỆT ĐỐI KHÔNG ĐƯỢC đề xuất hay viết mã cài đặt `ScrollSmoother`.
> 2. **Xung đột ScrollToPlugin:** Nếu bạn dùng Lenis, không dùng `gsap.to(window, { scrollTo: ... })`. Việc này sẽ tạo ra xung đột điều khiển. Phải dùng API gốc của Lenis: `lenis.scrollTo(target)`. Bạn chỉ được dùng `ScrollToPlugin` đối với các `div` có `overflow` độc lập bên trong trang.
> 3. **Kiểm tra DOM Validation:** Không bao giờ truyền một selector rỗng vào plugin (nhất là SplitText, Flip, Draggable). Luôn check `if(document.querySelector(target))` trước khi khởi tạo plugin để tránh crash hệ thống.
