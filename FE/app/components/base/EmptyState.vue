<script setup lang="ts">
/**
 * Component trạng thái trống — hiển thị khi không có dữ liệu.
 * Dùng trong table, danh sách, search kết quả trống.
 *
 * @example
 * <BaseEmptyState
 *   icon="i-lucide-users"
 *   title="Chưa có khách hàng nào"
 *   description="Thêm khách hàng đầu tiên để bắt đầu."
 * >
 *   <template #action>
 *     <UButton label="Thêm khách hàng" icon="i-lucide-plus" />
 *   </template>
 * </BaseEmptyState>
 */

interface Props {
  /** Icon hiển thị (Lucide icon name) */
  icon?: string
  /** Tiêu đề chính */
  title?: string
  /** Mô tả phụ */
  description?: string
}

withDefaults(defineProps<Props>(), {
  icon: 'i-lucide-inbox',
  title: 'Không có dữ liệu',
  description: undefined
})
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <div class="bg-muted mb-4 flex size-16 items-center justify-center rounded-full">
      <UIcon :name="icon" class="text-dimmed size-8" />
    </div>
    <h3 class="text-highlighted mb-1 text-base font-semibold">{{ title }}</h3>
    <p v-if="description" class="text-muted mb-4 max-w-sm text-sm">{{ description }}</p>
    <slot name="action" />
  </div>
</template>
