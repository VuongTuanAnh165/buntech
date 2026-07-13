<script setup lang="ts">
/**
 * Layout Auth — Centered card cho Login / Register.
 * Không sidebar, không header. Có background image và logo.
 */
</script>

<template>
  <div
    class="relative flex min-h-dvh items-center justify-center p-4 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] sm:p-0"
  >
    <!-- Ảnh nền -->
    <NuxtImg
      src="/images/login_bg.webp"
      alt="Auth Background"
      class="absolute inset-0 h-full w-full object-cover"
      format="webp"
    />

    <!-- Lớp phủ màu để dễ đọc hơn -->
    <div class="absolute inset-0"></div>

    <!-- Container theo chuẩn login-card -->
    <div class="z-10 w-full max-w-[450px]">
      <div class="mb-6 flex justify-center">
        <NuxtLink to="/">
          <NuxtImg src="/images/logo.webp" alt="Logo" class="h-[50px] w-auto" format="webp" />
        </NuxtLink>
      </div>

      <!-- Nơi chứa form (ví dụ UCard của trang login/register) -->
      <slot />
    </div>
  </div>
</template>
