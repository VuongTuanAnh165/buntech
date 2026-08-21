<script setup lang="ts">
import { publicNavigationItems } from '~/utils/navigation'
const route = useRoute()
</script>
<template>
  <header
    class="glass safe-area-top sticky top-0 z-50 border-b border-neutral-200 transition-colors dark:border-neutral-800"
  >
    <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <NuxtLink to="/" class="group flex items-center gap-3">
        <div
          class="bg-primary-500 flex h-8 w-8 items-center justify-center rounded-lg text-base font-bold text-white shadow-sm"
        >
          B
        </div>
        <span class="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">{{
          $t('app_name')
        }}</span>
      </NuxtLink>

      <nav class="hidden items-center gap-6 md:flex">
        <NuxtLink
          v-for="item in publicNavigationItems"
          :key="String(item.to)"
          :to="item.to"
          class="rounded-lg px-4 py-2 text-sm font-medium transition-all"
          :class="
            route.path === item.to
              ? 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/30'
              : 'hover:text-primary-600 dark:hover:text-primary-400 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800/50'
          "
        >
          <div class="flex items-center">
            {{ item.label }}
          </div>
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-2">
        <UButton
          to="/quick-order"
          icon="i-lucide-shopping-cart"
          variant="ghost"
          color="neutral"
          :aria-label="$t('quick_order_title')"
        />
        <UColorModeButton />
        <NuxtLink
          to="/auth/customer/login"
          class="text-primary-600 hover:text-primary-500 hidden text-sm font-medium transition-colors md:block"
          >{{ $t('header_login_customer') }}</NuxtLink
        >
      </div>
    </div>
  </header>
</template>
