# 📋 CODE REVIEW AUDIT — DỰ ÁN BUNTECH
## Chuyển đổi số Xưởng Bún | Backend: AdonisJS 7 | Frontend: Nuxt 4

> **Ngày kiểm tra:** 2026-08-17
> **Phạm vi:** Toàn bộ `BE/app/` (31 controllers, 25 services) và `FE/app/` (composables, pages, components, utils)
> **Quy tắc áp dụng:** [FE/.agents/AGENTS.md](../FE/.agents/AGENTS.md) + [BE/.agents/AGENTS.md](../BE/.agents/AGENTS.md)

---

# 🔥 BƯỚC 1: QUÉT TÌM LỖI CHÍ MẠNG (CRITICAL AUDIT)

## 📊 TÓM TẮT 3 QUY TẮC QUAN TRỌNG NHẤT MỖI BÊN

### Frontend (FE/.agents/AGENTS.md)
1. **Chặn rò rỉ SSR:** Cấm khai báo `ref()` global ngoài thân hàm composable → gây rò rỉ dữ liệu chéo giữa users trên SSR. Bắt buộc dùng `useState()`.
2. **Cấm `$fetch` ở top-level `<script setup>`:** Gây double fetching. Phải dùng `useFetch`/`useAsyncData`. `$fetch` chỉ dùng trong event handlers.
3. **Cấm `process.env` ở Client:** Phải dùng `useRuntimeConfig()`. Cấm dùng `<UForm>` (bug reload). Bắt buộc dùng Native `<form>` + Zod.

### Backend (BE/.agents/AGENTS.md)
1. **Bắt buộc `@inject()` + DI:** Cấm `new Service()`, cấm static methods. Mọi Controller phải dùng `@inject()` decorator.
2. **Transaction cho multi-table writes:** Mọi thao tác ghi ≥ 2 bảng BẮT BUỘC dùng `db.transaction()`. Cấm tác vụ chậm (upload, mail) nằm trong transaction.
3. **Performance:** Cấm `SELECT *`, cấm `console.log`, cấm query trong vòng lặp (N+1), bắt buộc `.paginate()` cho list API, cấm `any` type, cấm CommonJS `require`.

---

## 🚨 DANH SÁCH LỖI CHÍ MẠNG

### Mức Severity:
- 🔴 **CRITICAL** — Có thể gây sập hệ thống, rò rỉ dữ liệu, hoặc sai lệch nghiệp vụ
- 🟠 **HIGH** — Vi phạm nghiêm trọng rule, gây rủi ro hiệu năng hoặc bảo mật
- 🟡 **MEDIUM** — Vi phạm coding standard, cần sửa để đảm bảo chất lượng code

---

### 🔴 BACKEND: LỖI CRITICAL

#### BUG-BE-01: `process.env` trực tiếp trong Service (Vi phạm Rule §11)

> Rule BE §11 cấm tuyệt đối gọi `process.env` trực tiếp. Phải validate trong `start/env.ts` và truy xuất qua `import env from '#start/env'`.

| File | Dòng | Code vi phạm |
|------|------|-------------|
| `BE/app/services/auth_service.ts` | 154 | `otp: process.env.NODE_ENV !== 'production' ? otp : undefined` |

---

#### BUG-BE-02: Sử dụng CommonJS `require()` (Vi phạm Rule §AI Rules)

> Rule: "Tuyệt đối không dùng CommonJS (require). Luôn sử dụng ES Modules (import/export)."

| File | Dòng | Code vi phạm |
|------|------|-------------|
| `BE/app/services/export_service.ts` | 11 | `const { Readable } = require('node:stream')` |

**Fix:** `import { Readable } from 'node:stream'` ở đầu file.

---

#### BUG-BE-03: 3 Controllers thiếu `@inject()` + chứa Business Logic trực tiếp (Vi phạm Rule §2, §16.12)

| File | Vấn đề |
|------|--------|
| `BE/app/controllers/customer_debt_controller.ts` | Thiếu `@inject()`, query DB trực tiếp trong controller |
| `BE/app/controllers/customer_dashboard_controller.ts` | Thiếu `@inject()`, chứa 3 câu query phức tạp |
| `BE/app/controllers/events_controller.ts` | Thiếu `@inject()`, SSE logic nằm trong controller |

---

#### BUG-BE-04: Tràn ngập `any` type trong Dashboard Service (Vi phạm Rule §15, §22)

| File | Dòng | Số lần vi phạm |
|------|------|----------------|
| `BE/app/services/dashboard_service.ts` | 12, 15, 82-91, 131-154 | **14 chỗ** dùng `any` |
| `BE/app/services/inventory_service.ts` | 134, 166 | 2 chỗ |
| `BE/app/services/file_upload_service.ts` | 33 | 1 chỗ |

---

#### BUG-BE-05: `InventoryService.getHistory()` thiếu `.select()` + thiếu pagination (Vi phạm Rule §16.1, §16.2)

| File | Dòng | Code vi phạm |
|------|------|-------------|
| `BE/app/services/inventory_service.ts` | 232-239 | `InventoryLog.query()` không `.select()`, chỉ `.limit()` không `.paginate()` |

---

#### BUG-BE-06: Potential SQL Injection — String Interpolation trong Raw SQL

| File | Dòng | Code vi phạm |
|------|------|-------------|
| `BE/app/services/dashboard_service.ts` | 184, 188, 192 | `` `...AND status = '${OrderStatus.DELIVERED}'...` `` — nối chuỗi Enum vào SQL thay vì parameterized `?` |

