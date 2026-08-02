---
name: nextjs-fsd
description: Feature-Sliced Design (FSD) cho Next.js App Router brand/marketing sites. Tổ chức code theo business domain (features, entities) thay vì theo technical type (components, utils). Includes: 6 layers của FSD, dependency rules (top-down only), áp dụng cho animation-rich sites với GSAP sections, và CUBE CSS methodology cho styling. Kích hoạt khi user hỏi về cách tổ chức folder Next.js, project structure, feature folders, hoặc CSS architecture.
---

## Tổng quan (Overview)
Hướng dẫn kiến trúc cho các trang web thương hiệu/marketing sử dụng Next.js App Router kết hợp với Feature-Sliced Design (FSD) và CUBE CSS. Thay vì tổ chức code theo loại kỹ thuật (components, hooks, utils), hệ thống này tổ chức code theo nghiệp vụ (features, entities). Điều này đảm bảo logic chuyển động (animation) dễ dàng mở rộng, sơ đồ phụ thuộc (dependency graphs) có thể dự đoán được, và việc styling cho các trang WebGL/GSAP phức tạp dễ bảo trì hơn.

## Khi nào sử dụng (When to Use)
- Bạn đang khởi tạo một dự án Next.js mới.
- Bạn đang cấu trúc lại (refactoring) một trang Next.js đã trở nên quá khó bảo trì (ví dụ: các luồng import rối rắm chồng chéo, logic animation nằm rải rác khắp nơi).
- Bạn được yêu cầu tạo một tính năng hoặc component mới trong một dự án Next.js App Router.
- Dự án có rất nhiều hiệu ứng chuyển động nặng và đòi hỏi phải phân định quyền sở hữu rõ ràng đối với các GSAP ScrollTriggers.

**Tuyệt đối KHÔNG sử dụng khi:** Đừng dùng kiến trúc này cho các dự án HTML/JS Vanilla thuần túy. Hãy sử dụng kỹ năng `vanilla-module-pattern` thay thế.

## Process

### 1. Feature-Sliced Design (FSD) Layers

> [!IMPORTANT]
> **FSD thay thế cách tổ chức theo technical type** (`components/`, `utils/`, `hooks/`). Thay vào đó: tổ chức theo **business domain**. Kết quả: khi thêm feature mới, bạn biết chính xác file nào cần thêm/sửa — không đoán.

### 6 Layers (Top → Bottom, dependency chỉ đi xuống)

```
app/          ← Global infrastructure (providers, routing, global styles)
pages/        ← Route-level compositions (Next.js app/ directory)
widgets/      ← Complex UI blocks combining features + entities
features/     ← User-facing interactions (add to cart, submit form, play video)
entities/     ← Domain models (Project, Team, Service, Case Study)
shared/       ← Reusable primitives (UI components, hooks, lib utilities)
```

**Dependency Rule (cứng):** Layer chỉ import từ layer BÊN DƯỚI mình.

```
app     → pages ✅ | widgets ✅ | features ✅ | entities ✅ | shared ✅
pages   → widgets ✅ | features ✅ | entities ✅ | shared ✅
widgets → features ✅ | entities ✅ | shared ✅
features → entities ✅ | shared ✅
entities → shared ✅
shared  → (chỉ external packages) ✅

❌ entities → features (import ngược chiều)
❌ shared → features (import ngược chiều)
❌ features → widgets (import ngược chiều)
```

### Áp dụng cho Next.js Brand Site (Animation-Rich)

