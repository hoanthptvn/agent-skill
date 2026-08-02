---
name: workflow-assets
description: Chỉ thị của Agent OS về Xử lý Tài nguyên (Nén & Mã hóa) trước khi đưa các file Media vào Code. Chống lại những hình phạt khổng lồ về hiệu năng LCP/TTFB.
license: MIT
---

# Quy trình Xử lý Tài nguyên (Asset Processing Workflow)

## 1. Kiểm duyệt Dung lượng trước khi Code
**MANDATORY:** Trước khi tích hợp bất kỳ Video hoặc Model 3D nào vào code, AI BẮT BUỘC phải nhắc nhở người dùng nén file nếu dung lượng quá lớn (Ví dụ: Video > 5MB, 3D Model > 3MB).
- KHÔNG ĐƯỢC im lặng viết code load file nặng 50MB. WebGL code có tối ưu đến đâu cũng vô dụng nếu file chưa nén.

## 2. Tiêu chuẩn Video Scrubbing (Scroll Video)
Khi làm hiệu ứng Scroll Video (kiểu dáng thiết kế của Apple):
**MANDATORY:** Video BẮT BUỘC phải được encode ở dạng **All-Intra (Keyframe mọi frame)** để có thể tua mượt mà bằng JavaScript (`video.currentTime`).
- Yêu cầu người dùng (hoặc tự dùng CLI nếu được phép) chạy lệnh FFmpeg sau:
```bash
ffmpeg -i input.mp4 -vf "scale=1280:-1" -vcodec libx264 -g 1 -preset ultrafast -crf 28 output_scrub.mp4
```
*(Tham số `-g 1` là bắt buộc để biến mọi frame thành keyframe)*

## 3. Tiêu chuẩn Mô hình 3D (WebGL/Three.js)
**MANDATORY:** Không sử dụng định dạng `.obj` hoặc `.fbx` thô trên web.
- BẮT BUỘC sử dụng định dạng `.glb` (GLTF Binary).
- **MANDATORY:** Cần yêu cầu nén bằng thuật toán **Draco** hoặc **Meshopt**.
- Lệnh nén Draco cơ bản (yêu cầu cài đặt Node.js `gltf-pipeline`):
```bash
npx gltf-pipeline -i model.gltf -o model_draco.glb -d
```
- Code Three.js/R3F BẮT BUỘC phải khai báo `DRACOLoader` trỏ về thư mục chứa decoder tĩnh (Tự Host decoders, cấm dùng CDN công cộng để tránh giật lag).

## 4. Hình ảnh (Textures/Raster)
- WebGL Textures BẮT BUỘC giới hạn kích thước theo lũy thừa của 2 (Power of Two - POT) như 1024x1024, 2048x2048.
- Chuyển đổi sang WebP để giảm kích thước file tải xuống.
- Khuyến khích sử dụng nén KTX2 (Basis) cho các siêu dự án WebGL.
