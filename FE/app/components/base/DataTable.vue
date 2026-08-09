<script setup lang="ts">
interface Column {
  key: string
  label: string
  sortable?: boolean
  class?: string
}

interface Props {
  columns: Column[]
  rows: Record<string, unknown>[]
  loading?: boolean
  loadingLines?: number
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  loadingLines: 5,
  emptyTitle: 'Không có dữ liệu',
  emptyDescription: 'Chưa có dữ liệu nào được tìm thấy.',
  emptyIcon: 'i-lucide-inbox'
})

const mappedColumns = computed(() => {
  return props.columns.map((col) => ({
    accessorKey: col.key,
    header: col.label,
    ...col
  }))
})
</script>

<template>
  <div>
    <!-- Loading state -->
    <BasePageLoading v-if="props.loading" variant="table" :lines="props.loadingLines" />

    <!-- Data table -->
    <template v-else-if="props.rows.length">
      <UTable :columns="mappedColumns" :data="props.rows">
        <!-- Forward all column slots -->
        <template v-for="col in props.columns" :key="col.key" #[`${col.key}-cell`]="{ row }">
          <slot :name="`${col.key}-cell`" :row="row.original ? row.original : row">
            {{ row.original ? row.original[col.key] : row[col.key] }}
          </slot>
        </template>
      </UTable>
      <slot name="pagination" />
    </template>

    <!-- Empty state -->
    <BaseEmptyState
      v-else
      :icon="props.emptyIcon"
      :title="props.emptyTitle"
      :description="props.emptyDescription"
    >
      <template #action>
        <slot name="empty-action" />
      </template>
    </BaseEmptyState>
  </div>
</template>
