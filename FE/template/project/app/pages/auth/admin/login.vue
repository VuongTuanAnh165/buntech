<script setup lang="ts">
import { useHead } from '#imports'
const { t } = useI18n()
const authStore = useAuthStore()
const toast = useToast()
const router = useRouter()

useHead({ title: `${t('auth.loginTitle')} - BunTech Admin` })
definePageMeta({ layout: 'auth' })

const email = ref('')
const password = ref('')
const errors = ref<{ email?: string; password?: string }>({})
const loading = ref(false)

async function handleSubmit() {
  errors.value = {}
  if (!email.value) { errors.value.email = t('auth.emailRequired'); return }
  if (!password.value) { errors.value.password = t('auth.passwordRequired'); return }
  loading.value = true
  try {
    await authStore.login(email.value, password.value)
    if (authStore.role !== 'ADMIN') {
      toast.error(t('errors.forbidden'))
      await authStore.logout()
      return
    }
    toast.success(t('auth.loginSuccess'))
    router.push('/admin')
  } catch {
    toast.error(t('auth.invalidCredentials'))
  } finally {
    loading.value = false
  }
}
function onEnter() {
  if (email.value && password.value) handleSubmit()
}
</script>

<template>
  <div class="min-h-screen flex w-full">
    <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 relative overflow-hidden">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-20 left-20 w-64 h-64 rounded-full bg-white blur-3xl" />
        <div class="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-accent-300 blur-3xl" />
      </div>
      <div class="relative z-10 flex flex-col justify-center px-16 text-white">
        <div class="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-bold mb-6">B</div>
        <h1 class="text-4xl font-bold mb-4">{{ t('app.name') }}</h1>
        <p class="text-lg text-primary-100 max-w-md">{{ t('app.tagline') }}</p>
      </div>
    </div>
    <div class="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
      <div class="w-full max-w-sm">
        <div class="lg:hidden flex items-center gap-2 mb-8">
          <div class="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold">B</div>
          <span class="text-xl font-bold text-gray-900">BunTech</span>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ t('auth.loginTitle') }}</h2>
        <p class="text-gray-500 mb-8">{{ t('auth.loginSubtitle') }}</p>
        <form class="space-y-5" @submit.prevent="handleSubmit">
          <AppInput
            v-model="email"
            :label="t('auth.email')"
            type="email"
            :placeholder="'admin@buntech.vn'"
            :required="true"
            :error="errors.email"
            @keydown.enter="onEnter"
          />
          <AppInput
            v-model="password"
            :label="t('auth.password')"
            type="password"
            placeholder="••••••••"
            :required="true"
            :error="errors.password"
            @keydown.enter="onEnter"
          />
          <div class="flex items-center justify-between">
            <NuxtLink to="/auth/admin/forgot-password" class="text-sm text-primary-600 hover:text-primary-700">
              {{ t('auth.forgotPassword') }}
            </NuxtLink>
          </div>
          <AppButton type="submit" :loading="loading" block>
            {{ t('auth.loginButton') }}
          </AppButton>
        </form>
      </div>
    </div>
  </div>
</template>
