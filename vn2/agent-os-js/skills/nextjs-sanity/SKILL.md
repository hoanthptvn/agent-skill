---
name: nextjs-sanity
description: Pattern tích hợp Sanity CMS vào Next.js App Router theo chuẩn production. Bao gồm: client setup, page-builder schema, GROQ one-spread-projection, image flattening, SEO centralisation, tag-based revalidation webhook, và design-first fallback pattern. Kích hoạt khi user đề cập đến Sanity, GROQ, Portable Text, CMS integration, unstable_cache với Sanity, hoặc revalidateTag.
---

# Next.js + Sanity CMS — Production Integration Patterns

## Nguồn kiến thức

Source: Pattern này được distill từ production failures và real client projects, không phải từ happy-path demo.

---

## 1. Client Setup — Những Gotcha Thực Tế

```typescript
// src/lib/sanity/client.ts
import { createClient } from "next-sanity";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || "production";

// ⚠️ PHẢI trim và treat empty string như missing.
// NEXT_PUBLIC_SANITY_DATASET="" trên Vercel pass undefined check nhưng
// Sanity reject nó như một dataset name invalid → build die trước khi fetch nào chạy.
if (!projectId) throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID");

export const client = createClient({
  projectId,
  dataset,
  apiVersion: "2025-02-19", // ← PIN date cụ thể. KHÔNG ĐƯỢC dùng "latest"
  useCdn: true,             // edge-cached API → fast reads
});
```

**Gotcha table:**

| Gotcha | Fix |
|---|---|
| `createClient` throws at build trên blank env var | Trim env vars; treat empty/whitespace như missing |
| `apiVersion: "latest"` | Pin date string — GROQ behaviour thay đổi silently theo latest |
| `useCdn: true` nhưng publish slow | Tag fetches + webhook → `revalidateTag` |

---

## 2. Page-Builder Schema

```typescript
// schema/page.ts — page document với sections array
import { defineType, defineArrayMember } from "sanity";

export default defineType({
  name: "page",
  type: "document",
  fields: [
    { name: "title", type: "string" },
    { name: "slug", type: "slug", options: { source: "title" } },
    {
      name: "sections",
      type: "array",
      of: [
        defineArrayMember({ type: "heroSection" }),
        defineArrayMember({ type: "richTextSection" }),
        defineArrayMember({ type: "gallerySection" }),
      ],
    },
    { name: "seo", type: "seo" }, // shared seo object
  ],
});
```

```typescript
// ModuleRenderer — switch trên _type, KHÔNG throw khi unknown
function ModuleRenderer({ sections }: { sections: SectionData[] }) {
  return sections.map((s) => {
    switch (s._type) {
      case "heroSection":    return <Hero key={s._key} section={s} />;
      case "richTextSection": return <RichText key={s._key} section={s} />;
      case "gallerySection": return <Gallery key={s._key} section={s} />;
      default:
        // Log dev warning, render null — KHÔNG throw
        // Một stale document không được phép take down cả page
        if (process.env.NODE_ENV !== "production")
          console.warn(`Unknown section _type: ${(s as { _type: string })._type}`);
        return null;
    }
  });
}
```

---

## 3. GROQ One Spread Projection — Pattern Quan Trọng Nhất

> [!IMPORTANT]
> Đây là pattern phân biệt junior và senior Sanity dev. Sai ở đây = query sprawl, phải edit GROQ mỗi lần thêm section type mới.

**Anti-pattern (query sprawl):**

```groq
// ❌ SAI — projection per section type, grows với mọi section, drifts out of sync
sections[]{
  _type == "hero" => {
    heading, backgroundImage{ asset->{ url } }, cta{ label, url }
  },
  _type == "gallery" => {
    items[]{ caption, image{ asset->{ url } } }
  },
  // ... thêm section type = thêm branch = mãi mãi mở rộng
}
```

**Pattern đúng — One Spread Projection:**

