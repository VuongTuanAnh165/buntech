<script setup lang="ts">
import {
  Shield, KeyRound, Check, X, ShieldCheck,
  Clock, Smartphone, Monitor, Lightbulb, AlertTriangle, CheckCircle2,
  TrendingUp, Sparkles,
} from 'lucide-vue-next'

const { t } = useI18n()
const authStore = useAuthStore()
const toast = useToast()
useHead({ title: `${t('nav.changePassword')} - BunTech Admin` })
definePageMeta({ layout: 'admin' })

const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const errors = ref<Record<string, string>>({})
const saving = ref(false)
const showStrength = ref(false)

// Password strength
interface Requirement {
  label: string
  test: (pw: string) => boolean
}

const requirements: Requirement[] = [
  { label: 'Ít nhất 6 ký tự', test: pw => pw.length >= 6 },
  { label: 'Có chữ số', test: pw => /\d/.test(pw) },
  { label: 'Có chữ in hoa', test: pw => /[A-Z]/.test(pw) },
  { label: 'Có ký tự đặc biệt', test: pw => /[^A-Za-z0-9]/.test(pw) },
]

const metRequirements = computed(() => requirements.map(r => r.test(newPassword.value)))
const metCount = computed(() => metRequirements.value.filter(Boolean).length)

const strengthLevel = computed(() => {
  if (!newPassword.value) return 0
  return metCount.value
})

const strengthInfo = computed(() => {
  const levels = [
    { label: 'Chưa nhập', color: 'bg-slate-200 dark:bg-zinc-700', text: 'text-slate-400 dark:text-zinc-500', barWidth: '0%' },
    { label: 'Yếu', color: 'bg-danger-500', text: 'text-danger-600 dark:text-danger-400', barWidth: '25%' },
    { label: 'Trung bình', color: 'bg-warning-500', text: 'text-warning-600 dark:text-warning-400', barWidth: '50%' },
    { label: 'Khá', color: 'bg-info-500', text: 'text-info-600 dark:text-info-400', barWidth: '75%' },
    { label: 'Mạnh', color: 'bg-success-500', text: 'text-success-600 dark:text-success-400', barWidth: '100%' },
  ]
  return levels[strengthLevel.value]
})

// Security tips
const securityTips = [
  { icon: CheckCircle2, text: 'Sử dụng mật khẩu dài ít nhất 8 ký tự', color: 'success' as const },
  { icon: CheckCircle2, text: 'Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt', color: 'success' as const },
  { icon: CheckCircle2, text: 'Không dùng thông tin cá nhân (tên, SĐT, ngày sinh)', color: 'success' as const },
  { icon: AlertTriangle, text: 'Không trùng với mật khẩu của tài khoản khác', color: 'warning' as const },
  { icon: AlertTriangle, text: 'Đổi mật khẩu định kỳ mỗi 3-6 tháng', color: 'warning' as const },
  { icon: ShieldAlert, text: 'Không chia sẻ mật khẩu cho bất kỳ ai', color: 'danger' as const },
]

const tipColorMap: Record<string, string> = {
  success: 'text-success-600 dark:text-success-400',
  warning: 'text-warning-600 dark:text-warning-400',
  danger: 'text-danger-600 dark:text-danger-400',
}

// Recent password changes timeline (mock)
const passwordHistory = ref([
  { id: 'ph-1', date: new Date(Date.now() - 7 * 86400000).toISOString(), label: 'Đổi mật khẩu', note: 'Tự đổi từ trang Bảo mật', current: true },
  { id: 'ph-2', date: new Date(Date.now() - 45 * 86400000).toISOString(), label: 'Đổi mật khẩu', note: 'Yêu cầu bởi quản trị viên', current: false },
  { id: 'ph-3', date: new Date(Date.now() - 120 * 86400000).toISOString(), label: 'Tạo mật khẩu đầu tiên', note: 'Khi đăng ký tài khoản', current: false },
])

