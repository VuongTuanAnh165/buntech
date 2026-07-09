<script setup lang="ts">
/**
 * Component Card thống kê — hiển thị 1 chỉ số KPI.
 * Dùng trong Dashboard, trang Thống kê.
 *
 * @example
 * <BaseStatCard
 *   title="Doanh thu hôm nay"
 *   value="12.500.000 ₫"
 *   icon="i-lucide-wallet"
 *   trend="+15%"
 *   trend-direction="up"
 * />
 */

interface Props {
  /** Tên chỉ số */
  title: string
  /** Giá trị hiển thị (đã format) */
  value: string
  /** Icon (Lucide icon name) */
  icon?: string
  /** Xu hướng so với kỳ trước (VD: '+15%', '-3%') */
  trend?: string
  /** Hướng xu hướng: up (xanh), down (đỏ), neutral (xám) */
  trendDirection?: 'up' | 'down' | 'neutral'
  /** Mô tả khoảng thời gian so sánh (VD: 'so với hôm qua') */
  trendLabel?: string
}

withDefaults(defineProps<Props>(), {
  icon: 'i-lucide-bar-chart-3',
  trend: undefined,
  trendDirection: 'neutral',
  trendLabel: undefined
})

const trendColor: Record<string, string> = {
  up: 'text-success',
  down: 'text-error',
  neutral: 'text-muted'
}

const trendIcon: Record<string, string> = {
  up: 'i-lucide-trending-up',
  down: 'i-lucide-trending-down',
  neutral: 'i-lucide-minus'
}
</script>

<template>
  <UCard>
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <p class="text-muted text-sm font-medium">{{ title }}</p>
        <p class="text-highlighted mt-2 text-2xl font-bold tabular-nums">{{ value }}</p>

        <!-- Trend -->
        <div v-if="trend" class="mt-2 flex items-center gap-1 text-xs">
          <UIcon
            :name="trendIcon[trendDirection]"
            class="size-3.5"
            :class="trendColor[trendDirection]"
          />
          <span :class="trendColor[trendDirection]" class="font-medium">{{ trend }}</span>
          <span v-if="trendLabel" class="text-muted">{{ trendLabel }}</span>
        </div>
      </div>

      <!-- Icon -->
      <div class="bg-primary/10 flex size-10 shrink-0 items-center justify-center rounded-lg">
        <UIcon :name="icon" class="text-primary size-5" />
      </div>
    </div>
  </UCard>
</template>
