<script setup lang="ts">
import {
  ArrowLeft, TrendingDown, TrendingUp, AlertTriangle, Sparkles, CheckCircle2,
  Wrench, Gauge, Calendar, Lightbulb, ArrowUp, ArrowDown, Minus, MinusCircle,
  Package, Percent, Boxes, BarChart3,
} from 'lucide-vue-next'
import { InventoryMovementType } from '../../../core/enums'
import type { InventoryMovement, InventoryItem } from '../../../core/types'
import { mockInventoryMovements, mockInventoryItems } from '../../../core/mock/data'

const { t } = useI18n()
const router = useRouter()
const { formatNumber, formatDate } = useFormat()
useHead({ title: `Báo cáo hao hụt - BunTech Admin` })
definePageMeta({ layout: 'admin' })

// ─── Date range filter ──────────────────────────────────
type RangeKey = '7' | '14' | '30' | '90'
const selectedRange = ref<RangeKey>('14')

const rangeOptions: { value: RangeKey; label: string }[] = [
  { value: '7', label: '7 ngày' },
  { value: '14', label: '14 ngày' },
  { value: '30', label: '30 ngày' },
  { value: '90', label: '90 ngày' },
]

// Industry standard benchmark for loss rate
const INDUSTRY_AVG_LOSS_RATE = 5.0

// ─── Data: filter LOSS movements from mock ──────────────
const allMovements = ref<InventoryMovement[]>(mockInventoryMovements.map(m => ({ ...m })))
const items = ref<InventoryItem[]>(mockInventoryItems.map(i => ({ ...i })))

const lossMovements = computed(() =>
  allMovements.value.filter(m => m.type === InventoryMovementType.LOSS),
)

// Filter by selected range
const rangeDays = computed(() => Number(selectedRange.value))
const sinceDate = computed(() => {
  const d = new Date(Date.now() - rangeDays.value * 86400000)
  return d.toISOString()
})

const filteredLoss = computed(() =>
  lossMovements.value.filter(m => m.created_at >= sinceDate.value),
)

// ─── KPIs ───────────────────────────────────────────────
const totalLossEvents = computed(() => filteredLoss.value.length)
const totalQuantityLost = computed(() => filteredLoss.value.reduce((s, m) => s + m.quantity, 0))

// Total imported + exported in range (to compute loss rate)
const rangeMovements = computed(() =>
  allMovements.value.filter(m => m.created_at >= sinceDate.value),
)
const totalImported = computed(() =>
  rangeMovements.value
    .filter(m => m.type === InventoryMovementType.IMPORT)
    .reduce((s, m) => s + m.quantity, 0),
)
const lossRate = computed(() => {
  if (totalImported.value === 0) return 0
  return Math.round((totalQuantityLost.value / totalImported.value) * 1000) / 10
})

// Most lost item
const lossByItem = computed(() => {
  const map = new Map<string, { item: InventoryItem | null; total: number; count: number }>()
  for (const m of filteredLoss.value) {
    const key = m.inventory_id
    const existing = map.get(key) || { item: m.inventory_item || null, total: 0, count: 0 }
    existing.total += m.quantity
    existing.count += 1
    map.set(key, existing)
  }
  return [...map.entries()]
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.total - a.total)
})

const mostLostItem = computed(() => lossByItem.value[0] || null)

// ─── 7-day loss trend chart ─────────────────────────────
interface TrendDay { label: string; date: string; total: number; count: number }
const lossTrend = computed<TrendDay[]>(() => {
  const now = new Date()
  const days: TrendDay[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000)
    const dateStr = d.toISOString().slice(0, 10)
    const dayLoss = lossMovements.value.filter(m => m.created_at.slice(0, 10) === dateStr)
    days.push({
      label: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()],
      date: dateStr,
      total: dayLoss.reduce((s, m) => s + m.quantity, 0),
      count: dayLoss.length,
    })
  }
  return days
})

const maxTrendTotal = computed(() => Math.max(...lossTrend.value.map(d => d.total), 1))

