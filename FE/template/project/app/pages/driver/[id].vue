<script setup lang="ts">
import { mockOrders, mockOrderItems, mockUsers } from '~/core/mockData'
import { ArrowLeft, MapPin, Phone, User, Wallet, WifiOff } from 'lucide-vue-next'
import { OrderStatus } from '../../core/enums'
const { t } = useI18n()
const toast = useToast()
const route = useRoute()
const router = useRouter()
const { formatVND, parseVNDInput, formatVNDInput } = useFormat()
const { generate } = useIdempotencyKey()
const { enqueue } = useOfflineQueue()
useHead({ title: `${t('driver.orderDetail')} - BunTech` })
definePageMeta({ layout: 'driver' })

const orderId = route.params.id as string
const loading = ref(true)
const error = ref(false)
const order = ref<Record<string, unknown> | null>(null)
const items = ref<Record<string, unknown>[]>([])

const showConfirmPopup = ref(false)
const amountInput = ref('')
const submitting = ref(false)
const delivered = ref(false)
const offlineQueued = ref(false)
const isOnline = ref(true)

async function loadOrder() {
  loading.value = true
  error.value = false
  try {
    await new Promise(r => setTimeout(r, 300))
    const o = mockOrders.value.find(o => o.id === orderId)
    if (o) {
      order.value = {
        ...o,
        user: mockUsers.value.find(u => u.id === o.user_id) || null
      } as Record<string, unknown>
      amountInput.value = formatVNDInput(Number(order.value.total))
      items.value = mockOrderItems.value.filter(oi => oi.order_id === orderId) as Record<string, unknown>[]
    } else {
      error.value = true
    }
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

const amountCollected = computed(() => parseVNDInput(amountInput.value))

function checkOnline() {
  isOnline.value = navigator.onLine
}

async function confirmDelivery() {
  if (submitting.value) return
  submitting.value = true
  const idempotencyKey = generate()

  try {
    if (!navigator.onLine) {
      await enqueue({
        id: idempotencyKey,
        url: `orders/${orderId}`,
        method: 'UPDATE',
        payload: {
          status: OrderStatus.DELIVERED,
          amount_collected: amountCollected.value,
        },
        createdAt: new Date().toISOString(),
      })
      offlineQueued.value = true
      delivered.value = true
      showConfirmPopup.value = false
      toast.success(t('driver.deliveryConfirmed'))
      toast.info(t('driver.pendingSync'))
      setTimeout(() => router.push('/driver'), 3000)
      return
    }

    await new Promise(r => setTimeout(r, 300))
    const oIndex = mockOrders.value.findIndex(o => o.id === orderId)
    if (oIndex !== -1) {
      mockOrders.value[oIndex].status = OrderStatus.DELIVERED
      mockOrders.value[oIndex].amount_collected = amountCollected.value
    }
    
    delivered.value = true
    showConfirmPopup.value = false
    toast.success(t('driver.deliveryConfirmed'))
    setTimeout(() => router.push('/driver'), 2000)
  } catch {
    toast.error(t('errors.saveFailed'))
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadOrder()
  checkOnline()
  window.addEventListener('online', () => { isOnline.value = true; toast.success(t('driver.syncComplete')) })
  window.addEventListener('offline', () => { isOnline.value = false })
})

onUnmounted(() => {
  window.removeEventListener('online', () => {})
  window.removeEventListener('offline', () => {})
})
</script>

<template>
  <div class="p-4">
    <button class="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4" @click="router.push('/driver')">
      <ArrowLeft class="w-4 h-4" /> {{ t('common.back') }}
    </button>

    <div v-if="!isOnline" class="flex items-center gap-2 p-3 bg-warning-50 rounded-lg mb-4">
      <WifiOff class="w-4 h-4 text-warning-600" />
      <span class="text-sm text-warning-700">{{ t('driver.offlineMode') }}</span>
    </div>

    <AppErrorState v-if="error" @retry="loadOrder" />

    <template v-if="loading">
      <div class="skeleton h-48 w-full rounded-xl mb-4" />
      <div class="skeleton h-32 w-full rounded-xl" />
    </template>

    <template v-else-if="order && !delivered">
      <div class="bg-white rounded-xl border border-gray-100 p-5 mb-4">
        <h2 class="font-semibold text-gray-900 mb-4">{{ t('driver.customerInfo') }}</h2>
        <div class="space-y-3 text-sm">
          <div class="flex items-center gap-2"><User class="w-4 h-4 text-gray-400" /><span class="font-medium">{{ (order.user as Record<string, unknown>)?.full_name || t('customer.guestCustomer') }}</span></div>
          <div class="flex items-center gap-2"><Phone class="w-4 h-4 text-gray-400" /><span>{{ (order.user as Record<string, unknown>)?.phone || (order.guest_info as Record<string, unknown>)?.phone }}</span></div>
          <div class="flex items-start gap-2"><MapPin class="w-4 h-4 text-gray-400 mt-0.5" /><span>{{ order.shipping_address }}</span></div>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-100 p-5 mb-4">
        <h2 class="font-semibold text-gray-900 mb-4">{{ t('orders.items') }}</h2>
        <div v-for="item in items" :key="item.id as string" class="flex justify-between py-2 text-sm border-b border-gray-50 last:border-0">
          <span>{{ item.product_name }} x{{ item.quantity }}</span>
          <span class="font-medium">{{ formatVND(Number(item.quantity) * Number(item.price)) }}</span>
        </div>
        <div class="flex justify-between pt-3 font-semibold">
          <span>{{ t('orders.grandTotal') }}</span>
          <span class="text-primary-600">{{ formatVND(Number(order.total)) }}</span>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-100 p-5 mb-4">
        <div class="flex items-center justify-between mb-2">
          <label class="block text-sm font-medium text-gray-700">{{ t('driver.amountToCollect') }}</label>
          <Wallet class="w-4 h-4 text-gray-400" />
        </div>
        <p class="text-xl font-bold text-primary-600 mb-3">{{ formatVND(Number(order.total)) }}</p>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ t('driver.amountCollected') }}</label>
        <input
          v-model="amountInput"
          type="text"
          class="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
      </div>

      <div class="flex justify-center pb-8">
        <button
          class="w-full py-4 bg-success-500 text-white rounded-xl font-semibold text-base hover:bg-success-600 transition-colors min-h-[44px] disabled:opacity-50"
          :disabled="submitting"
          @click="showConfirmPopup = true"
        >{{ t('driver.confirmDelivery') }}</button>
      </div>
    </template>

    <template v-else-if="delivered">
      <div class="bg-white rounded-xl border border-gray-100 p-12 text-center">
        <div class="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 class="text-xl font-bold text-gray-900 mb-2">{{ t('driver.deliveryConfirmed') }}</h2>
        <p v-if="offlineQueued" class="text-sm text-warning-600">{{ t('driver.pendingSync') }}</p>
      </div>
    </template>

    <AppModal v-model="showConfirmPopup" :title="t('driver.confirmDelivery')" size="sm">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ t('driver.amountCollected') }}</label>
          <input
            v-model="amountInput"
            type="text"
            class="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
        </div>
        <div class="flex justify-center">
          <SwipeToConfirm :disabled="submitting" @confirm="confirmDelivery" />
        </div>
      </div>
    </AppModal>
  </div>
</template>
