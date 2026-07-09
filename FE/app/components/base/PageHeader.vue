<script setup lang="ts">
/**
 * Component tiêu đề trang — dùng đầu mọi trang Admin.
 * Hiển thị title, description, breadcrumbs và actions (slot).
 */
import type { BreadcrumbItem } from '@nuxt/ui'

interface Props {
  /** Tiêu đề trang */
  title: string
  /** Mô tả ngắn (tùy chọn) */
  description?: string
  /** Danh sách breadcrumb items */
  breadcrumbs?: BreadcrumbItem[]
}

withDefaults(defineProps<Props>(), {
  description: undefined,
  breadcrumbs: undefined
})
</script>

<template>
  <div class="mb-6 flex flex-col gap-4">
    <!-- Breadcrumbs -->
    <UBreadcrumb v-if="breadcrumbs?.length" :items="breadcrumbs" />

    <!-- Title + Actions -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-highlighted text-2xl font-bold">{{ title }}</h1>
        <p v-if="description" class="text-muted mt-1 text-sm">{{ description }}</p>
      </div>

      <!-- Actions Slot (nút Thêm mới, Export...) -->
      <div v-if="$slots.actions" class="flex shrink-0 items-center gap-2">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>
