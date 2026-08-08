<script setup lang="ts">
import { TransactionType } from '~/utils/enums'
import { mockTransactions, mockCustomers, mockOrders } from '~/utils/mockData'
import type { Transaction } from '~/utils/types'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Tài chính - BunTech Admin' })

const { formatVND, formatDate } = useFormat()
const toast = useToast()

// ─── State ────────────────────────────────────────────────
const loading = ref(true)
const search = ref('')
const typeFilter = ref<string>('ALL')
const page = ref(1)
const perPage = ref(10)

// ─── Computed KPIs ────────────────────────────────────────
const totalRevenue = computed(() =>
  mockTransactions.filter(t => t.type === TransactionType.PAYMENT).reduce((s, t) => s + t.amount, 0)
)
const totalDebt = computed(() =>
  mockTransactions.filter(t => t.type === TransactionType.DEBT_INCREASE).reduce((s, t) => s + t.amount, 0)
)
const totalCollected = computed(() =>
  mockTransactions.filter(t => t.type === TransactionType.DEBT_PAYMENT).reduce((s, t) => s + t.amount, 0)
)
const debtRemaining = computed(() => totalDebt.value - totalCollected.value)

const kpiStats = computed(() => [
  { title: 'Tổng doanh thu', value: formatVND(totalRevenue.value), icon: 'i-lucide-wallet', color: 'primary' as const, trend: { value: 12.4, isPositive: true } },
  { title: 'Tổng công nợ', value: formatVND(totalDebt.value), icon: 'i-lucide-credit-card', color: 'error' as const, trend: { value: 5.2, isPositive: false } },
  { title: 'Đã thu hồi', value: formatVND(totalCollected.value), icon: 'i-lucide-trending-up', color: 'success' as const, trend: { value: 8.7, isPositive: true } },
  { title: 'Công nợ còn lại', value: formatVND(debtRemaining.value), icon: 'i-lucide-alert-circle', color: 'warning' as const, trend: { value: 15.3, isPositive: false } },
])

// ─── Top debtors ──────────────────────────────────────────
const topDebtors = computed(() => {
  const debtMap = new Map<string, { name: string; avatar: string; total: number }>()
  for (const t of mockTransactions) {
    if (t.type === TransactionType.DEBT_INCREASE && t.user) {
      const existing = debtMap.get(t.user.id)
      if (existing) {
        existing.total += t.amount
      } else {
        debtMap.set(t.user.id, { name: t.user.full_name, avatar: t.user.avatar_url || '', total: t.amount })
      }
    }
  }
  const arr = Array.from(debtMap.values()).sort((a, b) => b.total - a.total).slice(0, 5)
  const max = arr[0]?.total || 1
  return arr.map(d => ({ ...d, percent: Math.round((d.total / max) * 100) }))
})

// ─── Cashflow chart data (7 days) ─────────────────────────
const cashflowData = computed(() => {
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
  const deterministicData = [
    { income: 4200000, expense: 2100000 },
    { income: 3800000, expense: 1500000 },
    { income: 5100000, expense: 3200000 },
    { income: 2900000, expense: 1800000 },
    { income: 4600000, expense: 2500000 },
    { income: 5500000, expense: 2800000 },
    { income: 4900000, expense: 1900000 },
  ]
  return days.map((label, i) => ({
    label,
    ...deterministicData[i],
  }))
})

// ─── Filter & Pagination ─────────────────────────────────
const typePills = computed(() => {
  const counts = {
    ALL: mockTransactions.length,
    PAYMENT: mockTransactions.filter(t => t.type === TransactionType.PAYMENT).length,
    REFUND: mockTransactions.filter(t => t.type === TransactionType.REFUND).length,
    DEBT_INCREASE: mockTransactions.filter(t => t.type === TransactionType.DEBT_INCREASE).length,
    DEBT_PAYMENT: mockTransactions.filter(t => t.type === TransactionType.DEBT_PAYMENT).length,
  }
  return [
    { accessorKey: 'ALL', header: 'Tất cả', icon: 'i-lucide-list', count: counts.ALL },
    { accessorKey: 'PAYMENT', header: 'Thanh toán', icon: 'i-lucide-banknote', count: counts.PAYMENT },
    { accessorKey: 'REFUND', header: 'Hoàn tiền', icon: 'i-lucide-undo-2', count: counts.REFUND },
    { accessorKey: 'DEBT_INCREASE', header: 'Tăng nợ', icon: 'i-lucide-arrow-down-left', count: counts.DEBT_INCREASE },
    { accessorKey: 'DEBT_PAYMENT', header: 'Trả nợ', icon: 'i-lucide-arrow-up-right', count: counts.DEBT_PAYMENT },
  ]
})

const transactionTypeLabel: Record<string, string> = {
  PAYMENT: 'Thanh toán',
  REFUND: 'Hoàn tiền',
  DEBT_INCREASE: 'Tăng nợ',
  DEBT_PAYMENT: 'Trả nợ',
}

const transactionTypeColor: Record<string, 'success' | 'error' | 'warning' | 'info'> = {
  PAYMENT: 'success',
  REFUND: 'error',
  DEBT_INCREASE: 'error',
  DEBT_PAYMENT: 'success',
}

