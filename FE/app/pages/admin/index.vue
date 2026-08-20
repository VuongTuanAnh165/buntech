<script setup lang="ts">
import { dashboardService } from '~/services/dashboardService'
import { adminOrderService } from '~/services/adminOrderService'
import { getOrderStatusColor, getOrderStatusIcon, getOrderStatusLabel } from '~/utils/orderStatus'
import dayjs from 'dayjs'
import { t } from '~/utils/i18n'

useSeoMeta({ title: t('admin_dashboard_seo_title') })
definePageMeta({ layout: 'admin' })

const { constants } = useMasterData()

const endDate = ref(dayjs().endOf('day').format('YYYY-MM-DD'))
const startDate = ref(dayjs().subtract(6, 'day').startOf('day').format('YYYY-MM-DD'))

const { data, status, error } = useAsyncData(
  'dashboard-data',
  async () => {
    const [overviewRes, recentOrdersRes] = await Promise.all([
      dashboardService.getOverview({ startDate: startDate.value, endDate: endDate.value }),
      adminOrderService.fetchOrders({ page: 1, limit: 6 })
    ])

    return {
      overview: overviewRes.data,
      recentOrders: recentOrdersRes.data?.data || []
    }
  },
  { watch: [startDate, endDate] }
)

const loading = computed(() => status.value === 'pending')

const kpiStats = computed(() => [
  {
    title: t('admin_dashboard_kpi_revenue'),
    value: formatVND(data.value?.overview?.revenueToday || 0),
    icon: 'i-lucide-wallet',
    color: 'primary' as const,
    trend: { value: 0, isPositive: true }
  },
  {
    title: t('admin_dashboard_kpi_orders'),
    value: data.value?.overview?.ordersToday || 0,
    icon: 'i-lucide-shopping-cart',
    color: 'info' as const,
    trend: { value: 0, isPositive: true }
  },
  {
    title: t('admin_dashboard_kpi_customers'),
    value: data.value?.overview?.totalCustomers || 0,
    icon: 'i-lucide-users',
    color: 'success' as const,
    trend: { value: 0, isPositive: true }
  },
  {
    title: t('admin_prod_kpi_total'),
    value: data.value?.overview?.totalProducts || 0,
    icon: 'i-lucide-package',
    color: 'warning' as const,
    trend: { value: 0, isPositive: true }
  }
])

const displayRevenue = computed(() => {
  if (!data.value?.overview?.revenueChart) return []
  return data.value.overview.revenueChart.map((r) => ({
    day:
      [
        t('admin_debt_chart_day_sun'),
        t('admin_debt_chart_day_mon'),
        t('admin_debt_chart_day_tue'),
        t('admin_debt_chart_day_wed'),
        t('admin_debt_chart_day_thu'),
        t('admin_debt_chart_day_fri'),
        t('admin_debt_chart_day_sat')
      ][new Date(r.date).getDay()] || '',
    revenue: r.value
  }))
})

const displayStatusData = computed(() => {
  if (!data.value?.overview?.orderStatuses) return []
  return data.value.overview.orderStatuses.map((os) => ({
    name: getOrderStatusLabel(constants)[os.status] || os.status,
    value: os.count
  }))
})

const displayTopProducts = computed(() => {
  return data.value?.overview?.topProducts || []
})

