<script setup lang="ts" generic="T extends Record<string, unknown>">
import { ChevronDown, ChevronUp, ChevronsUpDown, Inbox, Check } from 'lucide-vue-next'

interface Column {
  key: string
  label?: string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  width?: string
  hideOnMobile?: boolean
}

const props = withDefaults(defineProps<{
  columns: Column[]
  rows: T[]
  loading?: boolean
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  rowKey?: string
  emptyTitle?: string
  emptyDescription?: string
  emptyCtaText?: string
  zebra?: boolean
  stickyHeader?: boolean
  selectable?: boolean
  selectedKeys?: (string | number)[]
}>(), {
  loading: false,
  rowKey: 'id',
  zebra: false,
  stickyHeader: true,
  selectable: false,
  selectedKeys: () => [],
})

const emit = defineEmits<{
  sort: [column: string]
  rowClick: [row: T]
  rowDblClick: [row: T]
  emptyAction: []
  'update:selectedKeys': [keys: (string | number)[]]
}>()

const { t } = useI18n()

function getRowValue(row: T, key: string): unknown {
  return key.split('.').reduce<unknown>((obj, k) => {
    if (obj && typeof obj === 'object' && k in obj) return (obj as Record<string, unknown>)[k]
    return undefined
  }, row)
}

function getRowKey(row: T): string {
  return String(getRowValue(row, props.rowKey))
}

function onSort(col: Column) {
  if (!col.sortable) return
  emit('sort', col.key)
}

function onRowKeydown(e: KeyboardEvent, row: T) {
  if (e.key === 'Enter') {
    e.preventDefault()
    emit('rowClick', row)
  }
}

const alignClass: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

const mobileColumns = computed(() => props.columns.filter(c => !c.hideOnMobile))

const allSelected = computed(() => {
  return props.rows.length > 0 && props.rows.every(r => props.selectedKeys.includes(getRowKey(r)))
})

const someSelected = computed(() => {
  return props.selectedKeys.length > 0 && !allSelected.value
})

function toggleAll() {
  if (allSelected.value) {
    emit('update:selectedKeys', [])
  } else {
    emit('update:selectedKeys', props.rows.map(r => getRowKey(r)))
  }
}

function toggleRow(row: T) {
  const key = getRowKey(row)
  const current = [...props.selectedKeys]
  const idx = current.indexOf(key)
  if (idx >= 0) current.splice(idx, 1)
  else current.push(key)
  emit('update:selectedKeys', current)
}

function isRowSelected(row: T): boolean {
  return props.selectedKeys.includes(getRowKey(row))
}
</script>

