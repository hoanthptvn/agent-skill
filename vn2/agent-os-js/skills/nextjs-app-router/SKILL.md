---
name: nextjs-app-router
description: Kiến thức Next.js App Router chuyên sâu cho brand/marketing sites. Bao gồm: caching semantics (Next.js 15), tag-based revalidation, SPA page transition + redirect bug, và debug recipe. Kích hoạt khi user đề cập đến fetch caching, unstable_cache, revalidateTag, page transitions, blank page sau navigation, white flash, hoặc redirect trong SPA.
---

# Next.js App Router — Brand Site Production Patterns

## Nguồn kiến thức

Source: Các pattern này được rút ra từ production builds thực tế: Next.js + headless CMS + Three.js.

---

## 1. Caching Semantics — Next.js 15 Breaking Change

> [!WARNING]
> **Breaking change Next.js 15:** `fetch()` KHÔNG còn được cache mặc định. `cache: 'no-store'` là default mới. GET Route Handlers cũng không được cache. Teams upgrade mà không biết điều này → mọi page render đều là live database hit → bill database tăng vọt.

### Vấn đề thực tế

```javascript
// ❌ TRƯỚC Next.js 15 — fetch được cache tự động, bây giờ KHÔNG còn nữa
const data = await fetch('https://my-cms.io/api/homepage').then(r => r.json());
// → Mỗi request = 1 live database call. Low-traffic site vẫn burn hết compute budget.
```

### Fix: unstable_cache với Tag-based Revalidation

```javascript
// ✅ ĐÚNG — cache rõ ràng với tags để có thể bust khi publish
import { unstable_cache } from 'next/cache';

export const getHomepage = unstable_cache(
  async () => cms.query('homepage'),
  ['homepage'],                              // cache key
  { tags: ['cms:homepage'], revalidate: 3600 }  // tag để bust + TTL fallback
);

// Trong CMS webhook / server action sau khi publish:
import { revalidateTag } from 'next/cache';
revalidateTag('cms:homepage'); // bust ngay lập tức, không cần chờ TTL
```

### Gotcha: Time-based và Tag-based KHÔNG thể dùng cùng nhau

```javascript
// ❌ SAI — nếu fetch có tags, giá trị revalidate bị IGNORED hoàn toàn
const data = await client.fetch(query, params, {
  next: { tags: ['page', 'page:home'], revalidate: 60 }, // revalidate bị ignore!
});

// ✅ ĐÚNG — chọn MỘT model per fetch: hoặc time-based HOẶC tag-based
// Option A: Time-based (không cần webhook, chấp nhận staleness ~1 phút)
const data = await client.fetch(query, params, {
  next: { revalidate: 60 },
});

// Option B: Tag-based (cần webhook setup, publish gần như instant)
const data = await client.fetch(query, params, {
  next: { tags: ['page', `page:${slug}`] },
});
```

**Rule:** Marketing site nhỏ → time-based (60s) là đủ, skip webhook. Client cần instant publish → tag-based + webhook.

---

## 2. ISR + next/dynamic — "Ship Message First, Hydrate Spectacle Second"

> [!IMPORTANT]
> Nguyên tắc vàng cho SaaS/brand marketing site: **Render message trước, load WebGL/interactive piece sau.** Hero paint instantly; 3D/animation hydrate sau khi page usable. Nếu ngược lại, buyer bounce trước khi thấy value proposition.

```typescript
// app/(marketing)/page.tsx — static marketing route với ISR
export const revalidate = 3600; // ISR: content fresh mỗi giờ, nhưng serve instant

export default async function Home() {
  const content = await getCachedMarketingContent(); // cached CMS read, no per-request DB hit
  return <MarketingHome content={content} />;
}
```

```typescript
// Heavy interactive pieces load SAU khi page usable
import dynamic from 'next/dynamic';

// ✅ Product tour chỉ load sau first paint — không block message
const ProductTour = dynamic(
  () => import('@/modules/ProductTour'),
  {
    ssr: false,          // không server-render — tránh hydration mismatch cho WebGL
    loading: () => <TourSkeleton />, // placeholder giữ layout trong lúc chunk tải
  }
);

// ✅ Hero WebGL — cùng pattern
const HeroScene = dynamic(
  () => import('@/modules/HeroScene'),
  {
    ssr: false,
    loading: () => <div className="hero-placeholder" aria-hidden />,
  }
);
```

