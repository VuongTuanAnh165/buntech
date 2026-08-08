<script setup lang="ts">
import { Home, Package, FileText, ShoppingCart, User, LogOut, LayoutDashboard, Sun, Moon, ArrowUp, Facebook, Phone, Mail, MapPin } from 'lucide-vue-next'
const { t } = useI18n()
const authStore = useAuthStore()
const userMenuOpen = ref(false)
const userMenuRef = ref<HTMLElement | null>(null)
const showScrollTop = ref(false)

const colorMode = useColorMode()
const toggleDark = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const onScroll = () => {
  showScrollTop.value = window.scrollY > 400
}
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleLogout = () => {
  authStore.logout()
  navigateTo('/')
}

const bottomNavItems = computed(() => [
  { label: t('nav.home'), to: '/', icon: Home },
  { label: t('nav.products'), to: '/products', icon: Package },
  { label: t('customer.quickOrder'), to: '/quick-order', icon: ShoppingCart },
  { label: t('nav.news'), to: '/blog', icon: FileText },
  { label: t('nav.about'), to: '/about', icon: User },
])

const onOutsideClick = (e: MouseEvent) => {
  if (userMenuRef.value && !userMenuRef.value.contains(e.target as Node)) {
    userMenuOpen.value = false
  }
}
const onEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape') userMenuOpen.value = false
}

