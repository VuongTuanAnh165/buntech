<script setup lang="ts">
import { ProductStatus, InventoryMovementType } from '~/utils/enums'
import type { Product, ProductReview, InventoryMovement } from '~/utils/types'
import { mockProducts, mockProductReviews as mockReviews } from '~/utils/mockData'

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

    // Movements (mock)
    movements.value = [
      { id: '1', inventory_id: 'inv-1', type: InventoryMovementType.IMPORT, quantity: 50, note: 'Nhập kho từ xưởng', created_at: '2023-10-15T10:00:00Z' },
      { id: '2', inventory_id: 'inv-1', type: InventoryMovementType.EXPORT, quantity: 20, note: 'Xuất kho cho đơn hàng', created_at: '2023-10-14T14:30:00Z' },
      { id: '3', inventory_id: 'inv-1', type: InventoryMovementType.IMPORT, quantity: 100, note: 'Nhập kho từ xưởng', created_at: '2023-10-12T09:15:00Z' },
      { id: '4', inventory_id: 'inv-1', type: InventoryMovementType.EXPORT, quantity: 15, note: 'Xuất kho cho đơn hàng', created_at: '2023-10-10T16:45:00Z' },
      { id: '5', inventory_id: 'inv-1', type: InventoryMovementType.LOSS, quantity: 2, note: 'Hàng hỏng trong quá trình vận chuyển', created_at: '2023-10-08T11:20:00Z' }
    ]

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
  if (stock.value <= 0) return { label: 'Hết hàng', color: 'error', tailwind: 'bg-error-500', pct: 0 }
  if (stock.value <= 50) return { label: 'Sắp hết', color: 'warning', tailwind: 'bg-warning-500', pct: stockPct.value }
  if (stock.value <= 200) return { label: 'Khá', color: 'info', tailwind: 'bg-info-500', pct: stockPct.value }
  return { label: 'Đủ hàng', color: 'success', tailwind: 'bg-success-500', pct: stockPct.value }
})

const stockValue = computed(() => stock.value * price.value)

const movementConfig: any = {
  [InventoryMovementType.IMPORT]: { icon: 'i-lucide-arrow-down-right', color: 'text-success-600 dark:text-success-400', bg: 'bg-success-50 dark:bg-success-900/20', sign: '+', label: 'Nhập kho' },
  [InventoryMovementType.EXPORT]: { icon: 'i-lucide-arrow-up-right', color: 'text-info-600 dark:text-info-400', bg: 'bg-info-50 dark:bg-info-900/20', sign: '-', label: 'Xuất kho' },
  [InventoryMovementType.LOSS]: { icon: 'i-lucide-alert-triangle', color: 'text-error-600 dark:text-error-400', bg: 'bg-error-50 dark:bg-error-900/20', sign: '-', label: 'Hao hụt' },
}

// Analytics (mock)
const analytics = {
  totalSold: 1840,
  revenue: 46_200_000,
  avgOrderValue: 251_000,
  viewCount: 3824,
}
const analyticsCards = computed(() => [
  { label: 'Đã bán', value: formatNumber(analytics.totalSold) + ' ' + unit.value, icon: 'i-lucide-shopping-cart', color: 'primary', trend: '+14%' },
  { label: 'Doanh thu', value: formatVND(analytics.revenue), icon: 'i-lucide-wallet', color: 'success', trend: '+22%' },
  { label: 'Giá trị TB/đơn', value: formatVND(analytics.avgOrderValue), icon: 'i-lucide-trending-up', color: 'info', trend: '+6%' },
  { label: 'Lượt xem', value: formatNumber(analytics.viewCount), icon: 'i-lucide-eye', color: 'neutral', trend: '+18%' },
])
const colorMap: Record<string, { bg: string; text: string; ring: string }> = {
  primary: { bg: 'bg-primary-50 dark:bg-primary-900/20', text: 'text-primary-600 dark:text-primary-400', ring: 'ring-primary-100 dark:ring-primary-900/30' },
  success: { bg: 'bg-success-50 dark:bg-success-900/20', text: 'text-success-600 dark:text-success-400', ring: 'ring-success-100 dark:ring-success-900/30' },
  info: { bg: 'bg-info-50 dark:bg-info-900/20', text: 'text-info-600 dark:text-info-400', ring: 'ring-info-100 dark:ring-info-900/30' },
  neutral: { bg: 'bg-slate-50 dark:bg-zinc-800', text: 'text-slate-600 dark:text-zinc-400', ring: 'ring-slate-200 dark:ring-zinc-700' },
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
    { star: 5, count: counts[4] || 0 },
    { star: 4, count: counts[3] || 0 },
    { star: 3, count: counts[2] || 0 },
    { star: 2, count: counts[1] || 0 },
    { star: 1, count: counts[0] || 0 },
  ]
})
const avgRating = computed(() => {
  if (!reviews.value.length) return 0
  return Math.round((reviews.value.reduce((s, r) => s + r.rating, 0) / reviews.value.length) * 10) / 10
})
const totalReviews = computed(() => reviews.value.length)