> Risk thấp vì `OrderStatus` là Enum nội bộ, nhưng vi phạm nguyên tắc phòng thủ tuyệt đối.

---

#### BUG-BE-07: EventsController SSE thiếu heartbeat, timeout, error handling

| File | Dòng | Code vi phạm |
|------|------|-------------|
| `BE/app/controllers/events_controller.ts` | 39 | `return new Promise(() => {})` — promise không bao giờ resolve |

**Rủi ro:** Proxy/CDN ngắt kết nối do idle, rò rỉ connection nếu client disconnect không clean.

---

### 🔴 FRONTEND: LỖI CRITICAL

#### BUG-FE-01: `process.env.NODE_ENV` trực tiếp trong Client code (Vi phạm Rule §11)

| File | Dòng |
|------|------|
| `FE/app/utils/api.ts` | 149, 211 |
| `FE/app/composables/useAuth.ts` | 16, 42 |

**Fix:** Dùng `import.meta.dev` hoặc `useRuntimeConfig()`.

---

#### BUG-FE-02: Import thủ công Vue API — Redundant với Auto-imports (Vi phạm Rule §AI Rules)

| File | Import thừa |
|------|-------------|
| `FE/app/pages/admin/customers/index.vue` | `import { computed, ref, watch } from 'vue'` |
| `FE/app/layouts/driver.vue` | `import { ref, onMounted, onUnmounted } from 'vue'` |
| `FE/app/components/features/admin/system/SystemConfigFormDrawer.vue` | `import { reactive, ref, computed, watch } from 'vue'` |
| `FE/app/components/features/admin/customers/CustomerFormDrawer.vue` | `import { reactive, ref, computed, watch } from 'vue'` |
| `FE/app/components/features/admin/customers/CustomerAddressBook.vue` | `import { ref, computed } from 'vue'` |
| `FE/app/components/features/admin/customers/AddressFormModal.vue` | `import { reactive, ref, computed, watch } from 'vue'` |
| `FE/app/components/admin/CustomerDebtTab.vue` | `import { computed } from 'vue'` |
| `FE/app/components/base/SwipeToConfirm.vue` | `import { ref, computed, watch } from 'vue'` |
| `FE/app/components/base/AddressSelect.vue` | `import { computed } from 'vue'` |

---

### 🟠 LỖI HIGH

| # | Mã | Vấn đề | File |
|---|-----|--------|------|
| 1 | BUG-BE-08 | `Map<string, any>` type unsafe | `inventory_service.ts:166` |
| 2 | BUG-BE-09 | `Promise.all` update trong transaction → lock risk | `product_service.ts:352-358` |
| 3 | BUG-BE-10 | `Promise.all` save trong transaction → lock risk | `admin_order_service.ts:283-298` |
| 4 | BUG-BE-11 | MediaService thiếu `@inject()` | `media_service.ts:4` |
| 5 | BUG-FE-03 | localStorage lưu JSON lớn → jank trên điện thoại yếu | `useMasterData.ts:18-86` |

---

### 🟡 LỖI MEDIUM

| # | Mã | Vấn đề | File |
|---|-----|--------|------|
| 1 | BUG-FE-05 | `formErrors` dùng `ref` thay vì `reactive` (inconsistent) | `quick-order.vue:34` |

---

## ✅ NHỮNG ĐIỂM ĐÃ LÀM TỐT

| Tiêu chí | Kết quả | Ghi chú |
|----------|---------|---------|
| `@inject()` trên Controllers | ✅ 28/31 | Chỉ 3 controllers nhỏ thiếu |
| `db.transaction()` cho multi-table writes | ✅ Đều | Product, Order, Auth, Inventory |
| Upload files NGOÀI transaction | ✅ Chuẩn | Rollback file nếu DB fail |
| Xóa file cũ khi update | ✅ Chuẩn | ProductService, MediaService |
| `.paginate()` cho list API | ✅ 15 chỗ | `safeLimit = Math.min(limit, MAX)` |
| `.select()` cụ thể | ✅ Tốt | Phần lớn query specify columns |
| Không `new Service()` | ✅ 0 vi phạm | |
| Không `console.log` trong BE | ✅ 0 vi phạm | |
| Không `$fetch` top-level FE | ✅ 0 vi phạm | Dùng `useAsyncData` |
| Không `<UForm>` | ✅ 0 vi phạm | Native `<form>` đúng rule |
| Không `router.push` | ✅ 0 vi phạm | Dùng `navigateTo()` |
| SSR guard cho `window/document` | ✅ Đã bảo vệ | `import.meta.client` guard |
| Không global `ref()` rò rỉ SSR | ✅ Sạch | `useState()` hoặc `ref()` trong function body |
| Export CSV dùng Stream | ✅ Chuẩn | Chunk 1000 records |
| Idempotency Key auto | ✅ Tốt | POST/PUT/PATCH tự generate |

---

## 📋 BẢNG TỔNG HỢP BƯỚC 1

