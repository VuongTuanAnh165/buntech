<script setup lang="ts">
import { customerService } from '~/services/customerService'
import { getOrderStatusColor, getOrderStatusLabel } from '~/utils/orderStatus'

import { t } from '~/utils/i18n'

const { constants } = useMasterData()

useSeoMeta({ title: t('wholesale_orders_seo_title') })
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

  return [{ label: t('admin_blog_status_all'), value: undefined }, ...options]
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

const tableColumns = computed(() => [
  { accessorKey: 'id', header: t('wholesale_col_id') },
  { accessorKey: 'createdAt', header: t('wholesale_col_date') },
  { accessorKey: 'status', header: t('status') },
  { accessorKey: 'totalAmount', header: t('wholesale_col_total') },
  { accessorKey: 'actions', header: '' }
])

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
          {{ $t('wholesale_orders_back_overview') }}
        </NuxtLink>
        <h1 class="text-surface-foreground text-2xl font-bold tracking-tight sm:text-3xl">
          {{ $t('wholesale_orders_title') }}
        </h1>
        <p class="mt-2 text-sm text-slate-500 dark:text-zinc-400">
          {{ $t('wholesale_orders_desc') }}
        </p>
      </div>

      <div class="flex items-center gap-3">
        <USelectMenu
          v-model="selectedStatus"
          :items="statusOptions"
          value-key="value"
          label-key="label"
          :placeholder="$t('wholesale_orders_filter_ph')"
          class="w-48"
          @update:model-value="handleStatusChange"
        />
        <UButton to="/wholesale/order" icon="i-lucide-plus">{{
          $t('wholesale_orders_btn_new')
        }}</UButton>
      </div>
    </div>

    <div class="card overflow-hidden p-0">
      <BaseDataTable
        :rows="orders"
        :columns="tableColumns"
        :loading="loading"
        :empty-title="$t('admin_order_list_empty_title')"
        :empty-description="$t('wholesale_orders_empty_desc')"
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
              {{ $t('driver_delivery_btn_detail') }}
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
