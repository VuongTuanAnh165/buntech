# Buntech FE - Hướng dẫn Lập trình Nuxt 3/4 Enterprise (Dành cho AI & Lập trình viên)

Tài liệu này chứa các quy tắc code nghiêm ngặt và tiêu chuẩn kiến trúc cho dự án Nuxt.js Enterprise.
Tất cả các AI Agents (Antigravity, Cursor, Cline, Claude, v.v.) và Lập trình viên **BẮT BUỘC** phải tuân thủ các quy tắc này để đảm bảo mã nguồn luôn dễ bảo trì, bảo mật, tối ưu hiệu năng và đúng chuẩn Nuxt 4 / Vue 3.5 hiện đại.

---

## 🛑 QUY TẮC TỐI THƯỢNG CHO AI (AI RULES - ALWAYS DO THIS)

Khi sinh code, AI **LUÔN LUÔN** phải nhớ:

- **Tái sử dụng code (DRY Principle):** TRƯỚC KHI tạo một component mới, utils mới hay composable mới, BẮT BUỘC phải tìm kiếm trong dự án xem đã có component/chức năng tương tự chưa. KHÔNG BAO GIỜ duplicate code. Cố gắng tham số hóa (parameterize) component hiện có bằng cách truyền thêm Props thay vì tạo file mới.
- **Ưu tiên Nuxt UI v4:** Luôn sử dụng các component của Nuxt UI (VD: `UButton`, `UCard`, `UInput`, `UForm`, `UTable`...) thay vì dùng thẻ HTML thuần (không dùng `<button class="...">` nếu có thể dùng `<UButton>`).
- **Không bao giờ import thủ công API của Vue/Nuxt:** (VD: `ref`, `computed`, `watch`, `useState`, `useFetch`). Hãy để cơ chế Auto-imports của Nuxt tự lo.
- **Sử dụng `$fetch` / `useFetch` thay vì Axios:** Không sử dụng `axios` trừ khi dự án đã bắt buộc phụ thuộc vào nó.
- **An toàn SSR (Server-Side Rendering):**
  - Tuyệt đối **KHÔNG** gọi `window`, `document` hoặc `localStorage` trực tiếp ở cấp cao nhất của `<script setup>` vì sẽ gây lỗi SSR.
  - Sử dụng `<ClientOnly>` trên template hoặc kiểm tra `import.meta.client` trong logic nếu cần dùng API của trình duyệt.
- **Điều hướng (Navigation):** Luôn ưu tiên dùng `navigateTo()` thay cho `router.push()`.
- **Meta & Cấu hình:**
  - Sử dụng `definePageMeta()` để thiết lập layout/middleware.
  - Sử dụng `useSeoMeta()` cho SEO thay vì `useHead()` thông thường.
  - Sử dụng `useRuntimeConfig()` để lấy biến môi trường, tuyệt đối không dùng `process.env` ở phía Client.
- **Kiến trúc Capacitor (Mobile App):** Luôn nhớ rằng dự án này sẽ build ra Mobile App bằng Capacitor. Hãy chú ý bọc các code gọi Native API trong khối Client-side an toàn và thiết kế giao diện Mobile-First.

---

## 1. Quy tắc Đặt tên (Naming Conventions)

- **Components:** `PascalCase` và luôn từ 2 từ trở lên (VD: `TheHeader.vue`, `ProductCard.vue`). Hãy gom nhóm vào thư mục con nếu cần thiết (VD: `components/checkout/CheckoutForm.vue`).
- **Composables:** `camelCase` với tiền tố `use` (VD: `useAuth.ts`, `useCart.ts`). Dành cho logic có chứa trạng thái (stateful).
- **Utils:** `camelCase` (VD: `formatCurrency.ts`). Dành cho các hàm thuần (pure functions) không chứa trạng thái.
- **Pages & Layouts:** `kebab-case` (VD: `pages/user-profile/main-page.vue`).
- **Server Routes (Nitro):** `kebab-case` kết hợp với phương thức HTTP (VD: `server/api/v1/user-info.get.ts`).

