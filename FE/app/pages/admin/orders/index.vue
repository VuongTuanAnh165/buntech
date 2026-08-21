<script setup lang="ts">
import { ConstantKey } from '~/enums/constantKeys'
import { useAdminOrders } from '~/composables/admin/useAdminOrders'
import { useUsers } from '~/composables/admin/useUsers'
import type { UserDTO } from '~/utils/types'
import dayjs from 'dayjs'

import OrderListTable from '~/components/features/admin/orders/OrderListTable.vue'
import OrderKpiCards from '~/components/features/admin/orders/OrderKpiCards.vue'
import OrderBatchAssignModal from '~/components/features/admin/orders/OrderBatchAssignModal.vue'
import { useAdminSSE } from '~/composables/admin/useSSE'
import { t } from '~/utils/i18n'

const { constants } = useMasterData()
const toast = useToast()
const { fetchOrders, batchAssignDriver, exportOrders } = useAdminOrders()
const { fetchUsers } = useUsers()
const { connect } = useAdminSSE()

useSeoMeta({ title: t('admin_orders_seo_title') })
definePageMeta({ layout: 'admin' })

// State
const drivers = ref<UserDTO[]>([])

// Filters
const search = ref('')
const searchDebounce = refDebounced(search, 500)

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

  connect({
    onOrderDelivered: (orderData: { id: number }) => {
      toast.add({
        title: t('admin_orders_toast_deliv_title'),
        description: t('admin_orders_toast_deliv_desc', { id: orderData.id }),
        color: 'success',
        icon: 'i-lucide-check-circle'
      })
      refresh()
    },
    onOrderCreated: (orderData: Record<string, unknown>) => {
      toast.add({
        title: 'Đơn hàng mới',
        description: `Có đơn hàng mới vừa được tạo! (ID: ${orderData.id})`,
        color: 'info',
        icon: 'i-lucide-bell-ring'
      })
      refresh()
    }
  })
})

const statusPills = computed(() => {
  // Vì đã chuyển sang SSR Pagination, chúng ta chỉ đếm trên trang hiện tại hoặc ẩn số đếm đi.
  // Để giữ UI mượt, hiển thị count = 0 nếu không có data.
  return [
    { key: 'ALL' as const, label: t('admin_debt_type_all') },
    {
      key: constants.value?.[ConstantKey.OrderStatus]?.PENDING as string,
      label: t('status_order_pending')
    },
    {
      key: constants.value?.[ConstantKey.OrderStatus]?.PROCESSING as string,
      label: t('order_status_processing')
    },
    {
      key: constants.value?.[ConstantKey.OrderStatus]?.DELIVERING as string,
      label: t('status_order_delivering')
    },
    {
      key: constants.value?.[ConstantKey.OrderStatus]?.DELIVERED as string,
      label: t('status_order_delivered')
    },
    {
      key: constants.value?.[ConstantKey.OrderStatus]?.CANCELLED as string,
      label: t('status_order_cancelled')
    }
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

    toast.add({ title: t('admin_orders_export_success'), color: 'success' })
  } catch (error: unknown) {
    toast.add({
      title: t('admin_orders_export_err_title'),
      description: (error as Error)?.message || t('error_occurred'),
      color: 'error'
    })
  } finally {
    exporting.value = false
  }
}

const exportOptions = [
  [
    {
      label: t('admin_orders_export_opt_current'),
      icon: 'i-lucide-list-filter',
      onSelect: () => exportCSV()
    }
  ],
  [
    {
      label: t('admin_orders_export_opt_today'),
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
    <BasePageHeader :title="$t('nav_orders')" :description="$t('admin_orders_desc')">
      <template #actions>
        <UButton
          class="relative lg:hidden"
          variant="outline"
          color="neutral"
          icon="i-lucide-filter"
          :aria-label="$t('admin_orders_btn_filter')"
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
            <span class="hidden md:inline">{{ $t('admin_orders_btn_export') }}</span>
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
          {{ $t('admin_orders_btn_assign', { count: selectedOrders.size }) }}
        </UButton>
        <UButton to="/admin/orders/create" icon="i-lucide-plus">
          <span class="hidden sm:inline">{{ $t('admin_orders_btn_create') }}</span>
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
            :placeholder="$t('admin_orders_search_ph')"
            class="w-full"
          />
        </div>
        <div class="bg-surface-border h-6 w-px" />
        <UInput
          v-model="startDate"
          type="date"
          size="sm"
          class="w-36"
          :placeholder="$t('admin_orders_date_from')"
        />
        <UInput
          v-model="endDate"
          type="date"
          size="sm"
          class="w-36"
          :placeholder="$t('admin_orders_date_to')"
        />
        <UButton
          v-if="activeFilterCount > 0"
          variant="ghost"
          color="error"
          size="sm"
          icon="i-lucide-x"
          @click="clearFilters"
          >{{ $t('public_blog_btn_clear') }}</UButton
        >
      </div>
      <!-- Mobile search -->
      <div class="mb-4 lg:hidden">
        <BaseSearchInput
          v-model="search"
          :placeholder="$t('admin_orders_search_ph_mobile')"
          class="w-full"
        />
      </div>
      <!-- Mobile filter slideover -->
      <USlideover v-model:open="showFilters" side="bottom" :title="$t('admin_orders_filter_title')">
        <template #body>
          <div class="space-y-4">
            <UFormField :label="$t('status')">
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
            <UFormField :label="$t('admin_orders_filter_date')">
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
              >{{ $t('public_blog_btn_clear') }}</UButton
            >
            <UButton
              color="primary"
              class="flex-1 justify-center"
              @click="
                () => {
                  showFilters = false
                }
              "
              >{{ $t('admin_orders_btn_apply') }}</UButton
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
            <span class="text-primary-700 dark:text-primary-300 text-sm font-medium">{{
              $t('admin_orders_selected_count', { count: selectedOrders.size })
            }}</span>
          </div>
          <div class="flex items-center gap-2">
            <UButton variant="ghost" color="neutral" size="sm" @click="clearSelection">{{
              $t('admin_orders_btn_deselect')
            }}</UButton>
            <UButton
              size="sm"
              icon="i-lucide-truck"
              @click="
                () => {
                  showBatchModal = true
                }
              "
            >
              {{ $t('admin_orders_btn_assign', { count: '' }).replace('()', '').trim() }}
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
              <template #default>{{
                $t('admin_customers_pagination_per_page', { limit })
              }}</template>
            </USelectMenu>
          </div>
          <UPagination v-model:page="page" :total="total" :items-per-page="limit" :max="5" />
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
