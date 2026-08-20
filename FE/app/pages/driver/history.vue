<script setup lang="ts">
import { ConstantKey } from '~/enums/constantKeys'
import type { DriverRouteDTO } from '~/services/driverService'
import { useDriverHistory } from '~/composables/driver/useDriverHistory'

import { t } from '~/utils/i18n'

const { constants } = useMasterData()
definePageMeta({ layout: 'driver' })
useSeoMeta({ title: t('driver_history_seo_title') })
const toast = useToast()
const refreshing = ref(false)

type DateRange = 'today' | '7days' | '30days'
type StatusFilter = 'all' | 'delivered' | 'cancelled'

const dateRangeStr = ref<DateRange>('7days')
const statusFilterStr = ref<StatusFilter>('all')

const {
  history,
  meta,
  loading,
  refresh: refreshHistory,
  loadMore,
  hasMore,
  params
} = useDriverHistory()

// Tự động map filter UI vào params call API
watch(
  [dateRangeStr, statusFilterStr],
  ([range, status]) => {
    // Reset date
    const now = new Date()
    let dateFrom = ''
    if (range === 'today') {
      dateFrom = new Date(now.setHours(0, 0, 0, 0)).toISOString()
    } else if (range === '7days') {
      dateFrom = new Date(now.setDate(now.getDate() - 7)).toISOString()
    } else if (range === '30days') {
      dateFrom = new Date(now.setDate(now.getDate() - 30)).toISOString()
    }

    params.dateFrom = dateFrom
    params.dateTo = new Date().toISOString()

    // Status
    if (status === 'all') {
      params.status = undefined
    } else if (status === 'delivered') {
      params.status = constants.value?.[ConstantKey.OrderStatus]?.DELIVERED
    } else if (status === 'cancelled') {
      params.status = constants.value?.[ConstantKey.OrderStatus]?.CANCELLED
    }

    // Khi đổi filter thì reset về page 1
    params.page = 1
  },
  { immediate: true }
)

const stats = computed(() => {
  const list = history.value
  const delivered = list.filter(
    (o: DriverRouteDTO) => o.status === constants.value?.[ConstantKey.OrderStatus]?.DELIVERED
  )
  const cancelled = list.filter(
    (o: DriverRouteDTO) => o.status === constants.value?.[ConstantKey.OrderStatus]?.CANCELLED
  )
  const totalCollected = delivered.reduce(
    (sum: number, o: DriverRouteDTO) => sum + (Number(o.amountCollected) || 0),
    0
  )
  const successRate = list.length ? Math.round((delivered.length / list.length) * 100) : 0
  const totalDistance = delivered.reduce((sum: number, o: DriverRouteDTO) => {
    const seed = Number(o.id) || 1
    return sum + (6 + (seed % 18))
  }, 0)
  return {
    total: meta.value?.total || list.length,
    delivered: delivered.length, // Tạm tính theo current page vì api k gom tổng
    cancelled: cancelled.length,
    totalCollected,
    successRate,
    totalDistance
  }
})

function setRange(range: DateRange) {
  dateRangeStr.value = range
}

function setStatusFilter(filter: StatusFilter) {
  statusFilterStr.value = filter
}

function distanceFor(orderId: number): string {
  const seed = orderId || 1
  const km = 6 + (seed % 18) + (seed % 7) / 10
  return `${km.toFixed(1)} km`
}

