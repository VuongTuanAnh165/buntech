<script setup lang="ts">
import { Plus, Trash2, ArrowLeft, AlertTriangle } from 'lucide-vue-next'
import { mockOrders, mockOrderItems, mockUsers, mockProducts, mockCustomPrices, mockTransactions, generateId } from '~/core/mockData'
import { OrderStatus, TransactionType } from '~/core/enums'

const { t } = useI18n()
const toast = useToast()
const router = useRouter()
const { formatVND, parseVNDInput, formatVNDInput } = useFormat()
useHead({ title: `${t('orders.addNew')} - BunTech Admin` })
definePageMeta({ layout: 'admin' })

const customers = ref<Record<string, unknown>[]>([])
const products = ref<Record<string, unknown>[]>([])
const customPrices = ref<Map<string, number>>(new Map())
const selectedCustomerId = ref('')
const customerDebt = ref(0)
const customerDebtLimit = ref(0)
const orderItems = ref<{ product_id: string; product_name: string; quantity: number; price: number; stock: number }[]>([])
const note = ref('')
const amountCollectedInput = ref('')
const saving = ref(false)

const total = computed(() => orderItems.value.reduce((sum, item) => sum + item.quantity * item.price, 0))
const amountCollected = computed(() => parseVNDInput(amountCollectedInput.value))
const debtAmount = computed(() => total.value - amountCollected.value)
const exceedsDebtLimit = computed(() => customerDebt.value + debtAmount.value > customerDebtLimit.value && customerDebtLimit.value > 0)

async function loadInitData() {
  await new Promise(r => setTimeout(r, 300))
  customers.value = mockUsers.value.filter(u => u.role === 'CUSTOMER' && u.status === 'ACTIVE').sort((a,b) => a.full_name.localeCompare(b.full_name))
  products.value = mockProducts.value.filter(p => !p.deleted_at && p.status === 'ACTIVE').sort((a,b) => a.name.localeCompare(b.name))
  checkCopyData()
}

function checkCopyData() {
  if (import.meta.client) {
    const copyData = sessionStorage.getItem('copyOrderData')
    if (copyData) {
      try {
        const parsed = JSON.parse(copyData)
        if (parsed.user_id) {
          selectedCustomerId.value = parsed.user_id
          onCustomerChange()
        }
        if (parsed.items) {
          orderItems.value = parsed.items.map((i: { product_id: string; product_name: string; quantity: number; price: number }) => ({
            product_id: i.product_id,
            product_name: i.product_name,
            quantity: Number(i.quantity),
            price: Number(i.price),
            stock: 0,
          }))
        }
        sessionStorage.removeItem('copyOrderData')
      } catch { /* ignore */ }
    }
  }
}

async function onCustomerChange() {
  customPrices.value.clear()
  customerDebt.value = 0
  if (!selectedCustomerId.value) return
  
  await new Promise(r => setTimeout(r, 300))
  const priceRes = mockCustomPrices.value.filter(cp => cp.user_id === selectedCustomerId.value)
  const debtRes = mockTransactions.value.filter(tx => tx.user_id === selectedCustomerId.value)
  
  for (const cp of priceRes) {
    customPrices.value.set(cp.product_id, Number(cp.price))
  }
  let debt = 0
  for (const tx of debtRes) {
    if (tx.type === TransactionType.DEBT_INCREASE) debt += Number(tx.amount)
    if (tx.type === TransactionType.DEBT_PAYMENT) debt -= Number(tx.amount)
  }
  customerDebt.value = debt
  const customer = customers.value.find(c => c.id === selectedCustomerId.value)
  customerDebtLimit.value = Number(customer?.debt_limit) || 0
  orderItems.value = orderItems.value.map(item => {
    if (customPrices.value.has(item.product_id)) {
      item.price = customPrices.value.get(item.product_id)!
    }
    return item
  })
}

function getProductPrice(productId: string): number {
  if (customPrices.value.has(productId)) return customPrices.value.get(productId)!
  const p = products.value.find(p => p.id === productId)
  return Number(p?.price) || 0
}

function addProduct(productId: string) {
  if (!productId) return
  const existing = orderItems.value.find(i => i.product_id === productId)
  if (existing) {
    existing.quantity++
    return
  }
  const product = products.value.find(p => p.id === productId)
  if (product) {
    orderItems.value.push({
      product_id: productId,
      product_name: product.name as string,
      quantity: 1,
      price: getProductPrice(productId),
      stock: Number(product.stock),
    })
  }
}

function removeItem(index: number) {
  orderItems.value.splice(index, 1)
}

function updateQuantity(index: number, delta: number) {
  const item = orderItems.value[index]
  const newQty = item.quantity + delta
  if (newQty <= 0) {
    removeItem(index)
    return
  }
  item.quantity = newQty
}