const filteredTransactions = computed(() => {
  let list = [...mockTransactions]
  if (typeFilter.value !== 'ALL') {
    list = list.filter(t => t.type === typeFilter.value)
  }
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(t =>
      t.user?.full_name.toLowerCase().includes(q) ||
      t.note.toLowerCase().includes(q)
    )
  }
  return list
})

const totalPages = computed(() => Math.ceil(filteredTransactions.value.length / perPage.value))
const pagedTransactions = computed(() => {
  const start = (page.value - 1) * perPage.value
  return filteredTransactions.value.slice(start, start + perPage.value)
})

const columns = [
  { accessorKey: 'user', header: 'Khách hàng' },
  { accessorKey: 'type', header: 'Loại giao dịch' },
  { accessorKey: 'amount', header: 'Số tiền' },
  { accessorKey: 'note', header: 'Ghi chú' },
  { accessorKey: 'created_at', header: 'Ngày' },
]

// ─── Quick actions ────────────────────────────────────────
const quickActions = [
  { icon: 'i-lucide-wallet', label: 'Thu tiền nợ', description: 'Ghi nhận khách trả nợ', to: '/admin/debt/pay' },
  { icon: 'i-lucide-download', label: 'Xuất CSV', description: 'Tải danh sách giao dịch' },
  { icon: 'i-lucide-file-bar-chart', label: 'Báo cáo tài chính', description: 'Xem báo cáo chi tiết' },
]

function handleQuickAction(action: typeof quickActions[0]) {
  if (action.to) {
    navigateTo(action.to)
  } else {
    toast.add({ title: action.label, description: 'Tính năng đang phát triển', color: 'info' })
  }
}

// ─── Lifecycle ────────────────────────────────────────────
onMounted(() => {
  setTimeout(() => { loading.value = false }, 300)
})
</script>

