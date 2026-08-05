<script setup lang="ts">
import {
  Plus, Download, Truck, Eye, Filter, X, ShoppingBag, Clock,
  PackageCheck, Banknote, TrendingUp, CheckCircle2, Radio,
} from 'lucide-vue-next'
import { OrderStatus, ORDER_STATUS_COLORS, Role, UserStatus } from '../../../core/enums'
import type { Order, Profile } from '../../../core/types'

const { t } = useI18n()
const toast = useToast()
const router = useRouter()
const { formatVND, formatDate, formatNumber } = useFormat()
const { downloadCSV } = useExportCSV()

useHead({ title: `Đơn hàng - BunTech Admin` })
definePageMeta({ layout: 'admin' })

// ─── Local reactive data (mock) ───────────────────────────────
const allOrders = ref<Order[]>([...mockOrders])
const drivers = ref<Profile[]>(mockProfiles.filter(p => p.role === Role.DRIVER && p.status === UserStatus.ACTIVE))
const loading = ref(true)
const error = ref(false)

// ─── Filters / pagination state ───────────────────────────────
const search = ref('')
const statusFilter = ref<'ALL' | OrderStatus>('ALL')
const startDate = ref('')
const endDate = ref('')
const sortBy = ref<'id' | 'status' | 'total' | 'created_at'>('created_at')
const sortDirection = ref<'asc' | 'desc'>('desc')
const page = ref(1)
const limit = ref(10)
const showFilters = ref(false)

const debouncedSearch = useDebounce(search, 300)

// ─── Batch assign state ───────────────────────────────────────
const selectedOrders = ref<Set<string>>(new Set())
const showBatchModal = ref(false)
const batchDriverId = ref('')
const batchAssigning = ref(false)
const exporting = ref(false)

// ─── Simulate loading ──────────────────────────────────────────
onMounted(() => {
  setTimeout(() => { loading.value = false }, 300)
})

// ─── KPI cards ─────────────────────────────────────────────────
const kpiCards = computed(() => {
  const list = allOrders.value
  const pending = list.filter(o => o.status === OrderStatus.PENDING).length
  const shipping = list.filter(o => o.status === OrderStatus.SHIPPING).length
  const delivered = list.filter(o => o.status === OrderStatus.DELIVERED).length
  return [
    { label: 'Tổng đơn hàng', value: formatNumber(list.length), icon: ShoppingBag, accent: 'bg-gradient-to-r from-primary-500 to-primary-400', bg: 'bg-primary-50 dark:bg-primary-900/20', text: 'text-primary-600 dark:text-primary-400', ring: 'ring-primary-100 dark:ring-primary-900/30', trend: '+15%' },
    { label: 'Chờ xử lý', value: formatNumber(pending), icon: Clock, accent: 'bg-gradient-to-r from-warning-500 to-warning-400', bg: 'bg-warning-50 dark:bg-warning-900/20', text: 'text-warning-600 dark:text-warning-400', ring: 'ring-warning-100 dark:ring-warning-900/30', trend: '+3' },
    { label: 'Đang giao', value: formatNumber(shipping), icon: Truck, accent: 'bg-gradient-to-r from-accent-500 to-accent-400', bg: 'bg-accent-50 dark:bg-accent-900/20', text: 'text-accent-600 dark:text-accent-400', ring: 'ring-accent-100 dark:ring-accent-900/30', trend: '+7' },
    { label: 'Đã giao', value: formatNumber(delivered), icon: PackageCheck, accent: 'bg-gradient-to-r from-success-500 to-success-400', bg: 'bg-success-50 dark:bg-success-900/20', text: 'text-success-600 dark:text-success-400', ring: 'ring-success-100 dark:ring-success-900/30', trend: '+12%' },
  ]
})

const totalRevenue = computed(() =>
  allOrders.value.filter(o => o.status === OrderStatus.DELIVERED).reduce((s, o) => s + o.total, 0)
)

