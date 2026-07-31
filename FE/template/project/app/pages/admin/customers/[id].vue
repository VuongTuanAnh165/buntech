<script setup lang="ts">
import { ArrowLeft, Plus, Pencil, Trash2, Star } from 'lucide-next-vue'
import { OrderStatus, ORDER_STATUS_COLORS } from '../../../core/enums'
import { mockUsers, mockOrders, mockTransactions, mockCustomPrices, mockProducts, generateId } from '~/core/mockData'

const { t } = useI18n()
const toast = useToast()
const route = useRoute()
const router = useRouter()
const { formatVND, formatDate } = useFormat()
useHead({ title: `${t('nav.customers')} - BunTech Admin` })
definePageMeta({ layout: 'admin' })

const customerId = route.params.id as string
const loading = ref(true)
const error = ref(false)
const customer = ref<Record<string, unknown> | null>(null)
const activeTab = ref<'orders' | 'debt' | 'addresses' | 'prices'>('orders')

const orders = ref<Record<string, unknown>[]>([])
const currentDebt = ref(0)
const addresses = ref<Record<string, unknown>[]>([])
const customPrices = ref<Record<string, unknown>[]>([])
const products = ref<Record<string, unknown>[]>([])
const mockAddresses = ref<Record<string, unknown>[]>([])

const showAddressModal = ref(false)
const editingAddressId = ref<string | null>(null)
const addressForm = ref({ full_name: '', phone: '', street: '', ward: '', district: '', city: '', is_default: false })

const showPriceModal = ref(false)
const priceForm = ref({ product_id: '', price: 0 })