<template>
  <div>
    <BasePageHeader
      title="Tài chính"
      description="Tổng quan dòng tiền và công nợ khách hàng"
      :breadcrumbs="[{ label: 'Trang chủ', to: '/admin', icon: 'i-lucide-home' }, { label: 'Tài chính' }]"
    >
      <template #actions>
        <UButton to="/admin/debt/pay">
          <UIcon name="i-lucide-wallet" class="w-4 h-4 mr-1" /> Thanh toán nợ
        </UButton>
      </template>
    </BasePageHeader>

    <template v-if="loading">
      <BasePageLoading />
    </template>

    <template v-else>
      <!-- KPI Stats -->
      <div class="mb-6">
        <BaseStatsGrid :stats="kpiStats" />
      </div>

      <!-- Chart + Top Debtors -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <!-- Cashflow Chart -->
        <div class="lg:col-span-2 card p-5 stagger-item" style="animation-delay: 200ms">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-bar-chart-3" class="w-5 h-5 text-primary-500" />
              <h3 class="text-sm font-semibold text-surface-foreground">Dòng tiền 7 ngày</h3>
            </div>
            <div class="flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-400">
              <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-success-500" /> Thu</span>
              <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-error-500" /> Chi</span>
            </div>
          </div>
          <div class="flex items-end gap-2 h-48">
            <div
              v-for="(day, i) in cashflowData"
              :key="i"
              class="flex-1 flex flex-col items-center gap-1"
            >
              <div class="w-full flex gap-0.5 items-end h-40">
                <div
                  class="flex-1 rounded-t-md bg-success-500/80 transition-all duration-500"
                  :style="{ height: `${(day.income / 6000000) * 100}%`, animationDelay: `${i * 60}ms` }"
                />
                <div
                  class="flex-1 rounded-t-md bg-error-500/60 transition-all duration-500"
                  :style="{ height: `${(day.expense / 6000000) * 100}%`, animationDelay: `${i * 60 + 30}ms` }"
                />
              </div>
              <span class="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">{{ day.label }}</span>
            </div>
          </div>
        </div>

        <!-- Top Debtors Panel -->
        <div class="card p-5 stagger-item" style="animation-delay: 280ms">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-alert-triangle" class="w-4 h-4 text-error-500" />
              <h3 class="text-sm font-semibold text-surface-foreground">Nợ nhiều nhất</h3>
            </div>
            <NuxtLink to="/admin/customers" class="text-xs text-primary-500 hover:text-primary-600 transition-colors">
              Tất cả →
            </NuxtLink>
          </div>
          <div class="space-y-3.5">
            <div
              v-for="(debtor, i) in topDebtors"
              :key="i"
              class="flex items-center gap-3 group animate-fade-in-up"
              :style="{ animationDelay: `${i * 60 + 300}ms` }"
            >
              <UAvatar :src="debtor.avatar" :alt="debtor.name" size="sm" />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-surface-foreground truncate">{{ debtor.name }}</p>
                <p class="text-xs text-error-500 dark:text-error-400 tabular-nums">{{ formatVND(debtor.total) }}</p>
              </div>
              <div class="w-16 flex items-center gap-1">
                <div class="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-700"
                    :class="debtor.percent >= 80 ? 'bg-error-500' : debtor.percent >= 50 ? 'bg-warning-500' : 'bg-primary-500'"
                    :style="{ width: `${debtor.percent}%` }"
                  />
                </div>
                <span class="text-[10px] font-medium text-slate-400 tabular-nums w-8 text-right">{{ debtor.percent }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <button
          v-for="(action, i) in quickActions"
          :key="i"
          class="card card-hover p-4 flex items-center gap-3 text-left transition-all duration-200 hover:shadow-md stagger-item"
          :style="{ animationDelay: `${360 + i * 60}ms` }"
          @click="handleQuickAction(action)"
        >
          <div class="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center ring-1 ring-primary-100 dark:ring-primary-900/30 flex-shrink-0">
            <UIcon :name="action.icon" class="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-surface-foreground">{{ action.label }}</p>
            <p class="text-xs text-slate-500 dark:text-zinc-400 truncate">{{ action.description }}</p>
          </div>
          <UIcon name="i-lucide-arrow-right" class="w-4 h-4 text-slate-400 dark:text-zinc-500 flex-shrink-0" />
        </button>
      </div>

      <!-- Filter pills -->
      <div class="flex items-center gap-2 mb-4 overflow-x-auto pb-1 stagger-item" style="animation-delay: 500ms">
        <UButton
          v-for="pill in typePills"
          :key="pill.key"
          :variant="typeFilter === pill.key ? 'solid' : 'soft'"
          :color="typeFilter === pill.key ? 'primary' : 'neutral'"
          size="sm"
          class="whitespace-nowrap"
          @click="typeFilter = pill.key; page = 1"
        >
          <UIcon :name="pill.icon" class="w-3.5 h-3.5 mr-1" />
          {{ pill.label }}
          <UBadge color="neutral" variant="subtle" size="sm" class="ml-1">{{ pill.count }}</UBadge>
        </UButton>
      </div>

      <!-- Search -->
      <div class="flex items-center gap-3 mb-4 animate-fade-in-up" style="animation-delay: 540ms">
        <div class="flex-1 max-w-md">
          <UInput v-model="search" icon="i-lucide-search" placeholder="Tìm giao dịch theo ghi chú hoặc khách hàng..." />
        </div>
      </div>

      <!-- Table -->
      <div class="animate-fade-in-up bg-surface ring-1 ring-surface-border rounded-xl overflow-hidden" style="animation-delay: 580ms">
        <UTable :columns="columns" :data="pagedTransactions">
          <template #user-cell="{ row }">
            <div class="flex items-center gap-2">
              <UAvatar
                :alt="row.original.user?.full_name || 'Khách'"
                :src="row.original.user?.avatar_url"
                size="sm"
              />
              <div>
                <p class="text-sm font-medium text-surface-foreground">{{ row.original.user?.full_name || 'Khách' }}</p>
                <p class="text-xs text-slate-400 dark:text-zinc-500">{{ row.original.user?.phone || '' }}</p>
              </div>
            </div>
          </template>

          <template #type-cell="{ row }">
            <UBadge
              :color="transactionTypeColor[row.original.type] || 'neutral'"
              variant="subtle"
              size="sm"
            >
              <UIcon
                :name="row.original.type === TransactionType.DEBT_INCREASE ? 'i-lucide-arrow-down-left'
                  : row.original.type === TransactionType.DEBT_PAYMENT ? 'i-lucide-arrow-up-right'
                  : row.original.type === TransactionType.PAYMENT ? 'i-lucide-banknote'
                  : 'i-lucide-undo-2'"
                class="w-3.5 h-3.5 mr-1"
              />
              {{ transactionTypeLabel[row.original.type] || row.original.type }}
            </UBadge>
          </template>

          <template #amount-cell="{ row }">
            <span
              :class="[
                'font-semibold tabular-nums',
                row.original.type === TransactionType.DEBT_INCREASE || row.original.type === TransactionType.REFUND
                  ? 'text-error-600 dark:text-error-400'
                  : 'text-success-600 dark:text-success-400',
              ]"
            >
              {{ row.original.type === TransactionType.DEBT_INCREASE || row.original.type === TransactionType.REFUND ? '-' : '+' }}{{ formatVND(row.original.amount) }}
            </span>
          </template>

          <template #note-cell="{ row }">
            <span class="text-sm text-slate-600 dark:text-zinc-300">{{ row.original.note }}</span>
          </template>

          <template #created_at-cell="{ row }">
            <span class="text-sm text-slate-500 dark:text-zinc-400 tabular-nums">{{ formatDate(row.original.created_at) }}</span>
          </template>
        </UTable>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-surface-border">
          <span class="text-sm text-slate-500 dark:text-zinc-400 tabular-nums">
            {{ (page - 1) * perPage + 1 }}-{{ Math.min(page * perPage, filteredTransactions.length) }} / {{ filteredTransactions.length }}
          </span>
          <UPagination v-model="page" :total="filteredTransactions.length" :items-per-page="perPage" />
        </div>
      </div>
    </template>
  </div>
</template>
