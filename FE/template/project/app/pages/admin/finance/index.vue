<script setup lang="ts">
import {
  Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Banknote, CreditCard, RotateCcw, ArrowUpFromLine, ArrowDownToLine,
  Download, BarChart3, FileText, Receipt, Scale, Users,
} from 'lucide-vue-next'
import { TransactionType } from '../../../core/enums'
import type { Transaction, Profile } from '../../../core/types'
import { mockTransactions, mockProfiles } from '../../../core/mock/data'

const { t } = useI18n()
const toast = useToast()
const router = useRouter()
const { formatVND, formatDate, formatNumber } = useFormat()
const { downloadCSV } = useExportCSV()

useHead({ title: `Tài chính - BunTech Admin` })
definePageMeta({ layout: 'admin' })

// ─── State ──────────────────────────────────────────────
const loading = ref(true)
const error = ref(false)
const rows = ref<Transaction[]>([...mockTransactions])
const profiles = ref<Profile[]>([...mockProfiles])

const search = ref('')
const typeFilter = ref<'ALL' | TransactionType>('ALL')
const sortBy = ref<'created_at' | 'amount'>('created_at')
const sortDirection = ref<'asc' | 'desc'>('desc')
const page = ref(1)
const limit = ref(10)
const rangeDays = ref<7 | 30 | 90>(30)

const debouncedSearch = useDebounce(search, 300)

onMounted(() => {
  setTimeout(() => { loading.value = false }, 400)
})

// ─── Filtered + sorted + paginated rows ───────────────────
const filteredRows = computed(() => {
  let result = rows.value
  const since = new Date(Date.now() - rangeDays.value * 86400000).toISOString()
  result = result.filter(r => r.created_at >= since)
  if (debouncedSearch.value) {
    const q = debouncedSearch.value.toLowerCase()
    result = result.filter(r =>
      (r.note || '').toLowerCase().includes(q) ||
      (r.user?.full_name || '').toLowerCase().includes(q),
    )
  }
  if (typeFilter.value !== 'ALL') {
    result = result.filter(r => r.type === typeFilter.value)
  }
  const sorted = [...result]
  sorted.sort((a, b) => {
    let cmp = 0
    if (sortBy.value === 'created_at') cmp = a.created_at.localeCompare(b.created_at)
    else cmp = a.amount - b.amount
    return sortDirection.value === 'asc' ? cmp : -cmp
  })
  return sorted
})

const total = computed(() => filteredRows.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)))

const pagedRows = computed(() => {
  const start = (page.value - 1) * limit.value
  return filteredRows.value.slice(start, start + limit.value)
})

watch([debouncedSearch, typeFilter, rangeDays], () => { page.value = 1 })

function toggleSort(col: 'created_at' | 'amount') {
  if (sortBy.value === col) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = col
    sortDirection.value = 'asc'
  }
}

function setRange(d: 7 | 30 | 90) {
  rangeDays.value = d
  page.value = 1
}
function setFilter(f: 'ALL' | TransactionType) {
  typeFilter.value = f
  page.value = 1
}

// ─── KPIs (computed from all transactions) ────────────────
const totalRevenue = computed(() =>
  rows.value
    .filter(r => r.type === TransactionType.PAYMENT)
    .reduce((s, r) => s + r.amount, 0),
)
const totalDebt = computed(() =>
  rows.value
    .filter(r => r.type === TransactionType.DEBT_INCREASE)
    .reduce((s, r) => s + r.amount, 0),
)
const totalCollected = computed(() =>
  rows.value
    .filter(r => r.type === TransactionType.DEBT_PAYMENT)
    .reduce((s, r) => s + r.amount, 0),
)
const outstandingDebt = computed(() => totalDebt.value - totalCollected.value)