```groq
// ✅ ĐÚNG — unified field names trên MỌI section type → 1 query cho tất cả
// heading, label, cta, items[], cover, visual = standard field names qua mọi section schema
*[_type == "page" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  seo,
  sections[]{
    ...,         // ← plain-value fields (heading, label, body, etc.) ride spread for free
    _key,
    _type,
    // Chỉ project fields cần GROQ resolution (assets, links, references):
    "coverUrl": cover.asset->url,
    "coverAlt": cover.caption,
    items[]{
      ...,
      "iconUrl": icon.asset->url,
      cta{
        label,
        newTab,
        "href": coalesce(url, "/" + page->slug.current) // internal link → slug path
      }
    }
  }
}
```

**Rule:** Thêm section mới với cùng field names → render qua existing query, **zero GROQ edits**. Đây là cái tạo ra sự khác biệt giữa CMS có thể extend trong vài phút và CMS fight bạn mỗi section.

---

## 4. Images — Flatten trong GROQ, Không Bao Giờ Pass Sanity Image Object

> [!WARNING]
> Components KHÔNG được nhận Sanity image object. Resolve URL, alt, filename trong projection và hand component plain strings. Điều này loại bỏ `urlFor()` + hotspot + `remotePatterns` plumbing phải thread khắp nơi.

```groq
// Trong GROQ projection — flatten tại đây
"coverUrl": cover.asset->url,
"coverAlt": cover.caption,
"coverFilename": cover.asset->originalFilename
```

```typescript
// Alt text fallback chain — image không bao giờ un-alt'd
// "hero-dark-01.png" → "hero dark 01"
const altFromSrc = (src: string) =>
  (src.split("/").pop() ?? src)
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[-_]+/g, " ")
    .trim();

// Priority: editor caption → filename → URL basename
const alt = section.coverAlt || altFromSrc(section.coverFilename || section.coverUrl);
```

```typescript
// Component nhận plain strings — không cần urlFor, không cần @sanity/image-url
<Image
  src={`${section.coverUrl}?w=1200&auto=format`} // Sanity CDN transforms via query params
  alt={alt}
  width={1200}
  height={800}
  priority={isAboveFold}
/>
```

**Khi nào dùng `@sanity/image-url`:** Chỉ khi cần hotspot/crop-aware art direction. Cho hầu hết layouts, plain URL + CDN params là đủ.

---

## 5. SEO Metadata — Centralise, Đừng Inline Per Route

```typescript
// lib/seo.ts — một builder, merge page-level over site defaults
import { cache } from "react";
import { client } from "./sanity/client";

// cache() = React dedup — generateMetadata, layout, và page SHARE một request per render
export const getPageBySlug = cache(async (slug: string) => {
  try {
    return await client.fetch(pageBySlugQuery, { slug });
  } catch {
    return null; // Design-first: render fallbacks khi CMS empty/unreachable
  }
});

export async function generateMetadata({ params }): Promise<Metadata> {
  const page = await getPageBySlug((await params).slug);
  return {
    title: page?.seo?.metaTitle ?? page?.title ?? siteDefaults.title,
    description: page?.seo?.metaDescription ?? siteDefaults.description,
    openGraph: {
      images: page?.seo?.ogImageUrl ? [page.seo.ogImageUrl] : [siteDefaults.ogImage],
    },
  };
}
```

**Rule:** Mọi slug-addressed document type (post, project, page) PHẢI ship cùng shared `seo` object để editors có per-entry title/OG/canonical/noindex control mặc định.

---

## 6. Tag-Based Revalidation — Webhook Setup

```typescript
// Bước 1: Tag mọi fetch với document types nó đọc
const page = await client.fetch(pageBySlugQuery, { slug }, {
  next: { tags: ["page", `page:${slug}`] },
});
```

```typescript
// Bước 2: Webhook route handler — app/api/revalidate/route.ts
import { revalidateTag } from "next/cache";
import { parseBody } from "next-sanity/webhook";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { isValidSignature, body } = await parseBody<{
    _type: string;
    slug?: { current?: string };
  }>(req, process.env.SANITY_REVALIDATE_SECRET);

  if (!isValidSignature) return new NextResponse("Invalid signature", { status: 401 });
  if (!body?._type) return new NextResponse("Bad payload", { status: 400 });

  revalidateTag(body._type);                                    // bust ALL pages of this type
  if (body.slug?.current) revalidateTag(`${body._type}:${body.slug.current}`); // bust specific page

  return NextResponse.json({ revalidated: true, tag: body._type });
}
```

