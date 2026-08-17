<!--
  Responsibility: Render the cart items in the create order page
  Dependency: orderItems, customPrices, subtotal
  Reason: Extracted to keep admin/orders/create.vue under 400 lines
-->
<script setup lang="ts">
defineProps<{
  items: {
    productId: number
    productName: string
    quantity: number
    price: number
    stock: number
    unit: string
    thumbnailUrl: string | null
  }[]
  customPrices: Map<string, number>
  subtotal: number
}>()

const emit = defineEmits<{
  (e: 'updateQuantity' | 'setQuantity', index: number, value: number): void
  (e: 'remove', index: number): void
}>()
</script>

<template>
  <div class="w-full">
    <div class="mb-4 flex items-center gap-2">
      <div class="bg-info-50 flex h-8 w-8 items-center justify-center rounded-lg">
        <UIcon name="i-lucide-shopping-cart" class="text-info-600 h-4 w-4" />
      </div>
      <div>
        <h2 class="text-surface-foreground text-sm font-semibold">Giỏ hàng</h2>
        <p class="text-xs text-slate-500">{{ items.length }} sản phẩm</p>
      </div>
    </div>
    <template v-if="items.length">
      <TransitionGroup
        name="list"
        tag="div"
        class="max-h-80 space-y-2 overflow-x-hidden overflow-y-auto pr-2"
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-x-8"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="transition duration-200 ease-in absolute w-full"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 -translate-x-8"
        move-class="transition duration-300 ease-out"
      >
        <div
          v-for="(item, i) in items"
          :key="item.productId"
          class="bg-surface flex items-center gap-3 rounded-xl border border-transparent p-3 transition-colors hover:border-slate-200 hover:bg-slate-50 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/50"
        >
          <div class="min-w-0 flex-1">
            <p
              class="text-surface-foreground truncate text-sm font-medium"
              :title="item.productName"
            >
              {{ item.productName }}
            </p>
            <p class="text-xs text-gray-400 dark:text-zinc-500">
              {{ formatVND(item.price) }} / {{ item.unit }}
            </p>
            <p
              v-if="customPrices.has(String(item.productId))"
              class="text-primary-600 text-[10px] font-medium"
            >
              (Giá riêng)
            </p>
          </div>
          <div class="flex flex-shrink-0 items-center gap-1">
            <UButton
              variant="ghost"
              color="neutral"
              aria-label="Giảm"
              class="bg-surface-hover hover:bg-surface-border text-surface-foreground flex h-8 min-h-[36px] w-8 min-w-[36px] items-center justify-center rounded-md transition-colors"
              @click="emit('updateQuantity', i, -1)"
            >
              <UIcon name="i-lucide-minus" class="h-3.5 w-3.5" aria-hidden="true" />
            </UButton>
            <span
              class="text-surface-foreground w-8 text-center text-sm font-medium tabular-nums"
              >{{ item.quantity }}</span
            >
            <UButton
              variant="ghost"
              color="neutral"
              aria-label="Tăng"
              class="bg-surface-hover hover:bg-surface-border text-surface-foreground flex h-8 min-h-[36px] w-8 min-w-[36px] items-center justify-center rounded-md transition-colors"
              @click="emit('updateQuantity', i, 1)"
            >
              <UIcon name="i-lucide-plus" class="h-3.5 w-3.5" aria-hidden="true" />
            </UButton>
          </div>

          <UButton
            variant="ghost"
            color="neutral"
            class="hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 flex h-8 min-h-[36px] w-8 min-w-[36px] flex-shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors"
            aria-label="Xóa"
            @click="emit('remove', i)"
          >
            <UIcon name="i-lucide-trash-2" class="h-3.5 w-3.5" aria-hidden="true" />
          </UButton>
        </div>
      </TransitionGroup>
      <div class="border-surface-border mt-4 flex items-center justify-between border-t pt-4">
        <span class="text-surface-foreground text-sm font-semibold">Tạm tính</span>
        <span class="text-surface-foreground text-lg font-bold">{{ formatVND(subtotal) }}</span>
      </div>
    </template>
    <div v-else class="py-12 text-center">
      <div
        class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 dark:bg-zinc-800/50"
      >
        <UIcon name="i-lucide-shopping-cart" class="h-6 w-6 text-slate-300" />
      </div>
      <p class="text-surface-foreground text-sm font-medium">Giỏ hàng trống</p>
    </div>
  </div>
</template>