<template>
  <div class="card overflow-hidden">
    <!-- Desktop table -->
    <div class="hidden sm:block overflow-x-auto scrollbar-thin">
      <table class="w-full">
        <thead>
          <tr :class="[
            'border-b border-surface-border bg-surface-muted/50',
            stickyHeader ? 'sticky top-0 z-10' : '',
          ]">
            <th v-if="selectable" class="w-10 px-4 py-3.5">
              <button
                class="w-4 h-4 rounded border-2 transition-all flex items-center justify-center"
                :class="allSelected ? 'bg-primary-600 border-primary-600' : someSelected ? 'bg-primary-600 border-primary-600' : 'border-slate-300 dark:border-zinc-600 hover:border-primary-500'"
                :aria-checked="allSelected"
                role="checkbox"
                :aria-label="allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'"
                @click="toggleAll"
              >
                <Check v-if="allSelected || someSelected" class="w-3 h-3 text-white" aria-hidden="true" />
              </button>
            </th>
            <th
              v-for="col in columns"
              :key="col.key"
              :style="col.width ? { width: col.width } : {}"
              :class="[
                'px-4 py-3.5 text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider whitespace-nowrap',
                alignClass[col.align || 'left'],
                col.sortable ? 'cursor-pointer hover:text-surface-foreground select-none transition-colors' : '',
              ]"
              :aria-sort="sortBy === col.key ? (sortDirection === 'asc' ? 'ascending' : 'descending') : (col.sortable ? 'none' : undefined)"
              :tabindex="col.sortable ? 0 : undefined"
              :role="col.sortable ? 'button' : undefined"
              @click="col.sortable ? onSort(col) : undefined"
              @keydown.enter="col.sortable ? onSort(col) : undefined"
            >
              <div class="flex items-center gap-1" :class="col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'">
                <span>{{ col.label }}</span>
                <component
                  :is="sortBy === col.key ? (sortDirection === 'asc' ? ChevronUp : ChevronDown) : (col.sortable ? ChevronsUpDown : null)"
                  v-if="col.sortable || sortBy === col.key"
                  class="w-3.5 h-3.5"
                  :class="sortBy === col.key ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-zinc-500'"
                  aria-hidden="true"
                />
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-border">
          <template v-if="loading">
            <tr v-for="i in 8" :key="`skeleton-${i}`" :class="zebra && i % 2 === 0 ? 'bg-surface-muted/20' : ''">
              <td v-if="selectable" class="px-4 py-4"><AppSkeleton height="h-4" width="w-4" /></td>
              <td v-for="col in columns" :key="col.key" class="px-4 py-4">
                <AppSkeleton height="h-4" />
              </td>
            </tr>
          </template>
          <tr v-else-if="rows.length === 0">
            <td :colspan="columns.length + (selectable ? 1 : 0)" class="px-4 py-16">
              <div class="flex flex-col items-center justify-center text-center max-w-sm mx-auto">
                <div class="w-14 h-14 rounded-2xl bg-surface-hover flex items-center justify-center mb-3">
                  <Inbox class="w-7 h-7 text-slate-400 dark:text-zinc-500" aria-hidden="true" />
                </div>
                <p class="text-sm font-medium text-surface-foreground">{{ emptyTitle || t('common.noData') }}</p>
                <p v-if="emptyDescription" class="text-sm text-slate-500 dark:text-zinc-400 mt-1">{{ emptyDescription }}</p>
                <button
                  v-if="emptyCtaText"
                  type="button"
                  class="mt-4 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors px-3.5 py-2 rounded-lg border border-primary-200 dark:border-primary-900/40 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                  @click="emit('emptyAction')"
                >{{ emptyCtaText }}</button>
              </div>
            </td>
          </tr>
          <template v-else>
            <tr
              v-for="(row, ri) in rows"
              :key="getRowKey(row)"
              :class="[
                'table-row-hover cursor-pointer outline-none',
                zebra && ri % 2 === 1 ? 'bg-surface-muted/20' : '',
                isRowSelected(row) ? 'bg-primary-50/50 dark:bg-primary-900/10' : '',
              ]"
              tabindex="0"
              role="button"
              @click="emit('rowClick', row)"
              @dblclick="emit('rowDblClick', row)"
              @keydown.enter="onRowKeydown($event, row)"
            >
              <td v-if="selectable" class="px-4 py-4" @click.stop>
                <button
                  class="w-4 h-4 rounded border-2 transition-all flex items-center justify-center"
                  :class="isRowSelected(row) ? 'bg-primary-600 border-primary-600' : 'border-slate-300 dark:border-zinc-600 hover:border-primary-500'"
                  :aria-checked="isRowSelected(row)"
                  role="checkbox"
                  :aria-label="`Chọn dòng ${ri + 1}`"
                  @click="toggleRow(row)"
                >
                  <Check v-if="isRowSelected(row)" class="w-3 h-3 text-white" aria-hidden="true" />
                </button>
              </td>
              <td
                v-for="col in columns"
                :key="col.key"
                :class="['px-4 py-3.5 text-sm text-surface-foreground', alignClass[col.align || 'left']]"
              >
                <slot :name="`cell-${col.key}`" :row="row" :value="getRowValue(row, col.key)">
                  {{ getRowValue(row, col.key) }}
                </slot>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Mobile card list -->
    <div class="sm:hidden divide-y divide-surface-border">
      <template v-if="loading">
        <div v-for="i in 5" :key="`m-skeleton-${i}`" class="p-4 space-y-2">
          <AppSkeleton height="h-4" width="w-2/3" />
          <AppSkeleton height="h-3" width="w-1/2" />
          <AppSkeleton height="h-3" width="w-1/3" />
        </div>
      </template>
      <div v-else-if="rows.length === 0" class="px-4 py-16">
        <div class="flex flex-col items-center justify-center text-center max-w-sm mx-auto">
          <div class="w-14 h-14 rounded-2xl bg-surface-hover flex items-center justify-center mb-3">
            <Inbox class="w-7 h-7 text-slate-400 dark:text-zinc-500" aria-hidden="true" />
          </div>
          <p class="text-sm font-medium text-surface-foreground">{{ emptyTitle || t('common.noData') }}</p>
          <p v-if="emptyDescription" class="text-sm text-slate-500 dark:text-zinc-400 mt-1">{{ emptyDescription }}</p>
          <button
            v-if="emptyCtaText"
            type="button"
            class="mt-4 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors px-3.5 py-2 rounded-lg border border-primary-200 dark:border-primary-900/40 hover:bg-primary-50 dark:hover:bg-primary-900/20"
            @click="emit('emptyAction')"
          >{{ emptyCtaText }}</button>
        </div>
      </div>
      <template v-else>
        <div
          v-for="row in rows"
          :key="getRowKey(row)"
          class="p-4 active:bg-surface-hover/80 transition-colors duration-150 cursor-pointer outline-none"
          role="button"
          tabindex="0"
          @click="emit('rowClick', row)"
          @keydown.enter="onRowKeydown($event, row)"
        >
          <slot name="mobile-row" :row="row">
            <div class="space-y-1.5">
              <div
                v-for="col in mobileColumns.filter(c => c.key !== 'actions' && c.key !== 'select')"
                :key="col.key"
                class="flex items-center justify-between gap-2"
              >
                <span class="text-xs text-slate-500 dark:text-zinc-400 flex-shrink-0">{{ col.label }}</span>
                <span class="text-sm text-surface-foreground text-right min-w-0">
                  <slot :name="`cell-${col.key}`" :row="row" :value="getRowValue(row, col.key)">
                    {{ getRowValue(row, col.key) }}
                  </slot>
                </span>
              </div>
              <div v-if="$slots['cell-actions']" class="flex items-center justify-end gap-1 pt-2">
                <slot name="cell-actions" :row="row" />
              </div>
            </div>
          </slot>
        </div>
      </template>
    </div>

    <div v-if="$slots.pagination" class="px-4 py-3.5 border-t border-surface-border bg-surface-muted/30">
      <slot name="pagination" />
    </div>
  </div>
</template>
