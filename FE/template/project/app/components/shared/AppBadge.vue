<script setup lang="ts">
interface Props {
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'gray'
  size?: 'sm' | 'md'
}
withDefaults(defineProps<Props>(), {
  color: 'gray',
  size: 'sm',
})
</script>

<template>
  <span
    :class="[
      'inline-flex items-center rounded-full font-medium',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
      {
        'bg-primary-100 text-primary-700': color === 'primary',
        'bg-secondary-100 text-secondary-700': color === 'secondary',
        'bg-accent-100 text-accent-700': color === 'accent',
        'bg-success-100 text-success-700': color === 'success',
        'bg-warning-100 text-warning-700': color === 'warning',
        'bg-danger-100 text-danger-700': color === 'danger',
        'bg-gray-100 text-gray-700': color === 'gray',
      },
    ]"
  >
    <slot />
  </span>
</template>