const kpiCards = computed(() => [
  {
    label: 'Tổng doanh thu',
    value: formatVND(totalRevenue.value),
    icon: Banknote,
    accent: 'bg-gradient-to-r from-success-500 to-success-400',
    bg: 'bg-success-50 dark:bg-success-900/20',
    text: 'text-success-600 dark:text-success-400',
    ring: 'ring-success-100 dark:ring-success-900/30',
    trend: 12.4,
    trendUp: true,
  },
  {
    label: 'Tổng công nợ',
    value: formatVND(totalDebt.value),
    icon: CreditCard,
    accent: 'bg-gradient-to-r from-danger-500 to-danger-400',
    bg: 'bg-danger-50 dark:bg-danger-900/20',
    text: 'text-danger-600 dark:text-danger-400',
    ring: 'ring-danger-100 dark:ring-danger-900/30',
    trend: 5.2,
    trendUp: false,
  },
  {
    label: 'Đã thu hồi',
    value: formatVND(totalCollected.value),
    icon: ArrowUpFromLine,
    accent: 'bg-gradient-to-r from-info-500 to-info-400',
    bg: 'bg-info-50 dark:bg-info-900/20',
    text: 'text-info-600 dark:text-info-400',
    ring: 'ring-info-100 dark:ring-info-900/30',
    trend: 8.7,
    trendUp: true,
  },
  {
    label: 'Công nợ còn lại',
    value: formatVND(outstandingDebt.value),
    icon: Scale,
    accent: 'bg-gradient-to-r from-primary-500 to-primary-400',
    bg: 'bg-primary-50 dark:bg-primary-900/20',
    text: 'text-primary-600 dark:text-primary-400',
    ring: 'ring-primary-100 dark:ring-primary-900/30',
    trend: 15.3,
    trendUp: false,
  },
])

// ─── Cash Flow chart (last 7 days from mock data) ──────────
interface FlowDay { label: string; income: number; expense: number }
const cashFlow = computed<FlowDay[]>(() => {
  const now = new Date()
  const days: FlowDay[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000)
    const dateStr = d.toISOString().slice(0, 10)
    const dayTxns = rows.value.filter(r => r.created_at.slice(0, 10) === dateStr)
    const income = dayTxns
      .filter(r => r.type === TransactionType.PAYMENT || r.type === TransactionType.DEBT_PAYMENT)
      .reduce((s, r) => s + r.amount, 0)
    const expense = dayTxns
      .filter(r => r.type === TransactionType.REFUND || r.type === TransactionType.DEBT_INCREASE)
      .reduce((s, r) => s + r.amount, 0)
    days.push({
      label: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()],
      income,
      expense,
    })
  }
  // Ensure non-zero chart by adding baseline if all zero
  const hasData = days.some(d => d.income > 0 || d.expense > 0)
  if (!hasData) {
    return days.map((d, i) => ({
      ...d,
      income: [4200000, 5100000, 3800000, 6200000, 5400000, 7100000, 4800000][i],
      expense: [1800000, 2400000, 2100000, 2900000, 2600000, 3200000, 2300000][i],
    }))
  }
  return days
})

const maxFlow = computed(() => Math.max(...cashFlow.value.flatMap(d => [d.income, d.expense]), 1))

// ─── Top Debtors (top 5 customers with highest outstanding debt) ─
interface Debtor {
  id: string
  name: string
  avatar_url: string | null
  debt: number
  debt_limit: number
}
const topDebtors = computed<Debtor[]>(() => {
  const customers = profiles.value.filter(p => p.role === ('CUSTOMER' as unknown) || (p as Record<string, unknown>).role === 'CUSTOMER')
  const debtMap = new Map<string, number>()
  for (const tx of rows.value) {
    if (!tx.user_id) continue
    const current = debtMap.get(tx.user_id) || 0
    if (tx.type === TransactionType.DEBT_INCREASE) debtMap.set(tx.user_id, current + tx.amount)
    else if (tx.type === TransactionType.DEBT_PAYMENT) debtMap.set(tx.user_id, current - tx.amount)
  }
  return customers
    .map(c => ({
      id: c.id,
      name: c.full_name,
      avatar_url: c.avatar_url,
      debt: Math.max(0, debtMap.get(c.id) || 0),
      debt_limit: c.debt_limit,
    }))
    .filter(d => d.debt > 0)
    .sort((a, b) => b.debt - a.debt)
    .slice(0, 5)
})

