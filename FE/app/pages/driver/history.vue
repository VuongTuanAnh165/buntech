<script setup lang="ts">
import { OrderStatus, Role, UserStatus } from '~/utils/enums'
import { mockOrders, mockProfiles } from '~/utils/mockData'
definePageMeta({ layout: 'driver' })
useSeoMeta({ title: 'Lịch sử giao hàng - BunTech Driver' })
const _router = useRouter()
const toast = useToast()
type DateRange = 'today' | '7days' | '30days'
type StatusFilter = 'all' | 'delivered' | 'cancelled'
const loading = ref(true)
const refreshing = ref(false)
const dateRange = ref<DateRange>('7days')
const statusFilter = ref<StatusFilter>('all')
const visibleCount = ref(8)
const currentDriver = computed(
  () =>
    mockProfiles.find((p) => p.role === Role.DRIVER && p.status === UserStatus.ACTIVE) ||
    mockProfiles[2]
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
    .filter((o) => o.driver_id === driverId)
    .filter((o) => o.status === OrderStatus.DELIVERED || o.status === OrderStatus.CANCELLED)
    .filter((o) => new Date(o.created_at).getTime() >= cutoff)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})
const filteredHistory = computed(() => {
  if (statusFilter.value === 'all') return allHistory.value
  if (statusFilter.value === 'delivered')
    return allHistory.value.filter((o) => o.status === OrderStatus.DELIVERED)
  return allHistory.value.filter((o) => o.status === OrderStatus.CANCELLED)
})
const stats = computed(() => {
  const list = allHistory.value
  const delivered = list.filter((o) => o.status === OrderStatus.DELIVERED)
  const cancelled = list.filter((o) => o.status === OrderStatus.CANCELLED)
  const totalCollected = delivered.reduce((sum, o) => sum + (o.amount_collected || 0), 0)
  const successRate = list.length ? Math.round((delivered.length / list.length) * 100) : 0
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
    totalDistance
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
function distanceFor(orderId: string): string {
  const seed = orderId.charCodeAt(orderId.length - 1) || 1
  const km = 6 + (seed % 18) + (seed % 7) / 10
  return `${km.toFixed(1)} km`
}
function refresh() {
  refreshing.value = true
  setTimeout(() => {
    refreshing.value = false
    toast.add({ title: 'Đã làm mới lịch sử', color: 'success' })
  }, 700)
}
onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 500)
})
</script>
<template>
  <div class="p-4">
    <!-- Header -->
    <div class="mb-4 flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Lịch sử giao hàng
        </h1>
        <p class="mt-0.5 text-sm text-slate-500 dark:text-zinc-400">
          Xem lại các chuyến giao đã hoàn thành
        </p>
      </div>
      <UButton
        variant="ghost"
        color="neutral"
        class="hover:text-primary-600 dark:hover:text-primary-400 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl p-2.5 text-slate-500 transition-all hover:bg-neutral-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        :disabled="refreshing"
        @click="refresh"
      >
        <UIcon name="i-lucide-refresh-cw" :class="['h-5 w-5', refreshing ? 'animate-spin' : '']" />
      </UButton>
    </div>
    <!-- Date range filter -->
    <div class="mb-4 flex items-center gap-2">
      <UIcon
        name="i-lucide-calendar"
        class="h-4 w-4 flex-shrink-0 text-slate-400 dark:text-zinc-500"
      />
      <div
        class="flex flex-1 items-center gap-2 overflow-x-auto rounded-xl border border-neutral-200 bg-white p-1 dark:border-neutral-800 dark:bg-zinc-900"
      >
        <UButton
          v-for="opt in [
            { accessorKey: 'today', header: 'Hôm nay' },
            { accessorKey: '7days', header: '7 ngày' },
            { accessorKey: '30days', header: '30 ngày' }
          ]"
          :key="opt.accessorKey"
          variant="ghost"
          color="neutral"
          :class="[
            'min-w-fit flex-1 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all',
            dateRange === opt.accessorKey
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-slate-500 hover:bg-neutral-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
          ]"
          @click="setRange(opt.accessorKey as DateRange)"
          >{{ opt.header }}</UButton
        >
      </div>
    </div>
    <!-- Stats cards -->
    <div class="mb-4 grid grid-cols-2 gap-3">
      <div class="card relative overflow-hidden p-4">
        <div class="bg-primary-500/5 absolute top-0 right-0 h-20 w-20 rounded-full blur-xl" />
        <div class="relative">
          <div class="mb-1 flex items-center gap-1.5">
            <UIcon name="i-lucide-package" class="text-primary-500 h-3.5 w-3.5" />
            <span class="text-xs text-slate-500 dark:text-zinc-400">Tổng chuyến</span>
          </div>
          <p class="text-2xl font-bold text-neutral-900 tabular-nums dark:text-white">
            {{ stats.total }}
          </p>
        </div>
      </div>
      <div class="card relative overflow-hidden p-4">
        <div class="bg-success-500/5 absolute top-0 right-0 h-20 w-20 rounded-full blur-xl" />
        <div class="relative">
          <div class="mb-1 flex items-center gap-1.5">
            <UIcon name="i-lucide-trending-up" class="text-success-500 h-3.5 w-3.5" />
            <span class="text-xs text-slate-500 dark:text-zinc-400">Tỷ lệ thành công</span>
          </div>
          <p class="text-success-600 dark:text-success-400 text-2xl font-bold tabular-nums">
            {{ stats.successRate }}%
          </p>
        </div>
      </div>
      <div class="card relative overflow-hidden p-4">
        <div class="bg-warning-500/5 absolute top-0 right-0 h-20 w-20 rounded-full blur-xl" />
        <div class="relative">
          <div class="mb-1 flex items-center gap-1.5">
            <UIcon name="i-lucide-wallet" class="text-warning-500 h-3.5 w-3.5" />
            <span class="text-xs text-slate-500 dark:text-zinc-400">Đã thu</span>
          </div>
          <p class="truncate text-lg font-bold text-neutral-900 tabular-nums dark:text-white">
            {{ formatVND(stats.totalCollected) }}
          </p>
        </div>
      </div>
      <div class="card relative overflow-hidden p-4">
        <div class="bg-info-500/5 absolute top-0 right-0 h-20 w-20 rounded-full blur-xl" />
        <div class="relative">
          <div class="mb-1 flex items-center gap-1.5">
            <UIcon name="i-lucide-route" class="text-info-500 h-3.5 w-3.5" />
            <span class="text-xs text-slate-500 dark:text-zinc-400">Tổng quãng đường</span>
          </div>
          <p class="text-2xl font-bold text-neutral-900 tabular-nums dark:text-white">
            {{ stats.totalDistance }} <span class="text-sm font-medium text-slate-400">km</span>
          </p>
        </div>
      </div>
    </div>
    <!-- Status filter tabs -->
    <div class="mb-4 flex items-center gap-2 overflow-x-auto">
      <UIcon
        name="i-lucide-filter"
        class="h-4 w-4 flex-shrink-0 text-slate-400 dark:text-zinc-500"
      />
      <div
        class="flex flex-1 items-center gap-2 rounded-xl border border-neutral-200 bg-white p-1 dark:border-neutral-800 dark:bg-zinc-900"
      >
        <UButton
          v-for="tab in [
            { accessorKey: 'all', header: 'Tất cả', count: stats.total },
            { accessorKey: 'delivered', header: 'Đã giao', count: stats.delivered },
            { accessorKey: 'cancelled', header: 'Đã hủy', count: stats.cancelled }
          ]"
          :key="tab.accessorKey"
          variant="ghost"
          color="neutral"
          :class="[
            'min-w-fit flex-1 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all',
            statusFilter === tab.accessorKey
              ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900'
              : 'text-slate-500 hover:bg-neutral-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
          ]"
          @click="setStatusFilter(tab.accessorKey as StatusFilter)"
          >{{ tab.header }} <span class="opacity-60">({{ tab.count }})</span></UButton
        >
      </div>
    </div>
    <!-- Loading -->
    <template v-if="loading">
      <div v-for="i in 4" :key="i" class="card mb-3 p-4">
        <div class="mb-3 flex items-center gap-3">
          <div class="skeleton h-10 w-10 rounded-xl" />
          <div class="flex-1">
            <div class="skeleton mb-1 h-4" />
            <div class="skeleton h-3 w-1/3" />
          </div>
        </div>
        <div class="skeleton mb-2 h-3" />
        <div class="skeleton h-3 w-2/3" />
      </div>
    </template>
    <!-- History list -->
    <template v-else-if="visibleHistory.length">
      <div
        v-for="(order, i) in visibleHistory"
        :key="order.id"
        class="card card-hover animate-fade-in-up relative mb-3 cursor-pointer overflow-hidden p-4"
        :style="{ animationDelay: `${i * 50}ms` }"
        role="button"
        tabindex="0"
        @click="navigateTo(`/driver/delivery/${order.id}`)"
      >
        <div
          :class="[
            'absolute top-0 bottom-0 left-0 w-1',
            order.status === OrderStatus.DELIVERED ? 'bg-success-500' : 'bg-error-500'
          ]"
        />
        <div class="mb-3 flex items-start justify-between pl-1">
          <div class="flex items-center gap-3">
            <div
              :class="[
                'flex h-10 w-10 items-center justify-center rounded-xl',
                order.status === OrderStatus.DELIVERED
                  ? 'bg-success-50 dark:bg-success-900/20'
                  : 'bg-error-50 dark:bg-error-900/20'
              ]"
            >
              <UIcon
                :name="
                  order.status === OrderStatus.DELIVERED
                    ? 'i-lucide-check-circle-2'
                    : 'i-lucide-x-circle'
                "
                :class="
                  order.status === OrderStatus.DELIVERED
                    ? 'text-success-600 dark:text-success-400 h-5 w-5'
                    : 'text-error-600 dark:text-error-400 h-5 w-5'
                "
              />
            </div>
            <div>
              <p class="font-mono text-xs text-slate-400 dark:text-zinc-500">#{{ order.id }}</p>
              <p class="font-semibold text-neutral-900 dark:text-white">
                {{ order.user?.full_name || order.guest_info?.name || 'Khách vãng lai' }}
              </p>
            </div>
          </div>
          <UBadge
            :color="order.status === OrderStatus.DELIVERED ? 'success' : 'error'"
            variant="subtle"
            size="xs"
            >{{ order.status === OrderStatus.DELIVERED ? 'Đã giao' : 'Đã hủy' }}</UBadge
          >
        </div>
        <div class="space-y-2 pl-1 text-sm">
          <div class="flex items-center gap-2 text-slate-600 dark:text-zinc-300">
            <UIcon
              name="i-lucide-map-pin"
              class="h-4 w-4 flex-shrink-0 text-slate-400 dark:text-zinc-500"
            />
            <span class="line-clamp-1">{{ order.shipping_address }}</span>
          </div>
          <div
            class="flex items-center justify-between border-t border-neutral-100 pt-2 dark:border-neutral-800"
          >
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-1.5">
                <UIcon
                  name="i-lucide-wallet"
                  class="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500"
                />
                <span class="font-semibold text-neutral-900 tabular-nums dark:text-white">{{
                  formatVND(order.amount_collected || 0)
                }}</span>
              </div>
              <span class="text-slate-300 dark:text-zinc-600">·</span>
              <div class="flex items-center gap-1 text-xs text-slate-500 dark:text-zinc-400">
                <UIcon name="i-lucide-route" class="h-3.5 w-3.5" />
                <span class="tabular-nums">{{ distanceFor(order.id) }}</span>
              </div>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-xs text-slate-400 dark:text-zinc-500">{{
                formatTimeAgo(order.created_at)
              }}</span>
              <UIcon
                name="i-lucide-chevron-right"
                class="h-4 w-4 text-slate-300 dark:text-zinc-600"
              />
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
      <p v-else class="py-4 text-center text-xs text-slate-400 dark:text-zinc-500">
        Đã hiển thị tất cả {{ filteredHistory.length }} chuyến
      </p>
    </template>
    <!-- Empty -->
    <BaseEmptyState
      v-else
      title="Chưa có lịch sử giao hàng"
      :description="
        statusFilter === 'all'
          ? 'Chưa có chuyến giao nào trong khoảng thời gian này.'
          : 'Không có chuyến nào phù hợp với bộ lọc đã chọn.'
      "
    />
  </div>
</template>
