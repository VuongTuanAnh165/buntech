<script setup lang="ts">
import { vi } from '@nuxt/ui/locale'
</script>

<template>
  <UApp :locale="vi" :toaster="{ position: 'top-right' }">
    <NuxtLoadingIndicator color="var(--ui-primary)" :height="3" :throttle="200" />
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <BaseConfirmDialog />
  </UApp>
</template>
