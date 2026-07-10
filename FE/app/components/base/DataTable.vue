<script setup lang="ts">
/**
 * DataTable — Bọc UTable + Pagination + Empty + Loading.
 * Component chuẩn cho tất cả trang danh sách trong Admin.
 *
 * @example
 * <BaseDataTable
 *   :data="customers"
 *   :columns="columns"
 *   :loading="status === 'pending'"
 *   :total="pagination.total"
 *   :page="pagination.page"
 *   :page-size="pagination.pageSize"
 *   empty-title="Chưa có khách hàng"
 *   empty-icon="i-lucide-users"
 *   @update:page="goToPage"
 * >
 *   <template #toolbar>
 *     <BaseSearchInput v-model="search" />
 *   </template>
 * </BaseDataTable>
 */
import type { TableColumn } from '@nuxt/ui'

interface Props {
  /** Dữ liệu hiển thị */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[]
  /** Cấu hình cột */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: TableColumn<any>[]
  /** Trạng thái loading */
  loading?: boolean
  /** Tổng số bản ghi (cho pagination) */
  total?: number
  /** Trang hiện tại (1-indexed) */
  page?: number
  /** Số bản ghi mỗi trang */
  pageSize?: number
  /** Tiêu đề empty state */
  emptyTitle?: string
  /** Mô tả empty state */
  emptyDescription?: string
  /** Icon empty state */
  emptyIcon?: string
  /** Có hiển thị pagination không */
  showPagination?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  total: 0,
  page: 1,
  pageSize: 20,
  emptyTitle: 'Không có dữ liệu',
  emptyDescription: undefined,
  emptyIcon: 'i-lucide-inbox',
  showPagination: true
})

const emit = defineEmits<{
  'update:page': [page: number]
}>()

/** Hiển thị khoảng bản ghi: "1 - 20 trên 100" */
const rangeText = computed(() => {
  if (props.total === 0) return ''
  const from = (props.page - 1) * props.pageSize + 1
  const to = Math.min(props.page * props.pageSize, props.total)
  return `${from} - ${to} trên ${props.total}`
})

const hasPagination = computed(() => {
  return props.showPagination && props.total > props.pageSize
})
</script>

<template>
  <div class="flex flex-col">
    <!-- Toolbar Slot (Search, Filters...) -->
    <div
      v-if="$slots.toolbar"
      class="border-default flex flex-wrap items-center gap-3 border-b px-4 py-3"
    >
      <slot name="toolbar" />
    </div>

    <!-- Loading State -->
    <BasePageLoading v-if="loading" :skeleton="true" />

    <!-- Empty State -->
    <template v-else-if="!data || data.length === 0">
      <BaseEmptyState :icon="emptyIcon" :title="emptyTitle" :description="emptyDescription">
        <template v-if="$slots['empty-action']" #action>
          <slot name="empty-action" />
        </template>
      </BaseEmptyState>
    </template>

    <!-- Table -->
    <template v-else>
      <UTable :data="data" :columns="columns">
        <!-- Forward tất cả slot custom column -->
        <template v-for="(_, slotName) in $slots" :key="slotName" #[slotName]="slotData">
          <slot :name="slotName" v-bind="slotData || {}" />
        </template>
      </UTable>
    </template>

    <!-- Pagination -->
    <div
      v-if="hasPagination && !loading"
      class="border-default flex items-center justify-between border-t px-4 py-3"
    >
      <span class="text-muted text-sm">{{ rangeText }}</span>
      <UPagination
        :page="page"
        :items-per-page="pageSize"
        :total="total"
        @update:page="(p: number) => emit('update:page', p)"
      />
    </div>
  </div>
</template>