| # | Severity | Mã lỗi | Vấn đề | File | Ước lượng Fix |
|---|----------|--------|--------|------|--------------|
| 1 | 🔴 | BUG-BE-06 | SQL string interpolation | `dashboard_service.ts` | 15 phút |
| 2 | 🔴 | BUG-BE-02 | CommonJS `require()` | `export_service.ts` | 2 phút |
| 3 | 🔴 | BUG-BE-03 | 3 Controllers thiếu `@inject()` | 3 files | 30 phút |
| 4 | 🔴 | BUG-FE-01 | `process.env` trong client | `api.ts`, `useAuth.ts` | 10 phút |
| 5 | 🔴 | BUG-BE-01 | `process.env` trong service | `auth_service.ts` | 5 phút |
| 6 | 🔴 | BUG-BE-04 | `any` types (17 chỗ) | `dashboard_service.ts`, ... | 20 phút |
| 7 | 🟠 | BUG-BE-05 | Thiếu `.select()` + pagination | `inventory_service.ts` | 10 phút |
| 8 | 🟠 | BUG-BE-07 | SSE thiếu heartbeat/timeout | `events_controller.ts` | 20 phút |
| 9 | 🟠 | BUG-BE-09 | `Promise.all` in transaction | `product_service.ts` | 10 phút |
| 10 | 🟠 | BUG-BE-10 | `Promise.all` in transaction | `admin_order_service.ts` | 10 phút |
| 11 | 🟠 | BUG-BE-11 | MediaService thiếu `@inject()` | `media_service.ts` | 2 phút |
| 12 | 🟡 | BUG-FE-02 | 9 files import thủ công Vue API | 9 `.vue` files | 15 phút |
| 13 | 🟡 | BUG-FE-03 | localStorage JSON lớn | `useMasterData.ts` | Backlog |
| 14 | 🟡 | BUG-BE-08 | `Map<string, any>` | `inventory_service.ts` | 5 phút |
| 15 | 🟡 | BUG-FE-05 | formErrors ref vs reactive | `quick-order.vue` | 5 phút |

**Tổng: 6 CRITICAL, 5 HIGH, 4 MEDIUM | Ước tính fix: ~2.5 giờ**

---
---

# 🧹 BƯỚC 2: QUÉT DUPLICATE CODE & REFACTOR (CLEAN UP)

## 📊 TÓM TẮT PHÁT HIỆN

| Loại | Số pattern lặp | Files ảnh hưởng | Mức nghiêm trọng |
|------|----------------|-----------------|-------------------|
| FE: Form Boilerplate (formRef + formErrors + validateForm) | **13 file** copy-paste y hệt | 13 files | 🔴 Nghiêm trọng |
| BE: Pagination Input Pattern (2 cách parse khác nhau) | **6 vs 4** controllers | 10 controllers | 🟠 Cao |
| BE: `safeLimit` lặp lại trong mọi Service | **14 chỗ** | 11 services | 🟡 Trung bình |
| FE: Search Debounce tự viết tay | **2 file** tự setTimeout | 2 pages | 🟡 Trung bình |

---

## 🔴 DUP-FE-01: FORM BOILERPLATE — LỖI DRY NGHIÊM TRỌNG NHẤT

### Mô tả vấn đề

Toàn bộ **13 file** đang copy-paste y hệt **cùng 1 đoạn code ~20 dòng** để khởi tạo `formRef`, `formErrors` và `validateForm`. Đây là vi phạm DRY nghiêm trọng nhất của toàn bộ codebase.

### Đoạn code lặp lại (xuất hiện 13 lần):

```ts
// Pattern A: reactive (7 files)
const formErrors = reactive<Record<string, string>>({})
const formRef = ref({
  setErrors: (errors: { path: string; message: string }[]) => {
    Object.keys(formErrors).forEach((key) => (formErrors[key] = ''))
    errors.forEach((e) => { formErrors[e.path] = e.message })
  },
  clearErrors: () => {
    Object.keys(formErrors).forEach((key) => (formErrors[key] = ''))
  }
})
const validateForm = () => {
  formRef.value.clearErrors()
  const result = schema.safeParse(state)
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      path: issue.path[0]?.toString() || '',
      message: issue.message
    }))
    formRef.value.setErrors(errors)
    return false
  }
  return true
}

// Pattern B: ref (6 files) — inconsistent, cùng logic nhưng dùng ref thay reactive
const formErrors = ref<Record<string, string>>({})
// ... tương tự nhưng truy cập qua .value
```

### 13 file vi phạm:

| # | File | Pattern |
|---|------|---------|
| 1 | `FE/app/pages/quick-order.vue` | ref (B) |
| 2 | `FE/app/pages/admin/change-password.vue` | reactive (A) |
| 3 | `FE/app/pages/admin/profile.vue` | reactive (A) |
| 4 | `FE/app/pages/admin/products/edit.vue` | reactive (A) |
| 5 | `FE/app/pages/admin/products/categories.vue` | reactive (A) |
| 6 | `FE/app/pages/admin/products/reviews.vue` | ref (B) |
| 7 | `FE/app/pages/admin/inventory/index.vue` | reactive (A) |
| 8 | `FE/app/pages/admin/debt/pay.vue` | reactive (A) |
| 9 | `FE/app/pages/auth/admin/forgot-password.vue` | reactive (A) |
| 10 | `FE/app/pages/auth/admin/reset-password.vue` | reactive (A) |
| 11 | `FE/app/components/features/admin/system/SystemConfigFormDrawer.vue` | reactive (A) |
| 12 | `FE/app/components/features/admin/customers/CustomerFormDrawer.vue` | reactive (A) |
| 13 | `FE/app/components/features/admin/customers/AddressFormModal.vue` | reactive (A) |

### ✅ ĐỀ XUẤT: Tạo composable `useZodForm(schema)`

Gộp toàn bộ boilerplate thành **1 composable duy nhất** trong `FE/app/composables/useZodForm.ts`:

