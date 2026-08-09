<!--
  Responsibility: Render the top stats row for admin profile.
  Dependency: UI components, auth store.
  Lifecycle: Mounted on admin profile page.
  Reason: Extracted to keep admin/profile.vue under 400 lines limit.
-->
<script setup lang="ts">
import { formatDateTime } from '~/utils/formatters'

const accountAgeLabel = 'Từ lâu'

// Stats
const stats = computed(() => [
  {
    label: 'Tổng thao tác',
    value: '1.248',
    icon: 'i-lucide-zap',
    color: 'primary' as const,
    hint: 'Trong 30 ngày qua'
  },
  {
    label: 'Đăng nhập gần nhất',
    value: '2 giờ trước',
    icon: 'i-lucide-log-in',
    color: 'success' as const,
    hint: formatDateTime(new Date(Date.now() - 2 * 3600000).toISOString())
  },
  {
    label: 'Tuổi tài khoản',
    value: accountAgeLabel,
    icon: 'i-lucide-calendar-days',
    color: 'accent' as const,
    hint: `Từ lâu`
  }
])
const colorMap = {
  primary: {
    bg: 'bg-primary-50 dark:bg-primary-900/20',
    text: 'text-primary-600 dark:text-primary-400',
    ring: 'ring-primary-100 dark:ring-primary-900/30',
    bar: 'bg-gradient-to-r from-primary-500 to-primary-400'
  },
  success: {
    bg: 'bg-success-50 dark:bg-success-900/20',
    text: 'text-success-600 dark:text-success-400',
    ring: 'ring-success-100 dark:ring-success-900/30',
    bar: 'bg-gradient-to-r from-success-500 to-success-400'
  },
  accent: {
    bg: 'bg-accent-50 dark:bg-accent-900/20',
    text: 'text-accent-600 dark:text-accent-400',
    ring: 'ring-accent-100 dark:ring-accent-900/30',
    bar: 'bg-gradient-to-r from-accent-500 to-accent-400'
  }
}
</script>

<template>
  <div class="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
    <div
      v-for="(stat, i) in stats"
      :key="stat.label"
      class="card card-hover stagger-item group relative overflow-hidden p-5"
      :style="{ animationDelay: `${i * 50 + 40}ms` }"
    >
      <div :class="['kpi-accent', colorMap[stat.color].bar]" />
      <div class="mb-2.5 flex items-start justify-between">
        <div
          :class="[
            'flex h-10 w-10 items-center justify-center rounded-xl ring-1 transition-transform duration-200 group-hover:scale-110',
            colorMap[stat.color].bg,
            colorMap[stat.color].ring
          ]"
        >
          <UIcon :name="stat.icon" :class="['h-5 w-5', colorMap[stat.color].text]" />
        </div>
      </div>
      <p class="mb-1 text-[13px] font-medium text-slate-500 dark:text-zinc-400">
        {{ stat.label }}
      </p>
      <p class="text-surface-foreground text-2xl font-bold tracking-tight">{{ stat.value }}</p>
      <p class="mt-1 truncate text-xs text-slate-400 dark:text-zinc-500">{{ stat.hint }}</p>
    </div>
  </div>
</template>