async function loadCustomer() {
  loading.value = true
  error.value = false
  try {
    await new Promise(r => setTimeout(r, 300))
    const user = mockUsers.value.find(u => u.id === customerId)
    if (!user) { error.value = true; return }
    customer.value = { ...user }
    await Promise.all([loadOrders(), loadDebt(), loadAddresses(), loadPrices(), loadProducts()])
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

async function loadOrders() {
  await new Promise(r => setTimeout(r, 300))
  orders.value = mockOrders.value
    .filter(o => o.user_id === customerId)
    .sort((a,b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 20)
}

async function loadDebt() {
  await new Promise(r => setTimeout(r, 300))
  const txns = mockTransactions.value.filter(tx => tx.user_id === customerId)
  let debt = 0
  for (const tx of txns) {
    if (tx.type === 'DEBT_INCREASE') debt += Number(tx.amount)
    if (tx.type === 'DEBT_PAYMENT') debt -= Number(tx.amount)
  }
  currentDebt.value = debt
}

async function loadAddresses() {
  await new Promise(r => setTimeout(r, 300))
  addresses.value = mockAddresses.value.filter(a => a.user_id === customerId)
}

async function loadPrices() {
  await new Promise(r => setTimeout(r, 300))
  customPrices.value = mockCustomPrices.value
    .filter(cp => cp.user_id === customerId)
    .map(cp => ({
      ...cp,
      product: mockProducts.value.find(p => p.id === cp.product_id) || null
    }))
}

async function loadProducts() {
  await new Promise(r => setTimeout(r, 300))
  products.value = mockProducts.value.filter(p => !p.deleted_at && p.status === 'ACTIVE')
}

function openAddAddress() {
  editingAddressId.value = null
  addressForm.value = { full_name: '', phone: '', street: '', ward: '', district: '', city: '', is_default: false }
  showAddressModal.value = true
}
function openEditAddress(addr: Record<string, unknown>) {
  editingAddressId.value = addr.id as string
  addressForm.value = {
    full_name: addr.full_name as string || '',
    phone: addr.phone as string || '',
    street: addr.street as string || '',
    ward: addr.ward as string || '',
    district: addr.district as string || '',
    city: addr.city as string || '',
    is_default: addr.is_default as boolean || false,
  }
  showAddressModal.value = true
}

async function saveAddress() {
  try {
    await new Promise(r => setTimeout(r, 300))
    if (addressForm.value.is_default) {
      mockAddresses.value.forEach(a => { if(a.user_id === customerId) a.is_default = false })
    }
    if (editingAddressId.value) {
      const idx = mockAddresses.value.findIndex(a => a.id === editingAddressId.value)
      if (idx !== -1) Object.assign(mockAddresses.value[idx], addressForm.value)
    } else {
      mockAddresses.value.push({
        id: generateId(),
        user_id: customerId,
        ...addressForm.value,
        created_at: new Date().toISOString()
      })
    }
    toast.success(t('common.save'))
    showAddressModal.value = false
    loadAddresses()
  } catch {
    toast.error(t('errors.saveFailed'))
  }
}

async function deleteAddress(id: string) {
  try {
    await new Promise(r => setTimeout(r, 300))
    const idx = mockAddresses.value.findIndex(a => a.id === id)
    if (idx !== -1) mockAddresses.value.splice(idx, 1)
    toast.success(t('common.delete'))
    loadAddresses()
  } catch {
    toast.error(t('errors.deleteFailed'))
  }
}

function openAddPrice() {
  priceForm.value = { product_id: '', price: 0 }
  showPriceModal.value = true
}

async function savePrice() {
  if (!priceForm.value.product_id) return
  try {
    await new Promise(r => setTimeout(r, 300))
    const existing = mockCustomPrices.value.findIndex(cp => cp.user_id === customerId && cp.product_id === priceForm.value.product_id)
    if (existing !== -1) {
      mockCustomPrices.value[existing].price = priceForm.value.price
    } else {
      mockCustomPrices.value.push({
        id: generateId(),
        user_id: customerId,
        product_id: priceForm.value.product_id,
        price: priceForm.value.price
      })
    }
    toast.success(t('common.save'))
    showPriceModal.value = false
    loadPrices()
  } catch {
    toast.error(t('errors.saveFailed'))
  }
}

async function deletePrice(id: string) {
  try {
    await new Promise(r => setTimeout(r, 300))
    const idx = mockCustomPrices.value.findIndex(cp => cp.id === id)
    if (idx !== -1) mockCustomPrices.value.splice(idx, 1)
    toast.success(t('common.delete'))
    loadPrices()
  } catch {
    toast.error(t('errors.deleteFailed'))
  }
}

onMounted(loadCustomer)

const tabs = computed(() => [
  { key: 'orders', label: t('customers.orderHistory') },
  { key: 'debt', label: t('customers.debtTab') },
  { key: 'addresses', label: t('customers.addressesTab') },
  { key: 'prices', label: t('customers.customPriceTab') },
])
</script>

<template>
  <div>
    <AppBreadcrumb :items="[{ label: t('nav.customers'), to: '/admin/customers' }, { label: customer?.full_name as string || '' }]" />
    <button class="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4" @click="router.push('/admin/customers')">
      <ArrowLeft class="w-4 h-4" /> {{ t('common.back') }}
    </button>

    <AppErrorState v-if="error" @retry="loadCustomer" />

    <template v-if="loading">
      <div class="skeleton h-24 w-full rounded-xl mb-6" />
      <div class="skeleton h-64 w-full rounded-xl" />
    </template>

    <template v-else-if="customer">
      <div class="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <div class="flex items-center gap-4">
          <AppAvatar :name="customer.full_name as string" :src="customer.avatar_url as string" size="lg" />
          <div>
            <h1 class="text-xl font-bold text-gray-900">{{ customer.full_name }}</h1>
            <p class="text-sm text-gray-500">{{ customer.phone }}</p>
            <div class="flex items-center gap-2 mt-1">
              <AppBadge :color="(customer.role as string) === 'DRIVER' ? 'secondary' : 'success'">
                {{ t(`roles.${customer.role}`) }}
              </AppBadge>
              <AppBadge :color="(customer.status as string) === 'ACTIVE' ? 'success' : 'danger'">
                {{ (customer.status as string) === 'ACTIVE' ? t('common.active') : t('common.inactive') }}
              </AppBadge>
            </div>
          </div>
        </div>
      </div>

      <div class="flex gap-1 mb-6 border-b border-gray-100">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="[
            'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
            activeTab === tab.key ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700',
          ]"
          @click="activeTab = tab.key"
        >{{ tab.label }}</button>
      </div>

      <div v-if="activeTab === 'orders'" class="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <template v-if="orders.length">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left font-semibold text-gray-600">Mã đơn</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-600">{{ t('common.status') }}</th>
                <th class="px-4 py-3 text-right font-semibold text-gray-600">{{ t('common.total') }}</th>
                <th class="px-4 py-3 text-right font-semibold text-gray-600">{{ t('orders.amountCollected') }}</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-600">{{ t('common.date') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="order in orders" :key="order.id as string" class="hover:bg-gray-50 cursor-pointer" @click="router.push(`/admin/orders/${order.id}`)">
                <td class="px-4 py-3 font-mono text-xs">{{ String(order.id).slice(0, 8) }}</td>
                <td class="px-4 py-3">
                  <AppBadge :color="ORDER_STATUS_COLORS[order.status as OrderStatus]">{{ t(`orderStatus.${order.status}`) }}</AppBadge>
                </td>
                <td class="px-4 py-3 text-right font-medium">{{ formatVND(Number(order.total)) }}</td>
                <td class="px-4 py-3 text-right">{{ formatVND(Number(order.amount_collected)) }}</td>
                <td class="px-4 py-3 text-gray-500">{{ formatDate(order.created_at as string) }}</td>
              </tr>
            </tbody>
          </table>
        </template>
        <AppEmptyState v-else />
      </div>

      <div v-if="activeTab === 'debt'" class="bg-white rounded-xl border border-gray-100 p-6">
        <div class="grid grid-cols-2 gap-6">
          <div>
            <p class="text-sm text-gray-500 mb-1">{{ t('customers.currentDebt') }}</p>
            <p :class="['text-2xl font-bold', currentDebt > 0 ? 'text-danger-600' : 'text-success-600']">
              {{ formatVND(currentDebt) }}
            </p>
          </div>
          <div>
            <p class="text-sm text-gray-500 mb-1">{{ t('customers.debtLimit') }}</p>
            <p class="text-2xl font-bold text-gray-900">{{ formatVND(Number(customer.debt_limit)) }}</p>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'addresses'">
        <div class="flex justify-end mb-3">
          <AppButton size="sm" @click="openAddAddress"><Plus class="w-4 h-4" /> {{ t('customers.addAddress') }}</AppButton>
        </div>
        <div class="grid gap-3">
          <div v-for="addr in addresses" :key="addr.id as string" class="bg-white rounded-xl border border-gray-100 p-4 flex items-start justify-between">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="font-medium text-gray-900">{{ addr.full_name }}</span>
                <AppBadge v-if="addr.is_default" color="primary">{{ t('customers.isDefault') }}</AppBadge>
              </div>
              <p class="text-sm text-gray-500">{{ addr.phone }}</p>
              <p class="text-sm text-gray-600">{{ addr.street }}, {{ addr.ward }}, {{ addr.district }}, {{ addr.city }}</p>
            </div>
            <div class="flex gap-1">
              <button class="p-1.5 text-gray-400 hover:text-primary-600" @click="openEditAddress(addr)"><Pencil class="w-4 h-4" /></button>
              <button class="p-1.5 text-gray-400 hover:text-danger-600" @click="deleteAddress(addr.id as string)"><Trash2 class="w-4 h-4" /></button>
            </div>
          </div>
          <AppEmptyState v-if="!addresses.length" />
        </div>
      </div>

      <div v-if="activeTab === 'prices'">
        <div class="flex justify-end mb-3">
          <AppButton size="sm" @click="openAddPrice"><Plus class="w-4 h-4" /> {{ t('customers.setCustomPrice') }}</AppButton>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <template v-if="customPrices.length">
            <table class="w-full text-sm">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left font-semibold text-gray-600">{{ t('products.productName') }}</th>
                  <th class="px-4 py-3 text-right font-semibold text-gray-600">{{ t('customers.customPrice') }}</th>
                  <th class="px-4 py-3 text-right font-semibold text-gray-600">{{ t('common.actions') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr v-for="cp in customPrices" :key="cp.id as string">
                  <td class="px-4 py-3">{{ (cp.product as Record<string, unknown>)?.name }}</td>
                  <td class="px-4 py-3 text-right font-medium">{{ formatVND(Number(cp.price)) }}</td>
                  <td class="px-4 py-3 text-right">
                    <button class="p-1.5 text-gray-400 hover:text-danger-600" @click="deletePrice(cp.id as string)"><Trash2 class="w-4 h-4" /></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </template>
          <AppEmptyState v-else />
        </div>
      </div>
    </template>

    <AppModal v-model="showAddressModal" :title="editingAddressId ? t('customers.editAddress') : t('customers.addAddress')" size="md">
      <form class="space-y-4" @submit.prevent="saveAddress">
        <AppInput v-model="addressForm.full_name" :label="t('customers.fullName')" :required="true" />
        <AppInput v-model="addressForm.phone" :label="t('common.phone')" />
        <AppInput v-model="addressForm.street" :label="t('customers.street')" :required="true" />
        <div class="grid grid-cols-2 gap-3">
          <AppInput v-model="addressForm.ward" :label="t('customers.ward')" />
          <AppInput v-model="addressForm.district" :label="t('customers.district')" />
        </div>
        <AppInput v-model="addressForm.city" :label="t('customers.city')" />
        <label class="flex items-center gap-2">
          <input v-model="addressForm.is_default" type="checkbox" class="rounded border-gray-300 text-primary-600 focus:ring-primary-500">
          <span class="text-sm text-gray-700">{{ t('customers.isDefault') }}</span>
        </label>
      </form>
      <template #footer>
        <AppButton variant="ghost" @click="showAddressModal = false">{{ t('common.cancel') }}</AppButton>
        <AppButton @click="saveAddress">{{ t('common.save') }}</AppButton>
      </template>
    </AppModal>

    <AppModal v-model="showPriceModal" :title="t('customers.setCustomPrice')" size="sm">
      <form class="space-y-4" @submit.prevent="savePrice">
        <AppSelect
          v-model="priceForm.product_id"
          :label="t('products.productName')"
          :required="true"
          :options="products.map(p => ({ value: p.id as string, label: p.name as string }))"
          :placeholder="t('orders.selectProduct')"
        />
        <AppInput v-model="priceForm.price" :label="t('customers.customPrice')" type="number" :required="true" :min="0" />
      </form>
      <template #footer>
        <AppButton variant="ghost" @click="showPriceModal = false">{{ t('common.cancel') }}</AppButton>
        <AppButton @click="savePrice">{{ t('common.save') }}</AppButton>
      </template>
    </AppModal>
  </div>
</template>
