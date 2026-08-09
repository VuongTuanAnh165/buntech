<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="flex min-h-screen">
    <!-- Left: Brand Panel -->
    <div class="relative hidden overflow-hidden bg-slate-900 lg:flex lg:w-[52%]">
      <!-- Background image -->
      <div
        class="absolute inset-0 opacity-30 transition-opacity duration-700"
        style="
          background-image: url('https://images.pexels.com/photos/6711678/pexels-photo-6711678.jpeg?auto=compress&cs=tinysrgb&w=1200');
          background-size: cover;
          background-position: center;
        "
        aria-hidden="true"
      />
      <!-- Gradient overlay -->
      <div
        class="to-primary-950/80 absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/90"
        aria-hidden="true"
      />
      <!-- Decorative blobs -->
      <div
        class="bg-primary-500/15 animate-pulse-soft absolute top-1/4 -left-20 h-72 w-72 rounded-full blur-3xl"
        aria-hidden="true"
      />
      <div
        class="bg-accent-400/10 absolute -right-10 bottom-1/4 h-80 w-80 rounded-full blur-3xl"
        aria-hidden="true"
      />
      <!-- Grid pattern overlay -->
      <div
        class="absolute inset-0 opacity-[0.03]"
        style="
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1px, transparent 1px);
          background-size: 40px 40px;
        "
        aria-hidden="true"
      />

      <!-- Content -->
      <div class="relative z-10 flex w-full flex-col justify-between p-12 text-white xl:p-16">
        <NuxtLink to="/" class="group flex w-fit items-center gap-3">
          <div
            class="from-primary-500 to-primary-600 shadow-primary-600/25 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-lg font-bold text-white shadow-md transition-transform group-hover:scale-105"
          >
            B
          </div>
          <span class="text-xl font-bold tracking-tight">BunTech</span>
        </NuxtLink>

        <div class="max-w-md">
          <div
            class="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm"
          >
            <span class="bg-success-400 h-2 w-2 animate-pulse rounded-full" aria-hidden="true" />
            {{ t('app.tagline') }}
          </div>
          <h1
            class="animate-fade-in-up mb-5 text-4xl leading-[1.1] font-bold tracking-tight xl:text-5xl"
          >
            {{ t('auth.heroTitle') || 'Hệ thống quản lý xưởng bún' }}
          </h1>
          <p
            class="animate-fade-in-up max-w-sm text-lg leading-relaxed text-slate-300"
            style="animation-delay: 100ms"
          >
            {{
              t('auth.heroSubtitle') ||
              'Chuyển đổi số toàn diện cho xưởng bún gia đình — từ đặt hàng, giao nhận đến công nợ.'
            }}
          </p>

          <!-- Feature highlights -->
          <div
            class="animate-fade-in-up mt-10 grid grid-cols-3 gap-4"
            style="animation-delay: 200ms"
          >
            <div class="text-center">
              <div class="text-primary-400 text-2xl font-bold">24/7</div>
              <div class="mt-1 text-xs text-slate-400">
                {{ t('auth.featureOnline') || 'Online' }}
              </div>
            </div>
            <div class="text-center">
              <div class="text-accent-400 text-2xl font-bold">100%</div>
              <div class="mt-1 text-xs text-slate-400">
                {{ t('auth.featureAutomated') || 'Tự động' }}
              </div>
            </div>
            <div class="text-center">
              <div class="text-success-400 text-2xl font-bold">SSE</div>
              <div class="mt-1 text-xs text-slate-400">
                {{ t('auth.featureRealtime') || 'Realtime' }}
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between text-sm text-slate-400">
          <span>&copy; {{ new Date().getFullYear() }} BunTech</span>
          <div class="flex items-center gap-4">
            <NuxtLink to="/" class="transition-colors hover:text-white">{{
              t('nav.home')
            }}</NuxtLink>
            <NuxtLink to="/about" class="transition-colors hover:text-white">{{
              t('nav.about')
            }}</NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Right: Form Panel -->
    <div class="bg-surface-muted flex flex-1 items-center justify-center p-6 sm:p-8 lg:p-12">
      <div class="animate-fade-in-up w-full max-w-sm">
        <!-- Mobile logo -->
        <div class="mb-8 flex items-center justify-center gap-2.5 lg:hidden">
          <div
            class="from-primary-500 to-primary-600 shadow-primary-600/20 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-lg font-bold text-white shadow-md"
          >
            B
          </div>
          <span class="text-surface-foreground text-xl font-bold tracking-tight">BunTech</span>
        </div>
        <slot />
      </div>
    </div>
  </div>
</template>
