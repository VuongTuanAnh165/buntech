<!--
  Responsibility: Table to display list of orders
  Dependency: UI components (UTable, UBadge, UButton, NuxtImg, etc.)
  Reason: Extracted from admin/orders/index.vue to meet line count limit
-->
<script setup lang="ts">
import { ConstantKey } from '~/enums/constantKeys'
import type { AdminOrderDTO } from '~/services/adminOrderService'
import { getOrderStatusColor, getOrderStatusLabel } from '~/utils/orderStatus'
import { t } from '~/utils/i18n'

const { constants } = useMasterData()

defineProps<{
  orders: AdminOrderDTO[]
  selectedOrders: Set<number>
}>()

const emit = defineEmits<{
  (e: 'update:selectedOrders', orderId: number, checked: boolean): void
}>()

const columns = [
  { accessorKey: 'select', header: '' },
  { accessorKey: 'id', header: t('wholesale_col_id') },
  { accessorKey: 'user', header: t('common_customer') },
  { accessorKey: 'status', header: t('status') },
  { accessorKey: 'total', header: t('wholesale_col_total') },
  { accessorKey: 'amount_collected', header: t('driver_history_stat_collected') },
  { accessorKey: 'created_at', header: t('created_at') },
  { accessorKey: 'actions', header: t('actions') }
]

function toggleSelectOrder(id: number, checked: boolean) {
  emit('update:selectedOrders', id, checked)
}
</script>

<template>
  <BaseDataTable
    :columns="columns"
    :rows="orders"
    :empty-title="$t('admin_order_list_empty_title')"
    :empty-description="$t('admin_order_list_empty_desc')"
    empty-icon="i-lucide-shopping-bag"
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
        String(row.id).slice(0, 8)
      }}</span>
    </template>
    <template #user-cell="{ row }">
      <div class="flex min-w-0 items-center gap-2">
        <UAvatar
          :alt="row.user?.fullName || $t('driver_history_guest')"
          :src="row.user?.avatarUrl ?? undefined"
          size="sm"
        />
        <div class="min-w-0">
          <p class="text-surface-foreground max-w-[180px] truncate text-sm">
            {{ row.user?.fullName || $t('driver_history_guest') }}
          </p>
          <p
            v-if="row.driver"
            class="flex items-center gap-1 truncate text-xs text-slate-500 dark:text-zinc-400"
          >
            <UIcon name="i-lucide-truck" class="h-3 w-3" /> {{ row.driver?.fullName }}
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
        formatVND(Number(row.totalAmount))
      }}</span>
    </template>
    <template #amount_collected-cell="{ row }">
      <span
        :class="[
          'tabular-nums',
          Number(row.amountCollected) > 0
            ? 'text-success-600 dark:text-success-400 font-medium'
            : 'text-slate-400 dark:text-zinc-500'
        ]"
      >
        {{ Number(row.amountCollected) > 0 ? formatVND(Number(row.amountCollected)) : '—' }}
      </span>
    </template>
    <template #created_at-cell="{ row }">
      <span class="text-sm text-slate-500 tabular-nums dark:text-zinc-400">{{
        formatDate(row.createdAt)
      }}</span>
    </template>
    <template #actions-cell="{ row }">
      <div class="flex items-center gap-1">
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          :to="`/admin/orders/create?copyFrom=${row.id}`"
          icon="i-lucide-copy"
        >
          {{ $t('admin_order_list_btn_copy') }}
        </UButton>
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          :to="`/admin/orders/${row.id}`"
          icon="i-lucide-eye"
        >
          {{ $t('admin_order_list_btn_view') }}
        </UButton>
      </div>
    </template>
  </BaseDataTable>
</template>
