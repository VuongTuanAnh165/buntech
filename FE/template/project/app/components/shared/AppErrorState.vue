<script setup lang="ts">
import { AlertCircle, RefreshCw } from 'lucide-vue-next'

withDefaults(defineProps<{
  message?: string
}>(), {
  message: '',
})

const emit = defineEmits<{ retry: [] }>()
const { t } = useI18n()
</script>

<template>
  <div role="alert" class="flex flex-col items-center justify-center text-center max-w-sm mx-auto py-16">
    <div class="relative mb-5">
      <div class="w-16 h-16 rounded-2xl bg-danger-100 dark:bg-danger-900/30 flex items-center justify-center shadow-sm">
        <AlertCircle class="w-8 h-8 text-danger-600 dark:text-danger-400" aria-hidden="true" />
      </div>
    </div>
    <p class="text-base font-semibold text-surface-foreground">{{ message || t('errors.loadFailed') }}</p>
    <p class="text-sm text-slate-500 dark:text-zinc-400 mt-1.5">{{ t('errors.tryAgain') || 'Vui lòng thử lại sau ít phút' }}</p>
    <button
      type="button"
      class="mt-6 inline-flex items-center gap-2 text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 px-4 py-2.5 rounded-lg min-h-[44px] active:scale-95 transition-all shadow-sm shadow-primary-600/10"
      @click="emit('retry')"
    >
      <RefreshCw class="w-4 h-4" aria-hidden="true" />
      {{ t('common.retry') }}
    </button>
  </div>
</template>