```ts
// composables/useZodForm.ts
import type { ZodSchema } from 'zod'

export const useZodForm = <T extends Record<string, unknown>>(schema: ZodSchema<T>) => {
  const formErrors = reactive<Record<string, string>>({})

  const formRef = ref({
    setErrors: (errors: { path: string; message: string }[]) => {
      Object.keys(formErrors).forEach((key) => delete formErrors[key])
      errors.forEach((e) => { formErrors[e.path] = e.message })
    },
    clearErrors: () => {
      Object.keys(formErrors).forEach((key) => delete formErrors[key])
    }
  })

  const validate = (state: unknown): state is T => {
    formRef.value.clearErrors()
    const result = schema.safeParse(state)
    if (!result.success) {
      formRef.value.setErrors(
        result.error.issues.map((issue) => ({
          path: issue.path[0]?.toString() || '',
          message: issue.message
        }))
      )
      return false
    }
    return true
  }

  return { formErrors, formRef, validate }
}
```

**Sau refactor**, 13 files trên chỉ cần **3 dòng** thay vì ~20 dòng:

```ts
const schema = z.object({ ... })
const { formErrors, formRef, validate } = useZodForm(schema)
// validate(state) thay cho validateForm()
```

**Ước lượng thời gian refactor:** 45 phút (tạo composable + sửa 13 files)

---

## 🟠 DUP-BE-01: HAI PATTERN PARSE PAGINATION KHÁC NHAU

### Mô tả vấn đề

Backend có **2 cách khác nhau** để đọc `page` và `limit` từ request — tạo ra sự không nhất quán:

### Pattern A: `request.input()` trực tiếp (KHÔNG validate) — 6 controllers

```ts
const page = request.input('page', 1)
const limit = request.input('limit', 20)
```

| File |
|------|
| `users_controller.ts` |
| `system_configs_controller.ts` |
| `raw_materials_controller.ts` |
| `driver_orders_controller.ts` |
| `customer_orders_controller.ts` |
| `admin_orders_controller.ts` |

### Pattern B: `paginationValidator` (có validate VineJS) — 4 controllers

```ts
const { page, limit } = await request.validateUsing(paginationValidator, {
  data: request.qs(),
})
```

| File |
|------|
| `categories_controller.ts` |
| `product_reviews_controller.ts` |
| `posts_controller.ts` |
| `customer_prices_controller.ts` |

### ✅ ĐỀ XUẤT: Thống nhất tất cả sang `paginationValidator`

6 controllers dùng Pattern A cần chuyển sang Pattern B để:
- Đảm bảo `page` và `limit` luôn là số dương hợp lệ (Rule §3 — VineJS validate mọi input)
- Tránh user truyền `page=-1` hoặc `limit=99999` (hiện chỉ service chặn `safeLimit`, nhưng `page` không ai validate)

**Ước lượng thời gian:** 20 phút

---

## 🟡 DUP-BE-02: `safeLimit = Math.min(limit, Pagination.MAX_LIMIT)` LẶP 14 LẦN

### Mô tả vấn đề

Dòng `const safeLimit = Math.min(limit, Pagination.MAX_LIMIT)` xuất hiện **14 lần** ở 11 services, thậm chí không nhất quán:
- 8 chỗ viết: `Math.min(limit, Pagination.MAX_LIMIT)`
- 6 chỗ viết: `Math.min(limit, Pagination.MAX_LIMIT || 100)` — thừa `|| 100` vì `MAX_LIMIT` đã có giá trị

### 14 chỗ vi phạm:

| File | Biến thể |
|------|----------|
| `product_service.ts` (3 lần) | `Pagination.MAX_LIMIT` |
| `product_review_service.ts` (2 lần) | `Pagination.MAX_LIMIT` |
| `post_service.ts` | `Pagination.MAX_LIMIT` |
| `category_service.ts` | `Pagination.MAX_LIMIT` |
| `customer_price_service.ts` | `Pagination.MAX_LIMIT` |
| `admin_order_service.ts` | `Pagination.MAX_LIMIT \|\| 100` |
| `notification_service.ts` | `Pagination.MAX_LIMIT \|\| 100` |
| `raw_material_service.ts` | `Pagination.MAX_LIMIT \|\| 100` |
| `system_config_service.ts` | `Pagination.MAX_LIMIT \|\| 100` |
| `transaction_service.ts` | `Pagination.MAX_LIMIT \|\| 100` |
| `user_service.ts` | `Pagination.MAX_LIMIT \|\| 100` |

### ✅ ĐỀ XUẤT: Tạo helper function `getSafeLimit()` trong Pagination Enum

```ts
// BE/app/enums/pagination.ts (thêm vào)
export function getSafeLimit(limit: number): number {
  return Math.min(Math.max(limit, 1), Pagination.MAX_LIMIT)
}
```

Hoặc nếu đã dùng `paginationValidator` thống nhất (như DUP-BE-01), thì validator đã đảm bảo `limit` hợp lệ trước khi vào Service → **giảm nhu cầu `safeLimit` ở service layer**.

> ⚠️ Theo Rule §17 (DRY): "Không tạo abstraction nếu chưa có nhu cầu rõ ràng. Chỉ trừu tượng hóa khi có từ 2–3 nơi sử dụng chung." → 14 chỗ là quá đủ để abstract.

**Ước lượng thời gian:** 15 phút

---

## 🟡 DUP-FE-02: SEARCH DEBOUNCE — 2 PATTERN KHÁC NHAU

### Mô tả vấn đề

Codebase FE có **2 cách khác nhau** để debounce search:

### Pattern A: Tự viết `setTimeout` (2 files)
```ts
// orders/index.vue
let searchTimeout: ReturnType<typeof setTimeout> | null = null
watch(search, (val) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    searchDebounce.value = val
  }, 500)
})
```

