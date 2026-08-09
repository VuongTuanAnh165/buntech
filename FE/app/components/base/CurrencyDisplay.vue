<script setup lang="ts">
interface Props {
  amount: number
  size?: 'sm' | 'md' | 'lg'
  highlight?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  highlight: false
})
const sizeClass = computed(() => {
  const map: Record<string, string> = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg font-bold'
  }
  return map[props.size]
})
</script>
<template>
  <span
    class="tabular-nums"
    :class="[
      sizeClass,
      props.highlight
        ? 'text-primary-600 dark:text-primary-400 font-semibold'
        : 'text-surface-foreground'
    ]"
  >
    {{ formatVND(props.amount) }}
  </span>
</template>
