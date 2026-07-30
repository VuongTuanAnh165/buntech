# Kiến Trúc Code & Tiêu chuẩn Kỹ thuật Frontend (Nuxt 4)

**Dự án:** Chuyển đổi số Xưởng Bún BunTech
**Vai trò:** Senior Frontend Architect
**Công nghệ lõi:** Nuxt 4, Vue 3 (Composition API), TypeScript, Pinia, Yup, VueUse.
**Thư viện thiết yếu bổ sung:** `idb-keyval` (Quản lý Offline Queue), `vue-virtual-scroller` (Tối ưu render Table lớn), `vue-i18n` (Đa ngôn ngữ).

Tài liệu này định nghĩa cấu trúc mã nguồn (Codebase Structure), các tiêu chuẩn thiết kế (Design Patterns) và quy chuẩn viết code (Coding Conventions) cho toàn bộ team Frontend.

---

## 1. Folder Structure (Cấu trúc thư mục)
Sử dụng cấu trúc thư mục mới nhất của Nuxt 4 (gom các file nguồn vào thư mục `app/`), kết hợp với thư mục `core/` bên ngoài để áp dụng kiến trúc Domain-Driven Design (DDD).

```text
├── app/
│   ├── assets/        # CSS toàn cục, fonts, SCSS variables
│   ├── components/    # Vue components (Auto-imported)
│   ├── composables/   # Vue Composition API hooks
│   ├── layouts/       # Nuxt layouts
│   ├── middleware/    # Route middlewares
│   ├── pages/         # Cấu trúc Routing của ứng dụng
│   ├── plugins/       # Nuxt plugins (Khởi tạo thư viện bên thứ 3)
│   ├── stores/        # Pinia stores (Trạng thái toàn cục)
│   ├── utils/         # Các hàm tiện ích (Pure functions)
│   └── app.vue        # Entry component
├── core/              # TẦNG LOGIC NGHIỆP VỤ (Không phụ thuộc trực tiếp vào Vue)
│   ├── api/           # Cấu hình Axios/Fetch, Interceptors
│   ├── constants/     # Hằng số toàn cục
│   ├── dtos/          # Data Transfer Objects (Payload/Response schema)
│   ├── enums/         # TypeScript Enums
│   ├── mappers/       # Hàm biến đổi DTO thành Model và ngược lại
│   ├── repositories/  # Các class/function gọi API chuyên biệt
│   ├── services/      # Chứa Business Logic (Quy tắc tính toán, xử lý luồng)
│   ├── types/         # TypeScript Interfaces/Types (Models)
│   └── validators/    # Yup Schemas để validate Form
├── public/            # File tĩnh (Hình ảnh thô, favicon, robots.txt)
├── i18n/              # File ngôn ngữ (Locales)
├── tests/             # Thư mục Test (Unit/E2E)
├── nuxt.config.ts     # Cấu hình Nuxt
└── tailwind.config.ts # Cấu hình TailwindCSS
```
**Lý do:** Tách biệt phần "View/UI" (trong `app/`) khỏi phần "Logic Nghiệp vụ" (trong `core/`). Điều này giúp source code không bị trói buộc quá sâu vào Framework, dễ test (Unit test tầng `core` mà không cần mount Vue), dễ bảo trì và dễ scale khi dự án phình to.

## 2. Module Structure (Cấu trúc Module nghiệp vụ)
Tổ chức các file trong thư mục `core/` và `app/stores/` theo từng **Domain Module** (Auth, Order, Product, User, Inventory).
Ví dụ trong `core/repositories/`:
- `auth.repository.ts`
- `order.repository.ts`

**Lý do:** Tránh việc nhét hàng trăm hàm vào một file `api.ts` khổng lồ. Cách chia theo Domain giúp các team member dễ tìm kiếm file khi có bug liên quan đến một chức năng cụ thể.

