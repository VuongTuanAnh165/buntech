<script setup lang="ts">
interface BreadcrumbItem {
  label: string
  to?: string
}
defineProps<{ items: BreadcrumbItem[] }>()
const { t } = useI18n()
</script>

<template>
  <nav class="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
    <NuxtLink to="/admin" class="hover:text-primary-600 transition-colors">{{ t('nav.home') }}</NuxtLink>
    <template v-for="(item, i) in items" :key="i">
      <svg class="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
      <NuxtLink v-if="item.to && i < items.length - 1" :to="item.to" class="hover:text-primary-600 transition-colors">{{ item.label }}</NuxtLink>
      <span v-else :class="i === items.length - 1 ? 'text-gray-900 font-medium' : ''">{{ item.label }}</span>
    </template>
  </nav>
</template>
