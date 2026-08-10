<script setup lang="ts">
import type { Order } from '~/utils/types'
defineProps<{
  orders: Order[]
}>()
</script>
<template>
  <div class="animate-fade-in-up">
    <BaseDataTable
      :columns="[
        { accessorKey: 'id', header: 'Mã đơn' },
        { accessorKey: 'status', header: 'Trạng thái' },
        { accessorKey: 'total', header: 'Tổng tiền', class: 'text-right' },
        { accessorKey: 'amount_collected', header: 'Đã thu', class: 'text-right' },
        { accessorKey: 'created_at', header: 'Ngày đặt' }
      ]"
      :rows="orders as unknown as Record<string, unknown>[]"
      empty-title="Chưa có đơn hàng"
      empty-description="Khách hàng này chưa đặt đơn hàng nào"
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
      <template #total-cell="{ row }">
        <span class="text-surface-foreground font-medium tabular-nums">{{
          formatVND(Number(row.total))
        }}</span>
      </template>
      <template #amount_collected-cell="{ row }">
        <span
          :class="[
            'tabular-nums',
            Number(row.amount_collected) > 0
              ? 'text-success-600 dark:text-success-400'
              : 'text-slate-400 dark:text-zinc-500'
          ]"
        >
          {{ formatVND(Number(row.amount_collected)) }}
        </span>
      </template>
      <template #created_at-cell="{ row }">
        <span class="text-slate-500 dark:text-zinc-400">{{
          formatDate(row.created_at as string)
        }}</span>
      </template>
    </BaseDataTable>
  </div>
</template>
