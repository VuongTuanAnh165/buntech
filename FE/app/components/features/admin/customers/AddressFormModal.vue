<script setup lang="ts">
import { z } from 'zod'
import { requiredString } from '~/utils/validation'
import { reactive, ref, computed, watch } from 'vue'
import type { Address } from '~/utils/types'
import { useUsers } from '~/composables/admin/useUsers'
import AddressSelect from '~/components/base/AddressSelect.vue'

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
  addressLine: requiredString('Địa chỉ cụ thể').max(191, 'Địa chỉ quá dài'),
  province: requiredString('Tỉnh/Thành phố').max(100),
  ward: requiredString('Phường/Xã').max(100),
  isDefault: z.boolean().optional()
})

const state = reactive({
  addressLine: '',
  province: '',
  ward: '',
  isDefault: false
})

const formErrors = reactive<Record<string, string>>({})

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
      Object.keys(formErrors).forEach((key) => (formErrors[key] = ''))
    }
  }
)

const formRef = ref({
  setErrors: (errors: { path: string; message: string }[]) => {
    Object.keys(formErrors).forEach((key) => (formErrors[key] = ''))
    errors.forEach((e) => {
      formErrors[e.path] = e.message
    })
  },
  clearErrors: () => {
    Object.keys(formErrors).forEach((key) => (formErrors[key] = ''))
  }
})

const validateForm = () => {
  formRef.value.clearErrors()
  const result = schema.safeParse(state)
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      path: issue.path[0]?.toString() || '',
      message: issue.message
    }))
    formRef.value.setErrors(errors)
    return false
  }
  return true
}

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
  if (validateForm()) {
    onSubmit(state)
  }
}
</script>

<template>
  <UModal v-model:open="isOpen" :title="isEdit ? 'Cập nhật Địa chỉ' : 'Thêm mới Địa chỉ'">
    <template #body>
      <form id="address-form" class="space-y-4" @submit.prevent="handleFormSubmit">
        <AddressSelect v-model="state" :errors="formErrors" />

        <UFormField name="isDefault">
          <UCheckbox v-model="state.isDefault" label="Đặt làm địa chỉ mặc định" />
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
          >Hủy</UButton
        >
        <UButton
          type="submit"
          form="address-form"
          color="primary"
          :loading="isSubmitting || loading"
        >
          {{ isEdit ? 'Lưu thay đổi' : 'Thêm mới' }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
