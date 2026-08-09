<script setup lang="ts">
import { _computed } from 'vue'

const _props = defineProps<{
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
  primary: {
    bg: 'bg-primary-50 dark:bg-primary-900/20',
    text: 'text-primary-600 dark:text-primary-400',
    ring: 'ring-primary-100 dark:ring-primary-900/30'
  },
  success: {
    bg: 'bg-success-50 dark:bg-success-900/20',
    text: 'text-success-600 dark:text-success-400',
    ring: 'ring-success-100 dark:ring-success-900/30'
  },
  accent: {
    bg: 'bg-accent-50 dark:bg-accent-900/20',
    text: 'text-accent-600 dark:text-accent-400',
    ring: 'ring-accent-100 dark:ring-accent-900/30'
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
  secondary: {
    bg: 'bg-secondary-50 dark:bg-secondary-900/20',
    text: 'text-secondary-600 dark:text-secondary-400',
    ring: 'ring-secondary-100 dark:ring-secondary-900/30'
  }
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
      <div class="mb-5 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div
            class="bg-accent-50 dark:bg-accent-900/20 ring-accent-100 dark:ring-accent-900/30 flex h-8 w-8 items-center justify-center rounded-lg ring-1"
          >
            <UIcon name="i-lucide-activity" class="text-accent-600 dark:text-accent-400 h-4 w-4" />
          </div>
          <div>
            <h3 class="text-surface-foreground text-sm font-semibold">Lịch sử hoạt động</h3>
            <p class="text-xs text-slate-500 dark:text-zinc-400">6 hoạt động gần nhất</p>
          </div>
        </div>
        <UBadge color="neutral" variant="soft">30 ngày</UBadge>
      </div>

      <ol class="relative space-y-1">
        <div
          class="bg-surface-border absolute top-2 bottom-2 left-[19px] w-px"
          aria-hidden="true"
        />
        <li
          v-for="(activity, idx) in activities"
          :key="activity.id"
          class="stagger-item relative flex gap-4 pb-5 last:pb-0"
          :style="{ animationDelay: `${idx * 60 + 280}ms` }"
        >
          <div
            :class="[
              'relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ring-1',
              activityColorMap[activity.color].bg,
              activityColorMap[activity.color].ring
            ]"
          >
            <UIcon
              :name="activity.icon"
              :class="['h-5 w-5', activityColorMap[activity.color].text]"
            />
          </div>
          <div class="min-w-0 flex-1 pt-1.5">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-surface-foreground text-sm font-medium">{{ activity.title }}</p>
                <p class="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-zinc-400">
                  {{ activity.description }}
                </p>
              </div>
              <span
                class="flex flex-shrink-0 items-center gap-1 text-xs whitespace-nowrap text-slate-400 tabular-nums dark:text-zinc-500"
              >
                <UIcon name="i-lucide-clock" class="h-3 w-3" />
                {{ relativeTime(activity.timestamp) }}
              </span>
            </div>
          </div>
        </li>
      </ol>

      <div class="border-surface-border mt-4 flex justify-center border-t pt-4">
        <UButton
          variant="ghost"
          color="neutral"
          class="hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-1 text-xs font-medium text-slate-500 transition-colors dark:text-zinc-400"
        >
          Xem tất cả hoạt động
          <UIcon name="i-lucide-chevron-right" class="h-3.5 w-3.5" />
        </UButton>
      </div>
    </UCard>
  </div>
</template>