| File |
|------|
| `FE/app/pages/admin/orders/index.vue` |
| `FE/app/pages/admin/products/index.vue` (search watch trực tiếp, không debounce) |

### Pattern B: `refDebounced` từ VueUse (1 file)
```ts
// customers/index.vue
const debouncedSearch = refDebounced(search, 300)
```

| File |
|------|
| `FE/app/pages/admin/customers/index.vue` |

### ✅ ĐỀ XUẤT: Thống nhất dùng `refDebounced` từ VueUse

VueUse đã được cài sẵn trong dự án. Dùng `refDebounced` ngắn gọn hơn, tự cleanup, và type-safe:

```ts
const debouncedSearch = refDebounced(search, 300)
```

Xóa bỏ toàn bộ code `setTimeout` + `clearTimeout` thủ công.

**Ước lượng thời gian:** 10 phút

---

## 🟡 DUP-FE-03: ADMIN LIST PAGE PATTERN — KHÔNG CẦN ABSTRACT THÊM

### Đánh giá

Các trang admin list (orders, products, customers) có cấu trúc tương tự:
1. Khai báo filters (search, status, page, limit)
2. Computed `fetchParams`
3. `useAsyncData` với `watch: [fetchParams]`
4. Normalize pagination response

Tuy nhiên, **mỗi trang có logic filter rất khác nhau** (orders có dateRange, products có categoryFilter, customers có roleFilter). Việc tạo `useAdminList()` generic sẽ quá phức tạp và vi phạm Rule §17 "Không Over-Abstraction".

> ✅ **KẾT LUẬN:** Giữ nguyên, không cần abstract. Đây là sự lặp lại **hợp lý** vì logic filter khác biệt đáng kể giữa các trang.

---

## 🟡 DUP-BE-03: RESPONSE FORMAT `{ success, message, data }` — KHÔNG CẦN ABSTRACT

### Đánh giá

Tất cả 31 controllers đều trả về format `{ success: true, message: '...', data }`. Đây là pattern **nhất quán và cố ý** (Rule §16.19). Việc tạo helper `successResponse(data, message)` có thể giảm vài dòng code nhưng:

- Ít lợi ích vì IDE đã autocomplete
- Giảm tính tường minh của từng endpoint
- Chưa đủ phức tạp để justify abstraction

> ✅ **KẾT LUẬN:** Giữ nguyên. Consistency tốt, không cần abstract thêm.

---

## 📋 BẢNG TỔNG HỢP ĐỀ XUẤT BƯỚC 2

| # | Mã | Vấn đề | Đề xuất | Files ảnh hưởng | Ước lượng |
|---|-----|--------|---------|-----------------|-----------|
| 1 | DUP-FE-01 | Form boilerplate lặp 13 lần | Tạo `useZodForm(schema)` composable | 13 files | 45 phút |
| 2 | DUP-BE-01 | 2 pattern parse pagination | Thống nhất sang `paginationValidator` | 6 controllers | 20 phút |
| 3 | DUP-BE-02 | `safeLimit` lặp 14 lần, inconsistent | Tạo `getSafeLimit()` helper | 11 services | 15 phút |
| 4 | DUP-FE-02 | 2 cách debounce search | Thống nhất dùng `refDebounced` VueUse | 2 files | 10 phút |
| 5 | DUP-FE-03 | Admin list page pattern | ❌ KHÔNG abstract — hợp lý | - | - |
| 6 | DUP-BE-03 | Response format lặp | ❌ KHÔNG abstract — nhất quán | - | - |

**Tổng Bước 2: 4 đề xuất cần thực hiện | Ước tính: ~1.5 giờ**

---
---

# ⚡ BƯỚC 3: TỐI ƯU HIỆU NĂNG & KIẾN TRÚC (OPTIMIZATION)

## 📊 TÓM TẮT PHÁT HIỆN BƯỚC 3

| Hạng mục | Kết quả | Verdict |
|----------|---------|---------|
| FE: `useFetch` vs `$fetch` vs `useAsyncData` | ✅ **PASS** — 0 vi phạm | Tốt |
| FE: `$fetch` trong `<script setup>` top-level | ✅ **PASS** — 0 vi phạm | Tốt |
| BE: `.select()` trên query | ✅ **PASS** — 120+ chỗ dùng đúng | Tốt |
| BE: `.paginate()` cho list API | ✅ **PASS** — 15 services | Tốt |
| BE: `.preload()` có `.select()` bên trong | ✅ **PASS** — 38 chỗ đúng chuẩn | Tốt |
| BE: Missing DB Indexes | ⚠️ **6 index thiếu** | Cần bổ sung |
| FE: `await useAsyncData` blocking | ⚠️ **4 chỗ** blocking navigation | Cần review |
| FE: Waterfall requests (tuần tự) | ⚠️ **2 trang** parallel fetch tốt hơn | Nên tối ưu |
| BE: `InventoryService.getHistory()` thiếu `.select()` | ⚠️ Đã phát hiện ở Bước 1 | Đã report |

---

## ✅ FE: KIỂM TRA `useFetch` vs `$fetch` — ĐẠT CHUẨN

### Kết luận: **PASS 100%**

Toàn bộ FE codebase tuân thủ đúng Rule FE §4:

