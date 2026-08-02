---
name: workflow-video
description: Chỉ thị của Agent OS về xử lý phương tiện video, đặc biệt là các thư viện video tương tác, hiệu năng giải mã, và sắp xếp chuỗi (sequencing) video bằng GSAP.
license: MIT
---

# Chỉ thị Hiệu năng & Tương tác Video

## 1. Quy tắc "Chỉ một Video Hoạt động" (The "One Active Video" Rule)
**MANDATORY:** Tuyệt đối không bao giờ giải mã (decode) nhiều hơn một video cùng một lúc.
- **FORBIDDEN:** KHÔNG ĐƯỢC thêm thuộc tính `autoplay` vào một lưới (grid) chứa nhiều video. Làm vậy sẽ làm treo đứng trình duyệt.
- Hãy dùng một ảnh poster tĩnh hoặc phần tử `<picture>` cho đến khi người dùng chủ động hover chuột hoặc click vào video đó.
- Khi một video được kích hoạt (activate), bạn BẮT BUỘC phải gọi `pause()` trên tất cả các video còn lại và thiết lập `currentTime = 0`.

## 2. Di chuyển/Hoạt hình cho Khung chứa Video (Animating Video Containers)
**MANDATORY:** Khi animate các video đang hoạt động, CHỈ ĐƯỢC animate các thuộc tính phức hợp (composite properties) như `transform`, `opacity`.
- **FORBIDDEN:** TUYỆT ĐỐI KHÔNG animate các thuộc tính `width`, `height`, `top`, hay `left` trên một khung chứa video đang chạy (playing). Điều này buộc trình duyệt phải tính toán lại bố cục (layout recalculation) trong lúc GPU đang bận rộn, gây ra hiện tượng giật lag cực kỳ thảm họa (severe stutter).

## 3. Lập chuỗi Phương tiện GSAP (GSAP Media Sequencing)
**MANDATORY:** Khi cần sắp xếp chuỗi UI cùng với phương tiện (ví dụ: chuyển từ màn hình loading sang video hero), hãy sử dụng tham số vị trí (position parameter) của GSAP (ví dụ: `<0.2`) để các animation được gối lên nhau (overlap).
- **FORBIDDEN:** KHÔNG ĐƯỢC chờ cho màn hình loading biến mất hoàn toàn rồi mới bắt đầu animation tiếp theo. Các "khung hình chết" (dead frames) - tức là khoảnh khắc màn hình trống trơn không có gì chuyển động - là ĐIỀU KHÔNG THỂ CHẤP NHẬN ĐƯỢC.

## 4. Tiêu chí Dừng bắt buộc (Hard Exit Criteria)
**FORBIDDEN:** Không được phép đánh dấu các tác vụ tương tác video là ĐÃ XONG (DONE) cho đến khi:
- Logic code đã đảm bảo chắc chắn chỉ có DUY NHẤT MỘT video được giải mã tại cùng một thời điểm.
- Các video không được chọn đã bị tạm dừng (paused) một cách rõ ràng.
- Mọi animation trên các khung chứa video tuân thủ nghiêm ngặt việc chỉ dùng `transform`/`opacity`.
