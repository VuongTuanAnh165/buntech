<script setup lang="ts">
import { dashboardService } from '~/services/dashboardService'

interface Props {
  startDate?: string
  endDate?: string
}

const props = defineProps<Props>()

const sortBy = ref<'revenue' | 'quantity'>('revenue')

const fetchTopBuyers = async () => {
  const res = await dashboardService.getTopBuyers({
    startDate: props.startDate,
    endDate: props.endDate,
    limit: 5,
    sortBy: sortBy.value
  })
  return res.data || []
}

// Watch props and sortBy to trigger refetch
const { data: topBuyers, status } = useAsyncData('top-buyers', fetchTopBuyers, {
  watch: [() => props.startDate, () => props.endDate, sortBy]
})

const loading = computed(() => status.value === 'pending')

const handleSortChange = (val: 'revenue' | 'quantity') => {
  sortBy.value = val
}
</script>

<template>
  <UCard class="animate-fade-in-up flex h-full flex-col" style="animation-delay: 280ms">
    <template #header>
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-2">
          <h2 class="text-surface-foreground text-sm font-semibold tracking-tight">
            {{ $t('admin_dash_top_buyers') }}
          </h2>
          <UIcon name="i-lucide-star" class="text-warning-400 h-3.5 w-3.5" />
        </div>
        <div class="flex items-center rounded-lg bg-slate-100 p-0.5 dark:bg-zinc-800">
          <UButton
            variant="ghost"
            color="neutral"
            class="rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors"
            :class="
              sortBy === 'revenue'
                ? 'bg-white text-slate-800 shadow-sm hover:bg-white dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-700'
                : 'text-slate-500 hover:bg-transparent hover:text-slate-700 dark:text-zinc-400 dark:hover:bg-transparent dark:hover:text-zinc-300'
            "
            @click="handleSortChange('revenue')"
          >
            {{ $t('admin_dash_revenue') }}
          </UButton>
          <UButton
            variant="ghost"
            color="neutral"
            class="rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors"
            :class="
              sortBy === 'quantity'
                ? 'bg-white text-slate-800 shadow-sm hover:bg-white dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-700'
                : 'text-slate-500 hover:bg-transparent hover:text-slate-700 dark:text-zinc-400 dark:hover:bg-transparent dark:hover:text-zinc-300'
            "
            @click="handleSortChange('quantity')"
          >
            {{ $t('admin_dash_quantity') }}
          </UButton>
        </div>
      </div>
    </template>

    <template v-if="loading && (!topBuyers || topBuyers.length === 0)">
      <div v-for="i in 5" :key="i" class="flex items-center gap-3 py-2">
        <USkeleton class="h-8 w-8 rounded-full" />
        <div class="flex-1">
          <USkeleton class="mb-1 h-3.5" />
          <USkeleton class="h-3 w-1/2" />
        </div>
      </div>
    </template>

    <template v-else>
      <div class="divide-surface-border -my-2 divide-y">
        <div
          v-for="(buyer, i) in topBuyers"
          :key="buyer.userId"
          class="hover:bg-surface-hover/60 flex items-center gap-2.5 py-3 transition-colors duration-150"
        >
          <div class="relative">
            <UAvatar
              :alt="buyer.fullName"
              :src="getImageUrl(buyer.avatarUrl || undefined) || undefined"
              size="sm"
            />
            <span
              :class="[
                'ring-surface absolute -right-1 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ring-2',
                i === 0
                  ? 'bg-warning-400 text-white'
                  : i === 1
                    ? 'bg-slate-300 text-white dark:bg-zinc-600'
                    : 'bg-slate-200 text-slate-600 dark:bg-zinc-700 dark:text-zinc-300'
              ]"
              >{{ i + 1 }}</span
            >
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-surface-foreground truncate text-sm font-medium">
              {{ buyer.fullName }}
            </p>
            <p class="text-xs text-slate-500 tabular-nums dark:text-zinc-400">
              <span v-if="sortBy === 'revenue'">{{ formatVND(buyer.totalRevenue) }}</span>
              <span v-else>{{ $t('admin_dash_n_products', { count: buyer.totalQuantity }) }}</span>
            </p>
          </div>
        </div>
      </div>
      <BaseEmptyState
        v-if="topBuyers && topBuyers.length === 0"
        :title="$t('common_empty_title')"
        :description="$t('common_empty_desc')"
      />
    </template>
  </UCard>
</template>
