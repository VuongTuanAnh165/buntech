<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  loading?: boolean
  disabled?: boolean
  block?: boolean
}>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  loading: false,
  disabled: false,
  block: false,
})

const emit = defineEmits<{ click: [event: MouseEvent] }>()

const variantClasses: Record<string, string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus-visible:ring-primary-500/40 shadow-xs shadow-primary-600/10',
  secondary: 'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 focus-visible:ring-slate-500/40 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 shadow-xs',
  danger: 'bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-800 focus-visible:ring-danger-500/40 shadow-xs shadow-danger-600/10',
  success: 'bg-success-600 text-white hover:bg-success-700 active:bg-success-800 focus-visible:ring-success-500/40 shadow-xs shadow-success-600/10',
  warning: 'bg-warning-500 text-white hover:bg-warning-600 active:bg-warning-700 focus-visible:ring-warning-500/40 shadow-xs shadow-warning-500/10',
  ghost: 'text-surface-foreground hover:bg-surface-hover active:bg-surface-hover/70 focus-visible:ring-primary-500/20',
  outline: 'border border-surface-border bg-surface text-surface-foreground hover:bg-surface-hover hover:border-slate-300 dark:hover:border-zinc-600 active:bg-surface-hover/70 focus-visible:ring-primary-500/20',
}

const sizeClasses: Record<string, string> = {
  sm: 'text-[13px] font-medium px-3 py-1.5 h-8 gap-1.5 rounded-lg',
  md: 'text-sm font-medium px-4 py-2 h-10 gap-2 rounded-lg',
  lg: 'text-sm font-medium px-5 py-2.5 h-12 gap-2 rounded-xl',
}

function onClick(e: MouseEvent) {
  if (props.disabled || props.loading) return
  emit('click', e)
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading"
    :aria-disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100',
      variantClasses[variant],
      sizeClasses[size],
      block ? 'w-full' : '',
    ]"
    @click="onClick"
  >
    <Loader2 v-if="loading" class="w-4 h-4 animate-spin" aria-hidden="true" />
    <slot v-if="!loading || $slots.loading === undefined" />
    <slot v-if="loading" name="loading" />
  </button>
</template>
