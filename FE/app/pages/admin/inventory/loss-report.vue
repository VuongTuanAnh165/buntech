<script setup lang="ts">
import { InventoryMovementType } from '~/utils/enums'
import { mockInventoryMovements, mockInventoryItems } from '~/utils/mockData'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Báo cáo hao hụt - BunTech Admin' })

const { formatNumber, formatDate } = useFormat()
const toast = useToast()

// ─── State ────────────────────────────────────────────────
const loading = ref(true)
const search = ref('')
const selectedRange = ref('30')
const page = ref(1)
const perPage = ref(10)

const rangeOptions = [
  { label: '7 ngày qua', value: '7' },
  { label: '30 ngày qua', value: '30' },
  { label: '90 ngày qua', value: '90' },
]

// ─── Filtered Data ────────────────────────────────────────
const rangeDays = computed(() => Number(selectedRange.value))
const sinceDate = computed(() => new Date(Date.now() - rangeDays.value * 86400000).toISOString())

const lossMovements = computed(() =>
  mockInventoryMovements
    .filter(m => m.type === InventoryMovementType.LOSS && m.created_at >= sinceDate.value)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
)

const totalLossEvents = computed(() => lossMovements.value.length)
const totalQuantityLost = computed(() => lossMovements.value.reduce((s, m) => s + m.quantity, 0))

// For loss rate calculation
const importedMovements = computed(() =>
  mockInventoryMovements
    .filter(m => m.type === InventoryMovementType.IMPORT && m.created_at >= sinceDate.value)
)
const totalImported = computed(() => importedMovements.value.reduce((s, m) => s + m.quantity, 0))
const lossRate = computed(() => {
  if (totalImported.value === 0) return 0
  return Math.round((totalQuantityLost.value / totalImported.value) * 1000) / 10
})

// ─── KPIs ─────────────────────────────────────────────────
const kpiStats = computed(() => [
  { title: 'Số lần ghi nhận hao hụt', value: formatNumber(totalLossEvents.value), icon: 'i-lucide-alert-circle', color: 'error' as const },
  { title: 'Tổng khối lượng hao hụt', value: formatNumber(totalQuantityLost.value), icon: 'i-lucide-package-minus', color: 'warning' as const },
  { title: 'Tỷ lệ hao hụt', value: `${lossRate.value}%`, icon: 'i-lucide-percent', color: lossRate.value > 5 ? 'error' as const : 'success' as const },
  { title: 'Mục tiêu ngành', value: '< 5%', icon: 'i-lucide-target', color: 'info' as const },
])

// ─── Chart Data (last 7 days) ─────────────────────────────
const lossTrend = computed(() => {
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
  const now = new Date()
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(now.getTime() - (6 - i) * 86400000)
    const dateStr = d.toISOString().slice(0, 10)
    const dayLoss = mockInventoryMovements.filter(m => m.type === InventoryMovementType.LOSS && m.created_at.slice(0, 10) === dateStr)
    return {
      label: days[d.getDay()],
      total: dayLoss.reduce((s, m) => s + m.quantity, 0),
    }
  })
})
const maxTrendTotal = computed(() => Math.max(...lossTrend.value.map(d => d.total), 1))

// ─── Table ────────────────────────────────────────────────
const filteredList = computed(() => {
  if (!search.value.trim()) return lossMovements.value
  const q = search.value.toLowerCase()
  return lossMovements.value.filter(m =>
    m.inventory_item?.name.toLowerCase().includes(q) ||
    m.note.toLowerCase().includes(q)
  )
})

const totalPages = computed(() => Math.ceil(filteredList.value.length / perPage.value))
const pagedList = computed(() => {
  const start = (page.value - 1) * perPage.value
  return filteredList.value.slice(start, start + perPage.value)
})

const columns = [
  { accessorKey: 'item', header: 'Nguyên liệu' },
  { accessorKey: 'quantity', header: 'Khối lượng hao hụt' },
  { accessorKey: 'note', header: 'Lý do/Ghi chú' },
  { accessorKey: 'created_at', header: 'Ngày ghi nhận' },
]

// ─── Lifecycle ────────────────────────────────────────────
onMounted(() => {
  setTimeout(() => { loading.value = false }, 300)
})
</script>

