---
name: nextjs-caching
description: Chỉ thị của Agent OS về hành vi Caching trong Next.js App Router. Sử dụng khi debug các lệnh gọi API, tích hợp CMS, gặp lỗi render động (dynamic rendering) ngoài ý muốn, hoặc khi các request fetch không được cache và bị gọi lại liên tục.
license: MIT
---

# Next.js Caching & ISR

## Tổng quan
Trong Next.js App Router (v13+), `fetch` **KHÔNG** được cache theo mặc định. Điều này hoàn toàn trái ngược với Pages Router (`getStaticProps`). Việc vô tình kích hoạt render động (dynamic rendering) sẽ gây ra những đợt tăng vọt (spikes) khổng lồ về chi phí API/backend vì server sẽ phải fetch lại data trên mỗi lần người dùng tải trang, prefetch, hoặc bị crawler quét. Kỹ năng này bắt buộc tuân thủ các quy tắc caching (ISR) nghiêm ngặt để ngăn chặn việc đốt tiền API.

## Khi nào sử dụng
- Khi tích hợp một Headless CMS hoặc API bên ngoài vào Next.js.
- Khi người dùng phàn nàn về việc sử dụng API quá mức, lỗi "too many requests", hoặc server phản hồi chậm.
- Khi cấu hình `revalidate`, `dynamic`, hoặc `tags` trong một Route Segment.

## Quy trình

### 1. Kích hoạt Data Cache (fetch)
Để cache một request `fetch`, bạn **BẮT BUỘC** phải cung cấp thời gian `revalidate` (hoặc dùng `cache: 'force-cache'`). Nếu chỉ cung cấp `tags` không thôi thì không có tác dụng gì cho việc caching cả; nó chỉ gắn nhãn để phục vụ cho việc xóa cache (purging) sau này.
```typescript
const res = await fetch(`${API_URL}/data`, {
  next: {
    revalidate: 3600, // Dòng này KÍCH HOẠT caching (ISR)
    tags: ['my-content'], // Dòng này cho phép XÓA CACHE THEO YÊU CẦU
  },
});
```

### 2. Xóa Cache (revalidateTag)
Khi vô hiệu hóa cache thông qua một webhook, hãy chú ý đến sự khác biệt giữa các phiên bản. Trong Next.js 16+, hàm `revalidateTag` yêu cầu một đối số thứ hai (cache profile).
```typescript
import { revalidateTag } from 'next/cache';

// Next.js 15:
// revalidateTag('my-content');

// Next.js 16+:
revalidateTag('my-content', 'max'); 
```

### 3. Route Segment ISR (Ràng buộc giá trị hằng số cho `revalidate`)
Để áp dụng ISR cho toàn bộ một route (và tự động cache mọi lệnh fetch bên trong nó), hãy export một hằng số `revalidate`. 
**CRITICAL:** Giá trị export BẮT BUỘC phải là một con số nguyên (static literal number). Next.js sẽ phân tích tĩnh (statically analyzes) giá trị này trước khi module kịp chạy.
```typescript
// app/page.tsx
export const revalidate = 3600; // BẮT BUỘC là một con số nguyên.

export default async function Page() { ... }
```

### 4. Ngăn chặn vô tình biến Route thành Động (`dynamic = 'error'`)
Hành vi route mặc định (`'auto'`) sẽ âm thầm cho phép các lệnh fetch không có cache bị lọt qua. Khai báo `force-dynamic` sẽ ép mọi thứ bỏ qua cache. Đối với các trang marketing và nội dung CMS, hãy dùng `'error'` để đánh sập quá trình build (fail the build) nếu có bất kỳ thứ gì vô tình kích hoạt chế độ render động.
```typescript
// app/page.tsx
export const dynamic = 'error'; // Báo lỗi build nếu tồn tại một lệnh fetch không có cache

export default async function Page() { ... }
```

## Các Lời Biện Hộ Phổ Biến (Common Rationalizations)
| Lời Biện Hộ | Thực Tế |
|---|---|
| "Tôi đã thêm `next: { tags: ['cms'] }` vào fetch của tôi, nên nó sẽ được cache." | Thuộc tính tags KHÔNG kích hoạt caching. Nếu không có giá trị `revalidate` hoặc `cache: 'force-cache'`, lệnh fetch đó vẫn là động (dynamic) và sẽ hit thẳng vào CMS của bạn trên MỖI request. |
| "Tôi sẽ import hằng số TTL của tôi: `export const revalidate = CMS_TTL;`" | Quá trình build sẽ bị sập (crash) với lỗi `Invalid segment configuration export`. Các biến cấu hình route bắt buộc phải là hằng số tĩnh (static literals) được ghi thẳng vào trong file. |
| "Tôi cần đọc dữ liệu live, nên tôi sẽ dùng `export const dynamic = 'force-dynamic';`" | Điều này sẽ TẮT HOÀN TOÀN caching cho *toàn bộ route* và mọi lệnh fetch bên trong nó. Nếu bạn chỉ cần dữ liệu CMS, hãy dùng ISR (`revalidate: N`). Nếu bạn thực sự cần dữ liệu live theo từng request (như auth), hãy cô lập phần đó lại, đừng kéo theo các lệnh fetch CMS vào quá trình render động. |
| "Tôi sẽ để `dynamic` ở chế độ mặc định (`'auto'`)." | `'auto'` sẽ âm thầm dung túng cho các lệnh fetch không có cache. Nếu bạn quên viết `revalidate` ở đúng một lệnh fetch duy nhất, trang đó sẽ âm thầm biến thành động (dynamic) và đốt sạch giới hạn API (quota) CMS của bạn. Bắt buộc dùng `'error'` cho các route tĩnh/CMS. |

## Dấu hiệu Vi phạm (Red Flags)
- Các dự án Next.js 16 gọi hàm `revalidateTag('tag')` mà không có đối số thứ hai `'max'`.
- Các route segments sử dụng `export const dynamic = 'force-dynamic'` trong khi chúng chủ yếu phục vụ nội dung CMS.
- Viết code cố gắng import một biến bên ngoài vào để cấu hình route (ví dụ, `export const revalidate = myConstant;`).
- Các lệnh `fetch` gọi trong App Router có thuộc tính `tags` nhưng lại thiếu chỉ thị `revalidate` hoặc `cache`.

## Xác minh (Verification)
- [ ] Các cấu hình Route (`revalidate`, `dynamic`) phải sử dụng các hằng số cứng (hardcoded literals).
- [ ] Các trang Marketing và điều hướng bằng CMS sử dụng `export const dynamic = 'error'` (hoặc `revalidate`) để đảm bảo tuyệt đối chúng không bị vô tình server-rendered trên mỗi request.
- [ ] Các request `fetch` có chủ đích caching phải định nghĩa rõ ràng `revalidate: N` đi kèm bên cạnh các `tags`.
- [ ] Nếu sử dụng Next.js 16+, các lời gọi `revalidateTag` phải bao gồm đối số cache profile bắt buộc.
