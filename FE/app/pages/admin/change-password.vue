<script setup lang="ts">
import { changePasswordSchema } from '~~/core/validators/auth.validator'
import { authService } from '~~/core/services/auth.service'
import type { z } from 'zod'

const toast = useToast()
useSeoMeta({ title: 'Đổi mật khẩu - BunTech Admin' })
definePageMeta({ layout: 'admin' })

type Schema = z.output<typeof changePasswordSchema>

const state = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const {
  submit: handleChangePassword,
  saving,
  formRef
} = useFormSubmit<Schema>(
  async (data) => {
    await authService.changePassword({
      oldPassword: data.oldPassword,
      newPassword: data.newPassword
    })
  },
  {
    onSuccess() {
      toast.add({ title: 'Đổi mật khẩu thành công', color: 'success' })
      state.oldPassword = ''
      state.newPassword = ''
      state.confirmPassword = ''

      // Update history mock
      passwordHistory.value.unshift({
        id: `ph-${Date.now()}`,
        date: new Date().toISOString(),
        label: 'Đổi mật khẩu',
        note: 'Tự đổi từ trang Bảo mật',
        current: true
      })
      passwordHistory.value = passwordHistory.value.map((h, i) => ({ ...h, current: i === 0 }))
    },
    onError(error) {
      toast.add({ title: 'Đổi mật khẩu thất bại', description: error.message, color: 'error' })
    }
  }
)

const showStrength = ref(false)

// Password strength
interface Requirement {
  label: string
  test: (pw: string) => boolean
}

const requirements: Requirement[] = [
  { label: 'Ít nhất 6 ký tự', test: (pw) => pw.length >= 6 },
  { label: 'Có chữ số', test: (pw) => /\d/.test(pw) },
  { label: 'Có chữ in hoa', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'Có ký tự đặc biệt', test: (pw) => /[^A-Za-z0-9]/.test(pw) }
]

const metRequirements = computed(() => requirements.map((r) => r.test(state.newPassword)))
const metCount = computed(() => metRequirements.value.filter(Boolean).length)

const strengthLevel = computed(() => {
  if (!state.newPassword) return 0
  return metCount.value
})

const strengthInfo = computed(() => {
  const levels = [
    {
      label: 'Chưa nhập',
      color: 'bg-slate-200 dark:bg-zinc-700',
      text: 'text-slate-400 dark:text-zinc-500',
      barWidth: '0%'
    },
    {
      label: 'Yếu',
      color: 'bg-error-500',
      text: 'text-error-600 dark:text-error-400',
      barWidth: '25%'
    },
    {
      label: 'Trung bình',
      color: 'bg-warning-500',
      text: 'text-warning-600 dark:text-warning-400',
      barWidth: '50%'
    },
    {
      label: 'Khá',
      color: 'bg-info-500',
      text: 'text-info-600 dark:text-info-400',
      barWidth: '75%'
    },
    {
      label: 'Mạnh',
      color: 'bg-success-500',
      text: 'text-success-600 dark:text-success-400',
      barWidth: '100%'
    }
  ]
  return levels[strengthLevel.value]
})

// Security tips
const securityTips = [
  {
    icon: 'i-lucide-check-circle-2',
    text: 'Sử dụng mật khẩu dài ít nhất 8 ký tự',
    color: 'success' as const
  },
  {
    icon: 'i-lucide-check-circle-2',
    text: 'Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt',
    color: 'success' as const
  },
  {
    icon: 'i-lucide-check-circle-2',
    text: 'Không dùng thông tin cá nhân (tên, SĐT, ngày sinh)',
    color: 'success' as const
  },
  {
    icon: 'i-lucide-alert-triangle',
    text: 'Không trùng với mật khẩu của tài khoản khác',
    color: 'warning' as const
  },
  {
    icon: 'i-lucide-alert-triangle',
    text: 'Đổi mật khẩu định kỳ mỗi 3-6 tháng',
    color: 'warning' as const
  },
  {
    icon: 'i-lucide-shield-alert',
    text: 'Không chia sẻ mật khẩu cho bất kỳ ai',
    color: 'error' as const
  }
]

const tipColorMap: Record<string, string> = {
  success: 'text-success-600 dark:text-success-400',
  warning: 'text-warning-600 dark:text-warning-400',
  error: 'text-error-600 dark:text-error-400'
}

