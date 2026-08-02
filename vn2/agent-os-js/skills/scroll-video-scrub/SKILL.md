---
name: scroll-video-scrub
description: Sửa lỗi video bị khựng (stutter/slideshow) khi cuộn chuột (scroll-scrubbed). Nguyên nhân gốc: video.currentTime chỉ tìm đến keyframe gần nhất, không phải frame chính xác. Cách sửa: dùng ffmpeg mã hóa all-intra với cờ -g 1. Bao gồm lệnh ffmpeg cho MP4+WebM, giải thích cờ, đánh đổi dung lượng file, và cách viết ScrollTrigger bằng React/Next.js có kèm bẫy lỗi NaN.
---

# Chỉ thị: Hiệu ứng Cuộn Video (Scroll-Scrubbed Video)

## 1. Nguyên nhân Gốc rễ (Chống Biện hộ)
**WARNING:** Nếu một video được gắn với thanh cuộn (scroll-tied video) bị giật lag hoặc trông như đang chiếu slide ảnh, đó KHÔNG PHẢI là lỗi do JavaScript. Dùng các trick như Debouncing hay requestAnimationFrame cũng KHÔNG THỂ sửa được.
**CAUSE (Nguyên nhân):** Thuộc tính `video.currentTime` chỉ tìm (seek) đến keyframe gần nhất. Các video web thông thường chỉ có một keyframe sau mỗi ~250 frame.

## 2. Cách sửa bằng ffmpeg (Mã hóa All-Intra)
**MANDATORY:** Bạn BẮT BUỘC phải mã hóa video với cờ `-g 1` (buộc mỗi frame đều là một keyframe) để cho phép tìm kiếm chính xác đến từng frame (frame-accurate scrubbing).
**MANDATORY:** Bạn BẮT BUỘC phải thu nhỏ độ phân giải video xuống kích thước sẽ render trên màn hình (`-vf scale=1280:-2`) bởi vì cờ `-g 1` làm tăng dung lượng file lên cực kỳ khủng khiếp. Tuyệt đối không dùng video gốc 4K/1080p.

### Định dạng WebM (Ưu tiên số 1)
```bash
ffmpeg -i in.mov -vf scale=1280:-2 -r 30 -c:v libvpx-vp9 -crf 32 -b:v 0 -g 1 -pix_fmt yuv420p -an -row-mt 1 out.webm
```
### Định dạng MP4 (Dự phòng cho Safari)
```bash
ffmpeg -i in.mov -vf scale=1280:-2 -r 30 -movflags faststart -vcodec libx264 -crf 23 -g 1 -pix_fmt yuv420p -an out.mp4
```

## 3. Quy tắc viết Driver cho DOM & React
**MANDATORY:** Thẻ `<video>` bắt buộc phải có các thuộc tính: `muted`, `playsInline`, và `preload="auto"`. Trình duyệt không thể tua đến những frame chưa được tải (unbuffered frames).
**MANDATORY:** Định dạng WebM phải được xếp ĐẦU TIÊN trong các thẻ `<source>`.

### Các rào chắn (Guards) khi thực thi GSAP trong React
**FORBIDDEN:** TUYỆT ĐỐI KHÔNG gọi hàm `.play()`. Việc tua video (scrubbing) đơn thuần chỉ là liên tục gán giá trị mới cho `currentTime`.
**MANDATORY:** Bắt buộc áp dụng 3 rào chắn nghiêm ngặt sau trong code driver:
1. Đợi sự kiện `loadedmetadata` trước khi khởi tạo ScrollTrigger, nếu không `video.duration` sẽ trả về `NaN`.
2. Bọc lệnh gán `currentTime` trong một vòng kiểm tra `Number.isFinite(t)`.
3. Dọn dẹp (Clean up) instance của ScrollTrigger khi Component unmount (dùng `useGSAP` của `@gsap/react`).

```javascript
useGSAP(() => {
  const video = videoRef.current;
  if (!video) return;

  const setup = () => {
    if (!video.duration || Number.isNaN(video.duration)) return;
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const t = self.progress * video.duration;
        if (Number.isFinite(t)) video.currentTime = t;
      }
    });
  };

  if (video.readyState >= 1) setup();
  else video.addEventListener('loadedmetadata', setup, { once: true });
}, { scope: containerRef });
```
