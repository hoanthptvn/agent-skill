---
name: naming-conventions
description: Kỹ năng Agent chuyên biệt về naming-conventions cho hệ thống CSS.
---

# CSS Variable Naming Conventions & Usage Patterns

> Tài liệu phân tích cách đặt tên biến và triển khai biến trong CSS production-grade,
> áp dụng trong agent-os-css FLOCSS architecture.

---

## Mục lục

1. [Tổng quan 3 tầng biến](#1-tổng-quan-3-tầng-biến)
2. [Tầng 1: Design Tokens](#2-tầng-1-design-tokens)
3. [Tầng 2: UI Semantic Tokens](#3-tầng-2-ui-semantic-tokens)
4. [Tầng 3: Internal Vars (--ui-*)](#4-tầng-3-internal-vars---ui-)
5. [Composite Pattern](#5-composite-pattern)
6. [Override Pattern (Fallback Chain)](#6-override-pattern-fallback-chain)
7. [color-mix() Pattern](#7-color-mix-pattern)
8. [So sánh agent-os-css vs Nuxt UI](#8-so-sánh-agent-os-css-vs-nuxt-ui)

---

## 1. Tổng quan 3 tầng biến

```
┌────────────────────────────────────────────────────────────────┐
│  TẦNG 1: DESIGN TOKENS (public)                               │
│  Nơi khai báo: @layer theme / tokens                          │
│  Ai dùng: developer, component CSS, utility class             │
│  Prefix: --color-*, --text-*, --shadow-*, --font-*, --blur-*  │
│  Ví dụ: --color-blue-500, --text-sm, --shadow-md              │
├────────────────────────────────────────────────────────────────┤
│  TẦNG 2: UI SEMANTIC TOKENS (public)                          │
│  Nơi khai báo: @layer theme (light/dark scope)                │
│  Ai dùng: component CSS, utility class                        │
│  Prefix: --ui-*                                               │
│  Ví dụ: --ui-primary, --ui-text-muted, --ui-bg-elevated       │
├────────────────────────────────────────────────────────────────┤
│  TẦNG 3: INTERNAL VARS (private)                              │
│  Nơi khai báo: @layer properties                              │
│  Ai dùng: CHỈ utility class / framework internal              │
│  KHÔNG dùng trực tiếp trong component                         │
│  Prefix: --ui-*                                               │
│  Ví dụ: --ui-shadow, --ui-ring-shadow, --ui-blur              │
└────────────────────────────────────────────────────────────────┘
```

### Mapping agent-os-css ↔ Nuxt UI

| Tầng | Nuxt UI | agent-os-css | Ví dụ |
|------|---------|-----------|-------|
| 1 | `--color-blue-500` | `--clr-neutral-500` | Primitive token |
| 1 | `--text-sm` | `--text-sm` | Typography token |
| 1 | `--shadow-md` | `--shadow-md` | Effect token |
| 2 | `--ui-primary` | `--ui-primary` | Semantic action |
| 2 | `--ui-text-muted` | `--clr-text-muted` | Semantic text |
| 2 | `--ui-bg-elevated` | `--clr-surface` | Semantic surface |
| 3 | `--ui-shadow` | `--ui-shadow` | Internal composite |
| 3 | `--ui-translate-x` | `--ui-translate-x` | Internal transform |

---

## 2. Tầng 1: Design Tokens

### Quy tắc đặt tên

```
--{category}-{name}-{variant}
--{category}-{name}--{companion}    (dấu -- kép cho companion)
```

### Danh mục đầy đủ

#### Color: `--color-{name}-{shade}`

```css
/* Nuxt UI: bảng màu primitive 50-950 */
--color-red-50:  oklch(97.1% .013 17.38);
--color-red-500: oklch(63.7% .237 25.331);
--color-red-950: oklch(25.8% .092 26.042);

/* agent-os-css tương đương: */
--clr-neutral-50:  oklch(98% 0 0);
--clr-neutral-500: oklch(50% 0 0);
--clr-neutral-950: oklch(5%  0 0);
```

> **Ghi chú**: agent-os-css dùng `oklch()` trực tiếp thay vì hardcode
> để dễ generate bảng màu mới từ 1 Hue value.

#### Typography: `--text-{size}` + `--text-{size}--line-height`

```css
/* Token chính */
--text-sm: .875rem;
--text-base: 1rem;

/* Companion (dấu -- kép!) */
--text-sm--line-height: 1.42857;
--text-base--line-height: 1.5;

/* agent-os-css: dùng clamp() cho fluid scaling */
--text-sm: clamp(.875rem, 1.2vw, 1rem);
--text-sm--line-height: 1.5;
```

**Cách dùng trong utility class:**

```css
.text-sm {
  font-size: var(--text-sm);
  line-height: var(--ui-leading, var(--text-sm--line-height));
  /*           ↑ override        ↑ default companion */
}
```

#### Font Weight: `--font-weight-{name}`

```css
/* Nuxt UI */
--font-weight-thin: 100;
--font-weight-light: 300;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
--font-weight-extrabold: 800;
--font-weight-black: 900;

/* agent-os-css tương đương */
--weight-light: 300;
--weight-regular: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;
--weight-black: 900;
```

#### Shadow: `--shadow-{size}` + `--inset-shadow-{size}`

```css
/* Nuxt UI — multi-layer shadow (tự nhiên hơn) */
--shadow-xs: 0 1px 2px 0 #0000000d;
--shadow-sm: 0 1px 3px 0 #0000001a, 0 1px 2px -1px #0000001a;
--shadow-md: 0 4px 6px -1px #0000001a, 0 2px 4px -2px #0000001a;
--shadow-lg: 0 10px 15px -3px #0000001a, 0 4px 6px -4px #0000001a;
--shadow-xl: 0 20px 25px -5px #0000001a, 0 8px 10px -6px #0000001a;
--shadow-2xl: 0 25px 50px -12px #00000040;

/* Inset shadow (cho input, well, pressed state) */
--inset-shadow-xs: inset 0 1px #0000000d;
--inset-shadow-sm: inset 0 1px 1px #0000000d;
--inset-shadow-md: inset 0 2px 4px #0000000d;

/* Text shadow */
--text-shadow-xs: 0px 1px 1px #0003;
--text-shadow-sm: 0px 1px 0px #00000013, ...;

/* Drop shadow (cho filter: drop-shadow()) */
--drop-shadow-xs: 0 1px 1px #0000000d;
--drop-shadow-sm: 0 1px 2px #00000026;
```

#### Layout: `--spacing`, `--container-{size}`, `--breakpoint-{size}`

```css
/* Nuxt UI: spacing unit (nhân số) */
--spacing: .25rem;
/* Dùng: calc(var(--spacing) * 4) = 1rem */

/* agent-os-css: tương tự nhưng base = 0.5rem (8pt grid) */
--space-unit: .5rem;
/* Dùng: var(--space-4) = calc(0.5rem * 4) = 2rem */

/* Breakpoints */
--breakpoint-sm: 40rem;   /* 640px */
--breakpoint-md: 48rem;   /* 768px */
--breakpoint-lg: 64rem;   /* 1024px */
```

#### Animation: `--animate-{name}`, `--ease-{name}`

```css
/* Shorthand tokens — tất cả params trong 1 var */
--animate-spin:   spin 1s linear infinite;
--animate-ping:   ping 1s cubic-bezier(0, 0, .2, 1) infinite;
--animate-pulse:  pulse 2s cubic-bezier(.4, 0, .6, 1) infinite;
--animate-bounce: bounce 1s infinite;

/* Dùng: */
.animate-spin { animation: var(--animate-spin); }
.animate-pulse { animation: var(--animate-pulse); }

/* Easing curves */
--ease-in:     cubic-bezier(.4, 0, 1, 1);
--ease-out:    cubic-bezier(0, 0, .2, 1);
--ease-in-out: cubic-bezier(.4, 0, .2, 1);
```

#### Default fallbacks: `--default-*`

```css
/* Giá trị mặc định cho utility classes */
--default-transition-duration: .15s;
--default-transition-timing-function: cubic-bezier(.4, 0, .2, 1);
--default-font-family: var(--font-sans);
--default-mono-font-family: var(--font-mono);
```

---

## 3. Tầng 2: UI Semantic Tokens

### Quy tắc đặt tên

```
--ui-{role}              /* Màu hành động */
--ui-{category}-{state}  /* Nền / viền / text theo state */
```

### Bảng đầy đủ từ Nuxt UI

```css
/* ── TEXT ────────────────────────────────── */
--ui-text-dimmed:      var(--ui-color-neutral-400);  /* Hint text */
--ui-text-muted:       var(--ui-color-neutral-500);  /* Placeholder */
--ui-text-toned:       var(--ui-color-neutral-600);  /* Secondary label */
--ui-text:             var(--ui-color-neutral-700);  /* Body text */
--ui-text-highlighted: var(--ui-color-neutral-900);  /* Strong emphasis */
--ui-text-inverted:    #fff;                         /* Text trên dark bg */

/* ── BACKGROUND ─────────────────────────── */
--ui-bg:               #fff;                         /* Main bg */
--ui-bg-muted:         var(--ui-color-neutral-50);   /* Subtle bg */
--ui-bg-elevated:      var(--ui-color-neutral-100);  /* Card, dropdown */
--ui-bg-accented:      var(--ui-color-neutral-200);  /* Hover state */
--ui-bg-inverted:      var(--ui-color-neutral-900);  /* Dark bg */

/* ── BORDER ──────────────────────────────── */
--ui-border:           var(--ui-color-neutral-200);  /* Default border */
--ui-border-muted:     var(--ui-color-neutral-200);  /* Soft border */
--ui-border-accented:  var(--ui-color-neutral-300);  /* Stronger border */
--ui-border-inverted:  var(--ui-color-neutral-900);  /* Dark border */

/* ── ACTION COLORS ───────────────────────── */
--ui-primary:          /* Brand color */
--ui-secondary:        /* Secondary action */
--ui-success:          /* Success state */
--ui-warning:          /* Warning state */
--ui-error:            /* Error state */
--ui-info:             /* Info state */
```

### Dark mode: chỉ remap biến

```css
.dark {
  --ui-text-dimmed:      var(--ui-color-neutral-500);
  --ui-text-muted:       var(--ui-color-neutral-400);
  --ui-text-toned:       var(--ui-color-neutral-300);
  --ui-text:             var(--ui-color-neutral-200);
  --ui-text-highlighted: #fff;
  --ui-text-inverted:    var(--ui-color-neutral-900);
  --ui-bg:               var(--ui-color-neutral-900);
  --ui-bg-muted:         var(--ui-color-neutral-800);
  --ui-bg-elevated:      var(--ui-color-neutral-800);
  --ui-bg-accented:      var(--ui-color-neutral-700);
  --ui-bg-inverted:      #fff;
  --ui-border:           var(--ui-color-neutral-800);
  --ui-border-muted:     var(--ui-color-neutral-700);
  --ui-border-accented:  var(--ui-color-neutral-700);
  --ui-border-inverted:  #fff;
}
```

> **Lợi thế**: component CSS KHÔNG CẦN biết light/dark mode.
> Tất cả `background: var(--ui-bg-elevated)` tự động đổi.

---

## 4. Tầng 3: Internal Vars (`--ui-*`)

### Quy tắc đặt tên

`css
--ui-{property}             /* Biến composite cho property CSS */
--ui-{property}-{modifier}  /* Sub-property */
```

### Danh sách đầy đủ

```css
/* TRANSFORM */
--ui-translate-x: 0;
--ui-translate-y: 0;
--ui-translate-z: 0;
--ui-rotate-x: initial;
--ui-rotate-y: initial;
--ui-rotate-z: initial;
--ui-skew-x: initial;
--ui-skew-y: initial;

/* SHADOW (5 layers) */
--ui-shadow: 0 0 #0000;
--ui-shadow-color: initial;
--ui-shadow-alpha: 100%;
--ui-inset-shadow: 0 0 #0000;
--ui-inset-shadow-color: initial;
--ui-inset-shadow-alpha: 100%;
--ui-ring-color: initial;
--ui-ring-shadow: 0 0 #0000;
--ui-ring-inset: initial;
--ui-ring-offset-width: 0px;
--ui-ring-offset-color: #fff;
--ui-ring-offset-shadow: 0 0 #0000;
--ui-inset-ring-color: initial;
--ui-inset-ring-shadow: 0 0 #0000;

/* BORDER */
--ui-border-style: solid;
--ui-divide-y-reverse: 0;
--ui-outline-style: solid;

/* FILTER */
--ui-blur: initial;
--ui-brightness: initial;
--ui-contrast: initial;
--ui-grayscale: initial;
--ui-hue-rotate: initial;
--ui-invert: initial;
--ui-saturate: initial;
--ui-sepia: initial;
--ui-opacity: initial;
--ui-drop-shadow: initial;
--ui-drop-shadow-color: initial;
--ui-drop-shadow-alpha: 100%;
--ui-drop-shadow-size: initial;

/* BACKDROP FILTER */
--ui-backdrop-blur: initial;
--ui-backdrop-brightness: initial;
--ui-backdrop-contrast: initial;
--ui-backdrop-grayscale: initial;
--ui-backdrop-hue-rotate: initial;
--ui-backdrop-invert: initial;
--ui-backdrop-opacity: initial;
--ui-backdrop-saturate: initial;
--ui-backdrop-sepia: initial;

/* TYPOGRAPHY */
--ui-font-weight: initial;
--ui-leading: initial;
--ui-content: "";

/* TRANSITION (override) */
--ui-duration: initial;
--ui-ease: initial;

/* LAYOUT */
--ui-border-spacing-x: 0;
--ui-border-spacing-y: 0;
```

---

## 5. Composite Pattern

### Vấn đề

```css
/* ❌ SAI — nếu 1 var undefined → toàn bộ property hỏng */
box-shadow: var(--my-ring), var(--my-shadow);
/* Nếu --my-ring chưa set → box-shadow = invalid → KHÔNG CÓ shadow nào */
```

### Giải pháp: Safe Defaults + Composite Assembly

```css
/* Bước 1: Khai báo safe defaults (trong @layer properties) */
* {
  --ui-ring-shadow: 0 0 #0000;   /* transparent, invisible nhưng hợp lệ */
  --ui-shadow: 0 0 #0000;
}

/* Bước 2: Utility class chỉ set 1 biến */
.shadow-md {
  --ui-shadow: 0 4px 6px -1px var(--ui-shadow-color, #0000001a),
               0 2px 4px -2px var(--ui-shadow-color, #0000001a);
  box-shadow: var(--ui-inset-shadow),     /* always valid */
              var(--ui-inset-ring-shadow), /* always valid */
              var(--ui-ring-offset-shadow),/* always valid */
              var(--ui-ring-shadow),       /* always valid */
              var(--ui-shadow);            /* ← vừa set */
}

/* Bước 3: Thêm ring, tất cả composite vẫn hoạt động */
.ring-2 {
  --ui-ring-shadow: 0 0 0 2px var(--ui-ring-color, currentcolor);
  box-shadow: var(--ui-inset-shadow),
              var(--ui-inset-ring-shadow),
              var(--ui-ring-offset-shadow),
              var(--ui-ring-shadow),        /* ← vừa set */
              var(--ui-shadow);             /* ← giữ từ .shadow-md */
}
```

### Filter composite

```css
/* Utility class */
.blur {
  --ui-blur: blur(8px);
  filter: var(--ui-blur, )
          var(--ui-brightness, )
          var(--ui-contrast, )
          var(--ui-grayscale, )
          var(--ui-hue-rotate, )
          var(--ui-invert, )
          var(--ui-saturate, )
          var(--ui-sepia, )
          var(--ui-drop-shadow, );
}

/* Ghép thêm grayscale — không mất blur! */
.grayscale {
  --ui-grayscale: grayscale(100%);
  filter: var(--ui-blur, )            /* ← giữ blur(8px) */
          var(--ui-brightness, )
          var(--ui-contrast, )
          var(--ui-grayscale, )        /* ← vừa set */
          ...;
}
```

---

## 6. Override Pattern (Fallback Chain)

### Pattern cơ bản

```css
property: var(--override, var(--default));
```

### Ví dụ thực tế

#### Transition override

```css
/* Khai báo utility class */
.transition-colors {
  transition-property: color, background-color, border-color, ...;
  transition-timing-function: var(--ui-ease, var(--default-transition-timing-function));
  transition-duration: var(--ui-duration, var(--default-transition-duration));
  /*                   ↑ per-element       ↑ global default (.15s) */
}

/* Dùng trong HTML: không override → dùng default */
<button class="transition-colors">Default .15s</button>

/* Dùng trong HTML: override per-element */
<button class="transition-colors" 
        style="--ui-duration: .3s; --ui-ease: var(--ease-out-expo)">
  Slower + expo
</button>
```

#### Line-height override

```css
/* Utility class */
.text-sm {
  font-size: var(--text-sm);
  line-height: var(--ui-leading, var(--text-sm--line-height));
  /*           ↑ override          ↑ default companion (1.42857) */
}

/* Dùng: mặc định */
<p class="text-sm">Line-height = 1.42857</p>

/* Dùng: override */
<p class="text-sm" style="--ui-leading: 1.8">Line-height = 1.8</p>
```

#### Font weight override

```css
/* Utility class */
.font-bold {
  --ui-font-weight: var(--font-weight-bold);
  font-weight: var(--font-weight-bold);
}
/* ↑ Set CẢ internal var LẪN property
   → ::before, ::after có thể inherit --ui-font-weight */
```

---

## 7. color-mix() Pattern

### Tại sao cần?

```css
/* ❌ SAI — không thể dùng var() trong alpha channel */
background: oklch(var(--accent-l) var(--accent-c) var(--accent-h) / 10%);

/* ✅ ĐÚNG — color-mix() */
background: color-mix(in oklab, var(--ui-primary) 10%, transparent);
```

### Cách Nuxt UI triển khai

```css
/* Fallback-first: set giá trị cho browser cũ */
.bg-primary\/10 {
  background-color: var(--ui-primary);  /* fallback: solid color */
}

/* Override cho browser mới */
@supports (color: color-mix(in lab, red, red)) {
  .bg-primary\/10 {
    background-color: color-mix(in oklab, var(--ui-primary) 10%, transparent);
  }
}
```

### Ứng dụng phổ biến

```css
/* Hover state nhẹ */
.btn:hover {
  background: color-mix(in oklab, var(--ui-primary) 75%, transparent);
}

/* Focus ring */
.input:focus-visible {
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--ui-primary) 30%, transparent);
}

/* Badge background */
.badge--error {
  background: color-mix(in oklab, var(--ui-error) 10%, transparent);
  color: var(--ui-error);
}

/* Selection */
::selection {
  background: color-mix(in oklab, var(--ui-primary) 20%, transparent);
}
```

---

## 8. Lợi thế agent-os-css vs framework thông thường

### Triết lý khác nhau

| | Nuxt UI | agent-os-css |
|---|---|---|
| **Mục tiêu** | Framework component library | Copy-paste foundation |
| **Color system** | Primitive scales đầy đủ (50-950 × 20+ colors) | Semantic-only + neutral scale |
| **Typography** | Static rem values | Fluid `clamp()` |
| **Spacing** | `--spacing: .25rem` + `calc(* N)` | `--space-unit: .5rem` + named tokens |
| **Components** | Framework-managed | Local CSS var pattern |
| **@layer** | `properties → theme → base → components → utilities` | `properties → reset → tokens → base → layout → components → animations → utilities` |

### Những gì agent-os-css CÓ mà Nuxt UI KHÔNG có

- ✅ Fluid typography (`clamp()`)
- ✅ Named spacing tokens (`--space-section`, `--space-section-lg`)
- ✅ Glass morphism tokens (`--glass-bg`, `--glass-border`, `--glass-blur`)
- ✅ Perspective tokens (`--perspective-xs` → `--perspective-xl`)
- ✅ Text shadow tokens (`--text-shadow-glow`)
- ✅ Data-animate pattern (CSS-driven animation state)

### Những gì Nuxt UI CÓ mà agent-os-css ĐÃ HỌC

- ✅ `@layer properties` safe defaults → `foundation/properties.css`
- ✅ `--text-SIZE--line-height` companions → `foundation/tokens.css`
- ✅ `--ui-*` semantic tokens → `foundation/tokens.css`
- ✅ Transition utilities + `--ui-duration` override → `object/utilities.css`
- ✅ `--inset-shadow-*` tokens → `foundation/tokens.css`
- ✅ `--animate-*` shorthand tokens → `foundation/tokens.css`
- ✅ `--default-transition-*` fallbacks → `foundation/tokens.css`
- ✅ `color-mix()` pattern → `object/utilities.css`

### Workflow Nuxt UI: Cách biến chảy từ token → utility → component

```
@layer properties   ← Safe defaults (--ui-* = 0 0 #0000)
      ↓
@layer theme        ← Design tokens + UI semantic tokens
      ↓
@layer base         ← Reset + body defaults (dùng --ui-bg, --ui-text)
      ↓
@layer components   ← Component CSS (dùng --ui-primary, --ui-bg-elevated)
      ↓
@layer utilities    ← Utility classes (dùng tokens + override --ui-*)
                       .shadow-md → --ui-shadow = var(--shadow-md)
                       .ring-2 → --ui-ring-shadow = 0 0 0 2px ...
```

---

## Tóm tắt quy tắc đặt tên

```
DESIGN TOKENS (public):
  --color-{name}-{shade}            --color-blue-500
  --text-{size}                     --text-sm
  --text-{size}--line-height        --text-sm--line-height  (dấu -- kép!)
  --font-weight-{name}             --font-weight-semibold
  --shadow-{size}                   --shadow-md
  --inset-shadow-{size}            --inset-shadow-sm
  --drop-shadow-{size}             --drop-shadow-lg
  --text-shadow-{size}             --text-shadow-sm
  --blur-{size}                     --blur-md
  --ease-{name}                     --ease-out
  --animate-{name}                  --animate-spin
  --spacing                         --spacing (base unit)
  --breakpoint-{name}              --breakpoint-md
  --container-{size}               --container-md
  --radius-{size}                   --radius-md
  --perspective-{name}             --perspective-normal
  --default-{property}             --default-transition-duration

UI SEMANTIC (public):
  --ui-{role}                       --ui-primary, --ui-error
  --ui-text-{state}                --ui-text-muted, --ui-text-highlighted
  --ui-bg-{state}                  --ui-bg-elevated, --ui-bg-accented
  --ui-border-{state}              --ui-border-muted, --ui-border-inverted

INTERNAL (private — KHÔNG dùng trực tiếp):
  --ui-{property}                   --ui-shadow, --ui-blur
  --ui-{property}-{modifier}       --ui-shadow-color, --ui-ring-inset
  --_internal                       --_accent-l (underscore prefix = private)
```


---

## 🤖 Agent OS Anti-Rationalization

> [!CAUTION]
> **Tác tử AI ĐỌC KỸ TRƯỚC KHI CODE:**
> 1. **Cấm lười biếng:** Không được lạm dụng `!important` để chữa cháy giao diện. BẮT BUỘC phải tuân thủ tầng Cascade (Cascade Layers - `@layer`).
> 2. **Cấm ngụy biện:** "Hardcode mã màu cho nhanh" là sai lầm chết người. Mọi màu sắc, khoảng cách (spacing), font-size đều PHẢI sử dụng CSS Variables (Design Tokens) như `var(--clr-bg)`, `var(--space-2)`.
> 3. **Bảo vệ Hệ thống:** Cấm nhồi nhét style trực tiếp vào thẻ HTML (Inline styles). Mọi tên class phải tuân thủ nguyên tắc BEM với tiền tố tiêu chuẩn (`c-`, `l-`, `u-`).
