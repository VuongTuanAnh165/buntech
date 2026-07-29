<template>
  <footer
    class="safe-area-bottom bg-primary hidden h-[60px] items-center border-t border-white/5 md:flex"
  >
    <div
      class="mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-6 px-6 p-2 md:flex-row md:px-12 lg:px-16"
    >
      <nav
        class="order-1 flex flex-wrap items-center justify-center gap-6 text-sm font-semibold text-white md:order-2 md:gap-10"
      >
        <NuxtLink to="/" class="hover:text-primary-400 transition-colors">Trang chủ</NuxtLink>
        <NuxtLink to="/gioi-thieu" class="hover:text-primary-400 transition-colors"
          >Giới thiệu</NuxtLink
        >
        <NuxtLink to="/don-vi-ban-buon" class="hover:text-primary-400 transition-colors"
          >Đơn vị</NuxtLink
        >
        <NuxtLink to="/san-pham" class="hover:text-primary-400 transition-colors"
          >Sản phẩm</NuxtLink
        >
        <NuxtLink to="/tin-tuc" class="hover:text-primary-400 transition-colors">Tin tức</NuxtLink>
      </nav>
    </div>
  </footer>
</template>