**Khi nào dùng `ssr: false`:**
- WebGL/Three.js/R3F components (không thể SSR)
- Heavy interactive demos, product tours, dashboards
- Any component dùng `window`, `document`, `AudioContext` trực tiếp
- Charting libraries không support SSR

**Khi nào KHÔNG dùng `ssr: false`:**
- Content quan trọng cho SEO (headings, copy, metadata)
- LCP element (hero image, hero text)
- Navigation, footer — user expects instant

---

## 3. Timestamp-Gated Launch — Teaser/Reveal Pattern

> [!NOTE]
> **Cho product launch microsites:** Server-side timestamp gate = reveal instant khi embargo lift, không cần deploy, không có early leak từ client-side JS.

```typescript
// lib/launch.ts — server-side gate
const LAUNCH_UTC = Date.UTC(2026, 6, 10, 15, 0); // 3PM UTC July 10

export function isLive(): boolean {
  return Date.now() >= LAUNCH_UTC;
}

// app/page.tsx — server component switch, no client flicker, no early leak
export default async function LaunchPage() {
  // isLive() evaluated server-side mỗi request — client không thể trick nó
  return isLive() ? <RevealSection /> : <TeaserSection />;
}
```

**3 rules cho launch architecture:**

| Rule | Lý do |
|---|---|
| Gate server-side, không client-side | Client JS có thể bị inspect/bypass. Server = single source of truth. |
| ISR revalidate ngắn trong giờ trước launch | `revalidate: 60` → switch visible trong 1 phút khi isLive() flip. |
| WebGL lazy-init — first paint không chờ 3D | Hero text/countdown paint instant; heavy WebGL hydrate sau. |

```typescript
// ISR revalidation: rút ngắn trong giờ launch, bình thường dùng 3600
export const revalidate = process.env.PRE_LAUNCH === 'true' ? 60 : 3600;
```

---

## 4. WebGL "Worth-It" Decision Framework

> [!IMPORTANT]
> Source: Đây là framework để quyết định **KHI NÀO** dùng WebGL — quan trọng không kém kỹ thuật build WebGL.

**WebGL IS worth it when:**

```
✅ Brand launch cần cảm giác singular (un-templatable)
✅ 3D-native product: product LÀ story (furniture, watch, car, architecture)
✅ Agency identity cần nhìn như nobody else
✅ Campaign microsite: được build để share và remember
✅ Art-direction đòi hỏi effect mà HTML/CSS không thể làm được
```

**WebGL IS NOT worth it when:**

```
❌ Fast informational site (docs, blog, content-heavy)
❌ Lean conversion funnel (mỗi ms load quan trọng hơn spectacle)
❌ SaaS marketing site → chỉ 1 signature moment, không full 3D world
❌ WebGL là decoration, không phải story hoặc navigation
```

**SaaS specific rule — "Scalpel, not a hammer":**

> Full 3D world thường fight SaaS message. Điều work là **1 signature moment**: subtle animated data-mesh trong hero, shader-driven gradient react cursor. Anything heavier → lazy-loaded và pixel-ratio capped. WebGL phục vụ memorability, không phải show-off.

**3 câu hỏi để quyết định:**
1. WebGL có phải là story hoặc navigation, hay chỉ là decoration? → Chỉ build nếu là story/nav.
2. Nó có thể degrade gracefully không? → Nếu không có fallback, mất 1/3 audience.
3. Site có thể giữ 60fps trên mid-range Android với effect này không? → Nếu không thể, cut.

---

## 5. SPA Page Transition + Redirect Bug

> [!CAUTION]
> **Đây là bug production cực kỳ khó trace:** Site hoạt động hoàn hảo khi load trực tiếp (direct URL), nhưng blank hoặc white flash khi navigate qua `<Link>`. Nhiều developer patch animation rồi thấy bug quay lại sau 1 tuần với mặt nạ khác.

### Root Cause: App Router commit redirect stub trước

