<!--
  Responsibility: Render the Admin Layout Sidebar containing navigation links.
  Dependency: adminNavigationItems (utils), useAdminLayout (composables).
  Lifecycle: Mounted on admin layout, destroyed when leaving admin layout.
  Reason: Extracting from admin.vue to keep components small and adhere to architecture rules.
-->
<script setup lang="ts">
import { adminNavigationItems } from '~/utils/navigation'

const route = useRoute()
const { sidebarCollapsed, mobileSidebarOpen, toggleSidebar, closeMobile } = useAdminLayout()

function isActive(to: string) {
  if (to === '/admin') return route.path === '/admin'
  return route.path.startsWith(to)
}
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
        <div
          class="from-primary-500 to-primary-600 shadow-primary-600/25 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-base font-bold text-white shadow-md ring-1 ring-white/10"
        >
          B
        </div>
        <Transition name="fade">
          <span v-if="!sidebarCollapsed" class="text-[15px] font-bold tracking-tight text-white"
            >BunTech</span
          >
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
      <div v-for="(group, gi) in adminNavigationItems" :key="gi" class="mb-4">
        <div v-if="!sidebarCollapsed && gi > 0" class="mb-1.5 px-3">
          <div class="h-px bg-white/[0.04]" />
        </div>
        <template v-for="item in group" :key="item.to">
          <NuxtLink
            :to="item.to"
            :class="[
              'group relative mb-0.5 flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200',
              isActive(item.to) && route.path === item.to
                ? 'bg-primary-600 shadow-primary-600/20 text-white shadow-sm'
                : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-100',
              sidebarCollapsed ? 'justify-center' : ''
            ]"
            @click="closeMobile"
          >
            <UIcon
              :name="item.icon"
              class="h-[18px] w-[18px] flex-shrink-0 transition-transform group-hover:scale-105"
              aria-hidden="true"
            />
            <Transition name="fade">
              <span v-if="!sidebarCollapsed">{{ item.label }}</span>
            </Transition>
          </NuxtLink>

          <div
            v-if="item.children && !sidebarCollapsed && isActive(item.to)"
            class="mt-0.5 mb-2 ml-6 space-y-0.5 border-l border-white/[0.06] pl-3"
          >
            <NuxtLink
              v-for="child in item.children"
              :key="child.to"
              :to="child.to"
              :class="[
                'block rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors',
                route.path === child.to
                  ? 'text-primary-400 font-semibold'
                  : 'text-slate-500 hover:bg-white/[0.02] hover:text-slate-300'
              ]"
              @click="closeMobile"
            >
              {{ child.label }}
            </NuxtLink>
          </div>
        </template>
      </div>
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
