<script setup lang="ts">
import { OrderStatus } from '~/utils/enums'
import { mockOrders, mockProfiles } from '~/utils/mockData'
import { Role, UserStatus } from '~/utils/enums'
definePageMeta({ layout: 'driver' })
useSeoMeta({ title: 'Tuyến giao hàng - BunTech Driver' })
const router = useRouter()
const toast = useToast()
const loading = ref(true)
const refreshing = ref(false)
const isOnline = ref(true)
const activeTab = ref<'all' | 'shipping' | 'pending' | 'delivered'>('all')
// Current driver
const currentDriver = computed(() =>
  mockProfiles.find(p => p.role === Role.DRIVER && p.status === UserStatus.ACTIVE) || mockProfiles[2]
)
// All active orders assigned to this driver
const driverOrders = computed(() => {
  const driverId = currentDriver.value?.id
  if (!driverId) return []
  return mockOrders
    .filter(o => o.driver_id === driverId)
    .filter(o => [OrderStatus.SHIPPING, OrderStatus.PROCESSING, OrderStatus.PENDING, OrderStatus.DELIVERED].includes(o.status as OrderStatus))
    .sort((a, b) => {
      const order: Record<string, number> = { SHIPPING: 0, PROCESSING: 1, PENDING: 2, DELIVERED: 3 }
      const sa = order[a.status] ?? 9
      const sb = order[b.status] ?? 9
      if (sa !== sb) return sa - sb
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
})
const filteredOrders = computed(() => {
  if (activeTab.value === 'all') return driverOrders.value
  if (activeTab.value === 'shipping') return driverOrders.value.filter(o => o.status === OrderStatus.SHIPPING)
  if (activeTab.value === 'pending') return driverOrders.value.filter(o => o.status === OrderStatus.PROCESSING || o.status === OrderStatus.PENDING)
  if (activeTab.value === 'delivered') return driverOrders.value.filter(o => o.status === OrderStatus.DELIVERED)
  return driverOrders.value
})
const stats = computed(() => {
  const all = driverOrders.value
  const delivered = all.filter(o => o.status === OrderStatus.DELIVERED)
  const pending = all.filter(o => o.status === OrderStatus.PROCESSING || o.status === OrderStatus.PENDING)
  const shipping = all.filter(o => o.status === OrderStatus.SHIPPING)
  const totalToCollect = all
    .filter(o => o.status !== OrderStatus.DELIVERED)
    .reduce((sum, o) => sum + (o.total_amount - (o.amount_collected || 0)), 0)
  return {
    todayDeliveries: delivered.length,
    totalToCollect,
    completed: delivered.length,
    pending: pending.length + shipping.length,
  }
})
function distanceFor(orderId: string): string {
  let seed = 0
  for (let i = 0; i < orderId.length; i++) seed = (seed * 31 + orderId.charCodeAt(i)) >>> 0
  const km = 2 + (seed % 18) + (seed % 7) / 10
  return `${km.toFixed(1)} km`
}
const statusLabel: Record<string, string> = {
  SHIPPING: 'Đang giao',
  PROCESSING: 'Đang xử lý',
  PENDING: 'Chờ giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
}
function toggleOnline() {
  isOnline.value = !isOnline.value
  toast.add({ title: isOnline.value ? 'Bạn đã trực tuyến' : 'Bạn đã ngoại tuyến', color: 'success' })
}
function refresh() {
  refreshing.value = true
  setTimeout(() => {
    refreshing.value = false
    toast.add({ title: 'Đã làm mới danh sách', color: 'success' })
  }, 700)
}
onMounted(() => {
  setTimeout(() => { loading.value = false }, 500)
})
</script>
<template>
  <div class="p-4 pb-6">
    <!-- Online/Offline status banner -->
    <div
      :class="[
        'rounded-2xl p-4 mb-4 text-white relative overflow-hidden transition-all',
        isOnline
          ? 'bg-gradient-to-r from-success-500 to-emerald-600'
          : 'bg-gradient-to-r from-slate-600 to-slate-700',
      ]"
    >
      <div class="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
      <div class="relative flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
            <UIcon name="i-lucide-power" class="w-6 h-6 text-white" />
          </div>
          <div>
            <p class="text-sm font-semibold">{{ isOnline ? 'Đang trực tuyến' : 'Đang ngoại tuyến' }}</p>
            <p class="text-xs text-white/80">{{ isOnline ? 'Sẵn sàng nhận đơn giao hàng' : 'Tạm dừng nhận đơn' }}</p>
          </div>
        </div>
        <UButton variant="ghost" color="neutral"
          class="relative w-12 h-7 rounded-full bg-white/25 backdrop-blur transition-all min-w-[44px] min-h-[28px]"
          :aria-label="isOnline ? 'Tắt trực tuyến' : 'Bật trực tuyến'"
          @click="toggleOnline"
        >
          <span
            :class="[
              'absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all',
              isOnline ? 'left-[22px]' : 'left-0.5',
            ]"
          />
        </UButton>
      </div>
    </div>
    <!-- Date + Refresh -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <h1 class="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">Tuyến giao hôm nay</h1>
        <p class="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">{{ formatDate(new Date().toISOString()) }}</p>
      </div>
      <UButton variant="ghost" color="neutral"
        class="p-2.5 text-slate-500 dark:text-zinc-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-neutral-100 dark:hover:bg-zinc-800 rounded-xl transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
        :disabled="refreshing"
        @click="refresh"
      >
        <UIcon name="i-lucide-refresh-cw" :class="['w-5 h-5', refreshing ? 'animate-spin' : '']" />
      </UButton>
    </div>
    <!-- Premium Stats Banner -->
    <div class="bg-gradient-to-br from-slate-900 via-slate-900 to-primary-950 rounded-2xl p-5 mb-5 text-white relative overflow-hidden">
      <div class="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary-500/20 blur-2xl" />
      <div class="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-info-500/10 blur-2xl" />
      <div class="relative">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-wallet" class="w-5 h-5 text-primary-400" />
            <span class="text-sm font-medium text-slate-300">Cần thu hôm nay</span>
          </div>
          <UBadge color="primary" variant="solid" size="xs">{{ stats.pending }} đang giao</UBadge>
        </div>
        <p class="text-3xl font-bold tracking-tight mb-4 tabular-nums">{{ formatVND(stats.totalToCollect) }}</p>
        <div class="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
          <div>
            <div class="flex items-center gap-1.5 mb-1">
              <UIcon name="i-lucide-check-circle-2" class="w-3.5 h-3.5 text-success-400" />
              <span class="text-xs text-slate-400">Đã giao</span>
            </div>
            <p class="text-lg font-bold tabular-nums">{{ stats.completed }}</p>
          </div>
          <div>
            <div class="flex items-center gap-1.5 mb-1">
              <UIcon name="i-lucide-truck" class="w-3.5 h-3.5 text-primary-400" />
              <span class="text-xs text-slate-400">Đang giao</span>
            </div>
            <p class="text-lg font-bold text-primary-400 tabular-nums">{{ stats.pending }}</p>
          </div>
          <div>
            <div class="flex items-center gap-1.5 mb-1">
              <UIcon name="i-lucide-package" class="w-3.5 h-3.5 text-warning-400" />
              <span class="text-xs text-slate-400">Tổng tuyến</span>
            </div>
            <p class="text-lg font-bold tabular-nums">{{ driverOrders.length }}</p>
          </div>
        </div>
      </div>
    </div>
    <!-- Tab filter -->
    <div class="flex items-center gap-2 mb-4 overflow-x-auto">
      <div class="flex items-center gap-1 p-1 bg-white dark:bg-zinc-900 rounded-xl border border-neutral-200 dark:border-neutral-800 flex-1 min-w-fit">
        <UButton variant="ghost" color="neutral"
          v-for="tab in [
            { accessorKey: 'all', header: 'Tất cả', count: driverOrders.length },
            { accessorKey: 'shipping', header: 'Đang giao', count: driverOrders.filter(o => o.status === OrderStatus.SHIPPING).length },
            { accessorKey: 'pending', header: 'Chưa giao', count: driverOrders.filter(o => o.status === OrderStatus.PROCESSING || o.status === OrderStatus.PENDING).length },
            { accessorKey: 'delivered', header: 'Đã giao', count: driverOrders.filter(o => o.status === OrderStatus.DELIVERED).length },
          ]"
          :key="tab.key"
          :class="[
            'flex-1 min-w-fit px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap',
            activeTab === tab.key
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-500 dark:text-zinc-400 hover:bg-neutral-100 dark:hover:bg-zinc-800',
          ]"
          @click="activeTab = tab.key as 'all' | 'shipping' | 'pending' | 'delivered'"
        >{{ tab.label }} <span class="opacity-60">({{ tab.count }})</span></UButton>
      </div>
    </div>
    <!-- Loading -->
    <template v-if="loading">
      <div v-for="i in 4" :key="i" class="card p-4 mb-3">
        <div class="flex items-center gap-3 mb-3">
          <div class="skeleton h-10 w-10 rounded-xl" />
          <div class="flex-1">
            <div class="skeleton h-4 mb-1" />
            <div class="skeleton h-3 w-1/3" />
          </div>
        </div>
        <div class="skeleton h-3 mb-2" />
        <div class="skeleton h-3 w-2/3" />
      </div>
    </template>
    <!-- Route list -->
    <template v-else-if="filteredOrders.length">
      <div
        v-for="(order, i) in filteredOrders"
        :key="order.id"
        class="card card-hover p-4 mb-3 cursor-pointer animate-fade-in-up relative overflow-hidden"
        :style="{ animationDelay: `${i * 60}ms` }"
        role="button"
        tabindex="0"
        @click="navigateTo(`/driver/delivery/${order.id}`)"
        @keydown.enter="navigateTo(`/driver/delivery/${order.id}`)"
      >
        <!-- Left accent bar -->
        <div
          :class="[
            'absolute left-0 top-0 bottom-0 w-1',
            order.status === OrderStatus.SHIPPING ? 'bg-primary-500'
              : order.status === OrderStatus.DELIVERED ? 'bg-success-500'
              : order.status === OrderStatus.CANCELLED ? 'bg-error-500'
              : 'bg-warning-500',
          ]"
        />
        <div class="flex items-start justify-between mb-3 pl-1">
          <div class="flex items-center gap-3">
            <div :class="[
              'w-10 h-10 rounded-xl flex items-center justify-center',
              order.status === OrderStatus.SHIPPING ? 'bg-primary-50 dark:bg-primary-900/20'
                : order.status === OrderStatus.DELIVERED ? 'bg-success-50 dark:bg-success-900/20'
                : 'bg-warning-50 dark:bg-warning-900/20',
            ]">
              <UIcon name="i-lucide-package" :class="['w-5 h-5', order.status === OrderStatus.SHIPPING ? 'text-primary-600 dark:text-primary-400'
                : order.status === OrderStatus.DELIVERED ? 'text-success-600 dark:text-success-400'
                : 'text-warning-600 dark:text-warning-400']" />
            </div>
            <div>
              <p class="font-mono text-xs text-slate-400 dark:text-zinc-500">#{{ order.id }}</p>
              <p class="font-semibold text-neutral-900 dark:text-white">{{ order.customer_name || 'Khách vãng lai' }}</p>
            </div>
          </div>
          <UBadge
            :color="order.status === OrderStatus.SHIPPING ? 'primary' : order.status === OrderStatus.DELIVERED ? 'success' : order.status === OrderStatus.CANCELLED ? 'error' : 'warning'"
            variant="subtle"
            size="xs"
          >{{ statusLabel[order.status] || order.status }}</UBadge>
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
                <span class="font-semibold text-neutral-900 dark:text-white tabular-nums">{{ formatVND(order.total_amount) }}</span>
              </div>
              <span class="text-slate-300 dark:text-zinc-600">·</span>
              <div class="flex items-center gap-1 text-xs text-slate-500 dark:text-zinc-400">
                <UIcon name="i-lucide-navigation" class="w-3.5 h-3.5" />
                <span class="tabular-nums">{{ distanceFor(order.id) }}</span>
              </div>
            </div>
            <div class="flex items-center gap-1 text-primary-600 dark:text-primary-400 text-sm font-medium">
              <span>Chi tiết</span>
              <UIcon name="i-lucide-chevron-right" class="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </template>
    <!-- Empty -->
    <BaseEmptyState
      v-else
      title="Không có tuyến giao nào"
      :description="activeTab === 'all' ? 'Không có đơn hàng nào cần giao hôm nay.' : 'Không có đơn hàng nào phù hợp với bộ lọc đã chọn.'"
    />
  </div>
</template>
