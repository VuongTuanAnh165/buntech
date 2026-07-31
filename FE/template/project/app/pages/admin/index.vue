<script setup lang="ts">
import { Wallet, ShoppingCart, Users, Boxes, TrendingUp } from 'lucide-vue-next'
import { mockOrders, mockUsers, mockInventoryItems } from '~/core/mockData'

const { t } = useI18n()
const authStore = useAuthStore()
const { formatVND, formatDate } = useFormat()

useHead({ title: `${t('nav.dashboard')} - BunTech Admin` })
definePageMeta({ layout: 'admin' })

const loading = ref(true)
const error = ref(false)
const kpi = ref({ revenueToday: 0, ordersToday: 0, newCustomers: 0, inventoryValue: 0 })
const topBuyers = ref<{ user_id: string; full_name: string; avatar_url: string | null; total: number }[]>([])

const startDate = ref(new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10))
const endDate = ref(new Date().toISOString().slice(0, 10))
const chartData = ref<{ date: string; revenue: number }[]>([])

async function loadDashboard() {
  loading.value = true
  error.value = false
  try {
    await new Promise(r => setTimeout(r, 300))
    const today = new Date().toISOString().slice(0, 10)
    
    const todayOrders = mockOrders.value.filter(o => o.created_at >= today)
    const ordersToday = todayOrders.length
    
    const newCustomersCount = mockUsers.value.filter(u => u.role === 'CUSTOMER' && u.created_at >= today).length
    
    const inventoryData = mockInventoryItems.value.filter(i => !i.deleted_at)
    
    kpi.value.ordersToday = ordersToday
    kpi.value.revenueToday = todayOrders.reduce((sum, o) => sum + Number(o.total), 0)
    kpi.value.newCustomers = newCustomersCount
    kpi.value.inventoryValue = inventoryData.reduce((sum, i) => sum + Number(i.quantity * (i.estimated_cost || 0)), 0)

    // Revenue chart
    const start = new Date(startDate.value).toISOString()
    const end = new Date(endDate.value + 'T23:59:59').toISOString()
    
    const rangeOrders = mockOrders.value.filter(o => o.created_at >= start && o.created_at <= end).sort((a, b) => a.created_at.localeCompare(b.created_at))
    
    const byDate: Record<string, number> = {}
    for (const o of rangeOrders) {
      const d = o.created_at.slice(0, 10)
      byDate[d] = (byDate[d] || 0) + Number(o.total)
    }
    chartData.value = Object.entries(byDate).map(([date, revenue]) => ({ date, revenue }))

    // Top buyers
    const orders = mockOrders.value.filter(o => o.user_id).sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 200)
    
    const buyerMap: Record<string, { full_name: string; avatar_url: string | null; total: number }> = {}
    for (const o of orders) {
      if (!o.user_id) continue
      const user = mockUsers.value.find(u => u.id === o.user_id)
      if (!buyerMap[o.user_id]) {
        buyerMap[o.user_id] = { full_name: user?.full_name || '', avatar_url: user?.avatar_url || null, total: 0 }
      }
      buyerMap[o.user_id].total += Number(o.total)
    }
    topBuyers.value = Object.entries(buyerMap)
      .map(([user_id, v]) => ({ user_id, ...v }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(loadDashboard)
watch([startDate, endDate], loadDashboard)

const kpiCards = computed(() => [
  { label: t('dashboard.revenueToday'), value: formatVND(kpi.value.revenueToday), icon: Wallet, color: 'primary' },
  { label: t('dashboard.ordersToday'), value: `${kpi.value.ordersToday} ${t('dashboard.orders')}`, icon: ShoppingCart, color: 'secondary' },
  { label: t('dashboard.newCustomers'), value: `${kpi.value.newCustomers} ${t('dashboard.customers')}`, icon: Users, color: 'success' },
  { label: t('dashboard.inventoryValue'), value: formatVND(kpi.value.inventoryValue), icon: Boxes, color: 'accent' },
])
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">{{ t('dashboard.title') }}</h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <template v-if="loading">
        <div v-for="i in 4" :key="i" class="bg-white rounded-xl border border-gray-100 p-5">
          <div class="skeleton h-12 w-12 rounded-lg mb-3" />
          <div class="skeleton h-4 w-24 mb-2" />
          <div class="skeleton h-6 w-20" />
        </div>
      </template>
      <template v-else>
        <div v-for="card in kpiCards" :key="card.label" class="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-3">
            <div :class="['w-12 h-12 rounded-lg flex items-center justify-center', `bg-${card.color}-100`]">
              <component :is="card.icon" :class="['w-6 h-6', `text-${card.color}-600`]" />
            </div>
          </div>
          <p class="text-sm text-gray-500 mb-1">{{ card.label }}</p>
          <p class="text-xl font-bold text-gray-900">{{ card.value }}</p>
        </div>
      </template>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold text-gray-900">{{ t('dashboard.revenueChart') }}</h2>
          <div class="flex items-center gap-2">
            <input v-model="startDate" type="date" class="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500" :max="endDate">
            <span class="text-gray-400">→</span>
            <input v-model="endDate" type="date" class="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500" :max="new Date().toISOString().slice(0,10)" :min="startDate">
          </div>
        </div>
        <template v-if="loading">
          <div class="skeleton h-64 w-full rounded-lg" />
        </template>
        <template v-else>
          <LazyDashboardChart v-if="chartData.length" :data="chartData" />
          <AppEmptyState v-else />
        </template>
      </div>

      <div class="bg-white rounded-xl border border-gray-100 p-5">
        <h2 class="font-semibold text-gray-900 mb-4">{{ t('dashboard.topBuyers') }}</h2>
        <template v-if="loading">
          <div v-for="i in 5" :key="i" class="flex items-center gap-3 mb-4">
            <div class="skeleton w-10 h-10 rounded-full" />
            <div class="flex-1">
              <div class="skeleton h-4 w-24 mb-2" />
              <div class="skeleton h-3 w-16" />
            </div>
          </div>
        </template>
        <template v-else-if="topBuyers.length">
          <div v-for="(buyer, i) in topBuyers" :key="buyer.user_id" class="flex items-center gap-3 py-2">
            <span class="text-sm font-bold text-gray-400 w-5">{{ i + 1 }}</span>
            <AppAvatar :name="buyer.full_name" :src="buyer.avatar_url" size="sm" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ buyer.full_name }}</p>
              <p class="text-xs text-gray-500">{{ formatVND(buyer.total) }}</p>
            </div>
          </div>
        </template>
        <AppEmptyState v-else />
      </div>
    </div>
  </div>
</template>
