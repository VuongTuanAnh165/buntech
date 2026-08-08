<script setup lang="ts">
import { ShieldCheck, ArrowRight } from 'lucide-vue-next'
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

function onEmailBlur() {
  errors.value.email = validateEmail(email.value)
}

function onPasswordBlur() {
  errors.value.password = validatePassword(password.value)
}

async function handleSubmit() {
  errors.value.email = validateEmail(email.value)
  errors.value.password = validatePassword(password.value)
  if (errors.value.email || errors.value.password) return

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
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-sm font-medium mb-4 ring-1 ring-primary-200/50 dark:ring-primary-800/40">
        <ShieldCheck class="w-4 h-4" aria-hidden="true" />
        {{ t('auth.adminPortal') || 'Admin Portal' }}
      </div>
      <h2 class="text-2xl font-bold text-surface-foreground mb-2 tracking-tight" style="letter-spacing: -0.02em">{{ t('auth.loginTitle') }}</h2>
      <p class="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">{{ t('auth.loginSubtitle') }}</p>
    </div>

    <!-- Form -->
    <form class="space-y-4" novalidate @submit.prevent="handleSubmit">
      <AppInput
        v-model="email"
        :label="t('auth.email')"
        type="email"
        placeholder="admin@buntech.vn"
        :required="true"
        :error="errors.email"
        autocomplete="email"
        @blur="onEmailBlur"
      />

      <AppInput
        v-model="password"
        :label="t('auth.password')"
        type="password"
        placeholder="••••••••"
        :required="true"
        :error="errors.password"
        autocomplete="current-password"
        @blur="onPasswordBlur"
      />

      <div class="flex justify-end -mt-3">
        <NuxtLink to="/auth/admin/forgot-password" class="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors">
          {{ t('auth.forgotPassword') }}
        </NuxtLink>
      </div>

      <AppButton type="submit" :loading="loading" block size="lg" class="!mt-6 group">
        {{ t('auth.loginButton') }}
        <ArrowRight v-if="!loading" class="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </AppButton>
    </form>

    <!-- Divider -->
    <div class="relative my-6">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-surface-border" />
      </div>
      <div class="relative flex justify-center">
        <span class="px-3 bg-surface-muted text-xs text-slate-400 dark:text-zinc-500 uppercase tracking-wider">{{ t('auth.or') || 'hoặc' }}</span>
      </div>
    </div>

    <!-- Quick links -->
    <div class="grid grid-cols-2 gap-3">
      <NuxtLink to="/auth/driver/login">
        <AppButton variant="outline" block class="!text-sm">
          {{ t('nav.driverApp') }}
        </AppButton>
      </NuxtLink>
      <NuxtLink to="/auth/customer/login">
        <AppButton variant="outline" block class="!text-sm">
          {{ t('customer.customerLogin') }}
        </AppButton>
      </NuxtLink>
    </div>

    <p class="text-center text-xs text-slate-400 dark:text-zinc-500 mt-8">
      {{ t('auth.needHelp') || 'Cần hỗ trợ? Liên hệ' }}
      <a href="mailto:support@buntech.vn" class="text-primary-600 dark:text-primary-400 font-medium hover:underline">support@buntech.vn</a>
    </p>
  </div>
</template>
