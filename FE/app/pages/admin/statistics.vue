<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Thống kê - BunTech Admin' })
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Thống kê</h1>
    </div>
    <UCard>
      <div class="py-12 text-center text-neutral-500 dark:text-neutral-400">
        <UIcon name="i-heroicons-chart-bar" class="mx-auto mb-4 h-12 w-12 opacity-50" />
        <h3 class="text-lg font-medium">Chức năng đang được phát triển</h3>
        <p class="mt-2 text-sm">Các báo cáo thống kê sẽ sớm được cập nhật trong phiên bản tới.</p>
      </div>
    </UCard>
  </div>
</template>
