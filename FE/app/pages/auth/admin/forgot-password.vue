<script setup lang="ts">
import { MailCheck, ArrowLeft, Phone } from 'lucide-vue-next'
import { forgotPasswordSchema } from '~/utils/validation'
import { authService } from '~/services/authService'
import type { z } from 'zod'

const { t } = useI18n()

useSeoMeta({ title: 'Quên mật khẩu - BunTech Admin' })
definePageMeta({ layout: 'auth' })

const sent = ref(false)
const state = reactive({
  phoneNumber: ''
})

type Schema = z.output<typeof forgotPasswordSchema>

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
  const result = forgotPasswordSchema.safeParse(state)
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
const handleForgotPassword = handleSubmit(
  async (data: Schema) => {
    // Calling auth service to send OTP
    const res = await authService.forgotPassword({ phoneNumber: data.phoneNumber })
    return res
  },
  {
    formRef,
    onSuccess() {
      sent.value = true
    },
    onError(err: unknown) {
      void err // ApiClient xử lý toast lỗi
    }
  }
)

const handleFormSubmit = () => {
  if (validateForm()) {
    handleForgotPassword(state)
  }
}
</script>

<template>
  <div>
    <!-- Back link -->
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
        <Phone class="h-4 w-4" aria-hidden="true" />
        {{ t('auth.forgotPassword') }}
      </div>
      <h2 class="text-surface-foreground mb-2 text-2xl font-bold tracking-tight">
        {{ t('auth.forgotPasswordTitle') }}
      </h2>
      <p class="text-sm text-gray-500 dark:text-zinc-400">{{ t('auth.forgotPasswordSubtitle') }}</p>
    </div>

    <!-- Success state -->
    <Transition name="fade" mode="out-in">
      <div v-if="sent" key="success" class="animate-scale-in py-8 text-center">
        <div
          class="bg-success-100 dark:bg-success-900/30 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
        >
          <MailCheck class="text-success-600 dark:text-success-400 h-8 w-8" aria-hidden="true" />
        </div>
        <h3 class="text-surface-foreground mb-2 text-lg font-semibold">
          {{ t('auth.checkYourEmail') }}
        </h3>
        <p class="mx-auto mb-6 max-w-xs text-sm text-gray-500 dark:text-zinc-400">
          Vui lòng kiểm tra điện thoại của bạn, chúng tôi đã gửi mã xác thực (OTP) qua tin nhắn.
        </p>
        <UButton variant="outline" class="w-full" to="/auth/admin/reset-password">
          Chuyển đến trang Đặt lại mật khẩu
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

        <UButton type="submit" :loading="loading" class="!mt-8 w-full" size="lg">
          Lấy mã xác thực (OTP)
        </UButton>
      </form>
    </Transition>

    <p class="mt-8 text-center text-xs text-gray-400 dark:text-zinc-500">
      {{ t('auth.rememberPassword') || 'Nhớ mật khẩu?' }}
      <NuxtLink
        to="/auth/admin/login"
        class="text-primary-600 dark:text-primary-400 font-medium hover:underline"
        >{{ t('auth.loginTitle') }}</NuxtLink
      >
    </p>
  </div>
</template>