---

## 2. Cấu trúc file `.vue` (SFC)

- Luôn sử dụng kiến trúc: `<script setup lang="ts">`, `<template>`, và `<style scoped>`.
- Thứ tự khai báo trong `script setup`:
  1. Types / Interfaces
  2. Props & Emits (`defineProps`, `defineEmits`)
  3. `defineModel` (Chỉ dùng khi thực sự cần two-way binding)
  4. Reactive State (`ref`, `reactive`, `useState`)
  5. Computed Properties
  6. Watchers
  7. Event Handlers / Logic functions
  8. Lifecycle Hooks (`onMounted`, `onUnmounted`...)

> ❌ **CODE XẤU (Lộn xộn, gọi sai Lifecycle)**

```vue
<template>
  <button @click="run">{{ text }}</button>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue' // Thừa do Auto-import
const props = defineProps(['msg'])
onMounted(() => console.log('Init')) // Viết chen giữa các logic khác
const text = ref('Click')
function run() {}
</script>
```

> ✅ **CODE CHUẨN (Phân cấp tường minh, khai báo Type an toàn)**

```vue
<script setup lang="ts">
interface Props {
  msg: string
}
const props = withDefaults(defineProps<Props>(), { msg: 'Default' })
const text = ref<string>('Click')
const run = () => {
  console.log(props.msg)
}
</script>
<template>
  <UButton @click="run">{{ text }}</UButton>
</template>
```

_Lưu ý về `defineModel`:_ Chỉ ưu tiên sử dụng `defineModel` khi component thực sự cần phơi bày (expose) two-way binding (v-model) như `Input`, `Select`, `Modal`. Không lạm dụng cho các component hiển thị thông thường như `ProductCard`.

---

## 3. Kiến trúc State (Trạng thái) & Ngăn chặn Rò rỉ SSR

- **CỰC KỲ QUAN TRỌNG:** Tuyệt đối không khai báo biến global bên ngoài thân hàm composable (VD: `const user = ref()`) vì nó sẽ gây rò rỉ dữ liệu chéo giữa các người dùng trên môi trường SSR.
- **Request-bound State:** Sử dụng `useState<Type>('key', () => init)` để chia sẻ state cục bộ trong 1 request an toàn trên SSR.
- **Global State:** Sử dụng `Pinia` cho các state phức tạp, dùng chung toàn cục (User, Cart).
- **Local State:** Truyền từ trên xuống (Props down), bắn sự kiện từ dưới lên (Events up).

> ❌ **CODE XẤU (Gây rò rỉ dữ liệu người dùng cực kỳ nghiêm trọng trên SSR)**

```ts
// composables/useWrongAuth.ts
const user = ref(null) // SAI LẦM CHẾT NGƯỜI: Biến global chia sẻ xuyên request!
export const useWrongAuth = () => {
  return { user }
}
```

> ✅ **CODE CHUẨN (Sử dụng useState bảo vệ Session cô lập)**

```ts
// composables/useAuth.ts
export const useAuth = () => {
  // useState tạo mã định danh duy nhất theo từng request session độc lập
  const user = useState<User | null>('auth-user', () => null)
  const setUser = (data: User) => {
    user.value = data
  }
  return { user, setUser }
}
```

---

## 4. Kiến trúc Lớp dữ liệu (Data Layer) & API

Enterprise App cần chia tách rõ ràng:

- **`services/`:** Nơi định nghĩa các logic gọi API thuần túy.
- **Tận dụng `ApiClient`:** Phải sử dụng class `ApiClient` (từ `~/utils/api.ts`) thay vì `$fetch` trực tiếp. `ApiClient` đã được cấu hình sẵn để tự động gắn Token, tự động Refresh Token và catch lỗi 422.
- **`composables/`:** Nơi chứa state và gọi các hàm trong thư mục `services/`.
- Tránh việc viết logic gọi API trực tiếp dải rác khắp nơi trong các Components.

> ❌ **CODE XẤU (Gọi API cứng trong UI và không dùng ApiClient)**