```
my-brand-site/
├── app/                         ← Next.js App Router (layer: app)
│   ├── layout.tsx               ← Global providers: Lenis, GSAP context
│   ├── page.tsx                 ← Home page composition
│   ├── (projects)/
│   │   └── [slug]/page.tsx
│   └── globals.css
│
├── widgets/                     ← Complex sections (layer: widgets)
│   ├── hero/
│   │   ├── HeroSection.tsx      ← Hero layout component
│   │   ├── HeroScene.tsx        ← WebGL canvas (next/dynamic, ssr:false)
│   │   └── hero.module.css
│   ├── project-grid/
│   │   ├── ProjectGrid.tsx      ← Grid + GSAP stagger reveal
│   │   └── ProjectCard.tsx
│   └── services-scroll/
│       └── ServicesScroll.tsx   ← Horizontal scroll section
│
├── features/                    ← User interactions (layer: features)
│   ├── contact-form/
│   │   ├── ContactForm.tsx
│   │   └── useContactSubmit.ts
│   ├── project-filter/
│   │   ├── ProjectFilter.tsx
│   │   └── useProjectFilter.ts
│   └── cursor/
│       ├── CustomCursor.tsx
│       └── useCursor.ts
│
├── entities/                    ← Domain models (layer: entities)
│   ├── project/
│   │   ├── types.ts             ← Project type (title, slug, heroUrl, tags...)
│   │   ├── api.ts               ← fetchProject, fetchProjects (Sanity GROQ)
│   │   └── ProjectCard.tsx      ← Pure display component
│   ├── service/
│   │   ├── types.ts
│   │   └── api.ts
│   └── team/
│       └── types.ts
│
└── shared/                      ← Reusable primitives (layer: shared)
    ├── ui/
    │   ├── Button.tsx
    │   ├── Heading.tsx
    │   └── RevealText.tsx       ← GSAP SplitText wrapper
    ├── lib/
    │   ├── gsap.ts              ← GSAP + plugins registration (singleton)
    │   ├── lenis.ts             ← Lenis setup
    │   └── sanity.ts            ← Sanity client
    ├── hooks/
    │   ├── useReducedMotion.ts
    │   └── useInView.ts
    └── config/
        └── site.ts              ← DEFAULT_* constants, site metadata
```

### FSD vs Technical Folders

```
❌ Technical (old) — "where is the add-to-cart form?"
src/
├── components/
│   ├── Button.tsx
│   ├── ContactForm.tsx     ← ở đây? hoặc containers/?
│   └── ProjectCard.tsx
├── hooks/
│   ├── useContactSubmit.ts ← cách xa ContactForm
│   └── useProjectFilter.ts
└── utils/
    └── gsap.ts

✅ FSD (new) — "add-to-cart là feature → features/contact-form/"
features/
└── contact-form/
    ├── ContactForm.tsx       ← UI
    ├── useContactSubmit.ts   ← logic gắn liền với UI
    └── index.ts              ← public API: chỉ export những gì widget cần
```

---

### 2. Animation Architecture trong FSD

> [!NOTE]
> **FSD + Animation:** GSAP logic nằm trong widget hoặc feature, không scattered khắp nơi. Widgets own scroll timelines; features own interaction animations.

```typescript
// widgets/hero/HeroSection.tsx — Widget owns its animation
'use client';
import { useGSAP } from '@gsap/react';
import { useRef } from 'react';
import gsap from '@/shared/lib/gsap'; // singleton instance
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    // Widget OWNS its ScrollTrigger — scoped to containerRef
    gsap.from('.hero__title span', {
      y: 80,
      opacity: 0,
      stagger: 0.05,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
      },
    });
  }, { scope: containerRef }); // cleanup automatic on unmount

  return <section ref={containerRef} className="hero">...</section>;
}

// entities/project/ProjectCard.tsx — Entity chỉ display, không animate
// Animation là responsibility của widget dùng nó
export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="project-card">
      <img src={project.heroUrl} alt={project.title} />
      <h3>{project.title}</h3>
    </article>
  );
}

// widgets/project-grid/ProjectGrid.tsx — Widget animate entities
export function ProjectGrid({ projects }: { projects: Project[] }) {
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from('.project-card', {
      y: 60,
      opacity: 0,
      stagger: 0.1,
      scrollTrigger: { trigger: gridRef.current, start: 'top 80%' },
    });
  }, { scope: gridRef });

  return (
    <div ref={gridRef} className="project-grid">
      {projects.map(p => <ProjectCard key={p.slug} project={p} />)}
    </div>
  );
}
```

