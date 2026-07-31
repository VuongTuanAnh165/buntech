<script setup lang="ts">
import { Plus, Download, Copy, Truck, Eye } from 'lucide-vue-next'
import { OrderStatus, ORDER_STATUS_COLORS } from '../../../core/enums'
import { mockOrders, mockUsers } from '~/core/mockData'

const { t } = useI18n()
const toast = useToast()
const router = useRouter()
const { formatVND, formatDate } = useFormat()
const { downloadCSV } = useExportCSV()
useHead({ title: `${t('nav.orders')} - BunTech Admin` })
definePageMeta({ layout: 'admin' })

const loading = ref(true)
const error = ref(false)
const { handleError } = useErrorHandler()
const rows = ref<Record<string, unknown>[]>([])
const total = ref(0)
const page = ref(1)
const limit = ref(10)
const search = ref('')
const sortBy = ref('created_at')
const sortDirection = ref<'asc' | 'desc'>('desc')
const statusFilter = ref('')
const startDate = ref('')
const endDate = ref('')
const exporting = ref(false)

const showBatchModal = ref(false)
const selectedOrders = ref<Set<string>>(new Set())
const drivers = ref<Record<string, unknown>[]>([])
const batchDriverId = ref('')
const batchAssigning = ref(false)

const debouncedSearch = useDebounce(search, 300)
const { readFromQuery } = useSyncQuery({ search: debouncedSearch, sortBy, sortDirection, page, limit, statusFilter, startDate, endDate })
watch([debouncedSearch, page, limit, sortBy, sortDirection, statusFilter, startDate, endDate], loadData)

async function loadData() {
  loading.value = true
  error.value = false
  try {
    await new Promise(r => setTimeout(r, 300))
    let data = [...mockOrders.value]
    
    if (debouncedSearch.value) {
      const s = debouncedSearch.value.toLowerCase()
      data = data.filter(o => o.shipping_address?.toLowerCase().includes(s))
    }
    if (statusFilter.value) data = data.filter(o => o.status === statusFilter.value)
    if (startDate.value) data = data.filter(o => o.created_at >= new Date(startDate.value).toISOString())
    if (endDate.value) data = data.filter(o => o.created_at <= new Date(endDate.value + 'T23:59:59').toISOString())
    
    data.sort((a, b) => {
      const aVal = a[sortBy.value as keyof typeof a]
      const bVal = b[sortBy.value as keyof typeof b]
      if (aVal === bVal) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1
      const asc = sortDirection.value === 'asc' ? 1 : -1
      return (aVal < bVal ? -1 : 1) * asc
    })
    
    total.value = data.length
    
    const paginated = data.slice((page.value - 1) * limit.value, page.value * limit.value)
    
    rows.value = paginated.map(o => ({
      ...o,
      user: mockUsers.value.find(u => u.id === o.user_id) || null,
      driver: mockUsers.value.find(u => u.id === o.driver_id) || null
    }))
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

async function loadDrivers() {
  await new Promise(r => setTimeout(r, 300))
  drivers.value = mockUsers.value.filter(u => u.role === 'DRIVER' && u.status === 'ACTIVE')
}

async function exportToday() {
  exporting.value = true
  try {
    await new Promise(r => setTimeout(r, 300))
    const today = new Date().toISOString().slice(0, 10)
    const data = mockOrders.value.filter(o => o.created_at >= today)
    data.sort((a, b) => b.created_at.localeCompare(a.created_at))
    
    const csvData = data.map(o => {
      const user = mockUsers.value.find(u => u.id === o.user_id)
      return {
        id: o.id,
        customer: user?.full_name || '',
        phone: user?.phone || '',
        status: o.status,
        total: o.total,
        collected: o.amount_collected,
        address: o.shipping_address,
        date: o.created_at,
      }
    })
    downloadCSV(csvData, 'Orders_Today.csv')
    toast.success(t('common.export'))
  } catch {
    toast.error(t('errors.unexpected'))
  } finally {
    exporting.value = false
  }
}

function toggleSelectOrder(id: string) {
  if (selectedOrders.value.has(id)) selectedOrders.value.delete(id)
  else selectedOrders.value.add(id)
}

async function batchAssign() {
  if (!batchDriverId.value || selectedOrders.value.size === 0) return
  batchAssigning.value = true
  try {
    await new Promise(r => setTimeout(r, 300))
    for (const id of selectedOrders.value) {
      const order = mockOrders.value.find(o => o.id === id)
      if (order) {
        order.driver_id = batchDriverId.value
        order.status = OrderStatus.SHIPPING
      }
    }
    toast.success(t('orders.assignSuccess'))
    showBatchModal.value = false
    selectedOrders.value.clear()
    batchDriverId.value = ''
    loadData()
  } catch {
    toast.error(t('errors.saveFailed'))
  } finally {
    batchAssigning.value = false
  }
}

function toggleSort(col: string) {
  if (sortBy.value === col) sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  else { sortBy.value = col; sortDirection.value = 'asc' }
}

onMounted(() => {
  loadData()
  loadDrivers()
  // useOrderRealtime(loadData) - Disabled for mock
})

const columns = computed(() => [
  { key: 'select', label: '', width: '40px' },
  { key: 'id', label: 'ID', align: 'center' as const },
  { key: 'user', label: t('orders.customer') },
  { key: 'status', label: t('common.status'), sortable: true },
  { key: 'total', label: t('common.total'), align: 'right' as const, sortable: true },
  { key: 'amount_collected', label: t('orders.amountCollected'), align: 'right' as const },
  { key: 'created_at', label: t('common.createdAt'), sortable: true },
  { key: 'actions', label: t('common.actions'), align: 'right' as const, width: '120px' },
])
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)))
const statusOptions = computed(() => [
  { value: '', label: t('common.all') },
  ...Object.values(OrderStatus).map(s => ({ value: s, label: t(`orderStatus.${s}`) })),
])
</script>

