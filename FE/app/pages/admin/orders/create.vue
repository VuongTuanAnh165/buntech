<script setup lang="ts">
import type { UserDTO, AdminProduct, Address } from '~/utils/types'
import { productService } from '~/services/productService'
import { customerPriceService } from '~/services/customerPriceService'
import { useAdminOrders } from '~/composables/admin/useAdminOrders'
import { useUsers } from '~/composables/admin/useUsers'

const toast = useToast()
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Tạo đơn hàng - BunTech Admin' })
const { fetchUsers, fetchAddresses } = useUsers()
const { createOrder } = useAdminOrders()
const loading = ref(true)
const customers = ref<UserDTO[]>([])
const products = ref<AdminProduct[]>([])
const selectedCustomerId = ref('')
const customPrices = ref<Map<string, number>>(new Map())
const customerAddresses = ref<Address[]>([])
const selectedAddressId = ref('')
const orderItems = ref<
  {
    productId: number
    productName: string
    quantity: number
    price: number
    stock: number
    unit: string
    thumbnailUrl: string | null
  }[]
>([])
const note = ref('')
const amountCollectedInput = ref('')
const amountCollected = ref(0)
const deliveryFeeInput = ref('')
const deliveryFee = ref(0)
const saving = ref(false)
const searchQuery = ref('')
const success = ref(false)
const createdOrderId = ref('')
const selectedCustomer = computed(() =>
  customers.value.find((c) => c.id === selectedCustomerId.value)
)
const subtotal = computed(() =>
  orderItems.value.reduce((sum, item) => sum + item.quantity * item.price, 0)
)
const total = computed(() => subtotal.value + deliveryFee.value)
const debtAmount = computed(() => Math.max(0, total.value - amountCollected.value))
const customerDebt = computed(() => Number(selectedCustomer.value?.profile?.currentDebt || 0))
const debtLimit = computed(() => Number(selectedCustomer.value?.profile?.debtLimit ?? 0))
const exceedsDebtLimit = computed(
  () => debtLimit.value > 0 && customerDebt.value + debtAmount.value > debtLimit.value
)
const filteredProducts = computed(() => {
  if (!searchQuery.value.trim()) return products.value.slice(0, 24)
  const q = searchQuery.value.toLowerCase().trim()
  return products.value
    .filter(
      (p) => p.name.toLowerCase().includes(q) || (p.category?.name || '').toLowerCase().includes(q)
    )
    .slice(0, 24)
})
const customerOptions = computed(() =>
  customers.value.map((c) => ({ value: c.id, label: `${c.fullName} — ${c.phoneNumber || 'SĐT'}` }))
)
const addressOptions = computed(() =>
  customerAddresses.value.map((a) => ({
    value: a.id,
    label: `${a.addressLine || a.street}, ${a.ward}, ${a.district}, ${a.province || a.city}${a.isDefault ? ' (Mặc định)' : ''}`
  }))
)
const _selectedAddress = computed(() =>
  customerAddresses.value.find((a) => a.id === selectedAddressId.value)
)
const loadingCustomers = ref(false)
async function searchCustomers(q: string) {
  loadingCustomers.value = true
  try {
    const res = await fetchUsers({ role: 'CUSTOMER', search: q, limit: 10 })
    const fetched = res.data?.data || []
    fetched.forEach((f) => {
      if (!customers.value.some((c) => c.id === f.id)) customers.value.push(f)
    })
    return fetched.map((c) => ({ value: c.id, label: `${c.fullName} — ${c.phoneNumber || 'SĐT'}` }))
  } finally {
    loadingCustomers.value = false
  }
}
function handleDeliveryFeeInput(val: string) {
  const num = Number(val.replace(/\D/g, '')) || 0
  deliveryFee.value = num
  deliveryFeeInput.value = num > 0 ? num.toLocaleString('vi-VN') : ''
}
function handleAmountCollectedInput(val: string) {
  const num = Number(val.replace(/\D/g, '')) || 0
  amountCollected.value = num
  amountCollectedInput.value = num > 0 ? num.toLocaleString('vi-VN') : ''
}
async function loadInitData() {
  loading.value = true
  try {
    const res = await fetchUsers({ role: 'CUSTOMER', limit: 10 })
    customers.value = res.data?.data || []

    const pRes = await productService.getAdminProducts({ limit: 1000 })
    products.value = pRes.data?.data?.filter((p) => p.isActive) || []
    products.value.sort((a, b) => a.name.localeCompare(b.name))
  } finally {
    loading.value = false
  }
}
async function onCustomerChange() {
  customPrices.value.clear()
  customerAddresses.value = []
  selectedAddressId.value = ''
  if (!selectedCustomerId.value) return

  try {
    const [addrRes, priceRes] = await Promise.all([
      fetchAddresses(selectedCustomerId.value),
      customerPriceService.fetchPrices(selectedCustomerId.value, { limit: 1000 })
    ])

    customerAddresses.value = addrRes.data || []
    customerAddresses.value.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0))
    const defaultAddr = customerAddresses.value.find((a) => a.isDefault)
    if (defaultAddr) selectedAddressId.value = String(defaultAddr.id)

    const cps = priceRes.data?.data || []
    for (const cp of cps) {
      if (cp.productId) {
        customPrices.value.set(String(cp.productId), Number(cp.customPrice))
      }
    }
  } catch {
    //
  }

  orderItems.value = orderItems.value.map((item) => ({
    ...item,
    price: customPrices.value.has(String(item.productId))
      ? customPrices.value.get(String(item.productId))!
      : item.price
  }))
}
function getProductPrice(productId: number): number {
  if (customPrices.value.has(String(productId))) return customPrices.value.get(String(productId))!
  const p = products.value.find((p) => p.id === productId)
  return Number(p?.basePrice) || 0
}
function addProduct(productId: number) {
  if (!productId) return
  const existing = orderItems.value.find((i) => i.productId === productId)
  if (existing) {
    existing.quantity++
    return
  }
  const product = products.value.find((p) => p.id === productId)
  if (product) {
    orderItems.value.push({
      productId,
      productName: product.name,
      quantity: 1,
      price: getProductPrice(productId),
      stock: 999,
      unit: product.unit,
      thumbnailUrl: product.thumbnailUrl
    })
  }
}
function removeItem(index: number) {
  orderItems.value.splice(index, 1)
}
function updateQuantity(index: number, delta: number) {
  const item = orderItems.value[index]
  if (!item) return
  const newQty = item.quantity + delta
  if (newQty <= 0) {
    removeItem(index)
    return
  }
  item.quantity = newQty
}
function setQuantity(index: number, quantity: number) {
  if (orderItems.value[index]) orderItems.value[index].quantity = quantity
}
async function submitOrder() {
  if (!orderItems.value.length) {
    toast.add({ title: 'Vui lòng chọn ít nhất một sản phẩm', color: 'error' })
    return
  }
  if (!selectedCustomerId.value) {
    toast.add({ title: 'Vui lòng chọn khách hàng', color: 'error' })
    return
  }
  if (!selectedAddressId.value) {
    toast.add({ title: 'Vui lòng chọn địa chỉ giao hàng', color: 'error' })
    return
  }
  if (exceedsDebtLimit.value) {
    toast.add({
      title: `Cảnh báo: Đơn hàng vượt hạn mức công nợ của ${selectedCustomer.value?.fullName || ''}`,
      color: 'error'
    })
    return
  }

  saving.value = true
  try {
    const payload = {
      userId: Number(selectedCustomerId.value),
      shippingAddressId: Number(selectedAddressId.value),
      note: note.value,
      deliveryFee: deliveryFee.value,
      amountCollected: amountCollected.value,
      items: orderItems.value.map((item) => ({
        productId: item.productId,
        quantity: item.quantity
      }))
    }
    const res = await createOrder(payload)
    if (res.data) {
      createdOrderId.value = String(res.data.id)
      success.value = true
    }
  } catch {
    // API client auto handles error toast
  } finally {
    saving.value = false
  }
}
function resetForm() {
  success.value = false
  orderItems.value = []
  selectedCustomerId.value = ''
  note.value = ''
  amountCollectedInput.value = ''
  deliveryFeeInput.value = ''
}