const twoFAEnabled = ref(false)
const accountSecurity = computed(() => [
  { label: 'Xác thực 2 bước', value: twoFAEnabled.value ? 'Đã bật' : 'Chưa bật', color: twoFAEnabled.value ? 'success' : 'warning' as const, icon: Smartphone },
  { label: 'Mật khẩu lần cuối', value: '7 ngày trước', color: 'info' as const, icon: KeyRound },
  { label: 'Phiên hoạt động', value: '2 thiết bị', color: 'primary' as const, icon: Monitor },
])

const securityColorMap: Record<string, { bg: string; text: string; ring: string }> = {
  success: { bg: 'bg-success-50 dark:bg-success-900/20', text: 'text-success-600 dark:text-success-400', ring: 'ring-success-100 dark:ring-success-900/30' },
  warning: { bg: 'bg-warning-50 dark:bg-warning-900/20', text: 'text-warning-600 dark:text-warning-400', ring: 'ring-warning-100 dark:ring-warning-900/30' },
  info: { bg: 'bg-info-50 dark:bg-info-900/20', text: 'text-info-600 dark:text-info-400', ring: 'ring-info-100 dark:ring-info-900/30' },
  primary: { bg: 'bg-primary-50 dark:bg-primary-900/20', text: 'text-primary-600 dark:text-primary-400', ring: 'ring-primary-100 dark:ring-primary-900/30' },
}

const securityBadgeColor: Record<string, 'success' | 'warning' | 'info' | 'primary'> = {
  success: 'success',
  warning: 'warning',
  info: 'info',
  primary: 'primary',
}

async function handleSubmit() {
  errors.value = {}
  if (!oldPassword.value) { errors.value.oldPassword = t('common.required'); return }
  if (newPassword.value.length < 6) { errors.value.newPassword = t('auth.passwordTooShort'); return }
  if (newPassword.value !== confirmPassword.value) { errors.value.confirmPassword = t('auth.passwordMismatch'); return }
  if (newPassword.value === oldPassword.value) { errors.value.newPassword = 'Mật khẩu mới phải khác mật khẩu cũ'; return }
  saving.value = true
  try {
    await authStore.changePassword(oldPassword.value, newPassword.value)
    toast.success(t('auth.passwordChanged'))
    oldPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    showStrength.value = false
    // Prepend new entry to history
    passwordHistory.value.unshift({
      id: `ph-${Date.now()}`,
      date: new Date().toISOString(),
      label: 'Đổi mật khẩu',
      note: 'Tự đổi từ trang Bảo mật',
      current: true,
    })
    passwordHistory.value = passwordHistory.value.map((h, i) => ({ ...h, current: i === 0 }))
  } catch {
    toast.error(t('errors.saveFailed'))
  } finally {
    saving.value = false
  }
}

watch(newPassword, (val) => {
  showStrength.value = val.length > 0
})
</script>

