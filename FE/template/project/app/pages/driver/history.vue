<script setup lang="ts">
import {
  History, Package, MapPin, Wallet, TrendingUp, Route as RouteIcon,
  CheckCircle2, XCircle, ChevronRight, Calendar, Filter, RefreshCw, Inbox,
} from 'lucide-vue-next'
import { OrderStatus, ORDER_STATUS_COLORS, Role, UserStatus } from '../../core/enums'
import { mockOrders, mockProfiles } from '../../core/mock/data'

const { t } = useI18n()
const { formatVND, formatDateTime } = useFormat()
const toast = useToast()
const router = useRouter()
const authStore = useAuthStore()

useHead({ title: 'Lịch sử giao hàng - BunTech Driver' })
definePageMeta({ layout: 'driver' })

type DateRange = 'today' | '7days' | '30days'
type StatusFilter = 'all' | 'delivered' | 'cancelled'

const loading = ref(true)
const refreshing = ref(false)
const dateRange = ref<DateRange>('7days')
const statusFilter = ref<StatusFilter>('all')
const visibleCount = ref(8)

// Current driver: pick first active driver from mock profiles, fallback to authStore user
const currentDriver = computed(() => {
  if (authStore.user?.id) {
    const found = mockProfiles.find(p => p.id === authStore.user!.id)
    if (found) return found
  }
  return mockProfiles.find(p => p.role === Role.DRIVER && p.status === UserStatus.ACTIVE) || mockProfiles[2]
})

const dateRangeDays = computed(() => {
  if (dateRange.value === 'today') return 1
  if (dateRange.value === '7days') return 7
  return 30
})

// All past deliveries assigned to this driver (DELIVERED or CANCELLED)
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
  const totalCollected = delivered.reduce((sum, o) => sum + Number(o.amount_collected), 0)
  const successRate = list.length ? Math.round((delivered.length / list.length) * 100) : 0
  // deterministic mock distance: ~6-24 km per delivered order, derived from id
  const totalDistance = delivered.reduce((sum, o) => {
    const seed = o.id.charCodeAt(o.id.length - 1) || 1
    return sum + (6 + (seed % 18))
  }, 0)
  return {
    total: list.length,
    delivered: delivered.length,
    cancelled: cancelled.length,
    totalCollected,
    successRate,
    totalDistance,
  }
})

const visibleHistory = computed(() => filteredHistory.value.slice(0, visibleCount.value))
const hasMore = computed(() => visibleCount.value < filteredHistory.value.length)

function loadMore() {
  visibleCount.value += 8
}

function setRange(range: DateRange) {
  dateRange.value = range
  visibleCount.value = 8
}

function setStatusFilter(filter: StatusFilter) {
  statusFilter.value = filter
  visibleCount.value = 8
}

function refresh() {
  refreshing.value = true
  setTimeout(() => {
    refreshing.value = false
    toast.success('Đã làm mới lịch sử')
  }, 700)
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor(diff / 3600000)
  const mins = Math.floor(diff / 60000)
  if (days > 0) return `${days} ngày trước`
  if (hours > 0) return `${hours} giờ trước`
  if (mins > 0) return `${mins} phút trước`
  return 'Vừa xong'
}

// mock distance per order (deterministic, derived from id)
function distanceFor(orderId: string): string {
  const seed = orderId.charCodeAt(orderId.length - 1) || 1
  const km = 6 + (seed % 18) + (seed % 7) / 10
  return `${km.toFixed(1)} km`
}

function load() {
  loading.value = true
  setTimeout(() => { loading.value = false }, 500)
}

onMounted(load)
</script>

