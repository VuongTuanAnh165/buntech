<script setup lang="ts">
import { ConstantKey } from '~/enums/constantKeys'
import { useAdminOrders } from '~/composables/admin/useAdminOrders'
import { useUsers } from '~/composables/admin/useUsers'
import type { UserDTO } from '~/utils/types'
import dayjs from 'dayjs'

import OrderListTable from '~/components/features/admin/orders/OrderListTable.vue'
import OrderKpiCards from '~/components/features/admin/orders/OrderKpiCards.vue'
import OrderBatchAssignModal from '~/components/features/admin/orders/OrderBatchAssignModal.vue'

const { constants } = useMasterData()
const toast = useToast()
const { fetchOrders, batchAssignDriver, exportOrders } = useAdminOrders()
const { fetchUsers } = useUsers()

useSeoMeta({ title: 'Đơn hàng - BunTech Admin' })
definePageMeta({ layout: 'admin' })

// State
const drivers = ref<UserDTO[]>([])

// Filters
const search = ref('')
const searchDebounce = ref('')
let searchTimeout: ReturnType<typeof setTimeout> | null = null
watch(search, (val) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    searchDebounce.value = val
  }, 500)
})

const statusFilter = ref<'ALL' | string>('ALL')
const startDate = ref('')
const endDate = ref('')
const page = ref(1)
const limit = ref(10)
const showFilters = ref(false)
const selectedOrders = ref<Set<number>>(new Set())
const showBatchModal = ref(false)
const exporting = ref(false)

const fetchParams = computed(() => {
  const p: Record<string, string | number> = { page: page.value, limit: limit.value }
  if (searchDebounce.value) p.search = searchDebounce.value
  if (statusFilter.value !== 'ALL') p.status = statusFilter.value
  if (startDate.value) p.startDate = startDate.value
  if (endDate.value) p.endDate = endDate.value
  // Note: Backend might not support dynamic sort yet, keeping client state for UI compatibility
  return p
})

const {
  data: res,
  status,
  refresh
} = useAsyncData('admin_orders', () => fetchOrders(fetchParams.value), { watch: [fetchParams] })

const loading = computed(() => status.value === 'pending')
const pagedRows = computed(() => res.value?.data?.data || [])
const total = computed(() => res.value?.data?.meta?.total || 0)

onMounted(async () => {
  try {
    const driverRole = constants.value?.[ConstantKey.Role]?.DRIVER
    if (driverRole) {
      const usersRes = await fetchUsers({ role: driverRole, limit: 100 })
      drivers.value = usersRes.data?.data || []
    }
  } catch {
    // ignore
  }
})

const statusPills = computed(() => {
  // Vì đã chuyển sang SSR Pagination, chúng ta chỉ đếm trên trang hiện tại hoặc ẩn số đếm đi.
  // Để giữ UI mượt, hiển thị count = 0 nếu không có data.
  return [
    { key: 'ALL' as const, label: 'Tất cả' },
    { key: constants.value?.[ConstantKey.OrderStatus]?.PENDING as string, label: 'Chờ xử lý' },
    {
      key: constants.value?.[ConstantKey.OrderStatus]?.PROCESSING as string,
      label: 'Đang chuẩn bị'
    },
    { key: constants.value?.[ConstantKey.OrderStatus]?.DELIVERING as string, label: 'Đang giao' },
    { key: constants.value?.[ConstantKey.OrderStatus]?.DELIVERED as string, label: 'Đã giao' },
    { key: constants.value?.[ConstantKey.OrderStatus]?.CANCELLED as string, label: 'Đã hủy' }
  ]
})

watch([searchDebounce, statusFilter, startDate, endDate], () => {
  page.value = 1
})

function toggleSelectOrder(id: number, checked: boolean) {
  if (checked) selectedOrders.value.add(id)
  else selectedOrders.value.delete(id)
  selectedOrders.value = new Set(selectedOrders.value)
}

function clearSelection() {
  selectedOrders.value.clear()
  selectedOrders.value = new Set()
}

const selectedOrderDetails = computed(() => {
  return pagedRows.value.filter((o) => selectedOrders.value.has(o.id))
})