<template>
  <div>
    <AppPageHeader
      :title="t('nav.changePassword')"
      subtitle="Bảo mật tài khoản bằng mật khẩu mạnh và định kỳ cập nhật"
      :breadcrumb-label="t('nav.changePassword')"
    >
      <template #actions>
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success-50 dark:bg-success-900/20 ring-1 ring-success-100 dark:ring-success-900/30">
          <ShieldCheck class="w-4 h-4 text-success-600 dark:text-success-400" aria-hidden="true" />
          <span class="text-xs font-medium text-success-700 dark:text-success-300">Tài khoản được bảo vệ</span>
        </div>
      </template>
    </AppPageHeader>

    <div class="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
      <!-- Left: Change Password Form -->
      <div class="lg:col-span-3">
        <div class="card p-5 sm:p-6 stagger-item" style="animation-delay: 0ms">
          <div class="flex items-center gap-2.5 mb-5">
            <div class="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center ring-1 ring-primary-100 dark:ring-primary-900/30">
              <KeyRound class="w-[18px] h-[18px] text-primary-600 dark:text-primary-400" aria-hidden="true" />
            </div>
            <div>
              <h2 class="text-sm font-semibold text-surface-foreground">Đặt mật khẩu mới</h2>
              <p class="text-xs text-slate-500 dark:text-zinc-400">Mật khẩu mới phải đáp ứng các yêu cầu bên dưới</p>
            </div>
          </div>

          <form class="space-y-4" @submit.prevent="handleSubmit">
            <AppInput
              v-model="oldPassword"
              :label="t('auth.oldPassword')"
              type="password"
              :required="true"
              :error="errors.oldPassword"
              hint="Nhập mật khẩu hiện tại của bạn"
            />

            <div>
              <AppInput
                v-model="newPassword"
                :label="t('auth.newPassword')"
                type="password"
                :required="true"
                :error="errors.newPassword"
              />

              <!-- Strength meter -->
              <Transition name="fade">
                <div v-if="showStrength" class="mt-3">
                  <div class="flex items-center justify-between mb-1.5">
                    <span class="text-xs text-slate-500 dark:text-zinc-400">Độ mạnh mật khẩu</span>
                    <span :class="['text-xs font-medium', strengthInfo.text]">{{ strengthInfo.label }}</span>
                  </div>
                  <div class="h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      :class="['h-full rounded-full transition-all duration-300', strengthInfo.color]"
                      :style="{ width: strengthInfo.barWidth }"
                    />
                  </div>
                </div>
              </Transition>
            </div>

            <AppInput
              v-model="confirmPassword"
              :label="t('auth.confirmPassword')"
              type="password"
              :required="true"
              :error="errors.confirmPassword"
            />

            <!-- Requirements checklist -->
            <div class="rounded-lg border border-surface-border bg-surface-hover/40 p-4">
              <p class="text-xs font-medium text-surface-foreground mb-3 flex items-center gap-1.5">
                <Sparkles class="w-3.5 h-3.5 text-primary-500" aria-hidden="true" />
                Yêu cầu mật khẩu
              </p>
              <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <li
                  v-for="(req, i) in requirements"
                  :key="req.label"
                  class="flex items-center gap-2 text-sm"
                >
                  <span
                    :class="[
                      'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all',
                      metRequirements[i]
                        ? 'bg-success-100 dark:bg-success-900/30'
                        : 'bg-slate-100 dark:bg-zinc-800',
                    ]"
                  >
                    <Check v-if="metRequirements[i]" class="w-3 h-3 text-success-600 dark:text-success-400" aria-hidden="true" />
                    <X v-else class="w-3 h-3 text-slate-400 dark:text-zinc-500" aria-hidden="true" />
                  </span>
                  <span :class="metRequirements[i] ? 'text-surface-foreground font-medium' : 'text-slate-500 dark:text-zinc-400'">
                    {{ req.label }}
                  </span>
                </li>
              </ul>
            </div>

            <div class="flex items-center gap-2 p-3 rounded-lg bg-info-50 dark:bg-info-900/20 border border-info-100 dark:border-info-900/30">
              <Lightbulb class="w-4 h-4 text-info-600 dark:text-info-400 flex-shrink-0" aria-hidden="true" />
              <p class="text-xs text-info-700 dark:text-info-300 leading-relaxed">
                Mẹo: Dùng một cụm từ dễ nhớ rồi thay thế vài ký tự thành số và ký tự đặc biệt, ví dụ "BunTech@2024".
              </p>
            </div>

            <div class="flex gap-3 pt-1">
              <AppButton type="submit" :loading="saving" :disabled="metCount < 2" size="lg" block>
                <Shield class="w-4 h-4" aria-hidden="true" />
                {{ t('auth.changePasswordTitle') }}
              </AppButton>
            </div>
          </form>
        </div>
      </div>

      <!-- Right: Security sidebar -->
      <div class="lg:col-span-2 space-y-4 lg:space-y-6">
        <!-- Security Tips -->
        <div class="card p-5 stagger-item" style="animation-delay: 80ms">
          <div class="flex items-center gap-2.5 mb-4">
            <div class="w-8 h-8 rounded-lg bg-accent-50 dark:bg-accent-900/20 flex items-center justify-center ring-1 ring-accent-100 dark:ring-accent-900/30">
              <Lightbulb class="w-4 h-4 text-accent-600 dark:text-accent-400" aria-hidden="true" />
            </div>
            <h3 class="text-sm font-semibold text-surface-foreground">Mẹo bảo mật</h3>
          </div>
          <ul class="space-y-2.5">
            <li
              v-for="tip in securityTips"
              :key="tip.text"
              class="flex items-start gap-2.5"
            >
              <component :is="tip.icon" :class="['w-4 h-4 flex-shrink-0 mt-0.5', tipColorMap[tip.color]]" aria-hidden="true" />
              <span class="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">{{ tip.text }}</span>
            </li>
          </ul>
        </div>

        <!-- Recent Password Changes -->
        <div class="card p-5 stagger-item" style="animation-delay: 140ms">
          <div class="flex items-center gap-2.5 mb-4">
            <div class="w-8 h-8 rounded-lg bg-info-50 dark:bg-info-900/20 flex items-center justify-center ring-1 ring-info-100 dark:ring-info-900/30">
              <Clock class="w-4 h-4 text-info-600 dark:text-info-400" aria-hidden="true" />
            </div>
            <h3 class="text-sm font-semibold text-surface-foreground">Lịch sử đổi mật khẩu</h3>
          </div>
          <ol class="relative">
            <div class="absolute left-[15px] top-2 bottom-2 w-px bg-surface-border" aria-hidden="true" />
            <li
              v-for="(entry, idx) in passwordHistory"
              :key="entry.id"
              class="relative flex gap-3 pb-4 last:pb-0"
            >
              <div
                :class="[
                  'relative z-10 w-8 h-8 rounded-full flex items-center justify-center ring-1 flex-shrink-0',
                  entry.current
                    ? 'bg-success-50 dark:bg-success-900/20 ring-success-200/60 dark:ring-success-800/40'
                    : 'bg-surface-hover ring-surface-border',
                ]"
              >
                <KeyRound
                  :class="[
                    'w-3.5 h-3.5',
                    entry.current ? 'text-success-600 dark:text-success-400' : 'text-slate-400 dark:text-zinc-500',
                  ]"
                  aria-hidden="true"
                />
              </div>
              <div class="flex-1 min-w-0 pt-1">
                <div class="flex items-center gap-2">
                  <p class="text-sm font-medium text-surface-foreground">{{ entry.label }}</p>
                  <AppBadge v-if="entry.current" color="success" size="sm">Hiện tại</AppBadge>
                </div>
                <p class="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{{ entry.note }}</p>
                <p class="text-xs text-slate-400 dark:text-zinc-500 mt-0.5 tabular-nums">
                  {{ new Date(entry.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) }}
                </p>
              </div>
            </li>
          </ol>
        </div>

        <!-- Account Security Status -->
        <div class="card p-5 stagger-item" style="animation-delay: 200ms">
          <div class="flex items-center gap-2.5 mb-4">
            <div class="w-8 h-8 rounded-lg bg-success-50 dark:bg-success-900/20 flex items-center justify-center ring-1 ring-success-100 dark:ring-success-900/30">
              <ShieldCheck class="w-4 h-4 text-success-600 dark:text-success-400" aria-hidden="true" />
            </div>
            <h3 class="text-sm font-semibold text-surface-foreground">Tình trạng bảo mật</h3>
          </div>
          <div class="space-y-2.5">
            <div
              v-for="item in accountSecurity"
              :key="item.label"
              class="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-surface-hover/50"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <div :class="['w-8 h-8 rounded-lg flex items-center justify-center ring-1 flex-shrink-0', securityColorMap[item.color].bg, securityColorMap[item.color].ring]">
                  <component :is="item.icon" :class="['w-3.5 h-3.5', securityColorMap[item.color].text]" aria-hidden="true" />
                </div>
                <span class="text-sm text-slate-600 dark:text-zinc-300">{{ item.label }}</span>
              </div>
              <AppBadge :color="securityBadgeColor[item.color]">{{ item.value }}</AppBadge>
            </div>
          </div>

          <div class="mt-4 p-3 rounded-lg bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border border-primary-100 dark:border-primary-900/30">
            <div class="flex items-start gap-2.5">
              <TrendingUp class="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p class="text-xs font-medium text-primary-700 dark:text-primary-300">Điểm bảo mật</p>
                <p class="text-xs text-slate-600 dark:text-zinc-300 mt-0.5">Tài khoản của bạn đạt mức <span class="font-semibold text-success-600 dark:text-success-400">Tốt</span>. Bật xác thực 2 bước để đạt mức Xuất sắc.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
