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

const tabs = computed(() => [
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
])

const statCards = computed(() => [
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
])

const showCustomerEdit = ref(false)

const isPublic = ref(customer.value?.profile?.isPublic ?? false)

watch(
  () => customer.value?.profile?.isPublic,
  (newVal) => {
    isPublic.value = newVal ?? false
  }
)

const isTogglingPublic = ref(false)
const handleTogglePublic = async (value: boolean) => {
  isTogglingPublic.value = true
  try {
    isPublic.value = value // Optimistic UI update

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
                    ? $t('admin_role_admin')
                    : customer.role === 'DRIVER'
                      ? $t('admin_role_driver')
                      : $t('common_customer')
                }}
              </UBadge>
              <UBadge v-if="isPublic" color="info" variant="soft" icon="i-lucide-map-pin">
                {{ $t('admin_customer_detail_public') }}
              </UBadge>
            </div>
          </div>
          <div class="flex flex-shrink-0 flex-col items-end gap-3">
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
