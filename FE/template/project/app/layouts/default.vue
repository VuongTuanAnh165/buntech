<script setup lang="ts">
const { t } = useI18n()
const authStore = useAuthStore()
const mobileMenuOpen = ref(false)
const navItems = computed(() => [
  { label: t('nav.home'), to: '/' },
  { label: t('nav.products'), to: '/products' },
  { label: t('nav.news'), to: '/blog' },
  { label: t('customer.quickOrder'), to: '/quick-order' },
])
function handleLogout() {
  authStore.logout()
  navigateTo('/')
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <NuxtLink to="/" class="flex items-center gap-2">
            <div class="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold">B</div>
            <span class="text-lg font-bold text-gray-900">BunTech</span>
          </NuxtLink>
          <nav class="hidden md:flex items-center gap-1">
            <NuxtLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors"
              active-class="text-primary-600 bg-primary-50"
            >
              {{ item.label }}
            </NuxtLink>
          </nav>
          <div class="flex items-center gap-3">
            <template v-if="authStore.isAuthenticated">
              <NuxtLink
                v-if="authStore.role === 'CUSTOMER'"
                to="/portal"
                class="hidden sm:inline-flex px-3 py-2 rounded-lg text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors"
              >{{ t('nav.myOrders') }}</NuxtLink>
              <NuxtLink
                v-else-if="authStore.role === 'ADMIN'"
                to="/admin"
                class="hidden sm:inline-flex px-3 py-2 rounded-lg text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors"
              >{{ t('nav.dashboard') }}</NuxtLink>
              <button class="text-sm text-gray-500 hover:text-gray-700" @click="handleLogout">{{ t('nav.logout') }}</button>
            </template>
            <template v-else>
              <NuxtLink to="/auth/customer/login" class="text-sm font-medium text-primary-600 hover:text-primary-700">{{ t('customer.customerLogin') }}</NuxtLink>
            </template>
            <button class="md:hidden" @click="mobileMenuOpen = !mobileMenuOpen">
              <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </div>
      </div>
      <Transition name="slide-down">
        <nav v-if="mobileMenuOpen" class="md:hidden border-t border-gray-100 px-4 py-3 space-y-1">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="block px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-primary-50"
            @click="mobileMenuOpen = false"
          >{{ item.label }}</NuxtLink>
        </nav>
      </Transition>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="bg-gray-900 text-gray-400 mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div class="md:col-span-2">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold">B</div>
              <span class="text-lg font-bold text-white">BunTech</span>
            </div>
            <p class="text-sm max-w-md">{{ t('app.tagline') }}</p>
          </div>
          <div>
            <h4 class="text-white font-semibold mb-3 text-sm">{{ t('nav.products') }}</h4>
            <ul class="space-y-2 text-sm">
              <li><NuxtLink to="/products" class="hover:text-white transition-colors">{{ t('nav.products') }}</NuxtLink></li>
              <li><NuxtLink to="/quick-order" class="hover:text-white transition-colors">{{ t('customer.quickOrder') }}</NuxtLink></li>
            </ul>
          </div>
          <div>
            <h4 class="text-white font-semibold mb-3 text-sm">{{ t('nav.about') }}</h4>
            <ul class="space-y-2 text-sm">
              <li><NuxtLink to="/blog" class="hover:text-white transition-colors">{{ t('nav.news') }}</NuxtLink></li>
              <li><NuxtLink to="/auth/driver/login" class="hover:text-white transition-colors">{{ t('nav.driverApp') }}</NuxtLink></li>
            </ul>
          </div>
        </div>
        <div class="mt-8 pt-8 border-t border-gray-800 text-sm text-center">
          &copy; {{ new Date().getFullYear() }} BunTech. {{ t('app.name') }}
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.2s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-10px); }
</style>
