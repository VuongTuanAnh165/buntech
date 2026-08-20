<script setup lang="ts">
import type { Order } from '~/utils/types'
const _props = defineProps<{
  orders: Order[]
}>()
</script>
<template>
  <div class="relative py-2 pl-6">
    <!-- Vertical line -->
    <div class="absolute top-6 bottom-6 left-[11px] w-0.5 bg-neutral-200 dark:bg-neutral-800" />

    <div
      v-for="(order, i) in orders"
      :key="order.id"
      class="animate-fade-in-up relative mb-6 last:mb-0"
      :style="{ animationDelay: `${i * 100}ms` }"
    >
      <!-- Dot -->
      <div
        class="bg-primary-500 absolute top-1 -left-6 flex h-6 w-6 items-center justify-center rounded-full border-4 border-white shadow-sm dark:border-zinc-900"
      >
        <span class="text-[9px] font-bold text-white">{{ i + 1 }}</span>
      </div>

      <!-- Content -->
      <div
        class="rounded-xl border border-neutral-100 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-zinc-800/50"
      >
        <div class="mb-1 flex items-start justify-between">
          <h4 class="line-clamp-1 text-sm font-medium text-neutral-900 dark:text-white">
            {{ order.user?.full_name || order.guest_info?.name || $t('common_customer') }}
          </h4>
          <span class="text-[10px] whitespace-nowrap text-neutral-500">{{
            formatDate(order.created_at)
          }}</span>
        </div>
        <p class="line-clamp-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
          {{ order.shipping_address }}
        </p>
      </div>
    </div>
  </div>
</template>
