<script setup lang="ts">
import {
  ArrowLeft, Pencil, Trash2, ExternalLink, Package, Boxes, BarChart3, Star,
  TrendingUp, ShoppingCart, Wallet, Eye, ArrowUpRight, ArrowDownRight,
  AlertTriangle, DollarSign, PackageCheck,
  Calendar, Tag, Layers, Activity, Users, ChevronRight,
} from 'lucide-vue-next'
import { ProductStatus, InventoryMovementType } from '../../../core/enums'
import type { Product, ProductReview, InventoryMovement } from '../../../core/types'

const { t } = useI18n()
const toast = useToast()
const route = useRoute()
const router = useRouter()
const { formatVND, formatNumber, formatDate, formatDateTime } = useFormat()

definePageMeta({ layout: 'admin' })

const productId = route.params.id as string

// ─── State ─────────────────────────────────────────────
const loading = ref(true)
const error = ref(false)
const product = ref<Product | null>(null)
const relatedProducts = ref<Product[]>([])
const reviews = ref<ProductReview[]>([])
const movements = ref<InventoryMovement[]>([])
const activeTab = ref<'overview' | 'inventory' | 'reviews' | 'analytics'>('overview')
const reorderPoint = ref(80)

// ─── Load ──────────────────────────────────────────────
function loadProduct() {
  loading.value = true
  error.value = false
  try {
    const p = mockProducts.find(pr => pr.id === productId)
    if (!p) { error.value = true; return }
    product.value = p

    // Related products: same category, exclude self
    relatedProducts.value = mockProducts
      .filter(pr => pr.category_id === p.category_id && pr.id !== productId && !pr.deleted_at)
      .slice(0, 4)

    // Reviews for this product
    reviews.value = mockReviews
      .filter(r => r.product_id === productId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // Movements (mock: generate from product stock history)
    movements.value = mockInventoryMovements.slice(0, 6)

    reorderPoint.value = Math.max(50, Math.round(p.stock * 0.3))
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

// ─── Computed ──────────────────────────────────────────
const productImageUrl = computed(() => product.value?.image_url || '')
const productName = computed(() => product.value?.name || '')
const categoryName = computed(() => product.value?.category?.name || '—')
const status = computed(() => product.value?.status || ProductStatus.INACTIVE)
const stock = computed(() => Number(product.value?.stock ?? 0))
const price = computed(() => Number(product.value?.price ?? 0))
const unit = computed(() => product.value?.unit || 'kg')
const description = computed(() => product.value?.description || 'Chưa có mô tả cho sản phẩm này.')

const MAX_STOCK = 500
const stockPct = computed(() => Math.min(100, Math.round((stock.value / MAX_STOCK) * 100)))
const stockState = computed(() => {
  if (stock.value <= 0) return { label: 'Hết hàng', color: 'danger', pct: 0 }
  if (stock.value <= 50) return { label: 'Sắp hết', color: 'warning', pct: stockPct.value }
  if (stock.value <= 200) return { label: 'Khá', color: 'info', pct: stockPct.value }
  return { label: 'Đủ hàng', color: 'success', pct: stockPct.value }
})
const stockBarColor: Record<string, string> = {
  danger: 'bg-danger-500', warning: 'bg-warning-500', info: 'bg-info-500', success: 'bg-success-500',
}

const stockValue = computed(() => stock.value * price.value)

const tabs = computed(() => [
  { key: 'overview' as const, label: 'Tổng quan', icon: Package },
  { key: 'inventory' as const, label: 'Tồn kho', icon: Boxes },
  { key: 'reviews' as const, label: 'Đánh giá', icon: Star, count: reviews.value.length },
  { key: 'analytics' as const, label: 'Phân tích', icon: BarChart3 },
])

const movementConfig: Record<string, { icon: unknown; color: string; bg: string; sign: string; label: string }> = {
  IMPORT: { icon: ArrowDownRight, color: 'text-success-600 dark:text-success-400', bg: 'bg-success-50 dark:bg-success-900/20', sign: '+', label: 'Nhập kho' },
  EXPORT: { icon: ArrowUpRight, color: 'text-info-600 dark:text-info-400', bg: 'bg-info-50 dark:bg-info-900/20', sign: '-', label: 'Xuất kho' },
  LOSS: { icon: AlertTriangle, color: 'text-danger-600 dark:text-danger-400', bg: 'bg-danger-50 dark:bg-danger-900/20', sign: '-', label: 'Hao hụt' },
}

// Analytics (mock)
const analytics = {
  totalSold: 1840,
  revenue: 46_200_000,
  avgOrderValue: 251_000,
  viewCount: 3824,
}
const analyticsCards = computed(() => [
  { label: 'Đã bán', value: formatNumber(analytics.totalSold) + ' ' + unit.value, icon: ShoppingCart, color: 'primary', trend: '+14%' },
  { label: 'Doanh thu', value: formatVND(analytics.revenue), icon: Wallet, color: 'success', trend: '+22%' },
  { label: 'Giá trị TB/đơn', value: formatVND(analytics.avgOrderValue), icon: TrendingUp, color: 'info', trend: '+6%' },
  { label: 'Lượt xem', value: formatNumber(analytics.viewCount), icon: Eye, color: 'secondary', trend: '+18%' },
])
const colorMap: Record<string, { bg: string; text: string; ring: string }> = {
  primary: { bg: 'bg-primary-50 dark:bg-primary-900/20', text: 'text-primary-600 dark:text-primary-400', ring: 'ring-primary-100 dark:ring-primary-900/30' },
  success: { bg: 'bg-success-50 dark:bg-success-900/20', text: 'text-success-600 dark:text-success-400', ring: 'ring-success-100 dark:ring-success-900/30' },
  info: { bg: 'bg-info-50 dark:bg-info-900/20', text: 'text-info-600 dark:text-info-400', ring: 'ring-info-100 dark:ring-info-900/30' },
  secondary: { bg: 'bg-secondary-50 dark:bg-secondary-900/20', text: 'text-secondary-600 dark:text-secondary-400', ring: 'ring-secondary-100 dark:ring-secondary-900/30' },
}

const monthlySales = [
  { month: 'T3', sales: 6_800_000 },
  { month: 'T4', sales: 9_200_000 },
  { month: 'T5', sales: 7_500_000 },
  { month: 'T6', sales: 11_400_000 },
  { month: 'T7', sales: 10_200_000 },
  { month: 'T8', sales: 14_800_000 },
]
const maxSales = computed(() => Math.max(...monthlySales.map(m => m.sales)))

const topCustomers = [
  { name: 'Nhà hàng Phở 24', orders: 42, total: 12_400_000 },
  { name: 'Chị Hồng - Quán bún bò', orders: 28, total: 8_600_000 },
  { name: 'Anh Minh - Phở Hà Nội', orders: 19, total: 5_900_000 },
  { name: 'Tiệm bún riêu Lan', orders: 15, total: 4_200_000 },
]

// Reviews
const ratingDistribution = computed(() => {
  const counts = [0, 0, 0, 0, 0]
  reviews.value.forEach(r => { counts[r.rating - 1]++ })
  return [
    { star: 5, count: counts[4] },
    { star: 4, count: counts[3] },
    { star: 3, count: counts[2] },
    { star: 2, count: counts[1] },
    { star: 1, count: counts[0] },
  ]
})
const avgRating = computed(() => {
  if (!reviews.value.length) return 0
  return Math.round((reviews.value.reduce((s, r) => s + r.rating, 0) / reviews.value.length) * 10) / 10
})
const totalReviews = computed(() => reviews.value.length)

const specs = computed(() => [
  { icon: Tag, label: 'Danh mục', value: categoryName.value },
  { icon: DollarSign, label: 'Giá bán', value: `${formatVND(price.value)} / ${unit.value}` },
  { icon: Layers, label: 'Tồn kho', value: `${formatNumber(stock.value)} ${unit.value}` },
  { icon: Package, label: 'Trạng thái', value: status.value === ProductStatus.ACTIVE ? 'Đang bán' : 'Ngưng bán' },
  { icon: Calendar, label: 'Ngày tạo', value: formatDate(product.value?.created_at || '') || '—' },
  { icon: Calendar, label: 'Cập nhật', value: formatDate(product.value?.updated_at || '') || '—' },
])

function confirmDelete() {
  toast.warning('Chức năng xoá sản phẩm sẽ được kích hoạt')
}

function saveReorder() {
  toast.success(`Đã cập nhật điểm đặt hàng lại: ${reorderPoint.value} ${unit.value}`)
}

useHead({ title: () => `${productName.value || 'Sản phẩm'} - BunTech Admin` })
onMounted(loadProduct)
</script>

<template>
  <div>
    <AppBreadcrumb :items="[
      { label: 'Admin', to: '/admin' },
      { label: 'Sản phẩm', to: '/admin/products' },
      { label: productName || '...' },
    ]" />

    <button
      class="flex items-center gap-1 text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200 mb-4 min-h-[44px] px-2 transition-colors"
      @click="router.push('/admin/products')"
    >
      <ArrowLeft class="w-4 h-4" aria-hidden="true" /> Quay lại
    </button>

    <AppErrorState v-if="error" @retry="loadProduct" />

    <!-- Loading skeleton -->
    <template v-else-if="loading">
      <div class="card p-6 animate-fade-in-up mb-6">
        <div class="flex flex-col sm:flex-row gap-6">
          <div class="skeleton w-full sm:w-56 h-56 rounded-2xl flex-shrink-0" />
          <div class="flex-1 space-y-3">
            <div class="skeleton h-7 w-2/3" />
            <div class="flex gap-2"><div class="skeleton h-5 w-20 rounded-full" /><div class="skeleton h-5 w-20 rounded-full" /></div>
            <div class="skeleton h-8 w-40" />
            <div class="skeleton h-2 w-full rounded-full" />
            <div class="skeleton h-16 w-full" />
          </div>
        </div>
      </div>
      <div class="skeleton h-10 w-72 rounded-lg mb-6" />
      <div class="card p-6"><div class="skeleton h-40 w-full" /></div>
    </template>

    <!-- Product detail -->
    <template v-else-if="product">
      <!-- Header card -->
      <div class="card p-6 mb-6 animate-fade-in-up relative overflow-hidden">
        <div class="absolute -top-12 -right-12 w-48 h-48 bg-primary-500/5 dark:bg-primary-400/5 rounded-full blur-2xl" aria-hidden="true" />
        <div class="flex flex-col lg:flex-row gap-6 relative">
          <!-- Image -->
          <div class="w-full lg:w-60 xl:w-72 flex-shrink-0">
            <div class="aspect-square rounded-2xl bg-surface-hover overflow-hidden flex items-center justify-center ring-1 ring-surface-border">
              <img v-if="productImageUrl" :src="productImageUrl" :alt="productName" class="w-full h-full object-cover">
              <svg v-else class="w-16 h-16 text-gray-300 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0 flex flex-col">
            <div class="flex items-center gap-2 mb-2 flex-wrap">
              <AppBadge color="secondary" dot>{{ categoryName }}</AppBadge>
              <AppBadge :color="status === ProductStatus.ACTIVE ? 'success' : 'gray'" dot>
                {{ status === ProductStatus.ACTIVE ? 'Đang bán' : 'Ngưng bán' }}
              </AppBadge>
              <AppBadge :color="stockState.color" variant="soft">{{ stockState.label }}</AppBadge>
            </div>

            <h1 class="text-2xl font-bold text-surface-foreground tracking-tight mb-1">{{ productName }}</h1>
            <p class="text-sm text-slate-500 dark:text-zinc-400 mb-4 font-mono">#{{ String(productId).slice(0, 8) }}</p>

            <div class="flex items-baseline gap-2 mb-4">
              <span class="text-3xl font-bold text-primary-600 dark:text-primary-400 tabular-nums">{{ formatVND(price) }}</span>
              <span class="text-sm text-slate-500 dark:text-zinc-400">/ {{ unit }}</span>
            </div>

            <div class="mb-4">
              <div class="flex items-center justify-between text-sm mb-1.5">
                <span class="text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Boxes class="w-4 h-4" aria-hidden="true" /> Tồn kho
                </span>
                <span class="font-semibold text-surface-foreground tabular-nums">{{ formatNumber(stock) }} {{ unit }}</span>
              </div>
              <div class="h-2 rounded-full bg-surface-hover overflow-hidden">
                <div :class="['h-full rounded-full transition-all duration-500', stockBarColor[stockState.color]]" :style="{ width: `${stockState.pct}%` }" />
              </div>
            </div>

            <p class="text-sm text-slate-600 dark:text-zinc-300 line-clamp-2 flex-1">{{ description }}</p>

            <div class="flex flex-wrap gap-2 mt-5">
              <AppButton size="sm" @click="router.push(`/admin/products/${productId}/edit`)">
                <Pencil class="w-4 h-4" /> Sửa sản phẩm
              </AppButton>
              <AppButton size="sm" variant="danger" @click="confirmDelete">
                <Trash2 class="w-4 h-4" /> Xoá
              </AppButton>
              <AppButton size="sm" variant="outline" @click="router.push(`/products/${product.slug}`)">
                <ExternalLink class="w-4 h-4" /> Xem trang bán
              </AppButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab navigation -->
      <div class="card p-1 mb-6 animate-fade-in-up" style="animation-delay: 60ms">
        <div class="flex gap-1 overflow-x-auto scrollbar-hide">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            :class="[
              'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap min-h-[40px]',
              activeTab === tab.key
                ? 'bg-primary-600 text-white shadow-sm shadow-primary-600/20'
                : 'text-slate-500 dark:text-zinc-400 hover:bg-surface-hover hover:text-surface-foreground',
            ]"
            @click="activeTab = tab.key"
          >
            <component :is="tab.icon" class="w-4 h-4" aria-hidden="true" />
            {{ tab.label }}
            <span v-if="tab.count !== undefined" :class="[
              'text-xs px-1.5 py-0.5 rounded-full tabular-nums',
              activeTab === tab.key ? 'bg-white/20' : 'bg-surface-hover',
            ]">{{ tab.count }}</span>
          </button>
        </div>
      </div>

      <Transition name="fade" mode="out-in">
        <!-- ===== Overview Tab ===== -->
        <div v-if="activeTab === 'overview'" key="overview" class="space-y-6 animate-fade-in-up">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="card p-5 lg:col-span-2 stagger-item">
              <div class="flex items-center gap-2 mb-3">
                <div class="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                  <Package class="w-4 h-4 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                </div>
                <h2 class="text-sm font-semibold text-surface-foreground">Mô tả sản phẩm</h2>
              </div>
              <p class="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">{{ description }}</p>
            </div>

            <div class="card p-5 stagger-item" style="animation-delay: 40ms">
              <div class="flex items-center gap-2 mb-3">
                <div class="w-7 h-7 rounded-lg bg-secondary-50 dark:bg-secondary-900/20 flex items-center justify-center">
                  <Tag class="w-4 h-4 text-secondary-600 dark:text-secondary-400" aria-hidden="true" />
                </div>
                <h2 class="text-sm font-semibold text-surface-foreground">Thông số</h2>
              </div>
              <dl class="space-y-3">
                <div v-for="spec in specs" :key="spec.label" class="flex items-center justify-between gap-3">
                  <dt class="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <component :is="spec.icon" class="w-3.5 h-3.5" aria-hidden="true" />
                    {{ spec.label }}
                  </dt>
                  <dd class="text-sm font-medium text-surface-foreground text-right truncate">{{ spec.value }}</dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Image gallery -->
          <div class="card p-5 stagger-item" style="animation-delay: 80ms">
            <h2 class="text-sm font-semibold text-surface-foreground mb-4">Hình ảnh sản phẩm</h2>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div class="aspect-square rounded-lg bg-surface-hover overflow-hidden ring-1 ring-surface-border">
                <img v-if="productImageUrl" :src="productImageUrl" :alt="productName" class="w-full h-full object-cover">
                <Package v-else class="w-8 h-8 text-gray-300 dark:text-zinc-600 m-auto mt-12" aria-hidden="true" />
              </div>
              <div v-for="i in 3" :key="i" class="aspect-square rounded-lg bg-surface-hover overflow-hidden ring-1 ring-surface-border flex items-center justify-center">
                <Package class="w-8 h-8 text-gray-300 dark:text-zinc-600" aria-hidden="true" />
              </div>
            </div>
          </div>

          <!-- Related products -->
          <div class="card p-5 stagger-item" style="animation-delay: 120ms">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-sm font-semibold text-surface-foreground">Sản phẩm liên quan</h2>
              <NuxtLink to="/admin/products" class="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium flex items-center gap-0.5">
                Xem tất cả <ChevronRight class="w-3 h-3" aria-hidden="true" />
              </NuxtLink>
            </div>
            <div v-if="relatedProducts.length" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <NuxtLink v-for="rp in relatedProducts" :key="rp.id" :to="`/admin/products/${rp.id}`" class="card card-hover p-3 group">
                <div class="aspect-square rounded-lg bg-surface-hover overflow-hidden mb-2 flex items-center justify-center">
                  <img v-if="rp.image_url" :src="rp.image_url" :alt="rp.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform">
                  <Package v-else class="w-8 h-8 text-gray-300 dark:text-zinc-600" aria-hidden="true" />
                </div>
                <p class="text-sm font-medium text-surface-foreground truncate">{{ rp.name }}</p>
                <p class="text-xs text-primary-600 dark:text-primary-400 font-semibold tabular-nums mt-0.5">{{ formatVND(rp.price) }}</p>
                <div class="mt-1">
                  <AppBadge :color="rp.stock > 0 ? 'success' : 'danger'" size="sm">
                    {{ rp.stock > 0 ? `${rp.stock} ${rp.unit}` : 'Hết hàng' }}
                  </AppBadge>
                </div>
              </NuxtLink>
            </div>
            <AppEmptyState v-else title="Chưa có sản phẩm liên quan" description="Không tìm thấy sản phẩm cùng danh mục" />
          </div>
        </div>

        <!-- ===== Inventory Tab ===== -->
        <div v-else-if="activeTab === 'inventory'" key="inventory" class="space-y-6 animate-fade-in-up">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="card p-5 lg:col-span-2 stagger-item">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-sm font-semibold text-surface-foreground">Tồn kho hiện tại</h2>
                <AppBadge :color="stockState.color" dot>{{ stockState.label }}</AppBadge>
              </div>
              <div class="flex items-end justify-between mb-2">
                <div class="flex items-baseline gap-2">
                  <span class="text-4xl font-bold text-surface-foreground tabular-nums">{{ formatNumber(stock) }}</span>
                  <span class="text-sm text-slate-500 dark:text-zinc-400">{{ unit }}</span>
                </div>
                <span class="text-xs text-slate-400 dark:text-zinc-500">Tối đa {{ formatNumber(MAX_STOCK) }} {{ unit }}</span>
              </div>
              <div class="h-3 rounded-full bg-surface-hover overflow-hidden mb-2">
                <div :class="['h-full rounded-full transition-all duration-700', stockBarColor[stockState.color]]" :style="{ width: `${stockState.pct}%` }" />
              </div>
              <div class="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-surface-border">
                <div class="text-center">
                  <p class="text-xs text-slate-500 dark:text-zinc-400 mb-1">Đã bán (30 ngày)</p>
                  <p class="text-lg font-bold text-surface-foreground tabular-nums">840</p>
                </div>
                <div class="text-center border-x border-surface-border">
                  <p class="text-xs text-slate-500 dark:text-zinc-400 mb-1">Nhập (30 ngày)</p>
                  <p class="text-lg font-bold text-success-600 dark:text-success-400 tabular-nums">1,050</p>
                </div>
                <div class="text-center">
                  <p class="text-xs text-slate-500 dark:text-zinc-400 mb-1">Hao hụt</p>
                  <p class="text-lg font-bold text-danger-600 dark:text-danger-400 tabular-nums">12</p>
                </div>
              </div>
            </div>

            <div class="space-y-6">
              <div class="card p-5 stagger-item" style="animation-delay: 40ms">
                <div class="flex items-center gap-2 mb-3">
                  <div class="w-7 h-7 rounded-lg bg-success-50 dark:bg-success-900/20 flex items-center justify-center">
                    <DollarSign class="w-4 h-4 text-success-600 dark:text-success-400" aria-hidden="true" />
                  </div>
                  <h2 class="text-sm font-semibold text-surface-foreground">Giá trị tồn kho</h2>
                </div>
                <p class="text-2xl font-bold text-surface-foreground tabular-nums">{{ formatVND(stockValue) }}</p>
                <p class="text-xs text-slate-500 dark:text-zinc-400 mt-1">{{ formatNumber(stock) }} {{ unit }} × {{ formatVND(price) }}</p>
              </div>

              <div class="card p-5 stagger-item" style="animation-delay: 80ms">
                <div class="flex items-center gap-2 mb-3">
                  <div class="w-7 h-7 rounded-lg bg-warning-50 dark:bg-warning-900/20 flex items-center justify-center">
                    <AlertTriangle class="w-4 h-4 text-warning-600 dark:text-warning-400" aria-hidden="true" />
                  </div>
                  <h2 class="text-sm font-semibold text-surface-foreground">Điểm đặt hàng lại</h2>
                </div>
                <p class="text-xs text-slate-500 dark:text-zinc-400 mb-3">Cảnh báo khi tồn kho giảm xuống mức này</p>
                <AppInput v-model="reorderPoint" type="number" :suffix="unit" :hint="`Dưới ${reorderPoint} ${unit} sẽ báo cần nhập thêm`" />
                <AppButton size="sm" block class="mt-3" @click="saveReorder">
                  <PackageCheck class="w-4 h-4" /> Lưu
                </AppButton>
              </div>
            </div>
          </div>

          <!-- Stock movements timeline -->
          <div class="card p-5 stagger-item" style="animation-delay: 120ms">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-7 h-7 rounded-lg bg-info-50 dark:bg-info-900/20 flex items-center justify-center">
                <Activity class="w-4 h-4 text-info-600 dark:text-info-400" aria-hidden="true" />
              </div>
              <h2 class="text-sm font-semibold text-surface-foreground">Lịch sử biến động kho</h2>
            </div>
            <ol class="relative space-y-0">
              <li v-for="(m, i) in movements" :key="m.id" class="flex gap-4 pb-5 last:pb-0 relative">
                <div v-if="i < movements.length - 1" class="absolute left-[15px] top-8 bottom-0 w-px bg-surface-border" aria-hidden="true" />
                <div :class="['w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ring-4 ring-surface', movementConfig[m.type].bg]">
                  <component :is="movementConfig[m.type].icon" :class="['w-4 h-4', movementConfig[m.type].color]" aria-hidden="true" />
                </div>
                <div class="flex-1 min-w-0 pt-0.5">
                  <div class="flex items-center justify-between gap-2 flex-wrap">
                    <p class="text-sm font-medium text-surface-foreground">{{ movementConfig[m.type].label }}</p>
                    <span :class="['text-sm font-semibold tabular-nums', movementConfig[m.type].color]">
                      {{ movementConfig[m.type].sign }}{{ formatNumber(m.quantity) }} {{ unit }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{{ m.note }}</p>
                  <p class="text-xs text-slate-400 dark:text-zinc-500 mt-1">{{ formatDateTime(m.created_at) }}</p>
                </div>
              </li>
            </ol>
          </div>
        </div>

        <!-- ===== Reviews Tab ===== -->
        <div v-else-if="activeTab === 'reviews'" key="reviews" class="space-y-6 animate-fade-in-up">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="card p-5 stagger-item">
              <div class="flex flex-col items-center text-center mb-4">
                <div class="flex items-center gap-1 mb-2">
                  <Star class="w-7 h-7 text-accent-400 fill-accent-400" aria-hidden="true" />
                  <span class="text-4xl font-bold text-surface-foreground tabular-nums">{{ avgRating.toFixed(1) }}</span>
                </div>
                <p class="text-sm text-slate-500 dark:text-zinc-400">{{ totalReviews }} đánh giá</p>
              </div>
              <div class="space-y-2">
                <div v-for="r in ratingDistribution" :key="r.star" class="flex items-center gap-2">
                  <span class="text-xs text-slate-500 dark:text-zinc-400 w-6 flex items-center gap-0.5">
                    {{ r.star }} <Star class="w-3 h-3 text-accent-400 fill-accent-400" aria-hidden="true" />
                  </span>
                  <div class="flex-1 h-2 rounded-full bg-surface-hover overflow-hidden">
                    <div class="h-full rounded-full bg-accent-400 transition-all duration-500" :style="{ width: `${totalReviews ? (r.count / totalReviews) * 100 : 0}%` }" />
                  </div>
                  <span class="text-xs text-slate-500 dark:text-zinc-400 w-6 text-right tabular-nums">{{ r.count }}</span>
                </div>
              </div>
            </div>

            <div class="card p-5 lg:col-span-2 stagger-item" style="animation-delay: 40ms">
              <h2 class="text-sm font-semibold text-surface-foreground mb-4">Đánh giá gần đây</h2>
              <template v-if="reviews.length">
                <div class="space-y-4">
                  <div v-for="review in reviews" :key="review.id" class="flex gap-3 pb-4 last:pb-0 border-b border-surface-border last:border-0">
                    <AppAvatar :name="review.author_name" size="md" />
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between gap-2 mb-1">
                        <p class="text-sm font-medium text-surface-foreground">{{ review.author_name }}</p>
                        <span class="text-xs text-slate-400 dark:text-zinc-500">{{ formatDate(review.created_at) }}</span>
                      </div>
                      <div class="flex items-center gap-0.5 mb-1.5">
                        <svg v-for="i in 5" :key="i" :class="['w-3.5 h-3.5', i <= review.rating ? 'text-accent-400 fill-accent-400' : 'text-gray-200 dark:text-zinc-600 fill-none']" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <p class="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">{{ review.content }}</p>
                    </div>
                  </div>
                </div>
              </template>
              <AppEmptyState v-else title="Chưa có đánh giá" description="Khách hàng chưa đánh giá sản phẩm này" />
            </div>
          </div>
        </div>

        <!-- ===== Analytics Tab ===== -->
        <div v-else-if="activeTab === 'analytics'" key="analytics" class="space-y-6 animate-fade-in-up">
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div v-for="(card, i) in analyticsCards" :key="card.label" class="card card-hover p-4 stagger-item relative overflow-hidden" :style="{ animationDelay: `${i * 40}ms` }">
              <div class="flex items-start justify-between mb-2.5">
                <div :class="['w-9 h-9 rounded-lg flex items-center justify-center ring-1', colorMap[card.color].bg, colorMap[card.color].ring]">
                  <component :is="card.icon" :class="['w-[18px] h-[18px]', colorMap[card.color].text]" aria-hidden="true" />
                </div>
                <span class="text-xs font-medium text-success-600 dark:text-success-400 flex items-center gap-0.5">
                  <ArrowUpRight class="w-3 h-3" aria-hidden="true" /> {{ card.trend }}
                </span>
              </div>
              <p class="text-xs text-slate-500 dark:text-zinc-400 mb-0.5 font-medium">{{ card.label }}</p>
              <p class="text-lg font-bold text-surface-foreground tracking-tight tabular-nums truncate">{{ card.value }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="card p-5 lg:col-span-2 stagger-item" style="animation-delay: 40ms">
              <div class="flex items-center justify-between mb-5">
                <div>
                  <h2 class="text-sm font-semibold text-surface-foreground">Doanh số theo tháng</h2>
                  <p class="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">6 tháng gần nhất</p>
                </div>
                <div class="flex items-center gap-1.5 text-sm text-success-600 dark:text-success-400 font-medium px-2.5 py-1 rounded-md bg-success-50 dark:bg-success-900/20">
                  <TrendingUp class="w-3.5 h-3.5" aria-hidden="true" />
                  <span class="tabular-nums">{{ formatVND(analytics.revenue) }}</span>
                </div>
              </div>
              <div class="flex items-end justify-between gap-3 h-56 pt-4">
                <div v-for="m in monthlySales" :key="m.month" class="flex-1 flex flex-col items-center gap-2 group">
                  <div class="w-full flex flex-col justify-end h-full relative">
                    <div class="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-semibold text-surface-foreground bg-surface-hover px-1.5 py-0.5 rounded whitespace-nowrap tabular-nums">
                      {{ formatVND(m.sales) }}
                    </div>
                    <div class="w-full rounded-t-md bg-gradient-to-t from-primary-500 to-primary-400 transition-all duration-500 group-hover:from-primary-600 group-hover:to-primary-500" :style="{ height: `${Math.max(4, (m.sales / maxSales) * 100)}%` }" />
                  </div>
                  <span class="text-xs text-slate-500 dark:text-zinc-400 font-medium">{{ m.month }}</span>
                </div>
              </div>
            </div>

            <div class="card p-5 stagger-item" style="animation-delay: 80ms">
              <div class="flex items-center gap-2 mb-3">
                <Users class="w-4 h-4 text-accent-500" aria-hidden="true" />
                <h2 class="text-sm font-semibold text-surface-foreground">Khách mua nhiều</h2>
              </div>
              <div class="space-y-1">
                <div v-for="(c, i) in topCustomers" :key="c.name" class="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-hover transition-colors">
                  <div class="relative">
                    <AppAvatar :name="c.name" size="sm" />
                    <span :class="[
                      'absolute -bottom-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center ring-2 ring-surface',
                      i === 0 ? 'bg-accent-400 text-white' : i === 1 ? 'bg-slate-300 dark:bg-zinc-600 text-white' : 'bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300',
                    ]">{{ i + 1 }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-surface-foreground truncate">{{ c.name }}</p>
                    <p class="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">{{ c.orders }} đơn · {{ formatVND(c.total) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </template>

    <AppEmptyState v-else title="Không tìm thấy sản phẩm" description="Sản phẩm không tồn tại hoặc đã bị xoá" />
  </div>
</template>
