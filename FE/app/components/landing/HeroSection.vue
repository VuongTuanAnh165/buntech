<script setup lang="ts">
const heroImage = '/images/banner_1.webp'
</script>

<template>
  <section class="relative flex min-h-[640px] items-center overflow-hidden">
    <div class="absolute inset-0">
      <NuxtImg :src="heroImage" alt="" class="h-full w-full object-cover" aria-hidden="true" />
      <div
        class="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/75 to-slate-900/40"
      />
    </div>
    <div class="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
      <div class="max-w-2xl">
        <div
          class="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white/90 backdrop-blur-md"
        >
          <UIcon name="i-lucide-sparkles" class="h-4 w-4" aria-hidden="true" />
          Xưởng bún truyền thống từ năm 1960
        </div>
        <h1
          class="animate-fade-in-up mb-6 text-4xl leading-[1.1] font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
          style="letter-spacing: -0.02em"
        >
          Bún tươi thủ công BunTech<br class="hidden sm:block" />
          — Truyền 3 đời
        </h1>
        <p
          class="animate-fade-in-up mb-8 max-w-xl text-lg leading-relaxed text-slate-200 sm:text-xl"
          style="animation-delay: 100ms"
        >
          Bún tươi 100% gạo nguyên chất, không chất bảo quản.<br />sản xuất mỗi sáng theo bí truyền
          gia đình. Giao hàng tận nơi trong 2 giờ, đặt hàng dễ dàng qua app.
        </p>
        <div
          class="animate-fade-in-up flex flex-col gap-3 sm:flex-row"
          style="animation-delay: 200ms"
        >
          <NuxtLink to="/quick-order" class="block">
            <UButton color="primary" variant="solid" size="lg" class="group w-full sm:w-auto">
              Đặt hàng nhanh
              <UIcon
                name="i-lucide-arrow-right"
                class="h-5 w-5 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </UButton>
          </NuxtLink>
          <NuxtLink to="/products" class="block">
            <UButton
              color="neutral"
              variant="outline"
              size="lg"
              class="w-full !border-white/30 !bg-white/10 !text-white hover:!bg-white/20 sm:w-auto"
            >
              Xem sản phẩm
            </UButton>
          </NuxtLink>
        </div>
        <!-- Stats bar -->
        <div
          class="animate-fade-in-up mt-12 grid grid-cols-3 gap-6 border-t border-white/10 pt-8"
          style="animation-delay: 300ms"
        >
          <div>
            <div class="text-2xl font-bold text-white sm:text-3xl">1000+ kg</div>
            <div class="mt-0.5 text-sm text-slate-400">Sản xuất mỗi ngày</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-white sm:text-3xl">60+ năm</div>
            <div class="mt-0.5 text-sm text-slate-400">Kinh nghiệm</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-white sm:text-3xl">50+</div>
            <div class="mt-0.5 text-sm text-slate-400">Đại lý phục vụ</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
