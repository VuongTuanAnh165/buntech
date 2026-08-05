<script setup lang="ts">
import { ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-vue-next'
const { t } = useI18n()
const toast = useToast()
const router = useRouter()

useHead({ title: `${t('auth.resetPassword')} - BunTech` })
definePageMeta({ layout: 'auth' })

const password = ref('')
const confirmPassword = ref('')
const errors = ref<{ password?: string; confirmPassword?: string }>({})
const loading = ref(false)
const success = ref(false)

const strength = computed(() => {
  const val = password.value
  if (!val) return 0
  let score = 0
  if (val.length >= 6) score++
  if (val.length >= 10) score++
  if (/[A-Z]/.test(val)) score++
  if (/[0-9]/.test(val)) score++
  if (/[^A-Za-z0-9]/.test(val)) score++
  return Math.min(score, 4)
})

const strengthLabel = computed(() => {
  const labels = ['', 'Yếu', 'Trung bình', 'Khá', 'Mạnh']
  return labels[strength.value] || ''
})

const strengthColor = computed(() => {
  const colors = ['', 'bg-danger-500', 'bg-warning-500', 'bg-accent-500', 'bg-success-500']
  return colors[strength.value] || ''
})

function validatePassword(val: string): string | undefined {
  if (!val) return t('auth.passwordRequired')
  if (val.length < 6) return t('auth.passwordTooShort')
  return undefined
}

function validateConfirm(val: string): string | undefined {
  if (!val) return t('auth.confirmPasswordRequired')
  if (val !== password.value) return t('auth.passwordsDoNotMatch')
  return undefined
}

async function handleSubmit() {
  errors.value.password = validatePassword(password.value)
  errors.value.confirmPassword = validateConfirm(confirmPassword.value)
  if (errors.value.password || errors.value.confirmPassword) return

  loading.value = true
  try {
    // TODO: Connect to Supabase auth.updateUser({ password })
    await new Promise(resolve => setTimeout(resolve, 1200))
    success.value = true
    toast.success(t('auth.passwordResetSuccess'))
  } catch {
    toast.error(t('errors.unexpected'))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <NuxtLink to="/auth/admin/login" class="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-zinc-400 hover:text-surface-foreground transition-colors mb-6 min-h-[44px] px-2 -ml-2 rounded-md">
      <ArrowLeft class="w-4 h-4" aria-hidden="true" />
      {{ t('common.back') }}
    </NuxtLink>

    <!-- Header -->
    <div class="mb-8">
      <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-sm font-medium mb-4">
        <ShieldCheck class="w-4 h-4" aria-hidden="true" />
        {{ t('auth.resetPassword') }}
      </div>
      <h2 class="text-2xl font-bold text-surface-foreground mb-2 tracking-tight">{{ t('auth.resetPasswordTitle') }}</h2>
      <p class="text-sm text-gray-500 dark:text-zinc-400">{{ t('auth.resetPasswordSubtitle') }}</p>
    </div>

    <Transition name="fade" mode="out-in">
      <!-- Success state -->
      <div v-if="success" key="success" class="text-center py-8 animate-scale-in">
        <div class="w-16 h-16 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 class="w-8 h-8 text-success-600 dark:text-success-400" aria-hidden="true" />
        </div>
        <h3 class="text-lg font-semibold text-surface-foreground mb-2">{{ t('auth.passwordResetSuccess') }}</h3>
        <p class="text-sm text-gray-500 dark:text-zinc-400 mb-6">{{ t('auth.passwordResetSuccessDesc') || 'Mật khẩu đã được cập nhật. Vui lòng đăng nhập lại.' }}</p>
        <AppButton variant="primary" block @click="router.push('/auth/admin/login')">
          {{ t('auth.loginTitle') }}
        </AppButton>
      </div>

      <!-- Form -->
      <form v-else key="form" class="space-y-5" novalidate @submit.prevent="handleSubmit">
        <AppInput
          v-model="password"
          :label="t('auth.newPassword')"
          type="password"
          placeholder="••••••••"
          :required="true"
          :error="errors.password"
          autocomplete="new-password"
          @blur="errors.password = validatePassword(password)"
        />
        <!-- Password strength -->
        <div v-if="password" class="-mt-3">
          <div class="flex gap-1.5">
            <div
              v-for="i in 4"
              :key="i"
              :class="['h-1.5 flex-1 rounded-full transition-all duration-300', i <= strength ? strengthColor : 'bg-surface-border']"
            />
          </div>
          <p class="text-xs text-slate-400 dark:text-zinc-500 mt-1.5">{{ strengthLabel }}</p>
        </div>

        <AppInput
          v-model="confirmPassword"
          :label="t('auth.confirmPassword')"
          type="password"
          placeholder="••••••••"
          :required="true"
          :error="errors.confirmPassword"
          autocomplete="new-password"
          @blur="errors.confirmPassword = validateConfirm(confirmPassword)"
        />
        <p v-if="confirmPassword && confirmPassword === password && !errors.confirmPassword" class="-mt-3 text-sm text-success-600 dark:text-success-400 flex items-center gap-1">
          <CheckCircle2 class="w-3.5 h-3.5" aria-hidden="true" /> {{ t('auth.passwordsMatch') }}
        </p>

        <AppButton type="submit" :loading="loading" block size="lg" class="!mt-8">
          {{ t('auth.resetPasswordButton') }}
        </AppButton>
      </form>
    </Transition>
  </div>
</template>