// Recent password changes timeline (mock)
const passwordHistory = ref([
  {
    id: 'ph-1',
    date: new Date(Date.now() - 7 * 86400000).toISOString(),
    label: 'Đổi mật khẩu',
    note: 'Tự đổi từ trang Bảo mật',
    current: true
  },
  {
    id: 'ph-2',
    date: new Date(Date.now() - 45 * 86400000).toISOString(),
    label: 'Đổi mật khẩu',
    note: 'Yêu cầu bởi quản trị viên',
    current: false
  },
  {
    id: 'ph-3',
    date: new Date(Date.now() - 120 * 86400000).toISOString(),
    label: 'Tạo mật khẩu đầu tiên',
    note: 'Khi đăng ký tài khoản',
    current: false
  }
])

const twoFAEnabled = ref(false)
const accountSecurity = computed(() => [
  {
    label: 'Xác thực 2 bước',
    value: twoFAEnabled.value ? 'Đã bật' : 'Chưa bật',
    color: twoFAEnabled.value ? 'success' : ('warning' as const),
    icon: 'i-lucide-smartphone'
  },
  {
    label: 'Mật khẩu lần cuối',
    value: '7 ngày trước',
    color: 'info' as const,
    icon: 'i-lucide-key-round'
  },
  {
    label: 'Phiên hoạt động',
    value: '2 thiết bị',
    color: 'primary' as const,
    icon: 'i-lucide-monitor'
  }
])

const securityColorMap: Record<string, { bg: string; text: string; ring: string }> = {
  success: {
    bg: 'bg-success-50 dark:bg-success-900/20',
    text: 'text-success-600 dark:text-success-400',
    ring: 'ring-success-100 dark:ring-success-900/30'
  },
  warning: {
    bg: 'bg-warning-50 dark:bg-warning-900/20',
    text: 'text-warning-600 dark:text-warning-400',
    ring: 'ring-warning-100 dark:ring-warning-900/30'
  },
  info: {
    bg: 'bg-info-50 dark:bg-info-900/20',
    text: 'text-info-600 dark:text-info-400',
    ring: 'ring-info-100 dark:ring-info-900/30'
  },
  primary: {
    bg: 'bg-primary-50 dark:bg-primary-900/20',
    text: 'text-primary-600 dark:text-primary-400',
    ring: 'ring-primary-100 dark:ring-primary-900/30'
  }
}

const securityBadgeColor: Record<string, 'success' | 'warning' | 'info' | 'primary'> = {
  success: 'success',
  warning: 'warning',
  info: 'info',
  primary: 'primary'
}

watch(
  () => state.newPassword,
  (val) => {
    showStrength.value = val.length > 0
  }
)
</script>

