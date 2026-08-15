<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const _router = useRouter()
const colorMode = useColorMode()
const authStore = useAuthStore()
const isOnline = ref(true)
const showMenu = ref(false)

const handleOnline = () => {
  isOnline.value = true
}
const handleOffline = () => {
  isOnline.value = false
}

onMounted(() => {
  isOnline.value = navigator.onLine
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
})
onUnmounted(() => {
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
})

function closeMenu() {
  showMenu.value = false
}
function toggleDark() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const navItems = [
  { to: '/driver/delivery', label: 'Tuyến giao hàng', icon: 'i-lucide-route' },
  { to: '/driver/history', label: 'Lịch sử', icon: 'i-lucide-history' },
  { to: '/driver/notifications', label: 'Thông báo', icon: 'i-lucide-bell' },
  { to: '/driver/vehicle', label: 'Phương tiện', icon: 'i-lucide-bike' },
  { to: '/driver/profile', label: 'Hồ sơ', icon: 'i-lucide-user' }
]
</script>

<template>
  <div
    class="relative mx-auto flex min-h-screen max-w-md flex-col bg-neutral-100 shadow-2xl shadow-slate-900/5 dark:bg-zinc-900"
  >
    <!-- Premium header with gradient -->
    <header
      class="to-primary-950/90 sticky top-0 z-40 flex items-center justify-between bg-gradient-to-br from-slate-900 via-slate-900 px-4 py-4 text-white"
    >
      <div class="flex items-center gap-3">
        <div
          class="from-primary-500 to-primary-600 shadow-primary-600/25 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br font-bold text-white shadow-md"
        >
          {{ authStore.userInitials || 'B' }}
        </div>
        <div>
          <p class="text-sm leading-tight font-bold">BunTech Driver</p>
          <p class="mt-0.5 text-[11px] leading-tight text-slate-400">
            {{ authStore.user?.fullName || 'Tài xế' }}
          </p>
        </div>
      </div>
      <div class="flex items-center gap-1">
        <div
          :class="[
            'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors',
            isOnline ? 'bg-success-500/15 text-success-400' : 'bg-error-500/15 text-error-400'
          ]"
        >
          <UIcon :name="isOnline ? 'i-lucide-wifi' : 'i-lucide-wifi-off'" class="h-3.5 w-3.5" />
          <span>{{ isOnline ? 'Online' : 'Offline' }}</span>
        </div>
        <UButton
          variant="ghost"
          color="neutral"
          class="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2.5 text-slate-400 transition-all hover:bg-white/5 hover:text-white"
          @click="toggleDark"
        >
          <UIcon
            :name="colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'"
            class="h-5 w-5"
          />
        </UButton>
        <UButton
          variant="ghost"
          color="neutral"
          class="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2.5 text-slate-400 transition-all hover:bg-white/5 hover:text-white"
          @click="
            () => {
              showMenu = !showMenu
            }
          "
        >
          <UIcon :name="showMenu ? 'i-lucide-x' : 'i-lucide-menu'" class="h-5 w-5" />
        </UButton>
      </div>
    </header>

    <!-- Slide-down menu -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform -translate-y-4 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform -translate-y-4 opacity-0"
    >
      <div
        v-if="showMenu"
        class="absolute top-[72px] right-0 left-0 z-50 border-b border-white/10 bg-slate-900/95 shadow-xl backdrop-blur-md"
      >
        <nav class="space-y-1 px-4 py-3" @click="closeMenu">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            :class="[
              'flex min-h-[48px] items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
              route.path === item.to ||
              (item.to !== '/driver/delivery' && route.path.startsWith(item.to))
                ? 'bg-primary-500/15 text-primary-400'
                : 'text-slate-300 hover:bg-white/5'
            ]"
          >
            <UIcon :name="item.icon" class="h-5 w-5" />
            {{ item.label }}
          </NuxtLink>
          <UButton
            variant="ghost"
            color="neutral"
            class="text-error-400 hover:bg-error-500/10 flex min-h-[48px] w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors"
            @click="authStore.logout()"
          >
            <UIcon name="i-lucide-log-out" class="h-5 w-5" />
            Đăng xuất
          </UButton>
        </nav>
      </div>
    </Transition>

    <main class="relative flex-1 pb-20">
      <slot />
    </main>

    <!-- Bottom nav -->
    <nav
      class="safe-area-bottom fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-neutral-200 bg-white/80 backdrop-blur-md dark:border-neutral-800 dark:bg-zinc-900/80"
    >
      <div class="flex items-center justify-around px-2 py-2">
        <NuxtLink
          to="/driver/delivery"
          :class="[
            'flex min-h-[48px] min-w-[56px] flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 transition-all duration-200 active:scale-90',
            route.path.startsWith('/driver/delivery')
              ? 'text-primary-600 dark:text-primary-400'
              : 'hover:text-primary-400 text-slate-400 dark:text-zinc-500'
          ]"
        >
          <UIcon name="i-lucide-route" class="h-5 w-5" />
          <span class="text-[10px] font-medium">Tuyến giao</span>
        </NuxtLink>
        <NuxtLink
          to="/driver/history"
          :class="[
            'flex min-h-[48px] min-w-[56px] flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 transition-all duration-200 active:scale-90',
            route.path.startsWith('/driver/history')
              ? 'text-primary-600 dark:text-primary-400'
              : 'hover:text-primary-400 text-slate-400 dark:text-zinc-500'
          ]"
        >
          <UIcon name="i-lucide-history" class="h-5 w-5" />
          <span class="text-[10px] font-medium">Lịch sử</span>
        </NuxtLink>
        <NuxtLink
          to="/driver/notifications"
          :class="[
            'relative flex min-h-[48px] min-w-[56px] flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 transition-all duration-200 active:scale-90',
            route.path.startsWith('/driver/notifications')
              ? 'text-primary-600 dark:text-primary-400'
              : 'hover:text-primary-400 text-slate-400 dark:text-zinc-500'
          ]"
        >
          <UIcon name="i-lucide-bell" class="h-5 w-5" />
          <span class="bg-error-500 absolute top-1 right-2 h-2 w-2 rounded-full" />
          <span class="text-[10px] font-medium">Thông báo</span>
        </NuxtLink>
        <NuxtLink
          to="/driver/profile"
          :class="[
            'flex min-h-[48px] min-w-[56px] flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 transition-all duration-200 active:scale-90',
            route.path.startsWith('/driver/profile')
              ? 'text-primary-600 dark:text-primary-400'
              : 'hover:text-primary-400 text-slate-400 dark:text-zinc-500'
          ]"
        >
          <UIcon name="i-lucide-user" class="h-5 w-5" />
          <span class="text-[10px] font-medium">Hồ sơ</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>
