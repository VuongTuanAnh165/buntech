<script setup lang="ts">
const authStore = useAuthStore()

onMounted(() => {
  authStore.init()
})
</script>

<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