```vue
<script setup>
const data = await $fetch('/api/heavy-data') // Gây rối code UI, thiếu Token config
</script>
```

> ✅ **CODE CHUẨN (Tách biệt Data Layer với ApiClient)**

```ts
// services/productService.ts
import { ApiClient } from '~/utils/api'
export const fetchProducts = () => ApiClient.get('/products')

// composables/useProduct.ts
export const useProduct = () => {
  const { data } = useAsyncData('products', () => fetchProducts())
  return { data }
}
```

---

## 5. Fetching Dữ liệu (Nuxt 4 Best Practices)

Sử dụng đúng công cụ cho đúng mục đích:

- **`useFetch`:** Dùng cho SSR fetching ngay lúc khởi tạo component.
  - _Lưu ý về `lazy: true`:_ Chỉ dùng cho các dữ liệu **không quan trọng cho SEO**. Đừng dùng `lazy: true` ở trang chủ hoặc các trang cần SEO mạnh vì nó sẽ trì hoãn việc render HTML tĩnh.
  - _Lưu ý về `pick`:_ Dùng để giảm payload (chỉ lấy các trường cần thiết từ API), nhưng áp dụng linh hoạt.
- **`useLazyFetch` / `useLazyAsyncData`:** Viết tắt cho `useFetch({ lazy: true })`.
- **`useAsyncData`:** Dùng khi cần wrap nhiều API calls phức tạp hoặc call qua SDK bên thứ ba.
- **`$fetch`:** Cấm dùng ở top-level của `script setup` (sẽ gây double fetching). Chỉ dùng `$fetch` trong các hàm xử lý sự kiện client-side (click, submit) hoặc trong Nitro server.
- **`callOnce()`:** Tận dụng `await callOnce('key', () => {...})` của Nuxt 4 để chạy logic setup khởi tạo một lần duy nhất, tránh chạy lại trên client.

> ❌ **CODE XẤU (Gây trùng lặp Request và Hydration Mismatch)**

```vue
<script setup lang="ts">
const products = ref([])
// Sai: Client thực thi lại request mạng một lần nữa dù Server đã có dữ liệu
products.value = await $fetch('/api/products')
</script>
```

> ✅ **CODE CHUẨN (Truyền tải Payload an toàn, tối ưu SEO hoặc chạy 1 lần)**

```vue
<script setup lang="ts">
// Cách 1: Dữ liệu kết xuất trên Server và truyền JSON xuống Client
const { data } = await useFetch('/api/products', {
  pick: ['id', 'name'] // Giảm dung lượng payload
  // lazy: true // Chỉ bật nếu không cần index SEO ngay lập tức
})

// Cách 2: Logic khởi tạo cấu hình (chỉ gọi 1 lần trên Server)
const config = ref(null)
await callOnce('fetch-config', async () => {
  config.value = await $fetch('/api/config')
})
</script>
```

---

## 6. Xử lý Lỗi, Middleware & Plugins

- **Error Handling:** Luôn kiểm soát lỗi chuyên nghiệp bằng cách dùng `createError({ statusCode: 404, statusMessage: 'Not Found', fatal: true })`. Sử dụng `~/error.vue` để hiển thị lỗi, `clearError({ redirect: '/' })` để xóa lỗi, và `useError()` để bắt lỗi.
- **Route Middleware (`middleware/`):** Luôn bảo vệ các trang yêu cầu quyền hạn bằng middleware (VD: `middleware/auth.ts`, `middleware/guest.ts`). Áp dụng qua `definePageMeta({ middleware: ['auth'] })`.
- **Plugins (`plugins/`):** Nơi khởi tạo các thư viện bên thứ 3 hoặc inject các hàm global (VD: `$api`, `$dayjs`).

---

## 7. Xử lý Form & Bắt lỗi tự động (Nuxt UI + Zod)

Hệ thống đã được thiết kế sẵn cơ chế **Tự động Map lỗi 422 từ Backend** thẳng lên giao diện:

