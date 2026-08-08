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

const errorConfig: Record<number, { title: string; description: string; icon: string; color: 'primary' | 'warning' | 'error' }> = {
  404: {
    title: 'Không tìm thấy trang',
    description: 'Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.',
    icon: 'i-lucide-search-x',
    color: 'warning'
  },
  403: {
    title: 'Không có quyền truy cập',
    description: 'Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên.',
    icon: 'i-lucide-shield-x',
    color: 'error'
  },
  500: {
    title: 'Lỗi máy chủ',
    description: 'Đã có lỗi xảy ra phía máy chủ. Vui lòng thử lại sau.',
    icon: 'i-lucide-server-crash',
    color: 'error'
  }
}

const config = computed(() => {
  return (
    errorConfig[props.error.statusCode] || {
      title: 'Đã xảy ra lỗi',
      description: props.error.statusMessage || props.error.message || 'Vui lòng thử lại sau.',
      icon: 'i-lucide-alert-circle',
      color: 'primary'
    }
  )
})

const handleGoHome = () => clearError({ redirect: '/' })

// Mouse parallax effect for background blobs
const mouseX = ref(0)
const mouseY = ref(0)
onMounted(() => {
  window.addEventListener('mousemove', (e) => {
    mouseX.value = e.clientX / window.innerWidth - 0.5
    mouseY.value = e.clientY / window.innerHeight - 0.5
  })
})
</script>

<template>
  <div class="min-h-screen bg-surface-muted flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Animated background -->
    <div 
      class="absolute inset-0 pointer-events-none transition-transform duration-1000 ease-out"
      :style="{ transform: `translate(${mouseX * -20}px, ${mouseY * -20}px)` }"
    >
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse-soft" />
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse-soft" style="animation-delay: 2s" />
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-error-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse-soft" style="animation-delay: 4s" />
    </div>

    <div class="card p-10 sm:p-14 max-w-lg w-full text-center relative z-10 glass shadow-xl border border-white/20 dark:border-white/5 animate-fade-in-up">
      <!-- Error Code -->
      <div class="relative mb-8 inline-block">
        <h1 class="text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary-400 to-primary-600 dark:from-primary-300 dark:to-primary-500 opacity-20 select-none">
          {{ error.statusCode }}
        </h1>
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white dark:bg-surface flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <UIcon :name="config.icon" :class="['w-10 h-10 sm:w-12 sm:h-12 text-' + config.color + '-500']" />
          </div>
        </div>
      </div>

      <!-- Message -->
      <h2 class="text-2xl sm:text-3xl font-bold text-surface-foreground tracking-tight mb-3">{{ config.title }}</h2>
      <p class="text-sm sm:text-base text-slate-500 dark:text-zinc-400 mb-8 max-w-md mx-auto">{{ config.description }}</p>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <UButton size="lg" icon="i-lucide-home" @click="handleGoHome" class="w-full sm:w-auto">
          Quay về trang chủ
        </UButton>
        <UButton
          size="lg"
          icon="i-lucide-refresh-cw"
          color="neutral"
          variant="outline"
          @click="clearError()"
          class="w-full sm:w-auto group"
        >
          <template #leading>
            <UIcon name="i-lucide-refresh-cw" class="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
          </template>
          Thử lại
        </UButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes pulse-soft {
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.05); opacity: 0.5; }
}
.animate-pulse-soft {
  animation: pulse-soft 6s infinite ease-in-out;
}
</style>
