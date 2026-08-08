# 🏗️ Kế Hoạch Dựng UI/UX — BunTech "Chuyển Đổi Số Xưởng Bún"

---

## PHẦN 1: TỔNG QUAN PHÂN TÍCH UI/UX CỦA TEMPLATE CŨ

### 📊 Thống Kê Màn Hình (43 screens)

| Khu vực | Số trang | Chi tiết |
|---|---|---|
| **Public / Landing** | 7 | Home, About, Quick Order, Products (list + detail), Blog (list + detail) |
| **Auth** | 5 | Admin Login/Forgot/Reset, Customer Login, Driver Login |
| **Admin CMS/ERP** | 19 | Dashboard, Profile, Settings, Change Password, Blog (3), Customers (2), Finance (2), Inventory (4), Orders (3), Products (4) |
| **Driver App** | 7 | Route Index, Order Detail, History, Notifications, Profile, Vehicle, Customer Detail |
| **Customer Portal** | 2 | Dashboard, Order Detail |
| **Error** | 1 | Error page |

### 📦 Component Template Cũ (22 shared + 1 feature)

| Loại | Components |
|---|---|
| Layout/Structure | `AppPageHeader`, `AppDrawer`, `AppModal`, `AppToolbar`, `AppBreadcrumb` |
| Feedback/Status | `AppBadge`, `AppEmptyState`, `AppErrorState`, `AppSkeleton`, `AppToast`, `AppConfirmDialog` |
| Input/Form | `AppButton`, `AppIconButton`, `AppInput`, `AppSelect`, `AppSearchBar`, `AppDropzone` |
| Data Display | `AppTable`, `AppPagination`, `AppAvatar` |
| Specialized | `SwipeToConfirm` |
| Feature | `DashboardChart` |

### 🎨 Design System Template Cũ

- **Font**: `Be Vietnam Pro` (sans) + `JetBrains Mono` (mono)
- **Primary**: Terracotta Orange `#ed7628` — gợi nhớ xưởng bún truyền thống
- **Secondary**: Deep Teal `#14b8a6` — chuyên nghiệp, tài chính
- **Accent**: Golden Amber `#f59e0b` — CTA, rating
- **Dark Mode**: Hỗ trợ đầy đủ via CSS variables
- **Glass Effects**: Glassmorphism trên header/sidebar

### 4 Layout Chính

| Layout | Mục đích | Đặc điểm |
|---|---|---|
| `default` | Public/Customer | Sticky top nav (desktop) + Bottom tab bar (mobile) + Footer |
| `admin` | Dashboard CMS | Collapsible sidebar (248px/68px) + Off-canvas mobile drawer |
| `driver` | Mobile App | Max-w-md centered + Bottom nav + Online/Offline toggle |
| `auth` | Đăng nhập | Split-screen: Branding panel + Auth form |

### ✅ Điểm Mạnh Template Cũ

1. **Glassmorphism & Micro-interactions** xuất sắc — `backdrop-blur`, staggered animations, ripple effects
2. **Responsive design** thông minh — thay đổi hoàn toàn navigation paradigm theo role (bottom tab cho mobile, sidebar cho admin)
3. **Dark mode** triển khai kỹ lưỡng qua CSS variables
4. **Accessibility** tốt — `aria-*` attributes, min touch target 44x44px
5. **SwipeToConfirm** sáng tạo cho driver app

### ❌ Điểm Yếu Cần Cải Thiện

1. **Dùng thư viện cũ**: `lucide-vue-next` import trực tiếp → Phải chuyển sang `i-lucide-*` icon class (Nuxt UI v4 standard)
2. **Component tự xây thô**: `AppButton`, `AppInput`, `AppSelect`... tự viết từ đầu → **Phải dùng `<UButton>`, `<UInput>`, `<USelect>`** từ Nuxt UI v4
3. **Không dùng `<NuxtImg>`**: Dùng `<img>` thuần → Vi phạm rule `@nuxt/image`
4. **i18n tự quản lý**: Template dùng `nuxt-i18n` → Dự án mới **không yêu cầu** i18n
5. **Inline CSS animation delays**: `animationDelay: ${i * 40}ms` có thể gây stutter trên thiết bị yếu
6. **Monolithic page files**: Nhiều page > 500 lines, không tách component → Vi phạm component-driven rule
7. **Custom color system**: Tailwind config tự định nghĩa full palette → Dự án mới dùng Nuxt UI color tokens (`primary: 'emerald'`)

---

## PHẦN 2: TÓM TẮT RULE KỸ THUẬT CỐT LÕI (Từ `.agents`)

> [!IMPORTANT]
> Mọi dòng code phải tuân thủ 100% các rule dưới đây. KHÔNG được copy nguyên template cũ.

### 🏛️ Tech Stack Bắt Buộc

| Thành phần | Công nghệ | Ghi chú |
|---|---|---|
| Framework | **Nuxt 4** (`compatibilityVersion: 4`) | App dir structure |
| UI Library | **Nuxt UI v4** (`@nuxt/ui ^4.9.0`) | Dùng `<UButton>`, `<UCard>`... thay HTML thuần |
| CSS | **Tailwind CSS v4** | Mobile-first, class ordering enforced |
| State | **Pinia** + `useState` | TUYỆT ĐỐI không global variable ngoài function scope |
| Validation | **Zod** (v4) | Cho cả Form và API response |
| Image | **`<NuxtImg>`** | KHÔNG dùng `<img>` |
| Font | **Be Vietnam Pro** (via `@nuxtjs/google-fonts`) | |
| Icons | **Lucide** via icon class (`i-lucide-*`) | KHÔNG import component |

