<script setup lang="ts">
import { ConstantKey } from '~/enums/constantKeys'
import type { Order, Profile } from '~/utils/types'
import { mockOrders, mockProfiles } from '~/utils/mockData'
const { constants } = useMasterData()
const toast = useToast()
useSeoMeta({ title: 'Đơn hàng - BunTech Admin' })
definePageMeta({ layout: 'admin' })
// State
const allOrders = ref<Order[]>([...mockOrders])
const drivers = ref<Profile[]>(
  mockProfiles.filter(
    (p) =>
      p.role === constants.value?.[ConstantKey.Role]?.DRIVER &&
      p.status === constants.value?.[ConstantKey.UserStatus]?.ACTIVE
  )
)
const loading = ref(true)
// Filters
const search = ref('')
const statusFilter = ref<'ALL' | string>('ALL')
const startDate = ref('')
const endDate = ref('')
const sortBy = ref<'id' | 'status' | 'total' | 'created_at'>('created_at')
const sortDirection = ref<'asc' | 'desc'>('desc')
const page = ref(1)
const limit = ref(10)
const showFilters = ref(false)
const selectedOrders = ref<Set<string>>(new Set())
const showBatchModal = ref(false)
const exporting = ref(false)
onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 300)
})

const statusPills = computed(() => {
  const list = allOrders.value
  return [
    { key: 'ALL' as const, label: 'Tất cả', count: list.length },
    {
      key: constants.value?.[ConstantKey.OrderStatus]?.PENDING as string,
      label: 'Chờ xử lý',
      count: list.filter((o) => o.status === constants.value?.[ConstantKey.OrderStatus]?.PENDING)
        .length
    },
    {
      key: constants.value?.[ConstantKey.OrderStatus]?.PROCESSING as string,
      label: 'Đang chuẩn bị',
      count: list.filter((o) => o.status === constants.value?.[ConstantKey.OrderStatus]?.PROCESSING)
        .length
    },
    {
      key: constants.value?.[ConstantKey.OrderStatus]?.SHIPPING as string,
      label: 'Đang giao',
      count: list.filter((o) => o.status === constants.value?.[ConstantKey.OrderStatus]?.SHIPPING)
        .length
    },
    {
      key: constants.value?.[ConstantKey.OrderStatus]?.DELIVERED as string,
      label: 'Đã giao',
      count: list.filter((o) => o.status === constants.value?.[ConstantKey.OrderStatus]?.DELIVERED)
        .length
    },
    {
      key: constants.value?.[ConstantKey.OrderStatus]?.CANCELLED as string,
      label: 'Đã hủy',
      count: list.filter((o) => o.status === constants.value?.[ConstantKey.OrderStatus]?.CANCELLED)
        .length
    }
  ]
})
const filteredRows = computed(() => {
  let rows = allOrders.value
  if (search.value) {
    const q = search.value.toLowerCase()
    rows = rows.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        (o.user?.full_name || '').toLowerCase().includes(q) ||
        (o.guest_info?.name || '').toLowerCase().includes(q) ||
        o.shipping_address.toLowerCase().includes(q)
    )
  }
  if (statusFilter.value !== 'ALL') rows = rows.filter((o) => o.status === statusFilter.value)
  if (startDate.value) {
    const s = new Date(startDate.value).toISOString()
    rows = rows.filter((o) => o.created_at >= s)
  }
  if (endDate.value) {
    const e = new Date(endDate.value + 'T23:59:59').toISOString()
    rows = rows.filter((o) => o.created_at <= e)
  }
  return [...rows].sort((a, b) => {
    const av = (a as Record<string, unknown>)[sortBy.value]
    const bv = (b as Record<string, unknown>)[sortBy.value]
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
watch([search, statusFilter, startDate, endDate], () => {
  page.value = 1
})
function toggleSelectOrder(id: string, checked: boolean) {
  if (checked) selectedOrders.value.add(id)
  else selectedOrders.value.delete(id)
  selectedOrders.value = new Set(selectedOrders.value)
}
function _toggleAll(v: boolean | 'indeterminate') {
  if (v === true) {
    filteredRows.value.forEach((o) => selectedOrders.value.add(o.id))
  } else {
    selectedOrders.value.clear()
  }
}
function clearSelection() {
  selectedOrders.value.clear()
  selectedOrders.value = new Set()
}
function handleBatchAssign(driverId: string) {
  const ids = Array.from(selectedOrders.value)
  const driver = drivers.value.find((d) => d.id === driverId) || null
  allOrders.value = allOrders.value.map((o) =>
    ids.includes(o.id)
      ? ({
          ...o,
          driver_id: driverId,
          driver,
          status: constants.value?.[ConstantKey.OrderStatus]?.SHIPPING as string,
          updated_at: new Date().toISOString()
        } as Order)
      : o
  )
  toast.add({ title: `Đã điều phối ${ids.length} đơn hàng`, color: 'success' })
  clearSelection()
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
</script>
<template>
  <div>
    <BasePageHeader title="Đơn hàng" description="Quản lý đơn hàng, điều phối tài xế và doanh thu">
      <template #actions>
        <UButton
          class="relative lg:hidden"
          variant="outline"
          color="neutral"
          icon="i-lucide-filter"
          aria-label="Lọc"
          @click="
            () => {
              showFilters = !showFilters
            }
          "
        >
          <span
            v-if="activeFilterCount > 0"
            class="bg-primary-600 absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
            >{{ activeFilterCount }}</span
          >
        </UButton>
        <UButton
          variant="outline"
          color="neutral"
          :loading="exporting"
          class="hidden sm:inline-flex"
          @click="exportCSV"
        >
          <div class="i-lucide-download mr-1 h-4 w-4" />
          <span class="hidden md:inline">Xuất CSV</span>
        </UButton>
        <UButton
          variant="outline"
          color="primary"
          :disabled="selectedOrders.size === 0"
          class="hidden md:inline-flex"
          @click="
            () => {
              showBatchModal = true
            }
          "
        >
          <div class="i-lucide-truck mr-1 h-4 w-4" />
          Điều phối ({{ selectedOrders.size }})
        </UButton>
        <UButton to="/admin/orders/create">
          <div class="i-lucide-plus mr-1 h-4 w-4" />
          <span class="hidden sm:inline">Tạo đơn</span>
        </UButton>
      </template>
    </BasePageHeader>
    <template v-if="loading">
      <BasePageLoading />
    </template>

    <template v-else>
      <OrderKpiCards :orders="allOrders" :loading="loading" />
      <!-- Status pills -->
      <div
        class="stagger-item mb-4 flex items-center gap-2 overflow-x-auto pb-1"
        style="animation-delay: 220ms"
      >
        <UButton
          v-for="pill in statusPills"
          :key="pill.key"
          :variant="statusFilter === pill.key ? 'solid' : 'soft'"
          :color="statusFilter === pill.key ? 'primary' : 'neutral'"
          size="sm"
          class="whitespace-nowrap"
          @click="
            () => {
              statusFilter = pill.key
            }
          "
        >
          {{ pill.label }}
          <UBadge
            :color="statusFilter === pill.key ? 'neutral' : 'neutral'"
            variant="subtle"
            size="sm"
            class="ml-1"
            >{{ pill.count }}</UBadge
          >
        </UButton>
      </div>
      <!-- Desktop filter bar -->
      <div
        class="animate-fade-in-up mb-4 hidden flex-wrap items-center gap-3 lg:flex"
        style="animation-delay: 240ms"
      >
        <div class="max-w-xs min-w-[200px] flex-1">
          <UInput
            v-model="search"
            icon="i-lucide-search"
            placeholder="Tìm theo mã đơn, khách hàng, địa chỉ..."
          />
        </div>
        <UInput v-model="startDate" type="date" />
        <UInput v-model="endDate" type="date" />
        <UButton
          v-if="activeFilterCount > 0"
          variant="ghost"
          color="error"
          size="sm"
          icon="i-lucide-x"
          @click="clearFilters"
          >Xóa lọc</UButton
        >
      </div>
      <!-- Mobile search -->
      <div class="mb-4 lg:hidden">
        <UInput
          v-model="search"
          icon="i-lucide-search"
          placeholder="Tìm đơn hàng..."
          class="w-full"
        />
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
                  @click="
                    () => {
                      statusFilter = pill.key
                    }
                  "
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
          <div class="flex w-full gap-3">
            <UButton
              variant="ghost"
              color="error"
              class="flex-1 justify-center"
              @click="clearFilters"
              >Xóa lọc</UButton
            >
            <UButton
              color="primary"
              class="flex-1 justify-center"
              @click="
                () => {
                  showFilters = false
                }
              "
              >Áp dụng</UButton
            >
          </div>
        </template>
      </USlideover>
      <!-- Batch selection bar -->
      <Transition name="fade">
        <div
          v-if="selectedOrders.size > 0"
          class="card bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 mb-3 flex items-center justify-between p-3"
        >
          <div class="flex items-center gap-2">
            <div class="i-lucide-check-circle-2 text-primary-600 dark:text-primary-400 h-5 w-5" />
            <span class="text-primary-700 dark:text-primary-300 text-sm font-medium"
              >Đã chọn {{ selectedOrders.size }} đơn</span
            >
          </div>
          <div class="flex items-center gap-2">
            <UButton variant="ghost" color="neutral" size="sm" @click="clearSelection"
              >Bỏ chọn</UButton
            >
            <UButton
              size="sm"
              @click="
                () => {
                  showBatchModal = true
                }
              "
            >
              <div class="i-lucide-truck mr-1 h-3.5 w-3.5" />
              Điều phối
            </UButton>
          </div>
        </div>
      </Transition>
      <!-- Table -->
      <div
        class="animate-fade-in-up bg-surface ring-surface-border overflow-hidden rounded-xl ring-1"
        style="animation-delay: 280ms"
      >
        <OrderListTable
          :orders="pagedRows"
          :selected-orders="selectedOrders"
          @update:selected-orders="toggleSelectOrder"
        />
        <div v-if="pagedRows.length === 0" class="text-surface-500 p-8 text-center">
          Không tìm thấy đơn hàng nào.
        </div>
        <div class="border-surface-border flex items-center justify-between border-t p-4">
          <div class="flex items-center gap-3">
            <span class="text-sm text-slate-500 dark:text-zinc-400">
              {{ Math.min((page - 1) * limit + 1, total) }}-{{ Math.min(page * limit, total) }} /
              {{ total }}
            </span>
            <USelectMenu v-model="limit" :options="[10, 20, 50]" class="w-32">
              <template #default>{{ limit }} / trang</template>
            </USelectMenu>
          </div>
          <UPagination v-model="page" :total="total" :page-count="limit" :max="5" />
        </div>
      </div>
    </template>
    <!-- Batch Assign Modal -->
    <OrderBatchAssignModal
      v-model:open="showBatchModal"
      :selected-count="selectedOrders.size"
      :drivers="drivers"
      @assign="handleBatchAssign"
    />
  </div>
</template>
