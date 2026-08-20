<script setup lang="ts" generic="T extends Record<string, any>">
interface Column {
  key?: string
  label?: string
  accessorKey?: string
  header?: string
  sortable?: boolean
  class?: string
}

interface Props {
  columns: Column[]
  rows: T[]
  loading?: boolean
  loadingLines?: number
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  loadingLines: 5,
  emptyTitle: undefined,
  emptyDescription: undefined,
  emptyIcon: 'i-lucide-inbox'
})

defineSlots<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: (props: { row: T; column: any }) => any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pagination: () => any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  'empty-action': () => any
}>()

const mappedColumns = computed(() => {
  return props.columns.map((col) => {
    const finalKey = col.key || col.accessorKey || ''
    const finalLabel = col.label || col.header || ''
    return {
      accessorKey: finalKey,
      header: finalLabel,
      key: finalKey,
      label: finalLabel,
      ...col
    }
  })
})
</script>

<template>
  <div class="w-full">
    <!-- Data table wrapper for responsive scroll -->
    <div class="scrollbar-hide overflow-x-auto">
      <UTable
        :columns="mappedColumns"
        :data="props.rows"
        :loading="props.loading"
        class="min-w-full"
      >
        <!-- Forward all column slots -->
        <template
          v-for="col in mappedColumns"
          :key="col.key"
          #[`${col.key}-cell`]="{ row, column }"
        >
          <slot
            :name="`${col.key}-cell`"
            :row="(row.original ? row.original : row) as T"
            :column="column"
          >
            <!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -->
            {{ row.original ? (row.original as any)[col.key] : (row as any)[col.key] }}
          </slot>
        </template>

        <template #empty>
          <BaseEmptyState
            :icon="props.emptyIcon"
            :title="props.emptyTitle || $t('not_found')"
            :description="props.emptyDescription || $t('empty_description')"
          >
            <template #action>
              <slot name="empty-action" />
            </template>
          </BaseEmptyState>
        </template>
      </UTable>
    </div>

    <slot v-if="props.rows.length" name="pagination" />
  </div>
</template>
