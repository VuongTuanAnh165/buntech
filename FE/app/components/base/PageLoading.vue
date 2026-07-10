<script setup lang="ts">
/**
 * Component loading cho page — hiển thị khi đang fetch dữ liệu.
 *
 * @example
 * <BasePageLoading />
 * <BasePageLoading text="Đang tải đơn hàng..." />
 * <BasePageLoading :skeleton="true" />
 */

interface Props {
  /** Văn bản hiển thị bên dưới spinner */
  text?: string
  /** Hiển thị skeleton thay vì spinner */
  skeleton?: boolean
  /** Chiều cao tối thiểu */
  minHeight?: string
}

withDefaults(defineProps<Props>(), {
  text: 'Đang tải dữ liệu...',
  skeleton: false,
  minHeight: '200px'
})
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12" :style="{ minHeight }">
    <!-- Skeleton Mode -->
    <template v-if="skeleton">
      <div class="w-full space-y-4 px-4">
        <USkeleton class="h-8 w-1/3" />
        <USkeleton class="h-4 w-full" />
        <USkeleton class="h-4 w-full" />
        <USkeleton class="h-4 w-2/3" />
        <div class="flex gap-4 pt-2">
          <USkeleton class="h-10 w-1/4" />
          <USkeleton class="h-10 w-1/4" />
        </div>
      </div>
    </template>

    <!-- Spinner Mode -->
    <template v-else>
      <div class="relative mb-4">
        <UIcon name="i-lucide-loader-circle" class="text-primary size-10 animate-spin" />
      </div>
      <p class="text-muted text-sm">{{ text }}</p>
    </template>
  </div>
</template>
