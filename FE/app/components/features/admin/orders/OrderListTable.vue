<!--
  Responsibility: Table to display list of orders
  Dependency: UI components (UTable, UBadge, UButton, NuxtImg, etc.)
  Reason: Extracted from admin/orders/index.vue to meet line count limit
-->
<script setup lang="ts">
import { OrderStatus } from '~/utils/enums'
import type { Order } from '~/utils/types'
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '~/utils/orderStatus'
import { formatDate, formatVND } from '~/utils/formatters'

defineProps<{
  orders: Order[]
  selectedOrders: Set<string>
}>()

const emit = defineEmits<{
  (e: 'update:selectedOrders', orderId: string, checked: boolean): void
}>()

const columns = [
  { accessorKey: 'select', header: '' },
  { accessorKey: 'id', header: 'Mã đơn' },
  { accessorKey: 'user', header: 'Khách hàng' },
  { accessorKey: 'status', header: 'Trạng thái' },
  { accessorKey: 'total', header: 'Tổng tiền' },
  { accessorKey: 'amount_collected', header: 'Đã thu' },
  { accessorKey: 'created_at', header: 'Ngày tạo' },
  { accessorKey: 'actions', header: 'Thao tác' }
]

function toggleSelectOrder(id: string, checked: boolean) {
  emit('update:selectedOrders', id, checked)
}
</script>

<template>
  <UTable :columns="columns" :data="orders">
    <template #select-cell="{ row }">
      <UCheckbox
        v-if="
          row.original.status === OrderStatus.PROCESSING ||
          row.original.status === OrderStatus.PENDING
        "
        :model-value="selectedOrders.has(row.original.id)"
        @update:model-value="(v: boolean) => toggleSelectOrder(row.original.id, v)"
        @click.stop
      />
    </template>
    <template #id-cell="{ row }">
      <span class="font-mono text-xs text-slate-500 dark:text-zinc-400">{{
        row.original.id.slice(0, 8)
      }}</span>
    </template>
    <template #user-cell="{ row }">
      <div class="flex min-w-0 items-center gap-2">
        <UAvatar
          :alt="row.original.user?.full_name || row.original.guest_info?.name || 'Khách vãng lai'"
          :src="row.original.user?.avatar_url"
          size="sm"
        />
        <div class="min-w-0">
          <p class="text-surface-foreground max-w-[180px] truncate text-sm">
            {{ row.original.user?.full_name || row.original.guest_info?.name || 'Khách vãng lai' }}
          </p>
          <p
            v-if="row.original.driver"
            class="flex items-center gap-1 truncate text-xs text-slate-500 dark:text-zinc-400"
          >
            <span class="i-lucide-truck h-3 w-3" /> {{ row.original.driver?.full_name }}
          </p>
        </div>
      </div>
    </template>
    <template #status-cell="{ row }">
      <UBadge :color="ORDER_STATUS_COLORS[row.original.status]" variant="subtle">
        {{ ORDER_STATUS_LABELS[row.original.status] }}
      </UBadge>
    </template>
    <template #total-cell="{ row }">
      <span class="text-surface-foreground font-semibold tabular-nums">{{
        formatVND(row.original.total)
      }}</span>
    </template>
    <template #amount_collected-cell="{ row }">
      <span
        :class="[
          'tabular-nums',
          row.original.amount_collected > 0
            ? 'text-success-600 dark:text-success-400 font-medium'
            : 'text-slate-400 dark:text-zinc-500'
        ]"
      >
        {{ row.original.amount_collected > 0 ? formatVND(row.original.amount_collected) : '—' }}
      </span>
    </template>
    <template #created_at-cell="{ row }">
      <span class="text-sm text-slate-500 tabular-nums dark:text-zinc-400">{{
        formatDate(row.original.created_at)
      }}</span>
    </template>
    <template #actions-cell="{ row }">
      <UButton color="neutral" variant="ghost" size="sm" :to="`/admin/orders/${row.original.id}`">
        <div class="i-lucide-eye mr-1 h-4 w-4" />
        Xem
      </UButton>
    </template>
  </UTable>
</template>