onMounted(loadInitData)
</script>
<template>
  <div>
    <BasePageHeader
      title="Tạo đơn hàng mới"
      description="Chọn khách hàng, thêm sản phẩm và xác nhận đơn"
      :breadcrumbs="[{ label: 'Tạo đơn' }]"
    >
      <template #actions>
        <UButton color="neutral" variant="outline" icon="i-lucide-arrow-left" to="/admin/orders"
          >Quay lại</UButton
        >
      </template>
    </BasePageHeader>
    <div
      v-if="success"
      class="bg-surface ring-surface-border mx-auto max-w-lg rounded-xl p-8 text-center shadow-sm ring-1"
    >
      <div
        class="bg-success-50 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
      >
        <UIcon name="i-lucide-check-circle-2" class="text-success-600 h-8 w-8" />
      </div>
      <h2 class="text-surface-foreground mb-1 text-xl font-bold">Đơn hàng đã tạo thành công</h2>
      <p class="mb-1 text-sm text-slate-500">Mã đơn hàng</p>
      <p class="text-primary-600 mb-5 font-mono text-lg font-semibold">
        #{{ String(createdOrderId).slice(0, 8) }}
      </p>
      <div class="flex justify-center gap-3">
        <UButton :to="`/admin/orders/${createdOrderId}`" icon="i-lucide-package"
          >Xem đơn hàng</UButton
        >
        <UButton color="neutral" variant="outline" icon="i-lucide-plus" @click="resetForm"
          >Tạo đơn khác</UButton
        >
      </div>
    </div>
    <div v-else class="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <!-- Left Column: Products -->
      <div class="space-y-6 lg:col-span-7">
        <OrderProductPicker
          v-model:search-query="searchQuery"
          :products="filteredProducts"
          :order-items="orderItems"
          @add="addProduct"
        />
      </div>
      <!-- Right Column: Cart & Summary -->
      <div class="space-y-6 lg:col-span-5">
        <div
          class="bg-surface ring-surface-border sticky top-20 flex flex-col gap-4 rounded-xl p-5 shadow-sm ring-1"
        >
          <!-- Customer Selection -->
          <div>
            <div class="mb-2 flex items-center gap-2">
              <div class="bg-success-50 flex h-7 w-7 items-center justify-center rounded-lg">
                <UIcon name="i-lucide-user" class="text-success-600 h-4 w-4" />
              </div>
              <h2 class="text-surface-foreground text-sm font-semibold">Khách hàng</h2>
            </div>
            <USelectMenu
              v-model="selectedCustomerId"
              :searchable="searchCustomers"
              :items="customerOptions"
              value-key="value"
              label-key="label"
              placeholder="Tìm theo tên hoặc SĐT..."
              class="w-full"
              @update:model-value="onCustomerChange"
            />
            <div v-if="selectedCustomerId" class="mt-3 grid grid-cols-2 gap-2">
              <div
                class="rounded-lg border border-slate-100 bg-slate-50 p-2 dark:border-zinc-700 dark:bg-zinc-800/50"
              >
                <p class="mb-0.5 text-xs text-slate-500 dark:text-zinc-400">Công nợ</p>
                <p
                  :class="[
                    'text-sm font-semibold',
                    customerDebt > 0
                      ? 'text-error-600 dark:text-error-400'
                      : 'text-success-600 dark:text-success-400'
                  ]"
                >
                  {{ formatVND(customerDebt) }} / {{ formatVND(debtLimit) }}
                </p>
              </div>
              <div
                class="rounded-lg border border-slate-100 bg-slate-50 p-2 dark:border-zinc-700 dark:bg-zinc-800/50"
              >
                <p class="mb-0.5 text-xs text-slate-500 dark:text-zinc-400">Bảng giá riêng</p>
                <p class="text-primary-600 dark:text-primary-400 text-sm font-semibold">
                  {{ customPrices.size }} SP
                </p>
              </div>
            </div>
          </div>
          <!-- Cart -->
          <div class="border-surface-border border-t pt-4">
            <OrderCart
              :items="orderItems"
              :custom-prices="customPrices"
              :subtotal="subtotal"
              @update-quantity="updateQuantity"
              @remove="removeItem"
              @set-quantity="setQuantity"
            />
          </div>

          <div class="border-surface-border border-t pt-4">
            <h2 class="text-surface-foreground mb-4 text-sm font-semibold">Tóm tắt đơn hàng</h2>
            <div v-if="selectedCustomerId" class="mb-4">
              <UFormField label="Địa chỉ giao hàng">
                <USelectMenu
                  v-if="addressOptions.length"
                  v-model="selectedAddressId"
                  :items="addressOptions"
                  value-key="value"
                  label-key="label"
                  class="w-full"
                />
                <p
                  v-else
                  class="rounded-lg border border-slate-100 bg-slate-50 p-2 text-xs text-slate-400 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-500"
                >
                  Khách hàng chưa có địa chỉ
                </p>
              </UFormField>
            </div>
            <div class="space-y-3 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-slate-500">Tạm tính</span
                ><span class="font-medium">{{ formatVND(subtotal) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-500">Phí giao hàng</span>
                <UInput
                  :model-value="deliveryFeeInput"
                  class="w-28 text-right"
                  :placeholder="formatVND(0)"
                  @update:model-value="handleDeliveryFeeInput"
                />
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-500 dark:text-zinc-400">Tiền thu</span>
                <UInput
                  :model-value="amountCollectedInput"
                  class="w-28 text-right"
                  :placeholder="formatVND(total)"
                  @update:model-value="handleAmountCollectedInput"
                />
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-500">Còn nợ</span>
                <span
                  :class="['font-medium', debtAmount > 0 ? 'text-error-600' : 'text-success-600']"
                  >{{ formatVND(debtAmount) }}</span
                >
              </div>
              <div class="border-surface-border flex items-center justify-between border-t pt-3">
                <span class="text-surface-foreground font-semibold">Tổng cộng</span>
                <span class="text-primary-600 text-xl font-bold">{{ formatVND(total) }}</span>
              </div>
            </div>
            <div
              v-if="exceedsDebtLimit"
              class="bg-error-50 border-error-100 mt-4 flex items-start gap-2 rounded-lg border p-3"
            >
              <UIcon
                name="i-lucide-alert-triangle"
                class="text-error-600 mt-0.5 h-5 w-5 shrink-0"
              />
              <p class="text-error-700 text-xs">
                Đơn hàng vượt hạn mức công nợ của {{ selectedCustomer?.fullName }} (còn
                {{ formatVND(debtLimit - customerDebt) }})
              </p>
            </div>
            <div class="mt-4">
              <UFormField label="Ghi chú">
                <UTextarea
                  v-model="note"
                  :rows="2"
                  placeholder="Ghi chú cho đơn..."
                  class="w-full"
                />
              </UFormField>
            </div>
            <UButton
              :loading="saving"
              block
              size="lg"
              class="mt-4 font-semibold shadow-sm"
              :disabled="!orderItems.length || !selectedCustomerId"
              icon="i-lucide-plus"
              @click="submitOrder"
            >
              Tạo đơn hàng
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
