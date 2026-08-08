<script setup lang="ts">
import { adminNavigationItems } from '~/utils/navigation'
import { mockAdminUser } from '~/utils/mockData'

const route = useRoute()
const sidebarCollapsed = ref(false)
const mobileSidebarOpen = ref(false)

const colorMode = useColorMode()

const allNavItems = computed(() => adminNavigationItems.flatMap(g => g))

function toggleSidebar() { sidebarCollapsed.value = !sidebarCollapsed.value }
function closeMobile() { mobileSidebarOpen.value = false }

function isActive(to: string) {
  if (to === '/admin') return route.path === '/admin'
  return route.path.startsWith(to)
}

function toggleDark() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <div class="min-h-screen bg-surface-muted text-surface-foreground flex font-sans">
    <!-- Mobile/Tablet overlay -->
    <Transition name="fade">
      <div v-if="mobileSidebarOpen" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden" @click="closeMobile" />
    </Transition>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 transition-[width,transform] duration-300 ease-out flex flex-col border-r border-white/[0.06] bg-slate-900',
        sidebarCollapsed ? 'w-[68px]' : 'w-[248px]',
        'lg:translate-x-0',
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ]"
    >
      <!-- Logo -->
      <div class="h-16 flex items-center justify-between px-4 border-b border-white/[0.05]">
        <NuxtLink to="/admin" class="flex items-center gap-3" @click="closeMobile">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-md shadow-primary-600/25 ring-1 ring-white/10">B</div>
          <Transition name="fade">
            <span v-if="!sidebarCollapsed" class="text-white font-bold text-[15px] tracking-tight">BunTech</span>
          </Transition>
        </NuxtLink>
        <UButton variant="ghost" color="neutral"
          class="lg:hidden text-slate-400 hover:text-white p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
          @click="closeMobile"
        >
          <UIcon name="i-lucide-x" class="w-5 h-5" aria-hidden="true" />
        </UButton>
      </div>

      <!-- Nav -->
      <nav class="flex-1 overflow-y-auto scrollbar-thin py-4 px-3">
        <div v-for="(group, gi) in adminNavigationItems" :key="gi" class="mb-4">
          <div v-if="!sidebarCollapsed && gi > 0" class="px-3 mb-1.5">
            <div class="h-px bg-white/[0.04]" />
          </div>
          <template v-for="item in group" :key="item.to">
            <NuxtLink
              :to="item.to"
              :class="[
                'group relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 mb-0.5',
                isActive(item.to) && route.path === item.to
                  ? 'bg-primary-600 text-white shadow-sm shadow-primary-600/20'
                  : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-100',
                sidebarCollapsed ? 'justify-center' : '',
              ]"
              @click="closeMobile"
            >
              <UIcon :name="item.icon" class="w-[18px] h-[18px] flex-shrink-0 transition-transform group-hover:scale-105" aria-hidden="true" />
              <Transition name="fade">
                <span v-if="!sidebarCollapsed">{{ item.label }}</span>
              </Transition>
            </NuxtLink>

            <div v-if="item.children && !sidebarCollapsed && isActive(item.to)" class="ml-6 pl-3 border-l border-white/[0.06] space-y-0.5 mb-2 mt-0.5">
              <NuxtLink
                v-for="child in item.children"
                :key="child.to"
                :to="child.to"
                :class="[
                  'block px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors',
                  route.path === child.to
                    ? 'text-primary-400 font-semibold'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]',
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
      <UButton variant="ghost" color="neutral"
        class="p-2.5 mx-3 mb-3 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all duration-200 hidden lg:flex items-center justify-center active:scale-90"
        @click="toggleSidebar"
      >
        <UIcon :name="sidebarCollapsed ? 'i-lucide-chevron-right' : 'i-lucide-chevron-left'" class="w-5 h-5" aria-hidden="true" />
      </UButton>
    </aside>

    <!-- Main content -->
    <div :class="['flex-1 transition-[margin] duration-300 ease-out min-h-screen', sidebarCollapsed ? 'lg:ml-[68px]' : 'lg:ml-[248px]']">
      <!-- Top bar -->
      <header class="h-16 glass border-b border-surface-border/50 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 safe-area-top">
        <UButton variant="ghost" color="neutral"
          class="lg:hidden text-surface-foreground p-2.5 -ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-surface-hover transition-colors"
          @click="mobileSidebarOpen = true"
        >
          <UIcon name="i-lucide-menu" class="w-5 h-5" aria-hidden="true" />
        </UButton>

        <!-- Search hint -->
        <div class="hidden lg:flex items-center gap-2 text-sm text-slate-400 dark:text-zinc-500">
          <kbd class="px-2 py-1 rounded-md border border-surface-border bg-surface-muted text-xs font-mono text-slate-400 dark:text-zinc-500">⌘K</kbd>
          <span class="text-xs">Tìm kiếm nhanh...</span>
        </div>

        <div class="flex-1 lg:hidden" />

        <div class="flex items-center gap-1.5">
          <!-- Dark mode -->
          <UButton variant="ghost" color="neutral"
            class="p-2.5 text-surface-foreground hover:bg-surface-hover rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            @click="toggleDark"
          >
            <UIcon :name="colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'" class="w-[18px] h-[18px]" aria-hidden="true" />
          </UButton>

          <!-- Notifications -->
          <UButton variant="ghost" color="neutral"
            class="relative p-2.5 text-surface-foreground hover:bg-surface-hover rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <UIcon name="i-lucide-bell" class="w-[18px] h-[18px]" aria-hidden="true" />
            <span class="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary-500 ring-2 ring-surface" />
            <span class="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary-500 animate-ping opacity-60" />
          </UButton>

          <!-- User menu -->
          <div class="relative ml-1">
            <UDropdownMenu
              :items="[
                [
                  { label: 'Hồ sơ', icon: 'i-lucide-user', to: '/admin/profile' },
                  { label: 'Đổi mật khẩu', icon: 'i-lucide-settings', to: '/admin/change-password' }
                ],
                [
                  { label: 'Đăng xuất', icon: 'i-lucide-log-out', color: 'error', to: '/auth/admin/login' }
                ]
              ]"
              :ui="{ content: 'w-56' }"
            >
              <UButton variant="ghost" color="neutral" class="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-surface-hover transition-all duration-200 min-h-[44px]">
                <UAvatar :src="mockAdminUser.avatar_url" :alt="mockAdminUser.full_name" size="sm" />
                <div class="hidden sm:block text-left">
                  <p class="text-sm font-medium text-surface-foreground leading-tight">{{ mockAdminUser.full_name }}</p>
                  <p class="text-xs text-slate-400 dark:text-zinc-500 leading-tight">{{ mockAdminUser.phone }}</p>
                </div>
                <UIcon name="i-lucide-chevron-down" class="w-4 h-4 text-slate-400 dark:text-zinc-500 hidden sm:block transition-transform" aria-hidden="true" />
              </UButton>
            </UDropdownMenu>
          </div>
        </div>
      </header>

      <!-- Page content -->
      <main class="p-4 sm:p-6 lg:p-8 mx-auto pb-24 lg:pb-12 h-[calc(100vh-64px)] overflow-y-auto">
        <slot />
      </main>
    </div>

    <!-- Bottom Navigation -->
    <nav class="fixed bottom-0 left-0 right-0 z-50 glass border-t border-surface-border/50 lg:hidden safe-area-bottom">
      <div class="flex items-stretch overflow-x-auto scrollbar-hide px-2 py-2 gap-1">
        <NuxtLink
          v-for="item in allNavItems"
          :key="item.to"
          :to="item.to"
          :class="[
            'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg min-w-[60px] min-h-[52px] flex-shrink-0 transition-all duration-200 active:scale-90',
            isActive(item.to) ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-zinc-500',
          ]"
          @click="closeMobile"
        >
          <UIcon :name="item.icon" class="w-5 h-5" aria-hidden="true" />
          <span class="text-[10px] font-medium leading-tight text-center">{{ item.label }}</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>