## 3. Page Structure (Cấu trúc Trang)
Cấu trúc thư mục trong `app/pages/` sẽ phản ánh chính xác cấu trúc URL.
```text
pages/
├── index.vue                  # Customer Home
├── san-pham/
│   └── [slug].vue             # Customer Product Detail
├── admin/
│   ├── login.vue
│   ├── dashboard/index.vue
│   ├── orders/
│   │   ├── index.vue          # List Orders
│   │   ├── create.vue         # Tạo đơn mới
│   │   └── [id].vue           # Chi tiết đơn
```
**Lý do:** Tận dụng tối đa sức mạnh File-based Routing của Nuxt 4. Code tự minh họa cho cây thư mục URL, không cần cấu hình file `router.ts` thủ công rườm rà.

## 4. Component Structure
Chia `app/components/` thành 2 phần chính:
```text
components/
├── shared/         # Các UI Components dùng chung (Button, Modal, Input)
└── features/       # Các Component mang logic nghiệp vụ (e.g., OrderForm)
    ├── order/
    │   ├── OrderItemList.vue
    │   └── OrderSummary.vue
    └── product/
        └── ProductReviewList.vue
```
**Lý do:** `shared/` giống như một thư viện UI nội bộ (Design System), không được chứa logic gọi API. `features/` chứa các khối UI lớn, có thể nhận inject Store hoặc Service để chạy logic độc lập.

## 5. Shared Component
Các component như `AppButton.vue`, `AppTable.vue`, `AppInput.vue`. Các component này chỉ nhận `props` (Data in) và phát `emits` (Event out). Không được fetch API bên trong Shared Component.
**Lý do:** Đảm bảo tính "Dumb Component" (Component câm) để tái sử dụng ở bất kỳ đâu mà không gây side-effects (tác dụng phụ).

## 6. Feature Component
Là các "Smart Component". Ví dụ: `CustomerPriceSelect.vue` (Tự động gọi API lấy danh sách giá ưu đãi của User).
**Lý do:** Phân tách rõ trách nhiệm. Các khối UI phức tạp nếu nhét hết vào file Page sẽ khiến Page lên tới ngàn dòng code. Tách thành Feature Component giúp chia nhỏ file.

## 7. Store (Pinia)
Quản lý Global State. Tuyệt đối không dùng Store thay thế cho Component Local State.
Chỉ đưa vào Store những thứ cần share giữa nhiều trang:
- `useAuthStore` (Lưu Token, Profile).
- `useMasterDataStore` (Lưu Tỉnh/Thành phố, Enums dùng để map Select Box).
**Lý do:** Giảm thiểu bộ nhớ RAM cho trình duyệt. Dữ liệu của 1 trang (như danh sách đơn hàng) chỉ nên lưu ở Local `ref()` của trang đó, khi user sang trang khác thì data tự giải phóng (Garbage Collection).

## 8. Composable (VueUse / Nuxt Composables)
Tạo ra các Hook tái sử dụng.
- `usePagination.ts` (Quản lý page, limit, tính toán tổng số trang).
- `useSyncQuery.ts` (Đồng bộ biến filter 2 chiều với URL Query).
Sử dụng tối đa các hook có sẵn từ **VueUse** (như `useLocalStorage`, `useDebounceFn`, `useIntersectionObserver`).
**Lý do:** Mẫu thiết kế Composition API phát huy sức mạnh cao nhất qua Composables. Nó gom logic (Logic separation) thay vì gom theo vòng đời (như Mixins của Vue 2).

## 9. Service
Tầng chứa Business Logic (`core/services/order.service.ts`). Service sẽ gọi Repository để lấy data, gọi Mapper để parse data, gọi Validator để check form, sau đó trả dữ liệu hoàn chỉnh cho Component.
**Lý do:** Fat Models/Services, Skinny Controllers/Components. Component của Vue chỉ nên lo việc `v-if`, `v-for`. Mọi thuật toán (Ví dụ: Tính tiền thừa, gộp mảng sản phẩm) phải nằm ở Service.

## 10. Repository
Lớp bao bọc (Wrapper) các lời gọi HTTP (`core/repositories/user.repository.ts`).
```typescript
class UserRepository {
  getUsers(params: any) { return api.get('/admin/users', { params }); }
}
```
**Lý do:** Ẩn đi chi tiết của HTTP Client (Axios hay Fetch). Nếu sau này dự án đổi từ Axios sang Nuxt `$fetch`, chỉ cần sửa ở 1 nơi (Repository), các Service và Component không bị ảnh hưởng.

