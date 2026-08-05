<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  name?: string
  src?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg'
}>(), {
  name: '',
  src: null,
  size: 'md',
})

const sizeClasses: Record<string, string> = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-9 h-9 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
}

const initials = computed(() => {
  if (!props.name) return '?'
  const words = props.name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0][0]?.toUpperCase() || '?'
  return (words[0][0] || '') + (words[words.length - 1][0] || '')
})

const altText = computed(() => props.name || 'Avatar')
</script>

<template>
  <div :class="['relative rounded-full overflow-hidden flex-shrink-0', sizeClasses[size]]">
    <img
      v-if="src"
      :src="src"
      :alt="altText"
      class="w-full h-full object-cover"
      loading="lazy"
    >
    <div
      v-else
      class="w-full h-full rounded-full bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/40 dark:to-primary-800/30 flex items-center justify-center font-semibold text-primary-700 dark:text-primary-300 ring-1 ring-surface-border/40"
      :aria-label="altText"
      role="img"
    >{{ initials }}</div>
  </div>
</template>
