<!--
  Responsibility: Render a grid of products for selection
  Dependency: filteredProducts, orderItems, formatVND
  Reason: Extracted to keep admin/orders/create.vue under 400 lines
-->
<script setup lang="ts">
import type { Product } from '~/utils/types'

defineProps<{
  products: Product[]
  orderItems: { product_id: string }[]
}>()

const emit = defineEmits<{
  (e: 'add', productId: string): void
}>()

const searchQuery = defineModel<string>('searchQuery', { default: '' })
</script>

<template>
  <div class="bg-surface ring-surface-border rounded-xl p-5 shadow-sm ring-1">
    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="bg-primary-50 flex h-8 w-8 items-center justify-center rounded-lg">
          <UIcon name="i-lucide-package" class="text-primary-600 h-4 w-4" />
        </div>
        <div>
          <h2 class="text-surface-foreground text-sm font-semibold">Chọn sản phẩm</h2>
          <p class="text-xs text-slate-500">Bấm để thêm vào giỏ hàng</p>
        </div>
      </div>
      <div class="relative w-48 text-sm">
        <UInput
          v-model="searchQuery"
          icon="i-lucide-search"
          placeholder="Tìm sản phẩm..."
          class="w-full"
        />
      </div>
    </div>
    <div v-if="products.length" class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      <UButton
        v-for="p in products"
        :key="p.id"
        variant="ghost"
        color="neutral"
        type="button"
        :class="[
          'relative rounded-xl border p-3 text-left transition-all',
          orderItems.some((i) => i.product_id === p.id)
            ? 'border-primary-500 ring-primary-500 bg-primary-50/50 ring-1'
            : 'border-surface-border bg-surface shadow-sm hover:border-slate-300'
        ]"
        @click="emit('add', p.id)"
      >
        <div
          v-if="orderItems.some((i) => i.product_id === p.id)"
          class="bg-primary-600 absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full text-white shadow-sm"
        >
          <UIcon name="i-lucide-check-circle-2" class="h-3.5 w-3.5" />
        </div>
        <div
          class="mb-2 flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800"
        >
          <NuxtImg
            v-if="p.image_url"
            :src="p.image_url"
            :alt="p.name"
            class="h-full w-full object-cover"
            loading="lazy"
          />
          <UIcon v-else name="i-lucide-package" class="h-6 w-6 text-slate-300 dark:text-zinc-600" />
        </div>
        <p class="text-surface-foreground truncate text-xs font-medium">{{ p.name }}</p>
        <div class="mt-1 flex items-center justify-between">
          <span class="text-primary-600 text-xs font-semibold">{{ formatVND(p.price) }}</span>
          <span class="text-[10px] text-slate-400">{{ p.stock }} {{ p.unit }}</span>
        </div>
      </UButton>
    </div>
    <div v-else class="py-8 text-center text-sm text-slate-500">Không tìm thấy sản phẩm</div>
  </div>
</template>
