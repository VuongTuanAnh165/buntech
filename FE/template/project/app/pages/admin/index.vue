<script setup lang="ts">
import { TrendingUp, Users, ShoppingCart, Wallet, ArrowUpRight, Package, Star, Activity, Clock, Truck, CheckCircle2, XCircle, AlertCircle } from 'lucide-vue-next'
import { OrderStatus, ORDER_STATUS_COLORS } from '../../core/enums'
import { mockOrders, mockTopBuyers, mockProducts, mockTransactions, mockDashboardKPI, mockRevenueData } from '../../core/mock/data'
const { t } = useI18n()
const { formatVND, formatDate } = useFormat()
useHead({ title: `${t('nav.dashboard')} - BunTech Admin` })
definePageMeta({ layout: 'admin' })

const loading = ref(true)
const error = ref(false)

const kpi = reactive({
  revenueToday: 0,
  ordersToday: 0,
  customersTotal: 0,
  productsTotal: 0,
})

const revenueData = ref<{ day: string; revenue: number }[]>([])
const topBuyers = ref(mockTopBuyers)
const recentOrders = ref<Record<string, unknown>[]>([])
const topProducts = ref<{ name: string; value: number }[]>([])
const orderStatusData = ref<{ name: string; value: number }[]>([])

const colorMap: Record<string, { bg: string; text: string; ring: string; bar: string }> = {
  primary: { bg: 'bg-primary-50 dark:bg-primary-900/20', text: 'text-primary-600 dark:text-primary-400', ring: 'ring-primary-100 dark:ring-primary-900/30', bar: 'bg-gradient-to-r from-primary-500 to-primary-400' },
  secondary: { bg: 'bg-secondary-50 dark:bg-secondary-900/20', text: 'text-secondary-600 dark:text-secondary-400', ring: 'ring-secondary-100 dark:ring-secondary-900/30', bar: 'bg-gradient-to-r from-secondary-500 to-secondary-400' },
  success: { bg: 'bg-success-50 dark:bg-success-900/20', text: 'text-success-600 dark:text-success-400', ring: 'ring-success-100 dark:ring-success-900/30', bar: 'bg-gradient-to-r from-success-500 to-success-400' },
  warning: { bg: 'bg-warning-50 dark:bg-warning-900/20', text: 'text-warning-600 dark:text-warning-400', ring: 'ring-warning-100 dark:ring-warning-900/30', bar: 'bg-gradient-to-r from-warning-500 to-warning-400' },
}

const statusLabels: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  PROCESSING: 'Đang chuẩn bị',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
}

const statusIcons: Record<string, unknown> = {
  PENDING: Clock,
  PROCESSING: Package,
  SHIPPING: Truck,
  DELIVERED: CheckCircle2,
  CANCELLED: XCircle,
}

const cards = computed(() => [
  { label: t('dashboard.revenueToday'), value: formatVND(kpi.revenueToday), icon: Wallet, color: 'primary' as const, trend: '+12%' },
  { label: t('dashboard.ordersToday'), value: String(kpi.ordersToday), icon: ShoppingCart, color: 'secondary' as const, trend: '+8%' },
  { label: t('dashboard.customersTotal'), value: String(kpi.customersTotal), icon: Users, color: 'success' as const, trend: '+5%' },
  { label: t('dashboard.productsTotal'), value: String(kpi.productsTotal), icon: Package, color: 'warning' as const, trend: '+2%' },
])

const mockStatusData = [
  { name: 'Chờ xử lý', value: 5 },
  { name: 'Đang chuẩn bị', value: 3 },
  { name: 'Đang giao', value: 8 },
  { name: 'Đã giao', value: 32 },
  { name: 'Đã hủy', value: 2 },
]

const mockTopProducts = [
  { name: 'Bún tươi sợi nhỏ', value: 8500000 },
  { name: 'Bún tươi sợi lớn', value: 6200000 },
  { name: 'Phở tươi mỏng', value: 4800000 },
  { name: 'Bún khô sợi nhỏ', value: 3600000 },
  { name: 'Hủ tiếu tươi', value: 2900000 },
  { name: 'Miến dong lớn', value: 2100000 },
]

