<!--
  Responsibility: Render KPI cards and revenue banner for orders
  Dependency: Order status and mock data length
  Reason: Extracted to keep admin/orders/index.vue under 400 lines
-->
<script setup lang="ts">
import { ConstantKey } from '~/enums/constantKeys'
import type { AdminOrderDTO } from '~/services/adminOrderService'
import { t } from '~/utils/i18n'

const { constants } = useMasterData()

const props = defineProps<{
  orders: AdminOrderDTO[]
  loading: boolean
}>()

const kpiStats = computed(() => {
  const list = props.orders
  const pending = list.filter(
    (o) => o.status === constants.value?.[ConstantKey.OrderStatus]?.PENDING
  ).length
  const shipping = list.filter(
    (o) => o.status === constants.value?.[ConstantKey.OrderStatus]?.DELIVERING
  ).length
  const delivered = list.filter(
    (o) => o.status === constants.value?.[ConstantKey.OrderStatus]?.DELIVERED
  ).length
  return [
    {
      title: t('admin_order_kpi_total'),
      value: list.length,
      icon: 'i-lucide-shopping-bag',
      color: 'primary' as const,
      trend: { value: 15, isPositive: true }
    },
    {
      title: t('status_order_pending'),
      value: pending,
      icon: 'i-lucide-clock',
      color: 'warning' as const,
      trend: { value: 3, isPositive: true }
    },
    {
      title: t('status_order_delivering'),
      value: shipping,
      icon: 'i-lucide-truck',
      color: 'info' as const,
      trend: { value: 7, isPositive: true }
    },
    {
      title: t('status_order_delivered'),
      value: delivered,
      icon: 'i-lucide-package-check',
      color: 'success' as const,
      trend: { value: 12, isPositive: true }
    }
  ]
})

const totalRevenue = computed(() =>
  props.orders
    .filter((o) => o.status === constants.value?.[ConstantKey.OrderStatus]?.DELIVERED)
    .reduce((s, o) => s + Number(o.totalAmount || 0), 0)
)
</script>

<template>
  <div>
    <!-- KPI Row -->
    <div class="mb-6">
      <BaseStatsGrid :stats="kpiStats" :loading="loading" />
    </div>
    <!-- Revenue banner -->
    <div
      class="card stagger-item mb-4 flex items-center justify-between p-4"
      style="animation-delay: 180ms"
    >
      <div class="flex items-center gap-3">
        <div
          class="bg-success-50 dark:bg-success-900/20 ring-success-100 dark:ring-success-900/30 flex h-10 w-10 items-center justify-center rounded-lg ring-1"
        >
          <div class="i-lucide-banknote text-success-600 dark:text-success-400 h-5 w-5" />
        </div>
        <div>
          <p class="text-xs font-medium text-slate-500 dark:text-zinc-400">
            {{ $t('admin_order_kpi_revenue') }}
          </p>
          <p class="text-success-600 dark:text-success-400 text-lg font-bold tabular-nums">
            {{ formatVND(totalRevenue) }}
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="relative flex h-2.5 w-2.5">
          <span
            class="bg-success-400 absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
          />
          <span class="bg-success-500 relative inline-flex h-2.5 w-2.5 rounded-full" />
        </span>
        <span
          class="flex hidden items-center gap-1 text-xs text-slate-500 sm:flex dark:text-zinc-400"
        >
          <div class="i-lucide-radio h-3.5 w-3.5" />
          {{ $t('admin_order_kpi_realtime') }}
        </span>
      </div>
    </div>
  </div>
</template>