// ─── Trend comparison (current 7 days vs previous 7 days) ─
const previous7DaysStart = computed(() => {
  const d = new Date(Date.now() - 14 * 86400000)
  return d.toISOString()
})
const previous7DaysEnd = computed(() => {
  const d = new Date(Date.now() - 7 * 86400000)
  return d.toISOString()
})
const previousWeekLoss = computed(() =>
  lossMovements.value.filter(m => m.created_at >= previous7DaysStart.value && m.created_at < previous7DaysEnd.value),
)
const previousWeekTotal = computed(() => previousWeekLoss.value.reduce((s, m) => s + m.quantity, 0))
const previousWeekImported = computed(() =>
  allMovements.value
    .filter(m => m.type === InventoryMovementType.IMPORT && m.created_at >= previous7DaysStart.value && m.created_at < previous7DaysEnd.value)
    .reduce((s, m) => s + m.quantity, 0),
)
const previousLossRate = computed(() => {
  if (previousWeekImported.value === 0) return 0
  return Math.round((previousWeekTotal.value / previousWeekImported.value) * 1000) / 10
})

const lossTrendDelta = computed(() => Math.round((lossRate.value - previousLossRate.value) * 10) / 10)
const lossTrendUp = computed(() => lossTrendDelta.value > 0)

// ─── AI Recommendations ─────────────────────────────────
interface Recommendation {
  icon: unknown
  color: 'danger' | 'warning' | 'success' | 'info'
  title: string
  description: string
  action: string
}

const recommendations = computed<Recommendation[]>(() => {
  const recs: Recommendation[] = []
  const aboveIndustry = lossRate.value > INDUSTRY_AVG_LOSS_RATE

  // High loss rate
  if (aboveIndustry) {
    recs.push({
      icon: Gauge,
      color: 'danger',
      title: 'Tỷ lệ hao hụt cao hơn chuẩn ngành',
      description: `Tỷ lệ hao hụt ${lossRate.value}% vượt mức chuẩn ngành ${INDUSTRY_AVG_LOSS_RATE}%. Kiểm tra hiệu chuẩn máy ép bún, nhiệt độ hấp và quy trình phơi/sấy.`,
      action: 'Bảo trì máy ép và hệ thống hấp',
    })
  }

  // Trending up
  if (lossTrendUp.value && lossTrendDelta.value > 0.5) {
    recs.push({
      icon: TrendingUp,
      color: 'warning',
      title: 'Xu hướng hao hụt tăng',
      description: `Tỷ lệ hao hụt tăng ${lossTrendDelta.value}% so với tuần trước. Nguyên nhân có thể do chất lượng gạo nguyên liệu hoặc thời tiết ẩm.`,
      action: 'Đánh giá lại chất lượng gạo đầu vào',
    })
  }

  // Most lost item warning
  if (mostLostItem.value && mostLostItem.value.total > 100) {
    recs.push({
      icon: AlertTriangle,
      color: 'warning',
      title: `${mostLostItem.value.item?.name || 'Nguyên liệu'} hao hụt nhiều nhất`,
      description: `Tổng hao hụt ${formatNumber(mostLostItem.value.total)} ${mostLostItem.value.item?.unit || 'kg'} trong ${mostLostItem.value.count} lần. Kiểm tra quy trình bảo quản và quy cách đóng gói nguyên liệu này.`,
      action: 'Rà soát quy trình bảo quản',
    })
  }

  // Good performance
  if (!aboveIndustry && !lossTrendUp.value) {
    recs.push({
      icon: CheckCircle2,
      color: 'success',
      title: 'Hiệu suất sản xuất tốt',
      description: `Tỷ lệ hao hụt ${lossRate.value}% ở mức chấp nhận được, dưới chuẩn ngành ${INDUSTRY_AVG_LOSS_RATE}%. Duy trì quy trình hiện tại và giám sát chất lượng nguyên liệu đầu vào.`,
      action: 'Tiếp tục duy trì quy trình',
    })
  }

  // General suggestion
  recs.push({
    icon: Wrench,
    color: 'info',
    title: 'Lịch bảo trì định kỳ',
    description: 'Đề xuất bảo trì máy móc 2 tuần/lần để giảm hao hụt cơ học. Vệ sinh khuôn ép, thay thế lưới lọc và kiểm tra áp lực thủy lực.',
    action: 'Lên lịch bảo trì Preventive',
  })

  return recs
})

