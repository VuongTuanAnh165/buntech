<template>
  <footer class="hidden md:block bg-gray-950 border-t border-white/5 safe-area-bottom">
    <div
      class="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-6 px-6 py-7 md:flex-row md:px-12 lg:px-16"
    >
      <p class="text-gray-400 text-sm font-medium order-2 md:order-1 text-center md:text-left">
        © 2026 BúnTech. All rights reserved.
      </p>

      <nav
        class="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-sm font-semibold text-white order-1 md:order-2"
      >
        <NuxtLink to="/" class="hover:text-primary-400 transition-colors">Trang chủ</NuxtLink>
        <NuxtLink to="/gioi-thieu" class="hover:text-primary-400 transition-colors">Giới thiệu</NuxtLink>
        <NuxtLink to="/don-vi-ban-buon" class="hover:text-primary-400 transition-colors">Đơn vị</NuxtLink>
        <NuxtLink to="/san-pham" class="hover:text-primary-400 transition-colors">Sản phẩm</NuxtLink>
        <NuxtLink to="/tin-tuc" class="hover:text-primary-400 transition-colors">Tin tức</NuxtLink>
      </nav>
    </div>
  </footer>
</template>