| Pattern | Số lượng | Đúng/Sai | Ghi chú |
|---------|----------|----------|---------|
| `useAsyncData()` trong `<script setup>` | **50 chỗ** | ✅ Đúng | Dùng cho data fetching khi component mount |
| `$fetch()` trong `<script setup>` top-level | **0 chỗ** | ✅ Đúng | Không tìm thấy vi phạm |
| `useFetch()` | **0 chỗ** | ℹ️ Không dùng | Dự án thống nhất dùng `useAsyncData` + service layer |
| `$fetch()` trong event handlers | ✅ Qua `ApiClient` | ✅ Đúng | Tất cả API calls qua `ApiClient` wrapper |

> **Nhận xét:** Dự án đã **chuẩn hóa tuyệt đối** pattern data fetching:
> - **Đọc dữ liệu (GET):** `useAsyncData('key', () => service.method())` — SSR-friendly, có cache key, có `watch` option.
> - **Ghi dữ liệu (POST/PUT/DELETE):** Qua `ApiClient.post/put/del()` bên trong event handlers — đúng rule.
> - **Không dùng `useFetch` trực tiếp** → Tránh vấn đề auto-duplicate keys khi SSR → CSR hydration.

---

## ⚠️ FE: `await useAsyncData` BLOCKING NAVIGATION — 4 CHỖ

### Mô tả vấn đề

`await useAsyncData(...)` **block page navigation** cho đến khi data fetch xong. Khác với `useAsyncData(...)` (không `await`) — SSR vẫn chờ nhưng client-side navigation không bị block.

| # | File | Dòng | Code |
|---|------|------|------|
| 1 | `FE/app/pages/quick-order.vue` | 60 | `await useAsyncData('clientCategories', ...)` |
| 2 | `FE/app/pages/quick-order.vue` | 65 | `await useAsyncData('clientProducts', ...)` |
| 3 | `FE/app/pages/admin/system/index.vue` | 42 | `await useAsyncData(...)` |
| 4 | `FE/app/components/landing/LandingTestimonials.vue` | 6 | `await useAsyncData('featured-reviews', ...)` |

### Phân tích

- **`quick-order.vue` (2 chỗ):** Page cần categories + products trước khi render → `await` là **hợp lý** vì UX yêu cầu dữ liệu sẵn sàng. Tuy nhiên, 2 calls chạy **tuần tự** thay vì **song song**.
- **`admin/system/index.vue`:** Admin page, `await` chấp nhận được.
- **`LandingTestimonials.vue`:** Component con trên landing page — `await` block cả landing page render. **Nên bỏ `await`** để component tự loading.

### ✅ ĐỀ XUẤT

| File | Hành động | Ước lượng |
|------|-----------|-----------|
| `quick-order.vue` | Giữ `await` nhưng dùng `Promise.all()` để fetch song song 2 API | 5 phút |
| `LandingTestimonials.vue` | Bỏ `await`, để component tự hiển thị skeleton/loading | 5 phút |
| `admin/system/index.vue` | Giữ nguyên `await` — admin page chấp nhận blocking | - |

---

## ⚠️ FE: WATERFALL REQUESTS — 2 TRANG CÓ THỂ TỐI ƯU

### Trang `admin/customers/[id].vue` — 4 API calls tuần tự

```ts
// Hiện tại: 4 useAsyncData chạy ĐỒNG THỜI (không await) → OK
const { data: ordersData } = useAsyncData(...)       // Call 1
const { data: transactionsData } = useAsyncData(...)  // Call 2
const { data: customerData } = useAsyncData(...)      // Call 3
const { data: addressesData } = useAsyncData(...)     // Call 4
```

> ✅ **PASS** — 4 calls không có `await` → Nuxt tự chạy song song trên SSR. Đúng chuẩn.

### Trang `products/[slug].vue` — Fetch chain hợp lý

```ts
const { data: productRes } = useAsyncData(...)        // Call 1: Product
const { data: reviewsRes } = useAsyncData(..., { lazy: true })  // Call 2: Reviews (lazy)
const { data: relatedRes } = useAsyncData(..., { watch: [product.categoryId] })  // Call 3: Related (dependent)
```

> ✅ **PASS** — Reviews dùng `lazy: true` (load sau), Related dùng `watch` (chờ product load xong) → Pattern đúng chuẩn dependency chain.

---

## ✅ BE: KIỂM TRA QUERY ORM — ĐẠT CHUẨN

### `.select()` — 120+ chỗ dùng đúng

| Service | Số lần `.select()` | Verdict |
|---------|-------------------|---------|
| `product_service.ts` | 14 | ✅ |
| `product_review_service.ts` | 10 | ✅ |
| `admin_order_service.ts` | 6 | ✅ |
| `user_service.ts` | 7 | ✅ |
| `transaction_service.ts` | 5 | ✅ |
| `post_service.ts` | 4 | ✅ |
| `notification_service.ts` | 1 | ✅ |
| `raw_material_service.ts` | 3 | ✅ |
| `system_config_service.ts` | 2 | ✅ |
| `driver_route_service.ts` | 4 | ✅ |
| **inventory_service.ts** (`getHistory`) | **0** | ❌ Đã report BUG-BE-05 |

> **Kết luận:** Chỉ **1 chỗ** thiếu `.select()` (đã report ở Bước 1 BUG-BE-05). Còn lại **tuyệt đối tuân thủ**.

### `.paginate()` — 15 chỗ dùng đúng

| Service | Method | Verdict |
|---------|--------|---------|
| `admin_order_service.ts` | `getOrders()` | ✅ |
| `category_service.ts` | `paginate()` | ✅ |
| `customer_price_service.ts` | `getByUserId()` | ✅ |
| `notification_service.ts` | `getUserNotifications()` | ✅ |
| `post_service.ts` | `adminList()` | ✅ |
| `product_review_service.ts` | `getByProduct()`, `adminList()` | ✅ |
| `product_service.ts` | `adminList()`, `clientList()`, `getByCategory()` | ✅ |
| `raw_material_service.ts` | `getRawMaterials()` | ✅ |
| `system_config_service.ts` | `getAll()` | ✅ |
| `transaction_service.ts` | `getTransactions()` | ✅ |
| `user_service.ts` | `getAll()` | ✅ |

