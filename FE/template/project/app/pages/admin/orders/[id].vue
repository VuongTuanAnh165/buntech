<script setup lang="ts">
import { ArrowLeft, Copy } from 'lucide-vue-next'
import { OrderStatus, ORDER_STATUS_COLORS } from '../../../core/enums'
import { mockOrders, mockOrderItems, mockUsers, mockProducts } from '~/core/mockData'

const { t } = useI18n()
const toast = useToast()
const route = useRoute()
const router = useRouter()
const { formatVND, formatDateTime } = useFormat()
useHead({ title: `${t('nav.orders')} - BunTech Admin` })
definePageMeta({ layout: 'admin' })

const orderId = route.params.id as string
const loading = ref(true)
const error = ref(false)
const order = ref<Record<string, unknown> | null>(null)
const items = ref<Record<string, unknown>[]>([])
const showConflict = ref(false)
const changingStatus = ref(false)

async function loadOrder() {
  loading.value = true
  error.value = false
  try {
    await new Promise(r => setTimeout(r, 300))
    const rawOrder = mockOrders.value.find(o => o.id === orderId)
    if (!rawOrder) {
      error.value = true
      return
    }
    order.value = {
      ...rawOrder,
      user: mockUsers.value.find(u => u.id === rawOrder.user_id) || null,
      driver: mockUsers.value.find(u => u.id === rawOrder.driver_id) || null
    }

    const orderItems = mockOrderItems.value.filter(i => i.order_id === orderId)
    items.value = orderItems.map(i => ({
      ...i,
      product: mockProducts.value.find(p => p.id === i.product_id) || null
    }))
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

async function changeStatus(newStatus: OrderStatus) {
  if (!order.value) return
  changingStatus.value = true
  const prevStatus = order.value.status
  order.value.status = newStatus
  try {
    await new Promise(r => setTimeout(r, 300))
    const index = mockOrders.value.findIndex(o => o.id === orderId)
    if (index !== -1) {
      mockOrders.value[index].status = newStatus
      mockOrders.value[index].updated_at = new Date().toISOString()
      order.value.updated_at = mockOrders.value[index].updated_at
    }
    toast.success(t('orders.statusChanged'))
  } catch {
    order.value.status = prevStatus
    toast.error(t('errors.saveFailed'))
  } finally {
    changingStatus.value = false
  }
}

function copyOrder() {
  if (!order.value) return
  const copyData = {
    user_id: order.value.user_id,
    items: items.value.map(i => ({ product_id: i.product_id, product_name: i.product_name, quantity: i.quantity, price: i.price })),
  }
  if (import.meta.client) {
    sessionStorage.setItem('copyOrderData', JSON.stringify(copyData))
  }
  toast.success(t('orders.copyOrderSuccess'))
  router.push('/admin/orders/create')
}

onMounted(loadOrder)

const statusOptions = computed(() => Object.values(OrderStatus).filter(s => s !== OrderStatus.CANCELLED))
</script>

<template>
  <div>
    <AppBreadcrumb :items="[{ label: t('nav.orders'), to: '/admin/orders' }, { label: `#${String(orderId).slice(0, 8)}` }]" />
    <button class="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4" @click="router.push('/admin/orders')">
      <ArrowLeft class="w-4 h-4" /> {{ t('common.back') }}
    </button>

    <AppErrorState v-if="error" @retry="loadOrder" />

    <template v-if="loading">
      <div class="skeleton h-64 w-full rounded-xl" />
    </template>

    <template v-else-if="order">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white rounded-xl border border-gray-100 p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="font-semibold text-gray-900">{{ t('orders.items') }}</h2>
              <AppButton size="sm" variant="outline" @click="copyOrder"><Copy class="w-4 h-4" /> {{ t('orders.copyOrder') }}</AppButton>
            </div>
            <template v-if="items.length">
              <div v-for="item in items" :key="item.id as string" class="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p class="font-medium text-gray-900">{{ item.product_name }}</p>
                  <p class="text-sm text-gray-500">{{ item.quantity }} x {{ formatVND(Number(item.price)) }}</p>
                </div>
                <p class="font-medium">{{ formatVND(Number(item.quantity) * Number(item.price)) }}</p>
              </div>
              <div class="flex items-center justify-between pt-4">
                <span class="font-semibold text-gray-900">{{ t('orders.grandTotal') }}</span>
                <span class="text-lg font-bold text-primary-600">{{ formatVND(Number(order.total)) }}</span>
              </div>
            </template>
            <AppEmptyState v-else :description="t('orders.emptyItems')" />
          </div>
        </div>

        <div class="space-y-6">
          <div class="bg-white rounded-xl border border-gray-100 p-6">
            <h2 class="font-semibold text-gray-900 mb-4">{{ t('orders.customer') }}</h2>
            <p class="font-medium text-gray-900">{{ (order.user as Record<string, unknown>)?.full_name || 'Khách vãng lai' }}</p>
            <p class="text-sm text-gray-500">{{ (order.user as Record<string, unknown>)?.phone || order.guest_info ? (order.guest_info as Record<string, unknown>)?.phone : '' }}</p>
            <p class="text-sm text-gray-600 mt-2">{{ order.shipping_address }}</p>
          </div>

          <div class="bg-white rounded-xl border border-gray-100 p-6">
            <h2 class="font-semibold text-gray-900 mb-4">{{ t('orders.changeStatus') }}</h2>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="status in statusOptions"
                :key="status"
                :class="[
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  order.status === status ? `bg-${ORDER_STATUS_COLORS[status]}-600 text-white` : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                ]"
                :disabled="changingStatus"
                @click="changeStatus(status)"
              >{{ t(`orderStatus.${status}`) }}</button>
            </div>
            <div class="mt-4 pt-4 border-t border-gray-50 space-y-2 text-sm">
              <div class="flex justify-between"><span class="text-gray-500">{{ t('orders.amountCollected') }}:</span><span class="font-medium">{{ formatVND(Number(order.amount_collected)) }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">{{ t('common.createdAt') }}:</span><span>{{ formatDateTime(order.created_at as string) }}</span></div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <AppModal v-model="showConflict" :title="t('orders.conflictTitle')" size="sm">
      <p class="text-gray-600">{{ t('orders.conflictMessage') }}</p>
      <template #footer>
        <AppButton @click="showConflict = false; loadOrder()">{{ t('orders.reload') }}</AppButton>
      </template>
    </AppModal>
  </div>
</template>
