<!--
  Responsibility: Render the cart items in the create order page
  Dependency: orderItems, customPrices, subtotal
  Reason: Extracted to keep admin/orders/create.vue under 400 lines
-->
<script setup lang="ts">
import { formatVND } from '~/utils/formatters'

defineProps<{
  items: {
    product_id: string
    product_name: string
    quantity: number
    price: number
    stock: number
    unit: string
    image_url: string
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
  <div class="bg-surface ring-surface-border rounded-xl p-5 shadow-sm ring-1">
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
        class="space-y-2 overflow-hidden px-1"
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
          :key="item.product_id"
          class="bg-surface flex items-center gap-3 rounded-xl border border-transparent p-3 transition-colors hover:border-slate-200 hover:bg-slate-50 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/50"
        >
          <div class="min-w-0 flex-1">
            <p class="text-surface-foreground truncate text-sm font-medium">
              {{ item.product_name }}
            </p>
            <p
              v-if="customPrices.has(item.product_id)"
              class="text-primary-600 text-[10px] font-medium"
            >
              Giá riêng
            </p>
            <p class="hidden text-xs text-slate-500 sm:block">{{ formatVND(item.price) }}</p>
          </div>
          <div class="border-surface-border bg-surface flex items-center gap-1 rounded-lg border">
            <UButton
              variant="ghost"
              color="neutral"
              size="xs"
              icon="i-lucide-minus"
              aria-label="Giảm"
              @click="emit('updateQuantity', i, -1)"
            />
            <UInput
              :model-value="item.quantity"
              type="number"
              :min="1"
              size="xs"
              class="w-12 text-center"
              @update:model-value="
                (v: string | number) => {
                  const num = Number(v)
                  if (num > 0) emit('setQuantity', i, num)
                }
              "
            />
            <UButton
              variant="ghost"
              color="neutral"
              size="xs"
              icon="i-lucide-plus"
              aria-label="Tăng"
              @click="emit('updateQuantity', i, 1)"
            />
          </div>
          <div class="w-24 text-right">
            <span class="text-surface-foreground text-sm font-semibold">{{
              formatVND(item.quantity * item.price)
            }}</span>
          </div>
          <UButton
            color="error"
            variant="ghost"
            icon="i-lucide-trash-2"
            size="sm"
            @click="emit('remove', i)"
          />
        </div>
      </TransitionGroup>
      <div class="border-surface-border mt-4 flex items-center justify-between border-t pt-4">
        <span class="text-surface-foreground text-sm font-semibold">Tạm tính</span>
        <span class="text-surface-foreground text-lg font-bold">{{ formatVND(subtotal) }}</span>
      </div>
    </template>
    <div v-else class="py-12 text-center">
      <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
        <UIcon name="i-lucide-shopping-cart" class="h-6 w-6 text-slate-300" />
      </div>
      <p class="text-surface-foreground text-sm font-medium">Giỏ hàng trống</p>
    </div>
  </div>
</template>
