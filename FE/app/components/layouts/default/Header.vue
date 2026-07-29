<script setup lang="ts">
import { computed } from 'vue'
import { AuthService } from '~/services/authService'

const isPromoVisible = ref(true)

const hidePromo = () => {
  isPromoVisible.value = false
}

const menuItems = [
  {
    label: 'Trang chủ',
    to: '/',
    icon: 'i-lucide-house'
  },
  {
    label: 'Giới thiệu',
    to: '/gioi-thieu',
    icon: 'i-lucide-users'
  },
  {
    label: 'Đơn vị bán buôn',
    to: '/don-vi-ban-buon',
    icon: 'i-lucide-building'
  },
  {
    label: 'Sản phẩm',
    to: '/san-pham',
    icon: 'i-lucide-package'
  },
  {
    label: 'Tin tức',
    to: '/tin-tuc',
    icon: 'i-lucide-newspaper'
  }
]

const token = useCookie('auth_token')
const { data: currentUserData } = useAsyncData('current-user', () => AuthService.getCurrentUser(), {
  immediate: !!token.value,
  watch: [token]
})
const currentUser = computed(() => currentUserData.value?.data)

const route = useRoute()

const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }

  return route.path.startsWith(path)
}
</script>

<template>
  <!-- Desktop & Mobile Top Header -->
  <header
    class="safe-area-top border-muted bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur-md"
  >
    <!-- Top Promo Toast -->
    <div
      v-if="isPromoVisible"
      class="bg-primary hidden px-4 py-2 text-center text-sm font-medium text-white sm:block"
    >
      <div class="flex items-center justify-between">
        <span class="flex-1 text-center"
          >Khuyến mãi đặc biệt: Đừng bỏ lỡ giá tốt nhất hôm nay!</span
        >
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-x"
          size="xs"
          class="-my-1"
          aria-label="Đóng"
          @click="hidePromo"
        />
      </div>
    </div>

    <!-- Main Header -->
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between gap-4 md:h-20 md:gap-8">
        <!-- Logo -->
        <div class="flex shrink-0 items-center">
          <NuxtLink to="/" aria-label="Trang chủ">
            <NuxtImg src="/images/logo.webp" alt="BúnTech Logo" class="h-8 w-auto md:h-10" />
          </NuxtLink>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden flex-1 md:flex md:justify-center">
          <UNavigationMenu :items="menuItems" class="justify-center" />
        </div>

        <!-- Right Actions (Desktop) -->
        <div class="hidden items-center gap-4 md:flex">
          <UButton v-if="!currentUser" variant="outline" color="neutral" to="/login"
            >Đăng nhập</UButton
          >
          <NuxtLink v-else to="/profile" class="flex items-center">
            <UAvatar
              :src="currentUser.profile?.avatarUrl || undefined"
              icon="i-lucide-user"
              alt="Avatar"
              size="sm"
            />
          </NuxtLink>
          <UButton>Đặt hàng ngay</UButton>
        </div>

        <!-- Right Actions (Mobile: Cart & Profile only) -->
        <div class="flex items-center gap-2 md:hidden">
          <UButton
            icon="i-lucide-shopping-cart"
            color="neutral"
            variant="ghost"
            aria-label="Mua ngay"
          />
          <NuxtLink v-if="currentUser" to="/profile" class="ml-2 flex items-center">
            <UAvatar
              :src="currentUser.profile?.avatarUrl || undefined"
              icon="i-lucide-user"
              alt="Avatar"
              size="sm"
            />
          </NuxtLink>
          <NuxtLink v-else to="/login" class="ml-2 flex items-center">
            <UAvatar icon="i-lucide-user" alt="Default Avatar" size="sm" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </header>

  <!-- Mobile Bottom Navigation -->
  <nav class="bg-primary fixed inset-x-0 bottom-0 z-50 md:hidden">
    <div
      class="flex h-[60px] items-center justify-evenly px-3 pb-[max(env(safe-area-inset-bottom))]"
    >
      <NuxtLink
        v-for="item in menuItems"
        :key="item.to"
        :to="item.to"
        class="flex h-14 w-14 items-center justify-center rounded-full transition-all duration-200 ease-out active:scale-90"
        :class="[isActive(item.to) ? 'text-white' : 'text-white/60 hover:text-white/90']"
        :aria-label="item.label"
      >
        <UIcon
          :name="item.icon"
          class="h-6 w-6 transition-all duration-200 ease-out"
          :class="[isActive(item.to) ? 'scale-110' : 'scale-100']"
        />
      </NuxtLink>
    </div>
  </nav>
</template>
