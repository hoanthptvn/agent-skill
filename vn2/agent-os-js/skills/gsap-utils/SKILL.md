---
name: gsap-utils
description: Kỹ năng GSAP chính thức cho gsap.utils — clamp, mapRange, normalize, interpolate, random, snap, toArray, wrap, pipe. Sử dụng khi người dùng hỏi về gsap.utils, clamp, mapRange, random, snap, toArray, wrap, hoặc các hàm tiện ích trong GSAP.
license: MIT
---

# gsap.utils (Các hàm tiện ích)

## 1. Khi nào nên sử dụng kỹ năng này
Áp dụng khi code cần sử dụng **gsap.utils** để xử lý toán học, xử lý mảng, phân tích đơn vị, hoặc quy đổi giá trị trong animation (ví dụ: biến đổi tiến trình cuộn 0-1 thành pixel tọa độ x/y).
Tất cả các hàm này đều gọi trực tiếp từ **gsap.utils**, không cần phải `gsap.registerPlugin`.

## 2. Kỹ thuật Lập trình: "Trả về Function" (Currying)
Đa số các hàm utils nhận giá trị đích làm đối số **cuối cùng**. Nếu bạn BỎ QUA đối số cuối cùng đó, hàm sẽ không tính toán ngay mà trả về một **function**.
**Ứng dụng thực tế:** Khi chạy logic trong các vòng lặp tốc độ cao như `requestAnimationFrame` hay `mousemove`, việc tạo function một lần rồi gọi đi gọi lại giúp tránh quá tải Garbage Collection.

```javascript
// TRƯỜNG HỢP 1: Chạy ngay lập tức (Truyền giá trị ở cuối)
let result = gsap.utils.clamp(0, 100, 150); // Trả về 100

// TRƯỜNG HỢP 2: Tái sử dụng function (Bỏ qua đối số cuối)
const clampFn = gsap.utils.clamp(0, 100); 
clampFn(150); // Trả về 100
clampFn(-50); // Trả về 0
```
*(Ngoại lệ: hàm `random()` yêu cầu truyền tham số `true` ở cuối cùng để trả về function).*

## 3. Các hàm Toán học (Kẹp, Quy đổi, Chuẩn hóa)

### 3.1. `gsap.utils.clamp(min, max, value?)`
Giới hạn một giá trị chỉ được nằm trong khoảng từ `min` đến `max`.
- **Ứng dụng:** Chặn không cho giá trị vuốt màn hình vượt quá độ dài của gallery.
```javascript
gsap.utils.clamp(0, 100, 150); // Trả về 100
```

### 3.2. `gsap.utils.mapRange(inMin, inMax, outMin, outMax, value?)`
Biến đổi tương đương một giá trị từ một khoảng (in) sang khoảng khác (out).
- **Ứng dụng:** Quy đổi con trỏ chuột trên màn hình (0 -> window.innerWidth) thành góc nghiêng WebGL Plane (-15 độ -> 15 độ).
```javascript
const mapMouseToRotation = gsap.utils.mapRange(0, window.innerWidth, -15, 15);
mapMouseToRotation(clientX); 
```

### 3.3. `gsap.utils.normalize(min, max, value?)`
Đưa một giá trị nằm giữa min và max về tỷ lệ phần trăm từ 0.0 đến 1.0.
```javascript
gsap.utils.normalize(100, 300, 200); // Trả về 0.5 (Nằm chính giữa)
```

### 3.4. `gsap.utils.interpolate(start, end, progress?)`
Tìm giá trị (nội suy / lerp) nằm ở giữa 2 điểm khi truyền vào tiến trình từ 0-1.
Hỗ trợ cả Số, Mã Màu, và Object.
```javascript
gsap.utils.interpolate("#ff0000", "#0000ff", 0.5); // Trả về màu pha trộn
gsap.utils.interpolate({ x: 0 }, { x: 100 }, 0.5); // Trả về { x: 50 }
```

## 4. Các hàm Ngẫu nhiên & Lưới (Random & Snap)

