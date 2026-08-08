<script setup lang="ts">
import type { ZodSchema } from 'zod'

interface Props {
  schema?: ZodSchema
  state: Record<string, unknown>
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  schema: undefined,
  loading: false
})

const emit = defineEmits<{ submit: [data: Record<string, unknown>] }>()

const formRef = ref()

const onSubmit = () => {
  emit('submit', props.state)
}

defineExpose({ formRef })
</script>

<template>
  <UForm
    ref="formRef"
    :schema="props.schema"
    :state="props.state"
    class="space-y-4"
    @submit="onSubmit"
  >
    <slot />

    <slot name="actions">
      <div class="flex items-center justify-end gap-3 pt-2">
        <slot name="cancel" />
        <UButton
          type="submit"
          :loading="props.loading"
          size="lg"
        >
          <slot name="submit-text">
            Lưu
          </slot>
        </UButton>
      </div>
    </slot>
  </UForm>
</template>