const recColorMap: Record<string, { bg: string; text: string; ring: string }> = {
  danger: { bg: 'bg-danger-50 dark:bg-danger-900/20', text: 'text-danger-600 dark:text-danger-400', ring: 'ring-danger-100 dark:ring-danger-900/30' },
  warning: { bg: 'bg-warning-50 dark:bg-warning-900/20', text: 'text-warning-600 dark:text-warning-400', ring: 'ring-warning-100 dark:ring-warning-900/30' },
  success: { bg: 'bg-success-50 dark:bg-success-900/20', text: 'text-success-600 dark:text-success-400', ring: 'ring-success-100 dark:ring-success-900/30' },
  info: { bg: 'bg-secondary-50 dark:bg-secondary-900/20', text: 'text-secondary-600 dark:text-secondary-400', ring: 'ring-secondary-100 dark:ring-secondary-900/30' },
}

// ─── Loss rate cell color ───────────────────────────────
function lossRateColor(rate: number): string {
  if (rate > 10) return 'text-danger-600 dark:text-danger-400 bg-danger-50/60 dark:bg-danger-900/15'
  if (rate > INDUSTRY_AVG_LOSS_RATE) return 'text-warning-600 dark:text-warning-400 bg-warning-50/60 dark:bg-warning-900/15'
  return 'text-success-600 dark:text-success-400 bg-success-50/60 dark:bg-success-900/15'
}

function lossBarColor(rate: number): string {
  if (rate > 10) return 'bg-gradient-to-t from-danger-500 to-danger-400'
  if (rate > INDUSTRY_AVG_LOSS_RATE) return 'bg-gradient-to-t from-warning-500 to-warning-400'
  return 'bg-gradient-to-t from-success-500 to-success-400'
}

// ─── Per-item loss rate ──────────────────────────────────
function itemLossRate(itemTotal: number): number {
  if (totalImported.value === 0) return 0
  return Math.round((itemTotal / totalImported.value) * 1000) / 10
}

// ─── KPI cards config ───────────────────────────────────
const kpiCards = computed(() => [
  {
    label: 'Tổng lần hao hụt',
    value: formatNumber(totalLossEvents.value),
    sub: 'sự kiện',
    icon: MinusCircle,
    color: 'primary' as const,
  },
  {
    label: 'Tổng số lượng hụt',
    value: formatNumber(totalQuantityLost.value),
    sub: 'đơn vị',
    icon: TrendingDown,
    color: 'danger' as const,
  },
  {
    label: 'Tỷ lệ hao hụt',
    value: `${lossRate.value}%`,
    sub: `chuẩn ngành: ${INDUSTRY_AVG_LOSS_RATE}%`,
    icon: Percent,
    color: lossRate.value > INDUSTRY_AVG_LOSS_RATE ? 'danger' as const : 'success' as const,
  },
  {
    label: 'Xu hướng hao hụt',
    value: `${lossTrendUp.value ? '+' : ''}${lossTrendDelta.value}%`,
    sub: 'so với tuần trước',
    icon: lossTrendUp.value ? ArrowUp : (lossTrendDelta.value === 0 ? Minus : ArrowDown),
    color: lossTrendUp.value ? 'warning' as const : 'success' as const,
  },
])

