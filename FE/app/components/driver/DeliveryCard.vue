<script setup lang="ts">
import { OrderStatus } from '~/utils/enums'
import type { Order } from '~/utils/types'

const props = defineProps<{
  order: Order
}>()

const { formatVND } = useFormat()

const statusColor = computed(() => {
  if (props.order.status === OrderStatus.PENDING) return 'warning'
  if (props.order.status === OrderStatus.IN_PROGRESS || props.order.status === OrderStatus.SHIPPING) return 'primary'
  if (props.order.status === OrderStatus.DELIVERED) return 'success'
  return 'error'
})

const statusLabel = computed(() => {
  if (props.order.status === OrderStatus.PENDING) return 'Chờ giao'
  if (props.order.status === OrderStatus.IN_PROGRESS || props.order.status === OrderStatus.SHIPPING) return 'Đang giao'
  if (props.order.status === OrderStatus.DELIVERED) return 'Hoàn thành'
  if (props.order.status === OrderStatus.CANCELLED) return 'Đã hủy'
  return props.order.status
})
</script>

<template>
  <UCard 
    class="w-full active:scale-[0.98] transition-transform duration-200 cursor-pointer overflow-hidden border-0 ring-1 ring-neutral-200 dark:ring-neutral-800 shadow-sm"
    :ui="{ body: { padding: 'p-0' } }"
    @click="$navigateTo(`/driver/delivery/${order.id}`)"
  >
    <!-- Top section -->
    <div class="p-4 border-b border-neutral-100 dark:border-neutral-800/50">
      <div class="flex items-start justify-between gap-3 mb-3">
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 text-primary-600 dark:text-primary-400 font-bold text-sm ring-1 ring-primary-100 dark:ring-primary-900">
            {{ order.customer_name?.charAt(0).toUpperCase() || 'K' }}
          </div>
          <div>
            <h3 class="font-semibold text-neutral-900 dark:text-white line-clamp-1">{{ order.customer_name || 'Khách hàng' }}</h3>
            <p class="text-xs text-neutral-500 font-mono">{{ order.id }}</p>
          </div>
        </div>
        <UBadge :color="statusColor" variant="subtle" size="xs" class="rounded-full px-2.5">
          <span class="flex items-center gap-1">
            <span v-if="order.status === OrderStatus.IN_PROGRESS || order.status === OrderStatus.SHIPPING" class="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
            {{ statusLabel }}
          </span>
        </UBadge>
      </div>

      <div class="flex gap-2 text-sm text-neutral-600 dark:text-neutral-400">
        <UIcon name="i-lucide-map-pin" class="w-4 h-4 flex-shrink-0 text-primary-500 mt-0.5" />
        <p class="line-clamp-2 leading-tight">{{ order.shipping_address }}</p>
      </div>
    </div>

    <!-- Bottom section -->
    <div class="px-4 py-3 bg-neutral-50 dark:bg-zinc-800/50 flex items-center justify-between">
      <div class="flex flex-col">
        <span class="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">Cần thu</span>
        <span class="font-bold text-primary-600 dark:text-primary-400 tabular-nums">
          {{ formatVND(order.total_amount) }}
        </span>
      </div>
      
      <UIcon name="i-lucide-arrow-right" class="w-5 h-5 text-neutral-400" />
    </div>
  </UCard>
</template>
