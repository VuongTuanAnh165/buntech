<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { driverNavigationItems } from '~/utils/navigation'

const route = useRoute()
const router = useRouter()
const colorMode = useColorMode()
const isOnline = ref(true)
const showMenu = ref(false)

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

function closeMenu() { showMenu.value = false }
function toggleDark() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
function handleLogout() {
  navigateTo('/auth/login')
  closeMenu()
}

const navItems = [
  { to: '/driver/delivery', label: 'Tuyến giao hàng', icon: 'i-lucide-route' },
  { to: '/driver/history', label: 'Lịch sử', icon: 'i-lucide-history' },
  { to: '/driver/notifications', label: 'Thông báo', icon: 'i-lucide-bell' },
  { to: '/driver/vehicle', label: 'Phương tiện', icon: 'i-lucide-bike' },
  { to: '/driver/profile', label: 'Hồ sơ', icon: 'i-lucide-user' },
]
</script>

<template>
  <div class="min-h-screen bg-neutral-100 dark:bg-zinc-900 flex flex-col max-w-md mx-auto relative shadow-2xl shadow-slate-900/5">
    <!-- Premium header with gradient -->
    <header class="bg-gradient-to-br from-slate-900 via-slate-900 to-primary-950/90 text-white px-4 py-4 flex items-center justify-between sticky top-0 z-40">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold shadow-md shadow-primary-600/25">B</div>
        <div>
          <p class="font-bold text-sm leading-tight">BunTech Driver</p>
          <p class="text-[11px] text-slate-400 leading-tight mt-0.5">Tài xế Tâm</p>
        </div>
      </div>
      <div class="flex items-center gap-1">
        <div
          :class="[
            'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors',
            isOnline ? 'bg-success-500/15 text-success-400' : 'bg-error-500/15 text-error-400',
          ]"
        >
          <UIcon :name="isOnline ? 'i-lucide-wifi' : 'i-lucide-wifi-off'" class="w-3.5 h-3.5" />
          <span>{{ isOnline ? 'Online' : 'Offline' }}</span>
        </div>
        <button
          class="p-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
          @click="toggleDark"
        >
          <UIcon :name="colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'" class="w-5 h-5" />
        </button>
        <button
          class="text-slate-400 hover:text-white p-2.5 rounded-lg hover:bg-white/5 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
          @click="showMenu = !showMenu"
        >
          <UIcon :name="showMenu ? 'i-lucide-x' : 'i-lucide-menu'" class="w-5 h-5" />
        </button>
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
      <div v-if="showMenu" class="absolute top-[72px] left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-white/10 shadow-xl">
        <nav class="px-4 py-3 space-y-1" @click="closeMenu">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            :class="[
              'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors min-h-[48px]',
              route.path === item.to || (item.to !== '/driver/delivery' && route.path.startsWith(item.to))
                ? 'bg-primary-500/15 text-primary-400'
                : 'text-slate-300 hover:bg-white/5',
            ]"
          >
            <UIcon :name="item.icon" class="w-5 h-5" />
            {{ item.label }}
          </NuxtLink>
          <button
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-error-400 hover:bg-error-500/10 transition-colors w-full min-h-[48px]"
            @click="handleLogout"
          >
            <UIcon name="i-lucide-log-out" class="w-5 h-5" />
            Đăng xuất
          </button>
        </nav>
      </div>
    </Transition>

    <main class="flex-1 pb-20 relative">
      <slot />
    </main>

    <!-- Bottom nav -->
    <nav class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 z-40 safe-area-bottom">
      <div class="flex items-center justify-around px-2 py-2">
        <NuxtLink
          to="/driver/delivery"
          :class="[
            'flex flex-col items-center gap-1 px-3 py-2 rounded-lg min-w-[56px] min-h-[48px] justify-center transition-all duration-200 active:scale-90',
            route.path.startsWith('/driver/delivery') ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-zinc-500 hover:text-primary-400',
          ]"
        >
          <UIcon name="i-lucide-route" class="w-5 h-5" />
          <span class="text-[10px] font-medium">Tuyến giao</span>
        </NuxtLink>
        <NuxtLink
          to="/driver/history"
          :class="[
            'flex flex-col items-center gap-1 px-3 py-2 rounded-lg min-w-[56px] min-h-[48px] justify-center transition-all duration-200 active:scale-90',
            route.path.startsWith('/driver/history') ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-zinc-500 hover:text-primary-400',
          ]"
        >
          <UIcon name="i-lucide-history" class="w-5 h-5" />
          <span class="text-[10px] font-medium">Lịch sử</span>
        </NuxtLink>
        <NuxtLink
          to="/driver/notifications"
          :class="[
            'flex flex-col items-center gap-1 px-3 py-2 rounded-lg min-w-[56px] min-h-[48px] justify-center transition-all duration-200 active:scale-90 relative',
            route.path.startsWith('/driver/notifications') ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-zinc-500 hover:text-primary-400',
          ]"
        >
          <UIcon name="i-lucide-bell" class="w-5 h-5" />
          <span class="absolute top-1 right-2 w-2 h-2 rounded-full bg-error-500" />
          <span class="text-[10px] font-medium">Thông báo</span>
        </NuxtLink>
        <NuxtLink
          to="/driver/profile"
          :class="[
            'flex flex-col items-center gap-1 px-3 py-2 rounded-lg min-w-[56px] min-h-[48px] justify-center transition-all duration-200 active:scale-90',
            route.path.startsWith('/driver/profile') ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-zinc-500 hover:text-primary-400',
          ]"
        >
          <UIcon name="i-lucide-user" class="w-5 h-5" />
          <span class="text-[10px] font-medium">Hồ sơ</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>
