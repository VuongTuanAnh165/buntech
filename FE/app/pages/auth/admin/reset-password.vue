<script setup lang="ts">
import { ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-vue-next'
import { resetPasswordSchema } from '~/utils/validation'
import { authService } from '~/services/authService'
import type { z } from 'zod'

const { t } = useI18n()

useSeoMeta({ title: 'Đặt lại mật khẩu - BunTech Admin' })
definePageMeta({ layout: 'auth' })

const success = ref(false)
const state = reactive({
  phoneNumber: '',
  token: '',
  newPassword: '',
  confirmPassword: ''
})

type Schema = z.output<typeof resetPasswordSchema>

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
  const result = resetPasswordSchema.safeParse(state)
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

const { handleSubmit, isSubmitting: loading } = useFormSubmit()
const handleResetPassword = handleSubmit(
  async (data: Schema) => {
    await authService.resetPassword({
      phoneNumber: data.phoneNumber,
      token: data.token,
      newPassword: data.newPassword
    })
  },
  {
    formRef,
    onSuccess() {
      success.value = true
    },
    onError(err: unknown) {
      void err // ApiClient xử lý toast lỗi
    }
  }
)

const handleFormSubmit = () => {
  if (validateForm()) {
    handleResetPassword(state)
  }
}

const strength = computed(() => {
  const val = state.newPassword
  if (!val) return 0
  let score = 0
  if (val.length >= 6) score++
  if (val.length >= 10) score++
  if (/[A-Z]/.test(val)) score++
  if (/[0-9]/.test(val)) score++
  if (/[^A-Za-z0-9]/.test(val)) score++
  return Math.min(score, 4)
})

const strengthLabel = computed(() => {
  const labels = ['', 'Yếu', 'Trung bình', 'Khá', 'Mạnh']
  return labels[strength.value] || ''
})

const strengthColor = computed(() => {
  const colors = ['', 'bg-danger-500', 'bg-warning-500', 'bg-accent-500', 'bg-success-500']
  return colors[strength.value] || ''
})
</script>

<template>
  <div>
    <NuxtLink
      to="/auth/admin/login"
      class="hover:text-surface-foreground mb-6 -ml-2 inline-flex min-h-[44px] items-center gap-1.5 rounded-md px-2 text-sm text-gray-500 transition-colors dark:text-zinc-400"
    >
      <ArrowLeft class="h-4 w-4" aria-hidden="true" />
      {{ t('common.back') }}
    </NuxtLink>

    <!-- Header -->
    <div class="mb-8">
      <div
        class="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium"
      >
        <ShieldCheck class="h-4 w-4" aria-hidden="true" />
        {{ t('auth.resetPassword') }}
      </div>
      <h2 class="text-surface-foreground mb-2 text-2xl font-bold tracking-tight">
        {{ t('auth.resetPasswordTitle') }}
      </h2>
      <p class="text-sm text-gray-500 dark:text-zinc-400">{{ t('auth.resetPasswordSubtitle') }}</p>
    </div>

    <Transition name="fade" mode="out-in">
      <!-- Success state -->
      <div v-if="success" key="success" class="animate-scale-in py-8 text-center">
        <div
          class="bg-success-100 dark:bg-success-900/30 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
        >
          <CheckCircle2 class="text-success-600 dark:text-success-400 h-8 w-8" aria-hidden="true" />
        </div>
        <h3 class="text-surface-foreground mb-2 text-lg font-semibold">
          {{ t('auth.passwordResetSuccess') }}
        </h3>
        <p class="mb-6 text-sm text-gray-500 dark:text-zinc-400">
          {{
            t('auth.passwordResetSuccessDesc') ||
            'Mật khẩu đã được cập nhật. Vui lòng đăng nhập lại.'
          }}
        </p>
        <UButton color="primary" class="w-full" to="/auth/admin/login">
          {{ t('auth.loginTitle') }}
        </UButton>
      </div>

      <!-- Form -->
      <form v-else key="form" class="space-y-5" @submit.prevent="handleFormSubmit">
        <UFormField label="Số điện thoại" name="phoneNumber" :error="formErrors.phoneNumber">
          <UInput
            v-model="state.phoneNumber"
            type="tel"
            placeholder="0901234567"
            autocomplete="tel"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Mã OTP" name="token" :error="formErrors.token">
          <UInput v-model="state.token" placeholder="Mã xác thực 6 số" class="w-full" />
        </UFormField>

        <UFormField
          :label="t('auth.newPassword')"
          name="newPassword"
          :error="formErrors.newPassword"
        >
          <UInput
            v-model="state.newPassword"
            type="password"
            placeholder="••••••••"
            autocomplete="new-password"
            class="w-full"
          />
        </UFormField>
        <!-- Password strength -->
        <div v-if="state.newPassword" class="-mt-3">
          <div class="flex gap-1.5">
            <div
              v-for="i in 4"
              :key="i"
              :class="[
                'h-1.5 flex-1 rounded-full transition-all duration-300',
                i <= strength ? strengthColor : 'bg-surface-border'
              ]"
            />
          </div>
          <p class="mt-1.5 text-xs text-slate-400 dark:text-zinc-500">{{ strengthLabel }}</p>
        </div>

        <UFormField
          :label="t('auth.confirmPassword')"
          name="confirmPassword"
          :error="formErrors.confirmPassword"
        >
          <UInput
            v-model="state.confirmPassword"
            type="password"
            placeholder="••••••••"
            autocomplete="new-password"
            class="w-full"
          />
        </UFormField>
        <p
          v-if="state.confirmPassword && state.confirmPassword === state.newPassword"
          class="text-success-600 dark:text-success-400 -mt-3 flex items-center gap-1 text-sm"
        >
          <CheckCircle2 class="h-3.5 w-3.5" aria-hidden="true" /> {{ t('auth.passwordsMatch') }}
        </p>

        <UButton type="submit" :loading="loading" class="!mt-8 w-full" size="lg">
          {{ t('auth.resetPasswordButton') }}
        </UButton>
      </form>
    </Transition>
  </div>
</template>
