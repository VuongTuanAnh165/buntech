<script setup lang="ts">
const { t } = useI18n()
useHead({ title: `${t('errors.notFound')} - BunTech` })
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="text-center">
      <p class="text-6xl font-bold text-primary-600 mb-4">404</p>
      <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ t('errors.notFound') }}</h1>
      <p class="text-gray-500 mb-6">{{ t('errors.notFoundDescription') }}</p>
      <NuxtLink to="/">
        <button class="px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors">
          {{ t('errors.goHome') }}
        </button>
      </NuxtLink>
    </div>
  </div>
</template>