> **Kết luận:** **100% list API** đã dùng `.paginate()` kết hợp `safeLimit`. **PASS.**

### `.preload()` — 38 chỗ dùng đúng, tất cả có `.select()` bên trong

```ts
// Example pattern đúng chuẩn (xuất hiện 38 lần):
.preload('user', (q) => q.select('id', 'full_name', 'phone_number'))
.preload('category', (q) => q.select('id', 'name', 'slug'))
.preload('images', (q) => q.select('id', 'file_url', 'alt_text').orderBy('displayOrder'))
```

**Ngoại lệ duy nhất:**

| File | Dòng | Code |
|------|------|------|
| `admin_order_service.ts` | 140 | `.preload('shippingAddress')` — không có `.select()` bên trong |

> Risk thấp vì `addresses` table chỉ có ~7 cột, nhưng nên thêm `.select()` cho nhất quán.

---

## 🔴 BE: MISSING DATABASE INDEXES — 6 INDEX THIẾU

### Phân tích

Tôi đã cross-reference toàn bộ **29 migration files** với các **query pattern phổ biến** trong services. Phát hiện **6 index quan trọng bị thiếu**:

### IDX-01: `orders.status` — THIẾU INDEX ❌

**Migration hiện tại:** `table.enum('status', ...)` — **KHÔNG CÓ `.index()`**

**Query sử dụng cột này:**
| Service | Query |
|---------|-------|
| `dashboard_service.ts` | `.where('status', OrderStatus.DELIVERED)` — 5 chỗ |
| `admin_order_service.ts` | `.where('status', filters.status)` |
| `customer_dashboard_controller.ts` | `.whereNotIn('status', [...])` |
| `inventory_service.ts` | `.where('type', InventoryType.OUT)` |
| `export_service.ts` | Filter by status |

**Impact:** Bảng `orders` là bảng được query nhiều nhất. Full table scan trên `status` khi data lớn sẽ gây **slow query nghiêm trọng**.

---

### IDX-02: `orders.created_at` — THIẾU INDEX ❌

**Migration hiện tại:** `table.timestamp('created_at')` — **KHÔNG CÓ `.index()`**

**Query sử dụng cột này:**
| Service | Query |
|---------|-------|
| `dashboard_service.ts` | `.where('created_at', '>=', ...)` — 4 chỗ |
| `admin_order_service.ts` | `.where('created_at', '>=', ...)`, `.orderBy('created_at', 'desc')` |
| `export_service.ts` | `.where('created_at', '>=', ...)` |
| `customer_dashboard_controller.ts` | `.where('created_at', '>=', ...)` |

**Impact:** Mọi list/filter/dashboard API đều lọc theo date range. Composite index `(status, created_at)` sẽ cover cả 2 trường hợp.

---

### IDX-03: `inventory_logs.type` — THIẾU INDEX ❌

**Migration hiện tại:** `table.enum('type', ...)` — **KHÔNG CÓ `.index()`**

**Query sử dụng:**
```ts
// inventory_service.ts:137
.where('type', InventoryType.OUT)
```

---

### IDX-04: `inventory_logs.created_at` — THIẾU INDEX ❌

**Migration hiện tại:** `table.timestamp('created_at')` — **KHÔNG CÓ `.index()`**

**Query sử dụng:**
```ts
// inventory_service.ts:155-159
.where('created_at', '>=', filters.startDate)
.groupByRaw('DATE(created_at)')
.orderBy('date', 'asc')
```

---

### IDX-05: `customer_prices` — THIẾU COMPOSITE UNIQUE INDEX `(user_id, product_id)` ❌

**Migration hiện tại:** `user_id` và `product_id` có index riêng lẻ, nhưng **thiếu unique constraint** trên cặp `(user_id, product_id)`.

**Rủi ro:** Có thể tạo 2 bản ghi giá riêng cho cùng 1 customer + 1 product → sai nghiệp vụ. Service có thể dùng `updateOrCreate` nhưng DB level không enforce.

---

### IDX-06: `transactions.transaction_date` — THIẾU INDEX ❌

**Migration hiện tại:** `table.timestamp('transaction_date')` — **KHÔNG CÓ `.index()`**

**Query sử dụng:**
```ts
// transaction_service.ts - orderBy('transaction_date', 'desc')
// Có filter by date range trong admin
```

---

### ✅ ĐỀ XUẤT: Tạo migration bổ sung index

```ts
// database/migrations/xxx_add_missing_indexes.ts
export default class extends BaseSchema {
  async up() {
    // IDX-01 + IDX-02: Composite index cho Dashboard + Order List
    this.schema.alterTable('orders', (table) => {
      table.index(['status', 'created_at'], 'idx_orders_status_created_at')
      table.index(['created_at'], 'idx_orders_created_at')
    })

    // IDX-03 + IDX-04: Inventory filtering
    this.schema.alterTable('inventory_logs', (table) => {
      table.index(['type', 'created_at'], 'idx_inventory_logs_type_created_at')
    })

    // IDX-05: Unique constraint cho customer prices
    this.schema.alterTable('customer_prices', (table) => {
      table.unique(['user_id', 'product_id'], 'uq_customer_prices_user_product')
    })

    // IDX-06: Transaction date sorting
    this.schema.alterTable('transactions', (table) => {
      table.index(['transaction_date'], 'idx_transactions_date')
    })
  }
}
```

