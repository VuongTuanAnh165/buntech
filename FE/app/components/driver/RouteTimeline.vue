<script setup lang="ts">
import type { Order } from '~/utils/types'
const props = defineProps<{
  orders: Order[]
}>()
</script>
<template>
  <div class="relative pl-6 py-2">
    <!-- Vertical line -->
    <div class="absolute left-[11px] top-6 bottom-6 w-0.5 bg-neutral-200 dark:bg-neutral-800" />
    
    <div 
      v-for="(order, i) in orders" 
      :key="order.id"
      class="relative mb-6 last:mb-0 animate-fade-in-up"
      :style="{ animationDelay: `${i * 100}ms` }"
    >
      <!-- Dot -->
      <div 
        class="absolute -left-6 top-1 w-6 h-6 rounded-full border-4 border-white dark:border-zinc-900 flex items-center justify-center bg-primary-500 shadow-sm"
      >
        <span class="text-[9px] font-bold text-white">{{ i + 1 }}</span>
      </div>
      
      <!-- Content -->
      <div class="bg-neutral-50 dark:bg-zinc-800/50 rounded-xl p-3 border border-neutral-100 dark:border-neutral-800">
        <div class="flex justify-between items-start mb-1">
          <h4 class="font-medium text-sm text-neutral-900 dark:text-white line-clamp-1">{{ order.customer_name }}</h4>
          <span class="text-[10px] text-neutral-500 whitespace-nowrap">{{ formatTime(order.created_at) }}</span>
        </div>
        <p class="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
          {{ order.shipping_address }}
        </p>
      </div>
    </div>
  </div>
</template>
