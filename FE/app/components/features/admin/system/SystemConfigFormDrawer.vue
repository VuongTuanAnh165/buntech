<script setup lang="ts">
import { z } from 'zod'
import type { SystemConfig } from '~/utils/types'
import type { FormSubmitEvent } from '#ui/types'

const props = defineProps<{
  open: boolean
  config: SystemConfig | null
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [data: { key: string; value: string; description?: string }]
}>()

const isOpen = computed({
  get: () => props.open,
  set: (val) => emit('update:open', val)
})

const isEdit = computed(() => !!props.config)

const schema = z.object({
  key: z
    .string()
    .min(1, 'Key không được để trống')
    .regex(/^[a-z0-9_]+$/, 'Key chỉ được chứa chữ cái viết thường, số và dấu gạch dưới'),
  value: z.string().min(1, 'Giá trị không được để trống'),
  description: z.string().optional()
})

type Schema = z.infer<typeof schema>

const state = reactive<Schema>({
  key: '',
  value: '',
  description: ''
})

watch(
  () => props.open,
  (val) => {
    if (val) {
      if (props.config) {
        state.key = props.config.key
        state.value = props.config.value || ''
        state.description = props.config.description || ''
      } else {
        state.key = ''
        state.value = ''
        state.description = ''
      }
    }
  }
)

async function onSubmit(event: FormSubmitEvent<Schema>) {
  emit('save', event.data)
}
</script>

<template>
  <USlideover v-model:open="isOpen" :title="isEdit ? 'Chỉnh sửa cấu hình' : 'Thêm cấu hình mới'">
    <template #body>
      <UForm id="config-form" :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
        <UFormField label="Mã cấu hình (Key)" name="key" required>
          <template #description>
            Chỉ chứa chữ cái thường, số và dấu gạch dưới. Ví dụ: <code>freeship_threshold</code>
          </template>
          <UInput v-model="state.key" placeholder="Nhập mã cấu hình..." :disabled="isEdit" />
        </UFormField>

        <UFormField label="Giá trị (Value)" name="value" required>
          <UTextarea v-model="state.value" :rows="4" placeholder="Nhập giá trị..." />
        </UFormField>

        <UFormField label="Mô tả" name="description">
          <UInput
            v-model="state.description"
            placeholder="Giải thích ý nghĩa của cấu hình này..."
          />
        </UFormField>
      </UForm>
    </template>
    <template #footer>
      <div class="flex w-full justify-end gap-3">
        <UButton color="neutral" variant="ghost" @click="isOpen = false"> Hủy bỏ </UButton>
        <UButton type="submit" form="config-form" color="primary" :loading="loading">
          Lưu lại
        </UButton>
      </div>
    </template>
  </USlideover>
</template>
