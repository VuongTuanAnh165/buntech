<!--
  Responsibility: Render KPI cards for product overview
  Dependency: Product status and mock data length
  Lifecycle: Mounted on product list page
  Reason: Extracted to keep admin/products/index.vue under 400 lines
-->
<script setup lang="ts">
import { ConstantKey } from '~/enums/constantKeys'
import type { Product } from '~/utils/types'

const { constants } = useMasterData()

const props = defineProps<{
  products: Product[]
  loading: boolean
}>()

const kpiCards = computed(() => {
  const list = props.products
  const active = list.filter(
    (p) => p.status === constants.value?.[ConstantKey.ProductStatus]?.ACTIVE
  ).length
  const inactive = list.filter(
    (p) => p.status === constants.value?.[ConstantKey.ProductStatus]?.INACTIVE
  ).length
  const lowStock = list.filter((p) => p.stock > 0 && p.stock < 10).length
  return [
    {
      label: 'Tổng sản phẩm',
      value: formatNumber(list.length),
      icon: 'i-lucide-package',
      accent: 'bg-gradient-to-r from-primary-500 to-primary-400',
      bg: 'bg-primary-50 dark:bg-primary-900/20',
      text: 'text-primary-600 dark:text-primary-400',
      ring: 'ring-primary-100 dark:ring-primary-900/30',
      trend: '+8%'
    },
    {
      label: 'Đang bán',
      value: formatNumber(active),
      icon: 'i-lucide-package-check',
      accent: 'bg-gradient-to-r from-success-500 to-success-400',
      bg: 'bg-success-50 dark:bg-success-900/20',
      text: 'text-success-600 dark:text-success-400',
      ring: 'ring-success-100 dark:ring-success-900/30',
      trend: '+4%'
    },
    {
      label: 'Ngừng bán',
      value: formatNumber(inactive),
      icon: 'i-lucide-package-x',
      accent: 'bg-gradient-to-r from-gray-500 to-gray-400',
      bg: 'bg-gray-50 dark:bg-zinc-900/40',
      text: 'text-gray-600 dark:text-zinc-300',
      ring: 'ring-gray-100 dark:ring-zinc-800',
      trend: '0%'
    },
    {
      label: 'Tồn kho thấp',
      value: formatNumber(lowStock),
      icon: 'i-lucide-alert-triangle',
      accent: 'bg-gradient-to-r from-warning-500 to-warning-400',
      bg: 'bg-warning-50 dark:bg-warning-900/20',
      text: 'text-warning-600 dark:text-warning-400',
      ring: 'ring-warning-100 dark:ring-warning-900/30',
      trend: '+2'
    }
  ]
})
</script>

<template>
  <div class="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
    <template v-if="loading">
      <div v-for="i in 4" :key="i" class="card p-5">
        <div class="mb-3 flex items-center gap-3">
          <div class="skeleton h-10 w-10 rounded-xl" />
          <div class="flex-1"><div class="skeleton h-3 w-16" /></div>
        </div>
        <div class="skeleton mb-2 h-3" />
        <div class="skeleton h-6 w-2/3" />
      </div>
    </template>
    <template v-else>
      <div
        v-for="(card, i) in kpiCards"
        :key="card.label"
        class="card card-hover stagger-item group relative overflow-hidden p-5"
        :style="{ animationDelay: `${i * 40}ms` }"
      >
        <div :class="['kpi-accent', card.accent]" />
        <div class="mb-2.5 flex items-start justify-between">
          <div
            :class="[
              'flex h-10 w-10 items-center justify-center rounded-xl ring-1 transition-transform duration-200 group-hover:scale-110',
              card.bg,
              card.ring
            ]"
          >
            <span :class="['h-5 w-5', card.icon, card.text]" aria-hidden="true" />
          </div>
          <span
            class="text-success-600 dark:text-success-400 flex items-center gap-0.5 text-xs font-medium"
          >
            <UIcon name="i-lucide-trending-up" class="h-3 w-3" aria-hidden="true" />
            {{ card.trend }}
          </span>
        </div>
        <p class="mb-1 text-[13px] font-medium text-slate-500 dark:text-zinc-400">
          {{ card.label }}
        </p>
        <p class="text-surface-foreground text-2xl font-bold tracking-tight tabular-nums">
          {{ card.value }}
        </p>
      </div>
    </template>
  </div>
</template>