<template>
  <div class="p-4">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <h1 class="text-xl font-bold text-surface-foreground tracking-tight">Lịch sử giao hàng</h1>
        <p class="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">Xem lại các chuyến giao đã hoàn thành</p>
      </div>
      <button
        class="p-2.5 text-slate-500 dark:text-zinc-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-surface-hover rounded-xl transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Làm mới"
        :disabled="refreshing"
        @click="refresh"
      >
        <RefreshCw :class="['w-5 h-5', refreshing ? 'animate-spin' : '']" aria-hidden="true" />
      </button>
    </div>

    <!-- Date range filter -->
    <div class="flex items-center gap-2 mb-4">
      <Calendar class="w-4 h-4 text-slate-400 dark:text-zinc-500 flex-shrink-0" aria-hidden="true" />
      <div class="flex-1 flex items-center gap-2 p-1 bg-surface rounded-xl border border-surface-border overflow-x-auto">
        <button
          v-for="opt in [
            { key: 'today', label: 'Hôm nay' },
            { key: '7days', label: '7 ngày' },
            { key: '30days', label: '30 ngày' },
          ]"
          :key="opt.key"
          :class="[
            'flex-1 min-w-fit px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
            dateRange === opt.key
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-slate-500 dark:text-zinc-400 hover:bg-surface-hover',
          ]"
          @click="setRange(opt.key as DateRange)"
        >{{ opt.label }}</button>
      </div>
    </div>

    <!-- Stats cards -->
    <div class="grid grid-cols-2 gap-3 mb-4">
      <div class="card p-4 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-20 h-20 rounded-full bg-primary-500/5 blur-xl" aria-hidden="true" />
        <div class="relative">
          <div class="flex items-center gap-1.5 mb-1">
            <Package class="w-3.5 h-3.5 text-primary-500" aria-hidden="true" />
            <span class="text-xs text-slate-500 dark:text-zinc-400">Tổng chuyến</span>
          </div>
          <p class="text-2xl font-bold text-surface-foreground tabular-nums">{{ stats.total }}</p>
        </div>
      </div>
      <div class="card p-4 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-20 h-20 rounded-full bg-success-500/5 blur-xl" aria-hidden="true" />
        <div class="relative">
          <div class="flex items-center gap-1.5 mb-1">
            <TrendingUp class="w-3.5 h-3.5 text-success-500" aria-hidden="true" />
            <span class="text-xs text-slate-500 dark:text-zinc-400">Tỷ lệ thành công</span>
          </div>
          <p class="text-2xl font-bold text-success-600 dark:text-success-400 tabular-nums">{{ stats.successRate }}%</p>
        </div>
      </div>
      <div class="card p-4 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-20 h-20 rounded-full bg-warning-500/5 blur-xl" aria-hidden="true" />
        <div class="relative">
          <div class="flex items-center gap-1.5 mb-1">
            <Wallet class="w-3.5 h-3.5 text-warning-500" aria-hidden="true" />
            <span class="text-xs text-slate-500 dark:text-zinc-400">Đã thu</span>
          </div>
          <p class="text-lg font-bold text-surface-foreground tabular-nums truncate">{{ formatVND(stats.totalCollected) }}</p>
        </div>
      </div>
      <div class="card p-4 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-20 h-20 rounded-full bg-info-500/5 blur-xl" aria-hidden="true" />
        <div class="relative">
          <div class="flex items-center gap-1.5 mb-1">
            <RouteIcon class="w-3.5 h-3.5 text-info-500" aria-hidden="true" />
            <span class="text-xs text-slate-500 dark:text-zinc-400">Tổng quãng đường</span>
          </div>
          <p class="text-2xl font-bold text-surface-foreground tabular-nums">{{ stats.totalDistance }} <span class="text-sm font-medium text-slate-400">km</span></p>
        </div>
      </div>
    </div>

    <!-- Status filter tabs -->
    <div class="flex items-center gap-2 mb-4 overflow-x-auto">
      <Filter class="w-4 h-4 text-slate-400 dark:text-zinc-500 flex-shrink-0" aria-hidden="true" />
      <div class="flex items-center gap-2 p-1 bg-surface rounded-xl border border-surface-border flex-1">
        <button
          v-for="tab in [
            { key: 'all', label: 'Tất cả', count: stats.total },
            { key: 'delivered', label: 'Đã giao', count: stats.delivered },
            { key: 'cancelled', label: 'Đã hủy', count: stats.cancelled },
          ]"
          :key="tab.key"
          :class="[
            'flex-1 min-w-fit px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap',
            statusFilter === tab.key
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-500 dark:text-zinc-400 hover:bg-surface-hover',
          ]"
          @click="setStatusFilter(tab.key as StatusFilter)"
        >
          {{ tab.label }} <span class="opacity-60">({{ tab.count }})</span>
        </button>
      </div>
    </div>

    <!-- Loading -->
    <template v-if="loading">
      <div v-for="i in 4" :key="i" class="card p-4 mb-3">
        <div class="flex items-center gap-3 mb-3">
          <AppSkeleton height="h-10" width="w-10" class="rounded-xl" />
          <div class="flex-1">
            <AppSkeleton height="h-4" class="mb-1" />
            <AppSkeleton height="h-3" width="w-1/3" />
          </div>
        </div>
        <AppSkeleton height="h-3" class="mb-2" />
        <AppSkeleton height="h-3" width="w-2/3" />
      </div>
    </template>

    <!-- History list -->
    <template v-else-if="visibleHistory.length">
      <TransitionGroup name="fade">
        <div
          v-for="(order, i) in visibleHistory"
          :key="order.id"
          class="card card-hover p-4 mb-3 cursor-pointer animate-fade-in-up relative overflow-hidden"
          :style="{ animationDelay: `${i * 50}ms` }"
          role="button"
          tabindex="0"
          @click="router.push(`/driver/${order.id}`)"
          @keydown.enter="router.push(`/driver/${order.id}`)"
        >
          <div
            :class="[
              'absolute left-0 top-0 bottom-0 w-1',
              order.status === OrderStatus.DELIVERED ? 'bg-success-500' : 'bg-danger-500',
            ]"
            aria-hidden="true"
          />
          <div class="flex items-start justify-between mb-3 pl-1">
            <div class="flex items-center gap-3">
              <div :class="[
                'w-10 h-10 rounded-xl flex items-center justify-center',
                order.status === OrderStatus.DELIVERED
                  ? 'bg-success-50 dark:bg-success-900/20'
                  : 'bg-danger-50 dark:bg-danger-900/20',
              ]">
                <CheckCircle2 v-if="order.status === OrderStatus.DELIVERED" class="w-5 h-5 text-success-600 dark:text-success-400" aria-hidden="true" />
                <XCircle v-else class="w-5 h-5 text-danger-600 dark:text-danger-400" aria-hidden="true" />
              </div>
              <div>
                <p class="font-mono text-xs text-slate-400 dark:text-zinc-500">#{{ order.id.slice(0, 10) }}</p>
                <p class="font-semibold text-surface-foreground">{{ order.user?.full_name || 'Khách vãng lai' }}</p>
              </div>
            </div>
            <AppBadge :color="ORDER_STATUS_COLORS[order.status]">{{ t(`orderStatus.${order.status}`) }}</AppBadge>
          </div>
          <div class="space-y-2 text-sm pl-1">
            <div class="flex items-center gap-2 text-slate-600 dark:text-zinc-300">
              <MapPin class="w-4 h-4 text-slate-400 dark:text-zinc-500 flex-shrink-0" aria-hidden="true" />
              <span class="line-clamp-1">{{ order.shipping_address }}</span>
            </div>
            <div class="flex items-center justify-between pt-2 border-t border-surface-border">
              <div class="flex items-center gap-3">
                <div class="flex items-center gap-1.5">
                  <Wallet class="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" aria-hidden="true" />
                  <span class="font-semibold text-surface-foreground tabular-nums">{{ formatVND(Number(order.amount_collected)) }}</span>
                </div>
                <span class="text-slate-300 dark:text-zinc-600">·</span>
                <div class="flex items-center gap-1 text-xs text-slate-500 dark:text-zinc-400">
                  <RouteIcon class="w-3.5 h-3.5" aria-hidden="true" />
                  <span class="tabular-nums">{{ distanceFor(order.id) }}</span>
                </div>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="text-xs text-slate-400 dark:text-zinc-500">{{ timeAgo(order.created_at) }}</span>
                <ChevronRight class="w-4 h-4 text-slate-300 dark:text-zinc-600" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </TransitionGroup>

      <!-- Load more -->
      <div v-if="hasMore" class="flex justify-center pt-2 pb-4">
        <AppButton variant="outline" size="md" @click="loadMore">
          Xem thêm {{ filteredHistory.length - visibleCount }} chuyến
        </AppButton>
      </div>
      <p v-else class="text-center text-xs text-slate-400 dark:text-zinc-500 py-4">
        Đã hiển thị tất cả {{ filteredHistory.length }} chuyến
      </p>
    </template>

    <!-- Empty -->
    <AppEmptyState
      v-else
      title="Chưa có lịch sử giao hàng"
      :description="statusFilter === 'all'
        ? 'Chưa có chuyến giao nào trong khoảng thời gian này.'
        : 'Không có chuyến nào phù hợp với bộ lọc đã chọn.'"
    />
  </div>
</template>