## 11. API Layer
Cấu hình Axios Instance hoặc `$fetch` Interceptors tại `core/api/index.ts`.
- **Đối với Web Admin:** Kẹp thêm Header `X-Client-Type: WEB` khi gọi Login để BE cấp `HttpOnly Cookie`. Axios cần bật `withCredentials: true`.
- **Đối với App Tài xế:** Nhận Token JSON bình thường và lưu vào Secure Storage.
- Bắt lỗi 401: Gọi hàm Logout ở AuthStore.
- Bắt lỗi 409: Bắn Event thông báo Xung đột dữ liệu.
- Bắt lỗi 400/422: Trích xuất mảng Error Messages của Backend (VineJS).
**Lý do:** Xử lý tập trung (Centralized). FE dev không phải đi gắn Header hay viết `try...catch` hiển thị Toast Error ở hàng trăm chỗ gọi API.

## 12. Type
Sử dụng TypeScript Interfaces ở thư mục `core/types/`. Định nghĩa chính xác cấu trúc dữ liệu của User, Product, Order.
**Lý do:** Bắt lỗi ngay trong lúc code (Compile time) thay vì lúc chạy (Runtime). IDE (VSCode) sẽ gợi ý code (Intellisense) rất nhanh.

## 13. DTO (Data Transfer Object)
Tạo các Type riêng cho Request Payload (`CreateOrderDTO`) và API Response. Đôi khi dữ liệu API trả về (Snake_case) không giống chuẩn FE (CamelCase).
**Lý do:** Tách biệt mô hình dữ liệu của BE và mô hình dữ liệu cần thiết của FE.

## 14. Mapper
Các hàm Pure function: `mapOrderDtoToModel(dto)`. Chuyển đổi `delivery_status` thành `deliveryStatus`, hoặc tính toán trực tiếp `totalAmount` nếu cần.
**Lý do:** Ngăn chặn việc cấu trúc Database của BE rò rỉ (leak) trực tiếp ra tận ngoài UI Component. FE làm chủ cấu trúc dữ liệu hiển thị của mình.

## 15. Validator (Yup)
Xây dựng Schema ở `core/validators/`:
```typescript
export const createOrderSchema = yup.object({
  amountCollected: yup.number().min(0, 'Số tiền không được âm'),
});
```
Truyền Schema này vào VeeValidate hoặc Vue `useForm`.
**Lý do:** Logic kiểm duyệt form (Validation) rất dài dòng. Tách ra file riêng dùng Yup giúp code component sạch sẽ, và schema Yup có thể dùng chung giữa Form Thêm mới và Form Chỉnh sửa.

## 16. Constant
Thư mục `core/constants/`. Chứa các biến Hardcode như: `DATE_FORMAT = 'DD/MM/YYYY'`, `MAX_FILE_SIZE = 5242880`.
**Lý do:** Tránh "Magic Numbers" hay "Magic Strings" nằm rải rác trong code gây khó bảo trì.

## 17. Enum
Thư mục `core/enums/`. Cùng map với BE:
```typescript
export enum OrderStatus { PENDING = 'PENDING', DELIVERED = 'DELIVERED' }
```
**Lý do:** Dùng Enum khi so sánh (`if (status === OrderStatus.DELIVERED)`) an toàn hơn nhiều so với việc gõ string tay (`if (status === 'DELEVERED')` - dễ gõ sai chính tả).

## 18. Utils
Chứa các hàm Pure (không phụ thuộc Vue hay API). Ví dụ: `formatCurrency(amount)`, `parseDate(dateString)`, `generateIdempotencyKey()`.
**Lý do:** Tái sử dụng code tiện ích, cực kỳ dễ viết Unit Test vì chúng không có Side-effects.

