<script setup lang="ts">
import { z } from 'zod'
import { requiredString } from '~/utils/validation'
import { ConstantKey } from '~/enums/constantKeys'
import type { UserDTO } from '~/utils/types'
import { useUsers } from '~/composables/admin/useUsers'
import { t } from '~/utils/i18n'
import { uploadService } from '~/services/uploadService'

const toast = useToast()
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

const customerTypeOptions = computed(() => [
  { label: 'Khách lẻ', value: constants.value?.[ConstantKey.CustomerType]?.RETAIL || 'RETAIL' },
  {
    label: 'Khách sỉ',
    value: constants.value?.[ConstantKey.CustomerType]?.WHOLESALE || 'WHOLESALE'
  }
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
    role: requiredString(t('admin_profile_info_role')),
    customerType: z.string().optional(),
    debtLimit: z.any().optional(),
    storeName: z.string().max(191).optional(),
    isPublic: z.boolean().optional(),
    avatarUrl: z.string().optional()
  })
})

const state = reactive({
  phoneNumber: '',
  password: '',
  fullName: '',
  role: '',
  customerType: '',
  debtLimit: 0,
  storeName: '',
  isPublic: false,
  avatarUrl: ''
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
        state.customerType =
          props.user.profile?.customer_type ||
          props.user.profile?.customerType ||
          customerTypeOptions.value[0]?.value ||
          ''
        state.debtLimit =
          Number(props.user.profile?.debt_limit || props.user.profile?.debtLimit) || 0
        state.storeName = props.user.profile?.store_name || props.user.profile?.storeName || ''
        const pub = props.user.profile?.is_public ?? props.user.profile?.isPublic
        state.isPublic = Boolean(pub === 1 || pub === '1' || pub === true)
        state.avatarUrl = props.user.profile?.avatar_url || props.user.profile?.avatarUrl || ''
      } else {
        state.phoneNumber = ''
        state.password = ''
        state.fullName = ''
        state.role = roleOptions.value[0]?.value || ''
        state.customerType = customerTypeOptions.value[0]?.value || ''
        state.debtLimit = 0
        state.storeName = ''
        state.isPublic = false
        state.avatarUrl = ''
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
    const customerTypeValue =
      typeof data.customerType === 'object'
        ? (data.customerType as { value: string }).value
        : data.customerType

    if (isEdit.value && props.user) {
      await updateUser(props.user.id, {
        fullName: data.fullName,
        role: roleValue,
        customerType: customerTypeValue,
        debtLimit: Number(data.debtLimit) || 0,
        storeName: data.storeName,
        isPublic: data.isPublic,
        avatarUrl: data.avatarUrl
        // Note: Password update usually requires a separate endpoint or field
      })
    } else {
      await createUser({
        phoneNumber: data.phoneNumber || '',
        password: data.password || '',
        fullName: data.fullName,
        role: roleValue,
        customerType: customerTypeValue,
        debtLimit: Number(data.debtLimit) || 0,
        storeName: data.storeName,
        isPublic: data.isPublic,
        avatarUrl: data.avatarUrl
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
  if (typeof state.customerType === 'object' && state.customerType !== null) {
    state.customerType = (state.customerType as { value: string }).value
  }

  if (validateForm(state)) {
    onSubmit(state)
  }
}

const fileInputRef = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)

function triggerFileSelect() {
  fileInputRef.value?.click()
}

async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    toast.add({ title: 'Kích thước ảnh quá lớn (tối đa 5MB)', color: 'warning' })
    return
  }

  isUploading.value = true
  try {
    const url = await uploadService.uploadImage(file)
    state.avatarUrl = url
  } catch {
    toast.add({ title: 'Lỗi tải ảnh lên', color: 'error' })
  } finally {
    isUploading.value = false
    if (fileInputRef.value) fileInputRef.value.value = ''
  }
}

function clearImage() {
  state.avatarUrl = ''
}
</script>

<template>
  <USlideover
    v-model:open="isOpen"
    :title="isEdit ? $t('admin_customer_form_title_edit') : $t('admin_customer_form_title_add')"
  >
    <template #body>
      <form id="customer-form" class="space-y-4" @submit.prevent="handleFormSubmit">
        <div class="mb-4 flex flex-col items-center gap-2">
          <input
            ref="fileInputRef"
            type="file"
            class="hidden"
            accept="image/jpeg,image/png,image/webp"
            @change="handleFileChange"
          />
          <UAvatar
            :src="state.avatarUrl || undefined"
            :alt="state.fullName || 'Avatar'"
            size="3xl"
            class="ring-primary-500/20 ring-2"
          />
          <div class="mt-2 flex items-center gap-2">
            <UButton
              color="neutral"
              variant="soft"
              size="sm"
              :loading="isUploading"
              @click="triggerFileSelect"
            >
              Tải ảnh lên
            </UButton>
            <UButton
              v-if="state.avatarUrl"
              color="error"
              variant="ghost"
              size="sm"
              icon="i-lucide-trash"
              @click="clearImage"
            />
          </div>
        </div>

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

        <template
          v-if="
            state.role === 'customer' ||
            state.role === 'CUSTOMER' ||
            (state.role && (state.role as any).value === 'customer') ||
            (state.role && (state.role as any).value === 'CUSTOMER')
          "
        >
          <UFormField label="Loại khách hàng" name="customerType" :error="formErrors.customerType">
            <USelectMenu
              v-model="state.customerType"
              :items="customerTypeOptions"
              value-key="value"
              label-key="label"
              placeholder="Chọn loại khách hàng"
            />
          </UFormField>

          <UFormField label="Tên cửa hàng" name="storeName" :error="formErrors.storeName">
            <UInput v-model="state.storeName" placeholder="Ví dụ: Tạp hóa Cô Lan" />
          </UFormField>

          <UFormField label="Hạn mức công nợ" name="debtLimit" :error="formErrors.debtLimit">
            <UInput v-model="state.debtLimit" type="number" placeholder="Nhập hạn mức nợ" />
          </UFormField>

          <UFormField name="isPublic" :error="formErrors.isPublic">
            <UCheckbox v-model="state.isPublic" label="Hiển thị đại lý trên bản đồ" />
          </UFormField>
        </template>
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
