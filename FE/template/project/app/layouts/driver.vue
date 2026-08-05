<script setup lang="ts">
import { LogOut, Wifi, WifiOff, Route as RouteIcon, Sun, Moon, Home, User, Bell, Bike, History, Settings, Menu, X } from 'lucide-vue-next'
const { t } = useI18n()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const isOnline = ref(true)
const showMenu = ref(false)

const { colorMode, toggleDark, initDark } = useColorMode()
onMounted(initDark)

function handleLogout() {
  authStore.logout()
  router.push('/auth/driver/login')
}

const handleOnline = () => { isOnline.value = true }
const handleOffline = () => { isOnline.value = false }

onMounted(() => {
  isOnline.value = navigator.onLine
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
})
onUnmounted(() => {
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
})

const navItems = [
  { to: '/driver', label: 'Đơn hàng', icon: RouteIcon },
  { to: '/driver/history', label: 'Lịch sử', icon: History },
  { to: '/driver/notifications', label: 'Thông báo', icon: Bell },
  { to: '/driver/vehicle', label: 'Xe', icon: Bike },
  { to: '/driver/profile', label: 'Hồ sơ', icon: User },
]

function closeMenu() { showMenu.value = false }
</script>

<template>
  <div class="min-h-screen bg-surface-muted flex flex-col max-w-md mx-auto relative shadow-2xl shadow-slate-900/5">
    <!-- Premium header with gradient -->
    <header class="bg-gradient-to-br from-slate-900 via-slate-900 to-primary-950/90 text-white px-4 py-4 flex items-center justify-between sticky top-0 z-40 safe-area-top">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold shadow-md shadow-primary-600/25">B</div>
        <div>
          <p class="font-bold text-sm leading-tight">BunTech Driver</p>
          <p class="text-[11px] text-slate-400 leading-tight mt-0.5">{{ authStore.user?.full_name }}</p>
        </div>
      </div>
      <div class="flex items-center gap-1">
        <div
          :class="[
            'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors',
            isOnline ? 'bg-success-500/15 text-success-400' : 'bg-danger-500/15 text-danger-400',
          ]"
          role="status"
          :aria-live="isOnline ? 'off' : 'assertive'"
        >
          <component :is="isOnline ? Wifi : WifiOff" class="w-3.5 h-3.5" aria-hidden="true" />
          <span>{{ isOnline ? (t('driver.online') || 'Online') : (t('driver.offline') || 'Offline') }}</span>
        </div>
        <button
          class="p-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
          :aria-label="colorMode === 'dark' ? 'Bật chế độ sáng' : 'Bật chế độ tối'"
          @click="toggleDark"
        >
          <Sun v-if="colorMode === 'dark'" class="w-5 h-5" aria-hidden="true" />
          <Moon v-else class="w-5 h-5" aria-hidden="true" />
        </button>
        <button
          class="text-slate-400 hover:text-white p-2.5 rounded-lg hover:bg-white/5 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Menu"
          @click="showMenu = !showMenu"
        >
          <component :is="showMenu ? X : Menu" class="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
    </header>

    <!-- Slide-down menu -->
    <Transition name="slide-down">
      <div v-if="showMenu" class="absolute top-full left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-white/10 shadow-xl">
        <nav class="px-4 py-3 space-y-1" @click="closeMenu">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            :class="[
              'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors min-h-[48px]',
              route.path === item.to || (item.to !== '/driver' && route.path.startsWith(item.to))
                ? 'bg-primary-500/15 text-primary-400'
                : 'text-slate-300 hover:bg-white/5',
            ]"
          >
            <component :is="item.icon" class="w-5 h-5" aria-hidden="true" />
            {{ item.label }}
          </NuxtLink>
          <button
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-danger-400 hover:bg-danger-500/10 transition-colors w-full min-h-[48px]"
            @click="handleLogout; closeMenu()"
          >
            <LogOut class="w-5 h-5" aria-hidden="true" />
            Đăng xuất
          </button>
        </nav>
      </div>
    </Transition>

    <main class="flex-1 pb-20">
      <slot />
    </main>

    <!-- Bottom nav -->
    <nav class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md glass border-t border-surface-border/50 z-40 safe-area-bottom" aria-label="Bottom navigation">
      <div class="flex items-center justify-around px-2 py-2">
        <NuxtLink
          to="/driver"
          :class="[
            'flex flex-col items-center gap-1 px-3 py-2 rounded-lg min-w-[56px] min-h-[48px] justify-center transition-all duration-200 active:scale-90',
            route.path === '/driver' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-zinc-500',
          ]"
          :aria-current="route.path === '/driver' ? 'page' : undefined"
        >
          <RouteIcon class="w-5 h-5" aria-hidden="true" />
          <span class="text-[10px] font-medium">Đơn hàng</span>
        </NuxtLink>
        <NuxtLink
          to="/driver/history"
          :class="[
            'flex flex-col items-center gap-1 px-3 py-2 rounded-lg min-w-[56px] min-h-[48px] justify-center transition-all duration-200 active:scale-90',
            route.path === '/driver/history' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-zinc-500',
          ]"
          :aria-current="route.path === '/driver/history' ? 'page' : undefined"
        >
          <History class="w-5 h-5" aria-hidden="true" />
          <span class="text-[10px] font-medium">Lịch sử</span>
        </NuxtLink>
        <NuxtLink
          to="/driver/notifications"
          :class="[
            'flex flex-col items-center gap-1 px-3 py-2 rounded-lg min-w-[56px] min-h-[48px] justify-center transition-all duration-200 active:scale-90 relative',
            route.path === '/driver/notifications' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-zinc-500',
          ]"
          :aria-current="route.path === '/driver/notifications' ? 'page' : undefined"
        >
          <Bell class="w-5 h-5" aria-hidden="true" />
          <span class="absolute top-1 right-2 w-2 h-2 rounded-full bg-danger-500" />
          <span class="text-[10px] font-medium">Thông báo</span>
        </NuxtLink>
        <NuxtLink
          to="/driver/vehicle"
          :class="[
            'flex flex-col items-center gap-1 px-3 py-2 rounded-lg min-w-[56px] min-h-[48px] justify-center transition-all duration-200 active:scale-90',
            route.path === '/driver/vehicle' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-zinc-500',
          ]"
          :aria-current="route.path === '/driver/vehicle' ? 'page' : undefined"
        >
          <Bike class="w-5 h-5" aria-hidden="true" />
          <span class="text-[10px] font-medium">Phương tiện</span>
        </NuxtLink>
        <NuxtLink
          to="/driver/profile"
          :class="[
            'flex flex-col items-center gap-1 px-3 py-2 rounded-lg min-w-[56px] min-h-[48px] justify-center transition-all duration-200 active:scale-90',
            route.path === '/driver/profile' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-zinc-500',
          ]"
          :aria-current="route.path === '/driver/profile' ? 'page' : undefined"
        >
          <User class="w-5 h-5" aria-hidden="true" />
          <span class="text-[10px] font-medium">Hồ sơ</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
</style>
