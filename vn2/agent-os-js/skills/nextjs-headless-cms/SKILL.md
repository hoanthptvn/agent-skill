---
name: nextjs-headless-cms
description: Chỉ thị của Agent OS về tích hợp Headless CMS (Strapi, Sanity) vào Next.js. Bao gồm việc fetch dữ liệu lúc build/revalidation, hệ thống routing điều hướng dựa trên nội dung, và loại bỏ sự phụ thuộc vào developer mỗi khi cần cập nhật nội dung.
license: MIT
---

# Kiến trúc Next.js Headless CMS

## Tổng quan
Đối với các studio và agency, một trang web chỉ được coi là thành công nếu khách hàng có thể tự mình cập nhật nội dung mà không cần phải kích hoạt quy trình deploy code mới. Kỹ năng này định nghĩa kiến trúc chuẩn để tích hợp các hệ thống Headless CMS (như Strapi hoặc Sanity) với Next.js, đảm bảo duy trì hiệu năng cao ngay cả khi có nhiều chuyển động (heavy motion).

## Khi nào sử dụng
- Khi xây dựng các trang portfolio, trang web studio, hoặc sàn thương mại điện tử đòi hỏi cập nhật nội dung liên tục (dự án mới, bài viết case studies, bài báo).
- Khi tích hợp Next.js với Strapi, Sanity, hoặc Contentful.

## Quy trình

### 1. Nội dung (Content) chính là Database, Không phải là Code
- Mỗi một dự án, bài viết, hoặc thư viện ảnh (gallery) bắt buộc phải là một mục dữ liệu (content entry) lưu trong CMS.
- **TUYỆT ĐỐI KHÔNG** hardcode dữ liệu dự án, hình ảnh, hoặc thứ tự sắp xếp trực tiếp trong code frontend.
- Next.js sẽ fetch các dữ liệu này tại thời điểm build (Static Generation) hoặc thời điểm revalidation (tính năng ISR/App Router caching).

### 2. Các trang Web Tĩnh siêu tốc (Static-Fast Pages)
- Các trang web có nhiều hiệu ứng chuyển động nặng (heavy motion sites dùng WebGL, GSAP) không được phép có độ trễ Time-to-First-Byte (TTFB) chậm. 
- TUYỆT ĐỐI KHÔNG fetch dữ liệu CMS từ phía client (ví dụ dùng `useEffect`).
- Phải fetch dữ liệu trên server và truyền nó xuống dưới dạng static props/server components. Trang web phải tải ngay lập tức, giải phóng hoàn toàn luồng chính (main thread) cho GSAP và WebGL.

### 3. Revalidation và Webhooks
- Cấu hình CMS để gửi webhooks về một Next.js API route nhằm kích hoạt tính năng Revalidation theo yêu cầu (On-Demand Revalidation bằng `revalidateTag` hoặc `revalidatePath`) mỗi khi có nội dung mới được publish hoặc update.
- **Lưu ý cho Next.js 15+:** Lệnh `fetch` mặc định KHÔNG được cache. Bạn BẮT BUỘC phải dùng rõ ràng `next: { revalidate: 300, tags: ['posts'] }` để tránh việc băm nát (hammering) server CMS.

## Các Lời Biện Hộ Phổ Biến (Common Rationalizations)
| Lời Biện Hộ | Thực Tế |
|---|---|
| "Tôi chỉ định hardcode 3 dự án nổi bật này thôi, chắc họ chả thay đổi sớm đâu." | HỌ CHẮC CHẮN SẼ THAY ĐỔI. Ngay khi web vừa ra mắt, khách hàng sẽ ngay lập tức muốn sắp xếp lại chúng. Nếu việc này đòi hỏi lập trình viên phải nhảy vào deploy lại, thì trang web đó đã trở nên ôi thiu (stale). Hãy dùng một hệ thống Headless CMS. |
| "Tôi sẽ fetch các hình ảnh gallery bằng một client component để nhìn cho nó có vẻ dynamic (động)." | Fetching bên phía Client sẽ gây vỡ bố cục (layout shifts) và làm nghẽn lần hiển thị đầu tiên (blocks initial paint). Hãy fetch dữ liệu trên server và truyền chúng xuống (pass data down). |

## Dấu hiệu Vi phạm (Red Flags)
- Các mảng dữ liệu JSON bị hardcode cứng cho các mục portfolio (hồ sơ dự án).
- Những lời gọi hàm `fetch` bên phía Client hướng về một CMS bị nhét trong một hook `useEffect`.
- Một trang web Next.js mà bất kỳ một thay đổi nội dung nhỏ nào cũng bắt buộc phải nhấn Redeploy trên Vercel.
- Các lời gọi CMS `fetch` trong Next.js 15+ bị thiếu các cấu hình `next: { revalidate }`.

## Xác minh (Verification)
- [ ] Tất cả nội dung động (dự án, bài viết, video reels) đều được fetch từ một hệ thống Headless CMS.
- [ ] Dữ liệu được fetch trên server sử dụng tính năng caching/ISR của Next.js.
- [ ] Khách hàng (client) có thể thay đổi thứ tự và publish sản phẩm mới hoàn toàn 100% từ bảng điều khiển quản trị (admin panel) của CMS.
