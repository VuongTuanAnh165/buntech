<script setup lang="ts">
import { transactionService } from '~/services/transactionService'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Tài chính - BunTech Admin' })
const toast = useToast()

// ─── State ────────────────────────────────────────────────
const search = ref('')
const typeFilter = ref<string>('ALL')
const page = ref(1)
const perPage = ref(20)

// ─── Data Fetching ────────────────────────────────────────
const { data: debtSummary, status: debtStatus } = useAsyncData('debt-summary', async () => {
  const res = await transactionService.getDebtSummary()
  return res.data
})

const { data: txData, status: txStatus } = useAsyncData(
  'transactions',
  async () => {
    const res = await transactionService.getTransactions(
      page.value,
      perPage.value,
      typeFilter.value === 'ALL' ? undefined : typeFilter.value,
      undefined,
      search.value
    )
    return res.data
  },
  { watch: [page, typeFilter, search] }
)

watch(search, () => {
  page.value = 1
})

const loading = computed(() => debtStatus.value === 'pending')

// ─── Computed KPIs ────────────────────────────────────────
const totalDebt = computed(() => debtSummary.value?.totalDebt || 0)
const totalRevenue = ref(0)
const totalCollected = ref(0)
const debtRemaining = computed(() => totalDebt.value)

const kpiStats = computed(() => [
  {
    title: 'Tổng doanh thu',
    value: formatVND(totalRevenue.value),
    icon: 'i-lucide-wallet',
    color: 'primary' as const,
    trend: { value: 0, isPositive: true }
  },
  {
    title: 'Tổng công nợ',
    value: formatVND(totalDebt.value),
    icon: 'i-lucide-credit-card',
    color: 'error' as const,
    trend: { value: 0, isPositive: false }
  },
  {
    title: 'Đã thu hồi',
    value: formatVND(totalCollected.value),
    icon: 'i-lucide-trending-up',
    color: 'success' as const,
    trend: { value: 0, isPositive: true }
  },
  {
    title: 'Công nợ còn lại',
    value: formatVND(debtRemaining.value),
    icon: 'i-lucide-alert-circle',
    color: 'warning' as const,
    trend: { value: 0, isPositive: false }
  }
])

// ─── Top debtors ──────────────────────────────────────────
const topDebtors = computed(() => {
  const debtors = debtSummary.value?.topDebtors || []
  const max = debtors[0]?.current_debt || 1
  return debtors.map((d) => ({
    name: d.full_name,
    avatar: d.avatar_url || '',
    total: d.current_debt || 0,
    percent: Math.round(((d.current_debt || 0) / max) * 100)
  }))
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
    { income: 4900000, expense: 1900000 }
  ]
  return days.map((label, i) => ({
    label,
    ...deterministicData[i]
  }))
})

// ─── Filter & Pagination ─────────────────────────────────
const typePills = computed(() => {
  return [
    { accessorKey: 'ALL', header: 'Tất cả', icon: 'i-lucide-list' },
    {
      accessorKey: 'payment',
      header: 'Thanh toán',
      icon: 'i-lucide-banknote'
    },
    { accessorKey: 'order_payment', header: 'Thanh toán đơn', icon: 'i-lucide-shopping-cart' },
    {
      accessorKey: 'order_charge',
      header: 'Ghi nợ đơn',
      icon: 'i-lucide-arrow-down-left'
    },
    {
      accessorKey: 'debt_record',
      header: 'Ghi nhận nợ',
      icon: 'i-lucide-arrow-down-left'
    },
    {
      accessorKey: 'debt_payment',
      header: 'Trả nợ',
      icon: 'i-lucide-arrow-up-right'
    }
  ]
})

const transactionTypeLabel: Record<string, string> = {
  payment: 'Thanh toán',
  order_payment: 'Thanh toán đơn',
  order_charge: 'Ghi nợ đơn',
  debt_record: 'Ghi nhận nợ',
  debt_payment: 'Trả nợ'
}

const transactionTypeColor: Record<string, 'success' | 'error' | 'warning' | 'info'> = {
  payment: 'success',
  order_payment: 'success',
  order_charge: 'error',
  debt_record: 'error',
  debt_payment: 'success'
}

const filteredTransactions = computed(() => txData.value?.data || [])

const totalItems = computed(() => txData.value?.meta.total || 0)

const columns = [
  { accessorKey: 'user', header: 'Khách hàng' },
  { accessorKey: 'type', header: 'Loại giao dịch' },
  { accessorKey: 'amount', header: 'Số tiền' },
  { accessorKey: 'referenceCode', header: 'Mã tham chiếu' },
  { accessorKey: 'createdAt', header: 'Ngày' }
]

