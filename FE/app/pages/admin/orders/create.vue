<script setup lang="ts">
import type { UserDTO, AdminProduct, Address } from '~/utils/types'
import { normalizePaginationResponse } from '~/utils/api'
import { productService } from '~/services/productService'
import { customerPriceService } from '~/services/customerPriceService'
import { useAdminOrders } from '~/composables/admin/useAdminOrders'
import { useUsers } from '~/composables/admin/useUsers'

import OrderProductPicker from '~/components/features/admin/orders/create/OrderProductPicker.vue'
import OrderCart from '~/components/features/admin/orders/create/OrderCart.vue'
import { t } from '~/utils/i18n'

const toast = useToast()
const route = useRoute()
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: t('admin_order_create_seo_title') })
const { fetchUsers, fetchAddresses } = useUsers()
const { createOrder, getOrder } = useAdminOrders()
const loading = ref(true)
const customers = ref<UserDTO[]>([])
const products = ref<AdminProduct[]>([])
const selectedCustomerId = ref<number | ''>('')
const customPrices = ref<Map<string, number>>(new Map())
const customerAddresses = ref<Address[]>([])
const selectedAddressId = ref<number | ''>('')
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
  customers.value.map((c) => ({
    value: c.id,
    label: `${c.fullName} — ${c.phoneNumber || t('admin_order_create_customer_ph')}`
  }))
)
const addressOptions = computed(() =>
  customerAddresses.value.map((a) => ({
    value: a.id,
    label: `${a.addressLine || a.street}, ${a.ward}, ${a.district}, ${a.province || a.city}${a.isDefault ? ` (${t('admin_address_col_default')})` : ''}`
  }))
)
const _selectedAddress = computed(() =>
  customerAddresses.value.find((a) => a.id === selectedAddressId.value)
)
const loadingCustomers = ref(false)
async function searchCustomers(q: string) {
  loadingCustomers.value = true
  try {
    const res = await fetchUsers({ role: 'customer', search: q, limit: 10 })
    const fetched = res.data?.data || []
    fetched.forEach((f) => {
      if (!customers.value.some((c) => c.id === f.id)) customers.value.push(f)
    })
    return fetched.map((c) => ({
      value: c.id,
      label: `${c.fullName} — ${c.phoneNumber || t('admin_order_create_customer_ph')}`
    }))
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
    const res = await fetchUsers({ role: 'customer', limit: 10 })
    customers.value = res.data?.data || []

    const pRes = await productService.getAdminProducts({ limit: 1000 })
    const normalizedProducts = normalizePaginationResponse<AdminProduct>(pRes)
    products.value = normalizedProducts.data.filter((p) => p.isActive) || []
    products.value.sort((a, b) => a.name.localeCompare(b.name))

    if (route.query.copyFrom) {
      try {
        const orderRes = await getOrder(route.query.copyFrom as string)
        const oldOrder = orderRes.data
        if (oldOrder) {
          selectedCustomerId.value = oldOrder.userId || ''

          if (!customers.value.some((c) => c.id === selectedCustomerId.value)) {
            const cRes = await fetchUsers({
              role: 'customer',
              search: oldOrder.user?.phoneNumber || ''
            })
            const fetched = cRes.data?.data || []
            fetched.forEach((f) => {
              if (!customers.value.some((c) => c.id === f.id)) customers.value.push(f)
            })
          }

          await onCustomerChange()

          if (oldOrder.shippingAddress?.id) {
            const hasAddress = customerAddresses.value.some(
              (a) => a.id === oldOrder.shippingAddress?.id
            )
            if (hasAddress) selectedAddressId.value = Number(oldOrder.shippingAddress.id)
          }

          if (oldOrder.note) {
            note.value = oldOrder.note
          }

          if (oldOrder.items?.length) {
            for (const item of oldOrder.items) {
              addProduct(Number(item.productId))
              const idx = orderItems.value.findIndex((i) => i.productId === Number(item.productId))
              if (idx !== -1) {
                setQuantity(idx, Number(item.quantity))
              }
            }
          }

          toast.add({ title: t('admin_order_create_toast_old_ok'), color: 'success' })
        }
      } catch {
        toast.add({ title: t('admin_order_create_toast_old_err'), color: 'error' })
      }
    }
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
    if (defaultAddr) selectedAddressId.value = Number(defaultAddr.id)

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
    toast.add({ title: t('admin_order_create_toast_err_product'), color: 'error' })
    return
  }
  if (!selectedCustomerId.value) {
    toast.add({ title: t('admin_debt_pay_err_user'), color: 'error' })
    return
  }
  if (!selectedAddressId.value) {
    toast.add({ title: t('wholesale_order_err_no_address'), color: 'error' })
    return
  }
  if (exceedsDebtLimit.value) {
    toast.add({
      title: t('admin_order_create_toast_err_limit', {
        name: selectedCustomer.value?.fullName || ''
      }),
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
      :title="$t('admin_order_create_title')"
      :description="$t('admin_order_create_desc')"
      :breadcrumbs="[{ label: $t('admin_orders_btn_create') }]"
    >
      <template #actions>
        <UButton color="neutral" variant="outline" icon="i-lucide-arrow-left" to="/admin/orders">{{
          $t('admin_blog_cat_btn_back')
        }}</UButton>
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
      <h2 class="text-surface-foreground mb-1 text-xl font-bold">
        {{ $t('admin_order_create_success_title') }}
      </h2>
      <p class="mb-1 text-sm text-slate-500">{{ $t('admin_order_create_success_id') }}</p>
      <p class="text-primary-600 mb-5 font-mono text-lg font-semibold">
        #{{ String(createdOrderId).slice(0, 8) }}
      </p>
      <div class="flex justify-center gap-3">
        <UButton :to="`/admin/orders/${createdOrderId}`" icon="i-lucide-package">{{
          $t('admin_order_create_btn_view')
        }}</UButton>
        <UButton color="neutral" variant="outline" icon="i-lucide-plus" @click="resetForm">{{
          $t('admin_order_create_btn_create_other')
        }}</UButton>
      </div>
    </div>
    <div v-else class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Left Column: Products -->
      <div class="space-y-6 lg:col-span-2">
        <OrderProductPicker
          v-model:search-query="searchQuery"
          :products="filteredProducts"
          :order-items="orderItems"
          @add="addProduct"
        />
      </div>
      <!-- Right Column: Cart & Summary -->
      <div class="space-y-6 lg:col-span-1">
        <div
          class="bg-surface ring-surface-border sticky top-20 flex flex-col gap-4 rounded-xl p-5 shadow-sm ring-1"
        >
          <!-- Customer Selection -->
          <div>
            <div class="mb-2 flex items-center gap-2">
              <div class="bg-success-50 flex h-7 w-7 items-center justify-center rounded-lg">
                <UIcon name="i-lucide-user" class="text-success-600 h-4 w-4" />
              </div>
              <h2 class="text-surface-foreground text-sm font-semibold">
                {{ $t('common_customer') }}
              </h2>
            </div>
            <USelectMenu
              v-model="selectedCustomerId"
              :searchable="searchCustomers"
              :items="customerOptions"
              value-key="value"
              label-key="label"
              :placeholder="$t('admin_order_create_customer_search_ph')"
              class="w-full"
              @update:model-value="onCustomerChange"
            />
            <div v-if="selectedCustomerId" class="mt-3 grid grid-cols-2 gap-2">
              <div
                class="rounded-lg border border-slate-100 bg-slate-50 p-2 dark:border-zinc-700 dark:bg-zinc-800/50"
              >
                <p class="mb-0.5 text-xs text-slate-500 dark:text-zinc-400">{{ $t('nav_debt') }}</p>
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
                <p class="mb-0.5 text-xs text-slate-500 dark:text-zinc-400">
                  {{ $t('admin_customer_detail_tab_price') }}
                </p>
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
            <h2 class="text-surface-foreground mb-4 text-sm font-semibold">
              {{ $t('admin_order_create_summary') }}
            </h2>
            <div v-if="selectedCustomerId" class="mb-4">
              <UFormField :label="$t('admin_order_create_address')">
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
                  {{ $t('admin_order_create_no_address') }}
                </p>
              </UFormField>
            </div>
            <div class="space-y-3 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-slate-500">{{ $t('admin_order_cart_subtotal') }}</span
                ><span class="font-medium">{{ formatVND(subtotal) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-500">{{ $t('admin_order_create_fee') }}</span>
                <UInput
                  :model-value="deliveryFeeInput"
                  size="md"
                  class="w-32"
                  input-class="text-right text-sm font-medium"
                  :placeholder="formatVND(0)"
                  @update:model-value="handleDeliveryFeeInput"
                />
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-500 dark:text-zinc-400">{{
                  $t('admin_order_create_collected')
                }}</span>
                <UInput
                  :model-value="amountCollectedInput"
                  size="md"
                  class="w-32"
                  input-class="text-right text-sm font-medium"
                  :placeholder="formatVND(total)"
                  @update:model-value="handleAmountCollectedInput"
                />
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-500">{{ $t('admin_order_create_remain') }}</span>
                <span
                  :class="['font-medium', debtAmount > 0 ? 'text-error-600' : 'text-success-600']"
                  >{{ formatVND(debtAmount) }}</span
                >
              </div>
              <div class="border-surface-border flex items-center justify-between border-t pt-3">
                <span class="text-surface-foreground font-semibold">{{
                  $t('quick_order_cart_total')
                }}</span>
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
                {{
                  $t('admin_order_create_limit_warn', {
                    name: selectedCustomer?.fullName || '',
                    remain: formatVND(debtLimit - customerDebt)
                  })
                }}
              </p>
            </div>
            <div class="mt-4">
              <UFormField :label="$t('admin_debt_pay_note')">
                <UTextarea
                  v-model="note"
                  :rows="2"
                  :placeholder="$t('admin_order_create_note_ph')"
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
              {{ $t('admin_order_create_btn_submit') }}
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
