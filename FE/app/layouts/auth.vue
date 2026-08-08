<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="min-h-screen flex">
    <!-- Left: Brand Panel -->
    <div class="hidden lg:flex lg:w-[52%] relative overflow-hidden bg-slate-900">
      <!-- Background image -->
      <div
        class="absolute inset-0 opacity-30 transition-opacity duration-700"
        style="background-image: url('https://images.pexels.com/photos/6711678/pexels-photo-6711678.jpeg?auto=compress&cs=tinysrgb&w=1200'); background-size: cover; background-position: center;"
        aria-hidden="true"
      />
      <!-- Gradient overlay -->
      <div class="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/90 to-primary-950/80" aria-hidden="true" />
      <!-- Decorative blobs -->
      <div class="absolute top-1/4 -left-20 w-72 h-72 rounded-full bg-primary-500/15 blur-3xl animate-pulse-soft" aria-hidden="true" />
      <div class="absolute bottom-1/4 -right-10 w-80 h-80 rounded-full bg-accent-400/10 blur-3xl" aria-hidden="true" />
      <!-- Grid pattern overlay -->
      <div class="absolute inset-0 opacity-[0.03]" style="background-image: linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px); background-size: 40px 40px;" aria-hidden="true" />

      <!-- Content -->
      <div class="relative z-10 flex flex-col justify-between p-12 xl:p-16 text-white w-full">
        <NuxtLink to="/" class="flex items-center gap-3 group w-fit">
          <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-primary-600/25 transition-transform group-hover:scale-105">B</div>
          <span class="text-xl font-bold tracking-tight">BunTech</span>
        </NuxtLink>

        <div class="max-w-md">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium mb-6 animate-fade-in border border-white/10">
            <span class="w-2 h-2 rounded-full bg-success-400 animate-pulse" aria-hidden="true" />
            {{ t('app.tagline') }}
          </div>
          <h1 class="text-4xl xl:text-5xl font-bold mb-5 tracking-tight leading-[1.1] animate-fade-in-up">
            {{ t('auth.heroTitle') || 'Hệ thống quản lý xưởng bún' }}
          </h1>
          <p class="text-lg text-slate-300 leading-relaxed max-w-sm animate-fade-in-up" style="animation-delay: 100ms">
            {{ t('auth.heroSubtitle') || 'Chuyển đổi số toàn diện cho xưởng bún gia đình — từ đặt hàng, giao nhận đến công nợ.' }}
          </p>

          <!-- Feature highlights -->
          <div class="grid grid-cols-3 gap-4 mt-10 animate-fade-in-up" style="animation-delay: 200ms">
            <div class="text-center">
              <div class="text-2xl font-bold text-primary-400">24/7</div>
              <div class="text-xs text-slate-400 mt-1">{{ t('auth.featureOnline') || 'Online' }}</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-accent-400">100%</div>
              <div class="text-xs text-slate-400 mt-1">{{ t('auth.featureAutomated') || 'Tự động' }}</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-success-400">SSE</div>
              <div class="text-xs text-slate-400 mt-1">{{ t('auth.featureRealtime') || 'Realtime' }}</div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between text-sm text-slate-400">
          <span>&copy; {{ new Date().getFullYear() }} BunTech</span>
          <div class="flex items-center gap-4">
            <NuxtLink to="/" class="hover:text-white transition-colors">{{ t('nav.home') }}</NuxtLink>
            <NuxtLink to="/about" class="hover:text-white transition-colors">{{ t('nav.about') }}</NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Right: Form Panel -->
    <div class="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-surface-muted">
      <div class="w-full max-w-sm animate-fade-in-up">
        <!-- Mobile logo -->
        <div class="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
          <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-primary-600/20">B</div>
          <span class="text-xl font-bold text-surface-foreground tracking-tight">BunTech</span>
        </div>
        <slot />
      </div>
    </div>
  </div>
</template>
