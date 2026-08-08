<script setup lang="ts">
import { OrderStatus, Role, UserStatus } from '~/utils/enums'
import type { Order, Profile } from '~/utils/types'
import { mockOrders, mockProfiles } from '~/utils/mockData'
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '~/utils/orderStatus'

const toast = useToast()
const { formatVND, formatDate } = useFormat()

useSeoMeta({ title: 'Đơn hàng - BunTech Admin' })
definePageMeta({ layout: 'admin' })

// State
const allOrders = ref<Order[]>([...mockOrders])
const drivers = ref<Profile[]>(mockProfiles.filter(p => p.role === Role.DRIVER && p.status === UserStatus.ACTIVE))
const loading = ref(true)

// Filters
const search = ref('')
const statusFilter = ref<'ALL' | OrderStatus>('ALL')
const startDate = ref('')
const endDate = ref('')
const sortBy = ref<'id' | 'status' | 'total' | 'created_at'>('created_at')
const sortDirection = ref<'asc' | 'desc'>('desc')
const page = ref(1)
const limit = ref(10)
const showFilters = ref(false)

const selectedOrders = ref<Set<string>>(new Set())
const showBatchModal = ref(false)
const batchDriverId = ref('')
const batchAssigning = ref(false)
const exporting = ref(false)

onMounted(() => {
  setTimeout(() => { loading.value = false }, 300)
})

const kpiStats = computed(() => {
  const list = allOrders.value
  const pending = list.filter(o => o.status === OrderStatus.PENDING).length
  const shipping = list.filter(o => o.status === OrderStatus.SHIPPING).length
  const delivered = list.filter(o => o.status === OrderStatus.DELIVERED).length
  return [
    { title: 'Tổng đơn hàng', value: list.length, icon: 'i-lucide-shopping-bag', color: 'primary' as const, trend: { value: 15, isPositive: true } },
    { title: 'Chờ xử lý', value: pending, icon: 'i-lucide-clock', color: 'warning' as const, trend: { value: 3, isPositive: true } },
    { title: 'Đang giao', value: shipping, icon: 'i-lucide-truck', color: 'info' as const, trend: { value: 7, isPositive: true } },
    { title: 'Đã giao', value: delivered, icon: 'i-lucide-package-check', color: 'success' as const, trend: { value: 12, isPositive: true } },
  ]
})

const totalRevenue = computed(() =>
  allOrders.value.filter(o => o.status === OrderStatus.DELIVERED).reduce((s, o) => s + o.total, 0)
)

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

const filteredRows = computed(() => {
  let rows = allOrders.value
  if (search.value) {
    const q = search.value.toLowerCase()
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
    let av: any = a[sortBy.value]
    let bv: any = b[sortBy.value]
    if (typeof av === 'number' && typeof bv === 'number') {
      return sortDirection.value === 'asc' ? av - bv : bv - av
    }
    return sortDirection.value === 'asc'
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av))
  })
})

const total = computed(() => filteredRows.value.length)
const pagedRows = computed(() => {
  const start = (page.value - 1) * limit.value
  return filteredRows.value.slice(start, start + limit.value)
})

watch([search, statusFilter, startDate, endDate], () => { page.value = 1 })

function toggleSelectOrder(id: string, checked: boolean) {
  if (checked) selectedOrders.value.add(id)
  else selectedOrders.value.delete(id)
  selectedOrders.value = new Set(selectedOrders.value)
}

function toggleAll(v: boolean | 'indeterminate') {
  if (v === true) {
    filteredRows.value.forEach(o => selectedOrders.value.add(o.id))
  } else {
    selectedOrders.value.clear()
  }
}

function clearSelection() {
  selectedOrders.value.clear()
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
    toast.add({ title: `Đã điều phối ${ids.length} đơn hàng`, color: 'success' })
    showBatchModal.value = false
    clearSelection()
    batchDriverId.value = ''
    batchAssigning.value = false
  }, 500)
}

function exportCSV() {
  exporting.value = true
  setTimeout(() => {
    toast.add({ title: 'Xuất CSV thành công', color: 'success' })
    exporting.value = false
  }, 300)
}

function clearFilters() {
  statusFilter.value = 'ALL'
  startDate.value = ''
  endDate.value = ''
  search.value = ''
}

const activeFilterCount = computed(() => {
  let c = 0
  if (statusFilter.value !== 'ALL') c++
  if (startDate.value || endDate.value) c++
  if (search.value) c++
  return c
})





const columns = [
  { accessorKey: 'select', header: '' },
  { accessorKey: 'id', header: 'Mã đơn' },
  { accessorKey: 'user', header: 'Khách hàng' },
  { accessorKey: 'status', header: 'Trạng thái' },
  { accessorKey: 'total', header: 'Tổng tiền' },
  { accessorKey: 'amount_collected', header: 'Đã thu' },
  { accessorKey: 'created_at', header: 'Ngày tạo' },
  { accessorKey: 'actions', header: 'Thao tác' }
]
</script>

