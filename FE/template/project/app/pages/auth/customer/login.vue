<script setup lang="ts">
import { ref } from 'vue'
const { t } = useI18n()
const authStore = useAuthStore()
const toast = useToast()
const router = useRouter()
definePageMeta({ layout: 'auth' })
useHead({ title: `${t('customer.customerLogin')} - BunTech` })

const mode = ref<'login' | 'register'>('login')
const email = ref('')
const password = ref('')
const fullName = ref('')
const loading = ref(false)

async function handleSubmit() {
  if (!email.value || !password.value) return
  if (mode.value === 'register' && password.value.length < 6) {
    toast.error(t('auth.passwordTooShort'))
    return
  }
  loading.value = true
  try {
    if (mode.value === 'login') {
      await authStore.login(email.value, password.value)
    } else {
      await authStore.register(email.value, password.value, fullName.value)
    }
    if (authStore.role !== 'CUSTOMER') {
      toast.error(t('errors.forbidden'))
      await authStore.logout()
      return
    }
    toast.success(t('auth.loginSuccess'))
    router.push('/portal')
  } catch {
    toast.error(mode.value === 'login' ? t('auth.invalidCredentials') : t('errors.unexpected'))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-12">
    <div class="w-full max-w-sm">
      <div class="flex items-center gap-2 mb-8 justify-center">
        <div class="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold">B</div>
        <span class="text-xl font-bold text-gray-900">BunTech</span>
      </div>
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 class="text-xl font-bold text-gray-900 mb-6">
          {{ mode === 'login' ? t('auth.loginTitle') : t('nav.register') }}
        </h2>
        <form class="space-y-4" @submit.prevent="handleSubmit">
          <AppInput
            v-if="mode === 'register'"
            v-model="fullName"
            :label="t('customers.fullName')"
            :required="true"
          />
          <AppInput v-model="email" :label="t('auth.email')" type="email" :required="true" placeholder="email@example.com" />
          <AppInput v-model="password" :label="t('auth.password')" type="password" :required="true" placeholder="••••••••" />
          <AppButton type="submit" :loading="loading" block size="lg">
            {{ mode === 'login' ? t('auth.loginButton') : t('nav.register') }}
          </AppButton>
        </form>
        <p class="text-center text-sm text-gray-500 mt-4">
          {{ mode === 'login' ? t('nav.register') : t('auth.loginTitle') }}
          <button class="text-primary-600 hover:text-primary-700 font-medium" @click="mode = mode === 'login' ? 'register' : 'login'">
            {{ mode === 'login' ? t('nav.register') : t('auth.loginButton') }}
          </button>
        </p>
      </div>
      <NuxtLink to="/" class="block text-center text-sm text-gray-500 hover:text-gray-700 mt-4">
        {{ t('common.back') }}
      </NuxtLink>
    </div>
  </div>
</template>
