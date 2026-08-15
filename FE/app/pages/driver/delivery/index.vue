<script setup lang="ts">
import { ConstantKey } from '~/enums/constantKeys'
import type { DriverRouteDTO } from '~/services/driverService'
import { useDriverRoutes } from '~/composables/driver/useDriverRoutes'

const { constants } = useMasterData()
const { driverRoutes, loading, refresh: refreshRoutes } = useDriverRoutes()

definePageMeta({ layout: 'driver' })
useSeoMeta({ title: 'Tuyến giao hàng - BunTech Driver' })
const toast = useToast()
const refreshing = ref(false)
const isOnline = ref(true)
const activeTab = ref<'all' | 'shipping' | 'pending' | 'delivered'>('all')

const filteredOrders = computed(() => {
  if (activeTab.value === 'all') return driverRoutes.value
  if (activeTab.value === 'shipping')
    return driverRoutes.value.filter(
      (o: DriverRouteDTO) => o.status === constants.value?.[ConstantKey.OrderStatus]?.DELIVERING
    )
  if (activeTab.value === 'pending')
    return driverRoutes.value.filter(
      (o: DriverRouteDTO) =>
        o.status === constants.value?.[ConstantKey.OrderStatus]?.PROCESSING ||
        o.status === constants.value?.[ConstantKey.OrderStatus]?.PENDING
    )
  if (activeTab.value === 'delivered')
    return driverRoutes.value.filter(
      (o: DriverRouteDTO) => o.status === constants.value?.[ConstantKey.OrderStatus]?.DELIVERED
    )
  return driverRoutes.value
})

const stats = computed(() => {
  const all = driverRoutes.value
  const delivered = all.filter(
    (o: DriverRouteDTO) => o.status === constants.value?.[ConstantKey.OrderStatus]?.DELIVERED
  )
  const pending = all.filter(
    (o: DriverRouteDTO) =>
      o.status === constants.value?.[ConstantKey.OrderStatus]?.PROCESSING ||
      o.status === constants.value?.[ConstantKey.OrderStatus]?.PENDING
  )
  const shipping = all.filter(
    (o: DriverRouteDTO) => o.status === constants.value?.[ConstantKey.OrderStatus]?.DELIVERING
  )
  const totalToCollect = all
    .filter(
      (o: DriverRouteDTO) => o.status !== constants.value?.[ConstantKey.OrderStatus]?.DELIVERED
    )
    .reduce(
      (sum: number, o: DriverRouteDTO) =>
        sum + (Number(o.totalAmount) || 0) - (Number(o.amountCollected) || 0),
      0
    )

  return {
    todayDeliveries: delivered.length,
    totalToCollect,
    completed: delivered.length,
    pending: pending.length + shipping.length
  }
})

function distanceFor(orderId: number): string {
  let seed = 0
  const idStr = orderId.toString()
  for (let i = 0; i < idStr.length; i++) seed = (seed * 31 + idStr.charCodeAt(i)) >>> 0
  const km = 2 + (seed % 18) + (seed % 7) / 10
  return `${km.toFixed(1)} km`
}

const statusLabel: Record<string, string> = {
  DELIVERING: 'Đang giao',
  PROCESSING: 'Đang xử lý',
  PENDING: 'Chờ giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy'
}

function toggleOnline() {
  isOnline.value = !isOnline.value
  toast.add({
    title: isOnline.value ? 'Bạn đã trực tuyến' : 'Bạn đã ngoại tuyến',
    color: 'success'
  })
}

