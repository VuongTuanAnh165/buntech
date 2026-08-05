<script setup lang="ts">
import { User, ArrowRight, ShoppingBag, CheckCircle2 } from 'lucide-vue-next'
const { t } = useI18n()
const authStore = useAuthStore()
const toast = useToast()
const router = useRouter()

useHead({ title: `${t('customer.customerLogin')} - BunTech` })
definePageMeta({ layout: 'auth' })

const mode = ref<'login' | 'register'>('login')
const email = ref('')
const password = ref('')
const fullName = ref('')
const errors = ref<{ email?: string; password?: string; fullName?: string }>({})
const loading = ref(false)

function validateEmail(val: string): string | undefined {
  if (!val) return t('auth.emailRequired')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return t('auth.emailInvalid')
  return undefined
}

function validatePassword(val: string): string | undefined {
  if (!val) return t('auth.passwordRequired')
  if (mode.value === 'register' && val.length < 6) return t('auth.passwordTooShort')
  return undefined
}

function validateName(val: string): string | undefined {
  if (mode.value !== 'register') return undefined
  if (!val || val.trim().length < 2) return t('auth.nameRequired')
  return undefined
}

function switchMode(newMode: 'login' | 'register') {
  if (mode.value === newMode) return
  mode.value = newMode
  errors.value = {}
}

async function handleSubmit() {
  errors.value.email = validateEmail(email.value)
  errors.value.password = validatePassword(password.value)
  errors.value.fullName = validateName(fullName.value)
  if (errors.value.email || errors.value.password || errors.value.fullName) return

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
    toast.success(mode.value === 'login' ? t('auth.loginSuccess') : t('auth.registerSuccess'))
    router.push('/portal')
  } catch {
    toast.error(mode.value === 'login' ? t('auth.invalidCredentials') : t('errors.unexpected'))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-50 dark:bg-accent-900/20 text-accent-700 dark:text-accent-300 text-sm font-medium mb-4">
        <ShoppingBag class="w-4 h-4" aria-hidden="true" />
        {{ t('auth.customerPortal') || 'Customer Portal' }}
      </div>
      <h2 class="text-2xl font-bold text-surface-foreground mb-2 tracking-tight">
        {{ mode === 'login' ? t('auth.loginTitle') : t('auth.registerTitle') }}
      </h2>
      <p class="text-sm text-gray-500 dark:text-zinc-400">
        {{ mode === 'login' ? t('auth.loginSubtitle') : t('auth.registerSubtitle') }}
      </p>
    </div>

    <!-- Mode Toggle -->
    <div class="grid grid-cols-2 gap-1 p-1 bg-surface-hover rounded-xl mb-6" role="tablist">
      <button
        type="button"
        :class="[
          'py-2.5 rounded-lg text-sm font-medium transition-all duration-200 min-h-[44px]',
          mode === 'login' ? 'bg-surface text-primary-600 dark:text-primary-400 shadow-sm' : 'text-gray-500 dark:text-zinc-400 hover:text-surface-foreground',
        ]"
        role="tab"
        :aria-selected="mode === 'login'"
        @click="switchMode('login')"
      >
        {{ t('auth.loginTitle') }}
      </button>
      <button
        type="button"
        :class="[
          'py-2.5 rounded-lg text-sm font-medium transition-all duration-200 min-h-[44px]',
          mode === 'register' ? 'bg-surface text-primary-600 dark:text-primary-400 shadow-sm' : 'text-gray-500 dark:text-zinc-400 hover:text-surface-foreground',
        ]"
        role="tab"
        :aria-selected="mode === 'register'"
        @click="switchMode('register')"
      >
        {{ t('nav.register') }}
      </button>
    </div>

    <!-- Form -->
    <form class="space-y-5" novalidate @submit.prevent="handleSubmit">
      <Transition name="fade" mode="out-in">
        <AppInput
          v-if="mode === 'register'"
          key="fullName"
          v-model="fullName"
          :label="t('customers.fullName')"
          :required="true"
          :error="errors.fullName"
          placeholder="Nguyễn Văn A"
          autocomplete="name"
          @blur="errors.fullName = validateName(fullName)"
        />
      </Transition>

      <AppInput
        v-model="email"
        :label="t('auth.email')"
        type="email"
        placeholder="email@example.com"
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
        :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
        :hint="mode === 'register' && !errors.password ? (t('auth.passwordHint') || 'Tối thiểu 6 ký tự') : ''"
        @blur="errors.password = validatePassword(password)"
      />

      <AppButton type="submit" :loading="loading" block size="lg" class="!mt-8 group">
        {{ mode === 'login' ? t('auth.loginButton') : t('nav.register') }}
        <ArrowRight v-if="!loading" class="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </AppButton>
    </form>

    <!-- Register benefits -->
    <Transition name="fade">
      <div v-if="mode === 'register'" class="mt-6 p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20">
        <div class="flex items-start gap-3">
          <CheckCircle2 class="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div class="text-sm text-primary-700 dark:text-primary-300 space-y-1">
            <p>{{ t('auth.benefit1') || 'Đặt hàng nhanh chóng với giá sỉ' }}</p>
            <p>{{ t('auth.benefit2') || 'Theo dõi công nợ và lịch sử đơn hàng' }}</p>
            <p>{{ t('auth.benefit3') || 'Nhận thông báo khi đơn hàng được giao' }}</p>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Quick links -->
    <div class="mt-6 flex items-center justify-center gap-4 text-sm">
      <NuxtLink to="/auth/admin/login" class="text-gray-500 dark:text-zinc-400 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
        {{ t('auth.adminLogin') || 'Admin' }}
      </NuxtLink>
      <span class="text-gray-300 dark:text-zinc-600" aria-hidden="true">•</span>
      <NuxtLink to="/auth/driver/login" class="text-gray-500 dark:text-zinc-400 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
        {{ t('nav.driverApp') }}
      </NuxtLink>
    </div>

    <NuxtLink to="/" class="block text-center text-sm text-gray-400 dark:text-zinc-500 hover:text-surface-foreground mt-6 transition-colors">
      ← {{ t('common.back') }}
    </NuxtLink>
  </div>
</template>