async function submitOrder() {
  if (!orderItems.value.length) {
    toast.error(t('orders.selectItems'))
    return
  }
  if (exceedsDebtLimit.value) {
    const customer = customers.value.find(c => c.id === selectedCustomerId.value)
    toast.error(t('customers.debtWarning', { name: customer?.full_name || '' }))
    return
  }
  saving.value = true
  try {
    await new Promise(r => setTimeout(r, 300))
    const collected = amountCollected.value
    
    const orderId = generateId()
    const newOrder = {
      id: orderId,
      user_id: selectedCustomerId.value || null,
      driver_id: null,
      status: OrderStatus.PENDING,
      total: total.value,
      amount_collected: collected,
      note: note.value,
      shipping_address: '',
      guest_info: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    mockOrders.value.unshift(newOrder)
    
    const itemInserts = orderItems.value.map(item => ({
      id: generateId(),
      order_id: orderId,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      price: item.price,
    }))
    mockOrderItems.value.push(...itemInserts)
    
    if (selectedCustomerId.value && debtAmount.value > 0) {
      mockTransactions.value.push({
        id: generateId(),
        user_id: selectedCustomerId.value,
        order_id: orderId,
        type: TransactionType.DEBT_INCREASE,
        amount: debtAmount.value,
        note: `Đơn hàng ${orderId.slice(0, 8)}`,
        created_at: new Date().toISOString(),
      })
    }
    toast.success(t('orders.createSuccess'))
    router.push('/admin/orders')
  } catch {
    toast.error(t('errors.saveFailed'))
  } finally {
    saving.value = false
  }
}

onMounted(loadInitData)
</script>

<template>
  <div>
    <AppBreadcrumb :items="[{ label: t('nav.orders'), to: '/admin/orders' }, { label: t('orders.addNew') }]" />
    <button class="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4" @click="router.push('/admin/orders')">
      <ArrowLeft class="w-4 h-4" /> {{ t('common.back') }}
    </button>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">{{ t('orders.addNew') }}</h1>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-xl border border-gray-100 p-6">
          <h2 class="font-semibold text-gray-900 mb-4">{{ t('orders.selectCustomer') }}</h2>
          <AppSelect
            v-model="selectedCustomerId"
            :options="customers.map(c => ({ value: c.id as string, label: `${c.full_name} - ${c.phone}` }))"
            :placeholder="t('orders.selectCustomer')"
            @update:model-value="onCustomerChange"
          />
          <div v-if="selectedCustomerId" class="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-500">{{ t('customers.currentDebt') }}:</span>
              <span :class="['font-medium ml-2', customerDebt > 0 ? 'text-danger-600' : 'text-success-600']">{{ formatVND(customerDebt) }}</span>
            </div>
            <div>
              <span class="text-gray-500">{{ t('customers.debtLimit') }}:</span>
              <span class="font-medium ml-2">{{ formatVND(customerDebtLimit) }}</span>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-gray-100 p-6">
          <h2 class="font-semibold text-gray-900 mb-4">{{ t('orders.items') }}</h2>
          <div class="flex gap-2 mb-4">
            <select class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" @change="addProduct(($event.target as HTMLSelectElement).value); ($event.target as HTMLSelectElement).value = ''">
              <option value="">{{ t('orders.selectProduct') }}</option>
              <option v-for="p in products" :key="p.id as string" :value="p.id as string">{{ p.name }} - {{ formatVND(Number(p.price)) }}</option>
            </select>
            <AppButton size="sm" @click="addProduct('')"><Plus class="w-4 h-4" /></AppButton>
          </div>
          <template v-if="orderItems.length">
            <div v-for="(item, i) in orderItems" :key="item.product_id" class="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
              <div class="flex-1">
                <p class="font-medium text-gray-900">{{ item.product_name }}</p>
                <p class="text-xs text-gray-500">{{ formatVND(item.price) }} / sản phẩm</p>
                <p v-if="item.stock === 0" class="text-xs text-danger-600 mt-0.5">{{ t('products.outOfStock') }}</p>
                <p v-else-if="item.quantity > item.stock" class="text-xs text-warning-600 mt-0.5">{{ t('products.stock') }}: {{ item.stock }}</p>
              </div>
              <div class="flex items-center gap-1">
                <button class="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center" @click="updateQuantity(i, -1)">-</button>
                <span class="w-10 text-center text-sm font-medium">{{ item.quantity }}</span>
                <button class="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center" @click="updateQuantity(i, 1)">+</button>
              </div>
              <span class="font-medium w-24 text-right">{{ formatVND(item.quantity * item.price) }}</span>
              <button class="p-1 text-gray-400 hover:text-danger-600" @click="removeItem(i)"><Trash2 class="w-4 h-4" /></button>
            </div>
          </template>
          <AppEmptyState v-else :description="t('orders.emptyItems')" />
        </div>
      </div>

      <div class="space-y-6">
        <div class="bg-white rounded-xl border border-gray-100 p-6 sticky top-20">
          <h2 class="font-semibold text-gray-900 mb-4">{{ t('orders.summary') }}</h2>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">{{ t('orders.subtotal') }}</span>
              <span class="font-medium">{{ formatVND(total) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-500">{{ t('orders.amountCollected') }}</span>
              <input
                v-model="amountCollectedInput"
                type="text"
                :placeholder="formatVNDInput(total)"
                class="w-32 text-right rounded-lg border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">{{ t('orders.debtNote') }}</span>
              <span :class="['font-medium', debtAmount > 0 ? 'text-danger-600' : 'text-success-600']">{{ formatVND(debtAmount) }}</span>
            </div>
            <div class="pt-3 border-t border-gray-100 flex justify-between">
              <span class="font-semibold text-gray-900">{{ t('orders.grandTotal') }}</span>
              <span class="text-lg font-bold text-primary-600">{{ formatVND(total) }}</span>
            </div>
          </div>

          <div v-if="exceedsDebtLimit" class="mt-4 flex items-start gap-2 p-3 bg-danger-50 rounded-lg">
            <AlertTriangle class="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />
            <p class="text-sm text-danger-700">{{ t('customers.debtWarning', { name: customers.find(c => c.id === selectedCustomerId.value)?.full_name || '' }) }}</p>
          </div>

          <AppInput v-model="note" :label="t('common.note')" class="mt-4" />

          <AppButton :loading="saving" block class="mt-4" @click="submitOrder">{{ t('orders.addNew') }}</AppButton>
        </div>
      </div>
    </div>
  </div>
</template>
