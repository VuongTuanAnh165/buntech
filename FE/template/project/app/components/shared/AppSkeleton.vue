<script setup lang="ts">
interface Props {
  width?: string
  height?: string
  rounded?: string
}
withDefaults(defineProps<Props>(), {
  width: 'w-full',
  height: 'h-4',
  rounded: 'rounded',
})
</script>

<template>
  <div :class="['skeleton', width, height, rounded]" />
</template>
