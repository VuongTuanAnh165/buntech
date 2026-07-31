<script setup lang="ts">
const { t } = useI18n()
const toast = useToast()
const router = useRouter()
definePageMeta({ layout: 'auth' })
useHead({ title: `${t('auth.resetPasswordTitle')} - BunTech` })

const password = ref('')
const confirmPassword = ref('')
const errors = ref<{ password?: string; confirm?: string }>({})
const loading = ref(false)

async function handleSubmit() {
  errors.value = {}
  if (password.value.length < 6) { errors.value.password = t('auth.passwordTooShort'); return }
  if (password.value !== confirmPassword.value) { errors.value.confirm = t('auth.passwordMismatch'); return }
  loading.value = true
  try {
    // Mock network request
    await new Promise(r => setTimeout(r, 500))
    toast.success(t('auth.passwordChanged'))
    router.push('/auth/admin/login')
  } catch {
    toast.error(t('errors.unexpected'))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-6">
    <div class="w-full max-w-sm">
      <div class="flex items-center gap-2 mb-8 justify-center">
        <div class="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold">B</div>
        <span class="text-xl font-bold text-gray-900">BunTech</span>
      </div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ t('auth.resetPasswordTitle') }}</h2>
      <p class="text-gray-500 mb-8">{{ t('auth.passwordTooShort') }}</p>
      <form class="space-y-5" @submit.prevent="handleSubmit">
        <AppInput
          v-model="password"
          :label="t('auth.newPassword')"
          type="password"
          :required="true"
          :error="errors.password"
          placeholder="••••••••"
        />
        <AppInput
          v-model="confirmPassword"
          :label="t('auth.confirmPassword')"
          type="password"
          :required="true"
          :error="errors.confirm"
          placeholder="••••••••"
        />
        <AppButton type="submit" :loading="loading" block>
          {{ t('auth.resetButton') }}
        </AppButton>
      </form>
      <NuxtLink to="/auth/admin/login" class="block text-center text-sm text-primary-600 hover:text-primary-700 mt-6">
        {{ t('auth.backToLogin') }}
      </NuxtLink>
    </div>
  </div>
</template>