const displayRecentOrders = computed(() => data.value?.recentOrders || [])
</script>
<template>
  <div>
    <BasePageHeader :title="$t('nav_overview')" :description="$t('admin_dashboard_desc')" />
    <template v-if="error">
      <BaseEmptyState
        :title="$t('admin_customers_err_title')"
        :description="$t('admin_dashboard_err_desc')"
      />
    </template>
    <template v-else>
      <!-- KPI Cards -->
      <div class="mb-6">
        <BaseStatsGrid :stats="kpiStats" :loading="loading" />
      </div>
      <!-- Revenue Area Chart + Order Status Pie -->
      <div class="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <UCard class="animate-fade-in-up lg:col-span-2" style="animation-delay: 160ms">
          <template #header>
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-surface-foreground text-sm font-semibold tracking-tight">
                  {{ $t('admin_dashboard_revenue_title') }}
                </h2>
                <p class="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                  {{ $t('admin_dashboard_revenue_desc') }}
                </p>
              </div>
              <div
                class="text-success-600 dark:text-success-400 bg-success-50 dark:bg-success-900/20 flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium tabular-nums"
              >
                <UIcon name="i-lucide-trending-up" class="h-3.5 w-3.5" />
                <span>{{ formatVND(data?.overview?.revenueToday || 0) }}</span>
              </div>
            </div>
          </template>
          <BaseDashboardChart
            v-if="!loading"
            type="area"
            :data="displayRevenue"
            x-field="day"
            y-field="revenue"
            height="260px"
          />
          <div v-else class="flex h-[260px] items-center justify-center">
            <div class="flex items-center gap-3 text-slate-400">
              <UIcon name="i-lucide-activity" class="h-5 w-5 animate-pulse" />
              <span class="text-sm">{{ $t('admin_dashboard_loading') }}</span>
            </div>
          </div>
        </UCard>
        <UCard class="animate-fade-in-up" style="animation-delay: 200ms">
          <template #header>
            <h2 class="text-surface-foreground text-sm font-semibold tracking-tight">
              {{ $t('admin_dashboard_status_title') }}
            </h2>
          </template>
          <BaseDashboardChart
            v-if="!loading"
            type="pie"
            :data="displayStatusData"
            name-field="name"
            value-field="value"
            height="260px"
            :colors="['#f59e0b', '#3b82f6', '#ed7628', '#10b981', '#ef4444']"
          />
          <div v-else class="flex h-[260px] items-center justify-center">
            <div class="flex items-center gap-3 text-slate-400">
              <UIcon name="i-lucide-activity" class="h-5 w-5 animate-pulse" />
              <span class="text-sm">{{ $t('public_products_loading') }}</span>
            </div>
          </div>
        </UCard>
      </div>
      <!-- Top Products Bar Chart + Top Buyers -->
      <div class="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <UCard class="animate-fade-in-up lg:col-span-2" style="animation-delay: 240ms">
          <template #header>
            <h2 class="text-surface-foreground text-sm font-semibold tracking-tight">
              {{ $t('admin_dashboard_top_products_title') }}
            </h2>
          </template>
          <BaseDashboardChart
            v-if="!loading"
            type="bar"
            :data="displayTopProducts"
            x-field="name"
            y-field="value"
            height="240px"
            :colors="['#ed7628', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899']"
          />
          <div v-else class="flex h-[240px] items-center justify-center">
            <div class="flex items-center gap-3 text-slate-400">
              <UIcon name="i-lucide-activity" class="h-5 w-5 animate-pulse" />
              <span class="text-sm">{{ $t('public_products_loading') }}</span>
            </div>
          </div>
        </UCard>
        <FeaturesAdminDashboardTopBuyersCard :start-date="startDate" :end-date="endDate" />
      </div>
      <!-- Recent Orders -->
      <UCard class="animate-fade-in-up" style="animation-delay: 320ms">
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-surface-foreground text-sm font-semibold tracking-tight">
              {{ $t('wholesale_recent_orders') }}
            </h2>
            <NuxtLink
              to="/admin/orders"
              class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-0.5 text-xs font-medium"
            >
              {{ $t('wholesale_view_all') }}
              <UIcon name="i-lucide-arrow-up-right" class="h-3 w-3" />
            </NuxtLink>
          </div>
        </template>
        <template v-if="loading">
          <div
            v-for="i in 5"
            :key="i"
            class="border-surface-border flex items-center gap-3 border-b py-2.5 last:border-0"
          >
            <USkeleton class="h-8 w-8 rounded-lg" />
            <div class="flex-1">
              <USkeleton class="mb-1 h-3.5" />
              <USkeleton class="h-3 w-1/3" />
            </div>
            <USkeleton class="h-3.5 w-16" />
          </div>
        </template>
        <template v-else>
          <div class="divide-surface-border -my-2 divide-y">
            <NuxtLink
              v-for="order in displayRecentOrders"
              :key="order.id"
              :to="`/admin/orders/${order.id}`"
              class="hover:bg-surface-hover/60 group flex items-center gap-3 py-3 transition-colors duration-150"
            >
              <div
                :class="[
                  'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg',
                  getOrderStatusColor(constants)[order.status] === 'success'
                    ? 'bg-success-50 dark:bg-success-900/20'
                    : getOrderStatusColor(constants)[order.status] === 'warning'
                      ? 'bg-warning-50 dark:bg-warning-900/20'
                      : getOrderStatusColor(constants)[order.status] === 'danger'
                        ? 'bg-error-50 dark:bg-error-900/20'
                        : getOrderStatusColor(constants)[order.status] === 'accent'
                          ? 'bg-primary-50 dark:bg-primary-900/20'
                          : getOrderStatusColor(constants)[order.status] === 'info'
                            ? 'bg-info-50 dark:bg-info-900/20'
                            : 'bg-slate-50 dark:bg-slate-900/20'
                ]"
              >
                <UIcon
                  :name="getOrderStatusIcon(constants)[order.status] || 'i-lucide-alert-circle'"
                  class="h-3.5 w-3.5 text-current"
                />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-surface-foreground truncate text-sm font-medium">
                  {{ order.user?.fullName || $t('driver_history_guest') }}
                </p>
                <p class="mt-0.5 flex items-center gap-1 text-xs text-slate-500 dark:text-zinc-400">
                  <UIcon name="i-lucide-clock" class="h-3 w-3" /> {{ formatDate(order.createdAt) }}
                </p>
              </div>
              <UBadge
                :color="getOrderStatusColor(constants)[order.status] as any"
                variant="subtle"
                >{{ getOrderStatusLabel(constants)[order.status] }}</UBadge
              >
              <span
                class="text-surface-foreground ml-2 hidden min-w-[80px] text-right text-sm font-semibold tabular-nums sm:inline"
                >{{ formatVND(Number(order.totalAmount)) }}</span
              >
            </NuxtLink>
          </div>
          <BaseEmptyState
            v-if="displayRecentOrders.length === 0"
            :title="$t('common_empty_title')"
            :description="$t('common_empty_desc')"
          />
        </template>
      </UCard>
    </template>
  </div>
</template>
