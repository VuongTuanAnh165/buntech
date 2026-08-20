<script setup lang="ts">
import { z } from 'zod'
import { requiredString } from '~/utils/validation'
import type { Address } from '~/utils/types'
import { useUsers } from '~/composables/admin/useUsers'
import AddressSelect from '~/components/base/AddressSelect.vue'
import { t } from '~/utils/i18n'

const { createAddress, updateAddress } = useUsers()

const props = defineProps<{
  open: boolean
  userId: string | number
  address: Address | null
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  refresh: []
}>()

const isOpen = computed({
  get: () => props.open,
  set: (val) => emit('update:open', val)
})

const isEdit = computed(() => !!props.address)

const schema = z.object({
  addressLine: requiredString(t('address_specific')).max(
    191,
    t('admin_address_form_err_address_max')
  ),
  province: requiredString(t('province')).max(100),
  ward: requiredString(t('ward')).max(100),
  isDefault: z.boolean().optional()
})

const state = reactive({
  addressLine: '',
  province: '',
  ward: '',
  isDefault: false
})

const { formErrors, formRef, validate: validateForm } = useZodForm(schema)

watch(
  () => props.open,
  (val) => {
    if (val) {
      if (props.address) {
        state.addressLine = props.address.addressLine || props.address.street || ''
        state.province = props.address.province || props.address.city || ''
        state.ward = props.address.ward || ''
        state.isDefault = !!props.address.isDefault
      } else {
        state.addressLine = ''
        state.province = ''
        state.ward = ''
        state.isDefault = false
      }
      formRef.value.clearErrors()
    }
  }
)

const { isSubmitting, handleSubmit } = useFormSubmit()

type SchemaType = z.infer<typeof schema>

const onSubmit = handleSubmit(
  async (data: SchemaType) => {
    if (isEdit.value && props.address) {
      await updateAddress(props.userId, props.address.id, data)
    } else {
      await createAddress(props.userId, data)
    }
  },
  {
    formRef,
    onSuccess: () => {
      isOpen.value = false
      emit('refresh')
    }
  }
)

const handleFormSubmit = () => {
  if (validateForm(state)) {
    onSubmit(state)
  }
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :title="isEdit ? $t('admin_address_form_title_edit') : $t('admin_address_form_title_add')"
  >
    <template #body>
      <form id="address-form" class="space-y-4" @submit.prevent="handleFormSubmit">
        <AddressSelect
          :model-value="state"
          :errors="formErrors"
          @update:model-value="Object.assign(state, $event)"
        />

        <UFormField name="isDefault">
          <UCheckbox v-model="state.isDefault" :label="$t('admin_address_form_is_default')" />
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
          >{{ $t('common_cancel') }}</UButton
        >
        <UButton
          type="submit"
          form="address-form"
          color="primary"
          :loading="isSubmitting || loading"
        >
          {{ isEdit ? $t('admin_profile_btn_save') : $t('common_add_new') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
