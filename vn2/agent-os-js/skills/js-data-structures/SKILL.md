---
name: js-data-structures
description: Tối ưu hóa cấu trúc dữ liệu JS ở cấp độ V8 Engine (O(1), O(log N)). Bắt buộc đọc khi thiết kế Store, Caching hoặc xử lý mảng lớn.
license: MIT
---

# JS Data Structures & V8 Engine Optimization

## 1. V8 Hidden Classes (Hình thái Object)

> [!CAUTION]
> **MANDATORY:** V8 Engine tối ưu hóa property access bằng cách gán "Hidden Classes" (Shapes) cho Objects. Nếu bạn làm vỡ Hidden Classes, code sẽ bị de-optimized và chậm đi hàng chục lần.

### Quy tắc khởi tạo (Initialization)
- **Luôn khởi tạo tất cả properties trong Constructor/Factory:** Không được thêm properties mới sau khi object đã được tạo.
- **Giữ nguyên thứ tự khởi tạo:** Khởi tạo `a` rồi `b` sẽ tạo ra Hidden Class khác với `b` rồi `a`.

```javascript
// ❌ SAI: Phá vỡ Hidden Classes (Tạo ra nhiều Map Transitions)
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}
const p1 = new Particle(0, 0);
p1.z = 10; // De-opt: Gây ra Map Transition mới

// ✅ ĐÚNG: Khởi tạo sẵn với giá trị mặc định
class Particle {
  constructor(x, y, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z; // Shape cố định ngay từ đầu
  }
}
```

### Quy tắc Xóa (Delete)
- **TUYỆT ĐỐI KHÔNG dùng từ khóa `delete`** trên object properties. Việc này làm V8 "rớt" object xuống trạng thái "Dictionary Mode" (chậm hơn rất nhiều).
- **Giải pháp:** Gán giá trị thành `null` hoặc `undefined`.

## 2. SMI (Small Integers) vs HeapNumbers

V8 phân biệt các loại số để tối ưu bộ nhớ:
1. **SMI (Small Integers):** Số nguyên 31-bit, cực nhanh, không cấp phát heap.
2. **HeapNumbers:** Số thập phân (Float) hoặc số vượt quá 31-bit. Yêu cầu cấp phát vùng nhớ trên Heap.

- Khi xử lý WebGL hoặc vòng lặp hàng chục ngàn phần tử, cố gắng giữ các index và counter ở dạng **SMI**.
- Tránh việc thay đổi qua lại giữa số nguyên và số thập phân trên cùng một biến nếu không thực sự cần thiết, vì nó ép V8 phải boxing/unboxing liên tục.

## 3. Lựa chọn Cấu trúc Dữ liệu

### Object vs Map
- Dùng **Object** khi: Các key là chuỗi tĩnh (static strings), biết trước lúc compile, và số lượng ít. (VD: Config, State).
- Dùng **Map** khi: Các key được thêm/xóa động (dynamic), key có thể không phải là string, hoặc cần duyệt (iterate) liên tục. `Map` được tối ưu hóa tốt hơn cho các thao tác CRUD liên tục.

### Array Pre-allocation
- Khi biết trước kích thước của mảng, **BẮT BUỘC phải cấp phát trước (Pre-allocate)** thay vì dùng `.push()` liên tục. Điều này ngăn chặn việc V8 phải re-allocate và copy mảng cũ sang mảng mới dưới nền (gây giật lag).

```javascript
// ❌ SAI: O(N) Re-allocations
const arr = [];
for (let i = 0; i < 10000; i++) {
  arr.push(i); // V8 phải liên tục cấp phát lại mảng lớn hơn
}

// ✅ ĐÚNG: O(1) Allocation
const arr = new Array(10000);
for (let i = 0; i < 10000; i++) {
  arr[i] = i; // Không re-allocation
}
```

## 4. Bể Đối tượng (Object Pools) - Cứu tinh của rAF

- Trong vòng lặp `requestAnimationFrame` (rAF), **KHÔNG BAO GIỜ** được dùng `new Object()` hoặc `new Array()`. Rác (Garbage) tạo ra ở đây sẽ kích hoạt Garbage Collector (GC), gây rớt khung hình (Jank/Stutter).
- **Bắt buộc dùng Object Pools:** Cấp phát trước một mảng các object (ví dụ 1000 hạt particles), và tái sử dụng chúng (reset properties) thay vì tạo mới.
