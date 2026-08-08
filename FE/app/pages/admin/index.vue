<script setup lang="ts">
import { OrderStatus } from '~/utils/enums'
import { mockOrders, mockTopBuyers, mockProducts, mockDashboardKPI, mockRevenueData } from '~/utils/mockData'
import { ORDER_STATUS_COLORS, ORDER_STATUS_ICONS, ORDER_STATUS_LABELS } from '~/utils/orderStatus'

const { formatVND, formatDate } = useFormat()
useSeoMeta({ title: 'Dashboard - BunTech Admin' })
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



const kpiStats = computed(() => [
  { title: 'Doanh thu hôm nay', value: formatVND(kpi.revenueToday), icon: 'i-lucide-wallet', color: 'primary' as const, trend: { value: 12, isPositive: true } },
  { title: 'Đơn hàng hôm nay', value: kpi.ordersToday, icon: 'i-lucide-shopping-cart', color: 'info' as const, trend: { value: 8, isPositive: true } },
  { title: 'Tổng khách hàng', value: kpi.customersTotal, icon: 'i-lucide-users', color: 'success' as const, trend: { value: 5, isPositive: true } },
  { title: 'Tổng sản phẩm', value: kpi.productsTotal, icon: 'i-lucide-package', color: 'warning' as const, trend: { value: 2, isPositive: true } },
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
    await new Promise(resolve => setTimeout(resolve, 400))
    kpi.revenueToday = mockDashboardKPI.revenueToday
    kpi.ordersToday = mockDashboardKPI.ordersToday
    kpi.customersTotal = mockDashboardKPI.newCustomers
    kpi.productsTotal = mockProducts.length

    revenueData.value = mockRevenueData.map((r, i) => ({
      day: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][new Date(r.date).getDay()],
      revenue: r.revenue,
    }))
    recentOrders.value = mockOrders.slice(0, 6)

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

    const statusCounts: Record<string, number> = {}
    for (const order of mockOrders) {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1
    }
    orderStatusData.value = Object.entries(statusCounts).map(([status, count]) => ({
      name: ORDER_STATUS_LABELS[status as OrderStatus] || status,
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
    <BasePageHeader title="Tổng quan" description="Hoạt động kinh doanh hôm nay" />

    <template v-if="error">
      <BaseEmptyState title="Lỗi tải dữ liệu" description="Đã có lỗi xảy ra, vui lòng thử lại." />
    </template>

    <template v-else>
      <!-- KPI Cards -->
      <div class="mb-6">
        <BaseStatsGrid :stats="kpiStats" :loading="loading" />
      </div>

      <!-- Revenue Area Chart + Order Status Pie -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <UCard class="lg:col-span-2 animate-fade-in-up" style="animation-delay: 160ms">
          <template #header>
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-sm font-semibold text-surface-foreground tracking-tight">Biểu đồ doanh thu</h2>
                <p class="text-xs text-slate-500 dark:text-zinc-400 mt-1">7 ngày gần nhất</p>
              </div>
              <div class="flex items-center gap-1.5 text-sm text-success-600 dark:text-success-400 font-medium px-2.5 py-1 rounded-md bg-success-50 dark:bg-success-900/20 tabular-nums">
                <UIcon name="i-lucide-trending-up" class="w-3.5 h-3.5" />
                <span>{{ formatVND(kpi.revenueToday) }}</span>
              </div>
            </div>
          </template>
          <BaseDashboardChart v-if="!loading" type="area" :data="displayRevenue" x-field="day" y-field="revenue" height="260px" />
          <div v-else class="h-[260px] flex items-center justify-center">
            <div class="flex items-center gap-3 text-slate-400">
              <UIcon name="i-lucide-activity" class="w-5 h-5 animate-pulse" />
              <span class="text-sm">Đang tải dữ liệu...</span>
            </div>
          </div>
        </UCard>

        <UCard class="animate-fade-in-up" style="animation-delay: 200ms">
          <template #header>
            <h2 class="text-sm font-semibold text-surface-foreground tracking-tight">Phân bố trạng thái đơn</h2>
          </template>
          <BaseDashboardChart v-if="!loading" type="pie" :data="displayStatusData" name-field="name" value-field="value" height="260px" :colors="['#f59e0b', '#3b82f6', '#ed7628', '#10b981', '#ef4444']" />
          <div v-else class="h-[260px] flex items-center justify-center">
            <div class="flex items-center gap-3 text-slate-400">
              <UIcon name="i-lucide-activity" class="w-5 h-5 animate-pulse" />
              <span class="text-sm">Đang tải...</span>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Top Products Bar Chart + Top Buyers -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <UCard class="lg:col-span-2 animate-fade-in-up" style="animation-delay: 240ms">
          <template #header>
            <h2 class="text-sm font-semibold text-surface-foreground tracking-tight">Sản phẩm bán chạy nhất</h2>
          </template>
          <BaseDashboardChart v-if="!loading" type="bar" :data="displayTopProducts" x-field="name" y-field="value" height="240px" :colors="['#ed7628', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899']" />
          <div v-else class="h-[240px] flex items-center justify-center">
            <div class="flex items-center gap-3 text-slate-400">
              <UIcon name="i-lucide-activity" class="w-5 h-5 animate-pulse" />
              <span class="text-sm">Đang tải...</span>
            </div>
          </div>
        </UCard>

        <UCard class="animate-fade-in-up" style="animation-delay: 280ms">
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-semibold text-surface-foreground tracking-tight">Khách hàng hàng đầu</h2>
              <UIcon name="i-lucide-star" class="w-3.5 h-3.5 text-warning-400" />
            </div>
          </template>
          <template v-if="loading">
            <div v-for="i in 3" :key="i" class="flex items-center gap-3 py-2">
              <USkeleton class="h-8 w-8 rounded-full" />
              <div class="flex-1">
                <USkeleton class="h-3.5 mb-1" />
                <USkeleton class="h-3 w-1/2" />
              </div>
            </div>
          </template>
          <template v-else>
            <div class="divide-y divide-surface-border -my-2">
              <div
                v-for="(buyer, i) in topBuyers"
                :key="buyer.user_id"
                class="flex items-center gap-2.5 py-3 hover:bg-surface-hover/60 transition-colors duration-150"
              >
                <div class="relative">
                  <UAvatar :alt="buyer.full_name" :src="buyer.avatar_url" size="sm" />
                  <span :class="[
                    'absolute -bottom-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center ring-2 ring-surface',
                    i === 0 ? 'bg-warning-400 text-white' : i === 1 ? 'bg-slate-300 dark:bg-zinc-600 text-white' : 'bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300',
                  ]">{{ i + 1 }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-surface-foreground truncate">{{ buyer.full_name }}</p>
                  <p class="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">{{ formatVND(buyer.total) }}</p>
                </div>
              </div>
            </div>
            <BaseEmptyState v-if="topBuyers.length === 0" description="Chưa có dữ liệu" />
          </template>
        </UCard>
      </div>

      <!-- Recent Orders -->
      <UCard class="animate-fade-in-up" style="animation-delay: 320ms">
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-semibold text-surface-foreground tracking-tight">Đơn hàng gần đây</h2>
            <NuxtLink to="/admin/orders" class="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium flex items-center gap-0.5">
              Xem tất cả <UIcon name="i-lucide-arrow-up-right" class="w-3 h-3" />
            </NuxtLink>
          </div>
        </template>
        <template v-if="loading">
          <div v-for="i in 5" :key="i" class="flex items-center gap-3 py-2.5 border-b border-surface-border last:border-0">
            <USkeleton class="h-8 w-8 rounded-lg" />
            <div class="flex-1">
              <USkeleton class="h-3.5 mb-1" />
              <USkeleton class="h-3 w-1/3" />
            </div>
            <USkeleton class="h-3.5 w-16" />
          </div>
        </template>
        <template v-else>
          <div class="divide-y divide-surface-border -my-2">
            <NuxtLink
              v-for="order in displayRecentOrders"
              :key="order.id"
              :to="`/admin/orders/${order.id}`"
              class="flex items-center gap-3 py-3 hover:bg-surface-hover/60 transition-colors duration-150 group"
            >
              <div :class="[
                'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                ORDER_STATUS_COLORS[order.status] === 'success' ? 'bg-success-50 dark:bg-success-900/20' :
                ORDER_STATUS_COLORS[order.status] === 'warning' ? 'bg-warning-50 dark:bg-warning-900/20' :
                ORDER_STATUS_COLORS[order.status] === 'danger' ? 'bg-danger-50 dark:bg-danger-900/20' :
                ORDER_STATUS_COLORS[order.status] === 'accent' ? 'bg-accent-50 dark:bg-accent-900/20' :
                ORDER_STATUS_COLORS[order.status] === 'info' ? 'bg-info-50 dark:bg-info-900/20' :
                'bg-slate-50 dark:bg-slate-900/20',
              ]">
                <UIcon :name="ORDER_STATUS_ICONS[order.status] || 'i-lucide-alert-circle'" class="w-3.5 h-3.5 text-current" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-surface-foreground truncate">{{ order.user?.full_name || order.guest_info?.name || 'Khách vãng lai' }}</p>
                <p class="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                  <UIcon name="i-lucide-clock" class="w-3 h-3" /> {{ formatDate(order.created_at) }}
                </p>
              </div>
              <UBadge :color="ORDER_STATUS_COLORS[order.status]" variant="subtle">{{ ORDER_STATUS_LABELS[order.status] }}</UBadge>
              <span class="text-sm font-semibold text-surface-foreground tabular-nums hidden sm:inline ml-2 text-right min-w-[80px]">{{ formatVND(Number(order.total)) }}</span>
            </NuxtLink>
          </div>
          <BaseEmptyState v-if="displayRecentOrders.length === 0" description="Chưa có dữ liệu" />
        </template>
      </UCard>
    </template>
  </div>
</template>
