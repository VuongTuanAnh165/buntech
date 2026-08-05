<script setup lang="ts">
import {
  Plus, Trash2, ArrowLeft, AlertTriangle, Search, ShoppingCart,
  CheckCircle2, User, MapPin, Package, X, ChevronRight, Loader2,
} from 'lucide-vue-next'
import { Role, OrderStatus, ProductStatus } from '../../../core/enums'
import type { Profile, Product, CustomPrice, Address } from '../../../core/types'

const { t } = useI18n()
const toast = useToast()
const router = useRouter()
const { formatVND } = useFormat()

definePageMeta({ layout: 'admin' })

// ─── State ─────────────────────────────────────────────
const loading = ref(true)
const customers = ref<Profile[]>([])
const products = ref<Product[]>([])
const selectedCustomerId = ref('')
const customPrices = ref<Map<string, number>>(new Map())
const customerAddresses = ref<Address[]>([])
const selectedAddressId = ref('')
const orderItems = ref<{ product_id: string; product_name: string; quantity: number; price: number; stock: number }[]>([])
const note = ref('')
const amountCollectedInput = ref('')
const deliveryFeeInput = ref('')
const saving = ref(false)
const searchQuery = ref('')
const success = ref(false)
const createdOrderId = ref('')

// ─── Computed ──────────────────────────────────────────
const selectedCustomer = computed(() => customers.value.find(c => c.id === selectedCustomerId.value))
const subtotal = computed(() => orderItems.value.reduce((sum, item) => sum + item.quantity * item.price, 0))
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
  const txs = mockTransactions.filter(tx => tx.user_id === selectedCustomerId.value)
  for (const tx of txs) {
    if (tx.type === 'DEBT_INCREASE') debt += tx.amount
    if (tx.type === 'DEBT_PAYMENT') debt -= tx.amount
  }
  return debt
})
const debtLimit = computed(() => Number(selectedCustomer.value?.debt_limit ?? 0))
const exceedsDebtLimit = computed(() =>
  debtLimit.value > 0 && customerDebt.value + debtAmount.value > debtLimit.value
)

const filteredProducts = computed(() => {
  if (!searchQuery.value.trim()) return products.value.slice(0, 24)
  const q = searchQuery.value.toLowerCase().trim()
  return products.value.filter(p =>
    p.name.toLowerCase().includes(q) || (p.category?.name || '').toLowerCase().includes(q)
  ).slice(0, 24)
})

const productOptions = computed(() =>
  products.value.map(p => ({
    value: p.id,
    label: `${p.name} — ${formatVND(p.price)}/${p.unit}`,
  }))
)

const customerOptions = computed(() =>
  customers.value.map(c => ({ value: c.id, label: `${c.full_name} — ${c.phone || 'SĐT'}` }))
)

const addressOptions = computed(() =>
  customerAddresses.value.map(a => ({
    value: a.id,
    label: `${a.street}, ${a.ward}, ${a.district}, ${a.city}${a.is_default ? ' (Mặc định)' : ''}`,
  }))
)

const selectedAddress = computed(() => customerAddresses.value.find(a => a.id === selectedAddressId.value))

// ─── Load ──────────────────────────────────────────────
function loadInitData() {
  loading.value = true
  try {
    customers.value = mockProfiles
      .filter(p => p.role === Role.CUSTOMER && p.status === 'ACTIVE')
      .sort((a, b) => a.full_name.localeCompare(b.full_name))

    products.value = mockProducts
      .filter(p => !p.deleted_at && p.status === ProductStatus.ACTIVE)
      .sort((a, b) => a.name.localeCompare(b.name))

    checkCopyData()
  } finally {
    loading.value = false
  }
}

function checkCopyData() {
  if (!import.meta.client) return
  const copyData = sessionStorage.getItem('copyOrderData')
  if (!copyData) return
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

function onCustomerChange() {
  customPrices.value.clear()
  customerAddresses.value = []
  selectedAddressId.value = ''
  if (!selectedCustomerId.value) return

  const cps = mockCustomPrices.filter(cp => cp.user_id === selectedCustomerId.value)
  for (const cp of cps) {
    customPrices.value.set(cp.product_id, Number(cp.price))
  }

  customerAddresses.value = mockAddresses
    .filter(a => a.user_id === selectedCustomerId.value)
    .sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0))

  const defaultAddr = customerAddresses.value.find(a => a.is_default)
  if (defaultAddr) selectedAddressId.value = defaultAddr.id

  // Re-price existing items
  orderItems.value = orderItems.value.map(item => ({
    ...item,
    price: customPrices.value.has(item.product_id) ? customPrices.value.get(item.product_id)! : item.price,
  }))
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
      product_name: product.name,
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

