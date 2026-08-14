<!--
  Responsibility: Table to display list of orders
  Dependency: UI components (UTable, UBadge, UButton, NuxtImg, etc.)
  Reason: Extracted from admin/orders/index.vue to meet line count limit
-->
<script setup lang="ts">
import { ConstantKey } from '~/enums/constantKeys'
import type { Order } from '~/utils/types'
import { getOrderStatusColor, getOrderStatusLabel } from '~/utils/orderStatus'

const { constants } = useMasterData()

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
  <BaseDataTable
    :columns="columns"
    :rows="orders as any[]"
    empty-title="Không tìm thấy đơn hàng"
    empty-description="Không có đơn hàng nào phù hợp với bộ lọc hiện tại."
    empty-icon="i-lucide-package-open"
  >
    <template #select-cell="{ row }">
      <UCheckbox
        v-if="
          row.status === constants?.[ConstantKey.OrderStatus]?.PROCESSING ||
          row.status === constants?.[ConstantKey.OrderStatus]?.PENDING
        "
        :model-value="selectedOrders.has(row.id)"
        @update:model-value="(v: boolean | 'indeterminate') => toggleSelectOrder(row.id, !!v)"
        @click.stop
      />
    </template>
    <template #id-cell="{ row }">
      <span class="font-mono text-xs text-slate-500 dark:text-zinc-400">{{
        row.id.slice(0, 8)
      }}</span>
    </template>
    <template #user-cell="{ row }">
      <div class="flex min-w-0 items-center gap-2">
        <UAvatar
          :alt="row.user?.full_name || row.guest_info?.name || 'Khách vãng lai'"
          :src="row.user?.avatar_url ?? undefined"
          size="sm"
        />
        <div class="min-w-0">
          <p class="text-surface-foreground max-w-[180px] truncate text-sm">
            {{ row.user?.full_name || row.guest_info?.name || 'Khách vãng lai' }}
          </p>
          <p
            v-if="row.driver"
            class="flex items-center gap-1 truncate text-xs text-slate-500 dark:text-zinc-400"
          >
            <span class="i-lucide-truck h-3 w-3" /> {{ row.driver?.full_name }}
          </p>
        </div>
      </div>
    </template>
    <template #status-cell="{ row }">
      <UBadge :color="getOrderStatusColor(constants)[row.status] as any" variant="subtle">
        {{ getOrderStatusLabel(constants)[row.status] }}
      </UBadge>
    </template>
    <template #total-cell="{ row }">
      <span class="text-surface-foreground font-semibold tabular-nums">{{
        formatVND(row.total)
      }}</span>
    </template>
    <template #amount_collected-cell="{ row }">
      <span
        :class="[
          'tabular-nums',
          row.amount_collected > 0
            ? 'text-success-600 dark:text-success-400 font-medium'
            : 'text-slate-400 dark:text-zinc-500'
        ]"
      >
        {{ row.amount_collected > 0 ? formatVND(row.amount_collected) : '—' }}
      </span>
    </template>
    <template #created_at-cell="{ row }">
      <span class="text-sm text-slate-500 tabular-nums dark:text-zinc-400">{{
        formatDate(row.created_at)
      }}</span>
    </template>
    <template #actions-cell="{ row }">
      <UButton
        color="neutral"
        variant="ghost"
        size="sm"
        :to="`/admin/orders/${row.id}`"
        icon="i-lucide-eye"
      >
        Xem
      </UButton>
    </template>
  </BaseDataTable>
</template>
