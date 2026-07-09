<script setup lang="ts">
/**
 * Layout Auth — Centered card cho Login / Register.
 * Không sidebar, không header. Chỉ logo + form card giữa trang.
 */
</script>

<template>
  <div class="bg-muted flex min-h-dvh items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="mb-8 flex flex-col items-center gap-2">
        <div class="bg-primary/10 flex size-14 items-center justify-center rounded-xl">
          <UIcon name="i-lucide-wheat" class="text-primary size-8" />
        </div>
        <h1 class="text-highlighted text-2xl font-bold">BunTech</h1>
        <p class="text-muted text-sm">Hệ thống quản lý xưởng bún</p>
      </div>

      <!-- Form Card -->
      <UCard>
        <slot />
      </UCard>
    </div>
  </div>
</template>
