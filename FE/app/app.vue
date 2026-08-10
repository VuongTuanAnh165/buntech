<script setup lang="ts">
const authStore = useAuthStore()
const toast = useToast()
const nuxtApp = useNuxtApp()

onMounted(() => {
  authStore.init()

  nuxtApp.hook('app:toast', (options: Parameters<typeof toast.add>[0]) => {
    toast.add(options)
  })
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
