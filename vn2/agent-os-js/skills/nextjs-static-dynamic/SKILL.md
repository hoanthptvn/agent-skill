---
name: nextjs-static-dynamic
description: Chỉ thị của Agent OS về các kiến trúc lai (hybrid) trong Next.js (Marketing Tĩnh + App Động), đặc biệt dành cho các nền tảng Edtech/LMS và Thương mại điện tử (E-commerce).
license: MIT
---

# Ranh giới Tĩnh & Động trong Next.js (Static & Dynamic Boundaries)

## Tổng quan
Một nền tảng nặng (heavy platform như LMS hoặc trang E-commerce) bắt buộc phải tải ngay tức thì cho tệp khách ghé thăm vì mục đích marketing, trong khi vẫn phải cung cấp dữ liệu thời gian thực (như đếm số ghế còn trống, tiến độ học tập khi đã đăng nhập, trạng thái giỏ hàng). Kỹ năng này định nghĩa cách bóc tách (split) một ứng dụng Next.js App Router nhằm đạt được việc phân phối các trang marketing tĩnh từ edge (cạnh mạng lưới), đi song song với trạng thái application động mà không làm sụp đổ hiệu năng chung.

## Khi nào sử dụng
- Khi xây dựng một trang đích (landing page) Edtech được kết nối với một hệ thống LMS.
- Khi xây dựng một trang sản phẩm E-commerce (thương mại điện tử) yêu cầu cập nhật tồn kho theo thời gian thực (live inventory).
- Khi phải cân bằng giữa thời gian tải cực nhanh cho SEO với các yêu cầu lấy dữ liệu API thời gian thực.

## Quy trình

### 1. Static / ISR cho Lớp vỏ ngoài (Marketing Shell)
Phần lớn dung lượng của một trang đích (copy, hình ảnh, chương trình học, đánh giá khách hàng) bắt buộc phải là trang tĩnh (static) hoặc sử dụng Incremental Static Regeneration (ISR). Điều này cho phép trang web được phục vụ từ mạng CDN chỉ trong vài mili-giây (milliseconds).
```typescript
// app/course/[slug]/page.tsx
export const revalidate = 300; // ISR: làm mới toàn bộ trang mỗi 5 phút ngầm ở background

export default async function CoursePage({ params }) {
  // Render ngay lập tức từ bộ nhớ đệm cạnh (edge cache)
  return <MarketingHero /> 
}
```

### 2. Các Hòn đảo Component Động (Cầu nối API - The API Bridge)
TUYỆT ĐỐI KHÔNG bắt toàn bộ trang web biến thành động (ví dụ gán `export const dynamic = 'force-dynamic'`) chỉ để hiển thị cái đếm số ghế (live seat count) hay tiến trình của một người dùng. Thay vào đó, hãy CÔ LẬP lệnh fetch động (dynamic fetch) đó vào bên trong một Server Component cụ thể (hoặc sử dụng Client Components kết hợp SWR/React Query).
```typescript
// Một lệnh fetch động cục bộ, hoàn toàn không trừng phạt hiệu năng của phần còn lại của trang tĩnh
async function SeatCounter({ courseId }: { courseId: string }) {
  const seats = await fetch(`${API}/courses/${courseId}/seats`, {
    next: { revalidate: 0 }, // Hoặc revalidate: 60 nếu chấp nhận dữ liệu tươi mới mỗi 1 phút
  }).then((r) => r.json());
  
  return <span>Chỉ còn {seats.remaining} chỗ trống</span>
}
```
*Lưu ý: Trong Next.js App Router, việc bọc khối này vào bên trong `<Suspense>` sẽ đảm bảo nó không làm nghẽn lớp vỏ tĩnh (static shell) từ việc streaming dữ liệu đến client ngay lập tức.*

## Các Lời Biện Hộ Phổ Biến (Common Rationalizations)
| Lời Biện Hộ | Thực Tế |
|---|---|
| "Tôi cần hiển thị tồn kho trực tiếp (live inventory), nên tôi sẽ set `force-dynamic` cho cái page này." | Bạn vừa hủy diệt chỉ số TTFB (Time to First Byte) của 100% khách truy cập. Hãy thiết kế cho page ở dạng tĩnh, và CÔ LẬP cái lệnh fetch tồn kho đó vào một Server Component bọc Suspense, hoặc chuyển thành lệnh fetch phía client. |
| "Tôi sẽ fetch tất cả mọi thứ bên phía client trong một cái `useEffect` để giữ cho HTML tĩnh." | Kỹ thuật này sẽ tạo ra một thác nước load xoay vòng (loading spinner waterfall). Hãy Pre-render nội dung marketing (bằng ISR), và chỉ được phép client-fetch các trạng thái dành riêng cho cá nhân user (ví dụ tiến độ học tập khi đã đăng nhập). |

## Dấu hiệu Vi phạm (Red Flags)
- Các trang Next.js chứa hằng số `export const dynamic = 'force-dynamic'` trong khi 90% nội dung trang đó là chữ nghĩa marketing tĩnh.
- Một landing page tốn tận 2 giây chỉ để render bởi vì nó phải đứng chờ một API LMS của bên thứ ba trả về con số chỗ ngồi còn trống.

## Xác minh (Verification)
- [ ] Các nội dung Marketing (chương trình, chữ nghĩa, media) phải được tạo sẵn (statically generated) hoặc sử dụng ISR (`revalidate: N`).
- [ ] Dữ liệu thời gian thực (số chỗ ngồi, trạng thái checkout) phải được cô lập vào các components cụ thể (thông qua ranh giới `<Suspense>` boundaries hoặc sử dụng client-fetching).
- [ ] Tuyệt đối KHÔNG sử dụng `force-dynamic` cho các trang landing page cốt lõi.
