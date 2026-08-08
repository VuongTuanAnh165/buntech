<script setup lang="ts">
import { OrderStatus, Role, UserStatus } from '~/utils/enums'
import { mockOrders, mockProfiles } from '~/utils/mockData'

definePageMeta({ layout: 'driver' })
useSeoMeta({ title: 'Lịch sử giao hàng - BunTech Driver' })

const router = useRouter()
const toast = useToast()
const { formatVND, formatDateTime, formatTimeAgo } = useFormat()

type DateRange = 'today' | '7days' | '30days'
type StatusFilter = 'all' | 'delivered' | 'cancelled'

const loading = ref(true)
const refreshing = ref(false)
const dateRange = ref<DateRange>('7days')
const statusFilter = ref<StatusFilter>('all')
const visibleCount = ref(8)

const currentDriver = computed(() =>
  mockProfiles.find(p => p.role === Role.DRIVER && p.status === UserStatus.ACTIVE) || mockProfiles[2]
)

const dateRangeDays = computed(() => {
  if (dateRange.value === 'today') return 1
  if (dateRange.value === '7days') return 7
  return 30
})

const allHistory = computed(() => {
  const driverId = currentDriver.value?.id
  if (!driverId) return []
  const cutoff = Date.now() - dateRangeDays.value * 86400000
  return mockOrders
    .filter(o => o.driver_id === driverId)
    .filter(o => o.status === OrderStatus.DELIVERED || o.status === OrderStatus.CANCELLED)
    .filter(o => new Date(o.created_at).getTime() >= cutoff)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})

const filteredHistory = computed(() => {
  if (statusFilter.value === 'all') return allHistory.value
  if (statusFilter.value === 'delivered') return allHistory.value.filter(o => o.status === OrderStatus.DELIVERED)
  return allHistory.value.filter(o => o.status === OrderStatus.CANCELLED)
})

const stats = computed(() => {
  const list = allHistory.value
  const delivered = list.filter(o => o.status === OrderStatus.DELIVERED)
  const cancelled = list.filter(o => o.status === OrderStatus.CANCELLED)
  const totalCollected = delivered.reduce((sum, o) => sum + (o.amount_collected || 0), 0)
  const successRate = list.length ? Math.round((delivered.length / list.length) * 100) : 0
  const totalDistance = delivered.reduce((sum, o) => {
    const seed = o.id.charCodeAt(o.id.length - 1) || 1
    return sum + (6 + (seed % 18))
  }, 0)
  return { total: list.length, delivered: delivered.length, cancelled: cancelled.length, totalCollected, successRate, totalDistance }
})

const visibleHistory = computed(() => filteredHistory.value.slice(0, visibleCount.value))
const hasMore = computed(() => visibleCount.value < filteredHistory.value.length)

function loadMore() { visibleCount.value += 8 }
function setRange(range: DateRange) { dateRange.value = range; visibleCount.value = 8 }
function setStatusFilter(filter: StatusFilter) { statusFilter.value = filter; visibleCount.value = 8 }

function distanceFor(orderId: string): string {
  const seed = orderId.charCodeAt(orderId.length - 1) || 1
  const km = 6 + (seed % 18) + (seed % 7) / 10
  return `${km.toFixed(1)} km`
}

function refresh() {
  refreshing.value = true
  setTimeout(() => { refreshing.value = false; toast.add({ title: 'Đã làm mới lịch sử', color: 'success' }) }, 700)
}

onMounted(() => { setTimeout(() => { loading.value = false }, 500) })
</script>