onMounted(() => {
  document.addEventListener('mousedown', onOutsideClick)
  document.addEventListener('keydown', onEscape)
  window.addEventListener('scroll', onScroll, { passive: true })
})
onUnmounted(() => {
  document.removeEventListener('mousedown', onOutsideClick)
  document.removeEventListener('keydown', onEscape)
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-surface-muted">
    <header class="sticky top-0 z-40 glass border-b border-surface-border/50 safe-area-top">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <NuxtLink to="/" class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold shadow-sm shadow-primary-600/20">B</div>
            <span class="text-lg font-bold text-surface-foreground tracking-tight">BunTech</span>
          </NuxtLink>

          <nav class="hidden md:flex items-center gap-0.5" aria-label="Main navigation">
            <NuxtLink
              v-for="item in bottomNavItems"
              :key="item.to"
              :to="item.to"
              class="px-3.5 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-zinc-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200"
              active-class="text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20"
              :aria-current="$route.path === item.to ? 'page' : undefined"
            >{{ item.label }}</NuxtLink>
          </nav>

          <div class="flex items-center gap-1.5">
            <UButton variant="ghost" color="neutral"
              class="p-2.5 text-surface-foreground hover:bg-surface-hover rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              :aria-label="colorMode.value === 'dark' ? 'Bật chế độ sáng' : 'Bật chế độ tối'"
              @click="toggleDark"
            >
              <Sun v-if="colorMode.value === 'dark'" class="w-5 h-5" aria-hidden="true" />
              <Moon v-else class="w-5 h-5" aria-hidden="true" />
            </UButton>
            <template v-if="authStore.isAuthenticated">
              <NuxtLink
                v-if="authStore.role === 'CUSTOMER'"
                to="/portal"
                class="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 min-h-[44px]"
              >{{ t('nav.myOrders') }}</NuxtLink>
              <NuxtLink
                v-else-if="authStore.role === 'ADMIN'"
                to="/admin"
                class="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 min-h-[44px]"
              >
                <LayoutDashboard class="w-4 h-4" aria-hidden="true" /> {{ t('nav.dashboard') }}
              </NuxtLink>
              <div ref="userMenuRef" class="relative">
                <UButton variant="ghost" color="neutral"
                  class="flex items-center p-1 rounded-xl hover:bg-surface-hover transition-all duration-200 min-w-[44px] min-h-[44px] justify-center"
                  aria-haspopup="menu"
                  :aria-expanded="userMenuOpen"
                  aria-controls="user-menu"
                  @click="userMenuOpen = !userMenuOpen"
                >
                  <AppAvatar :name="authStore.user?.full_name" :src="authStore.user?.avatar_url" size="sm" />
                </UButton>
                <Transition name="dropdown">
                  <div
                    v-if="userMenuOpen"
                    id="user-menu"
                    role="menu"
                    class="absolute right-0 top-full mt-2 w-56 bg-surface rounded-xl shadow-lg border border-surface-border py-1.5 z-50"
                  >
                    <div class="px-4 py-2.5 border-b border-surface-border">
                      <p class="text-sm font-semibold text-surface-foreground">{{ authStore.user?.full_name }}</p>
                    </div>
                    <NuxtLink v-if="authStore.role === 'CUSTOMER'" to="/portal" role="menuitem" class="flex items-center gap-2.5 px-4 py-2.5 text-sm text-surface-foreground hover:bg-surface-hover transition-colors min-h-[44px]" @click="userMenuOpen = false">
                      <User class="w-4 h-4 text-gray-400 dark:text-zinc-500" aria-hidden="true" /> {{ t('nav.myOrders') }}
                    </NuxtLink>
                    <UButton variant="ghost" color="neutral" role="menuitem" class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors min-h-[44px]" @click="handleLogout">
                      <LogOut class="w-4 h-4" aria-hidden="true" /> {{ t('nav.logout') }}
                    </UButton>
                  </div>
                </Transition>
              </div>
            </template>
            <template v-else>
              <NuxtLink to="/auth/customer/login" class="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 px-3.5 py-2.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 min-h-[44px] flex items-center">
                {{ t('customer.customerLogin') }}
              </NuxtLink>
            </template>
          </div>
        </div>
      </div>
    </header>

    <main class="flex-1 pb-20 md:pb-0">
      <slot />
    </main>

    <footer class="bg-slate-900 text-slate-400 mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div class="md:col-span-2">
            <div class="flex items-center gap-2.5 mb-4">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold">B</div>
              <span class="text-lg font-bold text-white tracking-tight">BunTech</span>
            </div>
            <p class="text-sm max-w-md leading-relaxed mb-4">{{ t('app.tagline') }}</p>
            <div class="flex items-center gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener" class="w-9 h-9 rounded-lg bg-white/5 hover:bg-primary-600 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200 hover:scale-105" aria-label="Facebook">
                <Facebook class="w-4 h-4" aria-hidden="true" />
              </a>
              <a href="tel:+84901234567" class="w-9 h-9 rounded-lg bg-white/5 hover:bg-primary-600 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200 hover:scale-105" aria-label="Điện thoại">
                <Phone class="w-4 h-4" aria-hidden="true" />
              </a>
              <a href="mailto:support@buntech.vn" class="w-9 h-9 rounded-lg bg-white/5 hover:bg-primary-600 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200 hover:scale-105" aria-label="Email">
                <Mail class="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </div>
          <div>
            <h4 class="text-white font-semibold mb-3 text-sm">{{ t('nav.products') }}</h4>
            <ul class="space-y-2 text-sm">
              <li><NuxtLink to="/products" class="hover:text-white transition-colors">{{ t('nav.products') }}</NuxtLink></li>
              <li><NuxtLink to="/quick-order" class="hover:text-white transition-colors">{{ t('customer.quickOrder') }}</NuxtLink></li>
              <li><NuxtLink to="/about" class="hover:text-white transition-colors">{{ t('nav.about') }}</NuxtLink></li>
            </ul>
          </div>
          <div>
            <h4 class="text-white font-semibold mb-3 text-sm">{{ t('nav.about') }}</h4>
            <ul class="space-y-2 text-sm">
              <li><NuxtLink to="/blog" class="hover:text-white transition-colors">{{ t('nav.news') }}</NuxtLink></li>
              <li><NuxtLink to="/auth/driver/login" class="hover:text-white transition-colors">{{ t('nav.driverApp') }}</NuxtLink></li>
            </ul>
            <div class="mt-4 flex items-start gap-2 text-xs text-slate-500">
              <MapPin class="w-3.5 h-3.5 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span>123 Nguyễn Trãi, Thanh Xuân, Hà Nội</span>
            </div>
          </div>
        </div>
        <div class="mt-8 pt-8 border-t border-white/10 text-sm text-center text-slate-500">
          &copy; {{ new Date().getFullYear() }} BunTech. {{ t('app.tagline') }}
        </div>
      </div>
    </footer>

    <!-- Scroll to top -->
    <Transition name="scroll-top">
      <UButton variant="ghost" color="neutral"
        v-if="showScrollTop"
        type="button"
        class="fixed bottom-20 md:bottom-6 right-4 z-40 w-11 h-11 rounded-full bg-primary-600 text-white shadow-lg shadow-primary-600/30 flex items-center justify-center hover:bg-primary-700 active:scale-90 transition-all duration-200"
        aria-label="Lên đầu trang"
        @click="scrollToTop"
      >
        <ArrowUp class="w-5 h-5" aria-hidden="true" />
      </UButton>
    </Transition>

    <!-- Bottom Navigation (mobile only) -->
    <nav class="fixed bottom-0 left-0 right-0 z-50 glass border-t border-surface-border/50 md:hidden safe-area-bottom" aria-label="Bottom navigation">
      <div class="flex items-stretch justify-around px-2 py-1.5">
        <NuxtLink
          v-for="item in bottomNavItems"
          :key="item.to"
          :to="item.to"
          class="flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-lg min-w-[52px] min-h-[52px] transition-colors duration-200"
          active-class="text-primary-600 dark:text-primary-400"
          :aria-current="$route.path === item.to ? 'page' : undefined"
        >
          <component :is="item.icon" class="w-5 h-5" aria-hidden="true" />
          <span class="text-[10px] font-medium leading-tight text-center">{{ item.label }}</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>
