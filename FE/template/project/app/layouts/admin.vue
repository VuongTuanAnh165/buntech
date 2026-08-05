<script setup lang="ts">
import {
  LayoutDashboard, Users, Package, ShoppingCart, Wallet,
  Boxes, FileText, Settings, LogOut, Menu, ChevronLeft, ChevronRight, User, X,
  Sun, Moon, Bell,
} from 'lucide-vue-next'
const { t } = useI18n()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const sidebarCollapsed = ref(false)
const mobileSidebarOpen = ref(false)
const userMenuOpen = ref(false)
const userMenuRef = ref<HTMLElement | null>(null)

const { colorMode, toggleDark, initDark } = useColorMode()
onMounted(initDark)

const navGroups = computed(() => [
  { items: [{ label: t('nav.dashboard'), to: '/admin', icon: LayoutDashboard }] },
  {
    items: [
      { label: t('nav.customers'), to: '/admin/customers', icon: Users },
      { label: t('nav.products'), to: '/admin/products', icon: Package },
      { label: t('nav.orders'), to: '/admin/orders', icon: ShoppingCart },
    ],
  },
  {
    items: [
      { label: t('nav.finance'), to: '/admin/finance', icon: Wallet },
      { label: t('nav.inventory'), to: '/admin/inventory', icon: Boxes },
    ],
  },
  {
    items: [
      { label: t('nav.blog'), to: '/admin/blog', icon: FileText },
      { label: t('nav.settings'), to: '/admin/settings', icon: Settings },
    ],
  },
])

const allNavItems = computed(() => navGroups.value.flatMap(g => g.items))

function handleLogout() {
  authStore.logout()
  router.push('/auth/admin/login')
}
function toggleSidebar() { sidebarCollapsed.value = !sidebarCollapsed.value }
function isActive(to: string) {
  if (to === '/admin') return route.path === '/admin'
  return route.path.startsWith(to)
}
function closeMobile() { mobileSidebarOpen.value = false }

function onOutsideClick(e: MouseEvent) {
  if (userMenuRef.value && !userMenuRef.value.contains(e.target as Node)) {
    userMenuOpen.value = false
  }
}
function onEscape(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    userMenuOpen.value = false
    mobileSidebarOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', onOutsideClick)
  document.addEventListener('keydown', onEscape)
})
onUnmounted(() => {
  document.removeEventListener('mousedown', onOutsideClick)
  document.removeEventListener('keydown', onEscape)
})
</script>

