---
name: js-algorithms
description: Kỹ năng điều hướng trung tâm cho các thuật toán JS. Kết nối lý thuyết thuật toán với thực tiễn GSAP.
---

# Chỉ thị Thuật toán Front-End (Router)

## 1. Bảng Định tuyến (Routing Table)
**MANDATORY:** Bạn BẮT BUỘC phải đọc (thông qua `view_file`) file thuật toán tương ứng TRƯỚC KHI viết bất kỳ đoạn code thuật toán nào. TUYỆT ĐỐI KHÔNG tự ảo giác (hallucinate) ra các thuật toán khoa học máy tính tiêu chuẩn khi đã có sẵn các biến thể chuyên dụng cho GSAP/UI.
- `gsap-algorithm-guide.md`: (ĐỌC ĐẦU TIÊN) Xác định xem liệu các tính năng native của GSAP có thể thay thế hoàn toàn thuật toán đó hay không.

### Cốt lõi (UI & DOM)
- `essential/animation-loop.md`: Tối ưu hóa `requestAnimationFrame`.
- `essential/flip-sort.md`: Kéo thả (Drag & Drop), Lọc danh sách bằng hiệu ứng FLIP.
- `essential/binary-search.md`: Cuộn ảo (Virtual Scroll), Kéo dòng thời gian (Timeline Scrubbing).
- `essential/sliding-window.md`: Tính toán FPS, Vận tốc cuộn trang (Scroll Velocity).
- `essential/two-pointers.md`: Thu phóng bằng 2 ngón tay (Pinch-to-zoom), Dọn dẹp mảng tại chỗ (in-place array cleanup).
- `essential/frequency-counter.md`: Lọc danh mục, Kiểm đếm thời gian thực (Realtime tally).
- `essential/spatial-hash.md`: Tối ưu hóa hiệu ứng hover trên hơn 10,000 phần tử.
- `essential/graph-bfs-dfs.md`: Hiệu ứng gợn sóng (Ripple Effects) từ tọa độ click chuột.
- `essential/pathfinding.md`: Thuật toán Dijkstra cho Game trên Web/Bản đồ tương tác.

### Nâng cao (WebGL & Frameworks)
- `advanced/radix-sort.md`: Sắp xếp độ sâu Z (Z-depth sorting) cho hàng ngàn hạt (particles) ở mức 60fps.
- `advanced/binary-heap.md`: Hàng đợi Ưu tiên (Priority Queue), Trình lập lịch Tác vụ (Task Schedulers).
- `advanced/graph.md`: Quản lý Scene Graph (Three.js), Cỗ máy Trạng thái (State Machines) phức tạp.
- `advanced/recursion.md`: Deep Clone, Tree Views vô hạn.

## 2. Tiêu chí Dừng Bắt buộc (Hard Exit)
**FORBIDDEN:** KHÔNG ĐƯỢC tiến hành bước tiếp theo nếu chưa đọc file mục tiêu ở trên.