const specs = computed(() => [
  { icon: 'i-lucide-tag', label: 'Danh mục', value: categoryName.value },
  { icon: 'i-lucide-dollar-sign', label: 'Giá bán', value: `${formatVND(price.value)} / ${unit.value}` },
  { icon: 'i-lucide-layers', label: 'Tồn kho', value: `${formatNumber(stock.value)} ${unit.value}` },
  { icon: 'i-lucide-package', label: 'Trạng thái', value: status.value === ProductStatus.ACTIVE ? 'Đang bán' : 'Ngưng bán' },
  { icon: 'i-lucide-calendar', label: 'Ngày tạo', value: formatDate(product.value?.created_at || '') || '—' },
  { icon: 'i-lucide-calendar', label: 'Cập nhật', value: formatDate(product.value?.updated_at || '') || '—' },
])

function confirmDelete() {
  toast.add({ title: 'Chức năng xoá sản phẩm sẽ được kích hoạt', color: 'warning' })
}

function saveReorder() {
  toast.add({ title: `Đã cập nhật điểm đặt hàng lại: ${reorderPoint.value} ${unit.value}`, color: 'success' })
}

useHead({ title: () => `${productName.value || 'Sản phẩm'} - BunTech Admin` })
onMounted(loadProduct)
</script>