## 19. Middleware
Thư mục `app/middleware/`.
- `auth.ts`: Chặn khách vãng lai.
- `role.ts`: Chặn quyền Admin/Driver.
**Lý do:** Nuxt cung cấp sẵn luồng Router Middleware, việc sử dụng nó giúp chặn UI render ngay từ phía Server (SSR) hoặc trước khi load Client, giúp bảo mật và UX tốt hơn.

## 20. Plugin
Khởi tạo các thư viện Global (`app/plugins/toast.ts`, `app/plugins/click-outside.ts`).
**Lý do:** Đây là chuẩn của Nuxt để nạp thư viện hoặc Vue Directives trước khi App mount.

## 21. i18n
Thiết lập bộ thư mục `i18n/locales/vi.json`. Mặc dù dự án xưởng bún chỉ dùng tiếng Việt, nhưng vẫn bọc các string tĩnh (Tên cột Table, Thông báo lỗi) bằng hàm t(`...`).
**Lý do:** Tách String ra khỏi Logic Component. Sau này sửa một thông báo "Đăng nhập thành công" chỉ cần sửa ở 1 file JSON thay vì lùng sục hàng chục component.

## 22. Permission
Tạo một Custom Directive `v-permission="['ADMIN']"`. Nếu user là DRIVER, nút "Xóa đơn hàng" tự động bị ẩn (remove khỏi DOM) mà không cần viết `v-if="user.role === 'ADMIN'"` lặp lại nhiều lần.
**Lý do:** Tách biệt logic phân quyền trên giao diện ra một Directive, giúp code template ngắn gọn và nhất quán.

## 23. Theme
Sử dụng `tailwind.config.ts` để định nghĩa Design Token (Colors: `primary`, `secondary`; Fonts; Spacing). FE không được dùng mã Hex lẻ tẻ (`text-[#ff0000]`) trong Vue template mà phải cấu hình `text-primary-500`.
**Lý do:** Giữ sự đồng nhất về UI/UX cho toàn dự án. Sẵn sàng cho việc tạo giao diện Darkmode nếu muốn sau này.

## 24. Error Handler
Nuxt cung cấp hook `app:error` ở global.
**Lý do:** Bắt tất cả các lỗi crash của Vue (Unhandled Exceptions), tránh việc app bị trắng màn hình. Ghi lại log hoặc hiển thị màn hình Fallback "Có lỗi xảy ra".

## 25. Logger
Không dùng `console.log()` bừa bãi. Sử dụng **Consola** (Mặc định của Nuxt/Nitro) hoặc viết 1 wrapper `AppLogger.info()`. Tắt chế độ log trong môi trường Production.
**Lý do:** `console.log()` ở Production gây rò rỉ dữ liệu (Data Leakage) và làm chậm hiệu năng.

## 26. Config
Tất cả các biến môi trường (Base URL của API, Token Key...) đặt trong `runtimeConfig` ở `nuxt.config.ts` và truy cập bằng `useRuntimeConfig()`. Tuyệt đối không nhúng cứng `http://localhost:3333` vào code.
**Lý do:** An toàn và tuân thủ nguyên tắc 12-Factor App (Cấu hình thay đổi tùy môi trường Dev/Staging/Prod mà không cần build lại code).

## 27. Cache
- Dùng `useAsyncData` hoặc `useFetch` của Nuxt 4 có kèm `key` để Nuxt tự động Cache SSR kết quả của MasterData.
- Pinia Store lưu Cache Tỉnh/Thành bằng cờ `isLoaded`.
**Lý do:** Giảm thiểu request thừa lên BE cho những dữ liệu không bao giờ thay đổi. Tối ưu Server Render (TTFB).

## 28. Performance
- Import Icon từ thư viện (ví dụ `lucide-vue-next`) thay vì load toàn bộ file font icon nặng nề.
- Bọc các hàm tính toán nặng bằng `computed()`.
**Lý do:** Cải thiện điểm Google Lighthouse (rất quan trọng cho Landing Page SEO). Tăng độ mượt cho App Tài xế.

