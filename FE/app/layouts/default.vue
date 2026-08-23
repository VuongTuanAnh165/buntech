<script setup lang="ts">
import {
  Home,
  Package,
  FileText,
  ShoppingCart,
  User,
  LogOut,
  LayoutDashboard,
  Sun,
  Moon,
  ArrowUp,
  Facebook,
  Phone,
  Mail,
  MapPin
} from 'lucide-vue-next'
import { t } from '~/utils/i18n'
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
  { label: t('nav_home'), to: '/', icon: Home },
  { label: t('nav_products'), to: '/products', icon: Package },
  { label: t('nav_distribution'), to: '/distribution', icon: MapPin },
  { label: t('nav_news'), to: '/blog', icon: FileText },
  { label: t('nav_about'), to: '/about', icon: User }
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
  <div class="bg-surface-muted flex min-h-screen flex-col">
    <header
      class="border-surface-border/50 safe-area-top sticky top-0 z-40 border-b bg-white/90 backdrop-blur-lg transition-colors duration-300 dark:bg-zinc-950/90"
    >
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
          <NuxtLink to="/" class="flex items-center gap-2.5">
            <NuxtImg
              src="/images/logo.webp"
              class="h-14 flex-shrink-0 object-cover"
              loading="lazy"
            />
          </NuxtLink>

          <nav class="hidden items-center gap-0.5 md:flex" aria-label="Main navigation">
            <NuxtLink
              v-for="item in bottomNavItems"
              :key="item.to"
              :to="item.to"
              class="hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg px-3.5 py-2 text-sm font-medium text-gray-600 transition-all duration-200 dark:text-zinc-300"
              active-class="text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20"
              :aria-current="$route.path === item.to ? 'page' : undefined"
              >{{ item.label }}</NuxtLink
            >
          </nav>

          <div class="flex items-center gap-1.5">
            <UButton
              to="/quick-order"
              variant="ghost"
              color="neutral"
              class="text-surface-foreground hover:bg-surface-hover flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2.5 transition-colors"
              :aria-label="$t('aria_cart')"
            >
              <ShoppingCart class="h-5 w-5" aria-hidden="true" />
            </UButton>
            <UButton
              variant="ghost"
              color="neutral"
              class="text-surface-foreground hover:bg-surface-hover flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2.5 transition-colors"
              :aria-label="
                colorMode.value === 'dark' ? $t('aria_theme_light') : $t('aria_theme_dark')
              "
              @click="toggleDark"
            >
              <Sun v-if="colorMode.value === 'dark'" class="h-5 w-5" aria-hidden="true" />
              <Moon v-else class="h-5 w-5" aria-hidden="true" />
            </UButton>
            <template v-if="authStore.isAuthenticated">
              <NuxtLink
                v-if="authStore.role === 'CUSTOMER'"
                to="/portal"
                class="text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hidden min-h-[44px] items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 sm:inline-flex"
                >{{ $t('nav_my_orders') }}</NuxtLink
              >
              <NuxtLink
                v-else-if="authStore.role === 'ADMIN'"
                to="/admin"
                class="text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hidden min-h-[44px] items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 sm:inline-flex"
              >
                <LayoutDashboard class="h-4 w-4" aria-hidden="true" /> {{ $t('nav_dashboard') }}
              </NuxtLink>
              <div ref="userMenuRef" class="relative">
                <UButton
                  variant="ghost"
                  color="neutral"
                  class="hover:bg-surface-hover flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl p-1 transition-all duration-200"
                  aria-haspopup="menu"
                  :aria-expanded="userMenuOpen"
                  aria-controls="user-menu"
                  @click="
                    () => {
                      userMenuOpen = !userMenuOpen
                    }
                  "
                >
                  <UAvatar
                    :alt="authStore.user?.fullName"
                    :src="getImageUrl(authStore.user?.profile?.avatarUrl || undefined) || undefined"
                    size="sm"
                  />
                </UButton>
                <Transition name="dropdown">
                  <div
                    v-if="userMenuOpen"
                    id="user-menu"
                    role="menu"
                    class="bg-surface border-surface-border absolute top-full right-0 z-50 mt-2 w-56 rounded-xl border py-1.5 shadow-lg"
                  >
                    <div class="border-surface-border border-b px-4 py-2.5">
                      <p class="text-surface-foreground text-sm font-semibold">
                        {{ authStore.user?.fullName }}
                      </p>
                    </div>
                    <NuxtLink
                      v-if="authStore.role === 'CUSTOMER'"
                      to="/portal"
                      role="menuitem"
                      class="text-surface-foreground hover:bg-surface-hover flex min-h-[44px] items-center gap-2.5 px-4 py-2.5 text-sm transition-colors"
                      @click="userMenuOpen = false"
                    >
                      <User class="h-4 w-4 text-gray-400 dark:text-zinc-500" aria-hidden="true" />
                      {{ $t('nav_my_orders') }}
                    </NuxtLink>
                    <UButton
                      variant="ghost"
                      color="neutral"
                      role="menuitem"
                      class="text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 flex min-h-[44px] w-full items-center gap-2.5 px-4 py-2.5 text-sm transition-colors"
                      @click="handleLogout"
                    >
                      <LogOut class="h-4 w-4" aria-hidden="true" /> {{ $t('logout') }}
                    </UButton>
                  </div>
                </Transition>
              </div>
            </template>
            <template v-else>
              <NuxtLink
                to="/auth/customer/login"
                class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 flex min-h-[44px] items-center rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all duration-200"
              >
                {{ $t('login') }}
              </NuxtLink>
            </template>
          </div>
        </div>
      </div>
    </header>

    <main class="flex-1 pb-20 md:pb-0">
      <slot />
    </main>

    <footer class="mt-16 bg-slate-900 text-slate-400">
      <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div class="md:col-span-2">
            <div class="mb-4 flex items-center gap-2.5">
              <NuxtImg
                src="/images/logo.webp"
                class="h-14 flex-shrink-0 object-cover"
                loading="lazy"
              />
            </div>
            <p class="mb-4 max-w-md text-sm leading-relaxed">{{ $t('app_tagline') }}</p>
            <div class="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener"
                class="hover:bg-primary-600 flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-slate-400 transition-all duration-200 hover:scale-105 hover:text-white"
                aria-label="Facebook"
              >
                <Facebook class="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                :href="`tel:${$config.public.contactPhone}`"
                class="hover:bg-primary-600 flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-slate-400 transition-all duration-200 hover:scale-105 hover:text-white"
                :aria-label="$t('aria_phone')"
              >
                <Phone class="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                :href="`mailto:${$config.public.contactEmail}`"
                class="hover:bg-primary-600 flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-slate-400 transition-all duration-200 hover:scale-105 hover:text-white"
                aria-label="Email"
              >
                <Mail class="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
          <div>
            <h4 class="mb-3 text-sm font-semibold text-white">{{ $t('nav_products') }}</h4>
            <ul class="space-y-2 text-sm">
              <li>
                <NuxtLink to="/products" class="transition-colors hover:text-white">{{
                  $t('nav_products')
                }}</NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/distribution"
                  class="hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors"
                >
                  {{ $t('nav_distribution') }}
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/about" class="transition-colors hover:text-white">{{
                  $t('nav_about')
                }}</NuxtLink>
              </li>
            </ul>
          </div>
          <div>
            <h4 class="mb-3 text-sm font-semibold text-white">{{ $t('nav_about') }}</h4>
            <ul class="space-y-2 text-sm">
              <li>
                <NuxtLink to="/blog" class="transition-colors hover:text-white">{{
                  $t('nav_news')
                }}</NuxtLink>
              </li>
              <li>
                <NuxtLink to="/auth/driver/login" class="transition-colors hover:text-white">{{
                  $t('nav_driver_app')
                }}</NuxtLink>
              </li>
            </ul>
            <div class="mt-4 flex items-start gap-3">
              <MapPin class="text-primary-600 dark:text-primary-400 mt-0.5 h-5 w-5 shrink-0" />
              <span>{{ $t('footer_address') }}</span>
            </div>
          </div>
        </div>
        <div class="mt-8 border-t border-white/10 pt-8 text-center text-sm text-slate-500">
          &copy; {{ new Date().getFullYear() }} {{ $t('app_name') }}. {{ $t('app_tagline') }}
        </div>
      </div>
    </footer>

    <!-- Scroll to top -->
    <Transition name="scroll-top">
      <UButton
        v-if="showScrollTop"
        variant="soft"
        :aria-label="$t('aria_back_to_top')"
        class="shadow-primary-500/20 hover:bg-primary-600 fixed right-6 bottom-24 z-50 rounded-full p-3 shadow-lg transition-all duration-300 md:bottom-6"
        :class="[showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0']"
        @click="scrollToTop"
      >
        <ArrowUp class="h-5 w-5" aria-hidden="true" />
      </UButton>
    </Transition>

    <!-- Bottom Navigation (mobile only) -->
    <nav
      class="glass border-surface-border/50 safe-area-bottom fixed right-0 bottom-0 left-0 z-50 border-t md:hidden"
      aria-label="Bottom navigation"
    >
      <div class="flex items-stretch justify-around px-2 py-1.5">
        <NuxtLink
          v-for="item in bottomNavItems"
          :key="item.to"
          :to="item.to"
          class="flex min-h-[52px] min-w-[52px] flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-1.5 transition-colors duration-200"
          active-class="text-primary-600 dark:text-primary-400"
          :aria-current="$route.path === item.to ? 'page' : undefined"
        >
          <component :is="item.icon" class="h-5 w-5" aria-hidden="true" />
          <span class="text-center text-[10px] leading-tight font-medium">{{ item.label }}</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>