<template>
  <div class="min-h-screen bg-surface-muted flex">
    <!-- Mobile/Tablet overlay -->
    <Transition name="fade">
      <div v-if="mobileSidebarOpen" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden" @click="closeMobile" />
    </Transition>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 transition-[width,transform] duration-300 ease-out flex flex-col border-r border-white/[0.06]',
        sidebarCollapsed ? 'w-[68px]' : 'w-[248px]',
        'lg:translate-x-0',
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ]"
      :style="{ backgroundColor: 'rgb(var(--sidebar-bg))' }"
    >
      <!-- Logo -->
      <div class="h-16 flex items-center justify-between px-4 border-b border-white/[0.05]">
        <NuxtLink to="/admin" class="flex items-center gap-3" @click="closeMobile">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-md shadow-primary-600/25 ring-1 ring-white/10">B</div>
          <Transition name="fade">
            <span v-if="!sidebarCollapsed" class="text-white font-bold text-[15px] tracking-tight">BunTech</span>
          </Transition>
        </NuxtLink>
        <button
          class="lg:hidden text-slate-400 hover:text-white p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Đóng menu"
          @click="closeMobile"
        >
          <X class="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      <!-- Nav -->
      <nav class="flex-1 overflow-y-auto scrollbar-thin py-4 px-3" aria-label="Sidebar navigation">
        <div v-for="(group, gi) in navGroups" :key="gi" class="mb-4">
          <div v-if="!sidebarCollapsed && gi > 0" class="px-3 mb-1.5">
            <div class="h-px bg-white/[0.04]" />
          </div>
          <NuxtLink
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            :class="[
              'group relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 mb-0.5',
              isActive(item.to)
                ? 'bg-primary-600 text-white shadow-sm shadow-primary-600/20'
                : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-100',
              sidebarCollapsed ? 'justify-center' : '',
            ]"
            :aria-current="isActive(item.to) ? 'page' : undefined"
            :title="sidebarCollapsed ? item.label : undefined"
            @click="closeMobile"
          >
            <component :is="item.icon" class="w-[18px] h-[18px] flex-shrink-0 transition-transform group-hover:scale-105" aria-hidden="true" />
            <Transition name="fade">
              <span v-if="!sidebarCollapsed">{{ item.label }}</span>
            </Transition>
          </NuxtLink>
        </div>
      </nav>

      <!-- Collapse toggle -->
      <button
        class="p-2.5 mx-3 mb-3 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all duration-200 hidden lg:flex items-center justify-center active:scale-90"
        :aria-label="sidebarCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'"
        @click="toggleSidebar"
      >
        <component :is="sidebarCollapsed ? ChevronRight : ChevronLeft" class="w-5 h-5" aria-hidden="true" />
      </button>
    </aside>

    <!-- Main content -->
    <div :class="['flex-1 transition-[margin] duration-300 ease-out', sidebarCollapsed ? 'lg:ml-[68px]' : 'lg:ml-[248px]']">
      <!-- Top bar -->
      <header class="h-16 glass border-b border-surface-border/50 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 safe-area-top">
        <button
          class="lg:hidden text-surface-foreground p-2.5 -ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-surface-hover transition-colors"
          aria-label="Mở menu"
          @click="mobileSidebarOpen = true"
        >
          <Menu class="w-5 h-5" aria-hidden="true" />
        </button>

        <!-- Search hint (decorative on desktop) -->
        <div class="hidden lg:flex items-center gap-2 text-sm text-slate-400 dark:text-zinc-500">
          <kbd class="px-2 py-1 rounded-md border border-surface-border bg-surface-muted text-xs font-mono text-slate-400 dark:text-zinc-500">⌘K</kbd>
          <span class="text-xs">Tìm kiếm nhanh...</span>
        </div>

        <div class="flex-1 lg:hidden" />

        <div class="flex items-center gap-1.5">
          <!-- Dark mode toggle -->
          <button
            class="p-2.5 text-surface-foreground hover:bg-surface-hover rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            :aria-label="colorMode === 'dark' ? 'Bật chế độ sáng' : 'Bật chế độ tối'"
            @click="toggleDark"
          >
            <Sun v-if="colorMode === 'dark'" class="w-[18px] h-[18px]" aria-hidden="true" />
            <Moon v-else class="w-[18px] h-[18px]" aria-hidden="true" />
          </button>

          <!-- Notifications (decorative) -->
          <button
            class="relative p-2.5 text-surface-foreground hover:bg-surface-hover rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Thông báo"
          >
            <Bell class="w-[18px] h-[18px]" aria-hidden="true" />
            <span class="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary-500 ring-2 ring-surface" />
            <span class="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary-500 animate-ping opacity-60" />
          </button>

          <!-- User menu -->
          <div ref="userMenuRef" class="relative ml-1">
            <button
              class="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-surface-hover transition-all duration-200 min-h-[44px]"
              aria-haspopup="menu"
              :aria-expanded="userMenuOpen"
              aria-controls="user-menu"
              @click="userMenuOpen = !userMenuOpen"
            >
              <AppAvatar :name="authStore.user?.full_name" :src="authStore.user?.avatar_url" size="sm" />
              <div class="hidden sm:block text-left">
                <p class="text-sm font-medium text-surface-foreground leading-tight">{{ authStore.user?.full_name }}</p>
                <p class="text-xs text-slate-400 dark:text-zinc-500 leading-tight">{{ authStore.user?.phone || '' }}</p>
              </div>
              <svg class="w-4 h-4 text-slate-400 dark:text-zinc-500 hidden sm:block transition-transform" :class="userMenuOpen ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            <Transition name="dropdown">
              <div
                v-if="userMenuOpen"
                id="user-menu"
                role="menu"
                class="absolute right-0 top-full mt-1.5 w-60 bg-surface rounded-xl shadow-dropdown border border-surface-border py-1.5 z-50 origin-top-right"
              >
                <div class="px-4 py-3 border-b border-surface-border">
                  <p class="text-sm font-semibold text-surface-foreground">{{ authStore.user?.full_name }}</p>
                  <p class="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">{{ authStore.user?.phone }}</p>
                </div>
                <NuxtLink to="/admin/profile" role="menuitem" class="flex items-center gap-2.5 px-4 py-2.5 text-sm text-surface-foreground hover:bg-surface-hover transition-colors min-h-[44px]" @click="userMenuOpen = false">
                  <User class="w-4 h-4 text-slate-400 dark:text-zinc-500" aria-hidden="true" /> {{ t('nav.profile') }}
                </NuxtLink>
                <NuxtLink v-permission="['ADMIN']" to="/admin/change-password" role="menuitem" class="flex items-center gap-2.5 px-4 py-2.5 text-sm text-surface-foreground hover:bg-surface-hover transition-colors min-h-[44px]" @click="userMenuOpen = false">
                  <Settings class="w-4 h-4 text-slate-400 dark:text-zinc-500" aria-hidden="true" /> {{ t('nav.changePassword') }}
                </NuxtLink>
                <div class="h-px bg-surface-border my-1.5" />
                <button role="menuitem" class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors min-h-[44px]" @click="handleLogout">
                  <LogOut class="w-4 h-4" aria-hidden="true" /> {{ t('nav.logout') }}
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </header>

      <!-- Page content -->
      <main class="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto pb-24 lg:pb-12">
        <slot />
      </main>
    </div>

    <!-- Bottom Navigation (mobile/tablet only) -->
    <nav class="fixed bottom-0 left-0 right-0 z-50 glass border-t border-surface-border/50 lg:hidden safe-area-bottom" aria-label="Bottom navigation">
      <div class="flex items-stretch overflow-x-auto scrollbar-hide px-2 py-2 gap-1">
        <NuxtLink
          v-for="item in allNavItems"
          :key="item.to"
          :to="item.to"
          :class="[
            'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg min-w-[60px] min-h-[52px] flex-shrink-0 transition-all duration-200 active:scale-90',
            isActive(item.to) ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-zinc-500',
          ]"
          :aria-current="isActive(item.to) ? 'page' : undefined"
          @click="closeMobile"
        >
          <component :is="item.icon" class="w-5 h-5" aria-hidden="true" />
          <span class="text-[10px] font-medium leading-tight text-center">{{ item.label }}</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>
