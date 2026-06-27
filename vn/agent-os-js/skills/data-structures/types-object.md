---
name: types-object
description: Kỹ năng Agent chuyên biệt về cấu trúc dữ liệu types-object cho hệ thống JavaScript High-Performance.
---

# Object — V8 Hidden Classes & Lookup

Object trong JS = Hash Table under the hood. V8 chạy key qua Hash Function → địa chỉ bộ nhớ vật lý trực tiếp.

---

## DO — Methods O(1) (Tốc độ ánh sáng)

```
object[key] = value        → O(1)  ← Hash → địa chỉ ô nhớ trực tiếp
const val = object[key]    → O(1)  ← Đi thẳng đến ô nhớ
'key' in object            → O(1)  ← hasOwnProperty cũng O(1)
object.hasOwnProperty(k)  → O(1)  ← Kiểm tra key tồn tại
```

## CẢNH BÁO — Methods O(N)

```
Object.keys(obj)           → O(N)  ← Duyệt toàn bộ + tạo mảng MỚI
Object.values(obj)         → O(N)  ← Duyệt toàn bộ + tạo mảng MỚI
Object.entries(obj)        → O(N)  ← Duyệt toàn bộ + tạo mảng MỚI
Object.assign(target, src) → O(N)  ← Copy toàn bộ properties
Object.freeze(obj)         → O(N)  ← Đặt flag toàn bộ properties
{...obj}                   → O(N)  ← Spread = shallow copy
```

---

## DON'T — Bẫy chí mạng

```javascript
// ❌ delete obj.key → phá vỡ V8 Hidden Classes → Dictionary Mode (chậm)
// V8 tối ưu Object bằng Hidden Classes (ngầm tạo C++ struct-like)
// delete phá cấu trúc → V8 giáng cấp → mọi truy xuất sau đó chậm hơn đáng kể
const user = { name: 'A', age: 25 };
delete user.age; // ❌ V8 de-opt
// ✓ Fix: gán null/undefined (giữ Hidden Class)
user.age = null;
// ✓ Fix: dùng Map.delete() nếu cần CRUD liên tục

// ❌ Object.keys(obj).length → O(N) chỉ để check empty
if (Object.keys(obj).length === 0) { /* empty */ }
// ✓ Fix: O(1) — thoát ngay khi thấy key đầu tiên
function isEmpty(obj) { for (const _ in obj) return false; return true; }

// ❌ Object.values(obj).includes('x') → O(N) tìm theo VALUE
// ✓ Fix: Nếu cần tìm theo value nhiều lần → đảo ngược key-value thành Map

// ❌ Thêm property sau constructor → phá Hidden Class
const p = {};
p.x = 0; p.y = 0; // V8 phải tạo Hidden Class mới mỗi lần thêm property
// ✓ Fix: Khai báo đầy đủ từ đầu
const p = { x: 0, y: 0, vx: 0, vy: 0, life: 0, active: false };
// V8 tạo 1 Hidden Class duy nhất → tái sử dụng cho mọi object cùng shape
```

---

## V8 Hidden Classes — Tại sao quan trọng

```
V8 tối ưu Object bằng Hidden Classes (ngầm tạo cấu trúc C++ struct-like)
→ Truy xuất thuộc tính cực nhanh (inline caching)

Phá Hidden Class khi:
  1. delete obj.key              → chuyển sang Dictionary Mode
  2. Thêm property sau khi tạo   → V8 phải tạo Transition Chain
  3. Tạo objects cùng shape nhưng khác thứ tự properties

Nguyên tắc:
  ✓ Khai báo MỌI property trong constructor/literal từ đầu
  ✓ Tạo objects cùng shape, cùng thứ tự properties
  ✓ Dùng null thay delete
  ✗ KHÔNG delete trong performance-critical code
  ✗ KHÔNG thêm property sau khi object đã tạo
```

---

## Destructuring & Spread

```javascript
// Destructuring — trích xuất properties
const { name, age, role = 'user' } = user; // Default value nếu undefined
const { node: neighborNode, weight } = neighbor; // Rename

// Computed Property Names
const field = 'email';
const obj = { [field]: 'a@b.com' }; // { email: 'a@b.com' }

// Spread — shallow copy O(N)
const copy = { ...original }; // Chỉ copy level 1
const merged = { ...defaults, ...userConfig }; // Override

// ⚠️ Spread KHÔNG deep clone
const deep = { nested: { a: 1 } };
const copy = { ...deep };
copy.nested.a = 999; // original.nested.a CŨNG bị đổi thành 999!
// ✓ Deep clone: structuredClone(deep) (ES2022)

// Object.freeze() — immutable level 1
const config = Object.freeze({ theme: 'dark', lang: 'vi' });
config.theme = 'light'; // Silent fail (strict mode: TypeError)
// ⚠️ Freeze KHÔNG deep — nested objects vẫn mutable
```

---

## Thực hành — Pattern thường dùng

```javascript
// Dispatch Table — thay switch/if-else
// ✗ O(N) comparisons
function getHandler(type) {
  if (type === 'click') return handleClick;
  if (type === 'scroll') return handleScroll;
  if (type === 'resize') return handleResize;
}

// ✓ O(1) lookup
const handlers = {
  click:  handleClick,
  scroll: handleScroll,
  resize: handleResize,
};
const handler = handlers[type]; // O(1)
if (handler) handler(event);

// Grouping — gom nhóm theo category
function groupBy(items, key) {
  const result = {};
  for (const item of items) {
    const k = item[key];
    (result[k] ??= []).push(item); // Nullish assignment ES2021
  }
  return result;
}
// groupBy(users, 'role') → { admin: [...], user: [...] }

// Config merge — defaults + user overrides
const defaults = { theme: 'dark', lang: 'vi', fps: 60 };
const userConfig = { theme: 'light' };
const config = { ...defaults, ...userConfig };
// { theme: 'light', lang: 'vi', fps: 60 }
```

---

## Quick Reference

```
O(1): obj[key], 'key' in obj, hasOwnProperty
O(N): Object.keys/values/entries, Object.assign, {...obj} spread

V8 Hidden Classes:
  ✓ Khai báo đầy đủ properties từ đầu
  ✓ Cùng shape, cùng thứ tự
  ✗ delete → Dictionary Mode → chậm
  ✗ Thêm property sau constructor

Dùng Object khi:
  Config/state tĩnh, key là string cố định
  Dispatch Table (switch → O(1) lookup)

Không dùng Object khi:
  Key là DOM node / Function → dùng Map
  CRUD liên tục → dùng Map
  Cần .size → dùng Map (O(1) thay Object.keys().length O(N))
  Cần tự động GC khi DOM unmount → dùng WeakMap
```


---

## 🤖 Agent OS Anti-Rationalization

> [!CAUTION]
> **Tác tử AI ĐỌC KỸ TRƯỚC KHI CODE:**
> 1. **Cấm lười biếng:** Không dùng Object `{}` để tra cứu (lookup) liên tục. BẮT BUỘC dùng `Map` hoặc `Set` để đạt `O(1)`.
> 2. **Cấm ngụy biện:** "Dùng Array.indexOf cho nhanh" là sai lầm khi mảng lớn. Phải đổi sang `Set.has()` nếu cần tìm kiếm nhiều lần.
> 3. **Tối đa hóa Typed Arrays:** Xử lý tọa độ (x, y, z) 3D hoặc WebGL bắt buộc dùng `Float32Array`. Cấm dùng Array thường để lưu số thực cường độ cao.
