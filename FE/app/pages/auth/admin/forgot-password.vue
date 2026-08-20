<script setup lang="ts">
import { MailCheck, ArrowLeft, Phone } from 'lucide-vue-next'
import { forgotPasswordSchema } from '~/utils/validation'
import { authService } from '~/services/authService'
import type { z } from 'zod'

import { t } from '~/utils/i18n'

useSeoMeta({ title: t('auth_forgot_seo') })
definePageMeta({ layout: 'auth' })

const sent = ref(false)
const state = reactive({
  phoneNumber: ''
})

type Schema = z.output<typeof forgotPasswordSchema>

const { formErrors, formRef, validate: validateForm } = useZodForm(forgotPasswordSchema)

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
  if (validateForm(state)) {
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
        {{ t('auth_forgot_title') }}
      </div>
      <h2 class="text-surface-foreground mb-2 text-2xl font-bold tracking-tight">
        {{ t('auth_forgot_title') }}
      </h2>
      <p class="text-sm text-gray-500 dark:text-zinc-400">{{ t('auth_forgot_subtitle') }}</p>
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
          {{ t('auth_forgot_check_email') }}
        </h3>
        <p class="mx-auto mb-6 max-w-xs text-sm text-gray-500 dark:text-zinc-400">
          {{ t('auth_forgot_check_email_desc') }}
        </p>
        <UButton variant="outline" class="w-full" to="/auth/admin/reset-password">
          {{ t('auth_forgot_btn_reset') }}
        </UButton>
      </div>

      <!-- Form -->
      <form v-else key="form" class="space-y-5" @submit.prevent="handleFormSubmit">
        <UFormField
          :label="t('auth_login_phone')"
          name="phoneNumber"
          :error="formErrors.phoneNumber"
        >
          <UInput
            v-model="state.phoneNumber"
            type="tel"
            placeholder="0901234567"
            autocomplete="tel"
            class="w-full"
          />
        </UFormField>

        <UButton type="submit" :loading="loading" class="!mt-8 w-full" size="lg">
          {{ t('auth_forgot_btn_get_otp') }}
        </UButton>
      </form>
    </Transition>

    <p class="mt-8 text-center text-xs text-gray-400 dark:text-zinc-500">
      {{ t('auth_forgot_remember') }}
      <NuxtLink
        to="/auth/admin/login"
        class="text-primary-600 dark:text-primary-400 font-medium hover:underline"
        >{{ t('login') }}</NuxtLink
      >
    </p>
  </div>
</template>