// ─── Status pills with counts ──────────────────────────────────
const statusPills = computed(() => {
  const list = allOrders.value
  return [
    { key: 'ALL' as const, label: 'Tất cả', count: list.length },
    { key: OrderStatus.PENDING, label: 'Chờ xử lý', count: list.filter(o => o.status === OrderStatus.PENDING).length },
    { key: OrderStatus.PROCESSING, label: 'Đang chuẩn bị', count: list.filter(o => o.status === OrderStatus.PROCESSING).length },
    { key: OrderStatus.SHIPPING, label: 'Đang giao', count: list.filter(o => o.status === OrderStatus.SHIPPING).length },
    { key: OrderStatus.DELIVERED, label: 'Đã giao', count: list.filter(o => o.status === OrderStatus.DELIVERED).length },
    { key: OrderStatus.CANCELLED, label: 'Đã hủy', count: list.filter(o => o.status === OrderStatus.CANCELLED).length },
  ]
})

// ─── Filtered + sorted + paginated rows ─────────────────────────
const filteredRows = computed(() => {
  let rows = allOrders.value
  if (debouncedSearch.value) {
    const q = debouncedSearch.value.toLowerCase()
    rows = rows.filter(o =>
      o.id.toLowerCase().includes(q) ||
      (o.user?.full_name || '').toLowerCase().includes(q) ||
      (o.guest_info?.name || '').toLowerCase().includes(q) ||
      o.shipping_address.toLowerCase().includes(q)
    )
  }
  if (statusFilter.value !== 'ALL') rows = rows.filter(o => o.status === statusFilter.value)
  if (startDate.value) {
    const s = new Date(startDate.value).toISOString()
    rows = rows.filter(o => o.created_at >= s)
  }
  if (endDate.value) {
    const e = new Date(endDate.value + 'T23:59:59').toISOString()
    rows = rows.filter(o => o.created_at <= e)
  }

  return [...rows].sort((a, b) => {
    let av: string | number = ''
    let bv: string | number = ''
    switch (sortBy.value) {
      case 'id': av = a.id; bv = b.id; break
      case 'status': av = a.status; bv = b.status; break
      case 'total': av = a.total; bv = b.total; break
      case 'created_at': av = a.created_at; bv = b.created_at; break
    }
    if (typeof av === 'number' && typeof bv === 'number') {
      return sortDirection.value === 'asc' ? av - bv : bv - av
    }
    return sortDirection.value === 'asc'
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av))
  })
})

const total = computed(() => filteredRows.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)))
const pagedRows = computed(() => {
  const start = (page.value - 1) * limit.value
  return filteredRows.value.slice(start, start + limit.value)
})

watch([debouncedSearch, statusFilter, startDate, endDate], () => { page.value = 1 })

// ─── Handlers ──────────────────────────────────────────────────
function toggleSelectOrder(id: string) {
  if (selectedOrders.value.has(id)) selectedOrders.value.delete(id)
  else selectedOrders.value.add(id)
  // trigger reactivity
  selectedOrders.value = new Set(selectedOrders.value)
}

function clearSelection() {
  selectedOrders.value = new Set()
}

function batchAssign() {
  if (!batchDriverId.value || selectedOrders.value.size === 0) return
  batchAssigning.value = true
  setTimeout(() => {
    const ids = Array.from(selectedOrders.value)
    const driver = drivers.value.find(d => d.id === batchDriverId.value) || null
    allOrders.value = allOrders.value.map(o =>
      ids.includes(o.id)
        ? { ...o, driver_id: batchDriverId.value, driver, status: OrderStatus.SHIPPING, updated_at: new Date().toISOString() }
        : o
    )
    toast.success(`Đã điều phối ${ids.length} đơn hàng cho ${driver?.full_name || 'tài xế'}`)
    showBatchModal.value = false
    selectedOrders.value = new Set()
    batchDriverId.value = ''
    batchAssigning.value = false
  }, 500)
}

