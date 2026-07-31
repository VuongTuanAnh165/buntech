<script setup lang="ts">
import {
  LayoutDashboard, Users, Package, ShoppingCart, Wallet,
  Boxes, FileText, Settings, LogOut, Menu, ChevronLeft, ChevronRight, User
} from 'lucide-vue-next'
const { t } = useI18n()
const authStore = useAuthStore()
const router = useRouter()
const sidebarCollapsed = ref(false)
const userMenuOpen = ref(false)

const navGroups = computed(() => [
  {
    items: [
      { label: t('nav.dashboard'), to: '/admin', icon: LayoutDashboard },
    ],
  },
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

function handleLogout() {
  authStore.logout()
  router.push('/auth/admin/login')
}
function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex">
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-40 bg-gray-900 text-gray-300 transition-all duration-300 flex flex-col',
        sidebarCollapsed ? 'w-16' : 'w-60',
      ]"
    >
      <div class="h-16 flex items-center justify-between px-4 border-b border-gray-800">
        <NuxtLink to="/admin" class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold flex-shrink-0">B</div>
          <span v-if="!sidebarCollapsed" class="text-white font-bold">BunTech</span>
        </NuxtLink>
      </div>
      <nav class="flex-1 overflow-y-auto py-4 scrollbar-thin">
        <div v-for="(group, gi) in navGroups" :key="gi" class="mb-4">
          <div v-if="!sidebarCollapsed && gi > 0" class="px-4 mb-1 h-px bg-gray-800" />
          <NuxtLink
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            :class="[
              'flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-gray-800 hover:text-white transition-colors',
              sidebarCollapsed ? 'justify-center' : '',
            ]"
            active-class="bg-primary-600 text-white"
          >
            <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
            <span v-if="!sidebarCollapsed">{{ item.label }}</span>
          </NuxtLink>
        </div>
      </nav>
      <button
        class="p-3 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors flex items-center justify-center"
        @click="toggleSidebar"
      >
        <component :is="sidebarCollapsed ? ChevronRight : ChevronLeft" class="w-5 h-5" />
      </button>
    </aside>

    <div :class="['flex-1 transition-all duration-300', sidebarCollapsed ? 'ml-16' : 'ml-60']">
      <header class="h-16 bg-white border-b border-gray-100 sticky top-0 z-30 flex items-center justify-between px-6">
        <button class="lg:hidden text-gray-600" @click="toggleSidebar">
          <Menu class="w-5 h-5" />
        </button>
        <div class="flex-1" />
        <div class="relative">
          <button
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            @click="userMenuOpen = !userMenuOpen"
          >
            <AppAvatar :name="authStore.user?.full_name" :src="authStore.user?.avatar_url" size="sm" />
            <span class="text-sm font-medium text-gray-700 hidden sm:block">{{ authStore.user?.full_name }}</span>
          </button>
          <Transition name="fade">
            <div v-if="userMenuOpen" class="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
              <div class="px-4 py-2 border-b border-gray-50">
                <p class="text-sm font-medium text-gray-900">{{ authStore.user?.full_name }}</p>
                <p class="text-xs text-gray-500">{{ authStore.user?.phone }}</p>
              </div>
              <NuxtLink to="/admin/profile" class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" @click="userMenuOpen = false">
                <User class="w-4 h-4" /> {{ t('nav.profile') }}
              </NuxtLink>
              <NuxtLink v-permission="['ADMIN']" to="/admin/change-password" class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" @click="userMenuOpen = false">
                <Settings class="w-4 h-4" /> {{ t('nav.changePassword') }}
              </NuxtLink>
              <button class="w-full flex items-center gap-2 px-4 py-2 text-sm text-danger-600 hover:bg-danger-50" @click="handleLogout">
                <LogOut class="w-4 h-4" /> {{ t('nav.logout') }}
              </button>
            </div>
          </Transition>
        </div>
      </header>

      <main class="p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
