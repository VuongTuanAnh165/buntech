<script setup lang="ts">
import { Plus } from 'lucide-vue-next'
import { OrderStatus, ORDER_STATUS_COLORS, TransactionType } from '../../core/enums'
import { mockOrders, mockTransactions } from '~/core/mockData'

const { t } = useI18n()
const authStore = useAuthStore()
const { formatVND, formatDate } = useFormat()
useHead({ title: `${t('customer.portalTitle')} - BunTech` })
definePageMeta({ layout: 'default' })

const loading = ref(true)
const orders = ref<Record<string, unknown>[]>([])
const currentDebt = ref(0)

async function loadData() {
  loading.value = true
  try {
    await new Promise(r => setTimeout(r, 300))

    const userOrders = mockOrders.value
      .filter(o => o.user_id === authStore.user?.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 20)

    orders.value = userOrders as Record<string, unknown>[]

    const userTxs = mockTransactions.value.filter(t => t.user_id === authStore.user?.id)

    let debt = 0
    for (const tx of userTxs) {
      if (tx.type === TransactionType.DEBT_INCREASE) debt += Number(tx.amount)
      if (tx.type === TransactionType.DEBT_PAYMENT) debt -= Number(tx.amount)
    }
    currentDebt.value = debt
  } finally {
    loading.value = false
  }
}
onMounted(loadData)
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-bold text-gray-900">{{ t('customer.portalTitle') }}</h1>
      <NuxtLink to="/portal/order"><AppButton><Plus class="w-4 h-4" /> {{ t('customer.placeOrder') }}</AppButton></NuxtLink>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div class="bg-white rounded-2xl border border-gray-100 p-6">
        <p class="text-sm text-gray-500 mb-1">{{ t('customers.currentDebt') }}</p>
        <p :class="['text-2xl font-bold', currentDebt > 0 ? 'text-danger-600' : 'text-success-600']">{{ formatVND(currentDebt) }}</p>
      </div>
      <div class="bg-white rounded-2xl border border-gray-100 p-6">
        <p class="text-sm text-gray-500 mb-1">{{ t('nav.myOrders') }}</p>
        <p class="text-2xl font-bold text-gray-900">{{ orders.length }}</p>
      </div>
    </div>

    <h2 class="text-xl font-bold text-gray-900 mb-4">{{ t('customer.myOrders') }}</h2>
    <template v-if="loading">
      <div v-for="i in 3" :key="i" class="bg-white rounded-xl border border-gray-100 p-4 mb-3">
        <div class="skeleton h-5 w-full mb-2" />
        <div class="skeleton h-4 w-1/2" />
      </div>
    </template>
    <template v-else-if="orders.length">
      <div v-for="order in orders" :key="order.id as string" class="bg-white rounded-xl border border-gray-100 p-4 mb-3">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-mono text-xs text-gray-400 mb-1">#{{ String(order.id).slice(0, 8) }}</p>
            <AppBadge :color="ORDER_STATUS_COLORS[order.status as OrderStatus]">{{ t(`orderStatus.${order.status}`) }}</AppBadge>
          </div>
          <div class="text-right">
            <p class="font-bold text-gray-900">{{ formatVND(Number(order.total)) }}</p>
            <p class="text-xs text-gray-500">{{ formatDate(order.created_at as string) }}</p>
          </div>
        </div>
      </div>
    </template>
    <AppEmptyState v-else :title="t('customer.noOrders')" :cta-text="t('customer.placeOrder')" @action="$router.push('/portal/order')" />
  </div>
</template>