- BẮT BUỘC sử dụng component bọc ngoài `<FormWrapper>` kết hợp với `<UForm>` của **Nuxt UI** và **Zod Schema**.
- BẮT BUỘC dùng composable `useFormSubmit` để thực hiện hàm submit. Truyền `formRef` vào option để composable tự động parse lỗi Validation HTTP 422 từ API và bôi đỏ các field nhập liệu.

> ✅ **CODE CHUẨN (Form tự động bắt lỗi API 422)**

```vue
<script setup lang="ts">
const formRef = ref()
const state = reactive({ email: '', password: '' })

// useFormSubmit tự động quản lý isSubmitting và map lỗi 422
const onSubmit = useFormSubmit(async (data) => await authService.login(data.email, data.password), {
  formRef, // Truyền formRef vào đây là lỗi tự động được xử lý!
  successMessage: 'Thành công'
})
</script>

<template>
  <FormWrapper ref="formRef" :schema="schema" :state="state" @submit="onSubmit">
    <UFormGroup label="Email" name="email">
      <UInput v-model="state.email" />
    </UFormGroup>
    <!-- loading state được form wrapper lo -->
    <UButton type="submit" loading>Submit</UButton>
  </FormWrapper>
</template>
```

---

## 8. API & Nitro Engine (Server-side)

- **Tách biệt hoàn toàn:** Cấm import code phía Client (Vue composables, UI components) vào thư mục `server/`.
- **Validate:** Luôn dùng **Zod** để xác thực các tham số đầu vào (Body, Query, Params) tại endpoint.
- **Caching:** Áp dụng cơ chế **SWR** bằng cách sử dụng `defineCachedEventHandler` cho các API trả về dữ liệu nặng nhưng ít thay đổi.

> ✅ **CODE CHUẨN (API Nitro an toàn tuyệt đối)**

```ts
// server/api/user.get.ts
import { z } from 'zod'
const Schema = z.object({ id: z.string().uuid() })

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, (data) => Schema.parse(data))
  return { success: true, userId: query.id }
})
```

---

## 9. SEO & Core Web Vitals

- Dùng `useSeoMeta()` thay cho `useHead()` để đảm bảo type-safe (tránh gõ sai thuộc tính).
- Cấm dùng `<img>` cho tài nguyên tĩnh, bắt buộc thay bằng `<NuxtImg>` từ `@nuxt/image`.
- Prefix tiền tố `Lazy` (VD: `<LazyMyModal />`) cho các component nặng, không ở màn hình đầu tiên (Above the fold).

---

## 10. Styling (Tailwind CSS)

- Áp dụng thứ tự class (Class Ordering): Layout -> Sizing -> Spacing -> Typography -> Visuals (sẽ được tự động hóa nhờ `prettier-plugin-tailwindcss`).
- Cố gắng chia nhỏ component (Atomic Components) thay vì lạm dụng chỉ thị `@apply` trong file CSS global làm mất đi khả năng tree-shaking của Tailwind.

---

## 11. Security (Bảo mật) & Runtime Config

- Tuyệt đối KHÔNG dùng `process.env` tại Client. Khai báo mọi biến ở `nuxt.config.ts` dưới trường `runtimeConfig`. Biến public để trong `runtimeConfig.public`.
- **Cookies:** Các cookie nhạy cảm tạo từ SSR phải set cờ an toàn: `httpOnly: true`, `secure: true`, `sameSite: 'lax'|'strict'`.
- Khuyến khích sử dụng module `nuxt-security` để thiết lập HTTP Headers tự động (CSP, HSTS).

> ❌ **CODE XẤU (Lộ Private API Key ra ngoài trình duyệt)**

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  publicApiKey: process.env.STRIPE_SECRET_KEY // Lộ hoàn toàn ra file bundle Client!
})
```

> ✅ **CODE CHUẨN (Phân cấp bảo mật tối cao)**

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    stripeSecretKey: process.env.STRIPE_SECRET_KEY, // Chỉ khả dụng ở Server (Nitro)
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL // Dùng được ở cả Client
    }
  }
})
```

---

