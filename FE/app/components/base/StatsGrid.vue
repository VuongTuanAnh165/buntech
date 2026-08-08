<script setup lang="ts">
interface StatItem {
  title: string
  value: string | number
  icon?: string
  trend?: { value: number; isPositive: boolean }
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info'
}

interface Props {
  stats: StatItem[]
  columns?: 2 | 3 | 4
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  columns: 4,
  loading: false
})

const gridClass = computed(() => {
  const map: Record<number, string> = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  }
  return map[props.columns]
})
</script>

<template>
  <div class="grid gap-4" :class="gridClass">
    <div
      v-for="(stat, index) in props.stats"
      :key="stat.title"
      class="animate-fade-in-up"
      :style="{ animationDelay: `${index * 80}ms` }"
    >
      <BaseStatCard
        :title="stat.title"
        :value="stat.value"
        :icon="stat.icon"
        :trend="stat.trend"
        :color="stat.color"
        :loading="props.loading"
      />
    </div>
  </div>
</template>
