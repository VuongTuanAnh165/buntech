<script setup lang="ts">
const { t } = useI18n()
const authStore = useAuthStore()
const toast = useToast()
const router = useRouter()
definePageMeta({ layout: 'auth' })
useHead({ title: `${t('nav.driverApp')} - BunTech` })

const email = ref('')
const password = ref('')
const loading = ref(false)

async function handleSubmit() {
  if (!email.value || !password.value) return
  loading.value = true
  try {
    await authStore.login(email.value, password.value)
    if (authStore.role !== 'DRIVER') {
      toast.error(t('errors.forbidden'))
      await authStore.logout()
      return
    }
    toast.success(t('auth.loginSuccess'))
    router.push('/driver')
  } catch {
    toast.error(t('auth.invalidCredentials'))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-900 px-6">
    <div class="w-full max-w-sm">
      <div class="flex items-center gap-2 mb-8 justify-center">
        <div class="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold">B</div>
        <span class="text-xl font-bold text-white">BunTech Driver</span>
      </div>
      <div class="bg-white rounded-2xl p-8 shadow-xl">
        <h2 class="text-xl font-bold text-gray-900 mb-6">{{ t('auth.loginTitle') }}</h2>
        <form class="space-y-5" @submit.prevent="handleSubmit">
          <AppInput v-model="email" :label="t('auth.email')" type="email" :required="true" placeholder="email@example.com" />
          <AppInput v-model="password" :label="t('auth.password')" type="password" :required="true" placeholder="••••••••" />
          <AppButton type="submit" :loading="loading" block size="lg">
            {{ t('auth.loginButton') }}
          </AppButton>
        </form>
      </div>
    </div>
  </div>
</template>
