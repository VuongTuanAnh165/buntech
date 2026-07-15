<script setup lang="ts">
const isMobileMenuOpen = ref(false)
const isPromoVisible = ref(true)

const openMenu = () => {
  isMobileMenuOpen.value = true
}

const hidePromo = () => {
  isPromoVisible.value = false
}

const menuItems = [
  {
    label: 'Trang chủ',
    to: '/'
  },
  {
    label: 'Giới thiệu',
    to: '/gioi-thieu'
  },
  {
    label: 'Đơn vị bán buôn',
    to: '/don-vi-ban-buon'
  },
  {
    label: 'Sản phẩm',
    to: '/san-pham'
  },
  {
    label: 'Tin tức',
    to: '/tin-tuc'
  }
]
</script>

<template>
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
      <div class="flex h-20 items-center justify-between gap-8">
        <!-- Logo -->
        <div class="flex shrink-0 items-center">
          <NuxtLink to="/" aria-label="Trang chủ">
            <NuxtImg src="/images/logo.webp" alt="BúnTech Logo" class="h-10 w-auto" />
          </NuxtLink>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden flex-1 lg:flex lg:justify-center">
          <UNavigationMenu :items="menuItems" class="justify-center" />
        </div>

        <!-- Right Actions -->
        <div class="flex items-center gap-4">
          <div class="hidden sm:block">
            <UButton variant="outline" color="neutral">Đăng nhập</UButton>
          </div>
          <UButton>Đặt hàng ngay</UButton>

          <!-- Mobile Menu Toggle -->
          <div class="lg:hidden">
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-menu"
              aria-label="Mở menu"
              @click="openMenu"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Menu Slideover -->
    <USlideover v-model:open="isMobileMenuOpen" title="Menu">
      <template #body>
        <div class="flex flex-col gap-6 p-4">
          <UNavigationMenu :items="menuItems" orientation="vertical" />
          <div class="flex flex-col gap-2">
            <UButton variant="outline" color="neutral" block>Đăng nhập</UButton>
            <UButton block>Đặt hàng ngay</UButton>
          </div>
        </div>
      </template>
    </USlideover>
  </header>
</template>
