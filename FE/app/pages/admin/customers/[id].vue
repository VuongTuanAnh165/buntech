<script setup lang="ts">
import { ConstantKey } from '~/enums/constantKeys'
import { useAdminOrders } from '~/composables/admin/useAdminOrders'
import { transactionService } from '~/services/transactionService'
import CustomerAddressBook from '~/components/features/admin/customers/CustomerAddressBook.vue'
import CustomerFormDrawer from '~/components/features/admin/customers/CustomerFormDrawer.vue'
import CustomerPricesTab from '~/components/features/admin/customers/CustomerPricesTab.vue'

import { useUsers } from '~/composables/admin/useUsers'
import { t } from '~/utils/i18n'

const { constants } = useMasterData()
const route = useRoute()
const { getUser, fetchAddresses, updateProfile } = useUsers()

definePageMeta({ layout: 'admin' })

const customerId = route.params.id as string

const activeTab = ref('orders')

const { fetchOrders } = useAdminOrders()

const { data: ordersData } = useAsyncData(`admin-orders-${customerId}`, () =>
  fetchOrders({ userId: customerId, limit: 100 })
)
const orders = computed(() => ordersData.value?.data?.data || [])

const { data: driverOrdersData } = useAsyncData(`admin-driver-orders-${customerId}`, () =>
  fetchOrders({ driverId: customerId, limit: 100 })
)
const driverOrders = computed(() => driverOrdersData.value?.data?.data || [])

const { data: transactionsData } = useAsyncData(`admin-transactions-${customerId}`, () =>
  transactionService.getTransactions(1, 100, undefined, Number(customerId))
)
const transactions = computed(() => transactionsData.value?.data?.data || [])

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

const isPublic = computed(() => {
  const val = customer.value?.profile?.isPublic ?? customer.value?.profile?.is_public
  return val === true || val === 1 || val === '1'
})
const debtLimit = computed(() => {
  const limit = customer.value?.profile?.debtLimit || customer.value?.profile?.debt_limit
  return limit ? Number(limit) : 0
})
const currentDebt = computed(() => {
  const debt = customer.value?.profile?.currentDebt || customer.value?.profile?.current_debt
  return debt ? Number(debt) : 0
})
const customerType = computed(
  () => customer.value?.profile?.customerType || customer.value?.profile?.customer_type
)
const storeName = computed(
  () => customer.value?.profile?.storeName || customer.value?.profile?.store_name
)
const avatarUrl = computed(
  () => customer.value?.profile?.avatarUrl || customer.value?.profile?.avatar_url
)

const roleLabel = computed(() => {
  const roles = constants.value?.[ConstantKey.Role] || {}
  const role = customer.value?.role
  return role ? roles[role] || role : ''
})

const customerTypeLabel = computed(() => {
  const types = constants.value?.[ConstantKey.CustomerType] || {}
  const type = customerType.value
  return type ? types[type] || type : ''
})

const _debtUtilization = computed(() =>
  debtLimit.value > 0 ? Math.min(100, Math.round((currentDebt.value / debtLimit.value) * 100)) : 0
)

const totalOrders = computed(() => orders.value.length)
const totalSpent = computed(() => orders.value.reduce((s, o) => s + Number(o.totalAmount || 0), 0))
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

const driverTotalDelivered = computed(
  () => driverOrders.value.filter((o) => o.status === 'delivered').length
)
const driverTotalPending = computed(
  () => driverOrders.value.filter((o) => o.status !== 'delivered' && o.status !== 'canceled').length
)
const driverCodCollected = computed(() =>
  driverOrders.value
    .filter((o) => o.status === 'delivered')
    .reduce((sum, o) => sum + Number(o.amountCollected || 0), 0)
)

const tabs = computed(() => {
  const role = customer.value?.role
  if (role === 'customer' || role === 'CUSTOMER') {
    return [
      {
        value: 'orders',
        label: t('wholesale_orders_title'),
        icon: 'i-lucide-shopping-bag',
        count: orders.value.length
      },
      {
        value: 'debt',
        label: t('nav_debt'),
        icon: 'i-lucide-wallet',
        count: debtTransactions.value.length
      },
      {
        value: 'addresses',
        label: t('admin_address_title'),
        icon: 'i-lucide-map-pin',
        count: addresses.value.length
      },
      {
        value: 'prices',
        label: t('admin_customer_detail_tab_price'),
        icon: 'i-lucide-tag'
      }
    ]
  } else if (role === 'driver' || role === 'DRIVER') {
    return [
      {
        value: 'driver-orders',
        label: 'Danh sách giao hàng',
        icon: 'i-lucide-list-ordered',
        count: driverOrders.value.length
      }
    ]
  }
  return []
})

const statCards = computed(() => {
  const role = customer.value?.role
  if (role === 'customer' || role === 'CUSTOMER') {
    return [
      {
        title: t('admin_order_kpi_total'),
        value: totalOrders.value,
        icon: 'i-lucide-shopping-bag',
        color: 'primary' as const
      },
      {
        title: t('wholesale_kpi_total_spent'),
        value: formatVND(totalSpent.value),
        icon: 'i-lucide-trending-up',
        color: 'success' as const
      },
      {
        title: t('admin_customer_debt_cur'),
        value: formatVND(currentDebt.value),
        icon: 'i-lucide-wallet',
        color: currentDebt.value > 0 ? ('error' as const) : ('success' as const)
      },
      {
        title: t('admin_customer_detail_kpi_avg'),
        value: formatVND(avgOrderValue.value),
        icon: 'i-lucide-credit-card',
        color: 'info' as const
      }
    ]
  } else if (role === 'driver' || role === 'DRIVER') {
    return [
      {
        title: 'Đơn hàng được giao',
        value: driverOrders.value.length,
        icon: 'i-lucide-truck',
        color: 'primary' as const
      },
      {
        title: 'Giao thành công',
        value: driverTotalDelivered.value,
        icon: 'i-lucide-check-circle',
        color: 'success' as const
      },
      {
        title: 'Đang xử lý',
        value: driverTotalPending.value,
        icon: 'i-lucide-clock',
        color: 'warning' as const
      },
      {
        title: 'Tiền thu hộ (COD)',
        value: formatVND(driverCodCollected.value),
        icon: 'i-lucide-banknote',
        color: 'info' as const
      }
    ]
  }
  return []
})