function submitOrder() {
  if (!orderItems.value.length) {
    toast.error('Vui lòng chọn ít nhất một sản phẩm')
    return
  }
  if (!selectedCustomerId.value) {
    toast.error('Vui lòng chọn khách hàng')
    return
  }
  if (exceedsDebtLimit.value) {
    toast.error(`Cảnh báo: Đơn hàng vượt hạn mức công nợ của ${selectedCustomer.value?.full_name || ''}`)
    return
  }
  saving.value = true
  setTimeout(() => {
    const newId = `ord-${String(Date.now()).slice(-6)}`
    createdOrderId.value = newId
    success.value = true
    saving.value = false
    toast.success('Tạo đơn hàng thành công!')
  }, 800)
}

function viewOrder() {
  if (createdOrderId.value) router.push(`/admin/orders/${createdOrderId.value}`)
}

useHead({ title: () => `Tạo đơn hàng - BunTech Admin` })
onMounted(loadInitData)
</script>

<template>
  <div>
    <AppBreadcrumb :items="[
      { label: 'Admin', to: '/admin' },
      { label: 'Đơn hàng', to: '/admin/orders' },
      { label: 'Tạo đơn' },
    ]" />

    <button
      class="flex items-center gap-1 text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200 mb-4 min-h-[44px] px-2 transition-colors"
      @click="router.push('/admin/orders')"
    >
      <ArrowLeft class="w-4 h-4" aria-hidden="true" /> Quay lại
    </button>

    <div class="mb-6">
      <h1 class="page-title flex items-center gap-2.5">
        <span class="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-100 dark:ring-primary-900/30 flex items-center justify-center">
          <Plus class="w-5 h-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
        </span>
        Tạo đơn hàng mới
      </h1>
      <p class="page-subtitle">Chọn khách hàng, thêm sản phẩm và xác nhận đơn</p>
    </div>

    <!-- Success state -->
    <div v-if="success" class="card p-8 text-center animate-fade-in-up max-w-lg mx-auto">
      <div class="w-16 h-16 rounded-full bg-success-50 dark:bg-success-900/20 flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 class="w-8 h-8 text-success-600 dark:text-success-400" aria-hidden="true" />
      </div>
      <h2 class="text-xl font-bold text-surface-foreground mb-1">Đơn hàng đã tạo thành công</h2>
      <p class="text-sm text-slate-500 dark:text-zinc-400 mb-1">Mã đơn hàng</p>
      <p class="text-lg font-mono font-semibold text-primary-600 dark:text-primary-400 mb-5">#{{ String(createdOrderId).slice(0, 8) }}</p>
      <div class="flex justify-center gap-3">
        <AppButton @click="viewOrder">
          <Package class="w-4 h-4" /> Xem đơn hàng
        </AppButton>
        <AppButton variant="outline" @click="success = false; orderItems = []; selectedCustomerId = ''; note = ''; amountCollectedInput = ''; deliveryFeeInput = ''">
          <Plus class="w-4 h-4" /> Tạo đơn khác
        </AppButton>
      </div>
    </div>

    <template v-else>
      <template v-if="loading">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-6">
            <div class="card p-6 animate-fade-in-up"><div class="skeleton h-32 w-full" /></div>
            <div class="card p-6 animate-fade-in-up" style="animation-delay: 50ms"><div class="skeleton h-64 w-full" /></div>
          </div>
          <div class="card p-6 animate-fade-in-up" style="animation-delay: 100ms"><div class="skeleton h-80 w-full" /></div>
        </div>
      </template>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- LEFT: 2 cols -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Customer select -->
          <div class="card p-5 animate-fade-in-up">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-7 h-7 rounded-lg bg-success-50 dark:bg-success-900/20 flex items-center justify-center">
                <User class="w-4 h-4 text-success-600 dark:text-success-400" aria-hidden="true" />
              </div>
              <div>
                <h2 class="text-sm font-semibold text-surface-foreground">Chọn khách hàng</h2>
                <p class="text-xs text-slate-500 dark:text-zinc-400">Khách hàng sẽ áp dụng bảng giá riêng</p>
              </div>
            </div>
            <AppSelect
              v-model="selectedCustomerId"
              :options="customerOptions"
              placeholder="Chọn khách hàng..."
              :searchable="true"
              @update:model-value="onCustomerChange"
            />
            <Transition name="fade">
              <div v-if="selectedCustomerId" class="mt-4 grid grid-cols-3 gap-3">
                <div class="p-3 rounded-lg bg-surface-hover">
                  <p class="text-xs text-slate-500 dark:text-zinc-400 mb-0.5">Công nợ hiện tại</p>
                  <p :class="['text-sm font-semibold tabular-nums', customerDebt > 0 ? 'text-danger-600 dark:text-danger-400' : 'text-success-600 dark:text-success-400']">
                    {{ formatVND(customerDebt) }}
                  </p>
                </div>
                <div class="p-3 rounded-lg bg-surface-hover">
                  <p class="text-xs text-slate-500 dark:text-zinc-400 mb-0.5">Hạn mức nợ</p>
                  <p class="text-sm font-semibold text-surface-foreground tabular-nums">{{ formatVND(debtLimit) }}</p>
                </div>
                <div class="p-3 rounded-lg bg-surface-hover">
                  <p class="text-xs text-slate-500 dark:text-zinc-400 mb-0.5">Bảng giá riêng</p>
                  <p class="text-sm font-semibold text-primary-600 dark:text-primary-400 tabular-nums">{{ customPrices.size }} sản phẩm</p>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Product picker -->
          <div class="card p-5 animate-fade-in-up" style="animation-delay: 50ms">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                  <Package class="w-4 h-4 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                </div>
                <div>
                  <h2 class="text-sm font-semibold text-surface-foreground">Chọn sản phẩm</h2>
                  <p class="text-xs text-slate-500 dark:text-zinc-400">Bấm để thêm vào giỏ hàng</p>
                </div>
              </div>
              <div class="relative w-48">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" aria-hidden="true" />
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Tìm sản phẩm..."
                  class="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-surface-border bg-surface text-surface-foreground focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 min-h-[40px]"
                >
                <button v-if="searchQuery" class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-surface-foreground" aria-label="Clear search" @click="searchQuery = ''">
                  <X class="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div v-if="filteredProducts.length" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              <button
                v-for="p in filteredProducts"
                :key="p.id"
                type="button"
                :class="[
                  'card card-hover p-3 text-left transition-all relative',
                  orderItems.some(i => i.product_id === p.id) ? 'ring-2 ring-primary-500' : '',
                ]"
                @click="addProduct(p.id)"
              >
                <div v-if="orderItems.some(i => i.product_id === p.id)" class="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center">
                  <CheckCircle2 class="w-3.5 h-3.5" aria-hidden="true" />
                </div>
                <div class="aspect-square rounded-lg bg-surface-hover overflow-hidden mb-2 flex items-center justify-center">
                  <img v-if="p.image_url" :src="p.image_url" :alt="p.name" class="w-full h-full object-cover">
                  <Package v-else class="w-6 h-6 text-gray-300 dark:text-zinc-600" aria-hidden="true" />
                </div>
                <p class="text-xs font-medium text-surface-foreground truncate">{{ p.name }}</p>
                <div class="flex items-center justify-between mt-1">
                  <span class="text-xs font-semibold text-primary-600 dark:text-primary-400 tabular-nums">{{ formatVND(p.price) }}</span>
                  <span class="text-[10px] text-slate-400 dark:text-zinc-500">{{ p.stock }} {{ p.unit }}</span>
                </div>
              </button>
            </div>
            <AppEmptyState v-else title="Không tìm thấy sản phẩm" description="Thử từ khoá khác" />
          </div>

          <!-- Cart -->
          <div class="card p-5 animate-fade-in-up" style="animation-delay: 100ms">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-7 h-7 rounded-lg bg-accent-50 dark:bg-accent-900/20 flex items-center justify-center">
                <ShoppingCart class="w-4 h-4 text-accent-600 dark:text-accent-400" aria-hidden="true" />
              </div>
              <div>
                <h2 class="text-sm font-semibold text-surface-foreground">Giỏ hàng</h2>
                <p class="text-xs text-slate-500 dark:text-zinc-400">{{ orderItems.length }} sản phẩm</p>
              </div>
            </div>

            <template v-if="orderItems.length">
              <div class="hidden sm:grid grid-cols-12 gap-3 px-3 pb-2 mb-1 border-b border-surface-border text-xs font-medium text-slate-500 dark:text-zinc-400">
                <div class="col-span-5">Sản phẩm</div>
                <div class="col-span-2 text-right">Đơn giá</div>
                <div class="col-span-3 text-center">Số lượng</div>
                <div class="col-span-2 text-right">Thành tiền</div>
              </div>

              <TransitionGroup name="list">
                <div
                  v-for="(item, i) in orderItems"
                  :key="item.product_id"
                  class="grid grid-cols-12 gap-3 items-center px-3 py-3 rounded-lg hover:bg-surface-hover transition-colors"
                >
                  <div class="col-span-12 sm:col-span-5 flex items-center gap-2">
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-surface-foreground truncate">{{ item.product_name }}</p>
                      <p class="text-xs text-slate-500 dark:text-zinc-400 sm:hidden">{{ formatVND(item.price) }} × {{ item.quantity }}</p>
                      <p v-if="customPrices.has(item.product_id)" class="text-[10px] text-primary-600 dark:text-primary-400 font-medium">Giá riêng</p>
                    </div>
                  </div>
                  <div class="hidden sm:block col-span-2 text-right text-sm text-slate-600 dark:text-zinc-300 tabular-nums">{{ formatVND(item.price) }}</div>
                  <div class="col-span-9 sm:col-span-3 flex items-center justify-center gap-1">
                    <button class="w-8 h-8 rounded-lg bg-surface-hover hover:bg-surface-border flex items-center justify-center text-surface-foreground transition-colors min-w-[36px] min-h-[36px]" aria-label="Decrease quantity" @click="updateQuantity(i, -1)">−</button>
                    <input
                      :value="item.quantity"
                      type="number"
                      min="1"
                      class="w-12 text-center text-sm font-medium text-surface-foreground bg-transparent border-0 focus:outline-none tabular-nums"
                      @input="(e: Event) => { const v = Number((e.target as HTMLInputElement).value); if (v > 0) item.quantity = v; }"
                    >
                    <button class="w-8 h-8 rounded-lg bg-surface-hover hover:bg-surface-border flex items-center justify-center text-surface-foreground transition-colors min-w-[36px] min-h-[36px]" aria-label="Increase quantity" @click="updateQuantity(i, 1)">+</button>
                  </div>
                  <div class="col-span-3 sm:col-span-2 text-right flex items-center justify-end gap-1">
                    <span class="text-sm font-semibold text-surface-foreground tabular-nums">{{ formatVND(item.quantity * item.price) }}</span>
                    <button class="p-1.5 text-slate-400 hover:text-danger-600 dark:hover:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-lg transition-colors" aria-label="Remove item" @click="removeItem(i)">
                      <Trash2 class="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </TransitionGroup>

              <div class="mt-3 pt-3 border-t border-surface-border flex items-center justify-between">
                <span class="text-sm font-semibold text-surface-foreground">Tạm tính</span>
                <span class="text-lg font-bold text-surface-foreground tabular-nums">{{ formatVND(subtotal) }}</span>
              </div>
            </template>

            <div v-else class="flex flex-col items-center justify-center py-12 text-center">
              <div class="w-14 h-14 rounded-full bg-surface-hover flex items-center justify-center mb-3">
                <ShoppingCart class="w-7 h-7 text-slate-300 dark:text-zinc-600" aria-hidden="true" />
              </div>
              <p class="text-sm font-medium text-surface-foreground">Giỏ hàng trống</p>
              <p class="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Chọn sản phẩm từ danh sách trên</p>
            </div>
          </div>
        </div>

        <!-- RIGHT: Summary -->
        <div class="space-y-6">
          <div class="card p-5 sticky top-20 animate-fade-in-up" style="animation-delay: 150ms">
            <h2 class="text-sm font-semibold text-surface-foreground mb-4">Tóm tắt đơn hàng</h2>

            <!-- Delivery address -->
            <div v-if="selectedCustomerId" class="mb-4">
              <p class="form-label mb-1.5 flex items-center gap-1.5">
                <MapPin class="w-3.5 h-3.5" aria-hidden="true" /> Địa chỉ giao hàng
              </p>
              <AppSelect
                v-if="addressOptions.length"
                v-model="selectedAddressId"
                :options="addressOptions"
                placeholder="Chọn địa chỉ..."
                size="sm"
              />
              <p v-else class="text-xs text-slate-400 dark:text-zinc-500 p-2 bg-surface-hover rounded-lg">Khách hàng chưa có địa chỉ</p>
              <div v-if="selectedAddress" class="mt-2 p-2.5 rounded-lg bg-surface-hover text-xs text-slate-600 dark:text-zinc-300">
                {{ selectedAddress.full_name }} · <span class="tabular-nums">{{ selectedAddress.phone || '—' }}</span><br>
                {{ selectedAddress.street }}, {{ selectedAddress.ward }}, {{ selectedAddress.district }}, {{ selectedAddress.city }}
              </div>
            </div>

            <!-- Summary -->
            <div class="space-y-2.5 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-500 dark:text-zinc-400">Tạm tính</span>
                <span class="font-medium text-surface-foreground tabular-nums">{{ formatVND(subtotal) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-slate-500 dark:text-zinc-400">Phí giao hàng</span>
                <input
                  v-model="deliveryFeeInput"
                  type="text"
                  :placeholder="formatVND(0)"
                  class="w-28 text-right rounded-lg border border-surface-border bg-surface px-2 py-1 text-sm text-surface-foreground focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 min-h-[36px] tabular-nums"
                >
              </div>
              <div class="flex justify-between items-center">
                <span class="text-slate-500 dark:text-zinc-400">Tiền thu</span>
                <input
                  v-model="amountCollectedInput"
                  type="text"
                  :placeholder="formatVND(total)"
                  class="w-28 text-right rounded-lg border border-surface-border bg-surface px-2 py-1 text-sm text-surface-foreground focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 min-h-[36px] tabular-nums"
                >
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500 dark:text-zinc-400">Còn nợ</span>
                <span :class="['font-medium tabular-nums', debtAmount > 0 ? 'text-danger-600 dark:text-danger-400' : 'text-success-600 dark:text-success-400']">
                  {{ formatVND(debtAmount) }}
                </span>
              </div>
              <div class="pt-2.5 border-t border-surface-border flex justify-between items-center">
                <span class="font-semibold text-surface-foreground">Tổng cộng</span>
                <span class="text-xl font-bold text-primary-600 dark:text-primary-400 tabular-nums">{{ formatVND(total) }}</span>
              </div>
            </div>

            <!-- Debt warning -->
            <Transition name="fade">
              <div v-if="exceedsDebtLimit" class="mt-4 flex items-start gap-2 p-3 bg-danger-50 dark:bg-danger-900/20 rounded-lg">
                <AlertTriangle class="w-5 h-5 text-danger-600 dark:text-danger-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <p class="text-xs text-danger-700 dark:text-danger-300">
                  Đơn hàng vượt hạn mức công nợ của {{ selectedCustomer?.full_name || 'khách hàng' }} (còn {{ formatVND(debtLimit - customerDebt) }})
                </p>
              </div>
            </Transition>

            <!-- Note -->
            <AppInput v-model="note" label="Ghi chú" placeholder="Ghi chú cho đơn hàng..." class="mt-4" />

            <!-- Submit -->
            <AppButton :loading="saving" block class="mt-4" :disabled="!orderItems.length || !selectedCustomerId" @click="submitOrder">
              <Loader2 v-if="saving" class="w-4 h-4 animate-spin" aria-hidden="true" />
              <Plus v-else class="w-4 h-4" aria-hidden="true" />
              {{ saving ? 'Đang tạo...' : 'Tạo đơn hàng' }}
            </AppButton>
            <p v-if="!selectedCustomerId" class="text-xs text-slate-400 dark:text-zinc-500 mt-2 text-center">Chọn khách hàng để tiếp tục</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
.list-move {
  transition: transform 0.3s ease;
}
</style>
