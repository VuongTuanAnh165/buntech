<script setup lang="ts">
interface Props {
  title: string
  value: string | number
  icon?: string
  trend?: { value: number; isPositive: boolean }
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info'
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'i-lucide-activity',
  trend: undefined,
  color: 'primary',
  loading: false
})

const colorMap: Record<string, string> = {
  primary: 'bg-primary-50 text-primary-600 dark:bg-primary-950/30 dark:text-primary-400',
  success: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400',
  warning: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400',
  error: 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400',
  info: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
}

/* Count-up animation */
const displayValue = ref<string | number>(0)
const targetValue = computed(() => {
  if (typeof props.value === 'number') return props.value
  const num = Number(props.value.replace(/[^\d.-]/g, ''))
  return isNaN(num) ? props.value : num
})

const animateCountUp = () => {
  if (typeof targetValue.value !== 'number') {
    displayValue.value = props.value
    return
  }

  const target = targetValue.value
  const duration = 800
  const startTime = performance.now()
  const startVal = 0

  const step = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
    displayValue.value = Math.round(startVal + (target - startVal) * eased)
    if (progress < 1) requestAnimationFrame(step)
  }

  requestAnimationFrame(step)
}

onMounted(() => {
  if (!props.loading) animateCountUp()
})

watch(() => props.loading, (newVal, oldVal) => {
  if (oldVal && !newVal) animateCountUp()
})
</script>

<template>
  <UCard class="card-hover transition-all duration-200 hover:-translate-y-0.5">
    <div class="flex items-start justify-between">
      <div class="min-w-0 flex-1">
        <p class="text-xs font-medium text-gray-500 dark:text-zinc-400">
          {{ props.title }}
        </p>
        <template v-if="props.loading">
          <div class="skeleton mt-2 h-7 w-24" />
        </template>
        <p v-else class="mt-1 text-xl font-bold tabular-nums text-surface-foreground sm:text-2xl">
          {{ typeof targetValue === 'number' ? displayValue : props.value }}
        </p>
        <p
          v-if="props.trend && !props.loading"
          class="mt-1 flex items-center gap-1 text-xs font-medium"
          :class="props.trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'"
        >
          <UIcon
            :name="props.trend.isPositive ? 'i-lucide-trending-up' : 'i-lucide-trending-down'"
            class="size-3.5"
          />
          {{ props.trend.isPositive ? '+' : '' }}{{ props.trend.value }}%
        </p>
      </div>
      <div
        class="flex size-10 shrink-0 items-center justify-center rounded-xl"
        :class="colorMap[props.color]"
      >
        <UIcon :name="props.icon" class="size-5" />
      </div>
    </div>
  </UCard>
</template>
