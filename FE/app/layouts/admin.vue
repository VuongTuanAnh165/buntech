<script setup lang="ts">
import { adminNavigationItems } from '~/utils/navigation'
import { mockAdminUser } from '~/utils/mockData'

const route = useRoute()
const sidebarCollapsed = ref(false)
const mobileSidebarOpen = ref(false)

const colorMode = useColorMode()

const allNavItems = computed(() => adminNavigationItems.flatMap((g) => g))

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}
function closeMobile() {
  mobileSidebarOpen.value = false
}

function isActive(to: string) {
  if (to === '/admin') return route.path === '/admin'
  return route.path.startsWith(to)
}

function toggleDark() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <div class="bg-surface-muted text-surface-foreground flex min-h-screen font-sans">
    <!-- Mobile/Tablet overlay -->
    <Transition name="fade">
      <div
        v-if="mobileSidebarOpen"
        class="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
        @click="closeMobile"
      />
    </Transition>

    <!-- Sidebar -->
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

    <!-- Main content -->
    <div
      :class="[
        'min-h-screen flex-1 transition-[margin] duration-300 ease-out',
        sidebarCollapsed ? 'lg:ml-[68px]' : 'lg:ml-[248px]'
      ]"
    >
      <!-- Top bar -->
      <header
        class="glass border-surface-border/50 safe-area-top sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 sm:px-6"
      >
        <UButton
          variant="ghost"
          color="neutral"
          class="text-surface-foreground hover:bg-surface-hover -ml-2 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2.5 transition-colors lg:hidden"
          @click="mobileSidebarOpen = true"
        >
          <UIcon name="i-lucide-menu" class="h-5 w-5" aria-hidden="true" />
        </UButton>

        <!-- Search hint -->
        <div class="hidden items-center gap-2 text-sm text-slate-400 lg:flex dark:text-zinc-500">
          <kbd
            class="border-surface-border bg-surface-muted rounded-md border px-2 py-1 font-mono text-xs text-slate-400 dark:text-zinc-500"
            >⌘K</kbd
          >
          <span class="text-xs">Tìm kiếm nhanh...</span>
        </div>

        <div class="flex-1 lg:hidden" />

        <div class="flex items-center gap-1.5">
          <!-- Dark mode -->
          <UButton
            variant="ghost"
            color="neutral"
            class="text-surface-foreground hover:bg-surface-hover flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2.5 transition-colors"
            @click="toggleDark"
          >
            <UIcon
              :name="colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'"
              class="h-[18px] w-[18px]"
              aria-hidden="true"
            />
          </UButton>

          <!-- Notifications -->
          <UButton
            variant="ghost"
            color="neutral"
            class="text-surface-foreground hover:bg-surface-hover relative flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2.5 transition-colors"
          >
            <UIcon name="i-lucide-bell" class="h-[18px] w-[18px]" aria-hidden="true" />
            <span
              class="bg-primary-500 ring-surface absolute top-2 right-2 h-2 w-2 rounded-full ring-2"
            />
            <span
              class="bg-primary-500 absolute top-2 right-2 h-2 w-2 animate-ping rounded-full opacity-60"
            />
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
                  {
                    label: 'Đăng xuất',
                    icon: 'i-lucide-log-out',
                    color: 'error',
                    to: '/auth/admin/login'
                  }
                ]
              ]"
              :ui="{ content: 'w-56' }"
            >
              <UButton
                variant="ghost"
                color="neutral"
                class="hover:bg-surface-hover flex min-h-[44px] items-center gap-2.5 rounded-xl px-2 py-1.5 transition-all duration-200"
              >
                <UAvatar :src="mockAdminUser.avatar_url" :alt="mockAdminUser.full_name" size="sm" />
                <div class="hidden text-left sm:block">
                  <p class="text-surface-foreground text-sm leading-tight font-medium">
                    {{ mockAdminUser.full_name }}
                  </p>
                  <p class="text-xs leading-tight text-slate-400 dark:text-zinc-500">
                    {{ mockAdminUser.phone }}
                  </p>
                </div>
                <UIcon
                  name="i-lucide-chevron-down"
                  class="hidden h-4 w-4 text-slate-400 transition-transform sm:block dark:text-zinc-500"
                  aria-hidden="true"
                />
              </UButton>
            </UDropdownMenu>
          </div>
        </div>
      </header>

      <!-- Page content -->
      <main class="mx-auto h-[calc(100vh-64px)] overflow-y-auto p-4 pb-24 sm:p-6 lg:p-8 lg:pb-12">
        <slot />
      </main>
    </div>

    <!-- Bottom Navigation -->
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
  </div>
</template>
