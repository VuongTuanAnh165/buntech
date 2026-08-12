<script setup lang="ts">
const trustBadges = [
  { icon: 'i-lucide-leaf', label: '100% Gạo tự nhiên' },
  { icon: 'i-lucide-truck', label: 'Giao hàng 2 giờ' },
  { icon: 'i-lucide-store', label: '50+ đại lý' },
  { icon: 'i-lucide-award', label: '3 đời kinh nghiệm' }
]
</script>

<template>
  <section class="border-surface-border bg-surface border-b">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="divide-surface-border grid grid-cols-2 divide-x lg:grid-cols-4">
        <div
          v-for="(badge, i) in trustBadges"
          :key="i"
          class="animate-fade-in-up flex items-center gap-3 px-4 py-5 sm:px-6"
          :style="{ animationDelay: `${i * 60}ms` }"
          :class="{ 'border-r': i < 3 }"
        >
          <div
            class="bg-primary-50 dark:bg-primary-900/20 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
          >
            <span
              :class="[badge.icon, 'text-primary-600 dark:text-primary-400 h-5 w-5']"
              aria-hidden="true"
            />
          </div>
          <span class="text-surface-foreground text-sm font-medium">{{ badge.label }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