**Rule: Ai animate ai?**

```
shared/ui/RevealText  → tự animate mình (reusable reveal component)
entities/ProjectCard  → KHÔNG tự animate (pure display, stateless)
widgets/ProjectGrid   → animate ProjectCard children
features/cursor       → animate cursor (independent, global)
app/layout            → setup Lenis + GSAP context (global, once)
```

---

### 3. CUBE CSS Methodology

**CUBE = Composition, Utility, Block, Exception**

> [!NOTE]
> CUBE CSS là CSS methodology phù hợp nhất cho animation-rich Next.js sites. Nó **làm việc với cascade** của CSS thay vì chống lại nó, và pair tốt với CSS Custom Properties (design tokens).

```css
/* globals.css — Design tokens (Composition layer) */
:root {
  /* Palette */
  --color-bg:       #0a0a0a;
  --color-fg:       #f5f5f0;
  --color-accent:   #d4af37;

  /* Typography */
  --font-display:   'Editorial New', serif;
  --font-body:      'Inter', sans-serif;

  /* Spacing scale */
  --space-xs: 0.5rem;
  --space-sm: 1rem;
  --space-md: 2rem;
  --space-lg: 4rem;
  --space-xl: 8rem;

  /* Animation tokens — dùng trong cả CSS và GSAP */
  --ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);
  --duration-slow: 1.2s;
  --duration-fast: 0.4s;
}

/* CUBE — C: Composition (layout flow) */
.flow > * + * {
  margin-top: var(--space-md);
}

.cluster {          /* horizontal, auto-wrap */
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.grid-auto {        /* auto responsive grid */
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr));
  gap: var(--space-md);
}

/* CUBE — U: Utility (single-purpose classes) */
.text-display {
  font-family: var(--font-display);
  font-size: clamp(3rem, 8vw, 7rem);
  line-height: 0.9;
}

.visually-hidden {
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}

/* CUBE — B: Block (component-level styles) */
.hero {
  position: relative;
  min-height: 100svh;
  display: grid;
  place-items: center;
}

.project-card {
  position: relative;
  overflow: hidden;
  aspect-ratio: 4/3;
}

.project-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--duration-fast) var(--ease-out-expo);
}

/* CUBE — E: Exception (state/variant overrides) */
.project-card[data-featured="true"] {
  grid-column: span 2;
}

.project-card:hover .project-card__image {
  transform: scale(1.05);
}

/* Animation: visibility:hidden thay vì display:none cho GSAP */
.js-reveal {
  visibility: hidden; /* GSAP sẽ set visible sau khi animate */
}
```

**CUBE pair với GSAP:**

```typescript
// Design token từ CSS → GSAP (single source of truth)
const style = getComputedStyle(document.documentElement);
const easeOutExpo = style.getPropertyValue('--ease-out-expo').trim();
// → "cubic-bezier(0.19, 1, 0.22, 1)"

gsap.to('.hero__title', {
  y: 0,
  opacity: 1,
  duration: parseFloat(style.getPropertyValue('--duration-slow')),
  ease: 'expo.out', // GSAP's equivalent — dùng preset, không cần string
});
```

---

## FSD Dependency Rules — Quick Reference

```
✅ ĐÚNG:
  widgets/hero → entities/project (widget dùng entity display)
  features/cursor → shared/hooks (feature dùng shared utility)
  entities/project → shared/lib/sanity (entity fetch data)
  pages/home → widgets/hero + widgets/project-grid (page compose widgets)

❌ SAI:
  entities/project → features/contact-form (entity không dùng feature)
  shared/ui → widgets/hero (shared không biết widgets tồn tại)
  features/cursor → widgets/hero (feature không dùng widget)
```

---