**Ước lượng thời gian:** 15 phút (tạo migration + test)

---

## ✅ BE: INDEXES ĐÃ CÓ — ĐÁNH GIÁ TỐT

| Bảng | Cột có index | Verdict |
|------|-------------|---------|
| `orders` | `user_id`, `shipping_address_id`, `driver_id` | ✅ FK indexes |
| `order_items` | `order_id`, `product_id` | ✅ FK indexes |
| `products` | `category_id`, `slug` (unique) | ✅ |
| `users` | `phone_number` (unique) | ✅ |
| `posts` | `blog_category_id`, `author_id`, `slug` (unique), `is_published` | ✅ |
| `product_reviews` | `product_id`, `user_id` | ✅ |
| `notifications` | `user_id`, `is_read` | ✅ |
| `refresh_tokens` | `user_id`, `token` (unique) | ✅ |
| `password_resets` | `phone_number` | ✅ |
| `administrative_divisions` | `parent_code`, `level` | ✅ |

---

## ⚠️ BE: `.preload('shippingAddress')` THIẾU `.select()` — 1 CHỖ

| File | Dòng | Code |
|------|------|------|
| `admin_order_service.ts` | 140 | `.preload('shippingAddress')` |

> Nên sửa thành: `.preload('shippingAddress', (q) => q.select('id', 'address_line', 'ward', 'province'))`

Ước lượng: 2 phút.

---

## 📋 BẢNG TỔNG HỢP ĐỀ XUẤT BƯỚC 3

| # | Mã | Hạng mục | Đề xuất | Ước lượng |
|---|-----|----------|---------|-----------|
| 1 | IDX-01 | `orders.status` thiếu index | Tạo composite index `(status, created_at)` | 15 phút |
| 2 | IDX-02 | `orders.created_at` thiếu index | Gộp vào IDX-01 | (gộp) |
| 3 | IDX-03 | `inventory_logs.type` thiếu index | Tạo composite index `(type, created_at)` | (gộp) |
| 4 | IDX-04 | `inventory_logs.created_at` thiếu index | Gộp vào IDX-03 | (gộp) |
| 5 | IDX-05 | `customer_prices` thiếu unique constraint | Thêm `unique(user_id, product_id)` | (gộp) |
| 6 | IDX-06 | `transactions.transaction_date` thiếu index | Thêm index | (gộp) |
| 7 | OPT-FE-01 | `quick-order.vue` 2 API call tuần tự | Dùng `Promise.all()` fetch song song | 5 phút |
| 8 | OPT-FE-02 | `LandingTestimonials.vue` blocking `await` | Bỏ `await` để không block landing render | 5 phút |
| 9 | OPT-BE-01 | `.preload('shippingAddress')` thiếu `.select()` | Thêm `.select()` | 2 phút |

**Tổng Bước 3: 9 đề xuất | Ước tính: ~0.5 giờ** (phần lớn gộp vào 1 migration)

---

## 📊 TỔNG KẾT TOÀN BỘ 3 BƯỚC

| Bước | Vấn đề | Ước tính fix |
|------|--------|-------------|
| Bước 1: Critical Audit | 6 CRITICAL + 5 HIGH + 4 MEDIUM | ~2.5 giờ |
| Bước 2: Duplicate & Refactor | 4 đề xuất abstract + 2 "giữ nguyên" | ~1.5 giờ |
| Bước 3: Hiệu năng & Kiến trúc | 6 index thiếu + 3 tối ưu FE/BE | ~0.5 giờ |
| **TỔNG CỘNG** | **28 vấn đề** | **~4.5 giờ** |

### 🏆 ĐÁNH GIÁ TỔNG THỂ CODEBASE

| Tiêu chí | Điểm | Nhận xét |
|----------|------|---------|
| **Kiến trúc (Architecture)** | ⭐⭐⭐⭐ 8/10 | DI pattern chuẩn, Layered Architecture rõ ràng, chỉ 3 controllers nhỏ vi phạm |
| **Bảo mật (Security)** | ⭐⭐⭐⭐ 8/10 | Không mass assignment, VineJS validate, chỉ 1 chỗ SQL interpolation risk thấp |
| **Hiệu năng (Performance)** | ⭐⭐⭐⭐ 7.5/10 | `.select()` + `.paginate()` chuẩn, nhưng thiếu 6 DB index quan trọng |
| **Code Quality (DRY)** | ⭐⭐⭐ 7/10 | Form boilerplate lặp 13 lần, pagination pattern inconsistent |
| **Type Safety** | ⭐⭐⭐ 7/10 | Dashboard service có 17 `any`, nhưng còn lại rất tốt |
| **SSR Safety (FE)** | ⭐⭐⭐⭐⭐ 10/10 | Không rò rỉ SSR, không global ref, đúng pattern `useAsyncData` |
| **Fetch Pattern (FE)** | ⭐⭐⭐⭐⭐ 10/10 | 0 vi phạm `$fetch` top-level, thống nhất `useAsyncData` + service layer |

> **Điểm tổng: 8.2/10** — Codebase chất lượng tốt, có nền tảng kiến trúc vững. Các vấn đề phát hiện phần lớn là convention violations và missing indexes — dễ sửa, không ảnh hưởng đến tính đúng đắn của nghiệp vụ.

> **Chờ lệnh** để tiến hành sửa toàn bộ issues đã phát hiện trong 3 bước.
