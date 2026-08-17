<!--
  Responsibility: Render the Admin Layout Sidebar containing navigation links.
  Dependency: adminNavigationItems (utils), useAdminLayout (composables).
  Lifecycle: Mounted on admin layout, destroyed when leaving admin layout.
  Reason: Extracting from admin.vue to keep components small and adhere to architecture rules.
-->
<script setup lang="ts">
import { adminNavigationItems } from '~/utils/navigation'

const { sidebarCollapsed, mobileSidebarOpen, toggleSidebar, closeMobile } = useAdminLayout()
</script>

<template>
  <aside
    :class="[
      'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/[0.06] bg-slate-900 transition-[width,transform] duration-300 ease-out',
      sidebarCollapsed ? 'w-[68px]' : 'w-[248px]',
      'lg:translate-x-0',
      mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    ]"
  >
    <!-- Logo -->
    <div class="flex h-16 items-center justify-between border-b border-white/[0.05] px-4">
      <NuxtLink to="/admin" class="flex items-center gap-3" @click="closeMobile">
        <NuxtImg
          v-if="!sidebarCollapsed"
          src="/images/logo.webp"
          class="w-32 flex-shrink-0 object-cover"
          loading="lazy"
        />
        <Transition v-else name="fade">
          <NuxtImg
            src="/images/logo_sm.webp"
            class="w-10 flex-shrink-0 object-cover"
            loading="lazy"
          />
        </Transition>
      </NuxtLink>
      <UButton
        variant="ghost"
        color="neutral"
        class="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white lg:hidden"
        @click="closeMobile"
      >
        <UIcon name="i-lucide-x" class="h-5 w-5" aria-hidden="true" />
      </UButton>
    </div>

    <!-- Nav -->
    <nav class="flex-1 scrollbar-thin overflow-y-auto px-3 py-4">
      <UNavigationMenu
        orientation="vertical"
        :items="adminNavigationItems"
        :collapsed="sidebarCollapsed"
        class="w-full"
      />
    </nav>

    <!-- Collapse toggle -->
    <UButton
      variant="ghost"
      color="neutral"
      class="mx-3 mb-3 hidden items-center justify-center rounded-lg p-2.5 text-slate-400 transition-all duration-200 hover:bg-white/[0.06] hover:text-white active:scale-90 lg:flex"
      @click="toggleSidebar"
    >
      <UIcon
        :name="sidebarCollapsed ? 'i-lucide-chevron-right' : 'i-lucide-chevron-left'"
        class="h-5 w-5"
        aria-hidden="true"
      />
    </UButton>
  </aside>
</template>
