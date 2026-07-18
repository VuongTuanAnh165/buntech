<script setup lang="ts">
/**
 * Layout mặc định — dùng cho Landing Page và các trang public.
 * Minimal layout, chỉ có slot mặc định.
 */
</script>

<template>
  <div class="bg-default flex min-h-dvh flex-col">
    <LayoutsDefaultHeader />
    <main class="flex-grow">
      <slot />
    </main>
    <LayoutsDefaultFooter />
  </div>
</template>
