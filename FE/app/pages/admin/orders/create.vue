<script setup lang="ts">
import { Role, _OrderStatus, ProductStatus } from '~/utils/enums'
import type { Profile, Product, Address } from '~/utils/types'
import {
  mockProfiles,
  mockProducts,
  mockCustomPrices,
  mockAddresses,
  mockTransactions
} from '~/utils/mockData'
const toast = useToast()
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Tạo đơn hàng - BunTech Admin' })
const loading = ref(true)
const customers = ref<Profile[]>([])
const products = ref<Product[]>([])
const selectedCustomerId = ref('')
const customPrices = ref<Map<string, number>>(new Map())
const customerAddresses = ref<Address[]>([])
const selectedAddressId = ref('')
const orderItems = ref<
  {
    product_id: string
    product_name: string
    quantity: number
    price: number
    stock: number
    unit: string
    image_url: string
  }[]
>([])
const note = ref('')
const amountCollectedInput = ref('')
const deliveryFeeInput = ref('')
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
const deliveryFee = computed(() => {
  const n = Number(deliveryFeeInput.value)
  return Number.isNaN(n) ? 0 : n
})
const total = computed(() => subtotal.value + deliveryFee.value)
const amountCollected = computed(() => {
  const n = Number(amountCollectedInput.value)
  return Number.isNaN(n) ? 0 : n
})
const debtAmount = computed(() => Math.max(0, total.value - amountCollected.value))
const customerDebt = computed(() => {
  let debt = 0
  const txs = mockTransactions.filter((tx) => tx.user_id === selectedCustomerId.value)
  for (const tx of txs) {
    if (tx.type === 'DEBT_INCREASE') debt += tx.amount
    if (tx.type === 'DEBT_PAYMENT') debt -= tx.amount
  }
  return debt
})
const debtLimit = computed(() => Number(selectedCustomer.value?.debt_limit ?? 0))
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
  customers.value.map((c) => ({ value: c.id, label: `${c.full_name} — ${c.phone || 'SĐT'}` }))
)
const addressOptions = computed(() =>
  customerAddresses.value.map((a) => ({
    value: a.id,
    label: `${a.street}, ${a.ward}, ${a.district}, ${a.city}${a.is_default ? ' (Mặc định)' : ''}`
  }))
)
const _selectedAddress = computed(() =>
  customerAddresses.value.find((a) => a.id === selectedAddressId.value)
)
function loadInitData() {
  loading.value = true
  setTimeout(() => {
    customers.value = mockProfiles
      .filter((p) => p.role === Role.CUSTOMER && p.status === 'ACTIVE')
      .sort((a, b) => a.full_name.localeCompare(b.full_name))
    products.value = mockProducts
      .filter((p) => !p.deleted_at && p.status === ProductStatus.ACTIVE)
      .sort((a, b) => a.name.localeCompare(b.name))
    loading.value = false
  }, 400)
}
function onCustomerChange() {
  customPrices.value.clear()
  customerAddresses.value = []
  selectedAddressId.value = ''
  if (!selectedCustomerId.value) return
  const cps = mockCustomPrices.filter((cp) => cp.user_id === selectedCustomerId.value)
  for (const cp of cps) customPrices.value.set(cp.product_id, Number(cp.price))
  customerAddresses.value = mockAddresses
    .filter((a) => a.user_id === selectedCustomerId.value)
    .sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0))
  const defaultAddr = customerAddresses.value.find((a) => a.is_default)
  if (defaultAddr) selectedAddressId.value = defaultAddr.id
  orderItems.value = orderItems.value.map((item) => ({
    ...item,
    price: customPrices.value.has(item.product_id)
      ? customPrices.value.get(item.product_id)!
      : item.price
  }))
}
function getProductPrice(productId: string): number {
  if (customPrices.value.has(productId)) return customPrices.value.get(productId)!
  const p = products.value.find((p) => p.id === productId)
  return Number(p?.price) || 0
}
function addProduct(productId: string) {
  if (!productId) return
  const existing = orderItems.value.find((i) => i.product_id === productId)
  if (existing) {
    existing.quantity++
    return
  }
  const product = products.value.find((p) => p.id === productId)
  if (product) {
    orderItems.value.push({
      product_id: productId,
      product_name: product.name,
      quantity: 1,
      price: getProductPrice(productId),
      stock: Number(product.stock),
      unit: product.unit,
      image_url: product.image_url
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
function submitOrder() {
  if (!orderItems.value.length)
    return toast.add({ title: 'Vui lòng chọn ít nhất một sản phẩm', color: 'error' })
  if (!selectedCustomerId.value)
    return toast.add({ title: 'Vui lòng chọn khách hàng', color: 'error' })
  if (exceedsDebtLimit.value)
    return toast.add({
      title: `Cảnh báo: Đơn hàng vượt hạn mức công nợ của ${selectedCustomer.value?.full_name || ''}`,
      color: 'error'
    })

  saving.value = true
  setTimeout(() => {
    createdOrderId.value = `ord-${String(Date.now()).slice(-6)}`
    success.value = true
    saving.value = false
    toast.add({ title: 'Tạo đơn hàng thành công!', color: 'success' })
  }, 800)
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
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-plus"
          @click="
            success = false
            orderItems = []
            selectedCustomerId = ''
            note = ''
            amountCollectedInput = ''
            deliveryFeeInput = ''
          "
          >Tạo đơn khác</UButton
        >
      </div>
    </div>
    <div v-else class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div class="space-y-6 lg:col-span-2">
        <!-- Customer Select -->
        <div class="bg-surface ring-surface-border rounded-xl p-5 shadow-sm ring-1">
          <div class="mb-4 flex items-center gap-2">
            <div class="bg-success-50 flex h-8 w-8 items-center justify-center rounded-lg">
              <UIcon name="i-lucide-user" class="text-success-600 h-4 w-4" />
            </div>
            <div>
              <h2 class="text-surface-foreground text-sm font-semibold">Chọn khách hàng</h2>
              <p class="text-xs text-slate-500">Khách hàng sẽ áp dụng bảng giá riêng</p>
            </div>
          </div>

          <USelectMenu
            v-model="selectedCustomerId"
            :items="customerOptions"
            value-key="value"
            label-key="label"
            placeholder="Chọn khách hàng..."
            class="w-full"
            @update:model-value="onCustomerChange"
          />
          <div v-if="selectedCustomerId" class="mt-4 grid grid-cols-3 gap-3">
            <div
              class="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/50"
            >
              <p class="mb-0.5 text-xs text-slate-500 dark:text-zinc-400">Công nợ hiện tại</p>
              <p
                :class="[
                  'text-sm font-semibold',
                  customerDebt > 0
                    ? 'text-error-600 dark:text-error-400'
                    : 'text-success-600 dark:text-success-400'
                ]"
              >
                {{ formatVND(customerDebt) }}
              </p>
            </div>
            <div
              class="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/50"
            >
              <p class="mb-0.5 text-xs text-slate-500 dark:text-zinc-400">Hạn mức nợ</p>
              <p class="text-surface-foreground text-sm font-semibold">
                {{ formatVND(debtLimit) }}
              </p>
            </div>
            <div
              class="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/50"
            >
              <p class="mb-0.5 text-xs text-slate-500 dark:text-zinc-400">Bảng giá riêng</p>
              <p class="text-primary-600 dark:text-primary-400 text-sm font-semibold">
                {{ customPrices.size }} sản phẩm
              </p>
            </div>
          </div>
        </div>
        <!-- Product Picker -->
        <div class="bg-surface ring-surface-border rounded-xl p-5 shadow-sm ring-1">
          <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="bg-primary-50 flex h-8 w-8 items-center justify-center rounded-lg">
                <UIcon name="i-lucide-package" class="text-primary-600 h-4 w-4" />
              </div>
              <div>
                <h2 class="text-surface-foreground text-sm font-semibold">Chọn sản phẩm</h2>
                <p class="text-xs text-slate-500">Bấm để thêm vào giỏ hàng</p>
              </div>
            </div>
            <div class="relative w-48 text-sm">
              <UInput
                v-model="searchQuery"
                icon="i-lucide-search"
                placeholder="Tìm sản phẩm..."
                class="w-full"
              />
            </div>
          </div>
          <div
            v-if="filteredProducts.length"
            class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
          >
            <UButton
              v-for="p in filteredProducts"
              :key="p.id"
              variant="ghost"
              color="neutral"
              type="button"
              :class="[
                'relative rounded-xl border p-3 text-left transition-all',
                orderItems.some((i) => i.product_id === p.id)
                  ? 'border-primary-500 ring-primary-500 bg-primary-50/50 ring-1'
                  : 'border-surface-border bg-surface shadow-sm hover:border-slate-300'
              ]"
              @click="addProduct(p.id)"
            >
              <div
                v-if="orderItems.some((i) => i.product_id === p.id)"
                class="bg-primary-600 absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full text-white shadow-sm"
              >
                <UIcon name="i-lucide-check-circle-2" class="h-3.5 w-3.5" />
              </div>
              <div
                class="mb-2 flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800"
              >
                <NuxtImg
                  v-if="p.image_url"
                  :src="p.image_url"
                  :alt="p.name"
                  class="h-full w-full object-cover"
                  loading="lazy"
                />
                <UIcon
                  v-else
                  name="i-lucide-package"
                  class="h-6 w-6 text-slate-300 dark:text-zinc-600"
                />
              </div>
              <p class="text-surface-foreground truncate text-xs font-medium">{{ p.name }}</p>
              <div class="mt-1 flex items-center justify-between">
                <span class="text-primary-600 text-xs font-semibold">{{ formatVND(p.price) }}</span>
                <span class="text-[10px] text-slate-400">{{ p.stock }} {{ p.unit }}</span>
              </div>
            </UButton>
          </div>
          <div v-else class="py-8 text-center text-sm text-slate-500">Không tìm thấy sản phẩm</div>
        </div>
        <!-- Cart -->
        <div class="bg-surface ring-surface-border rounded-xl p-5 shadow-sm ring-1">
          <div class="mb-4 flex items-center gap-2">
            <div class="bg-info-50 flex h-8 w-8 items-center justify-center rounded-lg">
              <UIcon name="i-lucide-shopping-cart" class="text-info-600 h-4 w-4" />
            </div>
            <div>
              <h2 class="text-surface-foreground text-sm font-semibold">Giỏ hàng</h2>
              <p class="text-xs text-slate-500">{{ orderItems.length }} sản phẩm</p>
            </div>
          </div>
          <template v-if="orderItems.length">
            <TransitionGroup
              name="list"
              tag="div"
              class="space-y-2 overflow-hidden px-1"
              enter-active-class="transition duration-300 ease-out"
              enter-from-class="opacity-0 translate-x-8"
              enter-to-class="opacity-100 translate-x-0"
              leave-active-class="transition duration-200 ease-in absolute w-full"
              leave-from-class="opacity-100 translate-x-0"
              leave-to-class="opacity-0 -translate-x-8"
              move-class="transition duration-300 ease-out"
            >
              <div
                v-for="(item, i) in orderItems"
                :key="item.product_id"
                class="bg-surface flex items-center gap-3 rounded-xl border border-transparent p-3 transition-colors hover:border-slate-200 hover:bg-slate-50 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/50"
              >
                <div class="min-w-0 flex-1">
                  <p class="text-surface-foreground truncate text-sm font-medium">
                    {{ item.product_name }}
                  </p>
                  <p
                    v-if="customPrices.has(item.product_id)"
                    class="text-primary-600 text-[10px] font-medium"
                  >
                    Giá riêng
                  </p>
                  <p class="hidden text-xs text-slate-500 sm:block">{{ formatVND(item.price) }}</p>
                </div>
                <div
                  class="border-surface-border bg-surface flex items-center gap-1 rounded-lg border"
                >
                  <UButton
                    variant="ghost"
                    color="neutral"
                    size="xs"
                    icon="i-lucide-minus"
                    aria-label="Giảm"
                    @click="updateQuantity(i, -1)"
                  />
                  <UInput
                    :model-value="item.quantity"
                    type="number"
                    :min="1"
                    size="xs"
                    class="w-12 text-center"
                    @update:model-value="
                      (v: string | number) => {
                        const num = Number(v)
                        if (num > 0) item.quantity = num
                      }
                    "
                  />
                  <UButton
                    variant="ghost"
                    color="neutral"
                    size="xs"
                    icon="i-lucide-plus"
                    aria-label="Tăng"
                    @click="updateQuantity(i, 1)"
                  />
                </div>
                <div class="w-24 text-right">
                  <span class="text-surface-foreground text-sm font-semibold">{{
                    formatVND(item.quantity * item.price)
                  }}</span>
                </div>
                <UButton
                  color="error"
                  variant="ghost"
                  icon="i-lucide-trash-2"
                  size="sm"
                  @click="removeItem(i)"
                />
              </div>
            </TransitionGroup>
            <div class="border-surface-border mt-4 flex items-center justify-between border-t pt-4">
              <span class="text-surface-foreground text-sm font-semibold">Tạm tính</span>
              <span class="text-surface-foreground text-lg font-bold">{{
                formatVND(subtotal)
              }}</span>
            </div>
          </template>
          <div v-else class="py-12 text-center">
            <div
              class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50"
            >
              <UIcon name="i-lucide-shopping-cart" class="h-6 w-6 text-slate-300" />
            </div>
            <p class="text-surface-foreground text-sm font-medium">Giỏ hàng trống</p>
          </div>
        </div>
      </div>
      <!-- Right Column -->
      <div class="space-y-6">
        <div class="bg-surface ring-surface-border sticky top-20 rounded-xl p-5 shadow-sm ring-1">
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
                v-model="deliveryFeeInput"
                type="text"
                class="w-28 text-right"
                :placeholder="formatVND(0)"
              />
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500 dark:text-zinc-400">Tiền thu</span>
              <UInput
                v-model="amountCollectedInput"
                type="text"
                class="w-28 text-right"
                :placeholder="formatVND(total)"
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
            <UIcon name="i-lucide-alert-triangle" class="text-error-600 mt-0.5 h-5 w-5 shrink-0" />
            <p class="text-error-700 text-xs">
              Đơn hàng vượt hạn mức công nợ của {{ selectedCustomer?.full_name }} (còn
              {{ formatVND(debtLimit - customerDebt) }})
            </p>
          </div>
          <div class="mt-4">
            <UFormField label="Ghi chú">
              <UTextarea v-model="note" :rows="2" placeholder="Ghi chú cho đơn..." class="w-full" />
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
</template>