## Các Lời Biện Hộ Phổ Biến (Common Rationalizations)
| Lời Biện Hộ | Thực Tế |
|---|---|
| "Tôi cứ vứt cái nút button này vào thư mục `features/` đi, vì nó cũng là một tính năng mà." | Một component UI cái nút đơn giản, không có logic nghiệp vụ thì phải thuộc về thư mục `shared/ui/`. Thư mục `features/` chỉ chứa các tương tác mang tính nghiệp vụ đặc thù (ví dụ: `contact-form`). |
| "Import trực tiếp entity vào trong shared button component cho nhanh." | Bạn vừa mới tạo ra một quả bom nổ chậm về lỗi vòng lặp phụ thuộc (circular dependency). Lớp `shared` TUYỆT ĐỐI KHÔNG ĐƯỢC import ngược từ `entities` hay `features`. Hãy truyền dữ liệu thông qua props thay thế. |
| "Tôi sẽ nhét thẳng animation GSAP vào bên trong ruột của entity `ProjectCard`." | Entities bắt buộc phải là các component hiển thị thuần túy, không có state (stateless). Chính cái Widget (`ProjectGrid`) mới là kẻ chịu trách nhiệm tạo animation cho các component con của nó. Code animation dính chặt (tightly coupled) sẽ phá hủy hoàn toàn khả năng tái sử dụng. |
| "Tôi chẳng cần xài ba cái biến CSS Custom Properties làm gì, hardcode mẹ luôn `duration: 1.2` vào GSAP cho gọn." | Điều này phá vỡ nguyên tắc nguồn chân lý duy nhất (single source of truth). Nếu designer muốn đổi tốc độ animation trên toàn bộ site, cục code hardcode của bạn sẽ không chịu tự update. Bắt buộc phải đọc cấu hình từ CSS tokens. |
| "Tôi sẽ giấu cái phần tử này đi bằng lệnh `display: none` để lát nữa GSAP từ từ fade nó lên." | `display: none` sẽ phá hủy khả năng tiếp cận (accessibility) và cào nát SEO. Bắt buộc dùng `visibility: hidden` (thông qua một class ví dụ như `.js-reveal`) và để thuộc tính `autoAlpha` của GSAP tự động lo phần còn lại. |

## Dấu hiệu Vi phạm (Red Flags)
- Các thư mục mang tính kỹ thuật được ném ngay ngoài thư mục gốc (`components/`, `utils/`, `hooks/`) thay vì chia lớp theo chuẩn FSD.
- Xuất hiện các luồng import chảy ngược lên trên (ví dụ, thư mục `entities/` dám import đồ từ thư mục `features/`).
- Có nhiều dòng gọi `gsap.registerPlugin()` vung vãi rải rác khắp các components.
- Entities lại tự sở hữu những timeline ScrollTrigger phức tạp của riêng nó.
- Tốc độ (durations) hoặc gia tốc (easings) animation bị hardcode cứng trong JS thay vì rút ra từ các CSS tokens.

## Xác minh (Verification)
- [ ] Code phải được phân bổ đúng vào các lớp `app`, `pages`, `widgets`, `features`, `entities`, và `shared`.
- [ ] KHÔNG TỒN TẠI bất kỳ import chảy ngược nào (quy tắc phụ thuộc dependency rule phải được tuân thủ nghiêm ngặt).
- [ ] Các GSAP plugins chỉ được đăng ký (registered) đúng một lần duy nhất bên trong một singleton `shared/lib/gsap.ts`.
- [ ] Logic điều khiển Animation phải thuộc quyền sở hữu của widgets hoặc features, tuyệt đối không thuộc về entities.
- [ ] Bắt buộc dùng `visibility: hidden` cho các trạng thái chuẩn bị animation thay vì `display: none` trên những phần tử trọng yếu đối với SEO.
- [ ] Các nguyên tắc CUBE CSS được áp dụng, và GSAP phải đọc cấu hình từ các biến CSS Custom Properties.
