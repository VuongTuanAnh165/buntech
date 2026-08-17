<script setup lang="ts">
import { z } from 'zod'
import { requiredString } from '~/utils/validation'
import { ConstantKey } from '~/enums/constantKeys'
import type { UserDTO } from '~/utils/types'
import { useUsers } from '~/composables/admin/useUsers'

const { constants } = useMasterData()
const { createUser, updateUser } = useUsers()

const props = defineProps<{
  open: boolean
  user: UserDTO | null
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

const isEdit = computed(() => !!props.user)

const roleOptions = computed(() => [
  { label: 'Khách hàng', value: constants.value?.[ConstantKey.Role]?.CUSTOMER || 'customer' },
  { label: 'Tài xế', value: constants.value?.[ConstantKey.Role]?.DRIVER || 'driver' },
  { label: 'Quản trị viên', value: constants.value?.[ConstantKey.Role]?.ADMIN || 'admin' }
])

const schema = computed(() => {
  return z.object({
    phoneNumber: isEdit.value
      ? z.string().optional()
      : z
          .string()
          .regex(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ')
          .min(1, 'Số điện thoại không được để trống'),
    password: isEdit.value
      ? z.string().optional()
      : z.string().min(6, 'Mật khẩu phải từ 6 ký tự trở lên'),
    fullName: requiredString('Họ tên').max(100, 'Họ tên quá dài'),
    role: requiredString('Vai trò')
  })
})

const state = reactive({
  phoneNumber: '',
  password: '',
  fullName: '',
  role: ''
})

const formErrors = reactive<Record<string, string>>({})

watch(
  () => props.open,
  (val) => {
    if (val) {
      if (props.user) {
        state.phoneNumber = props.user.phoneNumber || ''
        state.password = ''
        state.fullName = props.user.fullName || ''
        state.role = props.user.role || roleOptions.value[0]?.value || ''
      } else {
        state.phoneNumber = ''
        state.password = ''
        state.fullName = ''
        state.role = roleOptions.value[0]?.value || ''
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
  const result = schema.value.safeParse(state)
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

type SchemaType = z.infer<typeof schema.value>

const onSubmit = handleSubmit(
  async (data: SchemaType) => {
    const roleValue =
      typeof data.role === 'object' ? (data.role as { value: string }).value : data.role
    if (isEdit.value && props.user) {
      await updateUser(props.user.id, {
        fullName: data.fullName,
        role: roleValue
        // Note: Password update usually requires a separate endpoint or field
      })
    } else {
      await createUser({
        phoneNumber: data.phoneNumber || '',
        password: data.password || '',
        fullName: data.fullName,
        role: roleValue
      })
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
  // Tự động chuyển đổi object sang value trước khi validate
  if (typeof state.role === 'object' && state.role !== null) {
    state.role = (state.role as { value: string }).value
  }

  if (validateForm()) {
    onSubmit(state)
  }
}
</script>

<template>
  <USlideover v-model:open="isOpen" :title="isEdit ? 'Cập nhật Khách hàng' : 'Thêm mới Khách hàng'">
    <template #body>
      <form id="customer-form" class="space-y-4" @submit.prevent="handleFormSubmit">
        <UFormField
          v-if="!isEdit"
          label="Số điện thoại"
          name="phoneNumber"
          :error="formErrors.phoneNumber"
        >
          <UInput v-model="state.phoneNumber" placeholder="Nhập số điện thoại" />
        </UFormField>

        <UFormField v-if="!isEdit" label="Mật khẩu" name="password" :error="formErrors.password">
          <UInput
            v-model="state.password"
            type="password"
            placeholder="Nhập mật khẩu (từ 6 ký tự)"
          />
        </UFormField>

        <UFormField label="Họ tên" name="fullName" :error="formErrors.fullName">
          <UInput v-model="state.fullName" placeholder="VD: Nguyễn Văn A" />
        </UFormField>

        <UFormField label="Vai trò" name="role" :error="formErrors.role">
          <USelectMenu
            v-model="state.role"
            :items="roleOptions"
            value-key="value"
            label-key="label"
            placeholder="Chọn vai trò"
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
          >Hủy</UButton
        >
        <UButton
          type="submit"
          form="customer-form"
          color="primary"
          :loading="isSubmitting || loading"
        >
          {{ isEdit ? 'Lưu thay đổi' : 'Thêm mới' }}
        </UButton>
      </div>
    </template>
  </USlideover>
</template>
