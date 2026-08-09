<script setup lang="ts"></script>
<template>
  <footer class="mt-auto bg-[#111827] text-neutral-400">
    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 gap-8 md:grid-cols-4">
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <div
              class="bg-primary-500 flex h-8 w-8 items-center justify-center rounded-lg text-base font-bold text-white"
            >
              B
            </div>
            <span class="text-xl font-bold tracking-tight text-white">BunTech</span>
          </div>
          <p class="text-sm">Hệ thống chuyển đổi số toàn diện cho xưởng bún gia đình</p>
          <div class="flex gap-4 pt-2">
            <UButton
              icon="i-simple-icons-facebook"
              color="neutral"
              variant="ghost"
              class="rounded-full bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white"
            />
            <UButton
              icon="i-lucide-phone"
              color="neutral"
              variant="ghost"
              class="rounded-full bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white"
            />
            <UButton
              icon="i-lucide-mail"
              color="neutral"
              variant="ghost"
              class="rounded-full bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white"
            />
          </div>
        </div>
        <div>
          <h3 class="mb-4 font-semibold text-white">Sản phẩm</h3>
          <ul class="space-y-2 text-sm">
            <li>
              <NuxtLink to="/products" class="transition-colors hover:text-white"
                >Sản phẩm</NuxtLink
              >
            </li>
            <li>
              <NuxtLink to="/quick-order" class="transition-colors hover:text-white"
                >Đặt hàng nhanh</NuxtLink
              >
            </li>
            <li>
              <NuxtLink to="/gioi-thieu" class="transition-colors hover:text-white"
                >Giới thiệu</NuxtLink
              >
            </li>
          </ul>
        </div>
        <div>
          <h3 class="mb-4 font-semibold text-white">Giới thiệu</h3>
          <ul class="space-y-2 text-sm">
            <li>
              <NuxtLink to="/blog" class="transition-colors hover:text-white">Tin tức</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/auth/driver/login" class="transition-colors hover:text-white"
                >App Tài xế</NuxtLink
              >
            </li>
            <li class="mt-4 flex items-center gap-2">
              <UIcon name="i-lucide-map-pin" class="h-4 w-4" /> 123 Nguyễn Trãi, Thanh Xuân, Hà Nội
            </li>
          </ul>
        </div>
      </div>
      <div class="mt-8 border-t border-neutral-800 pt-8 text-center text-sm">
        © 2026 BunTech. Hệ thống chuyển đổi số toàn diện cho xưởng bún gia đình
      </div>
    </div>
  </footer>
</template>