function exportCSV() {
  exporting.value = true
  setTimeout(() => {
    const csvData = filteredRows.value.map(o => ({
      id: o.id,
      customer: o.user?.full_name || o.guest_info?.name || 'Khách vãng lai',
      phone: o.user?.phone || o.guest_info?.phone || '',
      status: o.status,
      total: o.total,
      collected: o.amount_collected,
      address: o.shipping_address,
      date: o.created_at,
    }))
    downloadCSV(csvData, `Don_hang_${new Date().toISOString().slice(0, 10)}.csv`)
    toast.success('Xuất CSV thành công')
    exporting.value = false
  }, 300)
}

function toggleSort(col: 'id' | 'status' | 'total' | 'created_at') {
  if (sortBy.value === col) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = col
    sortDirection.value = 'asc'
  }
}

function clearFilters() {
  statusFilter.value = 'ALL'
  startDate.value = ''
  endDate.value = ''
}

const activeFilterCount = computed(() => {
  let c = 0
  if (statusFilter.value !== 'ALL') c++
  if (startDate.value || endDate.value) c++
  return c
})

function statusLabel(s: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: 'Chờ xử lý',
    [OrderStatus.PROCESSING]: 'Đang chuẩn bị',
    [OrderStatus.SHIPPING]: 'Đang giao',
    [OrderStatus.DELIVERED]: 'Đã giao',
    [OrderStatus.CANCELLED]: 'Đã hủy',
  }
  return map[s]
}

const columns = computed(() => [
  { key: 'select', label: '', width: '40px' },
  { key: 'id', label: 'Mã đơn', align: 'center' as const, sortable: true },
  { key: 'user', label: 'Khách hàng' },
  { key: 'status', label: 'Trạng thái', sortable: true },
  { key: 'total', label: 'Tổng tiền', align: 'right' as const, sortable: true },
  { key: 'amount_collected', label: 'Đã thu', align: 'right' as const },
  { key: 'created_at', label: 'Ngày tạo', sortable: true, hideOnMobile: true },
  { key: 'actions', label: 'Thao tác', align: 'right' as const, width: '80px', hideOnMobile: true },
])
</script>

