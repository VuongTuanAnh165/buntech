<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  loading?: boolean
  disabled?: boolean
  block?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  loading: false,
  disabled: false,
  block: false,
})
defineEmits<{ click: [event: MouseEvent] }>()

const variantClasses: Record<string, string> = {
  primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm',
  secondary: 'bg-secondary-600 hover:bg-secondary-700 text-white shadow-sm',
  danger: 'bg-danger-600 hover:bg-danger-700 text-white shadow-sm',
  success: 'bg-success-600 hover:bg-success-700 text-white shadow-sm',
  warning: 'bg-warning-500 hover:bg-warning-600 text-white shadow-sm',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
  outline: 'bg-transparent border border-gray-300 hover:bg-gray-50 text-gray-700',
}
const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2',
      variantClasses[variant],
      sizeClasses[size],
      block ? 'w-full' : '',
      (disabled || loading) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
    ]"
    @click="$emit('click', $event)"
  >
    <svg v-if="loading" class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
    <slot />
  </button>
</template>