## 29. Lazy Load
- Ảnh tải bằng `<NuxtImg loading="lazy" />`.
- Với các Component nặng như Biểu đồ Chart, dùng chức năng Lazy import tự động của Nuxt (tiền tố `Lazy` như `<LazyDashboardChart />`).
**Lý do:** Giảm dung lượng tải lần đầu (Initial Payload). App sẽ hiển thị nhanh hơn ở kết nối 3G yếu của Tài xế.

## 30. Code Splitting
Nuxt 4 mặc định thực hiện Code Splitting theo từng Page (Route-based).
**Lý do:** User vào trang Đăng nhập sẽ không phải tải luôn cục JavaScript của màn hình Thống kê Dashboard. Giảm gánh nặng băng thông.

## 31. Security
- **Bảo mật Token Web:** Sử dụng **HttpOnly Cookie** (thông qua Header `X-Client-Type: WEB`) để chống tuyệt đối nạn đánh cắp Token qua XSS.
- **Bảo mật Token Mobile:** Lưu Token ở Secure Storage của HĐH (thông qua Capacitor Plugin).
- Nuxt/Vue tự động escape HTML khi dùng `{{ }}` (Chống XSS). Cẩn thận tuyệt đối khi dùng `v-html` cho content Blog (Nên dùng thư viện DOMPurify để sanitize HTML từ editor).
**Lý do:** Ứng dụng có liên quan đến tiền bạc (Công nợ), bảo mật là ưu tiên hàng đầu, chống lại các đòn tấn công XSS hoặc đánh cắp phiên (Session Hijacking).

## 32. Unit Test Structure
Thư mục `tests/unit/`. Sử dụng **Vitest**.
- Chỉ viết Unit Test cho Tầng `core/` (Services, Utils, Mappers). Ví dụ: Test hàm tính toán công nợ `calculateDebt()`.
**Lý do:** Test logic nghiệp vụ mang lại ROI (Return on Investment) cao nhất. Test UI thường dễ hỏng (brittle) và tốn thời gian maintain.

## 33. E2E Structure
Sử dụng **Playwright** cho các luồng chí mạng (Critical Paths):
- Luồng Login.
- Luồng Tạo đơn -> Tài xế chốt đơn.
**Lý do:** E2E test mô phỏng y hệt hành vi người dùng, đảm bảo trước khi Deploy lên Prod không làm hỏng tính năng thu tiền chính của công ty.

## 34. Coding Convention
- Tích hợp **ESLint** (Cấu hình chuẩn Nuxt) + **Prettier**. Bật Husky Pre-commit hook (Không cho phép commit nếu code lỗi format hoặc lỗi Type).
**Lý do:** Code của tất cả thành viên trong team trông như được viết bởi 1 người. Đọc Pull Request (Code Review) dễ dàng hơn.

## 35. Naming Convention
- **Components:** `PascalCase` (e.g., `OrderForm.vue`, `AppButton.vue`).
- **Variables/Functions:** `camelCase` (e.g., `fetchOrderList()`, `userData`).
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_COUNT`).
- **Composables:** Bắt đầu bằng chữ `use` (e.g., `usePagination`).
- **Types/Interfaces:** Sử dụng PascalCase, không cần tiền tố `I` (e.g., `User` thay vì `IUser`).
**Lý do:** Tiêu chuẩn công nghiệp chung của cộng đồng Vue/JS toàn cầu. Dễ đọc, dễ hiểu ngữ cảnh của biến.

## 36. Best Practice (Thực hành tốt nhất)
- Dùng `<script setup lang="ts">` cho 100% component (Composition API).
- Hạn chế sử dụng `watch`, ưu tiên `computed`. Chỉ dùng `watch` khi cần trigger Side-effects (gọi API).
- Giải nén (Destructuring) props phải cẩn thận dùng `toRefs()` để không mất tính Reactivity.
- Xử lý Memory Leak: Các thư viện biểu đồ, event listener thêm vào `window` trong `onMounted` phải được dọn dẹp bằng `onUnmounted`.
**Lý do:** Đây là những "hố đen" mà các lập trình viên Vue thiếu kinh nghiệm thường vấp phải, gây giật lag và phình bộ nhớ RAM của trình duyệt. 