async function loadData() {
  loading.value = true
  error.value = false
  try {
    // Simulate API delay for realistic loading state
    await new Promise(resolve => setTimeout(resolve, 400))

    // Use mock data directly for rich demo
    const today = new Date().toISOString().slice(0, 10)
    const todayOrders = mockOrders.filter(o => o.created_at.slice(0, 10) === today)
    kpi.revenueToday = mockDashboardKPI.revenueToday
    kpi.ordersToday = mockDashboardKPI.ordersToday
    kpi.customersTotal = mockDashboardKPI.newCustomers
    kpi.productsTotal = mockProducts.length

    revenueData.value = mockRevenueData.map((r, i) => ({
      day: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][new Date(r.date).getDay()],
      revenue: r.revenue,
    }))
    recentOrders.value = mockOrders.slice(0, 6)

    // Calculate top products from order items
    const productTotals: Record<string, number> = {}
    for (const order of mockOrders) {
      for (const item of (order.order_items || [])) {
        productTotals[item.product_name] = (productTotals[item.product_name] || 0) + item.quantity * item.price
      }
    }
    topProducts.value = Object.entries(productTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }))

    // Calculate order status distribution
    const statusCounts: Record<string, number> = {}
    for (const order of mockOrders) {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1
    }
    orderStatusData.value = Object.entries(statusCounts).map(([status, count]) => ({
      name: statusLabels[status] || status,
      value: count,
    }))
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

const displayRevenue = computed(() => revenueData.value.length ? revenueData.value : mockRevenueData.map((r, i) => ({
  day: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][new Date(r.date).getDay()],
  revenue: r.revenue,
})))
const displayStatusData = computed(() => orderStatusData.value.length ? orderStatusData.value : mockStatusData)
const displayTopProducts = computed(() => topProducts.value.length ? topProducts.value : mockTopProducts)
const displayRecentOrders = computed(() => recentOrders.value.length ? recentOrders.value : mockOrders.slice(0, 6))
</script>

