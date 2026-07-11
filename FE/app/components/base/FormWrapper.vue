<script setup lang="ts">
/**
 * Form Wrapper — bọc chuẩn pattern UForm + Zod + Submit.
 *
 * Tích hợp:
 * - UForm validation với Zod schema
 * - Nút Submit + Cancel có loading state
 * - Chống double-click tự động
 *
 * @example
 * <BaseFormWrapper
 *   :schema="customerSchema"
 *   :state="formState"
 *   submit-label="Lưu khách hàng"
 *   @submit="handleSave"
 * >
 *   <UFormField name="fullName" label="Họ tên" required>
 *     <UInput v-model="formState.fullName" />
 *   </UFormField>
 * </BaseFormWrapper>
 */
import type { ZodType } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

interface Props {
  /** Zod schema để validate */
  schema: ZodType
  /** Reactive state của form */
  state: Record<string, unknown>
  /** Label nút Submit */
  submitLabel?: string
  /** Label nút Cancel (ẩn nếu không truyền) */
  cancelLabel?: string
  /** Icon nút Submit */
  submitIcon?: string
  /** Có hiển thị nút Cancel không */
  showCancel?: boolean
  /** Disabled toàn bộ form */
  disabled?: boolean
  /** Form layout class */
  formClass?: string
}

withDefaults(defineProps<Props>(), {
  submitLabel: 'Lưu',
  cancelLabel: 'Hủy',
  submitIcon: 'i-lucide-check',
  showCancel: true,
  disabled: false,
  formClass: 'space-y-4'
})

const emit = defineEmits<{
  submit: [data: FormSubmitEvent<unknown>]
  cancel: []
}>()

const isSubmitting = ref(false)

const onSubmit = async (event: FormSubmitEvent<unknown>) => {
  if (isSubmitting.value) return
  isSubmitting.value = true
  try {
    emit('submit', event)
  } finally {
    // Để component cha tự set isSubmitting = false khi API call xong
    // thông qua expose hoặc watch. Ở đây set timeout phòng trường hợp
    // component cha không xử lý.
    setTimeout(() => {
      isSubmitting.value = false
    }, 5000)
  }
}

const formRef = ref()

const stopSubmitting = () => {
  isSubmitting.value = false
}

const setErrors = (errors: { path: string; message: string }[]) => {
  if (formRef.value) {
    formRef.value.setErrors(errors)
  }
}

const clearErrors = () => {
  if (formRef.value) {
    formRef.value.clear()
  }
}

defineExpose({ isSubmitting, stopSubmitting, setErrors, clearErrors })
</script>

<template>
  <UForm ref="formRef" :schema="schema" :state="state" :class="formClass" @submit="onSubmit">
    <!-- Form Fields Slot -->
    <slot />

    <!-- Actions -->
    <slot name="actions" :is-submitting="isSubmitting">
      <div class="flex items-center justify-end gap-3 pt-4">
        <UButton
          v-if="showCancel"
          :label="cancelLabel"
          color="neutral"
          variant="outline"
          :disabled="isSubmitting"
          @click="emit('cancel')"
        />
        <UButton
          type="submit"
          :label="submitLabel"
          :icon="submitIcon"
          :loading="isSubmitting"
          :disabled="disabled || isSubmitting"
        />
      </div>
    </slot>
  </UForm>
</template>
