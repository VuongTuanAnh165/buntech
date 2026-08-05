<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary' | 'warning'
  loading?: boolean
}>(), {
  modelValue: false,
  variant: 'danger',
  loading: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

const { t } = useI18n()

function onConfirm() {
  emit('confirm')
}
function onCancel() {
  emit('update:modelValue', false)
  emit('cancel')
}

const iconColor = computed(() => {
  const map: Record<string, string> = {
    danger: 'bg-danger-50 text-danger-600 dark:bg-danger-900/30 dark:text-danger-400',
    primary: 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
    warning: 'bg-warning-50 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400',
  }
  return map[props.variant]
})

const btnVariant = computed(() => {
  const map: Record<string, string> = {
    danger: 'danger',
    primary: 'primary',
    warning: 'warning',
  }
  return map[props.variant]
})
</script>

<template>
  <AppModal
    :model-value="modelValue"
    :title="title"
    size="sm"
    mobile-sheet
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="flex gap-4">
      <div :class="['w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0', iconColor]">
        <AlertTriangle class="w-6 h-6" aria-hidden="true" />
      </div>
      <p class="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed pt-2">{{ message }}</p>
    </div>
    <template #footer>
      <div class="flex gap-3 justify-end">
        <AppButton variant="ghost" type="button" @click="onCancel">
          {{ cancelText || t('common.cancel') }}
        </AppButton>
        <AppButton :variant="btnVariant as 'danger'" type="button" :loading="loading" @click="onConfirm">
          {{ confirmText || t('common.confirm') }}
        </AppButton>
      </div>
    </template>
  </AppModal>
</template>
