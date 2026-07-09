<script setup lang="ts">
/**
 * Trang hiển thị lỗi — 404, 403, 500...
 * Hiển thị thay vì trang trắng khi có lỗi xảy ra.
 */
interface Props {
  error: {
    statusCode: number
    statusMessage?: string
    message?: string
  }
}

const props = defineProps<Props>()

const errorConfig: Record<number, { title: string; description: string; icon: string }> = {
  404: {
    title: 'Không tìm thấy trang',
    description: 'Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.',
    icon: 'i-lucide-search-x'
  },
  403: {
    title: 'Không có quyền truy cập',
    description: 'Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên.',
    icon: 'i-lucide-shield-x'
  },
  500: {
    title: 'Lỗi máy chủ',
    description: 'Đã có lỗi xảy ra phía máy chủ. Vui lòng thử lại sau.',
    icon: 'i-lucide-server-crash'
  }
}

const config = computed(() => {
  return (
    errorConfig[props.error.statusCode] || {
      title: 'Đã xảy ra lỗi',
      description: props.error.statusMessage || props.error.message || 'Vui lòng thử lại sau.',
      icon: 'i-lucide-alert-circle'
    }
  )
})

const handleGoHome = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="bg-default flex min-h-dvh items-center justify-center p-4">
    <div class="flex flex-col items-center text-center">
      <!-- Error Code -->
      <p class="text-primary mb-4 text-7xl font-bold opacity-20">
        {{ error.statusCode }}
      </p>

      <!-- Icon -->
      <div class="bg-error/10 mb-4 flex size-16 items-center justify-center rounded-full">
        <UIcon :name="config.icon" class="text-error size-8" />
      </div>

      <!-- Message -->
      <h1 class="text-highlighted mb-2 text-2xl font-bold">{{ config.title }}</h1>
      <p class="text-muted mb-8 max-w-md text-sm">{{ config.description }}</p>

      <!-- Actions -->
      <div class="flex gap-3">
        <UButton label="Quay về trang chủ" icon="i-lucide-home" @click="handleGoHome" />
        <UButton
          label="Thử lại"
          icon="i-lucide-refresh-cw"
          color="neutral"
          variant="outline"
          @click="clearError()"
        />
      </div>
    </div>
  </div>
</template>
