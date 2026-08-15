<script setup lang="ts">
import { ConstantKey } from '~/enums/constantKeys'
import type { Order } from '~/utils/types'

const { constants } = useMasterData()
const props = defineProps<{
  order: Order
}>()
const statusColor = computed(() => {
  if (props.order.status === constants.value?.[ConstantKey.OrderStatus]?.PENDING) return 'warning'
  if (
    props.order.status === constants.value?.[ConstantKey.OrderStatus]?.IN_PROGRESS ||
    props.order.status === constants.value?.[ConstantKey.OrderStatus]?.DELIVERING
  )
    return 'primary'
  if (props.order.status === constants.value?.[ConstantKey.OrderStatus]?.DELIVERED) return 'success'
  return 'error'
})
const statusLabel = computed(() => {
  if (props.order.status === constants.value?.[ConstantKey.OrderStatus]?.PENDING) return 'Chờ giao'
  if (
    props.order.status === constants.value?.[ConstantKey.OrderStatus]?.IN_PROGRESS ||
    props.order.status === constants.value?.[ConstantKey.OrderStatus]?.DELIVERING
  )
    return 'Đang giao'
  if (props.order.status === constants.value?.[ConstantKey.OrderStatus]?.DELIVERED)
    return 'Hoàn thành'
  if (props.order.status === constants.value?.[ConstantKey.OrderStatus]?.CANCELLED) return 'Đã hủy'
  return props.order.status
})
</script>
<template>
  <UCard
    class="w-full cursor-pointer overflow-hidden border-0 shadow-sm ring-1 ring-neutral-200 transition-transform duration-200 active:scale-[0.98] dark:ring-neutral-800"
    :ui="{ body: 'p-0' }"
    @click="navigateTo(`/driver/delivery/${order.id}`)"
  >
    <!-- Top section -->
    <div class="border-b border-neutral-100 p-4 dark:border-neutral-800/50">
      <div class="mb-3 flex items-start justify-between gap-3">
        <div class="flex items-center gap-2">
          <div
            class="bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 ring-primary-100 dark:ring-primary-900 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ring-1"
          >
            {{ (order.user?.full_name || order.guest_info?.name || 'K').charAt(0).toUpperCase() }}
          </div>
          <div>
            <h3 class="line-clamp-1 font-semibold text-neutral-900 dark:text-white">
              {{ order.user?.full_name || order.guest_info?.name || 'Khách hàng' }}
            </h3>
            <p class="font-mono text-xs text-neutral-500">{{ order.id }}</p>
          </div>
        </div>
        <UBadge :color="statusColor" variant="subtle" size="xs" class="rounded-full px-2.5">
          <span class="flex items-center gap-1">
            <span
              v-if="
                order.status === constants?.[ConstantKey.OrderStatus]?.IN_PROGRESS ||
                order.status === constants?.[ConstantKey.OrderStatus]?.DELIVERING
              "
              class="bg-primary-500 h-1.5 w-1.5 animate-pulse rounded-full"
            />
            {{ statusLabel }}
          </span>
        </UBadge>
      </div>
      <div class="flex gap-2 text-sm text-neutral-600 dark:text-neutral-400">
        <UIcon name="i-lucide-map-pin" class="text-primary-500 mt-0.5 h-4 w-4 flex-shrink-0" />
        <p class="line-clamp-2 leading-tight">{{ order.shipping_address }}</p>
      </div>
    </div>
    <!-- Bottom section -->
    <div class="flex items-center justify-between bg-neutral-50 px-4 py-3 dark:bg-zinc-800/50">
      <div class="flex flex-col">
        <span class="text-[10px] font-medium tracking-wider text-neutral-500 uppercase"
          >Cần thu</span
        >
        <span class="text-primary-600 dark:text-primary-400 font-bold tabular-nums">
          {{ formatVND(Number(order.total)) }}
        </span>
      </div>

      <UIcon name="i-lucide-arrow-right" class="h-5 w-5 text-neutral-400" />
    </div>
  </UCard>
</template>
