<script setup lang="ts" generic="T">
interface Column {
  key: string
  label: string
  align?: 'left' | 'center' | 'right'
  width?: string
  sortable?: boolean
  fixed?: 'left' | 'right'
}
interface Props {
  columns: Column[]
  rows: T[]
  loading?: boolean
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  rowKey?: string
  emptyTitle?: string
  emptyDescription?: string
  emptyCtaText?: string
}
const props = withDefaults(defineProps<Props>(), {
  loading: false,
  rowKey: 'id',
})
const emit = defineEmits<{
  sort: [column: string]
  rowClick: [row: T]
  rowDblClick: [row: T]
  emptyAction: []
}>()
const { t } = useI18n()

const alignClass = (align?: string) => ({
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}[align || 'left'])

function getRowValue(row: Record<string, unknown>, key: string) {
  return key.split('.').reduce((obj, k) => obj?.[k], row as unknown as Record<string, unknown>)
}
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
    <div class="overflow-x-auto scrollbar-thin">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 sticky top-0 z-10">
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              :style="col.width ? { width: col.width } : {}"
              :class="[
                'px-4 py-3 font-semibold text-gray-600 whitespace-nowrap',
                alignClass(col.align),
                col.sortable ? 'cursor-pointer select-none hover:bg-gray-100' : '',
              ]"
              @click="col.sortable && emit('sort', col.key)"
            >
              <div :class="['flex items-center gap-1', col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start']">
                {{ col.label }}
                <template v-if="col.sortable && sortBy === col.key">
                  <svg v-if="sortDirection === 'asc'" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>
                  <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                </template>
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <template v-if="loading">
            <tr v-for="i in 8" :key="`skeleton-${i}`">
              <td v-for="col in columns" :key="col.key" class="px-4 py-3">
                <div class="skeleton h-4 w-full" />
              </td>
            </tr>
          </template>
          <template v-else-if="rows.length === 0">
            <tr>
              <td :colspan="columns.length" class="px-4">
                <AppEmptyState
                  :title="emptyTitle"
                  :description="emptyDescription"
                  :cta-text="emptyCtaText"
                  @action="emit('emptyAction')"
                />
              </td>
            </tr>
          </template>
          <tr
            v-for="(row, idx) in rows"
            v-else
            :key="getRowValue(row as unknown as Record<string, unknown>, rowKey) as string || idx"
            class="hover:bg-primary-50/50 transition-colors cursor-pointer"
            @click="emit('rowClick', row)"
            @dblclick="emit('rowDblClick', row)"
          >
            <td
              v-for="col in columns"
              :key="col.key"
              :class="['px-4 py-3 text-gray-700 whitespace-nowrap', alignClass(col.align)]"
            >
              <slot :name="`cell-${col.key}`" :row="row" :value="getRowValue(row as unknown as Record<string, unknown>, col.key)">
                {{ getRowValue(row as unknown as Record<string, unknown>, col.key) }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <slot name="pagination" />
  </div>
</template>
