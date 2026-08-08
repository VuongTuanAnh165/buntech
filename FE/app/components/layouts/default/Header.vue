<script setup lang="ts">
import { publicNavigationItems } from '~/utils/navigation'
const route = useRoute()
</script>
<template>
  <header class="sticky top-0 z-50 glass border-b border-neutral-200 dark:border-neutral-800 transition-colors safe-area-top">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <NuxtLink to="/" class="flex items-center gap-3 group">
        <div class="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-white font-bold text-base shadow-sm">B</div>
        <span class="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">BunTech</span>
      </NuxtLink>

      <nav class="hidden md:flex items-center gap-6">
        <NuxtLink 
          v-for="item in publicNavigationItems" 
          :key="String(item.to)" 
          :to="item.to"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          :class="route.path === item.to ? 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/30' : 'text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50'"
        >
          <div class="flex items-center">
            {{ item.label }}
          </div>
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-4">
        <UColorModeButton />
        <NuxtLink to="/auth/customer/login" class="hidden md:block font-medium text-sm text-primary-600 hover:text-primary-500 transition-colors">Đăng nhập khách hàng</NuxtLink>
      </div>
    </div>
  </header>
</template>
