<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <AppToast />
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
onMounted(() => {
  authStore.init()
})
</script>
