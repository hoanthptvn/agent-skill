---
name: nextjs-headless-wordpress
description: Chỉ thị của Agent OS về tích hợp Headless WordPress với Next.js bằng REST API. Bao gồm tối ưu hóa tham số _embed, ánh xạ Yoast SEO, chống lỗi CORS, và cấu hình Draft Mode (Chế độ xem trước Bản nháp).
license: MIT
---

# Kiến trúc Next.js Headless WordPress

## Tổng quan
Khi chuyển đổi website khách hàng khỏi các theme PHP cũ rích nhưng vẫn muốn giữ lại bảng điều khiển (dashboard) WordPress quen thuộc, lập trình viên phải thực thi các quy tắc lấy dữ liệu (data-fetching) cực kỳ khắt khe. Headless WordPress đòi hỏi phải xử lý cẩn thận REST API, bộ nhớ đệm (caching), và xác thực (authentication) để ngăn chặn thảm họa N+1 queries, lỗi CORS, và việc không xem trước được bài viết nháp (broken drafts).

## Khi nào sử dụng
- Khi tách rời (decoupling) một trang web WordPress và xây dựng một frontend Next.js tùy chỉnh.
- Khi truy vấn dữ liệu từ WordPress REST API (đường dẫn `/wp-json/wp/v2/`).
- Khi người dùng phàn nàn về lỗi CORS lúc fetch dữ liệu từ WordPress.

## Quy trình

### 1. REST API và tham số `_embed`
- **Chỉ dùng REST API cho Nội dung Tiêu chuẩn (Standard Content):** Tránh cài cắm thêm các plugin thừa thãi (như WPGraphQL) trừ phi bạn thực sự cần truy vấn chính xác từng trường dữ liệu cho các thiết kế block-based cực kỳ phức tạp.
- **Cờ `_embed` (The `_embed` Flag):** LUÔN LUÔN nối thêm tham số `&_embed` vào cuối các request REST (ví dụ: `/wp-json/wp/v2/posts?slug=xyz&_embed`). Tham số này sẽ gộp (inlines) ảnh đại diện (featured image), tác giả (author), và chuyên mục (taxonomy) vào chung một cục payload trả về, triệt tiêu hoàn toàn thảm họa thác nước fetch dữ liệu nối tiếp N+1 (N+1 cascading fetch waterfalls).

### 2. Caching và Phân trang (Pagination)
- **Next.js 15+ Caching:** Lệnh `fetch` mặc định KHÔNG được cache. Bạn BẮT BUỘC phải viết rõ ràng `next: { revalidate: 300, tags: ['posts'] }` để tránh việc băm nát (hammering) máy chủ CMS trên mỗi request.
- **Tiêu đề Phân trang (Pagination Headers):** Dữ liệu phân trang của WordPress nằm trong phần Headers của phản hồi (response headers), chứ không nằm trong body. Hãy trích xuất nó bằng lệnh `res.headers.get('X-WP-TotalPages')`.

### 3. Tích hợp SEO
- Đảm bảo rằng trang WordPress có cài đặt một plugin SEO (như Yoast hoặc Rank Math) có hỗ trợ phơi bày (exposes) dữ liệu ra REST API.
- Trích xuất object `yoast_head_json` từ payload của bài viết và ánh xạ (map) nó vào hàm `generateMetadata` của Next.js (ví dụ như `title`, `description`, `openGraph.images`).

### 4. Vượt qua Bẫy CORS (Bypassing CORS Traps)
- **Cái bẫy:** Lỗi CORS xảy ra khi bạn cố gắng fetch `/wp-json` trực tiếp từ trình duyệt (sử dụng Client Components).
- **Cách sửa:** **TẤT CẢ mọi lệnh fetch từ WordPress ĐỀU PHẢI được thực thi trên Server** (Dùng React Server Components hoặc Route Handlers). Điều này xóa sổ hoàn toàn lỗi CORS (do gọi từ server-to-server) và giấu nhẹm các thông tin đăng nhập WordPress khỏi phía client.

### 5. Draft Mode (Xem trước Bản nháp Trực tiếp)
Một bản nháp (draft) của headless sẽ không còn "tự động hiển thị" như xưa nữa. Bạn bắt buộc phải cấu hình tính năng Draft Mode của Next.js để xem các thay đổi chưa publish.
- Tạo một file `app/api/preview/route.ts` để xác minh một secret token và gọi hàm `draftMode().enable()`.
- Khi fetch dữ liệu cho một route, hãy kiểm tra xem Draft Mode `isEnabled` có đang bật không.
- Nếu đang bật, hãy fetch kèm thuộc tính `cache: 'no-store'`, thêm tham số `status=draft,publish`, và truyền vào một Header `Authorization` (`Basic ` + Mật khẩu Ứng dụng đã mã hóa Base64).

