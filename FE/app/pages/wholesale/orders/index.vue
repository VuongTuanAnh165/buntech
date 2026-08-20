<script setup lang="ts">
import { customerService } from '~/services/customerService'
import { getOrderStatusColor, getOrderStatusLabel } from '~/utils/orderStatus'

const { constants } = useMasterData()

useSeoMeta({ title: 'Lịch sử đơn hàng - BunTech' })
definePageMeta({ layout: 'default' })

const route = useRoute()

const page = ref(Number(route.query.page) || 1)
const limit = ref(10)
const selectedStatus = ref<string | undefined>((route.query.status as string) || undefined)

// Update URL without page reload when filters change
watch(
  [page, limit, selectedStatus],
  async ([newPage, newLimit, newStatus]) => {
    await navigateTo({
      query: {
        ...route.query,
        page: newPage > 1 ? newPage : undefined,
        limit: newLimit !== 10 ? newLimit : undefined,
        status: newStatus || undefined
      }
    })
  },
  { deep: true }
)

// Status options mapping from constants
const statusOptions = computed(() => {
  const orderStatusObj = constants.value?.OrderStatus || {}
  const labels = getOrderStatusLabel(constants)
  // Get unique values since enums might have aliases (e.g. CANCELED vs CANCELLED)
  const uniqueValues = Array.from(new Set(Object.values(orderStatusObj)))

  const options = uniqueValues.map((enumValue) => ({
    label: (labels as Record<string, string>)[enumValue as string] || enumValue,
    value: enumValue
  }))

  return [{ label: 'Tất cả trạng thái', value: undefined }, ...options]
})

const actualStatus = computed(() => {
  if (!selectedStatus.value) return undefined
  // Ensure we get primitive value if Nuxt UI passes object
  return typeof selectedStatus.value === 'object'
    ? (selectedStatus.value as Record<string, string>).value
    : selectedStatus.value
})

// Data fetching
const { data: ordersResponse, pending: loading } = useAsyncData(
  'wholesale-orders-list',
  () =>
    customerService.getOrders({
      page: page.value,
      limit: limit.value,
      status: actualStatus.value
    }),
  {
    watch: [page, limit, actualStatus]
  }
)

const orders = computed(() => ordersResponse.value?.data?.data || [])
const totalOrders = computed(() => ordersResponse.value?.data?.meta?.total || 0)

const tableColumns = [
  { accessorKey: 'id', header: 'Mã đơn' },
  { accessorKey: 'createdAt', header: 'Ngày đặt' },
  { accessorKey: 'status', header: 'Trạng thái' },
  { accessorKey: 'totalAmount', header: 'Tổng tiền' },
  { accessorKey: 'actions', header: '' }
]

const handleStatusChange = (val: string | Record<string, string> | undefined) => {
  // If Nuxt UI emits an object, extract the value
  const extractedValue = typeof val === 'object' && val !== null ? val.value : val
  selectedStatus.value = extractedValue as string | undefined
  page.value = 1
}
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
    <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <NuxtLink
          to="/wholesale"
          class="hover:text-primary-600 dark:hover:text-primary-400 mb-2 inline-flex items-center text-sm font-medium text-slate-500 dark:text-zinc-400"
        >
          <UIcon name="i-lucide-arrow-left" class="mr-1 h-4 w-4" />
          Quay lại tổng quan
        </NuxtLink>
        <h1 class="text-surface-foreground text-2xl font-bold tracking-tight sm:text-3xl">
          Lịch sử đơn hàng
        </h1>
        <p class="mt-2 text-sm text-slate-500 dark:text-zinc-400">
          Xem và theo dõi trạng thái các đơn hàng bạn đã đặt.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <USelectMenu
          v-model="selectedStatus"
          :items="statusOptions"
          value-key="value"
          label-key="label"
          placeholder="Lọc theo trạng thái"
          class="w-48"
          @update:model-value="handleStatusChange"
        />
        <UButton to="/wholesale/order" icon="i-lucide-plus">Đặt hàng mới</UButton>
      </div>
    </div>

    <div class="card overflow-hidden p-0">
      <BaseDataTable
        :rows="orders"
        :columns="tableColumns"
        :loading="loading"
        empty-title="Không tìm thấy đơn hàng"
        empty-description="Bạn chưa có đơn hàng nào hoặc không có đơn hàng nào khớp với bộ lọc."
        empty-icon="i-lucide-search-x"
        class="w-full"
      >
        <template #id-cell="{ row }">
          <span class="text-surface-foreground font-mono text-xs font-medium"
            >#{{ String(row.id).padStart(6, '0') }}</span
          >
        </template>
        <template #createdAt-cell="{ row }">
          <div class="flex flex-col">
            <span class="text-sm font-medium">{{
              formatDateTime(row.createdAt).split(' ')[0]
            }}</span>
            <span class="text-xs text-slate-500">{{
              formatDateTime(row.createdAt).split(' ')[1]
            }}</span>
          </div>
        </template>
        <template #status-cell="{ row }">
          <UBadge
            :color="getOrderStatusColor(constants)[row.status] as any"
            variant="subtle"
            size="sm"
          >
            {{ getOrderStatusLabel(constants)[row.status] }}
          </UBadge>
        </template>
        <template #totalAmount-cell="{ row }">
          <span class="text-surface-foreground font-semibold tabular-nums">{{
            formatVND(Number(row.totalAmount))
          }}</span>
        </template>
        <template #actions-cell="{ row }">
          <div class="flex justify-end">
            <UButton
              variant="ghost"
              color="neutral"
              icon="i-lucide-eye"
              size="sm"
              :to="`/wholesale/orders/${row.id}`"
            >
              Chi tiết
            </UButton>
          </div>
        </template>
      </BaseDataTable>
      <div v-if="totalOrders > 0" class="border-surface-border flex justify-end border-t p-4">
        <UPagination v-model:page="page" :total="totalOrders" :items-per-page="limit" />
      </div>
    </div>
  </div>
</template>
