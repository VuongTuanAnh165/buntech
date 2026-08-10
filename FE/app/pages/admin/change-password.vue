<script setup lang="ts">
import { changePasswordSchema } from '~/utils/validation'
import { authService } from '~/services/authService'
import type { z } from 'zod'
useSeoMeta({ title: 'Đổi mật khẩu - BunTech Admin' })
definePageMeta({ layout: 'admin' })

type Schema = z.output<typeof changePasswordSchema>

const state = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const formErrors = reactive<Record<string, string>>({})

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
  const result = changePasswordSchema.safeParse(state)
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

const { handleSubmit, isSubmitting: saving } = useFormSubmit()

const handleChangePassword = handleSubmit(
  async (data: Schema) => {
    await authService.changePassword({
      oldPassword: data.oldPassword,
      newPassword: data.newPassword
    })
  },
  {
    formRef,
    onSuccess() {
      // toast success handled by useFormSubmit or interceptor? Actually we want manual reset.
      Object.assign(state, {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setTimeout(() => {
        navigateTo('/admin')
      }, 3000)

      // Update history mock
      passwordHistory.value.unshift({
        id: `ph-${Date.now()}`,
        date: new Date().toISOString(),
        label: 'Đổi mật khẩu',
        note: 'Tự đổi từ trang Bảo mật',
        current: true
      })
      passwordHistory.value = passwordHistory.value.map((h, i) => ({ ...h, current: i === 0 }))
    },
    onError(error: unknown) {
      // Removed console.error to fix lint
      void error
    }
  }
)

const handleFormSubmit = () => {
  if (validateForm()) {
    handleChangePassword(state)
  }
}

const showStrength = ref(false)

// Password strength
interface Requirement {
  label: string
  test: (pw: string) => boolean
}

const requirements: Requirement[] = [
  { label: 'Ít nhất 6 ký tự', test: (pw) => pw.length >= 6 },
  { label: 'Có chữ số', test: (pw) => /\d/.test(pw) },
  { label: 'Có chữ in hoa', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'Có ký tự đặc biệt', test: (pw) => /[^A-Za-z0-9]/.test(pw) }
]

const metRequirements = computed(() => requirements.map((r) => r.test(state.newPassword)))
const metCount = computed(() => metRequirements.value.filter(Boolean).length)

const strengthLevel = computed(() => {
  if (!state.newPassword) return 0
  return metCount.value
})

const strengthInfo = computed(() => {
  const levels = [
    {
      label: 'Chưa nhập',
      color: 'bg-slate-200 dark:bg-zinc-700',
      text: 'text-slate-400 dark:text-zinc-500',
      barWidth: '0%'
    },
    {
      label: 'Yếu',
      color: 'bg-error-500',
      text: 'text-error-600 dark:text-error-400',
      barWidth: '25%'
    },
    {
      label: 'Trung bình',
      color: 'bg-warning-500',
      text: 'text-warning-600 dark:text-warning-400',
      barWidth: '50%'
    },
    {
      label: 'Khá',
      color: 'bg-info-500',
      text: 'text-info-600 dark:text-info-400',
      barWidth: '75%'
    },
    {
      label: 'Mạnh',
      color: 'bg-success-500',
      text: 'text-success-600 dark:text-success-400',
      barWidth: '100%'
    }
  ]
  return levels[strengthLevel.value]
})

// Recent password changes timeline (mock)
const passwordHistory = ref([
  {
    id: 'ph-1',
    date: new Date(Date.now() - 7 * 86400000).toISOString(),
    label: 'Đổi mật khẩu',
    note: 'Tự đổi từ trang Bảo mật',
    current: true
  },
  {
    id: 'ph-2',
    date: new Date(Date.now() - 45 * 86400000).toISOString(),
    label: 'Đổi mật khẩu',
    note: 'Yêu cầu bởi quản trị viên',
    current: false
  },
  {
    id: 'ph-3',
    date: new Date(Date.now() - 120 * 86400000).toISOString(),
    label: 'Tạo mật khẩu đầu tiên',
    note: 'Khi đăng ký tài khoản',
    current: false
  }
])

watch(
  () => state.newPassword,
  (val) => {
    showStrength.value = val.length > 0
  }
)
</script>

<template>
  <div>
    <BasePageHeader
      title="Đổi mật khẩu"
      subtitle="Bảo mật tài khoản bằng mật khẩu mạnh và định kỳ cập nhật"
      breadcrumb-label="Đổi mật khẩu"
    >
      <template #actions>
        <div
          class="bg-success-50 dark:bg-success-900/20 ring-success-100 dark:ring-success-900/30 flex items-center gap-2 rounded-lg px-3 py-1.5 ring-1"
        >
          <UIcon
            name="i-lucide-shield-check"
            class="text-success-600 dark:text-success-400 h-4 w-4"
          />
          <span class="text-success-700 dark:text-success-300 text-xs font-medium"
            >Tài khoản được bảo vệ</span
          >
        </div>
      </template>
    </BasePageHeader>

    <div class="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5 lg:gap-6">
      <!-- Left: Change Password Form -->
      <div class="lg:col-span-3">
        <UCard class="stagger-item h-full" style="animation-delay: 0ms">
          <div class="mb-5 flex items-center gap-2.5">
            <div
              class="bg-primary-50 dark:bg-primary-900/20 ring-primary-100 dark:ring-primary-900/30 flex h-9 w-9 items-center justify-center rounded-lg ring-1"
            >
              <UIcon
                name="i-lucide-key-round"
                class="text-primary-600 dark:text-primary-400 h-[18px] w-[18px]"
              />
            </div>
            <div>
              <h2 class="text-surface-foreground text-sm font-semibold">Đặt mật khẩu mới</h2>
              <p class="text-xs text-slate-500 dark:text-zinc-400">
                Mật khẩu mới phải đáp ứng các yêu cầu bên dưới
              </p>
            </div>
          </div>

          <form class="space-y-4" @submit.prevent="handleFormSubmit">
            <UFormField
              label="Mật khẩu hiện tại"
              name="oldPassword"
              required
              :error="formErrors.oldPassword"
              help="Nhập mật khẩu hiện tại của bạn"
            >
              <UInput v-model="state.oldPassword" type="password" class="w-full" />
            </UFormField>

            <div>
              <UFormField
                label="Mật khẩu mới"
                name="newPassword"
                required
                :error="formErrors.newPassword"
              >
                <UInput v-model="state.newPassword" type="password" class="w-full" />
              </UFormField>

              <!-- Strength meter -->
              <Transition name="fade">
                <div v-if="showStrength" class="mt-3">
                  <div class="mb-1.5 flex items-center justify-between">
                    <span class="text-xs text-slate-500 dark:text-zinc-400">Độ mạnh mật khẩu</span>
                    <span :class="['text-xs font-medium', strengthInfo?.text]">{{
                      strengthInfo?.label
                    }}</span>
                  </div>
                  <div class="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
                    <div
                      :class="[
                        'h-full rounded-full transition-all duration-300',
                        strengthInfo?.color
                      ]"
                      :style="{ width: strengthInfo?.barWidth }"
                    />
                  </div>
                </div>
              </Transition>
            </div>

            <UFormField
              label="Xác nhận mật khẩu"
              name="confirmPassword"
              required
              :error="formErrors.confirmPassword"
            >
              <UInput v-model="state.confirmPassword" type="password" class="w-full" />
            </UFormField>

            <!-- Requirements checklist -->
            <div class="border-surface-border bg-surface-hover/40 rounded-lg border p-4">
              <p class="text-surface-foreground mb-3 flex items-center gap-1.5 text-xs font-medium">
                <UIcon name="i-lucide-sparkles" class="text-primary-500 h-3.5 w-3.5" />
                Yêu cầu mật khẩu
              </p>
              <ul class="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <li
                  v-for="(req, i) in requirements"
                  :key="req.label"
                  class="flex items-center gap-2 text-sm"
                >
                  <span
                    :class="[
                      'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full transition-all',
                      metRequirements[i]
                        ? 'bg-success-100 dark:bg-success-900/30'
                        : 'bg-slate-100 dark:bg-zinc-800'
                    ]"
                  >
                    <UIcon
                      v-if="metRequirements[i]"
                      name="i-lucide-check"
                      class="text-success-600 dark:text-success-400 h-3 w-3"
                    />
                    <UIcon
                      v-else
                      name="i-lucide-x"
                      class="h-3 w-3 text-slate-400 dark:text-zinc-500"
                    />
                  </span>
                  <span
                    :class="
                      metRequirements[i]
                        ? 'text-surface-foreground font-medium'
                        : 'text-slate-500 dark:text-zinc-400'
                    "
                  >
                    {{ req.label }}
                  </span>
                </li>
              </ul>
            </div>

            <div
              class="bg-info-50 dark:bg-info-900/20 border-info-100 dark:border-info-900/30 flex items-center gap-2 rounded-lg border p-3"
            >
              <UIcon
                name="i-lucide-lightbulb"
                class="text-info-600 dark:text-info-400 h-4 w-4 flex-shrink-0"
              />
              <p class="text-info-700 dark:text-info-300 text-xs leading-relaxed">
                Mẹo: Dùng một cụm từ dễ nhớ rồi thay thế vài ký tự thành số và ký tự đặc biệt, ví dụ
                "BunTech@2024".
              </p>
            </div>

            <div class="flex items-center justify-end gap-3 pt-2">
              <UButton
                type="submit"
                :loading="saving"
                :disabled="metCount < 2"
                size="lg"
                class="w-full justify-center"
                icon="i-lucide-shield"
              >
                Đổi mật khẩu
              </UButton>
            </div>
          </form>
        </UCard>
      </div>

      <div class="lg:col-span-2">
        <ChangePasswordSidebar :password-history="passwordHistory" />
      </div>
    </div>
  </div>
</template>