<template>
  <div>
    <BasePageHeader title="Đơn hàng" description="Quản lý đơn hàng, điều phối tài xế và doanh thu">
      <template #actions>
        <UButton
          class="lg:hidden relative"
          variant="outline"
          color="neutral"
          icon="i-lucide-filter"
          aria-label="Lọc"
          @click="showFilters = !showFilters"
        >
          <span v-if="activeFilterCount > 0" class="absolute -top-1 -right-1 w-4 h-4 bg-primary-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{{ activeFilterCount }}</span>
        </UButton>
        <UButton variant="outline" color="neutral" :loading="exporting" class="hidden sm:inline-flex" @click="exportCSV">
          <div class="i-lucide-download w-4 h-4 mr-1" /> <span class="hidden md:inline">Xuất CSV</span>
        </UButton>
        <UButton variant="outline" color="primary" :disabled="selectedOrders.size === 0" class="hidden md:inline-flex" @click="showBatchModal = true">
          <div class="i-lucide-truck w-4 h-4 mr-1" /> Điều phối ({{ selectedOrders.size }})
        </UButton>
        <UButton to="/admin/orders/create">
          <div class="i-lucide-plus w-4 h-4 mr-1" /> <span class="hidden sm:inline">Tạo đơn</span>
        </UButton>
      </template>
    </BasePageHeader>

    <template v-if="loading">
      <BasePageLoading />
    </template>
    
    <template v-else>
      <!-- KPI Row -->
      <div class="mb-6">
        <BaseStatsGrid :stats="kpiStats" :loading="loading" />
      </div>

      <!-- Revenue banner -->
      <div class="card p-4 mb-4 stagger-item flex items-center justify-between" style="animation-delay: 180ms">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-success-50 dark:bg-success-900/20 flex items-center justify-center ring-1 ring-success-100 dark:ring-success-900/30">
            <div class="i-lucide-banknote w-5 h-5 text-success-600 dark:text-success-400" />
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
          <span class="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1 hidden sm:flex">
            <div class="i-lucide-radio w-3.5 h-3.5" /> Cập nhật theo thời gian thực
          </span>
        </div>
      </div>

      <!-- Status pills -->
      <div class="flex items-center gap-2 mb-4 overflow-x-auto pb-1 stagger-item" style="animation-delay: 220ms">
        <UButton
          v-for="pill in statusPills"
          :key="pill.key"
          :variant="statusFilter === pill.key ? 'solid' : 'soft'"
          :color="statusFilter === pill.key ? 'primary' : 'neutral'"
          size="sm"
          class="whitespace-nowrap"
          @click="statusFilter = pill.key"
        >
          {{ pill.label }}
          <UBadge :color="statusFilter === pill.key ? 'neutral' : 'neutral'" variant="subtle" size="sm" class="ml-1">{{ pill.count }}</UBadge>
        </UButton>
      </div>

      <!-- Desktop filter bar -->
      <div class="hidden lg:flex flex-wrap items-center gap-3 mb-4 animate-fade-in-up" style="animation-delay: 240ms">
        <div class="flex-1 min-w-[200px] max-w-xs">
          <UInput v-model="search" icon="i-lucide-search" placeholder="Tìm theo mã đơn, khách hàng, địa chỉ..." />
        </div>
        <UInput v-model="startDate" type="date" />
        <UInput v-model="endDate" type="date" />
        <UButton v-if="activeFilterCount > 0" variant="ghost" color="error" size="sm" icon="i-lucide-x" @click="clearFilters">Xóa lọc</UButton>
      </div>

      <!-- Mobile search -->
      <div class="lg:hidden mb-4">
        <UInput v-model="search" icon="i-lucide-search" placeholder="Tìm đơn hàng..." class="w-full" />
      </div>

      <!-- Mobile filter slideover -->
      <USlideover v-model:open="showFilters" side="bottom" title="Bộ lọc">
        <template #body>
          <div class="space-y-4">
            <UFormField label="Trạng thái">
              <div class="flex flex-wrap gap-2">
                <UButton
                  v-for="pill in statusPills"
                  :key="pill.key"
                  :variant="statusFilter === pill.key ? 'solid' : 'soft'"
                  :color="statusFilter === pill.key ? 'primary' : 'neutral'"
                  size="sm"
                  @click="statusFilter = pill.key"
                >
                  {{ pill.label }} ({{ pill.count }})
                </UButton>
              </div>
            </UFormField>
            <UFormField label="Khoảng thời gian">
              <div class="grid grid-cols-2 gap-3">
                <UInput v-model="startDate" type="date" />
                <UInput v-model="endDate" type="date" />
              </div>
            </UFormField>
          </div>
        </template>
        <template #footer>
          <div class="flex gap-3 w-full">
            <UButton variant="ghost" color="error" class="flex-1 justify-center" @click="clearFilters">Xóa lọc</UButton>
            <UButton color="primary" class="flex-1 justify-center" @click="showFilters = false">Áp dụng</UButton>
          </div>
        </template>
      </USlideover>



      <!-- Batch selection bar -->
      <Transition name="fade">
        <div v-if="selectedOrders.size > 0" class="card p-3 mb-3 flex items-center justify-between bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
          <div class="flex items-center gap-2">
            <div class="i-lucide-check-circle-2 w-5 h-5 text-primary-600 dark:text-primary-400" />
            <span class="text-sm font-medium text-primary-700 dark:text-primary-300">Đã chọn {{ selectedOrders.size }} đơn</span>
          </div>
          <div class="flex items-center gap-2">
            <UButton variant="ghost" color="neutral" size="sm" @click="clearSelection">Bỏ chọn</UButton>
            <UButton size="sm" @click="showBatchModal = true">
              <div class="i-lucide-truck w-3.5 h-3.5 mr-1" /> Điều phối
            </UButton>
          </div>
        </div>
      </Transition>

      <!-- Table -->
      <div class="animate-fade-in-up bg-surface ring-1 ring-surface-border rounded-xl overflow-hidden" style="animation-delay: 280ms">
        <UTable :columns="columns" :data="pagedRows">
          <template #select-cell="{ row }">
            <UCheckbox
              v-if="row.original.status === OrderStatus.PROCESSING || row.original.status === OrderStatus.PENDING"
              :model-value="selectedOrders.has(row.original.id)"
              @update:model-value="(v: boolean) => toggleSelectOrder(row.original.id, v)"
              @click.stop
            />
          </template>

          <template #id-cell="{ row }">
            <span class="font-mono text-xs text-slate-500 dark:text-zinc-400">{{ row.original.id.slice(0, 8) }}</span>
          </template>

          <template #user-cell="{ row }">
            <div class="flex items-center gap-2 min-w-0">
              <UAvatar
                :alt="row.original.user?.full_name || row.original.guest_info?.name || 'Khách vãng lai'"
                :src="row.original.user?.avatar_url"
                size="sm"
              />
              <div class="min-w-0">
                <p class="text-sm text-surface-foreground truncate max-w-[180px]">{{ row.original.user?.full_name || row.original.guest_info?.name || 'Khách vãng lai' }}</p>
                <p v-if="row.original.driver" class="text-xs text-slate-500 dark:text-zinc-400 truncate flex items-center gap-1">
                  <span class="i-lucide-truck w-3 h-3" /> {{ row.original.driver?.full_name }}
                </p>
              </div>
            </div>
          </template>

          <template #status-cell="{ row }">
            <UBadge :color="ORDER_STATUS_COLORS[row.original.status]" variant="subtle">
              {{ ORDER_STATUS_LABELS[row.original.status] }}
            </UBadge>
          </template>

          <template #total-cell="{ row }">
            <span class="font-semibold text-surface-foreground tabular-nums">{{ formatVND(row.original.total) }}</span>
          </template>

          <template #amount_collected-cell="{ row }">
            <span :class="['tabular-nums', row.original.amount_collected > 0 ? 'text-success-600 dark:text-success-400 font-medium' : 'text-slate-400 dark:text-zinc-500']">
              {{ row.original.amount_collected > 0 ? formatVND(row.original.amount_collected) : '—' }}
            </span>
          </template>

          <template #created_at-cell="{ row }">
            <span class="text-slate-500 dark:text-zinc-400 text-sm tabular-nums">{{ formatDate(row.original.created_at) }}</span>
          </template>

          <template #actions-cell="{ row }">
            <UButton color="neutral" variant="ghost" size="sm" :to="`/admin/orders/${row.original.id}`">
              <div class="i-lucide-eye w-4 h-4 mr-1" /> Xem
            </UButton>
          </template>
        </UTable>
        <div v-if="pagedRows.length === 0" class="p-8 text-center text-surface-500">
          Không tìm thấy đơn hàng nào.
        </div>
        <div class="p-4 border-t border-surface-border flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-sm text-slate-500 dark:text-zinc-400">
              {{ Math.min((page - 1) * limit + 1, total) }}-{{ Math.min(page * limit, total) }} / {{ total }}
            </span>
            <USelectMenu
              v-model="limit"
              :options="[10, 20, 50]"
              class="w-32"
            >
              <template #label>{{ limit }} / trang</template>
            </USelectMenu>
          </div>
          <UPagination v-model="page" :total="total" :page-count="limit" :max="5" />
        </div>
      </div>
    </template>

    <!-- Batch Assign Modal -->
    <UModal v-model:open="showBatchModal" title="Điều phối đơn hàng">
      <template #body>
        <div class="space-y-4">
          <div class="flex items-center gap-2 p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
            <div class="i-lucide-truck w-5 h-5 text-primary-600 dark:text-primary-400" />
            <p class="text-[13px] text-primary-700 dark:text-primary-300">
              Đã chọn <strong class="font-bold">{{ selectedOrders.size }}</strong> đơn hàng để điều phối
            </p>
          </div>
          <UFormField label="Chọn tài xế" required>
            <USelectMenu
              v-model="batchDriverId"
              :items="drivers.map(d => ({ value: d.id, label: d.full_name }))"
              value-key="value"
              label-key="label"
              placeholder="Chọn tài xế giao hàng"
            />
          </UFormField>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" color="neutral" @click="() => { showBatchModal = false }">Hủy</UButton>
          <UButton :loading="batchAssigning" :disabled="!batchDriverId || selectedOrders.size === 0" @click="batchAssign">
            Điều phối ngay
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