const colorMap: Record<string, { bg: string; text: string; ring: string; bar: string }> = {
  primary: { bg: 'bg-primary-50 dark:bg-primary-900/20', text: 'text-primary-600 dark:text-primary-400', ring: 'ring-primary-100 dark:ring-primary-900/30', bar: 'bg-gradient-to-r from-primary-500 to-primary-400' },
  secondary: { bg: 'bg-secondary-50 dark:bg-secondary-900/20', text: 'text-secondary-600 dark:text-secondary-400', ring: 'ring-secondary-100 dark:ring-secondary-900/30', bar: 'bg-gradient-to-r from-secondary-500 to-secondary-400' },
  success: { bg: 'bg-success-50 dark:bg-success-900/20', text: 'text-success-600 dark:text-success-400', ring: 'ring-success-100 dark:ring-success-900/30', bar: 'bg-gradient-to-r from-success-500 to-success-400' },
  warning: { bg: 'bg-warning-50 dark:bg-warning-900/20', text: 'text-warning-600 dark:text-warning-400', ring: 'ring-warning-100 dark:ring-warning-900/30', bar: 'bg-gradient-to-r from-warning-500 to-warning-400' },
  danger: { bg: 'bg-danger-50 dark:bg-danger-900/20', text: 'text-danger-600 dark:text-danger-400', ring: 'ring-danger-100 dark:ring-danger-900/30', bar: 'bg-gradient-to-r from-danger-500 to-danger-400' },
}
</script>

