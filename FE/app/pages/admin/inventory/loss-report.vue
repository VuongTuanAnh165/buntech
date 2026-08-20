<script setup lang="ts">
import { inventoryService } from '~/services/inventoryService'

import { t } from '~/utils/i18n'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: t('admin_inventory_loss_seo') })

// ─── State ────────────────────────────────────────────────
const search = ref('')
const selectedRange = ref('30')
const page = ref(1)
const perPage = ref(10)

const rangeOptions = computed(() => [
  { label: t('admin_inventory_loss_range_7'), value: '7' },
  { label: t('admin_inventory_loss_range_30'), value: '30' },
  { label: t('admin_inventory_loss_range_90'), value: '90' }
])

const rangeDays = computed(() => Number(selectedRange.value))

const dateFilters = computed(() => {
  const endDate = new Date()
  const startDate = new Date(Date.now() - rangeDays.value * 86400000)
  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  }
})

// ─── Data Fetching ────────────────────────────────────────
const { data: lossData, status: lossStatus } = useAsyncData(
  'loss-report',
  async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await inventoryService.getLossReport(
      dateFilters.value.startDate,
      dateFilters.value.endDate
    )
    return res.data
  },
  { watch: [selectedRange] }
)

const loading = computed(() => lossStatus.value === 'pending')

// ─── KPIs ─────────────────────────────────────────────────
const totalQuantityLost = computed(() => lossData.value?.lossQuantityKg || 0)
const lossRate = computed(() => lossData.value?.lossPercentage || 0)

const kpiStats = computed(() => [
  {
    title: t('admin_inventory_loss_kpi_export'),
    value: formatNumber(lossData.value?.totalMaterialExportedKg || 0),
    icon: 'i-lucide-arrow-up-from-line',
    color: 'primary' as const
  },
  {
    title: t('admin_inventory_loss_kpi_loss'),
    value: formatNumber(totalQuantityLost.value),
    icon: 'i-lucide-package-minus',
    color: 'warning' as const
  },
  {
    title: t('admin_inventory_loss_kpi_rate'),
    value: `${lossRate.value}%`,
    icon: 'i-lucide-percent',
    color: lossRate.value > 5 ? ('error' as const) : ('success' as const)
  },
  {
    title: t('admin_inventory_loss_kpi_target'),
    value: '< 5%',
    icon: 'i-lucide-target',
    color: 'info' as const
  }
])

// ─── Chart Data ─────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dailyTrends = computed(() => (lossData.value?.dailyTrends || []) as any[])

const lossTrend = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return dailyTrends.value.map((day: any) => ({
    label: formatDate(day.date),
    total: day.loss
  }))
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const maxTrendTotal = computed(() => Math.max(...lossTrend.value.map((d: any) => d.total), 1))

// ─── Table ────────────────────────────────────────────────
const filteredList = computed(() => {
  if (!search.value.trim()) return dailyTrends.value
  const q = search.value.toLowerCase()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return dailyTrends.value.filter((m: any) => formatDate(m.date).toLowerCase().includes(q))
})

const totalPages = computed(() => Math.ceil(filteredList.value.length / perPage.value))

const pagedList = computed(() => {
  const start = (page.value - 1) * perPage.value
  return filteredList.value.slice(start, start + perPage.value)
})

const columns = computed(() => [
  { accessorKey: 'date', header: t('admin_inventory_loss_col_date') },
  { accessorKey: 'exported', header: t('admin_inventory_loss_col_export') },
  { accessorKey: 'delivered', header: t('admin_inventory_loss_col_deliver') },
  { accessorKey: 'loss', header: t('admin_inventory_loss_col_loss') },
  { accessorKey: 'lossPercentage', header: t('admin_inventory_loss_col_loss_rate') }
])