## 12. Kiểm thử (Testing)

- **Unit Test:** Dùng `Vitest` cho các hàm utils/composables thuần.
- **Component Test:** Dùng `@nuxt/test-utils` để test UI rendering.
- **E2E:** Dùng `Playwright` cho flow toàn trình.

---

## 13. Tái sử dụng & DRY (Don't Repeat Yourself)

- **Tư duy Component-Driven:** Mọi đoạn UI xuất hiện từ 2 lần trở lên (hoặc dự đoán sẽ dùng lại) đều phải được tách thành Component độc lập trong thư mục `components/`. (Ví dụ: `BaseCard`, `SectionTitle`).
- **Logic dùng chung:** Mọi logic xử lý dữ liệu phức tạp, gọi API phải nằm ở `composables/`. Mọi logic tính toán thuần túy (format ngày tháng, tiền tệ) phải nằm ở `utils/`.
- **Nguyên tắc cho AI & Dev:** Tuyệt đối không sinh ra code rác hoặc code lặp lại. Khi nhận yêu cầu tạo chức năng mới tương tự một chức năng đã có, hãy đọc code cũ, trừu tượng hóa (abstract) nó lên để dùng chung. Hãy mở rộng các Component hiện có bằng cách truyền thêm Props (VD: `variant="solid|outline"`) thay vì copy-paste thành file mới.

> ❌ **CODE XẤU (Viết duplicate UI khắp nơi)**

```vue
<!-- Ở 3 file khác nhau đều viết khối lệnh y chang -->
<div class="flex flex-col rounded-lg border bg-white p-4 shadow-sm">...</div>
```

> ✅ **CODE CHUẨN (Biến thành Reusable Component)**

```vue
<!-- components/base/BaseCard.vue -->
<template>
  <div class="flex flex-col rounded-lg border bg-white p-4 shadow-sm">
    <slot />
  </div>
</template>
```

---

## 14. Kiến trúc Mobile App với Capacitor

Dự án này sử dụng **Capacitor** để đóng gói thành ứng dụng iOS/Android. Do đó:

- **Tránh SSR-only bugs:** Các logic gọi Native API của Capacitor (ví dụ `@capacitor/core`, `@capacitor/preferences`) bắt buộc phải bọc trong `<ClientOnly>`, gọi trong `onMounted()`, hoặc bọc bằng điều kiện kiểm tra client-side (`import.meta.client`). Capacitor KHÔNG có ngữ cảnh trên Server (Nitro).
- **Responsive & Mobile First:** Khi thiết kế UI với Tailwind, luôn bắt đầu bằng giao diện màn hình nhỏ (Mobile) làm mặc định (VD: `w-full p-4`), sau đó mới viết thêm lớp CSS cho Tablet/Desktop bằng breakpoint (VD: `md:w-1/2 md:p-8`).
- **Giao diện đặc thù:** Đảm bảo tránh các vùng khuyết (Notch, Safe Area) của điện thoại bằng các utility class phù hợp của Tailwind (nếu cấu hình) hoặc xử lý qua CSS safe-area của nền tảng.

---

## 15. Đảm bảo Chất lượng Code (Code Quality & Formatting)

Để duy trì source code sạch sẽ và tránh lỗi tiềm ẩn, các Lập trình viên và AI **BẮT BUỘC** phải tuân thủ quy trình sau trước khi hoàn thiện một task:

- **Kiểm tra Lỗi (Typecheck & Linting):** Phải chạy lệnh `npm run typecheck` và `npm run lint` để kiểm tra. Nếu phát hiện bất kỳ lỗi (errors) hoặc cảnh báo (warnings) nào từ TypeScript hay ESLint, bắt buộc phải sửa chữa triệt để.
- **Đồng bộ Format Code:** Luôn chạy lệnh `npm run format` (tích hợp sẵn Prettier) để tự động căn chỉnh lại format file, dọn dẹp syntax thừa, và chuẩn hóa thứ tự sắp xếp class của Tailwind CSS trên toàn bộ dự án.

---