<template>
  <div class="p-4">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <h1 class="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">Lịch sử giao hàng</h1>
        <p class="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">Xem lại các chuyến giao đã hoàn thành</p>
      </div>
      <UButton variant="ghost" color="neutral"
        class="p-2.5 text-slate-500 dark:text-zinc-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-neutral-100 dark:hover:bg-zinc-800 rounded-xl transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
        :disabled="refreshing"
        @click="refresh"
      >
        <UIcon name="i-lucide-refresh-cw" :class="['w-5 h-5', refreshing ? 'animate-spin' : '']" />
      </UButton>
    </div>

    <!-- Date range filter -->
    <div class="flex items-center gap-2 mb-4">
      <UIcon name="i-lucide-calendar" class="w-4 h-4 text-slate-400 dark:text-zinc-500 flex-shrink-0" />
      <div class="flex-1 flex items-center gap-2 p-1 bg-white dark:bg-zinc-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-x-auto">
        <UButton variant="ghost" color="neutral"
          v-for="opt in [
            { accessorKey: 'today', header: 'Hôm nay' },
            { accessorKey: '7days', header: '7 ngày' },
            { accessorKey: '30days', header: '30 ngày' },
          ]"
          :key="opt.key"
          :class="[
            'flex-1 min-w-fit px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
            dateRange === opt.key
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-slate-500 dark:text-zinc-400 hover:bg-neutral-100 dark:hover:bg-zinc-800',
          ]"
          @click="setRange(opt.key as DateRange)"
        >{{ opt.label }}</UButton>
      </div>
    </div>

    <!-- Stats cards -->
    <div class="grid grid-cols-2 gap-3 mb-4">
      <div class="card p-4 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-20 h-20 rounded-full bg-primary-500/5 blur-xl" />
        <div class="relative">
          <div class="flex items-center gap-1.5 mb-1">
            <UIcon name="i-lucide-package" class="w-3.5 h-3.5 text-primary-500" />
            <span class="text-xs text-slate-500 dark:text-zinc-400">Tổng chuyến</span>
          </div>
          <p class="text-2xl font-bold text-neutral-900 dark:text-white tabular-nums">{{ stats.total }}</p>
        </div>
      </div>
      <div class="card p-4 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-20 h-20 rounded-full bg-success-500/5 blur-xl" />
        <div class="relative">
          <div class="flex items-center gap-1.5 mb-1">
            <UIcon name="i-lucide-trending-up" class="w-3.5 h-3.5 text-success-500" />
            <span class="text-xs text-slate-500 dark:text-zinc-400">Tỷ lệ thành công</span>
          </div>
          <p class="text-2xl font-bold text-success-600 dark:text-success-400 tabular-nums">{{ stats.successRate }}%</p>
        </div>
      </div>
      <div class="card p-4 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-20 h-20 rounded-full bg-warning-500/5 blur-xl" />
        <div class="relative">
          <div class="flex items-center gap-1.5 mb-1">
            <UIcon name="i-lucide-wallet" class="w-3.5 h-3.5 text-warning-500" />
            <span class="text-xs text-slate-500 dark:text-zinc-400">Đã thu</span>
          </div>
          <p class="text-lg font-bold text-neutral-900 dark:text-white tabular-nums truncate">{{ formatVND(stats.totalCollected) }}</p>
        </div>
      </div>
      <div class="card p-4 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-20 h-20 rounded-full bg-info-500/5 blur-xl" />
        <div class="relative">
          <div class="flex items-center gap-1.5 mb-1">
            <UIcon name="i-lucide-route" class="w-3.5 h-3.5 text-info-500" />
            <span class="text-xs text-slate-500 dark:text-zinc-400">Tổng quãng đường</span>
          </div>
          <p class="text-2xl font-bold text-neutral-900 dark:text-white tabular-nums">{{ stats.totalDistance }} <span class="text-sm font-medium text-slate-400">km</span></p>
        </div>
      </div>
    </div>

    <!-- Status filter tabs -->
    <div class="flex items-center gap-2 mb-4 overflow-x-auto">
      <UIcon name="i-lucide-filter" class="w-4 h-4 text-slate-400 dark:text-zinc-500 flex-shrink-0" />
      <div class="flex items-center gap-2 p-1 bg-white dark:bg-zinc-900 rounded-xl border border-neutral-200 dark:border-neutral-800 flex-1">
        <UButton variant="ghost" color="neutral"
          v-for="tab in [
            { accessorKey: 'all', header: 'Tất cả', count: stats.total },
            { accessorKey: 'delivered', header: 'Đã giao', count: stats.delivered },
            { accessorKey: 'cancelled', header: 'Đã hủy', count: stats.cancelled },
          ]"
          :key="tab.key"
          :class="[
            'flex-1 min-w-fit px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap',
            statusFilter === tab.key
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-500 dark:text-zinc-400 hover:bg-neutral-100 dark:hover:bg-zinc-800',
          ]"
          @click="setStatusFilter(tab.key as StatusFilter)"
        >{{ tab.label }} <span class="opacity-60">({{ tab.count }})</span></UButton>
      </div>
    </div>

    <!-- Loading -->
    <template v-if="loading">
      <div v-for="i in 4" :key="i" class="card p-4 mb-3">
        <div class="flex items-center gap-3 mb-3">
          <div class="skeleton h-10 w-10 rounded-xl" />
          <div class="flex-1"><div class="skeleton h-4 mb-1" /><div class="skeleton h-3 w-1/3" /></div>
        </div>
        <div class="skeleton h-3 mb-2" />
        <div class="skeleton h-3 w-2/3" />
      </div>
    </template>

    <!-- History list -->
    <template v-else-if="visibleHistory.length">
      <div
        v-for="(order, i) in visibleHistory"
        :key="order.id"
        class="card card-hover p-4 mb-3 cursor-pointer animate-fade-in-up relative overflow-hidden"
        :style="{ animationDelay: `${i * 50}ms` }"
        role="button"
        tabindex="0"
        @click="navigateTo(`/driver/delivery/${order.id}`)"
      >
        <div
          :class="['absolute left-0 top-0 bottom-0 w-1', order.status === OrderStatus.DELIVERED ? 'bg-success-500' : 'bg-error-500']"
        />
        <div class="flex items-start justify-between mb-3 pl-1">
          <div class="flex items-center gap-3">
            <div :class="[
              'w-10 h-10 rounded-xl flex items-center justify-center',
              order.status === OrderStatus.DELIVERED ? 'bg-success-50 dark:bg-success-900/20' : 'bg-error-50 dark:bg-error-900/20',
            ]">
              <UIcon
                :name="order.status === OrderStatus.DELIVERED ? 'i-lucide-check-circle-2' : 'i-lucide-x-circle'"
                :class="order.status === OrderStatus.DELIVERED ? 'w-5 h-5 text-success-600 dark:text-success-400' : 'w-5 h-5 text-error-600 dark:text-error-400'"
              />
            </div>
            <div>
              <p class="font-mono text-xs text-slate-400 dark:text-zinc-500">#{{ order.id }}</p>
              <p class="font-semibold text-neutral-900 dark:text-white">{{ order.customer_name || 'Khách vãng lai' }}</p>
            </div>
          </div>
          <UBadge
            :color="order.status === OrderStatus.DELIVERED ? 'success' : 'error'"
            variant="subtle" size="xs"
          >{{ order.status === OrderStatus.DELIVERED ? 'Đã giao' : 'Đã hủy' }}</UBadge>
        </div>
        <div class="space-y-2 text-sm pl-1">
          <div class="flex items-center gap-2 text-slate-600 dark:text-zinc-300">
            <UIcon name="i-lucide-map-pin" class="w-4 h-4 text-slate-400 dark:text-zinc-500 flex-shrink-0" />
            <span class="line-clamp-1">{{ order.shipping_address }}</span>
          </div>
          <div class="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-1.5">
                <UIcon name="i-lucide-wallet" class="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                <span class="font-semibold text-neutral-900 dark:text-white tabular-nums">{{ formatVND(order.amount_collected || 0) }}</span>
              </div>
              <span class="text-slate-300 dark:text-zinc-600">·</span>
              <div class="flex items-center gap-1 text-xs text-slate-500 dark:text-zinc-400">
                <UIcon name="i-lucide-route" class="w-3.5 h-3.5" />
                <span class="tabular-nums">{{ distanceFor(order.id) }}</span>
              </div>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-xs text-slate-400 dark:text-zinc-500">{{ formatTimeAgo(order.created_at) }}</span>
              <UIcon name="i-lucide-chevron-right" class="w-4 h-4 text-slate-300 dark:text-zinc-600" />
            </div>
          </div>
        </div>
      </div>

      <!-- Load more -->
      <div v-if="hasMore" class="flex justify-center pt-2 pb-4">
        <UButton variant="outline" @click="loadMore">
          Xem thêm {{ filteredHistory.length - visibleCount }} chuyến
        </UButton>
      </div>
      <p v-else class="text-center text-xs text-slate-400 dark:text-zinc-500 py-4">
        Đã hiển thị tất cả {{ filteredHistory.length }} chuyến
      </p>
    </template>

    <!-- Empty -->
    <BaseEmptyState
      v-else
      title="Chưa có lịch sử giao hàng"
      :description="statusFilter === 'all' ? 'Chưa có chuyến giao nào trong khoảng thời gian này.' : 'Không có chuyến nào phù hợp với bộ lọc đã chọn.'"
    />
  </div>
</template>