// ─── Quick actions ────────────────────────────────────────
const quickActions = [
  {
    icon: 'i-lucide-wallet',
    label: 'Thu tiền nợ',
    description: 'Ghi nhận khách trả nợ',
    to: '/admin/debt/pay'
  },
  { icon: 'i-lucide-download', label: 'Xuất CSV', description: 'Tải danh sách giao dịch' },
  {
    icon: 'i-lucide-file-bar-chart',
    label: 'Báo cáo tài chính',
    description: 'Xem báo cáo chi tiết'
  }
]

function handleQuickAction(action: (typeof quickActions)[0]) {
  if (action.to) {
    navigateTo(action.to)
  } else {
    toast.add({ title: action.label, description: 'Tính năng đang phát triển', color: 'info' })
  }
}

function setFilter(filterKey: string) {
  typeFilter.value = filterKey
  page.value = 1
}
</script>
<template>
  <div>
    <BasePageHeader
      title="Tài chính"
      description="Tổng quan dòng tiền và công nợ khách hàng"
      :breadcrumbs="[
        { label: 'Trang chủ', to: '/admin', icon: 'i-lucide-home' },
        { label: 'Tài chính' }
      ]"
    >
      <template #actions>
        <UButton to="/admin/debt/pay">
          <UIcon name="i-lucide-wallet" class="mr-1 h-4 w-4" /> Thanh toán nợ
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
      <div class="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <!-- Cashflow Chart -->
        <div class="card stagger-item p-5 lg:col-span-2" style="animation-delay: 200ms">
          <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-bar-chart-3" class="text-primary-500 h-5 w-5" />
              <h3 class="text-surface-foreground text-sm font-semibold">Dòng tiền 7 ngày</h3>
            </div>
            <div class="flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-400">
              <span class="flex items-center gap-1"
                ><span class="bg-success-500 h-2 w-2 rounded-full" /> Thu</span
              >
              <span class="flex items-center gap-1"
                ><span class="bg-error-500 h-2 w-2 rounded-full" /> Chi</span
              >
            </div>
          </div>
          <div class="flex h-48 items-end gap-2">
            <div
              v-for="(day, i) in cashflowData"
              :key="i"
              class="flex flex-1 flex-col items-center gap-1"
            >
              <div class="flex h-40 w-full items-end gap-0.5">
                <div
                  class="bg-success-500/80 flex-1 rounded-t-md transition-all duration-500"
                  :style="{
                    height: `${((day.income || 0) / 6000000) * 100}%`,
                    animationDelay: `${i * 60}ms`
                  }"
                />
                <div
                  class="bg-error-500/60 flex-1 rounded-t-md transition-all duration-500"
                  :style="{
                    height: `${((day.expense || 0) / 6000000) * 100}%`,
                    animationDelay: `${i * 60 + 30}ms`
                  }"
                />
              </div>
              <span class="text-[10px] font-medium text-slate-400 dark:text-zinc-500">{{
                day.label
              }}</span>
            </div>
          </div>
        </div>
        <!-- Top Debtors Panel -->
        <div class="card stagger-item p-5" style="animation-delay: 280ms">
          <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-alert-triangle" class="text-error-500 h-4 w-4" />
              <h3 class="text-surface-foreground text-sm font-semibold">Nợ nhiều nhất</h3>
            </div>
            <NuxtLink
              to="/admin/customers"
              class="text-primary-500 hover:text-primary-600 text-xs transition-colors"
            >
              Tất cả →
            </NuxtLink>
          </div>
          <div class="space-y-3.5">
            <div
              v-for="(debtor, i) in topDebtors"
              :key="i"
              class="group animate-fade-in-up flex items-center gap-3"
              :style="{ animationDelay: `${i * 60 + 300}ms` }"
            >
              <UAvatar :src="debtor.avatar" :alt="debtor.name" size="sm" />
              <div class="min-w-0 flex-1">
                <p class="text-surface-foreground truncate text-sm font-medium">
                  {{ debtor.name }}
                </p>
                <p class="text-error-500 dark:text-error-400 text-xs tabular-nums">
                  {{ formatVND(debtor.total) }}
                </p>
              </div>
              <div class="flex w-16 items-center gap-1">
                <div
                  class="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800"
                >
                  <div
                    class="h-full rounded-full transition-all duration-700"
                    :class="
                      debtor.percent >= 80
                        ? 'bg-error-500'
                        : debtor.percent >= 50
                          ? 'bg-warning-500'
                          : 'bg-primary-500'
                    "
                    :style="{ width: `${debtor.percent}%` }"
                  />
                </div>
                <span class="w-8 text-right text-[10px] font-medium text-slate-400 tabular-nums"
                  >{{ debtor.percent }}%</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Quick Actions -->
      <div class="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <UButton
          v-for="(action, i) in quickActions"
          :key="i"
          variant="ghost"
          color="neutral"
          class="card card-hover stagger-item flex items-center gap-3 p-4 text-left transition-all duration-200 hover:shadow-md"
          :style="{ animationDelay: `${360 + i * 60}ms` }"
          @click="handleQuickAction(action)"
        >
          <div
            class="bg-primary-50 dark:bg-primary-900/20 ring-primary-100 dark:ring-primary-900/30 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ring-1"
          >
            <UIcon :name="action.icon" class="text-primary-600 dark:text-primary-400 h-5 w-5" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-surface-foreground text-sm font-medium">{{ action.label }}</p>
            <p class="truncate text-xs text-slate-500 dark:text-zinc-400">
              {{ action.description }}
            </p>
          </div>
          <UIcon
            name="i-lucide-arrow-right"
            class="h-4 w-4 flex-shrink-0 text-slate-400 dark:text-zinc-500"
          />
        </UButton>
      </div>
      <!-- Filter pills -->
      <div
        class="stagger-item mb-4 flex items-center gap-2 overflow-x-auto pb-1"
        style="animation-delay: 500ms"
      >
        <UButton
          v-for="pill in typePills"
          :key="pill.accessorKey"
          :variant="typeFilter === pill.accessorKey ? 'solid' : 'soft'"
          :color="typeFilter === pill.accessorKey ? 'primary' : 'neutral'"
          size="sm"
          class="whitespace-nowrap"
          @click="setFilter(pill.accessorKey)"
        >
          <UIcon :name="pill.icon" class="mr-1 h-3.5 w-3.5" />
          {{ pill.header }}
        </UButton>
      </div>
      <!-- Search -->
      <div class="animate-fade-in-up mb-4 flex items-center gap-3" style="animation-delay: 540ms">
        <div class="max-w-md flex-1">
          <BaseSearchInput
            v-model="search"
            placeholder="Tìm giao dịch theo mã hoặc khách hàng..."
          />
        </div>
      </div>
      <!-- Table -->
      <div
        class="animate-fade-in-up bg-surface ring-surface-border overflow-hidden rounded-xl ring-1"
        style="animation-delay: 580ms"
      >
        <BaseDataTable
          :columns="columns"
          :rows="filteredTransactions"
          :loading="txStatus === 'pending'"
        >
          <template #user-cell="{ row }">
            <div class="flex items-center gap-2">
              <UAvatar
                :alt="row.user?.full_name || 'Khách'"
                :src="row.user?.profile?.avatar_url || row.user?.avatar_url || undefined"
                size="sm"
              />
              <div>
                <p class="text-surface-foreground text-sm font-medium">
                  {{ row.user?.full_name || 'Khách' }}
                </p>
                <p class="text-xs text-slate-400 dark:text-zinc-500">
                  {{ row.user?.phone_number || '' }}
                </p>
              </div>
            </div>
          </template>
          <template #type-cell="{ row }">
            <UBadge :color="transactionTypeColor[row.type] || 'neutral'" variant="subtle" size="sm">
              <UIcon
                :name="
                  row.type === 'order_charge' || row.type === 'debt_record'
                    ? 'i-lucide-arrow-down-left'
                    : row.type === 'debt_payment'
                      ? 'i-lucide-arrow-up-right'
                      : row.type === 'payment'
                        ? 'i-lucide-banknote'
                        : 'i-lucide-undo-2'
                "
                class="mr-1 h-3.5 w-3.5"
              />
              {{ transactionTypeLabel[row.type] || row.type }}
            </UBadge>
          </template>
          <template #amount-cell="{ row }">
            <span
              :class="[
                'font-semibold tabular-nums',
                row.type === 'order_charge' || row.type === 'debt_record'
                  ? 'text-error-600 dark:text-error-400'
                  : 'text-success-600 dark:text-success-400'
              ]"
            >
              {{ row.type === 'order_charge' || row.type === 'debt_record' ? '-' : '+'
              }}{{ formatVND(row.amount) }}
            </span>
          </template>
          <template #referenceCode-cell="{ row }">
            <span class="text-sm text-slate-600 dark:text-zinc-300">{{
              row.referenceCode || '-'
            }}</span>
          </template>
          <template #createdAt-cell="{ row }">
            <span class="text-sm text-slate-500 tabular-nums dark:text-zinc-400">{{
              formatDate(row.createdAt)
            }}</span>
          </template>
          <template #pagination>
            <!-- Pagination -->
            <div
              class="border-surface-border mt-4 flex items-center justify-between border-t px-4 py-2"
            >
              <div class="flex items-center gap-3">
                <span class="text-sm text-slate-500 tabular-nums dark:text-zinc-400">
                  {{ totalItems === 0 ? 0 : (page - 1) * perPage + 1 }}-{{
                    Math.min(page * perPage, totalItems)
                  }}
                  /
                  {{ totalItems }}
                </span>
                <USelectMenu v-model="perPage" :items="[10, 20, 50]" class="w-32">
                  <template #default>{{ perPage }} / trang</template>
                </USelectMenu>
              </div>
              <UPagination v-model="page" :total="totalItems" :page-count="perPage" :max="5" />
            </div>
          </template>
        </BaseDataTable>
      </div>
    </template>
  </div>
</template>