```
Bước 3: Sanity dashboard → API → Webhooks → Add webhook:
- URL: https://your-site.com/api/revalidate
- Secret: SANITY_REVALIDATE_SECRET
- GROQ filter: *
- Projection: { _type, slug }
```

**Khi nào cần webhook:** Client cần instant publish. Nếu 1 phút staleness là ổn → skip webhook, dùng `revalidate: 60` trên layout/pages.

---

## 7. Design-First: Site Render Trước Khi Dataset Tồn Tại

> [!IMPORTANT]
> **Agency reality:** Site phải ship pixel-perfect với empty dataset. Content được wired sau. Site KHÔNG ĐƯỢC `notFound()` hay blank-render vì CMS chưa có data.

**2 rules làm site robust:**

```typescript
// Rule 1: Fetchers swallow errors, return null/[]
export const getHomepage = cache(async () => {
  try {
    return await client.fetch(homepageQuery);
  } catch {
    return null; // ← không throw, không crash build
  }
});

// generateStaticParams không được fail nếu CMS empty
export async function generateStaticParams() {
  try {
    const slugs = await client.fetch(`*[_type == "page"].slug.current`);
    return (slugs || []).map((slug: string) => ({ slug }));
  } catch {
    return []; // ← empty = không pre-render gì, nhưng build thành công
  }
}
```

```typescript
// Rule 2: Mọi section nhận optional prop + DEFAULT_* fallbacks per field
const DEFAULT_HEADING = "A consequence-free environment.";
const DEFAULT_ITEMS = [/* hardcoded design content */];

export default function Hero({ section }: { section?: HeroSectionData }) {
  const heading = section?.heading || DEFAULT_HEADING; // ← không bao giờ render undefined
  const items = section?.items?.length ? section.items : DEFAULT_ITEMS;
  // Renders đầy đủ với zero CMS content
}
```

**Rule quan trọng:** Reserve `notFound()` cho genuinely missing slug trên detail route. KHÔNG dùng cho "CMS chưa set up". Home route render hardcoded module composition cho đến khi page với slug `home` tồn tại.

---

## Gotchas Summary

| Gotcha | Fix |
|---|---|
| `createClient` throws trên blank env var | Trim env vars; treat empty/whitespace như missing |
| GROQ projections sprawl per section type | Unified field names + one spread projection `...` |
| `urlFor()` + hotspot + `remotePatterns` ở khắp nơi | Flatten url/caption/filename trong GROQ; ship strings |
| Blank page vì dataset empty | Optional `section?` props + per-field DEFAULT_* fallbacks |
| Publish slow với `useCdn: true` | Tag fetches + webhook → `revalidateTag` |
| `revalidate` bị ignore trên tagged fetch | Time-based và tag-based không thể mix — chọn một |
| `apiVersion: "latest"` | Pin date string để GROQ behaviour stable |
| `notFound()` vì CMS chưa có data | Swallow errors, return null, dùng fallbacks |

---

## 🤖 Agent OS Anti-Rationalization

> [!CAUTION]
> **Tác tử AI ĐỌC KỸ TRƯỚC KHI VIẾT SANITY CODE:**
>
> 1. **Cấm query sprawl:** Không được viết `_type == "hero" => {...}, _type == "gallery" => {...}` branches trong GROQ. PHẢI dùng unified field names + one spread projection `...`. Nếu query có hơn 2 type-specific branches → refactor ngay.
> 2. **Cấm pass Sanity image object vào component:** Mọi image PHẢI được flatten trong GROQ projection (`cover.asset->url`, `cover.caption`). Component chỉ nhận plain strings.
> 3. **Cấm `apiVersion: "latest"`:** PHẢI pin một date string. GROQ behaviour thay đổi theo "latest" → silent bugs trong production.
> 4. **Cấm throw trong fetchers:** Mọi Sanity fetch PHẢI có try/catch trả về null/[]. Design-first = site render khi CMS empty, không crash khi empty.
> 5. **Cấm `notFound()` vì CMS empty:** `notFound()` chỉ cho genuinely missing slug trên detail routes. "CMS chưa set up" không phải lý do để `notFound()`.
> 6. **Cấm mix time+tag revalidation:** Nếu fetch có tags, `revalidate` bị ignored. Chọn một model — không cả hai.
