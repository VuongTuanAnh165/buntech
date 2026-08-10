<!--
  Responsibility: Render security tips, password history, and account security status
  Dependency: passwordHistory (passed from parent)
  Reason: Extracted to keep admin/change-password.vue under 400 lines
-->
<script setup lang="ts">
defineProps<{
  passwordHistory: {
    id: string
    date: string
    label: string
    note: string
    current: boolean
  }[]
}>()

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

const twoFAEnabled = ref(false)
const accountSecurity = computed(() => [
  {
    label: 'Xác thực 2 bước',
    value: twoFAEnabled.value ? 'Đã bật' : 'Chưa bật',
    color: twoFAEnabled.value ? ('success' as const) : ('warning' as const),
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

const securityColorMap: Record<
  'success' | 'warning' | 'info' | 'primary',
  { bg: string; text: string; ring: string }
> = {
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
</script>

<template>
  <div class="space-y-4 lg:space-y-6">
    <!-- Security Tips -->
    <UCard class="stagger-item" style="animation-delay: 80ms">
      <div class="mb-4 flex items-center gap-2.5">
        <div
          class="bg-accent-50 dark:bg-accent-900/20 ring-accent-100 dark:ring-accent-900/30 flex h-8 w-8 items-center justify-center rounded-lg ring-1"
        >
          <UIcon name="i-lucide-lightbulb" class="text-accent-600 dark:text-accent-400 h-4 w-4" />
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
          <UBadge :color="securityBadgeColor[item.color]" variant="soft">{{ item.value }}</UBadge>
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
            <p class="text-primary-700 dark:text-primary-300 text-xs font-medium">Điểm bảo mật</p>
            <p class="mt-0.5 text-xs text-slate-600 dark:text-zinc-300">
              Tài khoản của bạn đạt mức
              <span class="text-success-600 dark:text-success-400 font-semibold">Tốt</span>. Bật xác
              thực 2 bước để đạt mức Xuất sắc.
            </p>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>