<template>
  <div>
    <AppBreadcrumb :items="[{ label: t('nav.orders') }]" />
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold text-gray-900">{{ t('orders.title') }}</h1>
      <div class="flex gap-2">
        <AppButton variant="outline" :loading="exporting" @click="exportToday">
          <Download class="w-4 h-4" /> {{ t('orders.exportToday') }}
        </AppButton>
        <AppButton variant="outline" :disabled="selectedOrders.size === 0" @click="showBatchModal = true">
          <Truck class="w-4 h-4" /> {{ t('orders.batchAssign') }} ({{ selectedOrders.size }})
        </AppButton>
        <NuxtLink to="/admin/orders/create">
          <AppButton><Plus class="w-4 h-4" /> {{ t('orders.addNew') }}</AppButton>
        </NuxtLink>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-3 mb-4">
      <div class="flex-1 min-w-[200px] max-w-xs"><AppSearchBar v-model="search" /></div>
      <select v-model="statusFilter" class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
        <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      <input v-model="startDate" type="date" class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
      <input v-model="endDate" type="date" class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
    </div>

    <AppErrorState v-if="error" @retry="loadData" />

    <AppTable v-else :columns="columns" :rows="rows" :loading="loading" :sort-by="sortBy" :sort-direction="sortDirection" row-key="id" @sort="toggleSort" @row-dbl-click="(row) => router.push(`/admin/orders/${row.id}`)">
      <template #cell-select="{ row }">
        <input
          v-if="row.status === 'PROCESSING'"
          type="checkbox"
          :checked="selectedOrders.has(row.id as string)"
          class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          @change="toggleSelectOrder(row.id as string)"
          @click.stop
        >
      </template>
      <template #cell-id="{ value }">
        <span class="font-mono text-xs text-gray-400">{{ String(value).slice(0, 8) }}</span>
      </template>
      <template #cell-user="{ value }">
        {{ (value as Record<string, unknown>)?.full_name || 'Khách vãng lai' }}
      </template>
      <template #cell-status="{ value }">
        <AppBadge :color="ORDER_STATUS_COLORS[value as OrderStatus]">{{ t(`orderStatus.${value}`) }}</AppBadge>
      </template>
      <template #cell-total="{ value }">
        <span class="font-medium">{{ formatVND(Number(value)) }}</span>
      </template>
      <template #cell-amount_collected="{ value }">
        {{ formatVND(Number(value)) }}
      </template>
      <template #cell-created_at="{ value }">
        <span class="text-gray-500">{{ formatDate(value as string) }}</span>
      </template>
      <template #cell-actions="{ row }">
        <div class="flex items-center justify-end gap-1">
          <button class="p-1.5 text-gray-400 hover:text-secondary-600 hover:bg-secondary-50 rounded-lg" @click.stop="router.push(`/admin/orders/${row.id}`)"><Eye class="w-4 h-4" /></button>
        </div>
      </template>
      <template #pagination>
        <AppPagination :page="page" :total-pages="totalPages" :total="total" :from="(page - 1) * limit" :to="page * limit - 1" :limit="limit" @update:page="page = $event" @update:limit="limit = $event; page = 1" />
      </template>
    </AppTable>

    <AppModal v-model="showBatchModal" :title="t('orders.batchAssign')" size="sm">
      <p class="text-sm text-gray-600 mb-4">{{ selectedOrders.size }} {{ t('orders.items').toLowerCase() }}</p>
      <AppSelect
        v-model="batchDriverId"
        :label="t('orders.assignDriver')"
        :required="true"
        :options="drivers.map(d => ({ value: d.id as string, label: d.full_name as string }))"
        :placeholder="t('orders.assignDriver')"
      />
      <template #footer>
        <AppButton variant="ghost" @click="showBatchModal = false">{{ t('common.cancel') }}</AppButton>
        <AppButton :loading="batchAssigning" @click="batchAssign">{{ t('orders.assignDriver') }}</AppButton>
      </template>
    </AppModal>
  </div>
</template>