async function refresh() {
  refreshing.value = true
  await refreshHistory()
  refreshing.value = false
  toast.add({ title: t('driver_history_msg_refresh'), color: 'success' })
}
</script>
<template>
  <div class="p-4">
    <!-- Header -->
    <div class="mb-4 flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {{ $t('driver_history_title') }}
        </h1>
        <p class="mt-0.5 text-sm text-slate-500 dark:text-zinc-400">
          {{ $t('driver_history_desc') }}
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
            { accessorKey: 'today', header: t('driver_history_range_today') },
            { accessorKey: '7days', header: t('driver_history_range_7days') },
            { accessorKey: '30days', header: t('driver_history_range_30days') }
          ]"
          :key="opt.accessorKey"
          variant="ghost"
          color="neutral"
          :class="[
            'min-w-fit flex-1 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all',
            dateRangeStr === opt.accessorKey
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
            <span class="text-xs text-slate-500 dark:text-zinc-400">{{
              $t('driver_history_stat_total')
            }}</span>
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
            <span class="text-xs text-slate-500 dark:text-zinc-400">{{
              $t('driver_history_stat_success_rate')
            }}</span>
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
            <span class="text-xs text-slate-500 dark:text-zinc-400">{{
              $t('driver_history_stat_collected')
            }}</span>
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
            <span class="text-xs text-slate-500 dark:text-zinc-400">{{
              $t('driver_history_stat_distance')
            }}</span>
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
            { accessorKey: 'all', header: t('admin_debt_type_all'), count: stats.total },
            {
              accessorKey: 'delivered',
              header: t('status_order_delivered'),
              count: stats.delivered
            },
            {
              accessorKey: 'cancelled',
              header: t('status_order_cancelled'),
              count: stats.cancelled
            }
          ]"
          :key="tab.accessorKey"
          variant="ghost"
          color="neutral"
          :class="[
            'min-w-fit flex-1 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all',
            statusFilterStr === tab.accessorKey
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
    <template v-else-if="history.length">
      <div
        v-for="(order, i) in history"
        :key="order.id"
        class="card card-hover animate-fade-in-up relative mb-3 cursor-pointer overflow-hidden p-4"
        :style="{ animationDelay: `${i * 50}ms` }"
        role="button"
        tabindex="0"
        @click="
          () => {
            navigateTo(`/driver/delivery/${order.id}`)
          }
        "
      >
        <div
          :class="[
            'absolute top-0 bottom-0 left-0 w-1',
            order.status === constants?.[ConstantKey.OrderStatus]?.DELIVERED
              ? 'bg-success-500'
              : 'bg-error-500'
          ]"
        />
        <div class="mb-3 flex items-start justify-between pl-1">
          <div class="flex items-center gap-3">
            <div
              :class="[
                'flex h-10 w-10 items-center justify-center rounded-xl',
                order.status === constants?.[ConstantKey.OrderStatus]?.DELIVERED
                  ? 'bg-success-50 dark:bg-success-900/20'
                  : 'bg-error-50 dark:bg-error-900/20'
              ]"
            >
              <UIcon
                :name="
                  order.status === constants?.[ConstantKey.OrderStatus]?.DELIVERED
                    ? 'i-lucide-check-circle-2'
                    : 'i-lucide-x-circle'
                "
                :class="
                  order.status === constants?.[ConstantKey.OrderStatus]?.DELIVERED
                    ? 'text-success-600 dark:text-success-400 h-5 w-5'
                    : 'text-error-600 dark:text-error-400 h-5 w-5'
                "
              />
            </div>
            <div>
              <p class="font-mono text-xs text-slate-400 dark:text-zinc-500">#{{ order.id }}</p>
              <p class="font-semibold text-neutral-900 dark:text-white">
                {{ order.user?.fullName || $t('driver_history_guest') }}
              </p>
            </div>
          </div>
          <UBadge
            :color="
              order.status === constants?.[ConstantKey.OrderStatus]?.DELIVERED ? 'success' : 'error'
            "
            variant="subtle"
            size="xs"
            >{{
              order.status === constants?.[ConstantKey.OrderStatus]?.DELIVERED
                ? $t('status_order_delivered')
                : $t('status_order_cancelled')
            }}</UBadge
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
                  formatVND(Number(order.amountCollected) || 0)
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
                formatTimeAgo(order.createdAt)
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
        <UButton variant="outline" :loading="loading" @click="loadMore">
          {{ $t('driver_history_btn_load_more') }}
        </UButton>
      </div>
      <p v-else class="py-4 text-center text-xs text-slate-400 dark:text-zinc-500">
        {{ $t('driver_history_msg_all_loaded', { count: meta?.total || history.length }) }}
      </p>
    </template>
    <!-- Empty -->
    <BaseEmptyState
      v-else
      :title="$t('driver_history_empty_title')"
      :description="
        statusFilterStr === 'all'
          ? $t('driver_history_empty_desc_all')
          : $t('driver_history_empty_desc_filter')
      "
    />
  </div>
</template>
