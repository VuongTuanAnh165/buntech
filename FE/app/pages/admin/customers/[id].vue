<script setup lang="ts">
import { mockOrders, mockTransactions, mockCustomPrices, mockProducts } from '~/utils/mockData'
import type { Order, Transaction, CustomPrice, Product } from '~/utils/types'
import { ConstantKey } from '~/enums/constantKeys'
import CustomerAddressBook from '~/components/features/admin/customers/CustomerAddressBook.vue'
import CustomerFormDrawer from '~/components/features/admin/customers/CustomerFormDrawer.vue'

import { useUsers } from '~/composables/admin/useUsers'

const { constants } = useMasterData()
const route = useRoute()
const { getUser, fetchAddresses } = useUsers()

definePageMeta({ layout: 'admin' })

const customerId = route.params.id as string

const activeTab = ref('orders')

const orders = ref<Order[]>([])
const transactions = ref<Transaction[]>([])
const customPrices = ref<(CustomPrice & { product?: Product | null })[]>([])

const showPriceModal = ref(false)
const priceForm = ref({ product_id: '', price: 0 })

const {
  data: customerData,
  status: customerStatus,
  error: customerError,
  refresh: refreshCustomer
} = useAsyncData(`admin-user-${customerId}`, () => getUser(customerId))

const customer = computed(() => customerData.value?.data || null)
const loading = computed(() => customerStatus.value === 'pending')
const error = computed(() => !!customerError.value)

const {
  data: addressesData,
  status: addressStatus,
  refresh: refreshAddresses
} = useAsyncData(`admin-addresses-${customerId}`, () => fetchAddresses(customerId))

const addresses = computed(() => addressesData.value?.data || [])
const addressLoading = computed(() => addressStatus.value === 'pending')

const currentDebt = computed(() => {
  let debt = 0
  for (const tx of transactions.value) {
    if (tx.type === constants.value?.[ConstantKey.TransactionType]?.DEBT_INCREASE) debt += tx.amount
    if (tx.type === constants.value?.[ConstantKey.TransactionType]?.DEBT_PAYMENT) debt -= tx.amount
  }
  return debt
})

const debtLimit = computed(() => Number(customer.value?.profile?.debtLimit ?? 0))
const _debtRemaining = computed(() => Math.max(0, debtLimit.value - currentDebt.value))
const _debtUtilization = computed(() =>
  debtLimit.value > 0 ? Math.min(100, Math.round((currentDebt.value / debtLimit.value) * 100)) : 0
)

const totalOrders = computed(() => orders.value.length)
const totalSpent = computed(() => orders.value.reduce((s, o) => s + o.total, 0))
const avgOrderValue = computed(() =>
  totalOrders.value > 0 ? Math.round(totalSpent.value / totalOrders.value) : 0
)

const debtTransactions = computed(() =>
  transactions.value.filter(
    (tx) =>
      tx.type === constants.value?.[ConstantKey.TransactionType]?.DEBT_INCREASE ||
      tx.type === constants.value?.[ConstantKey.TransactionType]?.DEBT_PAYMENT
  )
)

const tabs = computed(() => [
  {
    value: 'orders',
    label: 'Lịch sử đơn hàng',
    icon: 'i-lucide-shopping-bag',
    count: orders.value.length
  },
  {
    value: 'debt',
    label: 'Công nợ',
    icon: 'i-lucide-wallet',
    count: debtTransactions.value.length
  },
  {
    value: 'addresses',
    label: 'Sổ địa chỉ',
    icon: 'i-lucide-map-pin',
    count: addresses.value.length
  },
  {
    value: 'prices',
    label: 'Bảng giá riêng',
    icon: 'i-lucide-tag',
    count: customPrices.value.length
  }
])

const statCards = computed(() => [
  {
    title: 'Tổng đơn hàng',
    value: totalOrders.value,
    icon: 'i-lucide-shopping-bag',
    color: 'primary' as const
  },
  {
    title: 'Tổng chi tiêu',
    value: formatVND(totalSpent.value),
    icon: 'i-lucide-trending-up',
    color: 'success' as const
  },
  {
    title: 'Công nợ hiện tại',
    value: formatVND(currentDebt.value),
    icon: 'i-lucide-wallet',
    color: currentDebt.value > 0 ? ('error' as const) : ('success' as const)
  },
  {
    title: 'Giá trị TB/đơn',
    value: formatVND(avgOrderValue.value),
    icon: 'i-lucide-credit-card',
    color: 'info' as const
  }
])