```javascript
// Ví dụ về WordPress Draft Fetch
import { draftMode } from 'next/headers'

export async function getPostForRoute(slug: string) {
  const { isEnabled } = await draftMode()
  const status = isEnabled ? 'draft,publish' : 'publish'
  
  return fetch(`${process.env.WP_URL}/wp-json/wp/v2/posts?slug=${slug}&status=${status}&_embed`,
    isEnabled
      ? { cache: 'no-store', headers: { Authorization: wpAuthHeader() } } // Draft Mode (Bypass Cache, Bật Xác thực)
      : { next: { revalidate: 300, tags: [`post:${slug}`] } },           // Production (Kích hoạt ISR)
  ).then((r) => r.json())
}

const wpAuthHeader = () =>
  'Basic ' + Buffer.from(`${process.env.WP_USER}:${process.env.WP_APP_PASSWORD}`).toString('base64')
```
*(Lưu ý: `WP_APP_PASSWORD` là Mật khẩu Ứng dụng - Application Password - được tạo riêng cho từng user bên trong WP Admin, TUYỆT ĐỐI KHÔNG phải là mật khẩu đăng nhập thật của người dùng).*

## Các Lời Biện Hộ Phổ Biến (Common Rationalizations)
| Lời Biện Hộ | Thực Tế |
|---|---|
| "Tôi sẽ fetch bài viết từ phía client để người dùng có thể thấy dữ liệu live ngay lập tức." | Fetching bên phía client sẽ tự nổ ra lỗi CORS với WordPress và làm lộ tẩy các đường dẫn API (endpoints) của bạn ra ngoài. Bắt buộc fetch trên Server và sử dụng Next.js ISR để có dữ liệu live. |
| "Tôi sẽ viết 3 lệnh fetch riêng biệt: 1 cho nội dung bài, 1 cho tác giả, và 1 cho ảnh đại diện." | Chúc mừng, bạn vừa tạo ra một thác nước kẹt xe mạng (massive network waterfall) khổng lồ. Bắt buộc dùng tham số `&_embed` để hốt trọn toàn bộ chúng chỉ trong 1 request duy nhất. |
| "Headless WordPress làm tính năng xem trước khó quá, tội mấy ông biên tập viên." | Hãy thiết lập Next.js Draft Mode kết hợp với Mật khẩu Ứng dụng. Trải nghiệm của biên tập viên (editor) sẽ được giữ nguyên vẹn y hệt như dùng WordPress gốc. |

## Dấu hiệu Vi phạm (Red Flags)
- Gọi các hàm `fetch` hướng tới `/wp-json` bên phía client, nhét bên trong một hook `useEffect`.
- Fetch các posts (bài viết) mà thiếu mất cờ `&_embed`, sau đó đẻ ra một đống API calls chạy nối tiếp chỉ để lấy thông tin media IDs.
- Lời gọi CMS `fetch` trong Next.js 15+ thiếu mất cấu hình `next: { revalidate }` (hậu quả là tạo ra những cú hits dynamic không giới hạn đập vào server).
- Muốn xem trước một bản nháp mà lại phải deploy code tạm thời lên server thay vì cấu hình đàng hoàng tính năng Next.js Draft Mode.

## Xác minh (Verification)
- [ ] TẤT CẢ các lệnh WordPress REST fetches ĐỀU PHẢI được thực thi trên Server (bằng RSC/Route Handlers).
- [ ] Các truy vấn danh sách hoặc chi tiết một post bắt buộc phải đi kèm tham số `&_embed`.
- [ ] Dữ liệu được fetch thông qua cơ chế caching của Next.js (`revalidate` / `tags`).
- [ ] Tính năng Next.js Draft Mode phải được cấu hình bằng Mật khẩu Ứng dụng (Application Passwords) để phục vụ cho các bản xem trước không-bị-cache (un-cached previews) của các nội dung chưa publish.
- [ ] Metadata SEO phải được ánh xạ (mapped) chuẩn chỉ từ phản hồi (response) của WP REST vào hàm `generateMetadata`.
