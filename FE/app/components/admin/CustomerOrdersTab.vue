<script setup lang="ts">
import type { AdminOrderDTO } from '~/services/adminOrderService'
defineProps<{
  orders: AdminOrderDTO[]
}>()
</script>
<template>
  <div class="animate-fade-in-up">
    <BaseDataTable
      :columns="[
        { accessorKey: 'id', header: $t('wholesale_col_id') },
        { accessorKey: 'status', header: $t('status') },
        { accessorKey: 'totalAmount', header: $t('wholesale_col_total'), class: 'text-right' },
        {
          accessorKey: 'amountCollected',
          header: $t('driver_history_stat_collected'),
          class: 'text-right'
        },
        { accessorKey: 'createdAt', header: $t('wholesale_col_date') }
      ]"
      :rows="orders as unknown as Record<string, unknown>[]"
      :empty-title="$t('wholesale_empty_orders_title')"
      :empty-description="$t('admin_customer_order_empty_desc')"
    >
      <template #id-cell="{ row }">
        <span
          class="text-primary-600 dark:text-primary-400 cursor-pointer font-mono text-xs hover:underline"
          @click="
            () => {
              navigateTo(`/admin/orders/${row.id}`)
            }
          "
          >#{{ String(row.id).slice(-6) }}</span
        >
      </template>
      <template #status-cell="{ row }">
        <BaseStatusBadge type="order" :status="row.status as string" />
      </template>
      <template #totalAmount-cell="{ row }">
        <span class="text-surface-foreground font-medium tabular-nums">{{
          formatVND(Number(row.totalAmount))
        }}</span>
      </template>
      <template #amountCollected-cell="{ row }">
        <span
          :class="[
            'tabular-nums',
            Number(row.amountCollected) > 0
              ? 'text-success-600 dark:text-success-400'
              : 'text-slate-400 dark:text-zinc-500'
          ]"
        >
          {{ formatVND(Number(row.amountCollected)) }}
        </span>
      </template>
      <template #createdAt-cell="{ row }">
        <span class="text-slate-500 dark:text-zinc-400">{{
          formatDate(row.createdAt as string)
        }}</span>
      </template>
    </BaseDataTable>
  </div>
</template>