<template>
  <div>
    <BasePageHeader
      title="Báo cáo hao hụt"
      description="Phân tích và theo dõi nguyên liệu thất thoát"
      :breadcrumbs="[
        { label: 'Trang chủ', to: '/admin', icon: 'i-lucide-home' },
        { label: 'Kho', to: '/admin/inventory' },
        { label: 'Báo cáo hao hụt' },
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

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <!-- Chart -->
        <div class="lg:col-span-2 card p-5 stagger-item" style="animation-delay: 200ms">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-semibold text-surface-foreground flex items-center gap-2">
              <UIcon name="i-lucide-bar-chart-2" class="w-4 h-4 text-error-500" />
              Biểu đồ hao hụt (7 ngày)
            </h3>
          </div>
          <div class="flex items-end gap-2 h-48">
            <div
              v-for="(day, i) in lossTrend"
              :key="i"
              class="flex-1 flex flex-col items-center gap-2"
            >
              <div class="w-full flex items-end justify-center h-40">
                <div class="w-full max-w-[40px] relative group flex justify-center">
                  <div
                    class="w-full rounded-t-md bg-error-500/80 hover:bg-error-500 transition-all duration-500 cursor-pointer"
                    :style="{ height: `${(day.total / maxTrendTotal) * 100}%`, animationDelay: `${i * 50}ms` }"
                  />
                  <!-- Tooltip -->
                  <div class="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 dark:bg-zinc-800 text-white text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10">
                    {{ formatNumber(day.total) }} kg
                  </div>
                </div>
              </div>
              <span class="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">{{ day.label }}</span>
            </div>
          </div>
        </div>

        <!-- AI Insights -->
        <div class="card p-5 stagger-item" style="animation-delay: 280ms">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-semibold text-surface-foreground flex items-center gap-2">
              <UIcon name="i-lucide-sparkles" class="w-4 h-4 text-primary-500" />
              Gợi ý từ hệ thống
            </h3>
          </div>
          <div class="space-y-3">
            <div
              v-if="lossRate > 5"
              class="p-3 rounded-lg bg-error-50 dark:bg-error-900/10 border border-error-200 dark:border-error-800/30 flex gap-3 animate-fade-in-up"
            >
              <UIcon name="i-lucide-alert-triangle" class="w-5 h-5 text-error-600 dark:text-error-400 flex-shrink-0 mt-0.5" />
              <div>
                <p class="text-sm font-semibold text-error-800 dark:text-error-300">Tỷ lệ hao hụt cao</p>
                <p class="text-xs text-error-600 dark:text-error-400 mt-1">Hao hụt {{ lossRate }}% vượt mức tiêu chuẩn ngành (5%). Cần rà soát quy trình bảo quản.</p>
              </div>
            </div>
            <div
              v-else
              class="p-3 rounded-lg bg-success-50 dark:bg-success-900/10 border border-success-200 dark:border-success-800/30 flex gap-3 animate-fade-in-up"
            >
              <UIcon name="i-lucide-check-circle-2" class="w-5 h-5 text-success-600 dark:text-success-400 flex-shrink-0 mt-0.5" />
              <div>
                <p class="text-sm font-semibold text-success-800 dark:text-success-300">Tỷ lệ hao hụt ổn định</p>
                <p class="text-xs text-success-600 dark:text-success-400 mt-1">Hao hụt {{ lossRate }}% nằm trong mức an toàn của ngành sản xuất bún.</p>
              </div>
            </div>

            <div class="p-3 rounded-lg bg-primary-50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-800/30 flex gap-3 animate-fade-in-up" style="animation-delay: 100ms">
              <UIcon name="i-lucide-lightbulb" class="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
              <div>
                <p class="text-sm font-semibold text-primary-800 dark:text-primary-300">Gạo tẻ hao hụt nhiều nhất</p>
                <p class="text-xs text-primary-600 dark:text-primary-400 mt-1">Nên kiểm tra lại bồn ngâm gạo số 2 có thể bị rò rỉ dẫn đến thất thoát.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Table Section -->
      <div class="card p-5 stagger-item" style="animation-delay: 360ms">
        <div class="flex items-center gap-3 mb-4">
          <div class="flex-1 max-w-sm">
            <UInput v-model="search" icon="i-lucide-search" placeholder="Tìm kiếm phiếu hao hụt..." />
          </div>
          <UButton color="neutral" variant="outline" icon="i-lucide-download">
            Xuất báo cáo
          </UButton>
        </div>

        <div class="bg-surface ring-1 ring-surface-border rounded-lg overflow-hidden">
          <UTable :columns="columns" :data="pagedList">
            <template #item-cell="{ row }">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                  <UIcon name="i-lucide-package" class="w-4 h-4 text-slate-500" />
                </div>
                <p class="font-medium text-surface-foreground">{{ row.original.inventory_item?.name || 'Nguyên liệu' }}</p>
              </div>
            </template>
            <template #quantity-cell="{ row }">
              <span class="font-semibold text-error-600 dark:text-error-400 tabular-nums">
                -{{ formatNumber(row.original.quantity) }} {{ row.original.inventory_item?.unit || '' }}
              </span>
            </template>
            <template #note-cell="{ row }">
              <span class="text-sm text-slate-600 dark:text-zinc-300">{{ row.original.note }}</span>
            </template>
            <template #created_at-cell="{ row }">
              <span class="text-sm text-slate-500 tabular-nums">{{ formatDate(row.original.created_at) }}</span>
            </template>
          </UTable>

          <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-surface-border">
            <span class="text-sm text-slate-500 tabular-nums">
              {{ (page - 1) * perPage + 1 }}-{{ Math.min(page * perPage, filteredList.length) }} / {{ filteredList.length }}
            </span>
            <UPagination v-model="page" :total="filteredList.length" :items-per-page="perPage" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
