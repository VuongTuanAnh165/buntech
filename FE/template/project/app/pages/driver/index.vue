<script setup lang="ts">
import { mockOrders, mockUsers } from '~/core/mockData'
import { RefreshCw, MapPin, Phone, User, Wallet } from 'lucide-vue-next'
import { OrderStatus, ORDER_STATUS_COLORS } from '../../core/enums'
const { t } = useI18n()
const authStore = useAuthStore()
const router = useRouter()
const { formatVND, formatDate } = useFormat()
useHead({ title: `${t('driver.title')} - BunTech` })
definePageMeta({ layout: 'driver' })

const loading = ref(true)
const refreshing = ref(false)
const orders = ref<Record<string, unknown>[]>([])
const error = ref(false)

async function loadData() {
  loading.value = true
  error.value = false
  try {
    await new Promise(r => setTimeout(r, 300))
    orders.value = mockOrders.value
      .filter(o => o.driver_id === authStore.user?.id)
      .filter(o => [OrderStatus.SHIPPING, OrderStatus.PROCESSING].includes(o.status as OrderStatus))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map(o => ({
        id: o.id,
        status: o.status,
        total: o.total,
        amount_collected: o.amount_collected,
        shipping_address: o.shipping_address,
        note: o.note,
        created_at: o.created_at,
        user: mockUsers.value.find(u => u.id === o.user_id) || null
      })) as Record<string, unknown>[]
  } catch {
    error.value = true
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

async function refresh() {
  refreshing.value = true
  await loadData()
}

onMounted(loadData)
</script>

<template>
  <div class="p-4">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-bold text-gray-900">{{ t('driver.todayRoutes') }}</h1>
      <button class="p-2 text-gray-500 hover:text-primary-600" :disabled="refreshing" @click="refresh">
        <RefreshCw :class="['w-5 h-5', refreshing ? 'animate-spin' : '']" />
      </button>
    </div>

    <AppErrorState v-if="error" @retry="loadData" />

    <template v-if="loading">
      <div v-for="i in 3" :key="i" class="bg-white rounded-xl border border-gray-100 p-4 mb-3">
        <div class="skeleton h-5 w-3/4 mb-2" />
        <div class="skeleton h-4 w-1/2" />
      </div>
    </template>
    <template v-else-if="orders.length">
      <div v-for="order in orders" :key="order.id as string" class="bg-white rounded-xl border border-gray-100 p-4 mb-3" @click="router.push(`/driver/${order.id}`)">
        <div class="flex items-start justify-between mb-3">
          <div>
            <p class="font-mono text-xs text-gray-400">#{{ String(order.id).slice(0, 8) }}</p>
            <p class="font-semibold text-gray-900">{{ (order.user as Record<string, unknown>)?.full_name || 'Khách' }}</p>
          </div>
          <AppBadge :color="ORDER_STATUS_COLORS[order.status as OrderStatus]">{{ t(`orderStatus.${order.status}`) }}</AppBadge>
        </div>
        <div class="space-y-1.5 text-sm text-gray-600">
          <div class="flex items-center gap-2"><MapPin class="w-4 h-4 text-gray-400 flex-shrink-0" /><span class="line-clamp-1">{{ order.shipping_address }}</span></div>
          <div class="flex items-center gap-2"><Wallet class="w-4 h-4 text-gray-400 flex-shrink-0" /><span>{{ formatVND(Number(order.total)) }}</span></div>
        </div>
      </div>
    </template>
    <AppEmptyState v-else :title="t('driver.noRoutes')" />
  </div>
</template>