**Cơ chế:**
- Direct load: Server resolve redirect → browser paint đúng page ngay lần đầu → React mount 1 lần duy nhất tại URL đích.
- Client-side navigation: App Router **commit redirecting route trước** (empty stub page với header/footer, không có content) → commit xong mới navigate tiếp đến URL đích.

→ Không phải 1 navigation. Là **2 navigations**. Redirecting route là real page được commit ở giữa.

### Debug Recipe — Đừng đoán, Đo đạc

```javascript
// Paste vào console, click link, đọc table kết quả
const rows = [];
let raf = 0;

const sample = () => {
  const overlay = document.querySelector('[data-transition-overlay]');
  rows.push({
    t: Math.round(performance.now()),
    path: location.pathname,
    overlay: overlay ? getComputedStyle(overlay).opacity : 'n/a',
    height: document.body.scrollHeight, // ← cột quan trọng nhất
  });
  raf = requestAnimationFrame(sample);
};
sample();

// Sau khi click link và trang settle:
// cancelAnimationFrame(raf); console.table(rows);
```

**Cách đọc kết quả:**
- Nếu có dòng `height: 517` kẹp giữa 2 dòng `height: 4000+` → đó là redirect stub
- `517px` = header + footer, không có content = page rỗng được commit ở giữa
- Overlay opacity vượt 0 tại frame nào → đó là lúc reveal trigger, so với path thay đổi ở frame nào

### Fix 1 — Xóa redirect (FIX THỰC SỰ, không phải patch)

**Nguyên tắc vàng:** `redirect()` trong App Router KHÔNG được dùng cho URL là click target trong SPA. Đây là đúng cho: auth gates, locale bounces, permanently moved URLs. **Sai** cho "trang index show content của child đầu tiên."

```typescript
// ❌ TRƯỚC — /guides/page.tsx là redirect target, tạo empty stub
import { redirect } from 'next/navigation';
import { getFirstGuideSlug } from '@/lib/guides';

export default async function GuidesIndex() {
  redirect(`/guides/${await getFirstGuideSlug()}`); // ← extra hop
}
```

```typescript
// ✅ SAU — render destination INLINE tại URL đó, canonical trỏ đến slug thực
import type { Metadata } from 'next';
import { getFirstGuideSlug, getGuide } from '@/lib/guides';
import { GuideView } from '@/modules/guides/GuideView';

export async function generateMetadata(): Promise<Metadata> {
  const slug = await getFirstGuideSlug();
  return { alternates: { canonical: `/guides/${slug}` } }; // SEO: avoid duplicate content
}

export default async function GuidesIndex() {
  const slug = await getFirstGuideSlug();
  return <GuideView guide={await getGuide(slug)} />; // cùng component với [slug]/page.tsx
}
```

### Fix 2 — Gate reveal trên route commit + paint (không phải timer)

```typescript
// ✅ Gate trên usePathname() — chỉ thay đổi khi App Router đã commit destination
const pathName = usePathname();

useEffect(() => {
  // Chỉ hành động khi đang trong transition
  if (usePageStore.getState().pageStatus !== PageState.LEAVE) return;

  const reveal = () => revealRef.current?.();
  // 2 rAFs = destination đã layout và paint dưới overlay
  const frame = requestAnimationFrame(() => requestAnimationFrame(reveal));

  // FAILSAFE BẮT BUỘC: overlay stuck = white page vĩnh viễn.
  // Reveal muộn (ugly 1 frame) infinitely better hơn reveal không bao giờ xảy ra.
  const failsafe = window.setTimeout(reveal, 2000);

  return () => {
    cancelAnimationFrame(frame);
    clearTimeout(failsafe);
  };
}, [pathName]); // dependency = pathname commit
```

**2 rules bắt buộc:**
1. `reveal()` phải **idempotent** — failsafe và rAF path cả hai có thể fire, call thứ 2 phải là no-op.
2. **Luôn ship failsafe timeout** — reveal muộn tệ hơn reveal đúng lúc, nhưng vẫn tốt hơn infinite white page.

### Fix 3 — Reveal on mount nếu page đã settle

