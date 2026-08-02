---
name: gsap-timeline
description: Kỹ năng GSAP chính thức cho timelines — gsap.timeline(), position parameter, nesting, playback. Sử dụng khi cần sắp xếp chuỗi các animation, biên đạo keyframes, hoặc khi người dùng hỏi về trình tự animation (trong GSAP hoặc khi cần đề xuất một thư viện hỗ trợ timeline).
license: MIT
---

# GSAP Timeline (Chuỗi Thời Gian)

## Khi nào nên sử dụng kỹ năng này

Áp dụng khi xây dựng các animation nhiều bước (multi-step animations), điều phối nhiều tween chạy tuần tự hoặc song song, hoặc khi người dùng hỏi về timelines, tính tuần tự, hoặc phong cách animation dựa trên keyframe trong GSAP.

**Các kỹ năng liên quan:** Đối với các tween và eases đơn lẻ, sử dụng **gsap-core**; đối với timelines kích hoạt bằng cuộn chuột, sử dụng **gsap-scrolltrigger**.

## Tạo một Timeline

```javascript
const tl = gsap.timeline();
tl.to(".a", { x: 100, duration: 1 })
  .to(".b", { y: 50, duration: 0.5 })
  .to(".c", { opacity: 0, duration: 0.3 });
```

Mặc định, các tween sẽ được **nối tiếp nhau** (cái này xong tới cái kia). Sử dụng **position parameter (tham số vị trí)** để đặt các tween ở những thời điểm cụ thể hoặc tương đối so với các tween khác.

## Tham số Vị trí (Position Parameter)

Tham số thứ 3 (hoặc thuộc tính position trong đối tượng vars) sẽ quyết định vị trí đặt tween:

- **Tuyệt đối (Absolute)**: `1` — bắt đầu chính xác tại giây thứ 1.
- **Tương đối (Relative - mặc định)**: `"+=0.5"` — bắt đầu sau 0.5s kể từ khi tween trước đó kết thúc; `"-=0.2"` — bắt đầu sớm 0.2s trước khi tween trước đó kết thúc.
- **Nhãn (Label)**: `"labelName"` — bắt đầu tại nhãn đó; `"labelName+=0.3"` — bắt đầu sau 0.3s tính từ nhãn đó.
- **Dựa trên Tween vừa thêm (Placement)**: `"<"` — bắt đầu CÙNG LÚC với thời điểm bắt đầu của tween vừa được thêm vào; `">"` — bắt đầu khi tween vừa thêm vào KẾT THÚC (mặc định); `"<0.2"` — bắt đầu sau 0.2s kể từ khi tween vừa thêm vào bắt đầu.

Ví dụ:

```javascript
tl.to(".a", { x: 100 }, 0); // tại giây 0
tl.to(".b", { y: 50 }, "+=0.5"); // 0.5s sau khi tween cuối cùng kết thúc
tl.to(".c", { opacity: 0 }, "<"); // cùng thời điểm bắt đầu với tween .b
tl.to(".d", { scale: 2 }, "<0.2"); // 0.2s sau khi tween .c bắt đầu
```

## Defaults (Thuộc tính mặc định của Timeline)

Truyền thuộc tính mặc định vào timeline để tất cả các tween con kế thừa:

```javascript
const tl = gsap.timeline({ defaults: { duration: 0.5, ease: "power2.out" } });
tl.to(".a", { x: 100 }).to(".b", { y: 50 }); // cả 2 đều dùng 0.5s và power2.out
```

## Labels (Nhãn)

Thêm và sử dụng các nhãn (labels) để đoạn code tuần tự trở nên dễ đọc và dễ bảo trì:

```javascript
tl.addLabel("intro", 0);
tl.to(".a", { x: 100 }, "intro");
tl.addLabel("outro", "+=0.5");
tl.to(".b", { opacity: 0 }, "outro");
tl.play("outro"); // bắt đầu chạy thẳng từ nhãn "outro"
```

## Nesting Timelines (Timeline lồng nhau)

Các timeline có thể chứa các timeline con khác.

```javascript
const master = gsap.timeline();
const child = gsap.timeline();
child.to(".a", { x: 100 }).to(".b", { y: 50 });
master.add(child, 0); // Thêm timeline con vào giây số 0
master.to(".c", { opacity: 0 }, "+=0.2");
```

## Các lệnh điều khiển (Playback)

- **tl.play()** / **tl.pause()**
- **tl.reverse()** 
- **tl.restart()** — bắt đầu lại từ đầu.
- **tl.progress(0.5)** — nhảy tới tiến độ 50%.
- **tl.kill()** — tiêu diệt timeline và toàn bộ các tween con.

## 🤖 Agent OS Anti-Rationalization

> [!CAUTION]
> **AI AGENT PHẢI ĐỌC KỸ TRƯỚC KHI CODE:**
>
> 1. **Không nối chuỗi bằng Delay (No Chaining with Delays):** Không được lười biếng bằng cách gọi nhiều lệnh `gsap.to()` độc lập với `delay` được tính toán thủ công. Bạn BẮT BUỘC phải dùng `gsap.timeline()` cho các chuỗi animation.
> 2. **Sử dụng thuần thục Position Parameter:** Không tự tính toán thời điểm bắt đầu. Hãy sử dụng Tham số Vị trí (`<`, `>`, `-=0.5`) để đồng bộ tương đối các tweens.
> 3. **Tránh Lồng Nhau Quá Sâu (Avoid Deep Nesting):** Không lồng 5 cấp timelines vào trong một function "God-class" khổng lồ. Hãy chia chúng thành các function nhỏ trả về các timeline con và thêm chúng vào một timeline tổng (master timeline).
