<script setup lang="ts">
import { z } from 'zod'
import { requiredString } from '~/utils/validation'
import { ConstantKey } from '~/enums/constantKeys'
import type { UserDTO } from '~/utils/types'
import { useUsers } from '~/composables/admin/useUsers'
import { t } from '~/utils/i18n'

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
  {
    label: t('common_customer'),
    value: constants.value?.[ConstantKey.Role]?.CUSTOMER || 'customer'
  },
  { label: t('admin_role_driver'), value: constants.value?.[ConstantKey.Role]?.DRIVER || 'driver' },
  { label: t('admin_role_admin'), value: constants.value?.[ConstantKey.Role]?.ADMIN || 'admin' }
])

const schema = computed(() => {
  return z.object({
    phoneNumber: isEdit.value
      ? z.string().optional()
      : z
          .string()
          .regex(/^[0-9]{10,11}$/, t('admin_customer_form_phone_err_invalid'))
          .min(1, t('val_phone_req')),
    password: isEdit.value
      ? z.string().optional()
      : z.string().min(6, t('admin_customer_form_pw_err')),
    fullName: requiredString(t('quick_order_val_name')).max(
      100,
      t('admin_customer_form_name_err_max')
    ),
    role: requiredString(t('admin_profile_info_role'))
  })
})

const state = reactive({
  phoneNumber: '',
  password: '',
  fullName: '',
  role: ''
})

const { formErrors, formRef, validate: validateForm } = useZodForm(schema)

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
      formRef.value.clearErrors()
    }
  }
)

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

  if (validateForm(state)) {
    onSubmit(state)
  }
}
</script>

<template>
  <USlideover
    v-model:open="isOpen"
    :title="isEdit ? $t('admin_customer_form_title_edit') : $t('admin_customer_form_title_add')"
  >
    <template #body>
      <form id="customer-form" class="space-y-4" @submit.prevent="handleFormSubmit">
        <UFormField
          v-if="!isEdit"
          :label="$t('auth_login_phone')"
          name="phoneNumber"
          :error="formErrors.phoneNumber"
        >
          <UInput v-model="state.phoneNumber" :placeholder="$t('admin_customer_form_phone_ph')" />
        </UFormField>

        <UFormField
          v-if="!isEdit"
          :label="$t('val_password')"
          name="password"
          :error="formErrors.password"
        >
          <UInput
            v-model="state.password"
            type="password"
            :placeholder="$t('admin_customer_form_pw_ph')"
          />
        </UFormField>

        <UFormField :label="$t('val_fullname')" name="fullName" :error="formErrors.fullName">
          <UInput v-model="state.fullName" :placeholder="$t('admin_customer_form_name_ph')" />
        </UFormField>

        <UFormField :label="$t('admin_profile_info_role')" name="role" :error="formErrors.role">
          <USelectMenu
            v-model="state.role"
            :items="roleOptions"
            value-key="value"
            label-key="label"
            :placeholder="$t('admin_customer_form_role_ph')"
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
          >{{ $t('common_cancel') }}</UButton
        >
        <UButton
          type="submit"
          form="customer-form"
          color="primary"
          :loading="isSubmitting || loading"
        >
          {{ isEdit ? $t('admin_profile_btn_save') : $t('common_add_new') }}
        </UButton>
      </div>
    </template>
  </USlideover>
</template>
