<script setup lang="ts">
import { Plus, Trash2, ArrowLeft } from 'lucide-vue-next'
import { mockProducts, mockCustomPrices, mockOrders, mockOrderItems, mockTransactions, generateId } from '~/core/mockData'
import { TransactionType } from '../../core/enums'

const { t } = useI18n()
const authStore = useAuthStore()
const toast = useToast()
const router = useRouter()
const { formatVND } = useFormat()
useHead({ title: `${t('customer.placeOrder')} - BunTech` })
definePageMeta({ layout: 'default' })

const products = ref<Record<string, unknown>[]>([])
const customPrices = ref<Map<string, number>>(new Map())
const orderItems = ref<{ product_id: string; product_name: string; quantity: number; price: number }[]>([])
const note = ref('')
const submitting = ref(false)

const total = computed(() => orderItems.value.reduce((sum, item) => sum + item.quantity * item.price, 0))

async function loadData() {
  await new Promise(r => setTimeout(r, 300))

  const activeProducts = mockProducts.value
    .filter(p => !p.deleted_at && p.status === 'ACTIVE')
    .sort((a, b) => String(a.name).localeCompare(String(b.name)))

  products.value = activeProducts as Record<string, unknown>[]

  const userPrices = mockCustomPrices.value.filter(cp => cp.user_id === authStore.user?.id)
  for (const cp of userPrices) {
    customPrices.value.set(cp.product_id, Number(cp.price))
  }
}

function getProductPrice(productId: string): number {
  if (customPrices.value.has(productId)) return customPrices.value.get(productId)!
  const p = products.value.find(p => p.id === productId)
  return Number(p?.price) || 0
}

function addProduct(productId: string) {
  if (!productId) return
  const existing = orderItems.value.find(i => i.product_id === productId)
  if (existing) { existing.quantity++; return }
  const product = products.value.find(p => p.id === productId)
  if (product) {
    orderItems.value.push({
      product_id: productId,
      product_name: product.name as string,
      quantity: 1,
      price: getProductPrice(productId),
    })
  }
}

async function submitOrder() {
  if (!orderItems.value.length) { toast.error(t('orders.selectItems')); return }
  submitting.value = true
  try {
    await new Promise(r => setTimeout(r, 300))

    const orderId = generateId()
    const newOrder = {
      id: orderId,
      user_id: authStore.user?.id as string,
      status: 'PENDING',
      total: total.value,
      amount_collected: 0,
      note: note.value,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    mockOrders.value.push(newOrder as any)

    const newItems = orderItems.value.map(item => ({
      id: generateId(),
      order_id: orderId,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      price: item.price,
      created_at: new Date().toISOString()
    }))
    mockOrderItems.value.push(...(newItems as any[]))

    const newTx = {
      id: generateId(),
      user_id: authStore.user?.id as string,
      order_id: orderId,
      type: TransactionType.DEBT_INCREASE,
      amount: total.value,
      note: `Đơn hàng ${String(orderId).slice(0, 8)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    mockTransactions.value.push(newTx as any)

    toast.success(t('orders.createSuccess'))
    router.push('/portal')
  } catch {
    toast.error(t('errors.saveFailed'))
  } finally {
    submitting.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <button class="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4" @click="router.push('/portal')">
      <ArrowLeft class="w-4 h-4" /> {{ t('common.back') }}
    </button>
    <h1 class="text-3xl font-bold text-gray-900 mb-8">{{ t('customer.placeOrderTitle') }}</h1>

    <div class="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
      <h2 class="font-semibold text-gray-900">{{ t('orders.items') }}</h2>
      <select class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" @change="addProduct(($event.target as HTMLSelectElement).value); ($event.target as HTMLSelectElement).value = ''">
        <option value="">{{ t('orders.selectProduct') }}</option>
        <option v-for="p in products" :key="p.id as string" :value="p.id as string">
          {{ p.name }} - {{ formatVND(getProductPrice(p.id as string)) }}
          <span v-if="customPrices.has(p.id as string)"> ({{ t('customers.customPrice') }})</span>
        </option>
      </select>
      <template v-if="orderItems.length">
        <div v-for="(item, i) in orderItems" :key="item.product_id" class="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
          <div class="flex-1">
            <p class="font-medium text-gray-900">{{ item.product_name }}</p>
            <p class="text-sm text-gray-500">{{ formatVND(item.price) }}</p>
          </div>
          <div class="flex items-center gap-1">
            <button type="button" class="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center" @click="item.quantity--">-</button>
            <span class="w-10 text-center text-sm font-medium">{{ item.quantity }}</span>
            <button type="button" class="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center" @click="item.quantity++">+</button>
          </div>
          <span class="font-medium ml-4 w-24 text-right">{{ formatVND(item.quantity * item.price) }}</span>
          <button type="button" class="p-1 text-gray-400 hover:text-danger-600 ml-2" @click="orderItems.splice(i, 1)"><Trash2 class="w-4 h-4" /></button>
        </div>
        <div class="flex justify-between pt-3 border-t border-gray-100">
          <span class="font-semibold">{{ t('orders.grandTotal') }}</span>
          <span class="text-lg font-bold text-primary-600">{{ formatVND(total) }}</span>
        </div>
      </template>
      <AppEmptyState v-else :description="t('orders.emptyItems')" />

      <AppInput v-model="note" :label="t('common.note')" />
      <AppButton :loading="submitting" block size="lg" @click="submitOrder">{{ t('customer.placeOrder') }}</AppButton>
    </div>
  </div>
</template>
