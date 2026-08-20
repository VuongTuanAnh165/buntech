<script setup lang="ts">
import { z } from 'zod'
import { requiredString } from '~/utils/validation'
import type { SystemConfig } from '~/utils/types'
import { t } from '~/utils/i18n'

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
    .min(1, t('admin_system_form_key_req'))
    .regex(/^[a-z0-9_]+$/, t('admin_system_form_key_regex')),
  value: requiredString(t('admin_system_form_val')),
  description: z.string().optional()
})

type Schema = z.infer<typeof schema>

const state = reactive<Schema>({
  key: '',
  value: '',
  description: ''
})

const { formErrors, formRef, validate: validateForm } = useZodForm(schema)

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
      formRef.value.clearErrors()
    }
  }
)

const { handleSubmit } = useFormSubmit()

const onSubmit = handleSubmit(
  async (data: Schema) => {
    emit('save', data)
  },
  {
    formRef,
    onSuccess: () => {},
    onError: () => {}
  }
)

const handleFormSubmit = () => {
  if (validateForm(state)) {
    onSubmit(state)
  }
}
</script>

<template>
  <USlideover
    v-model:open="isOpen"
    :title="isEdit ? $t('admin_system_form_title_edit') : $t('admin_system_form_title_add')"
  >
    <template #body>
      <form id="config-form" class="space-y-6" @submit.prevent="handleFormSubmit">
        <UFormField
          :label="$t('admin_system_form_key')"
          name="key"
          required
          :error="formErrors.key"
        >
          <template #description>
            {{ $t('admin_system_form_key_desc') }} <code>freeship_threshold</code>
          </template>
          <UInput
            v-model="state.key"
            :placeholder="$t('admin_system_form_key_placeholder')"
            :disabled="isEdit"
          />
        </UFormField>

        <UFormField
          :label="$t('admin_system_form_val')"
          name="value"
          required
          :error="formErrors.value"
        >
          <UTextarea
            v-model="state.value"
            :rows="4"
            :placeholder="$t('admin_system_form_val_placeholder')"
          />
        </UFormField>

        <UFormField
          :label="$t('admin_prod_form_desc')"
          name="description"
          :error="formErrors.description"
        >
          <UInput
            v-model="state.description"
            :placeholder="$t('admin_system_form_desc_placeholder')"
          />
        </UFormField>
      </form>
    </template>
    <template #footer>
      <div class="flex w-full justify-end gap-3">
        <UButton
          color="neutral"
          variant="ghost"
          @click="
            () => {
              isOpen = false
            }
          "
        >
          {{ $t('admin_system_form_cancel') }}
        </UButton>
        <UButton type="submit" form="config-form" color="primary" :loading="loading">
          {{ $t('admin_system_form_save') }}
        </UButton>
      </div>
    </template>
  </USlideover>
</template>
