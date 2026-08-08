<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  activities: {
    id: string
    type: string
    title: string
    description: string
    timestamp: string
    icon: string
    color: 'primary' | 'success' | 'accent' | 'warning' | 'info' | 'secondary'
  }[]
}>()

const activityColorMap = {
  primary: { bg: 'bg-primary-50 dark:bg-primary-900/20', text: 'text-primary-600 dark:text-primary-400', ring: 'ring-primary-100 dark:ring-primary-900/30' },
  success: { bg: 'bg-success-50 dark:bg-success-900/20', text: 'text-success-600 dark:text-success-400', ring: 'ring-success-100 dark:ring-success-900/30' },
  accent: { bg: 'bg-accent-50 dark:bg-accent-900/20', text: 'text-accent-600 dark:text-accent-400', ring: 'ring-accent-100 dark:ring-accent-900/30' },
  warning: { bg: 'bg-warning-50 dark:bg-warning-900/20', text: 'text-warning-600 dark:text-warning-400', ring: 'ring-warning-100 dark:ring-warning-900/30' },
  info: { bg: 'bg-info-50 dark:bg-info-900/20', text: 'text-info-600 dark:text-info-400', ring: 'ring-info-100 dark:ring-info-900/30' },
  secondary: { bg: 'bg-secondary-50 dark:bg-secondary-900/20', text: 'text-secondary-600 dark:text-secondary-400', ring: 'ring-secondary-100 dark:ring-secondary-900/30' },
}

function relativeTime(iso: string) {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`
  return `${Math.floor(diff / 86400000)} ngày trước`
}
</script>

<template>
  <div class="lg:col-span-2">
    <UCard class="stagger-item h-full" style="animation-delay: 220ms">
      <div class="flex items-center justify-between mb-5">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-accent-50 dark:bg-accent-900/20 flex items-center justify-center ring-1 ring-accent-100 dark:ring-accent-900/30">
            <UIcon name="i-lucide-activity" class="w-4 h-4 text-accent-600 dark:text-accent-400" />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-surface-foreground">Lịch sử hoạt động</h3>
            <p class="text-xs text-slate-500 dark:text-zinc-400">6 hoạt động gần nhất</p>
          </div>
        </div>
        <UBadge color="neutral" variant="soft">30 ngày</UBadge>
      </div>

      <ol class="relative space-y-1">
        <div class="absolute left-[19px] top-2 bottom-2 w-px bg-surface-border" aria-hidden="true" />
        <li
          v-for="(activity, idx) in activities"
          :key="activity.id"
          class="relative flex gap-4 pb-5 last:pb-0 stagger-item"
          :style="{ animationDelay: `${idx * 60 + 280}ms` }"
        >
          <div :class="[
            'relative z-10 w-10 h-10 rounded-full flex items-center justify-center ring-1 flex-shrink-0',
            activityColorMap[activity.color].bg,
            activityColorMap[activity.color].ring,
          ]">
            <UIcon :name="activity.icon" :class="['w-5 h-5', activityColorMap[activity.color].text]" />
          </div>
          <div class="flex-1 min-w-0 pt-1.5">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-sm font-medium text-surface-foreground">{{ activity.title }}</p>
                <p class="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{{ activity.description }}</p>
              </div>
              <span class="text-xs text-slate-400 dark:text-zinc-500 whitespace-nowrap flex items-center gap-1 flex-shrink-0 tabular-nums">
                <UIcon name="i-lucide-clock" class="w-3 h-3" />
                {{ relativeTime(activity.timestamp) }}
              </span>
            </div>
          </div>
        </li>
      </ol>

      <div class="mt-4 pt-4 border-t border-surface-border flex justify-center">
        <UButton variant="ghost" color="neutral" class="text-xs text-slate-500 dark:text-zinc-400 hover:text-primary-600 dark:hover:text-primary-400 font-medium flex items-center gap-1 transition-colors">
          Xem tất cả hoạt động
          <UIcon name="i-lucide-chevron-right" class="w-3.5 h-3.5" />
        </UButton>
      </div>
    </UCard>
  </div>
</template>
