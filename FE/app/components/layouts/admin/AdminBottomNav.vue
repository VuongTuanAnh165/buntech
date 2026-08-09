<!--
  Responsibility: Render the Admin Layout Bottom Navigation for mobile screens.
  Dependency: adminNavigationItems (utils), useAdminLayout (composables).
  Lifecycle: Mounted on admin layout, destroyed when leaving admin layout.
  Reason: Extracting from admin.vue to keep components small and adhere to architecture rules.
-->
<script setup lang="ts">
import { adminNavigationItems } from '~/utils/navigation'

const route = useRoute()
const { closeMobile } = useAdminLayout()

const allNavItems = computed(() => adminNavigationItems.flatMap((g) => g))

function isActive(to: string) {
  if (to === '/admin') return route.path === '/admin'
  return route.path.startsWith(to)
}
</script>

<template>
  <nav
    class="glass border-surface-border/50 safe-area-bottom fixed right-0 bottom-0 left-0 z-50 border-t lg:hidden"
  >
    <div class="scrollbar-hide flex items-stretch gap-1 overflow-x-auto px-2 py-2">
      <NuxtLink
        v-for="item in allNavItems"
        :key="item.to"
        :to="item.to"
        :class="[
          'flex min-h-[52px] min-w-[60px] flex-shrink-0 flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 transition-all duration-200 active:scale-90',
          isActive(item.to)
            ? 'text-primary-600 dark:text-primary-400'
            : 'text-slate-400 dark:text-zinc-500'
        ]"
        @click="closeMobile"
      >
        <UIcon :name="item.icon" class="h-5 w-5" aria-hidden="true" />
        <span class="text-center text-[10px] leading-tight font-medium">{{ item.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>