// Load mocks for features not yet integrated with API
onMounted(() => {
  orders.value = mockOrders
    .filter((o) => o.user_id === customerId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  transactions.value = mockTransactions
    .filter((tx) => tx.user_id === customerId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const cps = mockCustomPrices.filter((cp) => cp.user_id === customerId)
  customPrices.value = cps
    .map((cp) => {
      const product = mockProducts.find((p) => p.id === cp.product_id) || null
      return { ...cp, product }
    })
    .sort((a, b) => b.price - a.price)
})

const showCustomerEdit = ref(false)

function openAddPrice() {
  priceForm.value = { product_id: '', price: 0 }
  showPriceModal.value = true
}

function savePrice() {
  showPriceModal.value = false
}

function deletePrice(id: string) {
  customPrices.value = customPrices.value.filter((c) => c.id !== id)
}
</script>

<template>
  <div class="space-y-6">
    <BasePageHeader
      :title="customer?.fullName || 'Chi tiết khách hàng'"
      :breadcrumbs="[
        { label: 'Khách hàng', to: '/admin/customers' },
        { label: customer?.fullName || 'Chi tiết' }
      ]"
    />

    <BaseEmptyState
      v-if="error"
      icon="i-lucide-alert-circle"
      title="Lỗi tải dữ liệu"
      description="Không thể tải thông tin khách hàng."
    >
      <template #action>
        <UButton color="primary" @click="refreshCustomer()">Thử lại</UButton>
      </template>
    </BaseEmptyState>

    <template v-else-if="loading">
      <div class="space-y-4">
        <div class="card animate-fade-in-up p-6">
          <div class="flex items-center gap-4">
            <div class="skeleton h-16 w-16 rounded-full" />
            <div class="flex-1 space-y-2">
              <div class="skeleton h-5 w-48" />
              <div class="skeleton h-4 w-32" />
              <div class="flex gap-2">
                <div class="skeleton h-6 w-20 rounded-full" />
                <div class="skeleton h-6 w-20 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="customer">
      <UCard class="animate-fade-in-up relative mb-6 overflow-hidden">
        <div
          class="from-primary-500/8 dark:from-primary-400/8 absolute -top-16 -right-16 h-56 w-56 rounded-full bg-gradient-to-br to-blue-500/8 blur-3xl dark:to-blue-400/8"
          aria-hidden="true"
        />
        <div class="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <UAvatar
            :alt="customer.fullName"
            :src="customer.profile?.avatarUrl || undefined"
            size="3xl"
          />
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-3">
              <h1 class="text-surface-foreground text-xl font-bold tracking-tight sm:text-2xl">
                {{ customer.fullName }}
              </h1>
              <UButton
                icon="i-lucide-pencil"
                size="xs"
                variant="ghost"
                color="neutral"
                @click="
                  () => {
                    showCustomerEdit = true
                  }
                "
              />
            </div>
            <div class="mt-1.5 flex flex-wrap items-center gap-3">
              <span class="flex items-center gap-1.5 text-sm text-slate-500 dark:text-zinc-400">
                <span class="i-lucide-phone h-3.5 w-3.5" aria-hidden="true" />
                {{ customer.phoneNumber || 'Chưa có SĐT' }}
              </span>
              <span class="text-slate-300 dark:text-zinc-600">·</span>
              <span class="font-mono text-xs text-slate-400 dark:text-zinc-500"
                >#{{ customer.id }}</span
              >
            </div>
            <div class="mt-2.5 flex flex-wrap items-center gap-2">
              <UBadge
                :color="
                  customer.role === 'DRIVER'
                    ? 'warning'
                    : customer.role === 'ADMIN'
                      ? 'error'
                      : 'success'
                "
                variant="soft"
              >
                {{
                  customer.role === 'ADMIN'
                    ? 'Quản trị viên'
                    : customer.role === 'DRIVER'
                      ? 'Tài xế'
                      : 'Khách hàng'
                }}
              </UBadge>
            </div>
          </div>
          <div class="flex flex-shrink-0 flex-col items-end gap-2">
            <div class="text-right">
              <p class="text-xs text-slate-500 dark:text-zinc-400">Hạn mức công nợ</p>
              <p class="text-surface-foreground text-xl font-bold tabular-nums">
                {{ formatVND(debtLimit) }}
              </p>
            </div>
          </div>
        </div>
      </UCard>

      <BaseStatsGrid :stats="statCards" />

      <UTabs v-model="activeTab" :items="tabs" class="mt-6 w-full" :ui="{ content: 'mt-6' }">
        <template #content="{ item }">
          <Transition name="fade" mode="out-in">
            <!-- ===== Orders Tab ===== -->
            <AdminCustomerOrdersTab v-if="item.value === 'orders'" :orders="orders" />
            <!-- ===== Debt Tab ===== -->
            <AdminCustomerDebtTab
              v-else-if="item.value === 'debt'"
              :transactions="transactions"
              :debt-limit="debtLimit"
            />

            <!-- ===== Addresses Tab ===== -->
            <div v-else-if="item.value === 'addresses'" key="addresses" class="animate-fade-in-up">
              <CustomerAddressBook
                :user-id="customerId"
                :addresses="addresses"
                :loading="addressLoading"
                @refresh="refreshAddresses"
              />
            </div>

            <!-- ===== Custom Prices Tab ===== -->
            <div v-else-if="item.value === 'prices'" key="prices" class="animate-fade-in-up">
              <div class="mb-4 flex justify-end">
                <UButton icon="i-lucide-plus" color="primary" @click="openAddPrice"
                  >Thiết lập giá riêng</UButton
                >
              </div>
              <BaseDataTable
                :columns="[
                  { accessorKey: 'product', header: 'Sản phẩm' },
                  { accessorKey: 'unit', header: 'Đơn vị' },
                  { accessorKey: 'default_price', header: 'Giá gốc' },
                  { accessorKey: 'price', header: 'Giá riêng' },
                  { accessorKey: 'discount', header: 'Chiết khấu' },
                  { accessorKey: 'actions', header: '' }
                ]"
                :rows="customPrices"
                empty-title="Chưa có giá riêng"
              >
                <template #product-cell="{ row }">
                  <div class="flex items-center gap-2.5">
                    <span class="text-surface-foreground font-medium">{{
                      row.product?.name || 'Sản phẩm đã xoá'
                    }}</span>
                  </div>
                </template>
                <template #unit-cell="{ row }"
                  ><span class="text-slate-500">{{ row.product?.unit || '—' }}</span></template
                >
                <template #default_price-cell="{ row }"
                  ><span class="text-slate-500 line-through">{{
                    formatVND(Number(row.product?.price ?? 0))
                  }}</span></template
                >
                <template #price-cell="{ row }"
                  ><span class="text-primary-600 font-semibold">{{
                    formatVND(Number(row.price))
                  }}</span></template
                >
                <template #actions-cell="{ row }"
                  ><div class="flex justify-end">
                    <UButton
                      icon="i-lucide-trash-2"
                      color="error"
                      variant="ghost"
                      @click.stop="deletePrice(row.id)"
                    /></div
                ></template>
              </BaseDataTable>
            </div>
          </Transition>
        </template>
      </UTabs>
    </template>

    <CustomerFormDrawer
      v-model:open="showCustomerEdit"
      :user="customer"
      @refresh="refreshCustomer"
    />

    <UModal v-model:open="showPriceModal" title="Thiết lập giá riêng">
      <!-- Mapped Price Modal content from before -->
      <template #body>
        <div class="space-y-4">
          <UFormField label="Giá riêng">
            <UInput v-model="priceForm.price" type="number" />
          </UFormField>
        </div>
      </template>
      <template #footer>
        <UButton color="primary" @click="savePrice">Lưu giá</UButton>
      </template>
    </UModal>
  </div>
</template>
