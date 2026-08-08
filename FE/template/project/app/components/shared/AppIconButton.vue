<script setup lang="ts">
import type { Component } from 'vue'

const props = withDefaults(defineProps<{
  icon: Component
  label: string
  variant?: 'view' | 'edit' | 'delete' | 'default'
  size?: 'sm' | 'md'
}>(), {
  variant: 'default',
  size: 'sm',
})

const emit = defineEmits<{ click: [event: MouseEvent] }>()

const variantClasses: Record<string, string> = {
  view: 'text-slate-400 dark:text-zinc-500 hover:text-secondary-600 dark:hover:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-900/20',
  edit: 'text-slate-400 dark:text-zinc-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20',
  delete: 'text-slate-400 dark:text-zinc-500 hover:text-danger-600 dark:hover:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20',
  default: 'text-slate-400 dark:text-zinc-500 hover:text-surface-foreground hover:bg-surface-hover',
}

const sizeClasses: Record<string, string> = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
}

const iconSize: Record<string, string> = {
  sm: 'w-[17px] h-[17px]',
  md: 'w-5 h-5',
}

function onClick(e: MouseEvent) {
  emit('click', e)
}
</script>

<template>
  <button
    type="button"
    :class="[
      'flex items-center justify-center rounded-lg transition-all duration-200 active:scale-90 flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30',
      variantClasses[variant],
      sizeClasses[size],
    ]"
    :aria-label="label"
    @click="onClick"
  >
    <component :is="icon" :class="iconSize[size]" aria-hidden="true" />
  </button>
</template>