### 4.1. `gsap.utils.random()`
Tạo số ngẫu nhiên hoặc bốc ngẫu nhiên một phần tử từ mảng.
- Tùy chọn **snapIncrement**: Làm tròn kết quả theo bội số (VD: bước nhảy là 5).
- Tùy chọn **returnFunction**: Truyền `true` ở cuối cùng nếu muốn trả về một hàm phát sinh số ngẫu nhiên.
```javascript
gsap.utils.random(-100, 100, 5); // Tạo số ngẫu nhiên làm tròn theo bội số 5
const getRandomColor = gsap.utils.random(["red", "blue", "green"], true);
```
- **Chuỗi String GSAP:** Có thể truyền string trực tiếp vào thuộc tính của tween.
```javascript
gsap.to(".box", { x: "random(-100, 100)" }); // GSAP tự xử lý cho từng thẻ .box
```

### 4.2. `gsap.utils.snap(snapTo, value?)`
Làm tròn (hít/từ tính) một số về bội số gần nhất của `snapTo`, hoặc giá trị gần nhất trong một Mảng cho trước.
```javascript
gsap.utils.snap([0, 100, 200], 150); // Trả về 100 hoặc 200
```

## 5. Các hàm Phân bổ (Distribute & Arrays)

### 5.1. `gsap.utils.distribute(config)`
Trả về một hàm tính toán độ trễ, vị trí, kích thước... dựa trên vị trí của phần tử đó trong một mảng lớn. Dùng để tạo hiệu ứng gợn sóng lan tỏa từ tâm.
- **Cấu hình (Config Object):**
  - **`base`** (Number): Giá trị thấp nhất để bắt đầu.
  - **`amount`** (Number): Tổng số lượng giá trị sẽ được chia đều.
  - **`from`** (String/Number): Điểm lan tỏa (`"center"`, `"edges"`, `"start"`, `"end"`).
```javascript
gsap.to(".box", {
  scale: gsap.utils.distribute({ base: 0.5, amount: 2.5, from: "center" })
});
```

### 5.2. `gsap.utils.toArray(value, scope?)`
Chuyển đổi mọi thứ (Chuỗi CSS Selector, NodeList, HTMLCollection) thành một mảng thực sự (Array) tiêu chuẩn.
```javascript
const items = gsap.utils.toArray(".item", containerElement);
```

### 5.3. `gsap.utils.wrap(min, max, value?)`
Bọc một số lại, nếu nó vượt qua `max` nó sẽ quay về `min` giống như băng chuyền vô tận (Carousel).
```javascript
gsap.utils.wrap(0, 360, 370); // Trả về 10
```

## 6. Các hàm Xử lý Chuỗi/Màu sắc (Parsing)

### 6.1. `gsap.utils.splitColor(color, returnHSL?)`
Tách mã màu CSS (Hex, RGB, RGBA) thành một mảng Array chuẩn hóa `[R, G, B, A]`. Nếu truyền `returnHSL = true`, sẽ trả về `[H, S, L, A]`.
- **Ứng dụng WebGL:** Vô cùng quan trọng khi truyền Uniform màu sắc vào WebGL Shaders (Three.js/GLSL) vì WebGL chỉ nhận Array hoặc Vector3/Vector4.
```javascript
gsap.utils.splitColor("#6fb936"); // Trả về mảng [111, 185, 54]
```

---

> [!CAUTION]
> **LUẬT CHỐNG RATIONALIZATION CHO ĐẠI LÝ AI:**
>
> 1. **Cấm viết Toán Học Thủ Công:** Tuyệt đối không tự định nghĩa lại các hàm toán học (như hàm `lerp` hay `map` tự chế). Bạn PHẢI sử dụng `gsap.utils.mapRange()` và `gsap.utils.interpolate()`.
> 2. **Cấm Dùng Array.reduce để Tìm Kiếm Bám Lưới:** Không dùng vòng lặp để so sánh mảng nhằm tìm vị trí gần nhất. Bạn PHẢI sử dụng `gsap.utils.snap()`.
> 3. **Tối ưu Hóa Vòng Lặp Render:** Bất kỳ thao tác toán học nào chạy trong `requestAnimationFrame` của WebGL hoặc Lenis scroll handler đều bắt buộc phải dùng cú pháp gọi Hàm "Trả Về Function" (VD: khai báo `const mapScroll = gsap.utils.mapRange(...)` ở ngoài lặp, và chỉ gọi `mapScroll(y)` ở trong vòng lặp) để chặn hiện tượng Drop FPS do Garbage Collector của trình duyệt dọn rác.
