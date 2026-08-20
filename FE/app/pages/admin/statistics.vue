<script setup lang="ts">
import { t } from '~/utils/i18n'
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: t('admin_stat_seo_title') })
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
        {{ $t('nav_statistics') }}
      </h1>
    </div>
    <UCard>
      <div class="py-12 text-center text-neutral-500 dark:text-neutral-400">
        <UIcon name="i-heroicons-chart-bar" class="mx-auto mb-4 h-12 w-12 opacity-50" />
        <h3 class="text-lg font-medium">{{ $t('admin_stat_dev_title') }}</h3>
        <p class="mt-2 text-sm">{{ $t('admin_stat_dev_desc') }}</p>
      </div>
    </UCard>
  </div>
</template>
