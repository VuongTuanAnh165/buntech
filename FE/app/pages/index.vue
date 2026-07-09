<script setup lang="ts">
/**
 * Trang chủ tạm — Redirect về admin dashboard.
 * Sẽ được thay thế bằng Landing Page hoặc logic redirect phù hợp.
 */
definePageMeta({
  layout: false
})

// Redirect dựa theo role user
const userStore = useCurrentUserStore()

if (userStore.isDriver) {
  navigateTo('/driver/delivery')
} else {
  navigateTo('/admin')
}
</script>

<template>
  <div />
</template>