<template>
  <div>
    <AppPageHeader title="Đơn hàng" subtitle="Quản lý đơn hàng, điều phối tài xế và doanh thu" breadcrumb-label="Đơn hàng">
      <template #actions>
        <button
          class="lg:hidden p-2.5 rounded-lg border border-surface-border text-gray-600 dark:text-zinc-300 hover:bg-surface-hover transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center relative"
          aria-label="Lọc đơn hàng"
          @click="showFilters = !showFilters"
        >
          <Filter class="w-4 h-4" aria-hidden="true" />
          <span v-if="activeFilterCount > 0" class="absolute -top-1 -right-1 w-4 h-4 bg-primary-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{{ activeFilterCount }}</span>
        </button>
        <AppButton variant="outline" :loading="exporting" class="hidden sm:inline-flex" @click="exportCSV">
          <Download class="w-4 h-4" aria-hidden="true" /> <span class="hidden md:inline">Xuất CSV</span>
        </AppButton>
        <AppButton variant="outline" :disabled="selectedOrders.size === 0" class="hidden md:inline-flex" @click="showBatchModal = true">
          <Truck class="w-4 h-4" aria-hidden="true" /> Điều phối ({{ selectedOrders.size }})
        </AppButton>
        <NuxtLink to="/admin/orders/create">
          <AppButton><Plus class="w-4 h-4" aria-hidden="true" /> <span class="hidden sm:inline">Tạo đơn</span></AppButton>
        </NuxtLink>
      </template>
    </AppPageHeader>

    <AppErrorState v-if="error" message="Không thể tải danh sách đơn hàng." @retry="loading = true; error = false" />

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
            <AppSkeleton height="h-6" width="w-2/3" />
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
              <span class="text-xs font-medium text-success-600 dark:text-success-400 flex items-center gap-0.5">
                <TrendingUp class="w-3 h-3" aria-hidden="true" /> {{ card.trend }}
              </span>
            </div>
            <p class="text-[13px] text-slate-500 dark:text-zinc-400 mb-1 font-medium">{{ card.label }}</p>
            <p class="text-2xl font-bold text-surface-foreground tracking-tight tabular-nums">{{ card.value }}</p>
          </div>
        </template>
      </div>

      <!-- Revenue banner with realtime indicator -->
      <div v-if="!loading" class="card p-4 mb-4 stagger-item flex items-center justify-between" style="animation-delay: 180ms">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-success-50 dark:bg-success-900/20 flex items-center justify-center ring-1 ring-success-100 dark:ring-success-900/30">
            <Banknote class="w-5 h-5 text-success-600 dark:text-success-400" aria-hidden="true" />
          </div>
          <div>
            <p class="text-xs text-slate-500 dark:text-zinc-400 font-medium">Tổng doanh thu (đã giao)</p>
            <p class="text-lg font-bold text-success-600 dark:text-success-400 tabular-nums">{{ formatVND(totalRevenue) }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="relative flex h-2.5 w-2.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75" />
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-success-500" />
          </span>
          <span class="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1">
            <Radio class="w-3.5 h-3.5" aria-hidden="true" /> Cập nhật theo thời gian thực
          </span>
        </div>
      </div>

      <!-- Status pills -->
      <div v-if="!loading" class="flex items-center gap-2 mb-4 overflow-x-auto pb-1 stagger-item" style="animation-delay: 220ms">
        <button
          v-for="pill in statusPills"
          :key="pill.key"
          type="button"
          :class="[
            'inline-flex items-center gap-1.5 px-3.5 h-9 rounded-full text-[13px] font-medium transition-all whitespace-nowrap',
            statusFilter === pill.key
              ? 'bg-primary-600 text-white shadow-sm'
              : 'bg-surface-hover text-slate-600 dark:text-zinc-300 hover:bg-surface-border',
          ]"
          @click="statusFilter = pill.key"
        >
          {{ pill.label }}
          <span
            :class="[
              'tabular-nums text-[11px] px-1.5 py-0.5 rounded-full',
              statusFilter === pill.key
                ? 'bg-white/20 text-white'
                : 'bg-surface-border/40 text-slate-500 dark:text-zinc-400',
            ]"
          >{{ pill.count }}</span>
        </button>
      </div>

      <!-- Desktop filter bar -->
      <div class="hidden lg:flex flex-wrap items-center gap-3 mb-4 animate-fade-in-up" style="animation-delay: 240ms">
        <div class="flex-1 min-w-[200px] max-w-xs"><AppSearchBar v-model="search" placeholder="Tìm theo mã đơn, khách hàng, địa chỉ..." /></div>
        <input v-model="startDate" type="date" class="form-input min-h-[44px] w-auto">
        <input v-model="endDate" type="date" class="form-input min-h-[44px] w-auto">
        <button v-if="activeFilterCount > 0" class="text-sm text-gray-500 dark:text-zinc-400 hover:text-danger-600 dark:hover:text-danger-400 transition-colors flex items-center gap-1 px-2 min-h-[44px]" @click="clearFilters">
          <X class="w-4 h-4" aria-hidden="true" /> Xóa lọc
        </button>
      </div>

      <!-- Mobile filter sheet -->
      <Transition name="sheet">
        <div v-if="showFilters" class="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div class="absolute inset-0 bg-gray-900/50 dark:bg-black/60 backdrop-blur-sm" @click="showFilters = false" />
          <div class="relative bg-surface rounded-t-3xl p-6 pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] max-h-[80vh] overflow-y-auto">
            <div class="w-10 h-1.5 bg-surface-border rounded-full mx-auto mb-5" />
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-surface-foreground">Bộ lọc</h3>
              <button class="p-2 text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Đóng" @click="showFilters = false">
                <X class="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            <div class="space-y-4">
              <div>
                <label class="form-label">Trạng thái</label>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="pill in statusPills"
                    :key="pill.key"
                    :class="[
                      'px-3.5 py-2.5 rounded-full text-sm font-medium transition-all min-h-[44px]',
                      statusFilter === pill.key ? 'bg-primary-600 text-white' : 'bg-surface-hover text-gray-600 dark:text-zinc-300',
                    ]"
                    @click="statusFilter = pill.key"
                  >{{ pill.label }} ({{ pill.count }})</button>
                </div>
              </div>
              <div>
                <label class="form-label">Khoảng thời gian</label>
                <div class="grid grid-cols-2 gap-3">
                  <input v-model="startDate" type="date" class="form-input min-h-[44px]">
                  <input v-model="endDate" type="date" class="form-input min-h-[44px]">
                </div>
              </div>
              <div class="flex gap-3 pt-2">
                <AppButton variant="ghost" block @click="clearFilters">Xóa lọc</AppButton>
                <AppButton block @click="showFilters = false">Áp dụng</AppButton>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Mobile search -->
      <div class="lg:hidden mb-4">
        <AppSearchBar v-model="search" placeholder="Tìm đơn hàng..." />
      </div>

      <!-- Batch selection bar -->
      <Transition name="fade">
        <div v-if="selectedOrders.size > 0" class="card p-3 mb-3 flex items-center justify-between bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
          <div class="flex items-center gap-2">
            <CheckCircle2 class="w-5 h-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
            <span class="text-sm font-medium text-primary-700 dark:text-primary-300">Đã chọn {{ selectedOrders.size }} đơn</span>
          </div>
          <div class="flex items-center gap-2">
            <button class="text-xs text-slate-500 dark:text-zinc-400 hover:text-surface-foreground px-2 py-1" @click="clearSelection">Bỏ chọn</button>
            <AppButton size="sm" @click="showBatchModal = true"><Truck class="w-3.5 h-3.5" aria-hidden="true" /> Điều phối</AppButton>
          </div>
        </div>
      </Transition>

      <!-- Table -->
      <div class="animate-fade-in-up" style="animation-delay: 280ms">
        <AppTable
          :columns="columns"
          :rows="pagedRows as unknown as Record<string, unknown>[]"
          :loading="loading"
          :sort-by="sortBy"
          :sort-direction="sortDirection"
          row-key="id"
          empty-title="Không tìm thấy đơn hàng"
          empty-description="Thử đổi bộ lọc hoặc tạo đơn hàng mới."
          @sort="toggleSort"
          @row-dbl-click="(row) => router.push(`/admin/orders/${row.id}`)"
        >
          <template #cell-select="{ row }">
            <input
              v-if="(row as Order).status === OrderStatus.PROCESSING"
              type="checkbox"
              :checked="selectedOrders.has((row as Order).id)"
              class="rounded border-surface-border text-primary-600 focus:ring-primary-500 min-w-[20px] min-h-[20px]"
              @change="toggleSelectOrder((row as Order).id)"
              @click.stop
            >
          </template>

          <template #cell-id="{ value }">
            <span class="font-mono text-xs text-slate-500 dark:text-zinc-400">{{ String(value).slice(0, 8) }}</span>
          </template>

          <template #cell-user="{ row }">
            <div class="flex items-center gap-2 min-w-0">
              <AppAvatar
                :name="(row as Order).user?.full_name || (row as Order).guest_info?.name || 'Khách vãng lai'"
                :src="(row as Order).user?.avatar_url || undefined"
                size="xs"
              />
              <div class="min-w-0">
                <p class="text-sm text-surface-foreground truncate max-w-[180px]">{{ (row as Order).user?.full_name || (row as Order).guest_info?.name || 'Khách vãng lai' }}</p>
                <p v-if="(row as Order).driver" class="text-xs text-slate-500 dark:text-zinc-400 truncate flex items-center gap-1">
                  <Truck class="w-3 h-3" aria-hidden="true" /> {{ (row as Order).driver?.full_name }}
                </p>
              </div>
            </div>
          </template>

          <template #cell-status="{ value }">
            <AppBadge :color="ORDER_STATUS_COLORS[value as OrderStatus]" :dot="true">
              {{ statusLabel(value as OrderStatus) }}
            </AppBadge>
          </template>

          <template #cell-total="{ value }">
            <span class="font-semibold text-surface-foreground tabular-nums">{{ formatVND(Number(value)) }}</span>
          </template>

          <template #cell-amount_collected="{ value, row }">
            <span :class="['tabular-nums', Number(value) > 0 ? 'text-success-600 dark:text-success-400 font-medium' : 'text-slate-400 dark:text-zinc-500']">
              {{ Number(value) > 0 ? formatVND(Number(value)) : '—' }}
            </span>
          </template>

          <template #cell-created_at="{ value }">
            <span class="text-slate-500 dark:text-zinc-400 tabular-nums">{{ formatDate(value as string) }}</span>
          </template>

          <template #cell-actions="{ row }">
            <div class="flex items-center justify-end gap-1" @click.stop>
              <AppIconButton :icon="Eye" label="Xem" variant="view" @click.stop="router.push(`/admin/orders/${(row as Order).id}`)" />
            </div>
          </template>

          <!-- Mobile card layout -->
          <template #mobile-row="{ row }">
            <div class="flex gap-3">
              <div v-if="(row as Order).status === OrderStatus.PROCESSING" class="flex items-center pt-1">
                <input
                  type="checkbox"
                  :checked="selectedOrders.has((row as Order).id)"
                  class="rounded border-surface-border text-primary-600 focus:ring-primary-500 min-w-[20px] min-h-[20px]"
                  @change="toggleSelectOrder((row as Order).id)"
                  @click.stop
                >
              </div>
              <div class="flex-1 min-w-0 space-y-1.5">
                <div class="flex items-center justify-between gap-2">
                  <span class="font-mono text-xs text-slate-500 dark:text-zinc-400">{{ (row as Order).id.slice(0, 8) }}</span>
                  <AppBadge :color="ORDER_STATUS_COLORS[(row as Order).status]" :dot="true">
                    {{ statusLabel((row as Order).status) }}
                  </AppBadge>
                </div>
                <p class="font-medium text-surface-foreground line-clamp-1">{{ (row as Order).user?.full_name || (row as Order).guest_info?.name || 'Khách vãng lai' }}</p>
                <div class="flex items-center justify-between gap-2">
                  <span class="font-semibold text-surface-foreground tabular-nums">{{ formatVND((row as Order).total) }}</span>
                  <span class="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">{{ formatDate((row as Order).created_at) }}</span>
                </div>
              </div>
              <div class="flex flex-col gap-1 flex-shrink-0">
                <AppIconButton :icon="Eye" label="Xem" variant="view" @click.stop="router.push(`/admin/orders/${(row as Order).id}`)" />
              </div>
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

    <!-- Batch Assign Modal -->
    <AppModal v-model="showBatchModal" title="Điều phối đơn hàng" size="sm">
      <div class="space-y-4">
        <div class="flex items-center gap-2 p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20">
          <Truck class="w-5 h-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
          <p class="text-sm text-primary-700 dark:text-primary-300">
            Đã chọn <strong>{{ selectedOrders.size }}</strong> đơn hàng để điều phối
          </p>
        </div>
        <AppSelect
          v-model="batchDriverId"
          label="Chọn tài xế"
          :required="true"
          :options="drivers.map(d => ({ value: d.id, label: d.full_name }))"
          placeholder="Chọn tài xế giao hàng"
        />
      </div>
      <template #footer>
        <AppButton variant="ghost" @click="showBatchModal = false">Hủy</AppButton>
        <AppButton :loading="batchAssigning" :disabled="!batchDriverId || selectedOrders.size === 0" @click="batchAssign">
          Điều phối ngay
        </AppButton>
      </template>
    </AppModal>
  </div>
</template>