## 16. TƯ DUY "PRINCIPAL ARCHITECT" & QUY LUẬT TỰ TIẾN HÓA (The Generalized Masterpiece Framework)

Để đảm bảo source code Frontend **luôn luôn** là một Kiệt tác (Masterpiece) trước mọi biến động và yêu cầu tính năng trong tương lai, mọi AI Agent BẮT BUỘC phải cài đặt tư duy (Mindset) tổng quát sau đây vào mọi dòng code sinh ra:

### A. Lập Trình Phòng Thủ Tuyệt Đối (Defensive Programming by Default)
AI tuyệt đối không được giả định rằng API Backend luôn trả về đúng dữ liệu, trình duyệt của User luôn xịn, hoặc môi trường SSR giống hệt Client.
- **Data & Types (Boundary Defense):** Không bao giờ tin tưởng mù quáng vào cấu trúc JSON từ API. Luôn bọc Nullable (`??`, `?.`), sử dụng Optional Chaining ở template để chống crash UI trắng trang. Ép kiểu tường minh và tuyệt đối nói **KHÔNG** với `any` hay `@ts-expect-error`.
- **Memory & Rendering (SPA Resilience):** Ứng dụng SPA chạy lâu dài trên trình duyệt rất dễ bị tràn RAM (Memory Leak). Luôn dọn dẹp (cleanup) các `EventListener`, `setInterval` trong hook `onUnmounted`. Tránh render hàng nghìn DOM elements cùng lúc (hãy dùng Pagination hoặc Virtual Scroll).
- **SSR Integrity & Hydration:** Phòng thủ tuyệt đối lỗi **Cross-Request State Pollution** (Rò rỉ dữ liệu phiên đăng nhập giữa các user trên Server) bằng cách không bao giờ dùng biến global. Chống lỗi **Hydration Mismatch** bằng cách cảnh giác với `window`, `document` và bọc `<ClientOnly>` ở những component gọi Native API / Browser API.

### B. Nguyên Tắc "Không Tin Tưởng Mã Cũ" (Zero-Trust Legacy Code)
- Khi User yêu cầu sửa một UI Component hay trang, AI không được "mù quáng" nhét thêm code vào.
- Hãy quét toàn bộ cây Component (từ Parent -> Children) và luồng State (Pinia). Nếu phát hiện Component cũ đang phình to (God Component), Props Drilling quá sâu, hoặc CSS Tailwind lặp lại quá nhiều, AI **có trách nhiệm** cảnh báo và đề xuất chẻ nhỏ (Refactor) thành các Reusable Components trước khi xây tính năng mới lên trên.

### C. Cơ Chế Tự Học & Tự Cập Nhật (Self-Evolution)
- Tài liệu này (`AGENTS.md`) là bộ não sống của dự án. Nếu trong quá trình code, AI vấp phải một **lỗi kiến trúc SSR mới**, tìm ra một **bug tiềm ẩn đặc thù của dự án**, hoặc đúc kết được một **Best Practice mới** của Vue 3.5 / Nuxt 4 tối ưu hơn, AI **PHẢI CHỦ ĐỘNG ĐỀ XUẤT** cập nhật quy luật đó vào file `AGENTS.md`.
- Mục tiêu: Không một AI nào ở phiên làm việc sau được phép lặp lại sai lầm kiến trúc của AI ở phiên làm việc trước.

### D. Tiêu Chuẩn Phê Duyệt Cuối Cùng (The Final Gatekeeper)
Trước khi báo cáo "Hoàn thành" với User, AI phải tự hỏi mình 1 câu duy nhất:
> *"Nếu trang web này được load trên một chiếc điện thoại 3G đời cũ, màn hình tai thỏ, liệu nó có bị giật lag không? Giao diện có vỡ nát không? Cục JavaScript tải về có nặng hàng Megabytes không? Và dữ liệu nhạy cảm có vô tình bị lộ ra mã nguồn (View Source) do lỗi SSR không?"*
Nếu có bất kỳ sự chần chừ nào, AI phải tự động quay lại bước Refactor!
