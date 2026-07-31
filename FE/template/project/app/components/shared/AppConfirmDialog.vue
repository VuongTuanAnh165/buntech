<script setup lang="ts">
interface Props {
  modelValue: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary' | 'warning'
}
const props = withDefaults(defineProps<Props>(), {
  variant: 'danger',
})
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()
const { t } = useI18n()
function confirm() {
  emit('confirm')
  emit('update:modelValue', false)
}
function cancel() {
  emit('cancel')
  emit('update:modelValue', false)
}
const variantClass = computed(() => ({
  danger: 'bg-danger-600 hover:bg-danger-700',
  primary: 'bg-primary-600 hover:bg-primary-700',
  warning: 'bg-warning-500 hover:bg-warning-600',
}[props.variant]))
</script>

<template>
  <AppModal :model-value="modelValue" :title="title" size="sm" @update:model-value="emit('update:modelValue', $event)">
    <p class="text-gray-600">{{ message }}</p>
    <template #footer>
      <button class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" @click="cancel">
        {{ cancelText || t('common.cancel') }}
      </button>
      <button :class="['px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors', variantClass]" @click="confirm">
        {{ confirmText || t('common.confirm') }}
      </button>
    </template>
  </AppModal>
</template>
