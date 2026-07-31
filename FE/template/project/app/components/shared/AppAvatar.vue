<script setup lang="ts">
interface Props {
  name?: string
  src?: string | null
  size?: 'sm' | 'md' | 'lg'
}
const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})
const sizeClasses: Record<string, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
}
const initials = computed(() => {
  if (!props.name) return '?'
  return props.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
})
</script>

<template>
  <div :class="['flex-shrink-0 rounded-full overflow-hidden flex items-center justify-center bg-primary-100 text-primary-700 font-semibold', sizeClasses[size]]">
    <img v-if="src" :src="src" :alt="name" class="w-full h-full object-cover">
    <span v-else>{{ initials }}</span>
  </div>
</template>