async function refresh() {
  refreshing.value = true
  await refreshRoutes()
  refreshing.value = false
  toast.add({ title: 'Đã làm mới danh sách', color: 'success' })
}
</script>
<template>
  <div class="p-4 pb-6">
    <!-- Online/Offline status banner -->
    <div
      :class="[
        'relative mb-4 overflow-hidden rounded-2xl p-4 text-white transition-all',
        isOnline
          ? 'from-success-500 bg-gradient-to-r to-emerald-600'
          : 'bg-gradient-to-r from-slate-600 to-slate-700'
      ]"
    >
      <div class="absolute top-0 right-0 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div class="relative flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur"
          >
            <UIcon name="i-lucide-power" class="h-6 w-6 text-white" />
          </div>
          <div>
            <p class="text-sm font-semibold">
              {{ isOnline ? 'Đang trực tuyến' : 'Đang ngoại tuyến' }}
            </p>
            <p class="text-xs text-white/80">
              {{ isOnline ? 'Sẵn sàng nhận đơn giao hàng' : 'Tạm dừng nhận đơn' }}
            </p>
          </div>
        </div>
        <UButton
          variant="ghost"
          color="neutral"
          class="relative h-7 min-h-[28px] w-12 min-w-[44px] rounded-full bg-white/25 backdrop-blur transition-all"
          :aria-label="isOnline ? 'Tắt trực tuyến' : 'Bật trực tuyến'"
          @click="toggleOnline"
        >
          <span
            :class="[
              'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-all',
              isOnline ? 'left-[22px]' : 'left-0.5'
            ]"
          />
        </UButton>
      </div>
    </div>
    <!-- Date + Refresh -->
    <div class="mb-4 flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Tuyến giao hôm nay
        </h1>
        <p class="mt-0.5 text-sm text-slate-500 dark:text-zinc-400">
          {{ formatDate(new Date().toISOString()) }}
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
    <!-- Premium Stats Banner -->
    <div
      class="to-primary-950 relative mb-5 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 p-5 text-white"
    >
      <div class="bg-primary-500/20 absolute top-0 right-0 h-32 w-32 rounded-full blur-2xl" />
      <div class="bg-info-500/10 absolute bottom-0 left-0 h-24 w-24 rounded-full blur-2xl" />
      <div class="relative">
        <div class="mb-4 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-wallet" class="text-primary-400 h-5 w-5" />
            <span class="text-sm font-medium text-slate-300">Cần thu hôm nay</span>
          </div>
          <UBadge color="primary" variant="solid" size="xs">{{ stats.pending }} đang giao</UBadge>
        </div>
        <p class="mb-4 text-3xl font-bold tracking-tight tabular-nums">
          {{ formatVND(stats.totalToCollect) }}
        </p>
        <div class="grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
          <div>
            <div class="mb-1 flex items-center gap-1.5">
              <UIcon name="i-lucide-check-circle-2" class="text-success-400 h-3.5 w-3.5" />
              <span class="text-xs text-slate-400">Đã giao</span>
            </div>
            <p class="text-lg font-bold tabular-nums">{{ stats.completed }}</p>
          </div>
          <div>
            <div class="mb-1 flex items-center gap-1.5">
              <UIcon name="i-lucide-truck" class="text-primary-400 h-3.5 w-3.5" />
              <span class="text-xs text-slate-400">Đang giao</span>
            </div>
            <p class="text-primary-400 text-lg font-bold tabular-nums">{{ stats.pending }}</p>
          </div>
          <div>
            <div class="mb-1 flex items-center gap-1.5">
              <UIcon name="i-lucide-package" class="text-warning-400 h-3.5 w-3.5" />
              <span class="text-xs text-slate-400">Tổng tuyến</span>
            </div>
            <p class="text-lg font-bold tabular-nums">{{ driverRoutes.length }}</p>
          </div>
        </div>
      </div>
    </div>
    <!-- Tab filter -->
    <div class="mb-4 flex items-center gap-2 overflow-x-auto">
      <div
        class="flex min-w-fit flex-1 items-center gap-1 rounded-xl border border-neutral-200 bg-white p-1 dark:border-neutral-800 dark:bg-zinc-900"
      >
        <UButton
          v-for="tab in [
            { accessorKey: 'all', header: 'Tất cả', count: driverRoutes.length },
            {
              accessorKey: 'shipping',
              header: 'Đang giao',
              count: driverRoutes.filter(
                (o: DriverRouteDTO) => o.status === constants?.[ConstantKey.OrderStatus]?.DELIVERING
              ).length
            },
            {
              accessorKey: 'pending',
              header: 'Chưa giao',
              count: driverRoutes.filter(
                (o: DriverRouteDTO) =>
                  o.status === constants?.[ConstantKey.OrderStatus]?.PROCESSING ||
                  o.status === constants?.[ConstantKey.OrderStatus]?.PENDING
              ).length
            },
            {
              accessorKey: 'delivered',
              header: 'Đã giao',
              count: driverRoutes.filter(
                (o: DriverRouteDTO) => o.status === constants?.[ConstantKey.OrderStatus]?.DELIVERED
              ).length
            }
          ]"
          :key="tab.accessorKey"
          variant="ghost"
          color="neutral"
          :class="[
            'min-w-fit flex-1 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all',
            activeTab === tab.accessorKey
              ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900'
              : 'text-slate-500 hover:bg-neutral-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
          ]"
          @click="
            () => {
              activeTab = tab.accessorKey as 'all' | 'shipping' | 'pending' | 'delivered'
            }
          "
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
    <!-- Route list -->
    <template v-else-if="filteredOrders.length">
      <div
        v-for="(order, i) in filteredOrders"
        :key="order.id"
        class="card card-hover animate-fade-in-up relative mb-3 cursor-pointer overflow-hidden p-4"
        :style="{ animationDelay: `${i * 60}ms` }"
        role="button"
        tabindex="0"
        @click="
          () => {
            navigateTo(`/driver/delivery/${order.id}`)
          }
        "
        @keydown.enter="navigateTo(`/driver/delivery/${order.id}`)"
      >
        <!-- Left accent bar -->
        <div
          :class="[
            'absolute top-0 bottom-0 left-0 w-1',
            order.status === constants?.[ConstantKey.OrderStatus]?.DELIVERING
              ? 'bg-primary-500'
              : order.status === constants?.[ConstantKey.OrderStatus]?.DELIVERED
                ? 'bg-success-500'
                : order.status === constants?.[ConstantKey.OrderStatus]?.CANCELLED
                  ? 'bg-error-500'
                  : 'bg-warning-500'
          ]"
        />
        <div class="mb-3 flex items-start justify-between pl-1">
          <div class="flex items-center gap-3">
            <div
              :class="[
                'flex h-10 w-10 items-center justify-center rounded-xl',
                order.status === constants?.[ConstantKey.OrderStatus]?.DELIVERING
                  ? 'bg-primary-50 dark:bg-primary-900/20'
                  : order.status === constants?.[ConstantKey.OrderStatus]?.DELIVERED
                    ? 'bg-success-50 dark:bg-success-900/20'
                    : 'bg-warning-50 dark:bg-warning-900/20'
              ]"
            >
              <UIcon
                name="i-lucide-package"
                :class="[
                  'h-5 w-5',
                  order.status === constants?.[ConstantKey.OrderStatus]?.DELIVERING
                    ? 'text-primary-600 dark:text-primary-400'
                    : order.status === constants?.[ConstantKey.OrderStatus]?.DELIVERED
                      ? 'text-success-600 dark:text-success-400'
                      : 'text-warning-600 dark:text-warning-400'
                ]"
              />
            </div>
            <div>
              <p class="font-mono text-xs text-slate-400 dark:text-zinc-500">#{{ order.id }}</p>
              <p class="font-semibold text-neutral-900 dark:text-white">
                {{ order.user?.fullName || 'Khách vãng lai' }}
              </p>
            </div>
          </div>
          <UBadge
            :color="
              order.status === constants?.[ConstantKey.OrderStatus]?.DELIVERING
                ? 'primary'
                : order.status === constants?.[ConstantKey.OrderStatus]?.DELIVERED
                  ? 'success'
                  : order.status === constants?.[ConstantKey.OrderStatus]?.CANCELLED
                    ? 'error'
                    : 'warning'
            "
            variant="subtle"
            size="xs"
            >{{ statusLabel[order.status] || order.status }}</UBadge
          >
        </div>
        <div class="space-y-2 pl-1 text-sm">
          <div class="flex items-center gap-2 text-slate-600 dark:text-zinc-300">
            <UIcon
              name="i-lucide-map-pin"
              class="h-4 w-4 flex-shrink-0 text-slate-400 dark:text-zinc-500"
            />
            <span class="line-clamp-1">{{ order.shippingAddress?.addressLine || '' }}</span>
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
                  formatVND(Number(order.totalAmount) || 0)
                }}</span>
              </div>
              <span class="text-slate-300 dark:text-zinc-600">·</span>
              <div class="flex items-center gap-1 text-xs text-slate-500 dark:text-zinc-400">
                <UIcon name="i-lucide-navigation" class="h-3.5 w-3.5" />
                <span class="tabular-nums">{{ distanceFor(order.id) }}</span>
              </div>
            </div>
            <div
              class="text-primary-600 dark:text-primary-400 flex items-center gap-1 text-sm font-medium"
            >
              <span>Chi tiết</span>
              <UIcon name="i-lucide-chevron-right" class="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </template>
    <!-- Empty -->
    <BaseEmptyState
      v-else
      title="Không có tuyến giao nào"
      :description="
        activeTab === 'all'
          ? 'Không có đơn hàng nào cần giao hôm nay.'
          : 'Không có đơn hàng nào phù hợp với bộ lọc đã chọn.'
      "
    />
  </div>
</template>
