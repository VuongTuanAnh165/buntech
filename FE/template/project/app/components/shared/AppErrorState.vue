<script setup lang="ts">
interface Props {
  message?: string
  onRetry?: () => void
}
const props = withDefaults(defineProps<Props>(), {})
const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
    <svg class="w-16 h-16 text-danger-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4a2 2 0 00-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
    </svg>
    <p class="text-sm text-gray-600 mb-4">{{ message || t('errors.loadFailed') }}</p>
    <button
      v-if="onRetry"
      class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
      @click="onRetry"
    >
      {{ t('errors.tryAgain') }}
    </button>
  </div>
</template>