watch(search, () => {
  page.value = 1
})
</script>
<template>
  <div>
    <BasePageHeader
      :title="$t('admin_inventory_loss_title')"
      :description="$t('admin_inventory_loss_desc')"
      :breadcrumbs="[
        { label: $t('nav_home'), to: '/admin', icon: 'i-lucide-home' },
        { label: $t('nav_inventory_raw'), to: '/admin/inventory' },
        { label: $t('admin_inventory_loss_title') }
      ]"
    >
      <template #actions>
        <USelectMenu v-model="selectedRange" :items="rangeOptions" value-key="value" />
      </template>
    </BasePageHeader>
    <template v-if="loading">
      <BasePageLoading />
    </template>
    <template v-else>
      <div class="mb-6">
        <BaseStatsGrid :stats="kpiStats" :columns="4" />
      </div>
      <div class="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <!-- Chart -->
        <div class="card stagger-item p-5 lg:col-span-2" style="animation-delay: 200ms">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-surface-foreground flex items-center gap-2 text-sm font-semibold">
              <UIcon name="i-lucide-bar-chart-2" class="text-error-500 h-4 w-4" />
              {{ $t('admin_inventory_loss_chart_title', { days: rangeDays }) }}
            </h3>
          </div>
          <div class="flex h-48 items-end gap-2 overflow-x-auto pb-4">
            <div
              v-for="(day, i) in lossTrend"
              :key="i"
              class="flex min-w-[40px] flex-1 flex-col items-center gap-2"
            >
              <div class="flex h-40 w-full items-end justify-center">
                <div class="group relative flex w-full max-w-[40px] justify-center">
                  <div
                    class="bg-error-500/80 hover:bg-error-500 w-full cursor-pointer rounded-t-md transition-all duration-500"
                    :style="{
                      height: `${(day.total / maxTrendTotal) * 100}%`,
                      animationDelay: `${i * 50}ms`
                    }"
                  />
                  <!-- Tooltip -->
                  <div
                    class="pointer-events-none absolute -top-10 z-10 rounded bg-slate-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-zinc-800"
                  >
                    {{ formatNumber(day.total) }} kg
                  </div>
                </div>
              </div>
              <span class="text-center text-[10px] font-medium text-slate-400 dark:text-zinc-500">{{
                day.label
              }}</span>
            </div>
          </div>
        </div>
        <!-- AI Insights -->
        <div class="card stagger-item p-5" style="animation-delay: 280ms">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-surface-foreground flex items-center gap-2 text-sm font-semibold">
              <UIcon name="i-lucide-sparkles" class="text-primary-500 h-4 w-4" />
              {{ $t('admin_inventory_loss_ai_title') }}
            </h3>
          </div>
          <div class="space-y-3">
            <div
              v-if="lossRate > 5"
              class="bg-error-50 dark:bg-error-900/10 border-error-200 dark:border-error-800/30 animate-fade-in-up flex gap-3 rounded-lg border p-3"
            >
              <UIcon
                name="i-lucide-alert-triangle"
                class="text-error-600 dark:text-error-400 mt-0.5 h-5 w-5 flex-shrink-0"
              />
              <div>
                <p class="text-error-800 dark:text-error-300 text-sm font-semibold">
                  {{ $t('admin_inventory_loss_ai_high_title') }}
                </p>
                <p class="text-error-600 dark:text-error-400 mt-1 text-xs">
                  {{ $t('admin_inventory_loss_ai_high_desc', { rate: lossRate }) }}
                </p>
              </div>
            </div>
            <div
              v-else
              class="bg-success-50 dark:bg-success-900/10 border-success-200 dark:border-success-800/30 animate-fade-in-up flex gap-3 rounded-lg border p-3"
            >
              <UIcon
                name="i-lucide-check-circle-2"
                class="text-success-600 dark:text-success-400 mt-0.5 h-5 w-5 flex-shrink-0"
              />
              <div>
                <p class="text-success-800 dark:text-success-300 text-sm font-semibold">
                  {{ $t('admin_inventory_loss_ai_ok_title') }}
                </p>
                <p class="text-success-600 dark:text-success-400 mt-1 text-xs">
                  {{ $t('admin_inventory_loss_ai_ok_desc', { rate: lossRate }) }}
                </p>
              </div>
            </div>
            <div
              class="bg-primary-50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-800/30 animate-fade-in-up flex gap-3 rounded-lg border p-3"
              style="animation-delay: 100ms"
            >
              <UIcon
                name="i-lucide-lightbulb"
                class="text-primary-600 dark:text-primary-400 mt-0.5 h-5 w-5 flex-shrink-0"
              />
              <div>
                <p class="text-primary-800 dark:text-primary-300 text-sm font-semibold">
                  {{ $t('admin_inventory_loss_ai_tip_title') }}
                </p>
                <p class="text-primary-600 dark:text-primary-400 mt-1 text-xs">
                  {{ $t('admin_inventory_loss_ai_tip_desc') }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Table Section -->
      <div class="card stagger-item p-5" style="animation-delay: 360ms">
        <div class="mb-4 flex items-center gap-3">
          <div class="max-w-sm flex-1">
            <BaseSearchInput v-model="search" :placeholder="$t('admin_inventory_loss_search_ph')" />
          </div>
          <UButton color="neutral" variant="outline" icon="i-lucide-download">
            {{ $t('admin_inventory_loss_btn_export') }}
          </UButton>
        </div>
        <div class="bg-surface ring-surface-border overflow-hidden rounded-lg ring-1">
          <BaseDataTable
            :columns="columns"
            :rows="pagedList"
            :empty-title="$t('admin_inventory_loss_empty_title')"
            :empty-description="$t('admin_inventory_loss_empty_desc')"
            empty-icon="i-lucide-clipboard-list"
          >
            <template #date-cell="{ row }">
              <div class="flex items-center gap-2">
                <div
                  class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-slate-100 dark:bg-zinc-800"
                >
                  <UIcon name="i-lucide-calendar" class="h-4 w-4 text-slate-500" />
                </div>
                <p class="text-surface-foreground font-medium">
                  {{ formatDate(row.date) }}
                </p>
              </div>
            </template>
            <template #exported-cell="{ row }">
              <span class="font-semibold text-slate-600 tabular-nums dark:text-slate-300">
                {{ formatNumber(row.exported) }} kg
              </span>
            </template>
            <template #delivered-cell="{ row }">
              <span class="font-semibold text-slate-600 tabular-nums dark:text-slate-300">
                {{ formatNumber(row.delivered) }} kg
              </span>
            </template>
            <template #loss-cell="{ row }">
              <span class="text-error-600 dark:text-error-400 font-semibold tabular-nums">
                -{{ formatNumber(row.loss) }} kg
              </span>
            </template>
            <template #lossPercentage-cell="{ row }">
              <span
                class="font-semibold tabular-nums"
                :class="
                  row.lossPercentage > 5
                    ? 'text-error-600 dark:text-error-400'
                    : 'text-success-600 dark:text-success-400'
                "
              >
                {{ row.lossPercentage }}%
              </span>
            </template>
          </BaseDataTable>
          <div
            v-if="totalPages > 1"
            class="border-surface-border flex items-center justify-between border-t px-4 py-3"
          >
            <span class="text-sm text-slate-500 tabular-nums">
              {{ (page - 1) * perPage + 1 }}-{{ Math.min(page * perPage, filteredList.length) }} /
              {{ filteredList.length }}
            </span>
            <UPagination
              v-model:page="page"
              :total="filteredList.length"
              :items-per-page="perPage"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