async function handleBatchAssign(payload: {
  driverId: number
  orders: { orderId: number; routeOrder: number }[]
}) {
  try {
    await batchAssignDriver(payload)
    clearSelection()
    refresh()
  } catch {
    // ignore
  }
}

async function exportCSV(overrideParams?: Record<string, unknown>) {
  exporting.value = true
  try {
    const params = { ...fetchParams.value, ...overrideParams }
    // Remove pagination params as BE export handles all matching
    delete params.page
    delete params.limit

    // ApiClient.download automatically handles blob generation and downloading
    await exportOrders(params)

    toast.add({ title: 'Xuất Excel thành công', color: 'success' })
  } catch (error: unknown) {
    toast.add({
      title: 'Lỗi khi xuất file',
      description: (error as Error)?.message || 'Có lỗi xảy ra',
      color: 'error'
    })
  } finally {
    exporting.value = false
  }
}

const exportOptions = [
  [
    {
      label: 'Danh sách hiện tại',
      icon: 'i-lucide-list-filter',
      onSelect: () => exportCSV()
    }
  ],
  [
    {
      label: 'Báo cáo hôm nay',
      icon: 'i-lucide-calendar-1',
      onSelect: () => {
        const today = dayjs().format('YYYY-MM-DD')
        exportCSV({ startDate: today, endDate: today, status: 'ALL' })
      }
    }
  ]
]

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
  if (searchDebounce.value) c++
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
        <UDropdownMenu :items="exportOptions" :popper="{ placement: 'bottom-end' }">
          <UButton
            variant="outline"
            color="neutral"
            :loading="exporting"
            class="hidden sm:inline-flex"
            icon="i-lucide-download"
          >
            <span class="hidden md:inline">Xuất Excel</span>
          </UButton>
        </UDropdownMenu>
        <UButton
          variant="outline"
          color="primary"
          :disabled="selectedOrders.size === 0"
          class="hidden md:inline-flex"
          icon="i-lucide-truck"
          @click="
            () => {
              showBatchModal = true
            }
          "
        >
          Điều phối ({{ selectedOrders.size }})
        </UButton>
        <UButton to="/admin/orders/create" icon="i-lucide-plus">
          <span class="hidden sm:inline">Tạo đơn</span>
        </UButton>
      </template>
    </BasePageHeader>
    <template v-if="loading">
      <BasePageLoading />
    </template>

    <template v-else>
      <OrderKpiCards :orders="pagedRows" :loading="loading" />
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
        </UButton>
      </div>
      <!-- Desktop filter bar -->
      <div
        class="animate-fade-in-up bg-surface ring-surface-border mb-4 hidden items-center gap-3 rounded-xl p-2 ring-1 lg:flex"
        style="animation-delay: 240ms"
      >
        <div class="min-w-0 flex-1 pl-1">
          <BaseSearchInput
            v-model="search"
            placeholder="Tìm theo mã đơn, khách hàng, địa chỉ..."
            class="w-full"
          />
        </div>
        <div class="bg-surface-border h-6 w-px" />
        <UInput v-model="startDate" type="date" size="sm" class="w-36" placeholder="Từ ngày" />
        <UInput v-model="endDate" type="date" size="sm" class="w-36" placeholder="Đến ngày" />
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
        <BaseSearchInput v-model="search" placeholder="Tìm đơn hàng..." class="w-full" />
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
                  {{ pill.label }}
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
              icon="i-lucide-truck"
              @click="
                () => {
                  showBatchModal = true
                }
              "
            >
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
        <div class="border-surface-border flex items-center justify-between border-t p-4">
          <div class="flex items-center gap-3">
            <span class="text-sm text-slate-500 dark:text-zinc-400">
              {{ Math.min((page - 1) * limit + 1, total) }}-{{ Math.min(page * limit, total) }} /
              {{ total }}
            </span>
            <USelectMenu v-model="limit" :items="[10, 20, 50]" class="w-32">
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
      :selected-orders="selectedOrderDetails"
      :drivers="drivers"
      @assign="handleBatchAssign"
    />
  </div>
</template>
