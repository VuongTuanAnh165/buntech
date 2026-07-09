<script setup lang="ts">
/**
 * Layout Driver — Mobile-first cho app tài xế.
 * Bottom navigation bar + Safe area padding cho Capacitor.
 */
import { driverNavigationItems } from '~/utils/navigation'

const route = useRoute()
</script>

<template>
  <div class="bg-default flex min-h-dvh flex-col">
    <!-- Main Content (scrollable) -->
    <main class="flex-1 overflow-y-auto p-4 pb-20">
      <slot />
    </main>

    <!-- Bottom Navigation Bar -->
    <nav class="bg-elevated border-default safe-area-bottom fixed inset-x-0 bottom-0 z-50 border-t">
      <div class="flex items-center justify-around py-2">
        <NuxtLink
          v-for="item in driverNavigationItems"
          :key="item.label"
          :to="item.to"
          class="flex flex-col items-center gap-1 px-3 py-1 text-xs transition-colors"
          :class="[
            route.path.startsWith(item.to as string)
              ? 'text-primary font-medium'
              : 'text-muted hover:text-default'
          ]"
        >
          <UIcon :name="item.icon!" class="size-5" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>

<style scoped>
/* Safe area padding cho Capacitor (iPhone Notch/Home Indicator) */
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0);
}
</style>