### 📏 Quy Tắc Viết Code

| Rule | Chi tiết |
|---|---|
| **SFC Order** | `<script setup lang="ts">` → `<template>` → `<style scoped>` |
| **Script Order** | Types → Props/Emits → defineModel → State → Computed → Watch → Handlers → Lifecycle |
| **Auto-import** | KHÔNG import `ref`, `computed`, `watch`, `useState` từ Vue/Nuxt |
| **SSR Safety** | KHÔNG gọi `window`/`document`/`localStorage` ở top-level script setup |
| **Navigation** | Dùng `navigateTo()`, KHÔNG `router.push()` |
| **SEO** | Dùng `useSeoMeta()`, KHÔNG `useHead()` |
| **Naming** | Components: `PascalCase` ≥2 từ. Pages: `kebab-case`. Composables: `use` prefix |
| **API** | Dùng `ApiClient` (wrapping `$fetch`). KHÔNG dùng `axios` |
| **Form** | `<FormWrapper>` + `<UForm>` + Zod Schema + `useFormSubmit` composable |

### 🎨 CSS/Tailwind Convention

- **Class Order**: Layout → Sizing → Spacing → Typography → Visuals (auto-sort by Prettier plugin)
- **Mobile First**: Viết `w-full p-4` trước, rồi `md:w-1/2 md:p-8`
- **KHÔNG lạm dụng `@apply`**: Tách component thay vì dùng `@apply` trong global CSS
- **Safe Area**: Padding cho notch/home indicator trên Capacitor app

### 🧩 Component Architecture (Đã Có Sẵn)

Dự án mới đã có **11 base components** cần được sử dụng và mở rộng:

| Component | Mục đích |
|---|---|
| [ConfirmDialog](file:///d:/buntech/buntechFE/FE/app/components/base/ConfirmDialog.vue) | Dialog xác nhận hành động |
| [CurrencyDisplay](file:///d:/buntech/buntechFE/FE/app/components/base/CurrencyDisplay.vue) | Hiển thị tiền VND |
| [DataTable](file:///d:/buntech/buntechFE/FE/app/components/base/DataTable.vue) | Bảng dữ liệu + pagination + empty state |
| [DateRangePicker](file:///d:/buntech/buntechFE/FE/app/components/base/DateRangePicker.vue) | Chọn khoảng thời gian |
| [EmptyState](file:///d:/buntech/buntechFE/FE/app/components/base/EmptyState.vue) | Trạng thái rỗng |
| [FormWrapper](file:///d:/buntech/buntechFE/FE/app/components/base/FormWrapper.vue) | Bọc form + Zod validation |
| [PageHeader](file:///d:/buntech/buntechFE/FE/app/components/base/PageHeader.vue) | Header trang |
| [PageLoading](file:///d:/buntech/buntechFE/FE/app/components/base/PageLoading.vue) | Loading skeleton |
| [SearchInput](file:///d:/buntech/buntechFE/FE/app/components/base/SearchInput.vue) | Ô tìm kiếm debounce |
| [StatCard](file:///d:/buntech/buntechFE/FE/app/components/base/StatCard.vue) | Card thống kê KPI |
| [StatusBadge](file:///d:/buntech/buntechFE/FE/app/components/base/StatusBadge.vue) | Badge trạng thái |

**Layouts đã có**: `default`, `admin`, `auth`, `driver` — cần hoàn thiện nội dung.

**Composables đã có**: `useApi`, `useAuth`, `useConfirmDialog`, `useFormSubmit`, `usePagination`, `useInfinitePagination`, `useMasterData`, `usePermission`, `useTableFilters`

**Middleware đã có**: `auth`, `guest`, `role`

---

## PHẦN 3: KẾ HOẠCH DỰNG UI/UX — ROADMAP THEO PHASE

> [!NOTE]
> Mỗi Phase sẽ được thực hiện tuần tự. Sau mỗi Phase, tôi sẽ chờ bạn review trước khi tiếp.
> **Nguyên tắc**: Mock data only, CHƯA gọi API. Focus 100% vào UI/UX premium.

---

> **3 Nguyên Tắc Xuyên Suốt Mọi Phase**
>
> 🎬 **ANIMATION-FIRST** — Mọi element dựng ra phải "sống" ngay lập tức: hover, focus, transition, skeleton. Không có UI chết.
>
> 🎨 **TERRACOTTA BRAND** — Primary = Cam Truyền Thống. Emerald = Success. Cấu hình ngay Phase 0, áp dụng mọi nơi.
>
> 🧩 **NUXT UI v4 MAXIMIZED** — Dùng tối đa `<UButton>`, `<UCard>`, `<UModal>`, `<USlideover>`, `<UForm>`, `<UTable>`, `<UBadge>`... Chỉ viết CSS tay khi Nuxt UI **THỰC SỰ** không có component/prop hỗ trợ.

---

## 🔵 PHASE 0: Foundation — Theme, Tokens & Base Components

> [!IMPORTANT]
> Phase này thiết lập **DNA** cho toàn bộ app. Mọi Phase sau kế thừa từ đây.

### 0.1 — Cấu hình Terracotta Brand Theme
| Item | Chi tiết |
|---|---|
| **File** | [app.config.ts](file:///d:/buntech/buntechFE/FE/app/app.config.ts) |
| **Hành động** | Đổi `colors.primary` từ `'emerald'` sang **custom Terracotta** palette. Đổi `colors.success` thành `'emerald'`. Giữ `neutral: 'slate'`, `error: 'red'`, `warning: 'amber'` |
| **Cách làm** | Nuxt UI v4 cho phép extend custom color vào `app.config.ts` hoặc define Tailwind theme color. Tạo palette Terracotta 50→950 dựa trên anchor `#ed7628` |
| **Nuxt UI** | Tất cả `<UButton color="primary">`, `<UBadge>`, `<UProgress>` sẽ tự động inherit Terracotta |

### 0.2 — Nâng cấp Design Tokens & Animations CSS
| Item | Chi tiết |
|---|---|
| **File** | [main.css](file:///d:/buntech/buntechFE/FE/app/assets/css/main.css) |
| **Thêm** | `@keyframes fade-in`, `fade-in-up`, `slide-up`, `slide-in-right`, `shimmer` (skeleton pulse) |
| **Thêm** | Utility classes: `.animate-fade-in`, `.animate-slide-up`, `.glass` (glassmorphism: `backdrop-blur-xl bg-white/70 dark:bg-slate-900/70`) |
| **Thêm** | Transition tokens: `--transition-fast: 150ms`, `--transition-normal: 250ms`, `--transition-slow: 400ms` |
| **Nguyên tắc** | Chỉ thêm những gì Tailwind v4 / Nuxt UI v4 **chưa có sẵn**. Ưu tiên dùng Tailwind `transition-*` classes |

### 0.3 — Base Component: `SwipeToConfirm`
| Item | Chi tiết |
|---|---|
| **File** | `components/base/SwipeToConfirm.vue` — **[NEW]** |
| **Nuxt UI** | Không có component tương đương → viết custom |
| **UX bắt buộc** | Touch drag smooth, haptic-like visual feedback (scale bounce khi hoàn thành), progress gradient từ `neutral` → `primary` (Terracotta), disabled state |
| **Motion** | Spring animation khi thả tay (snap back hoặc complete), `transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)` |

### 0.4 — Base Component: `Dropzone`
| Item | Chi tiết |
|---|---|
| **File** | `components/base/Dropzone.vue` — **[NEW]** |
| **Nuxt UI** | Không có Dropzone sẵn → viết custom, nhưng bọc trong `<UCard>` cho consistent styling |
| **UX bắt buộc** | Drag hover: border đổi sang `primary` + pulse glow. Drop: thumbnail preview tức thì via `URL.createObjectURL`. Remove animation: scale-down fade-out |

### 0.5 — Base Component: `StatsGrid`
| Item | Chi tiết |
|---|---|
| **File** | `components/base/StatsGrid.vue` — **[NEW]** |
| **Nuxt UI** | Wrap nhiều `BaseStatCard` trong responsive grid |
| **UX bắt buộc** | Staggered fade-in-up khi mount (`animation-delay` tính toán). Mỗi `StatCard` có hover: `translateY(-2px)` + shadow tăng |

### 0.6 — Mock Data Module
| Item | Chi tiết |
|---|---|
| **File** | `utils/mockData.ts` — **[NEW]** |
| **Nội dung** | Typed mock data cho: Users (Admin/Driver/Customer), Orders (đa trạng thái), Products, Categories, Blog Posts, Transactions, Inventory logs, Notifications |
| **Yêu cầu** | Dữ liệu phải realistic (tên Việt, địa chỉ Việt, giá VND). Dùng TypeScript interfaces từ `~/types/` |

### 0.7 — Hoàn thiện Navigation Config
| Item | Chi tiết |
|---|---|
| **File** | `utils/navigation.ts` |
| **Hành động** | Kiểm tra và bổ sung menu items cho Admin sidebar (`adminNavigationItems`) và Driver bottom nav (`driverNavigationItems`). Đảm bảo icon dùng `i-lucide-*` |

---

## 🟢 PHASE 1: Layouts & Auth — Khung Xương Sống

> [!NOTE]
> Mọi layout/page trong Phase này phải ship với: ✅ Skeleton loading ✅ Hover states ✅ Focus rings ✅ Smooth transitions ✅ Dark mode đúng

### 1.1 — Layout `default` (Public/Customer)
| Item | Chi tiết |
|---|---|
| **Files** | [default.vue](file:///d:/buntech/buntechFE/FE/app/layouts/default.vue), [Header.vue](file:///d:/buntech/buntechFE/FE/app/components/layouts/default/Header.vue), [Footer.vue](file:///d:/buntech/buntechFE/FE/app/components/layouts/default/Footer.vue) |
| **Nuxt UI** | `<UButton>` cho nav links, `<UDropdownMenu>` cho user menu, `<UColorModeButton>` cho dark toggle, `<UNavigationMenu>` nếu phù hợp |
| **Header** | Sticky, glassmorphism (`.glass`). Logo gradient Terracotta. Desktop: horizontal nav. Mobile: ẩn nav, hiện bottom tab bar |
| **Footer** | Brand block + social links + quick links + contact. Dùng Nuxt UI grid pattern |
| **Bottom Nav** | Fixed bottom, `safe-area-bottom`. Active state: Terracotta icon + label. Inactive: `text-muted` |
| **🎬 Motion** | Header: `backdrop-blur` transition khi scroll. Scroll-to-top button: `scale` + `fade` transition. Bottom nav active: icon slight `scale(1.1)` bounce. Page content: `<NuxtPage>` wrapped trong `<Transition name="page" mode="out-in">` với `opacity` + `translateY(8px)` |

### 1.2 — Layout `admin` (Dashboard)
| Item | Chi tiết |
|---|---|
| **File** | [admin.vue](file:///d:/buntech/buntechFE/FE/app/layouts/admin.vue) |
| **Nuxt UI** | `<UDashboardGroup>`, `<UDashboardSidebar>` (collapsible, resizable), `<UNavigationMenu>`, `<UDropdownMenu>`, `<UColorModeButton>`, `<UButton>` |
| **Sidebar** | Logo Terracotta icon. Nav items từ `adminNavigationItems`. Footer: user info + logout dropdown |
| **🎬 Motion** | Sidebar collapse: smooth width transition (Nuxt UI built-in). Nav item hover: `bg-elevated` transition. Active item: Terracotta left border accent. Tooltip khi collapsed (Nuxt UI built-in) |

### 1.3 — Layout `auth` (Split-Screen)
| Item | Chi tiết |
|---|---|
| **File** | [auth.vue](file:///d:/buntech/buntechFE/FE/app/layouts/auth.vue) |
| **Nuxt UI** | `<UCard>` cho form container |
| **Left Panel** | Gradient Terracotta background. Animated floating blobs (`animate-pulse-soft`). Logo + tagline + decorative illustration |
| **Right Panel** | Centered `<UCard>` chứa `<slot />` (form). Max-width `md` |
| **Responsive** | Mobile: ẩn left panel, full-width form trên gradient background subtle |
| **🎬 Motion** | Blobs: CSS `animation: pulse-soft 6s ease-in-out infinite alternate`. Form card: `animate-fade-in-up` khi mount. Input focus: Nuxt UI built-in focus ring (Terracotta color) |

### 1.4 — Layout `driver` (Mobile-First)
| Item | Chi tiết |
|---|---|
| **File** | [driver.vue](file:///d:/buntech/buntechFE/FE/app/layouts/driver.vue) |
| **Nuxt UI** | `<UBadge>` cho Online/Offline indicator, `<UButton>` cho nav items |
| **Top Bar** | Sticky. Driver name + Online/Offline toggle badge. Terracotta gradient subtle |
| **Bottom Nav** | 5 tabs: Giao hàng, Lịch sử, Thông báo, Phương tiện, Hồ sơ. `safe-area-bottom` |
| **🎬 Motion** | Tab switch: icon `scale` bounce. Online badge: pulse animation. Content: `max-w-md mx-auto` centered |

### 1.5 → 1.9 — Auth Pages (5 trang)

| # | Route | Nuxt UI Components | Motion Requirements |
|---|---|---|---|
| 1.5 | `pages/auth/admin/login.vue` | `<UForm>` + `<UFormField>` + `<UInput>` + `<UCheckbox>` (remember me) + `<UButton>` | Form `fade-in-up`. Button loading state (Nuxt UI built-in spinner). Input focus ring Terracotta |
| 1.6 | `pages/auth/admin/forgot-password.vue` | `<UForm>` + `<UInput type="email">` + `<UButton>` + `<UAlert>` (success feedback) | Alert slide-down animation |
| 1.7 | `pages/auth/admin/reset-password.vue` | `<UForm>` + 2x `<UInput type="password">` + `<UButton>` | Password strength indicator animated bar |
| 1.8 | `pages/auth/customer/login.vue` | Tương tự 1.5 nhưng branding panel hiện brand KH Sỉ | |
| 1.9 | `pages/auth/driver/login.vue` | Mobile-only UI. Full-width form. `<UInput>` + `<UButton>` block width | Toàn bộ form animate slide-up từ bottom |

**Yêu cầu chung Auth Pages:**
- Validation: `<UForm>` + Zod schema → lỗi hiển thị inline dưới mỗi field (Nuxt UI built-in)
- Submit: `<UButton :loading="isSubmitting">` → Nuxt UI tự hiện spinner
- SEO: `useSeoMeta({ title: 'Đăng nhập | BunTech' })`
- Mock: Submit thành công → `navigateTo('/admin')` hoặc tương ứng

---

## 🟡 PHASE 2: Public / Landing Pages — Bộ Mặt Thương Hiệu

> [!IMPORTANT]
> Đây là trang khách hàng nhìn thấy đầu tiên. **PHẢI** gây ấn tượng mạnh.
> Terracotta + glassmorphism + staggered animations = Premium Vietnamese brand feel.

### 2.1 — Landing Page `/`
| Item | Chi tiết |
|---|---|
| **File** | [index.vue](file:///d:/buntech/buntechFE/FE/app/pages/index.vue) |
| **Sections** | Hero → Featured Products → Quy trình đặt hàng → Trust Badges → Testimonials → Blog Preview → CTA |
| **Nuxt UI** | `<UButton>` (CTA), `<UCard>` (product cards, testimonial cards), `<UBadge>` (trust badges), `<UCarousel>` nếu có |
| **Components tạo mới** | `components/landing/HeroSection.vue`, `LandingFeatureGrid.vue`, `LandingTestimonials.vue`, `LandingTrustBadges.vue`, `LandingCTASection.vue`, `LandingProductShowcase.vue` |
| **🎬 Motion** | Hero: text `fade-in-up` staggered (title → subtitle → CTA button, delay 100ms mỗi element). Product cards: `fade-in-up` staggered khi scroll vào viewport (Intersection Observer). Trust badges: `scale(0.8)` → `scale(1)` + `opacity` on viewport enter. Testimonials: auto-slide hoặc manual carousel. CTA section: parallax-like gradient shift on scroll |

### 2.2 — Giới Thiệu `/gioi-thieu`
| Item | Chi tiết |
|---|---|
| **Nuxt UI** | `<UCard>` sections, `<UBadge>` cho milestones |
| **Sections** | Câu chuyện thương hiệu + Timeline 60 năm + Giá trị cốt lõi (icon cards) + Gallery ảnh |
| **🎬 Motion** | Timeline entries: alternate slide-in-left / slide-in-right khi scroll. Value cards: hover `translateY(-4px)` + shadow. Gallery: lightbox on click |

### 2.3 — Sản phẩm `/products`
| Item | Chi tiết |
|---|---|
| **Nuxt UI** | `<UInput>` (search), `<USelectMenu>` (category filter), `<UCard>` (product cards), `<UBadge>` (tags), `<UPagination>` |
| **🎬 Motion** | Grid items: staggered `fade-in-up`. Card hover: image subtle `scale(1.05)`, shadow tăng, overlay gradient. Filter change: grid re-layout smooth |

### 2.4 — Chi tiết Sản phẩm `/products/[slug]`
| Item | Chi tiết |
|---|---|
| **Nuxt UI** | `<UCarousel>` (image gallery), `<UBadge>` (stock, category), `<UButton>` (order CTA), `<UTabs>` (mô tả / đánh giá), `<UCard>` (related products) |
| **🎬 Motion** | Image gallery: smooth slide transition. Tab switch: content `fade` transition (Nuxt UI built-in). Related products: horizontal scroll với snap |

### 2.5 — Đặt Hàng Nhanh `/quick-order`
| Item | Chi tiết |
|---|---|
| **Nuxt UI** | `<UForm>` + `<UFormField>` + `<UInput>` + `<UTextarea>` + `<USelectMenu>` (product picker) + `<UButton>` |
| **Bảo mật** | Honeypot: hidden field `<UInput>` với CSS `opacity: 0; position: absolute; pointer-events: none` |
| **🎬 Motion** | Form sections: staggered `fade-in-up`. Product item add: `slide-in` + `scale` bounce. Remove item: `scale-down` + `fade-out`. Submit success: card flip hoặc confetti-like celebration |

### 2.6 — Blog `/blog` + 2.7 — Blog Detail `/blog/[slug]`
| Item | Chi tiết |
|---|---|
| **Nuxt UI** | `<UCard>` (article cards), `<UBadge>` (category), `<UPagination>`, `<UBreadcrumb>` |
| **List** | Grid card layout. Card hover: shadow + slight lift |
| **Detail** | Rich text content. Sidebar: related posts. `<UBreadcrumb>` navigation |
| **🎬 Motion** | Cards: staggered entrance. Detail: content `fade-in` on mount |

---

## 🟠 PHASE 3: Admin Core CRUD — Dashboard, KH, Đơn hàng, Sản phẩm

> [!NOTE]
> Mọi trang admin sử dụng `<BaseDataTable>` (đã có) bọc `<UTable>`.
> Mọi form sử dụng `<BaseFormWrapper>` bọc `<UForm>` + Zod.
> Mọi trang có `<BasePageHeader>` với breadcrumb + action buttons.
> Mọi trang phải có Skeleton loading (`<BasePageLoading>`), Empty state (`<BaseEmptyState>`), và Search debounce (`<BaseSearchInput>`).

### 3.1 — Admin Dashboard `/admin`
| Item | Chi tiết |
|---|---|
| **Nuxt UI** | `<UCard>` (chart containers), `<USelectMenu>` (date range), `<UTabs>` (chart views) |
| **Components** | `<BaseStatsGrid>` (KPI cards: Doanh thu, Đơn hàng, KH mới, Công nợ). `DashboardChart.vue` — **[NEW]** wrap biểu đồ (Revenue area chart, Top buyers bar chart) |
| **🎬 Motion** | Stats cards: staggered `fade-in-up` (delay 80ms mỗi card). Số trong StatCard: count-up animation (`requestAnimationFrame` number tween). Chart: animate draw-in on mount. Tab switch: `<UTabs>` built-in transition |

### 3.2 — Quản lý Khách hàng `/admin/customers`
| Item | Chi tiết |
|---|---|
| **Nuxt UI** | `<BaseDataTable>` → `<UTable>`, `<UButton>` (Thêm KH), `<UDropdownMenu>` (row actions) |
| **Columns** | Avatar + Tên, SĐT, Email, Nhóm giá, Công nợ (`<BaseCurrencyDisplay>`), Trạng thái (`<BaseStatusBadge>`), Actions |
| **🎬 Motion** | Row hover: `bg-elevated` transition. Action dropdown: Nuxt UI slide-down. Navigate to detail: page `fade` transition |

### 3.3 — Chi tiết KH `/admin/customers/[id]`
| Item | Chi tiết |
|---|---|
| **Nuxt UI** | `<UTabs>` (Info / Sổ địa chỉ / Bảng giá / Lịch sử ĐH / Công nợ), `<UCard>`, `<UBadge>`, `<UButton>`, `<USlideover>` (edit form) |
| **🎬 Motion** | Tab content: `fade` transition. Slideover: Nuxt UI built-in slide animation. Data load: skeleton → content `fade-in` |

### 3.4 — Quản lý Đơn hàng `/admin/orders`
| Item | Chi tiết |
|---|---|
| **Nuxt UI** | `<BaseDataTable>`, `<USelectMenu>` (filter trạng thái), `<UBadge>` (SSE indicator mock), `<UButton>` (Tạo ĐH, Phân công), `<UCheckbox>` (batch select) |
| **Columns** | Mã ĐH, KH, Tổng tiền, Trạng thái (`<BaseStatusBadge>`), Ngày tạo, Actions |
| **🎬 Motion** | New order indicator: `<UBadge>` pulse animation (giả lập SSE). Batch assign mode: checkboxes `scale-in`. Status badge: color transition khi thay đổi |

### 3.5 — Tạo Đơn hàng `/admin/orders/create`
| Item | Chi tiết |
|---|---|
| **Nuxt UI** | `<UStepper>` hoặc custom step indicator, `<UForm>`, `<USelectMenu>` (chọn KH → auto-load custom price), `<UTable>` (line items), `<UInput>` (số lượng), `<UCard>` (order summary) |
| **Steps** | Bước 1: Chọn KH → Bước 2: Chọn SP + SL (giá custom tự áp) → Bước 3: Xác nhận tổng |
| **🎬 Motion** | Step transition: slide-left on forward, slide-right on back. Product add: row `slide-in` + `scale` bounce. Summary card: total price count-up animation |

### 3.6 — Chi tiết ĐH `/admin/orders/[id]`
| Item | Chi tiết |
|---|---|
| **Nuxt UI** | `<UCard>` (info sections), `<UTable>` (items), `<UBadge>` (status), `<UButton>` (actions), `<UStepper>` hoặc custom timeline (status progression) |
| **🎬 Motion** | Status timeline: progress bar animated fill. Action buttons: Nuxt UI loading state on click |

### 3.7 — Sản phẩm DS `/admin/products`
| Item | Chi tiết |
|---|---|
| **Nuxt UI** | `<BaseDataTable>`, `<USelectMenu>` (category filter), `<NuxtImg>` (thumbnail), `<UBadge>` (stock status) |
| **🎬 Motion** | Image thumbnail: hover `scale(1.05)` smooth. Out-of-stock row: subtle `opacity: 0.6` |

### 3.8 — Sản phẩm Detail/Edit `/admin/products/[id]`
| Item | Chi tiết |
|---|---|
| **Nuxt UI** | `<UForm>`, `<UFormField>`, `<UInput>`, `<UTextarea>`, `<USelectMenu>` (category), `<BaseDropzone>` (images), `<UButton>` |
| **🎬 Motion** | Image upload preview: `fade-in` + `scale`. Form save: button loading → success toast |

### 3.9 — Danh mục SP `/admin/products/categories`
| Item | Chi tiết |
|---|---|
| **Nuxt UI** | `<UTable>` (list), `<UModal>` (add/edit form), `<UForm>`, `<UButton>` |
| **🎬 Motion** | Modal: Nuxt UI built-in `scale` + `fade` transition. New item: `highlight` flash row |

### 3.10 — Đánh giá SP `/admin/products/reviews`
| Item | Chi tiết |
|---|---|
| **Nuxt UI** | `<BaseDataTable>`, `<UBadge>` (Chờ duyệt/Đã duyệt), `<UButton>` (Duyệt/Trả lời), `<UModal>` (reply form) |
| **🎬 Motion** | Optimistic UI: click "Duyệt" → badge instant `color transition` (Nuxt UI) → toast confirm |

### 3.11 — Admin Profile `/admin/profile`
| Item | Chi tiết |
|---|---|
| **Nuxt UI** | `<UCard>`, `<UForm>`, `<UInput>`, `<UAvatar>`, `<UButton>` |

### 3.12 — Đổi mật khẩu `/admin/change-password`
| Item | Chi tiết |
|---|---|
| **Nuxt UI** | `<UCard>`, `<UForm>`, `<UInput type="password">`, `<UButton>` |

---

## 🔴 PHASE 4: Admin — Tài chính, Kho & Blog

### 4.1 — Sổ công nợ `/admin/debt`
| Item | Chi tiết |
|---|---|
| **Nuxt UI** | `<BaseDataTable>`, `<BaseStatCard>` (tổng nợ, đã thu, còn lại), `<USelectMenu>` (filter KH/loại), `<UBadge>` (transaction type) |
| **🎬 Motion** | Stat cards: count-up animation. Table row: hover highlight |

### 4.2 — Thu nợ `/admin/debt/pay`
| Item | Chi tiết |
|---|---|
| **Nuxt UI** | `<UForm>`, `<USelectMenu>` (auto-suggest KH nợ), `<UInput>` (số tiền — `<BaseCurrencyDisplay>` format realtime), `<UButton>` |
| **🎬 Motion** | Amount input: số format live khi gõ. Submit success: toast + redirect |

### 4.3 → 4.6 — Kho (4 trang)
| # | Route | Nuxt UI Components | Motion |
|---|---|---|---|
| 4.3 | `/admin/inventory` | `<BaseDataTable>`, `<BaseStatsGrid>` (tổng nhập/xuất/tồn) | Stats count-up. Table staggered rows |
| 4.4 | `/admin/inventory/import` | `<UForm>`, `<USelectMenu>` (SP), `<UInput>` (SL, giá), `<UButton>` | Form `fade-in-up` |
| 4.5 | `/admin/inventory/export` | Tương tự 4.4 | |
| 4.6 | `/admin/inventory/loss-report` | `<UCard>` (chart), `<USelectMenu>` (date range), `DashboardChart` | Chart animate draw-in |

### 4.7 → 4.9 — Blog Admin (3 trang)
| # | Route | Nuxt UI Components | Motion |
|---|---|---|---|
| 4.7 | `/admin/blog` | `<BaseDataTable>`, `<UBadge>` (draft/published), `<UButton>` (Viết bài) | Row hover highlight |
| 4.8 | `/admin/blog/edit` | `<UForm>`, `<UInput>` (title, SEO), `<UTextarea>` (hoặc Rich Text Editor), `<BaseDropzone>` (cover image), `<USelectMenu>` (category) | Auto-save indicator pulse |
| 4.9 | `/admin/blog/categories` | `<UTable>`, `<UModal>`, `<UForm>`, `<UButton>` | Modal transitions |

---

## 🟣 PHASE 5: Driver App — Mobile-First

> [!IMPORTANT]
> Toàn bộ Phase này thiết kế cho mobile (≤ 480px). Touch targets ≥ 44x44px.
> Dùng `<UCard>` cho mọi card, `<UButton>` cho mọi action. KHÔNG viết button HTML.

### 5.1 — Tuyến giao hàng `/driver/delivery`
| Item | Chi tiết |
|---|---|
| **Nuxt UI** | `<UCard>` (delivery cards), `<UBadge>` (status: Chờ giao / Đang giao), `<UButton>` |
| **Components mới** | `components/driver/DeliveryCard.vue` — Card hiển thị: KH + Địa chỉ + Tổng tiền + Status badge |
| **🎬 Motion** | Cards: staggered `fade-in-up`. Pull-to-refresh: rotate icon animation. Card tap: `scale(0.98)` press feedback |

### 5.2 — Chi tiết đơn giao `/driver/delivery/[id]`
| Item | Chi tiết |
|---|---|
| **Nuxt UI** | `<UCard>`, `<UBadge>`, `<UButton>`, `<UInput>` (amountCollected), `<UDivider>` |
| **Components** | `<BaseSwipeToConfirm>`, `components/driver/AmountInput.vue` — Input tiền với format VND realtime |
| **🎬 Motion** | SwipeToConfirm: smooth drag + spring snap. Confirmation: full-screen success overlay (`scale` + `fade-in` + checkmark animation). `amountCollected` input: số đếm format live |

### 5.3 — Lịch sử `/driver/history`
| Item | Chi tiết |
|---|---|
| **Nuxt UI** | `<UCard>` list, `<UBadge>`, infinite scroll via `useInfinitePagination` |
| **🎬 Motion** | New items: `slide-up` append. Skeleton khi loading thêm |

### 5.4 — Thông báo `/driver/notifications`
| Item | Chi tiết |
|---|---|
| **Nuxt UI** | `<UCard>` per notification, `<UBadge>` (unread dot) |
| **🎬 Motion** | Unread: left Terracotta border accent. Read transition: border `fade-out` |

### 5.5 — Hồ sơ `/driver/profile`
| Item | Chi tiết |
|---|---|
| **Nuxt UI** | `<UCard>`, `<UAvatar>`, `<UButton>`, `<BaseStatCard>` (earnings) |

### 5.6 — Driver Components
| Component | Mô tả |
|---|---|
| `components/driver/DeliveryCard.vue` | Card giao hàng: KH info + amount + status + tap action |
| `components/driver/AmountInput.vue` | Input số tiền VND formatted |
| `components/driver/OfflineIndicator.vue` | Banner offline: `<UAlert color="warning">` + pulse |
| `components/driver/RouteTimeline.vue` | Timeline visual các điểm giao trong ngày |

---

## 🔵 PHASE 6: Customer Portal (Khách Sỉ)

### 6.1 — Portal Dashboard `/wholesale`
| Item | Chi tiết |
|---|---|
| **Nuxt UI** | `<BaseStatsGrid>` (Đơn gần đây, Công nợ hiện tại), `<UCard>` (recent orders), `<UButton>` (Đặt hàng), `<UTable>` (order history mini) |
| **🎬 Motion** | Stats: staggered count-up. Quick action buttons: hover `scale` + shadow |

### 6.2 — Đặt hàng KH Sỉ `/wholesale/order`
| Item | Chi tiết |
|---|---|
| **Nuxt UI** | `<UForm>`, `<USelectMenu>` (product picker), `<UTable>` (line items), `<UInput>`, `<UCard>` (summary), `<UButton>` |
| **🎬 Motion** | Product add to cart: `slide-in` row. Total: count-up. Submit: button loading + success |

---

## ✨ PHASE 7: Audit & Refinement (KHÔNG THÊM FEATURE MỚI)

> [!CAUTION]
> Phase này **CHỈ** dành cho rà soát và sửa lỗi. Tất cả animations/interactions đã phải hoàn thành ở Phase 0→6.

| # | Task | Mô tả |
|---|---|---|
| 7.1 | **Dark Mode Audit** | Duyệt toàn bộ ~40 screens ở Dark mode. Fix contrast, border visibility, shadow intensity |
| 7.2 | **Responsive Audit** | Test trên 4 breakpoints: 375px (iPhone SE), 390px (iPhone 14), 768px (iPad), 1440px (Desktop). Fix overflow, text truncation, touch targets |
| 7.3 | **Accessibility Audit** | Kiểm tra `aria-*` labels, keyboard navigation (`Tab`/`Enter`/`Escape`), focus management cho modals/slideovrs, screen reader compatibility |
| 7.4 | **Performance Audit** | Kiểm tra component lazy loading (`<Lazy*>`). Đảm bảo `<NuxtImg>` có `loading="lazy"` cho below-fold images. Audit animation jank (repaint/reflow) |
| 7.5 | **Consistency Audit** | Đảm bảo spacing, border-radius, font-size, color usage nhất quán xuyên suốt. Mọi button cùng `size="md"`, mọi card cùng `ring-0 shadow-sm` |
| 7.6 | **Empty States Polish** | Đảm bảo mọi danh sách có Empty State đẹp: icon + title + description + CTA button |
| 7.7 | **Error Page Polish** | [error.vue](file:///d:/buntech/buntechFE/FE/app/error.vue) — Visual nâng cấp: illustration + animated background |

---

## PHẦN 4: TỔNG KẾT & TIẾP THEO

### Thống Kê Ước Tính

| Metric | Số lượng |
|---|---|
| **Tổng số Pages cần dựng** | ~40 screens |
| **Tổng số Components mới** | ~25-30 components |
| **Base components đã có** | 11 (tái sử dụng) |
| **Layouts cần hoàn thiện** | 4 |
| **Phases** | 8 (0-7) |

### Nguyên Tắc Xuyên Suốt

> [!CAUTION]
> **KHÔNG ĐƯỢC vi phạm bất kỳ rule nào sau đây trong toàn bộ quá trình dựng UI:**

1. ✅ **Nuxt UI v4 First** — Dùng `<UButton>`, `<UCard>`, `<UTable>`... KHÔNG tự viết HTML button/input/select
2. ✅ **Mock Data Only** — CHƯA gọi API backend. Tất cả dữ liệu là fake
3. ✅ **`<NuxtImg>`** — KHÔNG `<img src>`
4. ✅ **`i-lucide-*`** icon class — KHÔNG import lucide-vue-next
5. ✅ **`<script setup lang="ts">`** + strict declaration order
6. ✅ **Mobile First** — CSS responsive từ mobile lên desktop
7. ✅ **`navigateTo()`** — KHÔNG `router.push()`
8. ✅ **`useSeoMeta()`** — KHÔNG `useHead()`
9. ✅ **No global variables** outside function scope
10. ✅ **Giao diện PHẢI đẹp hơn template cũ** — Premium, mượt mà, có micro-interactions

### So Sánh Khác Biệt Chính: Template Cũ vs Dự Án Mới

| Aspect | Template Cũ (Nuxt 3) | Dự Án Mới (Nuxt 4) |
|---|---|---|
| UI Library | Custom components (`AppButton`, `AppInput`...) | **Nuxt UI v4** (`<UButton>`, `<UInput>`...) |
| Icons | `lucide-vue-next` imports | `i-lucide-*` CSS class |
| Colors | Custom Terracotta palette | **Emerald** (primary) + Nuxt UI tokens |
| i18n | `nuxt-i18n` | **Không dùng** (hardcode tiếng Việt) |
| Image | `<img>` | **`<NuxtImg>`** |
| State | Custom composables | **Pinia** + `useState` |
| Layout | Custom sidebar/nav | **`UDashboardGroup`** / **`UDashboardSidebar`** |
| Validation | Yup | **Zod v4** |

---

> [!IMPORTANT]
> ## 👉 Chờ Bạn Review
> Vui lòng review bản kế hoạch này và cho tôi biết:
> 1. **Đồng ý** với thứ tự các Phase? Muốn đảo Phase nào không?
> 2. **Bổ sung/bớt** trang nào? Có trang nào không cần ở giai đoạn UI-only?
> 3. **Ưu tiên** Phase nào muốn bắt đầu trước?
> 4. Có **yêu cầu đặc biệt** nào về UI style (ví dụ: muốn giữ màu Terracotta thay vì Emerald)?
>

## 📊 TỔNG KẾT

### Thống Kê

| Metric | Số lượng |
|---|---|
| **Screens dựng mới** | ~40 |
| **Components mới** | ~25-30 |
| **Base components tái sử dụng** | 11 (đã có) |
| **Layouts hoàn thiện** | 4 |
| **Phases** | 8 (0→7) |

### Checklist Áp Dụng Cho MỌI Task

Mỗi component/page được dựng trong bất kỳ Phase nào đều **PHẢI** đáp ứng:

- [ ] ✅ Dùng Nuxt UI v4 components (KHÔNG HTML thuần khi đã có component)
- [ ] 🎨 Terracotta brand color cho primary actions/highlights
- [ ] 🎬 Hover state trên mọi interactive element
- [ ] 🎬 Focus ring (Nuxt UI built-in, inherited Terracotta)
- [ ] 🎬 Transition/animation khi element xuất hiện (fade-in, slide-up)
- [ ] 🎬 Skeleton loading khi chờ data
- [ ] 🌙 Dark mode hiển thị đúng
- [ ] 📱 Mobile-first responsive
- [ ] ♿ Accessible (aria labels, keyboard nav)
- [ ] 📝 `useSeoMeta()` cho SEO
- [ ] 🖼️ `<NuxtImg>` thay `<img>`
- [ ] 🔤 Icon dùng `i-lucide-*` class

---

> [!IMPORTANT]
> ## 👉 Chờ Bạn Duyệt Lần Cuối
> Bản Roadmap v2 đã tích hợp đầy đủ 3 yêu cầu:
> 1. ✅ **Animation-First** — Micro-interactions được ghi rõ (🎬) trong từng task, không đợi Phase 7
> 2. ✅ **Terracotta Theme** — Cấu hình ngay task 0.1, lan tỏa toàn bộ app
> 3. ✅ **Nuxt UI v4 Max** — Mỗi task liệt kê rõ component Nuxt UI nào phải dùng
