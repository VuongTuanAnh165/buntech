<script setup lang="ts">
withDefaults(defineProps<{
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'gray' | 'info' | 'teal'
  size?: 'sm' | 'md'
  dot?: boolean
  variant?: 'soft' | 'solid'
}>(), {
  color: 'gray',
  size: 'sm',
  dot: false,
  variant: 'soft',
})

const softColorMap: Record<string, string> = {
  primary: 'bg-primary-50 text-primary-700 ring-primary-200/50 dark:bg-primary-900/30 dark:text-primary-300 dark:ring-primary-800/40',
  secondary: 'bg-secondary-50 text-secondary-700 ring-secondary-200/50 dark:bg-secondary-900/30 dark:text-secondary-300 dark:ring-secondary-800/40',
  accent: 'bg-accent-50 text-accent-700 ring-accent-200/50 dark:bg-accent-900/30 dark:text-accent-300 dark:ring-accent-800/40',
  success: 'bg-success-50 text-success-700 ring-success-200/50 dark:bg-success-900/30 dark:text-success-300 dark:ring-success-800/40',
  warning: 'bg-warning-50 text-warning-700 ring-warning-200/50 dark:bg-warning-900/30 dark:text-warning-300 dark:ring-warning-800/40',
  danger: 'bg-danger-50 text-danger-700 ring-danger-200/50 dark:bg-danger-900/30 dark:text-danger-300 dark:ring-danger-800/40',
  gray: 'bg-slate-100 text-slate-600 ring-slate-200/50 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700/40',
  info: 'bg-info-50 text-info-700 ring-info-200/50 dark:bg-info-900/30 dark:text-info-300 dark:ring-info-800/40',
  teal: 'bg-teal-50 text-teal-700 ring-teal-200/50 dark:bg-teal-900/30 dark:text-teal-300 dark:ring-teal-800/40',
}

const solidColorMap: Record<string, string> = {
  primary: 'bg-primary-600 text-white',
  secondary: 'bg-secondary-600 text-white',
  accent: 'bg-accent-500 text-white',
  success: 'bg-success-600 text-white',
  warning: 'bg-warning-500 text-white',
  danger: 'bg-danger-600 text-white',
  gray: 'bg-slate-500 text-white',
  info: 'bg-info-600 text-white',
  teal: 'bg-teal-600 text-white',
}

const dotColorMap: Record<string, string> = {
  primary: 'bg-primary-500',
  secondary: 'bg-secondary-500',
  accent: 'bg-accent-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
  gray: 'bg-slate-400 dark:bg-zinc-500',
  info: 'bg-info-500',
  teal: 'bg-teal-500',
}
</script>

<template>
  <span
    :class="[
      'badge',
      variant === 'soft' ? softColorMap[color] : solidColorMap[color],
      variant === 'soft' ? 'ring-1 ring-inset' : '',
      size === 'md' ? 'text-sm px-2.5 py-1' : 'text-xs px-2 py-0.5',
    ]"
  >
    <span v-if="dot" :class="['w-1.5 h-1.5 rounded-full', dotColorMap[color]]" aria-hidden="true" />
    <slot />
  </span>
</template>
