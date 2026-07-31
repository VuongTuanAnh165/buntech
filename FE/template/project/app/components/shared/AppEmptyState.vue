<script setup lang="ts">
interface Props {
  title?: string
  description?: string
  ctaText?: string
}
const props = withDefaults(defineProps<Props>(), {
  title: '',
  description: '',
  ctaText: '',
})
defineEmits<{ action: [] }>()
const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
    <svg class="w-24 h-24 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
    <h3 class="text-lg font-semibold text-gray-700 mb-1">{{ title || t('common.noData') }}</h3>
    <p v-if="description" class="text-sm text-gray-500 mb-4">{{ description }}</p>
    <button
      v-if="ctaText"
      class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
      @click="$emit('action')"
    >
      {{ ctaText }}
    </button>
  </div>
</template>
