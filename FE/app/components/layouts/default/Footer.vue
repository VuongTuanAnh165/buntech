<script setup lang="ts">
</script>
<template>
  <footer class="bg-[#111827] text-neutral-400 mt-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-white font-bold text-base">B</div>
            <span class="text-xl font-bold text-white tracking-tight">BunTech</span>
          </div>
          <p class="text-sm">
            Hệ thống chuyển đổi số toàn diện cho xưởng bún gia đình
          </p>
          <div class="flex gap-4 pt-2">
            <UButton icon="i-simple-icons-facebook" color="neutral" variant="ghost" class="text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full" />
            <UButton icon="i-lucide-phone" color="neutral" variant="ghost" class="text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full" />
            <UButton icon="i-lucide-mail" color="neutral" variant="ghost" class="text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full" />
          </div>
        </div>
        <div>
          <h3 class="font-semibold text-white mb-4">Sản phẩm</h3>
          <ul class="space-y-2 text-sm">
            <li><NuxtLink to="/products" class="hover:text-white transition-colors">Sản phẩm</NuxtLink></li>
            <li><NuxtLink to="/quick-order" class="hover:text-white transition-colors">Đặt hàng nhanh</NuxtLink></li>
            <li><NuxtLink to="/gioi-thieu" class="hover:text-white transition-colors">Giới thiệu</NuxtLink></li>
          </ul>
        </div>
        <div>
          <h3 class="font-semibold text-white mb-4">Giới thiệu</h3>
          <ul class="space-y-2 text-sm">
            <li><NuxtLink to="/blog" class="hover:text-white transition-colors">Tin tức</NuxtLink></li>
            <li><NuxtLink to="/auth/driver/login" class="hover:text-white transition-colors">App Tài xế</NuxtLink></li>
            <li class="flex items-center gap-2 mt-4"><UIcon name="i-lucide-map-pin" class="w-4 h-4"/> 123 Nguyễn Trãi, Thanh Xuân, Hà Nội</li>
          </ul>
        </div>
      </div>
      <div class="mt-8 pt-8 border-t border-neutral-800 text-center text-sm">
        © 2026 BunTech. Hệ thống chuyển đổi số toàn diện cho xưởng bún gia đình
      </div>
    </div>
  </footer>
</template>
