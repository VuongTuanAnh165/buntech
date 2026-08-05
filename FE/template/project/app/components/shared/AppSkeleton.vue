<script setup lang="ts">
withDefaults(defineProps<{
  width?: string
  height?: string
  rounded?: string
}>(), {
  width: 'w-full',
  height: 'h-4',
  rounded: 'rounded-md',
})
</script>

<template>
  <div :class="[width, height, rounded, 'skeleton']" aria-hidden="true" />
</template>