const maxDebt = computed(() => Math.max(...topDebtors.value.map(d => d.debt_limit), 1))

function debtRatio(d: Debtor) {
  return Math.min(100, Math.round((d.debt / Math.max(1, d.debt_limit)) * 100))
}
function debtBarColor(d: Debtor) {
  const ratio = debtRatio(d)
  if (ratio >= 70) return 'bg-danger-500'
  if (ratio >= 40) return 'bg-warning-500'
  return 'bg-success-500'
}

// ─── Transaction type styling ───────────────────────────────
const typeMeta: Record<TransactionType, { color: 'success' | 'warning' | 'danger' | 'secondary'; icon: typeof Banknote; income: boolean }> = {
  [TransactionType.PAYMENT]: { color: 'success', icon: Banknote, income: true },
  [TransactionType.REFUND]: { color: 'warning', icon: RotateCcw, income: false },
  [TransactionType.DEBT_INCREASE]: { color: 'danger', icon: ArrowDownToLine, income: false },
  [TransactionType.DEBT_PAYMENT]: { color: 'secondary', icon: ArrowUpFromLine, income: true },
}

const typeLabels: Record<TransactionType, string> = {
  [TransactionType.PAYMENT]: 'Thanh toán',
  [TransactionType.REFUND]: 'Hoàn tiền',
  [TransactionType.DEBT_INCREASE]: 'Tăng nợ',
  [TransactionType.DEBT_PAYMENT]: 'Trả nợ',
}

const typePills = computed(() => [
  { key: 'ALL' as const, label: 'Tất cả', icon: Receipt },
  { key: TransactionType.PAYMENT, label: typeLabels[TransactionType.PAYMENT], icon: Banknote },
  { key: TransactionType.REFUND, label: typeLabels[TransactionType.REFUND], icon: RotateCcw },
  { key: TransactionType.DEBT_INCREASE, label: typeLabels[TransactionType.DEBT_INCREASE], icon: ArrowDownToLine },
  { key: TransactionType.DEBT_PAYMENT, label: typeLabels[TransactionType.DEBT_PAYMENT], icon: ArrowUpFromLine },
])

const rangeOptions = [
  { value: 7 as const, label: '7 ngày' },
  { value: 30 as const, label: '30 ngày' },
  { value: 90 as const, label: '90 ngày' },
]

function signedAmount(tx: Transaction): number {
  return typeMeta[tx.type].income ? tx.amount : -tx.amount
}

function onExportCSV() {
  if (!filteredRows.value.length) {
    toast.warning('Không có dữ liệu để xuất')
    return
  }
  const exportRows = filteredRows.value.map(r => ({
    'Mã GD': r.id,
    'Khách hàng': r.user?.full_name || '—',
    'Loại': typeLabels[r.type],
    'Số tiền': r.amount,
    'Ghi chú': r.note || '',
    'Ngày': formatDate(r.created_at),
  }))
  downloadCSV(exportRows, `giao-dich-${new Date().toISOString().slice(0, 10)}.csv`)
  toast.success('Đã xuất file CSV')
}

const columns = computed(() => [
  { key: 'user', label: 'Khách hàng' },
  { key: 'type', label: 'Loại giao dịch' },
  { key: 'amount', label: 'Số tiền', align: 'right' as const, sortable: true },
  { key: 'note', label: 'Ghi chú', hideOnMobile: true },
  { key: 'created_at', label: 'Ngày', sortable: true, hideOnMobile: true },
])
</script>