const showCustomerEdit = ref(false)

const isTogglingPublic = ref(false)
const handleTogglePublic = async (value: boolean) => {
  isTogglingPublic.value = true
  try {
    await updateProfile(customerId, { isPublic: value })

    // Sync backing data to avoid reverting if another part of the page refreshes
    if (customerData.value?.data?.profile) {
      customerData.value.data.profile.isPublic = value
    }
  } catch {
    // Error handled globally by ApiClient
  } finally {
    isTogglingPublic.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <BasePageHeader
      :title="customer?.fullName || $t('admin_customer_detail_title_fallback')"
      :breadcrumbs="[
        { label: $t('common_customer'), to: '/admin/customers' },
        { label: customer?.fullName || $t('driver_delivery_btn_detail') }
      ]"
    />

    <BaseEmptyState
      v-if="error"
      icon="i-lucide-alert-circle"
      :title="$t('admin_customers_err_title')"
      :description="$t('admin_customer_detail_err_desc')"
    >
      <template #action>
        <UButton color="primary" @click="refreshCustomer()">{{ $t('error_btn_retry') }}</UButton>
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
            :src="getImageUrl(avatarUrl || undefined) || undefined"
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
            <template v-if="customer.role === 'customer' || customer.role === 'CUSTOMER'">
              <div v-if="storeName" class="mt-1 flex items-center gap-2">
                <UIcon name="i-lucide-store" class="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                <span class="text-sm font-medium text-slate-600 dark:text-zinc-300">
                  {{ storeName }}
                </span>
              </div>
            </template>
            <div class="mt-1.5 flex flex-wrap items-center gap-3">
              <span class="flex items-center gap-1.5 text-sm text-slate-500 dark:text-zinc-400">
                <UIcon name="i-lucide-phone" class="h-3.5 w-3.5" aria-hidden="true" />
                {{ customer.phoneNumber || $t('wholesale_no_phone') }}
              </span>
              <span class="text-slate-300 dark:text-zinc-600">·</span>
              <span class="font-mono text-xs text-slate-400 dark:text-zinc-500"
                >#{{ customer.id }}</span
              >
            </div>
            <div class="mt-2.5 flex flex-wrap items-center gap-2">
              <UBadge
                :color="
                  customer.role === 'driver'
                    ? 'warning'
                    : customer.role === 'admin'
                      ? 'error'
                      : 'success'
                "
                variant="soft"
              >
                {{ roleLabel }}
              </UBadge>
              <template v-if="customer.role === 'customer' || customer.role === 'CUSTOMER'">
                <UBadge
                  v-if="customerTypeLabel"
                  :color="customerType === 'wholesale' ? 'secondary' : 'neutral'"
                  variant="soft"
                >
                  {{ customerTypeLabel }}
                </UBadge>
                <UBadge v-if="isPublic" color="info" variant="soft" icon="i-lucide-map-pin">
                  {{ $t('admin_customer_detail_public') }}
                </UBadge>
              </template>
            </div>
          </div>
          <div
            v-if="customer.role === 'customer' || customer.role === 'CUSTOMER'"
            class="flex flex-shrink-0 flex-col items-end gap-3"
          >
            <div class="text-right">
              <p class="text-xs text-slate-500 dark:text-zinc-400">
                {{ $t('admin_customer_debt_limit') }}
              </p>
              <p class="text-surface-foreground text-xl font-bold tabular-nums">
                {{ formatVND(debtLimit) }}
              </p>
            </div>
            <div
              v-if="customer.role === 'customer' || customer.role === 'CUSTOMER'"
              class="flex items-center gap-2"
            >
              <span class="text-xs text-slate-500 dark:text-zinc-400">{{
                $t('admin_customer_detail_public_map')
              }}</span>
              <USwitch
                :model-value="isPublic"
                :loading="isTogglingPublic"
                size="sm"
                @update:model-value="handleTogglePublic"
              />
            </div>
          </div>
        </div>
      </UCard>

      <BaseStatsGrid v-if="statCards.length > 0" :stats="statCards" />

      <BaseEmptyState
        v-if="customer.role === 'admin' || customer.role === 'ADMIN'"
        icon="i-lucide-shield"
        title="Tài khoản Quản trị viên"
        description="Quản trị viên sử dụng hệ thống để điều hành, không có dữ liệu giao dịch."
        class="mt-6"
      />

      <UTabs
        v-if="tabs.length > 0"
        v-model="activeTab"
        :items="tabs"
        class="mt-6 w-full"
        :ui="{ content: 'mt-6' }"
      >
        <template #content="{ item }">
          <Transition name="fade" mode="out-in">
            <!-- ===== Orders Tab ===== -->
            <AdminCustomerOrdersTab v-if="item.value === 'orders'" :orders="orders" />
            <!-- ===== Driver Orders Tab ===== -->
            <AdminCustomerOrdersTab
              v-else-if="item.value === 'driver-orders'"
              :orders="driverOrders"
            />
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
              <CustomerPricesTab :user-id="customerId" />
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
  </div>
</template>