<template>
  <div>
    <button
      class="flex items-center gap-1 text-sm text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 mb-4 min-h-[44px] px-2 transition-colors"
      @click="router.push('/admin/products')"
    >
      <span class="i-lucide-arrow-left w-4 h-4" aria-hidden="true" /> Quay lại
    </button>

    <BaseEmptyState v-if="error" title="Lỗi" description="Không thể tải sản phẩm." icon="i-lucide-alert-triangle" @action="loadProduct" action-label="Thử lại" />

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
              <NuxtImg v-if="productImageUrl" :src="productImageUrl" :alt="productName" class="w-full h-full object-cover" />
              <span v-else class="i-lucide-image w-16 h-16 text-gray-300 dark:text-zinc-600" aria-hidden="true" />
            </div>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0 flex flex-col">
            <div class="flex items-center gap-2 mb-2 flex-wrap">
              <UBadge color="neutral" variant="subtle"><template #leading><span class="w-1.5 h-1.5 rounded-full bg-current" /></template>{{ categoryName }}</UBadge>
              <UBadge :color="status === ProductStatus.ACTIVE ? 'success' : 'neutral'" variant="subtle">
                <template #leading><span class="w-1.5 h-1.5 rounded-full bg-current" /></template>
                {{ status === ProductStatus.ACTIVE ? 'Đang bán' : 'Ngưng bán' }}
              </UBadge>
              <UBadge :color="(stockState.color as any)" variant="soft">{{ stockState.label }}</UBadge>
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
                  <span class="i-lucide-boxes w-4 h-4" aria-hidden="true" /> Tồn kho
                </span>
                <span class="font-semibold text-surface-foreground tabular-nums">{{ formatNumber(stock) }} {{ unit }}</span>
              </div>
              <div class="h-2 rounded-full bg-surface-hover overflow-hidden">
                <div :class="['h-full rounded-full transition-all duration-500', stockState.tailwind]" :style="{ width: `${stockState.pct}%` }" />
              </div>
            </div>

            <p class="text-sm text-slate-600 dark:text-zinc-300 line-clamp-2 flex-1">{{ description }}</p>

            <div class="flex flex-wrap gap-2 mt-5">
              <button class="px-2 py-1 bg-surface border border-surface-border rounded shadow-sm flex items-center justify-center hover:bg-surface-hover text-slate-600 dark:text-zinc-300 transition-colors" title="Sửa" @click="() => navigateTo(`/admin/products/${product?.id}/edit`)">
                <UIcon name="i-lucide-pencil" class="w-3.5 h-3.5" />
              </button>
              <UButton size="sm" color="error" @click="confirmDelete" icon="i-lucide-trash-2">Xoá</UButton>
              <UButton size="sm" color="neutral" variant="outline" icon="i-lucide-external-link">Xem trang bán</UButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab navigation -->
      <UTabs
        :items="[
          { label: 'Tổng quan', slot: 'overview', icon: 'i-lucide-package' },
          { label: 'Tồn kho', slot: 'inventory', icon: 'i-lucide-boxes' },
          { label: `Đánh giá (${reviews.length})`, slot: 'reviews', icon: 'i-lucide-star' },
          { label: 'Phân tích', slot: 'analytics', icon: 'i-lucide-bar-chart-3' }
        ]"
        @change="(idx: number) => activeTab = ['overview', 'inventory', 'reviews', 'analytics'][idx] as any"
        class="mb-6 animate-fade-in-up"
        style="animation-delay: 60ms"
      />

      <Transition name="fade" mode="out-in">
        <!-- ===== Overview Tab ===== -->
        <div v-if="activeTab === 'overview'" key="overview" class="space-y-6 animate-fade-in-up">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="card p-5 lg:col-span-2 stagger-item">
              <div class="flex items-center gap-2 mb-3">
                <div class="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                  <span class="i-lucide-package w-4 h-4 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                </div>
                <h2 class="text-sm font-semibold text-surface-foreground">Mô tả sản phẩm</h2>
              </div>
              <p class="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">{{ description }}</p>
            </div>

            <div class="card p-5 stagger-item" style="animation-delay: 40ms">
              <div class="flex items-center gap-2 mb-3">
                <div class="w-7 h-7 rounded-lg bg-secondary-50 dark:bg-secondary-900/20 flex items-center justify-center">
                  <span class="i-lucide-tag w-4 h-4 text-secondary-600 dark:bg-secondary-400" aria-hidden="true" />
                </div>
                <h2 class="text-sm font-semibold text-surface-foreground">Thông số</h2>
              </div>
              <dl class="space-y-3">
                <div v-for="spec in specs" :key="spec.label" class="flex items-center justify-between gap-3">
                  <dt class="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <span :class="['w-3.5 h-3.5', spec.icon]" aria-hidden="true" />
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
                <NuxtImg v-if="productImageUrl" :src="productImageUrl" :alt="productName" class="w-full h-full object-cover" />
                <span v-else class="i-lucide-package w-8 h-8 text-gray-300 dark:text-zinc-600 m-auto mt-12 block" aria-hidden="true" />
              </div>
              <div v-for="i in 3" :key="i" class="aspect-square rounded-lg bg-surface-hover overflow-hidden ring-1 ring-surface-border flex items-center justify-center">
                <span class="i-lucide-package w-8 h-8 text-gray-300 dark:text-zinc-600" aria-hidden="true" />
              </div>
            </div>
          </div>

          <!-- Related products -->
          <div class="card p-5 stagger-item" style="animation-delay: 120ms">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-sm font-semibold text-surface-foreground">Sản phẩm liên quan</h2>
              <NuxtLink to="/admin/products" class="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium flex items-center gap-0.5">
                Xem tất cả <span class="i-lucide-chevron-right w-3 h-3" aria-hidden="true" />
              </NuxtLink>
            </div>
            <div v-if="relatedProducts.length" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <NuxtLink v-for="rp in relatedProducts" :key="rp.id" :to="`/admin/products/${rp.id}`" class="card card-hover p-3 group">
                <div class="aspect-square rounded-lg bg-surface-hover overflow-hidden mb-2 flex items-center justify-center">
                  <NuxtImg v-if="rp.image_url" :src="rp.image_url" :alt="rp.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <span v-else class="i-lucide-package w-8 h-8 text-gray-300 dark:text-zinc-600" aria-hidden="true" />
                </div>
                <p class="text-sm font-medium text-surface-foreground truncate">{{ rp.name }}</p>
                <p class="text-xs text-primary-600 dark:text-primary-400 font-semibold tabular-nums mt-0.5">{{ formatVND(rp.price) }}</p>
                <div class="mt-1">
                  <UBadge :color="rp.stock > 0 ? 'success' : 'error'" variant="subtle">
                    {{ rp.stock > 0 ? `${rp.stock} ${rp.unit}` : 'Hết hàng' }}
                  </UBadge>
                </div>
              </NuxtLink>
            </div>
            <BaseEmptyState v-else title="Chưa có sản phẩm liên quan" description="Không tìm thấy sản phẩm cùng danh mục" icon="i-lucide-package" />
          </div>
        </div>

        <!-- ===== Inventory Tab ===== -->
        <div v-else-if="activeTab === 'inventory'" key="inventory" class="space-y-6 animate-fade-in-up">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="card p-5 lg:col-span-2 stagger-item">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-sm font-semibold text-surface-foreground">Tồn kho hiện tại</h2>
                <UBadge :color="(stockState.color as any)" variant="subtle">
                  <template #leading><span class="w-1.5 h-1.5 rounded-full bg-current" /></template>{{ stockState.label }}
                </UBadge>
              </div>
              <div class="flex items-end justify-between mb-2">
                <div class="flex items-baseline gap-2">
                  <span class="text-4xl font-bold text-surface-foreground tabular-nums">{{ formatNumber(stock) }}</span>
                  <span class="text-sm text-slate-500 dark:text-zinc-400">{{ unit }}</span>
                </div>
                <span class="text-xs text-slate-400 dark:text-zinc-500">Tối đa {{ formatNumber(MAX_STOCK) }} {{ unit }}</span>
              </div>
              <div class="h-3 rounded-full bg-surface-hover overflow-hidden mb-2">
                <div :class="['h-full rounded-full transition-all duration-700', stockState.tailwind]" :style="{ width: `${stockState.pct}%` }" />
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
                  <p class="text-lg font-bold text-error-600 dark:text-error-400 tabular-nums">12</p>
                </div>
              </div>
            </div>

            <div class="space-y-6">
              <div class="card p-5 stagger-item" style="animation-delay: 40ms">
                <div class="flex items-center gap-2 mb-3">
                  <div class="w-7 h-7 rounded-lg bg-success-50 dark:bg-success-900/20 flex items-center justify-center">
                    <span class="i-lucide-dollar-sign w-4 h-4 text-success-600 dark:text-success-400" aria-hidden="true" />
                  </div>
                  <h2 class="text-sm font-semibold text-surface-foreground">Giá trị tồn kho</h2>
                </div>
                <p class="text-2xl font-bold text-surface-foreground tabular-nums">{{ formatVND(stockValue) }}</p>
                <p class="text-xs text-slate-500 dark:text-zinc-400 mt-1">{{ formatNumber(stock) }} {{ unit }} × {{ formatVND(price) }}</p>
              </div>

              <div class="card p-5 stagger-item" style="animation-delay: 80ms">
                <div class="flex items-center gap-2 mb-3">
                  <div class="w-7 h-7 rounded-lg bg-warning-50 dark:bg-warning-900/20 flex items-center justify-center">
                    <span class="i-lucide-alert-triangle w-4 h-4 text-warning-600 dark:text-warning-400" aria-hidden="true" />
                  </div>
                  <h2 class="text-sm font-semibold text-surface-foreground">Điểm đặt hàng lại</h2>
                </div>
                <p class="text-xs text-slate-500 dark:text-zinc-400 mb-3">Cảnh báo khi tồn kho giảm xuống mức này</p>
                <UInput v-model="reorderPoint" type="number">
                  <template #trailing><span class="text-xs text-slate-500">{{ unit }}</span></template>
                </UInput>
                <UButton size="sm" block class="mt-3" @click="saveReorder" icon="i-lucide-package-check">
                  Lưu
                </UButton>
              </div>
            </div>
          </div>

          <!-- Stock movements timeline -->
          <div class="card p-5 stagger-item" style="animation-delay: 120ms">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-7 h-7 rounded-lg bg-info-50 dark:bg-info-900/20 flex items-center justify-center">
                <span class="i-lucide-activity w-4 h-4 text-info-600 dark:text-info-400" aria-hidden="true" />
              </div>
              <h2 class="text-sm font-semibold text-surface-foreground">Lịch sử biến động kho</h2>
            </div>
            <ol class="relative space-y-0">
              <li v-for="(movement, i) in movements" :key="movement.id" class="flex gap-4 pb-5 last:pb-0 relative">
                <div v-if="i < movements.length - 1" class="absolute left-[15px] top-8 bottom-0 w-px bg-surface-border" aria-hidden="true" />
                <div :class="['w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ring-4 ring-surface', movementConfig[movement.type].bg]">
                  <span :class="['w-4 h-4', movementConfig[movement.type].icon, movementConfig[movement.type].color]" aria-hidden="true" />
                </div>
                <div class="flex-1 min-w-0 pt-0.5">
                  <div class="flex items-center justify-between gap-2 flex-wrap">
                    <p class="text-sm font-medium text-surface-foreground">{{ movementConfig[movement.type].label }}</p>
                    <p class="font-medium text-surface-foreground">{{ movement.type === InventoryMovementType.IMPORT ? '+' : '-' }}{{ movement.quantity }} {{ product?.unit || 'đv' }}</p>
                    <p class="text-xs text-slate-500 dark:text-zinc-400">{{ formatDate(movement.created_at) }}</p>
                  </div>
                  <p class="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{{ movement.note }}</p>
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
                  <span class="i-lucide-star w-7 h-7 text-accent-400 fill-accent-400" aria-hidden="true" />
                  <span class="text-4xl font-bold text-surface-foreground tabular-nums">{{ avgRating.toFixed(1) }}</span>
                </div>
                <p class="text-sm text-slate-500 dark:text-zinc-400">{{ totalReviews }} đánh giá</p>
              </div>
              <div class="space-y-2">
                <div v-for="r in ratingDistribution" :key="r.star" class="flex items-center gap-2">
                  <span class="text-xs text-slate-500 dark:text-zinc-400 w-6 flex items-center gap-0.5">
                    {{ r.star }} <span class="i-lucide-star w-3 h-3 text-accent-400 fill-accent-400" aria-hidden="true" />
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
                    <UAvatar :alt="review.author_name" size="md" />
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between gap-2 mb-1">
                        <p class="text-sm font-medium text-surface-foreground">{{ review.author_name }}</p>
                        <span class="text-xs text-slate-400 dark:text-zinc-500">{{ formatDate(review.created_at) }}</span>
                      </div>
                      <div class="flex items-center gap-0.5 mb-1.5">
                        <span v-for="i in 5" :key="i" :class="['w-3.5 h-3.5', i <= review.rating ? 'i-lucide-star text-accent-400 fill-accent-400' : 'i-lucide-star text-gray-200 dark:text-zinc-600 fill-none']" aria-hidden="true" />
                      </div>
                      <p class="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">{{ review.content }}</p>
                    </div>
                  </div>
                </div>
              </template>
              <BaseEmptyState v-else title="Chưa có đánh giá" description="Khách hàng chưa đánh giá sản phẩm này" icon="i-lucide-message-square" />
            </div>
          </div>
        </div>

        <!-- ===== Analytics Tab ===== -->
        <div v-else-if="activeTab === 'analytics'" key="analytics" class="space-y-6 animate-fade-in-up">
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div v-for="(card, i) in analyticsCards" :key="card.label" class="card card-hover p-4 stagger-item relative overflow-hidden" :style="{ animationDelay: `${i * 40}ms` }">
              <div class="flex items-start justify-between mb-2.5">
                <div :class="['w-9 h-9 rounded-lg flex items-center justify-center ring-1', colorMap[card.color].bg, colorMap[card.color].ring]">
                  <span :class="['w-[18px] h-[18px]', card.icon, colorMap[card.color].text]" aria-hidden="true" />
                </div>
                <span class="text-xs font-medium text-success-600 dark:text-success-400 flex items-center gap-0.5">
                  <span class="i-lucide-arrow-up-right w-3 h-3" aria-hidden="true" /> {{ card.trend }}
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
                  <span class="i-lucide-trending-up w-3.5 h-3.5" aria-hidden="true" />
                  <span class="tabular-nums">{{ formatVND(analytics.revenue) }}</span>
                </div>
              </div>
              <div class="flex items-end justify-between gap-3 h-56 pt-4">
                <div v-for="m in monthlySales" :key="m.month" class="flex-1 flex flex-col items-center gap-2 group">
                  <div class="w-full flex flex-col justify-end h-full relative">
                    <div class="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-semibold text-surface-foreground bg-surface-hover px-1.5 py-0.5 rounded whitespace-nowrap tabular-nums z-10 shadow-sm ring-1 ring-surface-border">
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
                <span class="i-lucide-users w-4 h-4 text-accent-500" aria-hidden="true" />
                <h2 class="text-sm font-semibold text-surface-foreground">Khách mua nhiều</h2>
              </div>
              <div class="space-y-1">
                <div v-for="(c, i) in topCustomers" :key="c.name" class="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-hover transition-colors">
                  <div class="relative">
                    <UAvatar :alt="c.name" size="sm" />
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

    <BaseEmptyState v-else title="Không tìm thấy sản phẩm" description="Sản phẩm không tồn tại hoặc đã bị xoá" icon="i-lucide-package-x" />
  </div>
</template>
