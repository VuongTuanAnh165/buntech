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

const errorConfig: Record<
  number,
  { title: string; description: string; icon: string; color: 'primary' | 'warning' | 'error' }
> = {
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
  <div
    class="bg-surface-muted relative flex min-h-screen items-center justify-center overflow-hidden p-4"
  >
    <!-- Animated background -->
    <div
      class="pointer-events-none absolute inset-0 transition-transform duration-1000 ease-out"
      :style="{ transform: `translate(${mouseX * -20}px, ${mouseY * -20}px)` }"
    >
      <div
        class="bg-primary-500/10 animate-pulse-soft absolute top-1/4 left-1/4 h-96 w-96 rounded-full opacity-70 mix-blend-multiply blur-3xl filter"
      />
      <div
        class="bg-secondary-500/10 animate-pulse-soft absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full opacity-70 mix-blend-multiply blur-3xl filter"
        style="animation-delay: 2s"
      />
      <div
        class="bg-error-500/10 animate-pulse-soft absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 mix-blend-multiply blur-3xl filter"
        style="animation-delay: 4s"
      />
    </div>

    <div
      class="card glass animate-fade-in-up relative z-10 w-full max-w-lg border border-white/20 p-10 text-center shadow-xl sm:p-14 dark:border-white/5"
    >
      <!-- Error Code -->
      <div class="relative mb-8 inline-block">
        <h1
          class="from-primary-400 to-primary-600 dark:from-primary-300 dark:to-primary-500 bg-gradient-to-br bg-clip-text text-8xl font-black text-transparent opacity-20 select-none sm:text-9xl"
        >
          {{ error.statusCode }}
        </h1>
        <div class="absolute inset-0 flex items-center justify-center">
          <div
            class="dark:bg-surface flex h-20 w-20 rotate-3 transform items-center justify-center rounded-3xl bg-white shadow-lg transition-transform duration-300 hover:rotate-0 sm:h-24 sm:w-24"
          >
            <UIcon
              :name="config.icon"
              :class="['text- h-10 w-10 sm:h-12 sm:w-12' + config.color + '-500']"
            />
          </div>
        </div>
      </div>

      <!-- Message -->
      <h2 class="text-surface-foreground mb-3 text-2xl font-bold tracking-tight sm:text-3xl">
        {{ config.title }}
      </h2>
      <p class="mx-auto mb-8 max-w-md text-sm text-slate-500 sm:text-base dark:text-zinc-400">
        {{ config.description }}
      </p>

      <!-- Actions -->
      <div class="flex flex-col justify-center gap-3 sm:flex-row">
        <UButton size="lg" icon="i-lucide-home" class="w-full sm:w-auto" @click="handleGoHome">
          Quay về trang chủ
        </UButton>
        <UButton
          size="lg"
          icon="i-lucide-refresh-cw"
          color="neutral"
          variant="outline"
          class="group w-full sm:w-auto"
          @click="clearError()"
        >
          <template #leading>
            <UIcon
              name="i-lucide-refresh-cw"
              class="h-5 w-5 transition-transform duration-500 group-hover:rotate-180"
            />
          </template>
          Thử lại
        </UButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes pulse-soft {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.5;
  }
}
.animate-pulse-soft {
  animation: pulse-soft 6s infinite ease-in-out;
}
</style>