<template>
  <div>
    <AppPageHeader :title="t('dashboard.title')" :subtitle="t('dashboard.subtitle')" :breadcrumb-label="t('nav.dashboard')" />

    <AppErrorState v-if="error" @retry="loadData" />

    <template v-else>
      <!-- KPI Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <template v-if="loading">
          <div v-for="i in 4" :key="i" class="card p-5">
            <div class="flex items-center gap-3 mb-4">
              <AppSkeleton height="h-10" width="w-10" class="rounded-xl" />
              <div class="flex-1"><AppSkeleton height="h-3" width="w-14" /></div>
            </div>
            <AppSkeleton height="h-3" class="mb-2.5" />
            <AppSkeleton height="h-7" width="w-2/3" />
          </div>
        </template>
        <template v-else>
          <div
            v-for="(card, i) in cards"
            :key="card.label"
            class="card card-hover p-5 stagger-item relative overflow-hidden group"
            :style="{ animationDelay: `${i * 40}ms` }"
          >
            <div :class="['kpi-accent', colorMap[card.color].bar]" />
            <div class="flex items-start justify-between mb-3">
              <div :class="['w-10 h-10 rounded-xl flex items-center justify-center ring-1 transition-transform duration-200 group-hover:scale-110', colorMap[card.color].bg, colorMap[card.color].ring]">
                <component :is="card.icon" :class="['w-5 h-5', colorMap[card.color].text]" aria-hidden="true" />
              </div>
              <span class="text-[11px] font-semibold text-success-600 dark:text-success-400 flex items-center gap-0.5 bg-success-50 dark:bg-success-900/20 px-2 py-1 rounded-md tabular-nums">
                <ArrowUpRight class="w-3 h-3" aria-hidden="true" /> {{ card.trend }}
              </span>
            </div>
            <p class="text-[13px] text-slate-500 dark:text-zinc-400 mb-1 font-medium">{{ card.label }}</p>
            <p class="text-2xl font-bold text-surface-foreground tracking-tight tabular-nums">{{ card.value }}</p>
          </div>
        </template>
      </div>

      <!-- Revenue Area Chart + Order Status Pie -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div class="card p-5 lg:p-6 lg:col-span-2 stagger-item" style="animation-delay: 160ms">
          <div class="flex items-center justify-between mb-5">
            <div>
              <h2 class="text-sm font-semibold text-surface-foreground tracking-tight">{{ t('dashboard.revenueChart') }}</h2>
              <p class="text-xs text-slate-500 dark:text-zinc-400 mt-1">7 ngày gần nhất</p>
            </div>
            <div class="flex items-center gap-1.5 text-sm text-success-600 dark:text-success-400 font-medium px-2.5 py-1 rounded-md bg-success-50 dark:bg-success-900/20 tabular-nums">
              <TrendingUp class="w-3.5 h-3.5" aria-hidden="true" />
              <span>{{ formatVND(kpi.revenueToday) }}</span>
            </div>
          </div>
          <DashboardChart v-if="!loading" type="area" :data="displayRevenue" x-field="day" y-field="revenue" height="260px" />
          <div v-else class="h-[260px] flex items-center justify-center">
            <div class="flex items-center gap-3 text-slate-400">
              <Activity class="w-5 h-5 animate-pulse" aria-hidden="true" />
              <span class="text-sm">Đang tải dữ liệu...</span>
            </div>
          </div>
        </div>

        <div class="card p-5 lg:p-6 stagger-item" style="animation-delay: 200ms">
          <h2 class="text-sm font-semibold text-surface-foreground mb-5 tracking-tight">Phân bố trạng thái đơn</h2>
          <DashboardChart v-if="!loading" type="pie" :data="displayStatusData" name-field="name" value-field="value" height="260px" :colors="['#f59e0b', '#3b82f6', '#ed7628', '#10b981', '#ef4444']" />
          <div v-else class="h-[260px] flex items-center justify-center">
            <div class="flex items-center gap-3 text-slate-400">
              <Activity class="w-5 h-5 animate-pulse" aria-hidden="true" />
              <span class="text-sm">Đang tải...</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Products Bar Chart + Top Buyers -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div class="card p-5 lg:p-6 lg:col-span-2 stagger-item" style="animation-delay: 240ms">
          <h2 class="text-sm font-semibold text-surface-foreground mb-5 tracking-tight">Sản phẩm bán chạy nhất</h2>
          <DashboardChart v-if="!loading" type="bar" :data="displayTopProducts" x-field="name" y-field="value" height="240px" :colors="['#ed7628', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899']" />
          <div v-else class="h-[240px] flex items-center justify-center">
            <div class="flex items-center gap-3 text-slate-400">
              <Activity class="w-5 h-5 animate-pulse" aria-hidden="true" />
              <span class="text-sm">Đang tải...</span>
            </div>
          </div>
        </div>

        <div class="card p-5 lg:p-6 stagger-item" style="animation-delay: 280ms">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-sm font-semibold text-surface-foreground tracking-tight">{{ t('dashboard.topBuyers') }}</h2>
            <Star class="w-3.5 h-3.5 text-accent-400" aria-hidden="true" />
          </div>
          <template v-if="loading">
            <div v-for="i in 3" :key="i" class="flex items-center gap-3 p-2">
              <AppSkeleton height="h-8" width="w-8" class="rounded-full" />
              <div class="flex-1">
                <AppSkeleton height="h-3.5" class="mb-1" />
                <AppSkeleton height="h-3" width="w-1/2" />
              </div>
            </div>
          </template>
          <template v-else>
            <div
              v-for="(buyer, i) in topBuyers"
              :key="buyer.user_id"
              class="flex items-center gap-2.5 p-2 rounded-lg hover:bg-surface-hover/60 transition-colors duration-150"
            >
              <div class="relative">
                <AppAvatar :name="buyer.full_name" :src="buyer.avatar_url" size="sm" />
                <span :class="[
                  'absolute -bottom-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center ring-2 ring-surface',
                  i === 0 ? 'bg-accent-400 text-white' : i === 1 ? 'bg-slate-300 dark:bg-zinc-600 text-white' : 'bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300',
                ]">{{ i + 1 }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-surface-foreground truncate">{{ buyer.full_name }}</p>
                <p class="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">{{ formatVND(buyer.total) }}</p>
              </div>
            </div>
            <AppEmptyState v-if="topBuyers.length === 0" :description="t('common.noData')" />
          </template>
        </div>
      </div>

      <!-- Recent Orders -->
      <div class="card p-5 lg:p-6 stagger-item" style="animation-delay: 320ms">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-sm font-semibold text-surface-foreground tracking-tight">{{ t('dashboard.recentOrders') }}</h2>
          <NuxtLink to="/admin/orders" class="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium flex items-center gap-0.5">
            {{ t('common.viewAll') }} <ArrowUpRight class="w-3 h-3" aria-hidden="true" />
          </NuxtLink>
        </div>
        <template v-if="loading">
          <div v-for="i in 5" :key="i" class="flex items-center gap-3 py-2.5 border-b border-surface-border last:border-0">
            <AppSkeleton height="h-8" width="w-8" class="rounded-lg" />
            <div class="flex-1">
              <AppSkeleton height="h-3.5" class="mb-1" />
              <AppSkeleton height="h-3" width="w-1/3" />
            </div>
            <AppSkeleton height="h-3.5" width="w-16" />
          </div>
        </template>
        <template v-else>
          <NuxtLink
            v-for="order in displayRecentOrders"
            :key="order.id as string"
            :to="`/admin/orders/${order.id}`"
            class="flex items-center gap-3 py-2.5 border-b border-surface-border last:border-0 hover:bg-surface-hover/60 -mx-2 px-2 rounded-lg transition-colors duration-150 group"
          >
            <div :class="[
              'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
              ORDER_STATUS_COLORS[order.status as OrderStatus] === 'success' ? 'bg-success-50 dark:bg-success-900/20' :
              ORDER_STATUS_COLORS[order.status as OrderStatus] === 'warning' ? 'bg-warning-50 dark:bg-warning-900/20' :
              ORDER_STATUS_COLORS[order.status as OrderStatus] === 'danger' ? 'bg-danger-50 dark:bg-danger-900/20' :
              ORDER_STATUS_COLORS[order.status as OrderStatus] === 'accent' ? 'bg-accent-50 dark:bg-accent-900/20' :
              'bg-secondary-50 dark:bg-secondary-900/20',
            ]">
              <component :is="statusIcons[order.status as string] || AlertCircle" :class="[
                'w-3.5 h-3.5',
                ORDER_STATUS_COLORS[order.status as OrderStatus] === 'success' ? 'text-success-600 dark:text-success-400' :
                ORDER_STATUS_COLORS[order.status as OrderStatus] === 'warning' ? 'text-warning-600 dark:text-warning-400' :
                ORDER_STATUS_COLORS[order.status as OrderStatus] === 'danger' ? 'text-danger-600 dark:text-danger-400' :
                ORDER_STATUS_COLORS[order.status as OrderStatus] === 'accent' ? 'text-accent-600 dark:text-accent-400' :
                'text-secondary-600 dark:text-secondary-400',
              ]" aria-hidden="true" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-surface-foreground truncate">{{ (order.user as Record<string, unknown>)?.full_name || (order.guest_info as Record<string, unknown>)?.name || t('customer.guestCustomer') }}</p>
              <p class="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                <Clock class="w-3 h-3" aria-hidden="true" /> {{ formatDate(order.created_at as string) }}
              </p>
            </div>
            <AppBadge :color="ORDER_STATUS_COLORS[order.status as OrderStatus]">{{ t(`orderStatus.${order.status}`) }}</AppBadge>
            <span class="text-sm font-semibold text-surface-foreground tabular-nums hidden sm:inline">{{ formatVND(Number(order.total)) }}</span>
          </NuxtLink>
          <AppEmptyState v-if="displayRecentOrders.length === 0" :description="t('common.noData')" />
        </template>
      </div>
    </template>
  </div>
</template>
