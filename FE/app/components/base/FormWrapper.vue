<script setup lang="ts" generic="T extends Record<string, unknown>">
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
import type { ZodTypeAny } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

interface Props {
  /** Zod schema để validate */
  schema: ZodTypeAny
  /** Reactive state của form */
  state: Partial<T>
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
  /** Hiển thị trạng thái loading */
  loading?: boolean
  /** Form layout class */
  formClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  submitLabel: 'Lưu',
  cancelLabel: 'Hủy',
  submitIcon: 'i-lucide-check',
  showCancel: true,
  disabled: false,
  loading: false,
  formClass: 'space-y-4'
})

const emit = defineEmits<{
  submit: [event: FormSubmitEvent<T>]
  cancel: []
}>()

const onSubmit = async (event: FormSubmitEvent<unknown>) => {
  if (props.loading) return
  emit('submit', event as unknown as FormSubmitEvent<T>)
}

const formRef = ref()

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

defineExpose({ setErrors, clearErrors })
</script>

<template>
  <UForm ref="formRef" :schema="schema" :state="state" :class="formClass" @submit="onSubmit">
    <!-- Form Fields Slot -->
    <slot />

    <!-- Actions -->
    <slot name="actions" :is-submitting="loading">
      <div class="flex items-center justify-end gap-3 pt-4">
        <UButton
          v-if="showCancel"
          :label="cancelLabel"
          color="neutral"
          variant="outline"
          :disabled="loading"
          @click="emit('cancel')"
        />
        <UButton
          type="submit"
          :label="submitLabel"
          :icon="submitIcon"
          :loading="loading"
          :disabled="disabled || loading"
        />
      </div>
    </slot>
  </UForm>
</template>
