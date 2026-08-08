<script setup lang="ts">
import { Home, ChevronRight } from 'lucide-vue-next'

interface BreadcrumbItem {
  label: string
  to?: string
}

const props = defineProps<{ items: BreadcrumbItem[] }>()
const { t } = useI18n()
</script>

<template>
  <nav aria-label="Breadcrumb" class="mb-4">
    <ol class="flex items-center gap-1.5 text-sm flex-wrap">
      <li>
        <NuxtLink
          to="/admin"
          class="flex items-center gap-1 text-gray-500 dark:text-zinc-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-md px-1 py-0.5"
        >
          <Home class="w-3.5 h-3.5" aria-hidden="true" />
          <span class="sr-only">{{ t('nav.dashboard') }}</span>
        </NuxtLink>
      </li>
      <li v-for="(item, i) in items" :key="i" class="flex items-center gap-1.5">
        <ChevronRight class="w-3.5 h-3.5 text-gray-300 dark:text-zinc-600" aria-hidden="true" />
        <NuxtLink
          v-if="item.to && i < items.length - 1"
          :to="item.to"
          class="text-gray-500 dark:text-zinc-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-md px-1 py-0.5"
        >{{ item.label }}</NuxtLink>
        <span
          v-else
          :aria-current="i === items.length - 1 ? 'page' : undefined"
          class="text-surface-foreground font-medium px-1 py-0.5"
        >{{ item.label }}</span>
      </li>
    </ol>
  </nav>
</template>
