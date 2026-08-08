<script setup lang="ts">
import { MailCheck, ArrowLeft, Mail } from 'lucide-vue-next'
const { t } = useI18n()
const toast = useToast()

useSeoMeta({ title: `${t('auth.forgotPassword')} - BunTech` })
definePageMeta({ layout: 'auth' })

const email = ref('')
const error = ref('')
const loading = ref(false)
const sent = ref(false)

const validateEmail = (val: string): string | undefined => {
  if (!val) return t('auth.emailRequired')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return t('auth.emailInvalid')
  return undefined
}

const handleSubmit = async () => {
  error.value = validateEmail(email.value) || ''
  if (error.value) return

  loading.value = true
  try {
    // TODO: Connect to Supabase auth.resetPasswordForEmail
    await new Promise(resolve => setTimeout(resolve, 1200))
    sent.value = true
    toast.add({ title: 'Thành công', description: '', color: '' })
  } catch {
    toast.add({ title: 'Thất bại', description: '', color: '' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <!-- Back link -->
    <NuxtLink to="/auth/admin/login" class="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-zinc-400 hover:text-surface-foreground transition-colors mb-6 min-h-[44px] px-2 -ml-2 rounded-md">
      <ArrowLeft class="w-4 h-4" aria-hidden="true" />
      {{ t('common.back') }}
    </NuxtLink>

    <!-- Header -->
    <div class="mb-8">
      <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-sm font-medium mb-4">
        <Mail class="w-4 h-4" aria-hidden="true" />
        {{ t('auth.forgotPassword') }}
      </div>
      <h2 class="text-2xl font-bold text-surface-foreground mb-2 tracking-tight">{{ t('auth.forgotPasswordTitle') }}</h2>
      <p class="text-sm text-gray-500 dark:text-zinc-400">{{ t('auth.forgotPasswordSubtitle') }}</p>
    </div>

    <!-- Success state -->
    <Transition name="fade" mode="out-in">
      <div v-if="sent" key="success" class="text-center py-8 animate-scale-in">
        <div class="w-16 h-16 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center mx-auto mb-4">
          <MailCheck class="w-8 h-8 text-success-600 dark:text-success-400" aria-hidden="true" />
        </div>
        <h3 class="text-lg font-semibold text-surface-foreground mb-2">{{ t('auth.checkYourEmail') }}</h3>
        <p class="text-sm text-gray-500 dark:text-zinc-400 max-w-xs mx-auto mb-6">
          {{ t('auth.resetLinkSentDesc') || 'Chúng tôi đã gửi link đặt lại mật khẩu đến email của bạn. Vui lòng kiểm tra hộp thư.' }}
        </p>
        <UButton variant="outline" class="w-full" to="/auth/admin/login">
          {{ t('common.back') }}
        </UButton>
      </div>

      <!-- Form -->
      <form v-else key="form" class="space-y-5" novalidate @submit.prevent="handleSubmit">
        <UFormField :label="t('auth.email')" :error="error">
          <UInput
            v-model="email"
            type="email"
            placeholder="admin@buntech.vn"
            autocomplete="email"
            class="w-full"
            @blur="error = validateEmail(email) || ''"
          />
        </UFormField>

        <UButton type="submit" :loading="loading" class="w-full !mt-8" size="lg">
          {{ t('auth.sendResetLink') }}
        </UButton>
      </form>
    </Transition>

    <p class="text-center text-xs text-gray-400 dark:text-zinc-500 mt-8">
      {{ t('auth.rememberPassword') || 'Nhớ mật khẩu?' }}
      <NuxtLink to="/auth/admin/login" class="text-primary-600 dark:text-primary-400 font-medium hover:underline">{{ t('auth.loginTitle') }}</NuxtLink>
    </p>
  </div>
</template>