<template>
  <div>
    <AppPageHeader title="Tài chính" subtitle="Tổng quan dòng tiền và công nợ khách hàng" breadcrumb-label="Tài chính">
      <template #actions>
        <NuxtLink to="/admin/finance/pay-debt">
          <AppButton>
            <Wallet class="w-4 h-4" aria-hidden="true" /> Thanh toán nợ
          </AppButton>
        </NuxtLink>
      </template>
    </AppPageHeader>

    <AppErrorState v-if="error" message="Không thể tải giao dịch. Vui lòng thử lại." @retry="loading = false" />

    <template v-else>
      <!-- KPI Row -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <template v-if="loading">
          <div v-for="i in 4" :key="i" class="card p-5">
            <div class="flex items-center gap-3 mb-3">
              <AppSkeleton height="h-10" width="w-10" class="rounded-xl" />
              <div class="flex-1"><AppSkeleton height="h-3" width="w-16" /></div>
            </div>
            <AppSkeleton height="h-3" class="mb-2" />
            <AppSkeleton height="h-6" width="w-3/4" />
          </div>
        </template>
        <template v-else>
          <div
            v-for="(card, i) in kpiCards"
            :key="card.label"
            class="card card-hover p-5 stagger-item relative overflow-hidden group"
            :style="{ animationDelay: `${i * 40}ms` }"
          >
            <div :class="['kpi-accent', card.accent]" />
            <div class="flex items-start justify-between mb-2.5">
              <div :class="['w-10 h-10 rounded-xl flex items-center justify-center ring-1 transition-transform duration-200 group-hover:scale-110', card.bg, card.ring]">
                <component :is="card.icon" :class="['w-5 h-5', card.text]" aria-hidden="true" />
              </div>
              <span
                :class="[
                  'text-xs font-medium flex items-center gap-0.5 px-2 py-0.5 rounded-md',
                  card.trendUp
                    ? 'text-success-600 dark:text-success-400 bg-success-50 dark:bg-success-900/20'
                    : 'text-danger-600 dark:text-danger-400 bg-danger-50 dark:bg-danger-900/20',
                ]"
              >
                <component :is="card.trendUp ? ArrowUpRight : ArrowDownRight" class="w-3 h-3" aria-hidden="true" />
                {{ card.trend }}%
              </span>
            </div>
            <p class="text-[13px] text-slate-500 dark:text-zinc-400 mb-1 font-medium">{{ card.label }}</p>
            <p class="text-2xl font-bold text-surface-foreground tracking-tight tabular-nums">{{ card.value }}</p>
          </div>
        </template>
      </div>

      <!-- Cash Flow + Top Debtors -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <!-- Cash Flow Chart -->
        <div class="card p-5 lg:col-span-2 stagger-item" style="animation-delay: 160ms">
          <div class="flex items-center justify-between mb-5">
            <div>
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                  <BarChart3 class="w-4 h-4 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                </div>
                <h2 class="text-sm font-semibold text-surface-foreground">Dòng tiền 7 ngày</h2>
              </div>
              <p class="text-xs text-slate-500 dark:text-zinc-400 mt-1.5 ml-9">Thu vs Chi theo ngày</p>
            </div>
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-sm bg-success-500" aria-hidden="true" />
                <span class="text-xs text-slate-600 dark:text-zinc-300 font-medium">Thu</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-sm bg-danger-500" aria-hidden="true" />
                <span class="text-xs text-slate-600 dark:text-zinc-300 font-medium">Chi</span>
              </div>
            </div>
          </div>

          <div class="flex items-end justify-between gap-2 sm:gap-3 h-[200px] px-1">
            <div
              v-for="(day, i) in cashFlow"
              :key="i"
              class="flex-1 flex flex-col items-center gap-2 group relative"
            >
              <!-- Tooltip -->
              <div class="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 whitespace-nowrap">
                <div class="bg-slate-900 dark:bg-zinc-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg">
                  <div class="font-medium mb-1">{{ day.label }}</div>
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-sm bg-success-400" />
                    <span class="text-success-300">Thu:</span>
                    <span class="font-semibold tabular-nums">{{ formatVND(day.income) }}</span>
                  </div>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span class="w-2 h-2 rounded-sm bg-danger-400" />
                    <span class="text-danger-300">Chi:</span>
                    <span class="font-semibold tabular-nums">{{ formatVND(day.expense) }}</span>
                  </div>
                </div>
                <div class="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-slate-900 dark:bg-zinc-800 rotate-45 -mt-1" />
              </div>

              <!-- Bars -->
              <div class="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-[160px]">
                <div class="w-1/2 flex items-end h-full">
                  <div
                    class="w-full rounded-t-md bg-gradient-to-t from-success-500 to-success-400 transition-all duration-300 group-hover:from-success-600 group-hover:to-success-500"
                    :style="{ height: `${Math.max(4, (day.income / maxFlow) * 100)}%` }"
                    :aria-label="`Thu ${day.label}: ${formatVND(day.income)}`"
                  />
                </div>
                <div class="w-1/2 flex items-end h-full">
                  <div
                    class="w-full rounded-t-md bg-gradient-to-t from-danger-500 to-danger-400 transition-all duration-300 group-hover:from-danger-600 group-hover:to-danger-500"
                    :style="{ height: `${Math.max(4, (day.expense / maxFlow) * 100)}%` }"
                    :aria-label="`Chi ${day.label}: ${formatVND(day.expense)}`"
                  />
                </div>
              </div>
              <span class="text-[11px] font-medium text-slate-500 dark:text-zinc-400">{{ day.label }}</span>
            </div>
          </div>
        </div>

        <!-- Top Debtors -->
        <div class="card p-5 stagger-item" style="animation-delay: 200ms">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-danger-50 dark:bg-danger-900/20 flex items-center justify-center">
                <Users class="w-4 h-4 text-danger-600 dark:text-danger-400" aria-hidden="true" />
              </div>
              <h2 class="text-sm font-semibold text-surface-foreground">Nợ nhiều nhất</h2>
            </div>
            <NuxtLink to="/admin/customers" class="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium flex items-center gap-0.5">
              Tất cả <ArrowUpRight class="w-3 h-3" aria-hidden="true" />
            </NuxtLink>
          </div>
          <template v-if="loading">
            <div v-for="i in 5" :key="i" class="flex items-center gap-3 py-2">
              <AppSkeleton height="h-8" width="w-8" class="rounded-full" />
              <div class="flex-1">
                <AppSkeleton height="h-3.5" class="mb-1" />
                <AppSkeleton height="h-3" width="w-1/2" />
              </div>
            </div>
          </template>
          <template v-else>
            <div class="space-y-3">
              <div
                v-for="(debtor, i) in topDebtors"
                :key="debtor.id"
                class="group"
              >
                <div class="flex items-center gap-3 mb-1.5">
                  <div class="relative">
                    <AppAvatar :name="debtor.name" :src="debtor.avatar_url" size="sm" />
                    <span :class="[
                      'absolute -bottom-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center ring-2 ring-surface',
                      i === 0 ? 'bg-danger-500 text-white' : i === 1 ? 'bg-warning-500 text-white' : 'bg-slate-300 dark:bg-zinc-600 text-white',
                    ]">{{ i + 1 }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-surface-foreground truncate">{{ debtor.name }}</p>
                    <p class="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">{{ formatVND(debtor.debt) }}</p>
                  </div>
                  <span class="text-xs font-semibold tabular-nums flex-shrink-0" :class="debtRatio(debtor) >= 70 ? 'text-danger-600 dark:text-danger-400' : 'text-slate-500 dark:text-zinc-400'">
                    {{ debtRatio(debtor) }}%
                  </span>
                </div>
                <div class="h-1.5 rounded-full bg-surface-hover overflow-hidden ml-11">
                  <div
                    :class="['h-full rounded-full transition-all duration-500', debtBarColor(debtor)]"
                    :style="{ width: `${debtRatio(debtor)}%` }"
                  />
                </div>
              </div>
            </div>
            <AppEmptyState v-if="topDebtors.length === 0" description="Không có khách hàng nợ." />
          </template>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 stagger-item" style="animation-delay: 240ms">
        <NuxtLink to="/admin/finance/pay-debt" class="card card-hover p-4 flex items-center gap-3 group">
          <div class="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105">
            <Wallet class="w-5 h-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-surface-foreground">Thu tiền nợ</p>
            <p class="text-xs text-slate-500 dark:text-zinc-400">Ghi nhận khách trả nợ</p>
          </div>
          <ArrowUpRight class="w-4 h-4 text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" aria-hidden="true" />
        </NuxtLink>

        <button type="button" class="card card-hover p-4 flex items-center gap-3 group text-left" @click="onExportCSV">
          <div class="w-10 h-10 rounded-lg bg-success-50 dark:bg-success-900/20 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105">
            <Download class="w-5 h-5 text-success-600 dark:text-success-400" aria-hidden="true" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-surface-foreground">Xuất CSV</p>
            <p class="text-xs text-slate-500 dark:text-zinc-400">Tải danh sách giao dịch</p>
          </div>
          <ArrowUpRight class="w-4 h-4 text-slate-400 group-hover:text-success-600 dark:group-hover:text-success-400 transition-colors" aria-hidden="true" />
        </button>

        <NuxtLink to="/admin/finance/reports" class="card card-hover p-4 flex items-center gap-3 group">
          <div class="w-10 h-10 rounded-lg bg-info-50 dark:bg-info-900/20 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105">
            <FileText class="w-5 h-5 text-info-600 dark:text-info-400" aria-hidden="true" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-surface-foreground">Báo cáo tài chính</p>
            <p class="text-xs text-slate-500 dark:text-zinc-400">Xem báo cáo chi tiết</p>
          </div>
          <ArrowUpRight class="w-4 h-4 text-slate-400 group-hover:text-info-600 dark:group-hover:text-info-400 transition-colors" aria-hidden="true" />
        </NuxtLink>
      </div>

      <!-- Toolbar: search + type pills -->
      <AppToolbar>
        <template #search>
          <AppSearchBar v-model="search" placeholder="Tìm giao dịch theo ghi chú hoặc khách hàng..." />
        </template>
        <template #filters>
          <div class="flex flex-wrap items-center gap-1.5" role="group" aria-label="Lọc theo loại giao dịch">
            <button
              v-for="pill in typePills"
              :key="pill.key"
              type="button"
              :class="[
                'inline-flex items-center gap-1.5 px-3 h-8 rounded-lg text-[13px] font-medium transition-all border',
                typeFilter === pill.key
                  ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                  : 'bg-surface text-slate-600 dark:text-zinc-300 border-surface-border hover:bg-surface-hover',
              ]"
              @click="setFilter(pill.key)"
            >
              <component :is="pill.icon" class="w-3.5 h-3.5" aria-hidden="true" />
              {{ pill.label }}
            </button>
          </div>
        </template>
      </AppToolbar>

      <!-- Transactions Table -->
      <div class="animate-fade-in-up" style="animation-delay: 100ms">
        <AppTable
          :columns="columns"
          :rows="pagedRows as unknown as Record<string, unknown>[]"
          :loading="loading"
          :sort-by="sortBy"
          :sort-direction="sortDirection"
          row-key="id"
          :empty-title="typeFilter === 'ALL' ? 'Chưa có giao dịch nào' : 'Không tìm thấy giao dịch'"
          :empty-description="typeFilter === 'ALL' ? 'Giao dịch sẽ hiển thị tại đây khi có hoạt động.' : 'Thử đổi bộ lọc hoặc từ khóa tìm kiếm.'"
          @sort="toggleSort"
        >
          <template #cell-user="{ row }">
            <div class="flex items-center gap-2.5">
              <AppAvatar :name="(row as Transaction).user?.full_name || 'Khách'" :src="(row as Transaction).user?.avatar_url || null" size="sm" />
              <div class="min-w-0">
                <p class="text-sm font-medium text-surface-foreground truncate">{{ (row as Transaction).user?.full_name || 'Khách vãng lai' }}</p>
                <p class="text-xs text-slate-500 dark:text-zinc-400 truncate">{{ (row as Transaction).user?.phone || '—' }}</p>
              </div>
            </div>
          </template>

          <template #cell-type="{ value }">
            <div class="inline-flex items-center gap-2">
              <div
                :class="[
                  'w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0',
                  typeMeta[value as TransactionType].color === 'success' ? 'bg-success-50 dark:bg-success-900/20' :
                  typeMeta[value as TransactionType].color === 'warning' ? 'bg-warning-50 dark:bg-warning-900/20' :
                  typeMeta[value as TransactionType].color === 'danger' ? 'bg-danger-50 dark:bg-danger-900/20' :
                  'bg-secondary-50 dark:bg-secondary-900/20',
                ]"
              >
                <component
                  :is="typeMeta[value as TransactionType].icon"
                  :class="[
                    'w-3.5 h-3.5',
                    typeMeta[value as TransactionType].color === 'success' ? 'text-success-600 dark:text-success-400' :
                    typeMeta[value as TransactionType].color === 'warning' ? 'text-warning-600 dark:text-warning-400' :
                    typeMeta[value as TransactionType].color === 'danger' ? 'text-danger-600 dark:text-danger-400' :
                    'text-secondary-600 dark:text-secondary-400',
                  ]"
                  aria-hidden="true"
                />
              </div>
              <AppBadge :color="typeMeta[value as TransactionType].color" variant="soft">{{ typeLabels[value as TransactionType] }}</AppBadge>
            </div>
          </template>

          <template #cell-amount="{ row }">
            <span
              :class="[
                'font-semibold tabular-nums',
                signedAmount(row as Transaction) >= 0
                  ? 'text-success-600 dark:text-success-400'
                  : 'text-danger-600 dark:text-danger-400',
              ]"
            >
              {{ signedAmount(row as Transaction) >= 0 ? '+' : '−' }}{{ formatVND(Math.abs(signedAmount(row as Transaction))) }}
            </span>
          </template>

          <template #cell-note="{ value }">
            <span class="text-sm text-slate-500 dark:text-zinc-400 truncate inline-block max-w-[220px]">{{ value || '—' }}</span>
          </template>

          <template #cell-created_at="{ value }">
            <span class="text-sm text-slate-500 dark:text-zinc-400 tabular-nums">{{ formatDate(value as string) }}</span>
          </template>

          <!-- Mobile card -->
          <template #mobile-row="{ row }">
            <div class="space-y-2.5">
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2.5 min-w-0">
                  <AppAvatar :name="(row as Transaction).user?.full_name || 'Khách'" :src="(row as Transaction).user?.avatar_url || null" size="sm" />
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-surface-foreground truncate">{{ (row as Transaction).user?.full_name || 'Khách vãng lai' }}</p>
                    <p class="text-xs text-slate-500 dark:text-zinc-400">{{ (row as Transaction).user?.phone || '—' }}</p>
                  </div>
                </div>
                <span
                  :class="[
                    'font-semibold text-sm tabular-nums flex-shrink-0',
                    signedAmount(row as Transaction) >= 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400',
                  ]"
                >
                  {{ signedAmount(row as Transaction) >= 0 ? '+' : '−' }}{{ formatVND(Math.abs(signedAmount(row as Transaction))) }}
                </span>
              </div>
              <div class="flex items-center justify-between gap-2">
                <AppBadge :color="typeMeta[(row as Transaction).type].color" variant="soft" :dot="true">
                  {{ typeLabels[(row as Transaction).type] }}
                </AppBadge>
                <span class="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">{{ formatDate((row as Transaction).created_at) }}</span>
              </div>
              <p v-if="(row as Transaction).note" class="text-xs text-slate-500 dark:text-zinc-400 italic">{{ (row as Transaction).note }}</p>
            </div>
          </template>

          <template #pagination>
            <AppPagination
              :page="page"
              :total-pages="totalPages"
              :total="total"
              :from="total === 0 ? 0 : (page - 1) * limit + 1"
              :to="Math.min(page * limit, total)"
              :limit="limit"
              @update:page="page = $event"
              @update:limit="limit = $event; page = 1"
            />
          </template>
        </AppTable>
      </div>
    </template>
  </div>
</template>
