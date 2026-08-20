<!--
  Responsibility: Render a grid of products for selection
  Dependency: filteredProducts, orderItems, formatVND
  Reason: Extracted to keep admin/orders/create.vue under 400 lines
-->
<script setup lang="ts">
import type { AdminProduct } from '~/utils/types'

defineProps<{
  products: AdminProduct[]
  orderItems: { productId: number }[]
}>()

const emit = defineEmits<{
  (e: 'common_add_new', productId: number): void
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
          <h2 class="text-surface-foreground text-sm font-semibold">
            {{ $t('admin_order_picker_title') }}
          </h2>
          <p class="text-xs text-slate-500">{{ $t('admin_order_picker_desc') }}</p>
        </div>
      </div>
      <div class="relative w-48 text-sm">
        <BaseSearchInput
          v-model="searchQuery"
          :placeholder="$t('quick_order_search_ph')"
          class="w-full"
        />
      </div>
    </div>
    <div
      v-if="products.length"
      class="grid max-h-[600px] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3 lg:grid-cols-4"
    >
      <UButton
        v-for="(p, i) in products"
        :key="p.id"
        variant="ghost"
        color="neutral"
        type="button"
        :class="[
          'group stagger-item h-auto w-full items-start justify-start rounded-xl border p-0 transition-all',
          orderItems.some((i) => i.productId === p.id)
            ? 'border-primary-500 ring-primary-500 bg-primary-50/50 ring-1'
            : 'border-surface-border bg-surface hover:border-primary-400 shadow-sm'
        ]"
        :style="{ animationDelay: `${Math.min(i * 20, 200)}ms` }"
        @click="emit('common_add_new', p.id)"
      >
        <div class="flex w-full flex-col p-3 text-left">
          <div
            v-if="orderItems.some((i) => i.productId === p.id)"
            class="bg-primary-600 absolute top-2 right-2 z-10 flex h-5 w-5 items-center justify-center rounded-full text-white shadow-sm"
          >
            <UIcon name="i-lucide-check-circle-2" class="h-3.5 w-3.5" />
          </div>
          <div
            class="mb-3 flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800"
          >
            <NuxtImg
              v-if="p.thumbnailUrl"
              :src="p.thumbnailUrl"
              :alt="p.name"
              class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <UIcon
              v-else
              name="i-lucide-package"
              class="h-6 w-6 text-slate-300 dark:text-zinc-600"
            />
          </div>
          <p
            class="text-surface-foreground line-clamp-2 text-sm leading-tight font-medium"
            :title="p.name"
          >
            {{ p.name }}
          </p>
          <div class="mt-auto flex flex-wrap items-baseline gap-1 pt-1">
            <span class="text-primary-600 text-sm font-bold sm:text-base">{{
              formatVND(p.basePrice)
            }}</span>
            <span class="text-xs text-slate-400 dark:text-zinc-500">/{{ p.unit }}</span>
          </div>
        </div>
      </UButton>
    </div>
    <div v-else class="py-8 text-center text-sm text-slate-500">
      {{ $t('admin_order_picker_empty') }}
    </div>
  </div>
</template>