<template>
  <div>
    <AppBreadcrumb :items="[{ label: t('nav.inventory'), to: '/admin/inventory' }, { label: 'Báo cáo hao hụt' }]" />

    <!-- Header with date range filter -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 animate-fade-in-up">
      <div class="min-w-0">
        <h1 class="page-title flex items-center gap-2.5">
          <span class="w-9 h-9 rounded-lg bg-danger-50 dark:bg-danger-900/20 ring-1 ring-danger-100 dark:ring-danger-900/30 flex items-center justify-center">
            <TrendingDown class="w-5 h-5 text-danger-600 dark:text-danger-400" aria-hidden="true" />
          </span>
          Báo cáo hao hụt nguyên liệu
        </h1>
        <p class="page-subtitle">Phân tích hao hụt kho nguyên liệu theo thời gian thực</p>
      </div>
      <div class="flex flex-wrap gap-2 flex-shrink-0">
        <!-- Date range filter -->
        <div class="inline-flex items-center gap-1 p-1 rounded-lg bg-surface border border-surface-border">
          <Calendar class="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" aria-hidden="true" />
          <button
            v-for="opt in rangeOptions"
            :key="opt.value"
            :class="[
              'px-3 py-1.5 text-xs font-medium rounded-md transition-all min-h-[32px]',
              selectedRange === opt.value
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-slate-500 dark:text-zinc-400 hover:bg-surface-hover',
            ]"
            @click="selectedRange = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
        <AppButton variant="ghost" size="md" @click="router.push('/admin/inventory')">
          <ArrowLeft class="w-4 h-4" aria-hidden="true" /> Quay lại
        </AppButton>
      </div>
    </div>

    <!-- KPI Row -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      <div
        v-for="(card, i) in kpiCards"
        :key="card.label"
        class="card card-hover p-5 stagger-item relative overflow-hidden group"
        :style="{ animationDelay: `${i * 40}ms` }"
      >
        <div :class="['kpi-accent', colorMap[card.color].bar]" />
        <div class="flex items-start justify-between mb-2.5">
          <div :class="['w-10 h-10 rounded-xl flex items-center justify-center ring-1 transition-transform duration-200 group-hover:scale-110', colorMap[card.color].bg, colorMap[card.color].ring]">
            <component :is="card.icon" :class="['w-5 h-5', colorMap[card.color].text]" aria-hidden="true" />
          </div>
        </div>
        <p class="text-[13px] text-slate-500 dark:text-zinc-400 mb-1 font-medium">{{ card.label }}</p>
        <p class="text-2xl font-bold text-surface-foreground tracking-tight tabular-nums">{{ card.value }}</p>
        <p class="text-xs text-slate-400 dark:text-zinc-500 mt-0.5 tabular-nums">{{ card.sub }}</p>
      </div>
    </div>

    <!-- Charts row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
      <!-- Loss Trend (7 days) -->
      <div class="card p-5 stagger-item" style="animation-delay: 200ms">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-sm font-semibold text-surface-foreground">Xu hướng hao hụt 7 ngày</h2>
            <p class="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Số lượng hao hụt theo ngày</p>
          </div>
          <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium tabular-nums"
            :class="lossRate > INDUSTRY_AVG_LOSS_RATE ? 'bg-danger-50 dark:bg-danger-900/20 text-danger-600 dark:text-danger-400' : 'bg-success-50 dark:bg-success-900/20 text-success-600 dark:text-success-400'">
            <TrendingDown class="w-3 h-3" aria-hidden="true" />
            TB: {{ lossRate }}%
          </div>
        </div>

        <!-- CSS bar chart -->
        <div class="relative">
          <div class="flex items-end gap-1 h-[200px]">
            <!-- Y axis -->
            <div class="flex flex-col justify-between h-full text-[10px] text-slate-400 dark:text-zinc-500 tabular-nums pr-1 w-10 text-right flex-shrink-0">
              <span>{{ Math.round(maxTrendTotal) }}</span>
              <span>{{ Math.round(maxTrendTotal * 0.75) }}</span>
              <span>{{ Math.round(maxTrendTotal * 0.5) }}</span>
              <span>{{ Math.round(maxTrendTotal * 0.25) }}</span>
              <span>0</span>
            </div>
            <!-- Bars -->
            <div class="flex-1 flex items-end gap-1 h-full border-l border-b border-surface-border pb-0 pl-0 relative">
              <div
                v-for="(d, i) in lossTrend"
                :key="d.date"
                class="relative flex-1 group flex flex-col justify-end items-center"
              >
                <!-- Tooltip on hover -->
                <div class="absolute -top-14 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none whitespace-nowrap rounded-lg bg-slate-900 dark:bg-zinc-800 text-white text-xs px-2.5 py-1.5 shadow-lg">
                  <p class="font-medium">{{ d.label }}, {{ d.date.split('-').reverse().join('/') }}</p>
                  <p class="tabular-nums text-danger-300">Hụt: {{ formatNumber(d.total) }}</p>
                  <p class="tabular-nums text-slate-300">{{ d.count }} lần</p>
                </div>
                <div
                  class="w-full max-w-[32px] rounded-t-sm bg-gradient-to-t from-danger-500 to-danger-400 transition-all duration-300 hover:opacity-80"
                  :style="{ height: `${Math.max(4, (d.total / maxTrendTotal) * 100)}%`, animationDelay: `${i * 20}ms` }"
                />
              </div>
            </div>
          </div>
          <!-- X-axis labels -->
          <div class="flex gap-1 mt-2 pl-11">
            <div class="flex-1 flex justify-between">
              <span v-for="d in lossTrend" :key="d.date" class="text-[10px] text-slate-400 dark:text-zinc-500 tabular-nums">{{ d.label }}</span>
            </div>
          </div>
        </div>

        <!-- Legend -->
        <div class="flex items-center gap-4 mt-4 pt-3 border-t border-surface-border">
          <div class="flex items-center gap-1.5">
            <div class="w-3 h-3 rounded bg-gradient-to-t from-danger-500 to-danger-400" />
            <span class="text-xs text-slate-500 dark:text-zinc-400">Số lượng hụt</span>
          </div>
          <div class="flex items-center gap-1.5 ml-auto">
            <div class="w-4 border-t-2 border-dashed border-slate-300 dark:border-zinc-600" />
            <span class="text-xs text-slate-500 dark:text-zinc-400">Chuẩn ngành {{ INDUSTRY_AVG_LOSS_RATE }}%</span>
          </div>
        </div>
      </div>

      <!-- Most Lost Item Highlight -->
      <div class="card p-5 stagger-item" style="animation-delay: 260ms">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-sm font-semibold text-surface-foreground">Nguyên liệu hụt nhiều nhất</h2>
            <p class="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Top 5 nguyên liệu có hao hụt cao</p>
          </div>
          <div class="w-7 h-7 rounded-lg bg-danger-50 dark:bg-danger-900/20 flex items-center justify-center">
            <AlertTriangle class="w-4 h-4 text-danger-600 dark:text-danger-400" aria-hidden="true" />
          </div>
        </div>

        <div class="space-y-3">
          <div
            v-for="(entry, i) in lossByItem.slice(0, 5)"
            :key="entry.id"
            class="group"
          >
            <div class="flex items-center justify-between gap-2 mb-1.5">
              <div class="flex items-center gap-2.5 min-w-0">
                <span :class="[
                  'w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold flex-shrink-0 tabular-nums',
                  i === 0 ? 'bg-danger-100 text-danger-700 dark:bg-danger-900/40 dark:text-danger-300' :
                  i === 1 ? 'bg-warning-100 text-warning-700 dark:bg-warning-900/40 dark:text-warning-300' :
                  'bg-surface-hover text-slate-500 dark:text-zinc-400',
                ]">{{ i + 1 }}</span>
                <div class="min-w-0">
                  <p class="text-sm font-medium text-surface-foreground truncate">{{ entry.item?.name || 'Nguyên liệu' }}</p>
                  <p class="text-xs text-slate-400 dark:text-zinc-500">{{ entry.count }} lần hao hụt</p>
                </div>
              </div>
              <div class="text-right flex-shrink-0">
                <p class="text-sm font-bold text-danger-600 dark:text-danger-400 tabular-nums">{{ formatNumber(entry.total) }}</p>
                <p class="text-xs text-slate-400 dark:text-zinc-500">{{ entry.item?.unit || '' }}</p>
              </div>
            </div>
            <div class="h-1.5 rounded-full bg-surface-hover overflow-hidden ml-8.5">
              <div
                class="h-full rounded-full bg-gradient-to-r from-danger-500 to-danger-400 transition-all duration-500"
                :style="{ width: `${Math.min(100, (entry.total / Math.max(1, lossByItem[0]?.total || 1)) * 100)}%` }"
              />
            </div>
          </div>
        </div>

        <AppEmptyState v-if="lossByItem.length === 0" description="Không có dữ liệu hao hụt trong kỳ này." />
      </div>
    </div>

    <!-- Loss Breakdown Table by Item -->
    <div class="card p-5 mb-4 stagger-item" style="animation-delay: 320ms">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-secondary-50 dark:bg-secondary-900/20 flex items-center justify-center">
            <BarChart3 class="w-4 h-4 text-secondary-600 dark:text-secondary-400" aria-hidden="true" />
          </div>
          <div>
            <h2 class="text-sm font-semibold text-surface-foreground">Chi tiết hao hụt theo nguyên liệu</h2>
            <p class="text-xs text-slate-500 dark:text-zinc-400">Phân tích {{ lossByItem.length }} nguyên liệu trong {{ rangeDays }} ngày</p>
          </div>
        </div>
        <AppBadge color="danger" variant="soft">{{ lossByItem.length }} mục</AppBadge>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto -mx-5 px-5">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-surface-border text-left">
              <th class="pb-2.5 pr-3 font-medium text-xs text-slate-500 dark:text-zinc-400 whitespace-nowrap">Nguyên liệu</th>
              <th class="pb-2.5 px-3 font-medium text-xs text-slate-500 dark:text-zinc-400 text-right whitespace-nowrap">Số lần</th>
              <th class="pb-2.5 px-3 font-medium text-xs text-slate-500 dark:text-zinc-400 text-right whitespace-nowrap">Số lượng hụt</th>
              <th class="pb-2.5 px-3 font-medium text-xs text-slate-500 dark:text-zinc-400 text-right whitespace-nowrap hidden sm:table-cell">TB mỗi lần</th>
              <th class="pb-2.5 pl-3 font-medium text-xs text-slate-500 dark:text-zinc-400 text-right whitespace-nowrap">Tỷ lệ (%)</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(entry, i) in lossByItem"
              :key="entry.id"
              class="border-b border-surface-border/50 last:border-0 hover:bg-surface-hover/50 transition-colors stagger-item"
              :style="{ animationDelay: `${340 + i * 15}ms` }"
            >
              <td class="py-2.5 pr-3 text-surface-foreground font-medium whitespace-nowrap">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-lg bg-danger-50 dark:bg-danger-900/20 flex items-center justify-center flex-shrink-0">
                    <Package class="w-4 h-4 text-danger-600 dark:text-danger-400" aria-hidden="true" />
                  </div>
                  <span>{{ entry.item?.name || 'Nguyên liệu' }}</span>
                </div>
              </td>
              <td class="py-2.5 px-3 text-right tabular-nums text-surface-foreground">{{ entry.count }}</td>
              <td class="py-2.5 px-3 text-right tabular-nums font-medium text-danger-600 dark:text-danger-400">{{ formatNumber(entry.total) }} <span class="text-xs font-normal text-slate-400">{{ entry.item?.unit || '' }}</span></td>
              <td class="py-2.5 px-3 text-right tabular-nums text-slate-500 dark:text-zinc-400 hidden sm:table-cell">{{ formatNumber(Math.round(entry.total / entry.count)) }}</td>
              <td class="py-2.5 pl-3 text-right">
                <span :class="['inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold tabular-nums', lossRateColor(itemLossRate(entry.total))]">
                  {{ itemLossRate(entry.total) }}%
                </span>
              </td>
            </tr>
          </tbody>
          <!-- Footer totals -->
          <tfoot>
            <tr class="border-t-2 border-surface-border">
              <td class="pt-3 pr-3 font-semibold text-surface-foreground text-xs">TỔNG</td>
              <td class="pt-3 px-3 text-right font-bold tabular-nums text-surface-foreground">{{ totalLossEvents }}</td>
              <td class="pt-3 px-3 text-right font-bold tabular-nums text-danger-600 dark:text-danger-400">{{ formatNumber(totalQuantityLost) }}</td>
              <td class="pt-3 px-3 text-right font-medium tabular-nums text-slate-500 dark:text-zinc-400 hidden sm:table-cell">{{ totalLossEvents ? formatNumber(Math.round(totalQuantityLost / totalLossEvents)) : 0 }}</td>
              <td class="pt-3 pl-3 text-right">
                <span :class="['inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold tabular-nums', lossRateColor(lossRate)]">
                  {{ lossRate }}%
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <AppEmptyState v-if="lossByItem.length === 0" description="Không có dữ liệu hao hụt trong kỳ này." />
    </div>

    <!-- Recommendations -->
    <div class="card p-5 stagger-item" style="animation-delay: 380ms">
      <div class="flex items-center gap-2 mb-4">
        <div class="w-7 h-7 rounded-lg bg-accent-50 dark:bg-accent-900/20 flex items-center justify-center">
          <Sparkles class="w-4 h-4 text-accent-600 dark:text-accent-400" aria-hidden="true" />
        </div>
        <div>
          <h2 class="text-sm font-semibold text-surface-foreground flex items-center gap-2">
            Phân tích & Khuyến nghị
            <AppBadge color="accent" variant="soft" size="sm">AI</AppBadge>
          </h2>
          <p class="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Đề xuất tự động dựa trên dữ liệu hao hụt</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div
          v-for="(rec, i) in recommendations"
          :key="i"
          class="p-4 rounded-xl border border-surface-border hover:border-surface-border/80 hover:shadow-sm transition-all stagger-item"
          :style="{ animationDelay: `${420 + i * 50}ms` }"
        >
          <div class="flex items-start gap-3">
            <div :class="['w-9 h-9 rounded-lg flex items-center justify-center ring-1 flex-shrink-0', recColorMap[rec.color].bg, recColorMap[rec.color].ring]">
              <component :is="rec.icon" :class="['w-5 h-5', recColorMap[rec.color].text]" aria-hidden="true" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-surface-foreground">{{ rec.title }}</p>
              <p class="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">{{ rec.description }}</p>
              <div class="flex items-center gap-1.5 mt-2.5">
                <Lightbulb class="w-3.5 h-3.5 text-accent-500 flex-shrink-0" aria-hidden="true" />
                <span class="text-xs font-medium text-accent-600 dark:text-accent-400">{{ rec.action }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
