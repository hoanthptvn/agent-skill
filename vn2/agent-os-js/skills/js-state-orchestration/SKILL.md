---
name: js-state-orchestration
description: Chỉ thị của Agent OS về Điều phối Trạng thái Toàn cục (Global State Orchestration). Bắt buộc tách biệt (Decoupling) giữa WebGL Canvas và các khối DOM bằng Event Bus hoặc Zustand.
license: MIT
---

# Chỉ thị Điều phối Trạng thái Toàn cục (Router)

## 1. Nguyên tắc Độc lập (Strict Decoupling)
**FORBIDDEN:** Canvas (WebGL) KHÔNG ĐƯỢC PHÉP truy vấn các phần tử của DOM (`document.querySelector`) để lấy dữ liệu cuộn hay tọa độ.
**FORBIDDEN:** Không truyền Props sâu quá 2 tầng (Prop Drilling) trong React để đồng bộ State giữa WebGL và DOM.

## 2. Event Bus / PubSub (Đối với Vanilla JS)
**MANDATORY:** Sử dụng mô hình Phát - Lắng nghe sự kiện (Event Bus/Emitter).
- **DOM:** Chỉ làm nhiệm vụ PHÁT sự kiện (Emit) khi người dùng cuộn đến Section tương ứng.
- **WebGL:** Chỉ làm nhiệm vụ LẮNG NGHE (On/Listen) và cập nhật đồ họa, không quan tâm DOM nằm ở đâu.

```javascript
// Cấu trúc Vanilla JS (NanoEvents hoặc CustomEvent)
// DOM Section 2 phát sự kiện
window.dispatchEvent(new CustomEvent('SECTION_ENTER', { detail: { id: 2, color: '#ff0000' } }));

// WebGL Lắng nghe
window.addEventListener('SECTION_ENTER', (e) => {
    gsap.to(mesh.material.color, { value: new THREE.Color(e.detail.color) });
});
```

## 3. Global Store (Đối với React/Next.js)
**MANDATORY:** Sử dụng `Zustand` (không dùng Redux) để lưu trữ trạng thái toàn cục kết nối R3F (React Three Fiber) và HTML.
- **FORBIDDEN:** Không lưu các giá trị thay đổi liên tục (như `scrollY` hay `mouseXY`) vào Zustand vì sẽ gây render lại (Re-render) toàn ứng dụng.
- **MANDATORY:** Chỉ lưu các trạng thái tĩnh (Chỉ số Section hiện tại, Trạng thái tải xong, Màu Theme). 
- Với các giá trị liên tục, BẮT BUỘC dùng Mutable Refs (tham chiếu) hoặc gọi `useFrame` trực tiếp.

## 4. Xử lý Chuyển cảnh chéo (Cross-Section Transitions)
Khi chuyển từ Section 1 sang Section 2, nếu WebGL model cần bay từ trên xuống dưới:
- **MANDATORY:** Thiết lập một `gsap.timeline()` lắng nghe ScrollTrigger của toàn trang, gắn các mốc Nhãn (`addLabel`) tương ứng với từng Section.
- WebGL sẽ di chuyển dựa trên tiến trình (progress) của timeline đó.
