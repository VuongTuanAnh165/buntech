<script setup lang="ts">
import { Truck, ArrowRight } from 'lucide-vue-next'
const { t } = useI18n()
const authStore = useAuthStore()
const toast = useToast()
const router = useRouter()

useHead({ title: `${t('auth.driverLoginTitle') || 'Đăng nhập tài xế'} - BunTech` })
definePageMeta({ layout: 'auth' })

const email = ref('')
const password = ref('')
const errors = ref<{ email?: string; password?: string }>({})
const loading = ref(false)

function validateEmail(val: string): string | undefined {
  if (!val) return t('auth.emailRequired')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return t('auth.emailInvalid')
  return undefined
}

function validatePassword(val: string): string | undefined {
  if (!val) return t('auth.passwordRequired')
  if (val.length < 6) return t('auth.passwordTooShort')
  return undefined
}

async function handleSubmit() {
  errors.value.email = validateEmail(email.value)
  errors.value.password = validatePassword(password.value)
  if (errors.value.email || errors.value.password) return

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
  <div>
    <!-- Header -->
    <div class="mb-8">
      <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary-50 dark:bg-secondary-900/20 text-secondary-700 dark:text-secondary-300 text-sm font-medium mb-4">
        <Truck class="w-4 h-4" aria-hidden="true" />
        {{ t('auth.driverPortal') || 'Driver Portal' }}
      </div>
      <h2 class="text-2xl font-bold text-surface-foreground mb-2 tracking-tight">{{ t('auth.driverLoginTitle') || 'Đăng nhập tài xế' }}</h2>
      <p class="text-sm text-slate-500 dark:text-zinc-400">{{ t('auth.loginSubtitle') }}</p>
    </div>

    <!-- Form -->
    <form class="space-y-5" novalidate @submit.prevent="handleSubmit">
      <AppInput
        v-model="email"
        :label="t('auth.email')"
        type="email"
        placeholder="driver@buntech.vn"
        :required="true"
        :error="errors.email"
        autocomplete="email"
        @blur="errors.email = validateEmail(email)"
      />

      <AppInput
        v-model="password"
        :label="t('auth.password')"
        type="password"
        placeholder="••••••••"
        :required="true"
        :error="errors.password"
        autocomplete="current-password"
        @blur="errors.password = validatePassword(password)"
      />

      <AppButton type="submit" :loading="loading" block size="lg" class="!mt-8 group">
        {{ t('auth.loginButton') }}
        <ArrowRight v-if="!loading" class="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </AppButton>
    </form>

    <!-- Quick links -->
    <div class="mt-6 flex items-center justify-center gap-4 text-sm">
      <NuxtLink to="/auth/admin/login" class="text-slate-500 dark:text-zinc-400 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
        {{ t('auth.adminLogin') || 'Admin' }}
      </NuxtLink>
      <span class="text-slate-300 dark:text-zinc-600" aria-hidden="true">•</span>
      <NuxtLink to="/auth/customer/login" class="text-slate-500 dark:text-zinc-400 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
        {{ t('customer.customerLogin') }}
      </NuxtLink>
    </div>

    <NuxtLink to="/" class="block text-center text-sm text-slate-400 dark:text-zinc-500 hover:text-surface-foreground mt-6 transition-colors">
      ← {{ t('common.back') }}
    </NuxtLink>
  </div>
</template>