<template>
  <div>
    <BasePageHeader
      title="Đổi mật khẩu"
      subtitle="Bảo mật tài khoản bằng mật khẩu mạnh và định kỳ cập nhật"
      breadcrumb-label="Đổi mật khẩu"
    >
      <template #actions>
        <div
          class="bg-success-50 dark:bg-success-900/20 ring-success-100 dark:ring-success-900/30 flex items-center gap-2 rounded-lg px-3 py-1.5 ring-1"
        >
          <UIcon
            name="i-lucide-shield-check"
            class="text-success-600 dark:text-success-400 h-4 w-4"
          />
          <span class="text-success-700 dark:text-success-300 text-xs font-medium"
            >Tài khoản được bảo vệ</span
          >
        </div>
      </template>
    </BasePageHeader>

    <div class="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5 lg:gap-6">
      <!-- Left: Change Password Form -->
      <div class="lg:col-span-3">
        <UCard class="stagger-item h-full" style="animation-delay: 0ms">
          <div class="mb-5 flex items-center gap-2.5">
            <div
              class="bg-primary-50 dark:bg-primary-900/20 ring-primary-100 dark:ring-primary-900/30 flex h-9 w-9 items-center justify-center rounded-lg ring-1"
            >
              <UIcon
                name="i-lucide-key-round"
                class="text-primary-600 dark:text-primary-400 h-[18px] w-[18px]"
              />
            </div>
            <div>
              <h2 class="text-surface-foreground text-sm font-semibold">Đặt mật khẩu mới</h2>
              <p class="text-xs text-slate-500 dark:text-zinc-400">
                Mật khẩu mới phải đáp ứng các yêu cầu bên dưới
              </p>
            </div>
          </div>

          <UForm
            ref="formRef"
            class="space-y-4"
            :schema="changePasswordSchema"
            :state="state"
            @submit="handleChangePassword"
          >
            <UFormField
              label="Mật khẩu hiện tại"
              name="oldPassword"
              required
              help="Nhập mật khẩu hiện tại của bạn"
            >
              <UInput v-model="state.oldPassword" type="password" class="w-full" />
            </UFormField>

            <div>
              <UFormField label="Mật khẩu mới" name="newPassword" required>
                <UInput v-model="state.newPassword" type="password" class="w-full" />
              </UFormField>

              <!-- Strength meter -->
              <Transition name="fade">
                <div v-if="showStrength" class="mt-3">
                  <div class="mb-1.5 flex items-center justify-between">
                    <span class="text-xs text-slate-500 dark:text-zinc-400">Độ mạnh mật khẩu</span>
                    <span :class="['text-xs font-medium', strengthInfo.text]">{{
                      strengthInfo.label
                    }}</span>
                  </div>
                  <div class="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
                    <div
                      :class="[
                        'h-full rounded-full transition-all duration-300',
                        strengthInfo.color
                      ]"
                      :style="{ width: strengthInfo.barWidth }"
                    />
                  </div>
                </div>
              </Transition>
            </div>

            <UFormField label="Xác nhận mật khẩu" name="confirmPassword" required>
              <UInput v-model="state.confirmPassword" type="password" class="w-full" />
            </UFormField>

            <!-- Requirements checklist -->
            <div class="border-surface-border bg-surface-hover/40 rounded-lg border p-4">
              <p class="text-surface-foreground mb-3 flex items-center gap-1.5 text-xs font-medium">
                <UIcon name="i-lucide-sparkles" class="text-primary-500 h-3.5 w-3.5" />
                Yêu cầu mật khẩu
              </p>
              <ul class="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <li
                  v-for="(req, i) in requirements"
                  :key="req.label"
                  class="flex items-center gap-2 text-sm"
                >
                  <span
                    :class="[
                      'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full transition-all',
                      metRequirements[i]
                        ? 'bg-success-100 dark:bg-success-900/30'
                        : 'bg-slate-100 dark:bg-zinc-800'
                    ]"
                  >
                    <UIcon
                      v-if="metRequirements[i]"
                      name="i-lucide-check"
                      class="text-success-600 dark:text-success-400 h-3 w-3"
                    />
                    <UIcon
                      v-else
                      name="i-lucide-x"
                      class="h-3 w-3 text-slate-400 dark:text-zinc-500"
                    />
                  </span>
                  <span
                    :class="
                      metRequirements[i]
                        ? 'text-surface-foreground font-medium'
                        : 'text-slate-500 dark:text-zinc-400'
                    "
                  >
                    {{ req.label }}
                  </span>
                </li>
              </ul>
            </div>

            <div
              class="bg-info-50 dark:bg-info-900/20 border-info-100 dark:border-info-900/30 flex items-center gap-2 rounded-lg border p-3"
            >
              <UIcon
                name="i-lucide-lightbulb"
                class="text-info-600 dark:text-info-400 h-4 w-4 flex-shrink-0"
              />
              <p class="text-info-700 dark:text-info-300 text-xs leading-relaxed">
                Mẹo: Dùng một cụm từ dễ nhớ rồi thay thế vài ký tự thành số và ký tự đặc biệt, ví dụ
                "BunTech@2024".
              </p>
            </div>

            <div class="flex gap-3 pt-1">
              <UButton
                type="submit"
                :loading="saving"
                :disabled="metCount < 2"
                size="lg"
                class="w-full justify-center"
                icon="i-lucide-shield"
              >
                Đổi mật khẩu
              </UButton>
            </div>
          </UForm>
        </UCard>
      </div>

      <!-- Right: Security sidebar -->
      <div class="space-y-4 lg:col-span-2 lg:space-y-6">
        <!-- Security Tips -->
        <UCard class="stagger-item" style="animation-delay: 80ms">
          <div class="mb-4 flex items-center gap-2.5">
            <div
              class="bg-accent-50 dark:bg-accent-900/20 ring-accent-100 dark:ring-accent-900/30 flex h-8 w-8 items-center justify-center rounded-lg ring-1"
            >
              <UIcon
                name="i-lucide-lightbulb"
                class="text-accent-600 dark:text-accent-400 h-4 w-4"
              />
            </div>
            <h3 class="text-surface-foreground text-sm font-semibold">Mẹo bảo mật</h3>
          </div>
          <ul class="space-y-2.5">
            <li v-for="tip in securityTips" :key="tip.text" class="flex items-start gap-2.5">
              <UIcon
                :name="tip.icon"
                :class="['mt-0.5 h-4 w-4 flex-shrink-0', tipColorMap[tip.color]]"
              />
              <span class="text-xs leading-relaxed text-slate-600 dark:text-zinc-300">{{
                tip.text
              }}</span>
            </li>
          </ul>
        </UCard>

        <!-- Recent Password Changes -->
        <UCard class="stagger-item" style="animation-delay: 140ms">
          <div class="mb-4 flex items-center gap-2.5">
            <div
              class="bg-info-50 dark:bg-info-900/20 ring-info-100 dark:ring-info-900/30 flex h-8 w-8 items-center justify-center rounded-lg ring-1"
            >
              <UIcon name="i-lucide-clock" class="text-info-600 dark:text-info-400 h-4 w-4" />
            </div>
            <h3 class="text-surface-foreground text-sm font-semibold">Lịch sử đổi mật khẩu</h3>
          </div>
          <ol class="relative">
            <div
              class="bg-surface-border absolute top-2 bottom-2 left-[15px] w-px"
              aria-hidden="true"
            />
            <li
              v-for="entry in passwordHistory"
              :key="entry.id"
              class="relative flex gap-3 pb-4 last:pb-0"
            >
              <div
                :class="[
                  'relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ring-1',
                  entry.current
                    ? 'bg-success-50 dark:bg-success-900/20 ring-success-200/60 dark:ring-success-800/40'
                    : 'bg-surface-hover ring-surface-border'
                ]"
              >
                <UIcon
                  name="i-lucide-key-round"
                  :class="[
                    'h-3.5 w-3.5',
                    entry.current
                      ? 'text-success-600 dark:text-success-400'
                      : 'text-slate-400 dark:text-zinc-500'
                  ]"
                />
              </div>
              <div class="min-w-0 flex-1 pt-1">
                <div class="flex items-center gap-2">
                  <p class="text-surface-foreground text-sm font-medium">{{ entry.label }}</p>
                  <UBadge v-if="entry.current" color="success" size="sm" variant="soft"
                    >Hiện tại</UBadge
                  >
                </div>
                <p class="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">{{ entry.note }}</p>
                <p class="mt-0.5 text-xs text-slate-400 tabular-nums dark:text-zinc-500">
                  {{
                    new Date(entry.date).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })
                  }}
                </p>
              </div>
            </li>
          </ol>
        </UCard>

        <!-- Account Security Status -->
        <UCard class="stagger-item" style="animation-delay: 200ms">
          <div class="mb-4 flex items-center gap-2.5">
            <div
              class="bg-success-50 dark:bg-success-900/20 ring-success-100 dark:ring-success-900/30 flex h-8 w-8 items-center justify-center rounded-lg ring-1"
            >
              <UIcon
                name="i-lucide-shield-check"
                class="text-success-600 dark:text-success-400 h-4 w-4"
              />
            </div>
            <h3 class="text-surface-foreground text-sm font-semibold">Tình trạng bảo mật</h3>
          </div>
          <div class="space-y-2.5">
            <div
              v-for="item in accountSecurity"
              :key="item.label"
              class="bg-surface-hover/50 flex items-center justify-between gap-3 rounded-lg p-2.5"
            >
              <div class="flex min-w-0 items-center gap-2.5">
                <div
                  :class="[
                    'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ring-1',
                    securityColorMap[item.color].bg,
                    securityColorMap[item.color].ring
                  ]"
                >
                  <UIcon
                    :name="item.icon"
                    :class="['h-3.5 w-3.5', securityColorMap[item.color].text]"
                  />
                </div>
                <span class="text-sm text-slate-600 dark:text-zinc-300">{{ item.label }}</span>
              </div>
              <UBadge :color="securityBadgeColor[item.color]" variant="soft">{{
                item.value
              }}</UBadge>
            </div>
          </div>

          <div
            class="from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border-primary-100 dark:border-primary-900/30 mt-4 rounded-lg border bg-gradient-to-br p-3"
          >
            <div class="flex items-start gap-2.5">
              <UIcon
                name="i-lucide-trending-up"
                class="text-primary-600 dark:text-primary-400 mt-0.5 h-4 w-4 flex-shrink-0"
              />
              <div>
                <p class="text-primary-700 dark:text-primary-300 text-xs font-medium">
                  Điểm bảo mật
                </p>
                <p class="mt-0.5 text-xs text-slate-600 dark:text-zinc-300">
                  Tài khoản của bạn đạt mức
                  <span class="text-success-600 dark:text-success-400 font-semibold">Tốt</span>. Bật
                  xác thực 2 bước để đạt mức Xuất sắc.
                </p>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