```typescript
// Cho components mount sau event (async chunks, suspense boundaries)
useEffect(() => {
  const status = usePageStore.getState().pageStatus;
  // Đọc current value khi mount — không chỉ subscribe future changes
  if (status === PageState.PLAY || status === PageState.ENTER) ctxAnimation();
}, []);
```

**Lý do cần Fix 3:** Component mount sau one-shot `pagePlay` event → subscribe chỉ catch future transitions → miss event → element bị stuck tại `visibility: hidden`.

### Thứ tự ưu tiên Fix

| Fix | Blank page | White flash | Bền vững |
|---|---|---|---|
| Patch từng `<Link>` trỏ đến child slug | ✅ | ✅ | ❌ whack-a-mole |
| Fix 3 only (reveal-on-mount) | ✅ | ❌ | ⚠️ symptom patch |
| Fix 2 only (pathname gate) | ✅ | ✅ | ✅ |
| **Fix 1 + 2 + 3** | ✅ | ✅ | ✅ **durable** |

> **Bài học:** Fix 3 làm blank page biến mất, trông như đã xong. Nhưng redirect hop vẫn còn. 1 tuần sau, same root cause quay lại dưới dạng white flash. Fix route, không phải animation.

---

## Bảng Chống Ngụy Biện

| Cớ của AI | Phản biện bắt buộc |
|---|---|
| "Tôi sẽ patch `<Link>` để trỏ thẳng đến child slug thay vì index route." | **WHACK-A-MOLE.** Nav, hero CTA, footer, breadcrumb — tất cả cùng trỏ vào URL đó. Patch link-by-link = người tiếp theo thêm link sẽ re-open bug. Fix route, không fix link. |
| "Chỉ cần dùng timer để reveal wait, không cần phức tạp." | **ĐÃ ĐƯỢC THỬ VÀ THẤT BẠI.** Timer chỉ correlate với destination arriving. Trên slow network hoặc cold cache, fire sớm → reveal stub. Gate trên `usePathname()` + 2 rAFs. |
| "fetch() works fine, tôi không cần unstable_cache." | **SẼ SURPRISE Ở BILLING.** Next.js 15: fetch không cache mặc định. Mỗi visit = live DB call. Production bill sẽ chứng minh điều này. |
| "Tôi thấy blank page — chắc animation bug, tôi sẽ fix timing." | **ĐỌC SYMPTOM SAI.** Blank page chỉ xảy ra qua in-app nav, không xảy ra direct load = lifecycle bug, không phải animation bug. Đo navigation trước khi đoán animation. |

---

## 🤖 Agent OS Anti-Rationalization

> [!CAUTION]
> **Tác tử AI ĐỌC KỸ TRƯỚC KHI CODE NEXT.JS:**
>
> 1. **Cấm để fetch() không cache:** Mọi CMS fetch trong Next.js 15+ PHẢI có `unstable_cache` hoặc `{ next: { tags: [...] } }` hoặc `{ next: { revalidate: N } }`. Không cache = bill surprise cho client.
> 2. **Cấm dùng redirect() cho navigable URLs:** Nếu URL có thể bị click từ bên trong app, PHẢI render content inline. `redirect()` chỉ cho: auth gates, locale bounces, moved URLs.
> 3. **Cấm timer-based reveal:** Transition reveal PHẢI gate trên `usePathname()` + `requestAnimationFrame(() => requestAnimationFrame(...))`. Timer correlates nhưng không guarantees paint.
> 4. **Cấm chỉ Subscribe future events:** Components phải đọc current store state khi mount. Chỉ subscribe future = miss event đã fire = stuck `visibility: hidden`.
> 5. **Cấm mix time+tag revalidation:** Nếu fetch có `tags`, `revalidate` bị ignore. Chọn một model per fetch — không phải cả hai.
> 6. **Cấm heavy components block first paint:** Heavy WebGL/interactive PHẢI dùng `next/dynamic` với `ssr: false`. Không bao giờ import static trực tiếp — sẽ block first paint và crash SSR.
> 7. **Cấm full 3D world trên SaaS site:** WebGL trên SaaS = 1 signature moment, lazy-loaded, pixel-ratio capped. Full 3D world fight message và slow down conversion. Không exceptions.

