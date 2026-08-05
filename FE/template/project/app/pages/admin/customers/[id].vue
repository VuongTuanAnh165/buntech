<script setup lang="ts">
import {
  ArrowLeft, Plus, Pencil, Trash2, Phone, Wallet, MapPin, Star,
  ShoppingBag, CreditCard, TrendingUp, TrendingDown, Home, Tag,
} from 'lucide-vue-next'
import { OrderStatus, ORDER_STATUS_COLORS, Role, UserStatus, TransactionType, ProductStatus } from '../../../core/enums'
import type { Profile, Order, Transaction, Address, CustomPrice, Product } from '../../../core/types'

const { t } = useI18n()
const toast = useToast()
const route = useRoute()
const router = useRouter()
const { formatVND, formatDate, formatDateTime } = useFormat()

definePageMeta({ layout: 'admin' })

const customerId = route.params.id as string

// ─── State ─────────────────────────────────────────────
const loading = ref(true)
const error = ref(false)
const customer = ref<Profile | null>(null)
const activeTab = ref<'orders' | 'debt' | 'addresses' | 'prices'>('orders')

const orders = ref<Order[]>([])
const transactions = ref<Transaction[]>([])
const addresses = ref<Address[]>([])
const customPrices = ref<(CustomPrice & { product?: Product | null })[]>([])

const showAddressModal = ref(false)
const editingAddressId = ref<string | null>(null)
const addressForm = ref({ full_name: '', phone: '', street: '', ward: '', district: '', city: '', is_default: false })

const showPriceModal = ref(false)
const priceForm = ref({ product_id: '', price: 0 })

// ─── Computed ──────────────────────────────────────────
const customerName = computed(() => customer.value?.full_name || '—')

const currentDebt = computed(() => {
  let debt = 0
  for (const tx of transactions.value) {
    if (tx.type === TransactionType.DEBT_INCREASE) debt += tx.amount
    if (tx.type === TransactionType.DEBT_PAYMENT) debt -= tx.amount
  }
  return debt
})

const debtLimit = computed(() => Number(customer.value?.debt_limit ?? 0))
const debtRemaining = computed(() => Math.max(0, debtLimit.value - currentDebt.value))
const debtUtilization = computed(() => debtLimit.value > 0 ? Math.min(100, Math.round((currentDebt.value / debtLimit.value) * 100)) : 0)

const totalOrders = computed(() => orders.value.length)
const totalSpent = computed(() => orders.value.reduce((s, o) => s + o.total, 0))
const totalCollected = computed(() => orders.value.reduce((s, o) => s + o.amount_collected, 0))
const avgOrderValue = computed(() => totalOrders.value > 0 ? Math.round(totalSpent.value / totalOrders.value) : 0)

const debtTransactions = computed(() =>
  transactions.value.filter(tx =>
    tx.type === TransactionType.DEBT_INCREASE || tx.type === TransactionType.DEBT_PAYMENT
  )
)

const paymentTransactions = computed(() =>
  transactions.value.filter(tx => tx.type === TransactionType.PAYMENT)
)

const statCards = computed(() => [
  { label: 'Tổng đơn hàng', value: String(totalOrders.value), sub: 'đơn', icon: ShoppingBag, color: 'primary' as const },
  { label: 'Tổng chi tiêu', value: formatVND(totalSpent.value), sub: 'tất cả đơn', icon: TrendingUp, color: 'success' as const },
  { label: 'Công nợ hiện tại', value: formatVND(currentDebt.value), sub: `Hạn mức: ${formatVND(debtLimit.value)}`, icon: Wallet, color: currentDebt.value > 0 ? 'danger' as const : 'success' as const },
  { label: 'Giá trị TB/đơn', value: formatVND(avgOrderValue), sub: 'mỗi đơn hàng', icon: CreditCard, color: 'secondary' as const },
])

const tabs = computed(() => [
  { key: 'orders' as const, label: 'Lịch sử đơn hàng', icon: ShoppingBag, count: orders.value.length },
  { key: 'debt' as const, label: 'Công nợ', icon: Wallet, count: debtTransactions.value.length },
  { key: 'addresses' as const, label: 'Sổ địa chỉ', icon: MapPin, count: addresses.value.length },
  { key: 'prices' as const, label: 'Bảng giá riêng', icon: Tag, count: customPrices.value.length },
])

const colorMap: Record<string, { bg: string; text: string; ring: string }> = {
  primary: { bg: 'bg-primary-50 dark:bg-primary-900/20', text: 'text-primary-600 dark:text-primary-400', ring: 'ring-primary-100 dark:ring-primary-900/30' },
  success: { bg: 'bg-success-50 dark:bg-success-900/20', text: 'text-success-600 dark:text-success-400', ring: 'ring-success-100 dark:ring-success-900/30' },
  danger: { bg: 'bg-danger-50 dark:bg-danger-900/20', text: 'text-danger-600 dark:text-danger-400', ring: 'ring-danger-100 dark:ring-danger-900/30' },
  secondary: { bg: 'bg-secondary-50 dark:bg-secondary-900/20', text: 'text-secondary-600 dark:text-secondary-400', ring: 'ring-secondary-100 dark:ring-secondary-900/30' },
}

// ─── Load ──────────────────────────────────────────────
function loadCustomer() {
  loading.value = true
  error.value = false
  try {
    const profile = mockProfiles.find(p => p.id === customerId)
    if (!profile) { error.value = true; return }
    customer.value = profile

    orders.value = mockOrders
      .filter(o => o.user_id === customerId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    transactions.value = mockTransactions
      .filter(tx => tx.user_id === customerId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    addresses.value = mockAddresses
      .filter(a => a.user_id === customerId)
      .sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0))

    const cps = mockCustomPrices.filter(cp => cp.user_id === customerId)
    customPrices.value = cps.map(cp => {
      const product = mockProducts.find(p => p.id === cp.product_id) || null
      return { ...cp, product }
    }).sort((a, b) => b.price - a.price)
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

// ─── Address modal ─────────────────────────────────────
function openAddAddress() {
  editingAddressId.value = null
  addressForm.value = { full_name: '', phone: '', street: '', ward: '', district: '', city: '', is_default: false }
  showAddressModal.value = true
}

function openEditAddress(addr: Address) {
  editingAddressId.value = addr.id
  addressForm.value = {
    full_name: addr.full_name, phone: addr.phone || '', street: addr.street,
    ward: addr.ward, district: addr.district, city: addr.city, is_default: addr.is_default,
  }
  showAddressModal.value = true
}

function saveAddress() {
  if (!addressForm.value.full_name || !addressForm.value.street) {
    toast.error('Vui lòng nhập tên và địa chỉ')
    return
  }
  if (editingAddressId.value) {
    const idx = addresses.value.findIndex(a => a.id === editingAddressId.value)
    if (idx >= 0) {
      addresses.value[idx] = { ...addresses.value[idx], ...addressForm.value }
      toast.success('Đã cập nhật địa chỉ')
    }
  } else {
    addresses.value.unshift({
      id: `addr-${Date.now()}`,
      user_id: customerId,
      ...addressForm.value,
      created_at: new Date().toISOString(),
    })
    toast.success('Đã thêm địa chỉ mới')
  }
  showAddressModal.value = false
}

function deleteAddress(id: string) {
  addresses.value = addresses.value.filter(a => a.id !== id)
  toast.success('Đã xoá địa chỉ')
}

// ─── Price modal ───────────────────────────────────────
function openAddPrice() {
  priceForm.value = { product_id: '', price: 0 }
  showPriceModal.value = true
}

function savePrice() {
  if (!priceForm.value.product_id || priceForm.value.price <= 0) {
    toast.error('Vui lòng chọn sản phẩm và nhập giá')
    return
  }
  const existing = customPrices.value.findIndex(cp => cp.product_id === priceForm.value.product_id)
  const product = mockProducts.find(p => p.id === priceForm.value.product_id)
  if (existing >= 0) {
    customPrices.value[existing].price = priceForm.value.price
    toast.success('Đã cập nhật giá riêng')
  } else {
    customPrices.value.unshift({
      id: `cpr-${Date.now()}`,
      user_id: customerId,
      product_id: priceForm.value.product_id,
      price: priceForm.value.price,
      created_at: new Date().toISOString(),
      product: product || null,
    })
    toast.success('Đã thiết lập giá riêng')
  }
  showPriceModal.value = false
}

function deletePrice(id: string) {
  customPrices.value = customPrices.value.filter(cp => cp.id !== id)
  toast.success('Đã xoá giá riêng')
}

const availableProducts = computed(() =>
  mockProducts.filter(p => !p.deleted_at && p.status === ProductStatus.ACTIVE)
)

useHead({ title: () => `${customerName.value} - BunTech Admin` })
onMounted(loadCustomer)
</script>

<template>
  <div>
    <AppBreadcrumb :items="[
      { label: 'Admin', to: '/admin' },
      { label: 'Khách hàng', to: '/admin/customers' },
      { label: customerName },
    ]" />

    <button
      class="flex items-center gap-1 text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200 mb-4 min-h-[44px] px-2 transition-colors"
      @click="router.push('/admin/customers')"
    >
      <ArrowLeft class="w-4 h-4" aria-hidden="true" /> Quay lại
    </button>

    <AppErrorState v-if="error" @retry="loadCustomer" />

    <!-- Loading skeleton -->
    <template v-else-if="loading">
      <div class="space-y-4">
        <div class="card p-6 animate-fade-in-up">
          <div class="flex items-center gap-4">
            <div class="skeleton w-16 h-16 rounded-full" />
            <div class="flex-1 space-y-2">
              <div class="skeleton h-5 w-48" />
              <div class="skeleton h-4 w-32" />
              <div class="flex gap-2">
                <div class="skeleton h-6 w-20 rounded-full" />
                <div class="skeleton h-6 w-20 rounded-full" />
              </div>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="i in 4" :key="i" class="card p-4"><div class="skeleton h-16 w-full" /></div>
        </div>
        <div class="card p-6 animate-fade-in-up" style="animation-delay: 50ms">
          <div class="skeleton h-64 w-full" />
        </div>
      </div>
    </template>

    <!-- Customer detail -->
    <template v-else-if="customer">
      <!-- Header card with gradient -->
      <div class="card p-6 mb-6 animate-fade-in-up relative overflow-hidden">
        <div class="absolute -top-16 -right-16 w-56 h-56 bg-gradient-to-br from-primary-500/8 to-accent-500/8 dark:from-primary-400/8 dark:to-accent-400/8 rounded-full blur-3xl" aria-hidden="true" />
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 relative">
          <AppAvatar :name="customer.full_name" :src="customer.avatar_url" size="xl" />
          <div class="min-w-0 flex-1">
            <h1 class="text-xl sm:text-2xl font-bold text-surface-foreground tracking-tight">{{ customer.full_name }}</h1>
            <div class="flex items-center gap-3 mt-1.5 flex-wrap">
              <span class="flex items-center gap-1.5 text-sm text-slate-500 dark:text-zinc-400">
                <Phone class="w-3.5 h-3.5" aria-hidden="true" /> {{ customer.phone || 'Chưa có SĐT' }}
              </span>
              <span class="text-slate-300 dark:text-zinc-600">·</span>
              <span class="text-xs font-mono text-slate-400 dark:text-zinc-500">#{{ customer.id }}</span>
            </div>
            <div class="flex items-center gap-2 mt-2.5 flex-wrap">
              <AppBadge :color="customer.role === Role.DRIVER ? 'secondary' : customer.role === Role.ADMIN ? 'danger' : 'success'" dot>
                {{ customer.role === Role.ADMIN ? 'Quản trị' : customer.role === Role.DRIVER ? 'Tài xế' : 'Khách hàng' }}
              </AppBadge>
              <AppBadge :color="customer.status === UserStatus.ACTIVE ? 'success' : 'danger'" dot>
                {{ customer.status === UserStatus.ACTIVE ? 'Đang hoạt động' : 'Ngưng hoạt động' }}
              </AppBadge>
            </div>
          </div>
          <div class="flex flex-col items-end gap-2 flex-shrink-0">
            <div class="text-right">
              <p class="text-xs text-slate-500 dark:text-zinc-400">Hạn mức công nợ</p>
              <p class="text-xl font-bold text-surface-foreground tabular-nums">{{ formatVND(debtLimit) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Stat cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div
          v-for="(card, i) in statCards"
          :key="card.label"
          class="card card-hover p-4 stagger-item relative overflow-hidden"
          :style="{ animationDelay: `${i * 40}ms` }"
        >
          <div class="flex items-start justify-between mb-2.5">
            <div :class="['w-9 h-9 rounded-lg flex items-center justify-center ring-1', colorMap[card.color].bg, colorMap[card.color].ring]">
              <component :is="card.icon" :class="['w-[18px] h-[18px]', colorMap[card.color].text]" aria-hidden="true" />
            </div>
          </div>
          <p class="text-xs text-slate-500 dark:text-zinc-400 mb-0.5 font-medium">{{ card.label }}</p>
          <p class="text-lg font-bold text-surface-foreground tracking-tight tabular-nums truncate">{{ card.value }}</p>
          <p class="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">{{ card.sub }}</p>
        </div>
      </div>

      <!-- Tab navigation -->
      <div class="card p-1 mb-6 animate-fade-in-up" style="animation-delay: 60ms">
        <div class="flex gap-1 overflow-x-auto scrollbar-hide">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            :class="[
              'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap min-h-[40px]',
              activeTab === tab.key
                ? 'bg-primary-600 text-white shadow-sm shadow-primary-600/20'
                : 'text-slate-500 dark:text-zinc-400 hover:bg-surface-hover hover:text-surface-foreground',
            ]"
            @click="activeTab = tab.key"
          >
            <component :is="tab.icon" class="w-4 h-4" aria-hidden="true" />
            {{ tab.label }}
            <span :class="[
              'text-xs px-1.5 py-0.5 rounded-full tabular-nums',
              activeTab === tab.key ? 'bg-white/20' : 'bg-surface-hover',
            ]">{{ tab.count }}</span>
          </button>
        </div>
      </div>

      <!-- Tab content -->
      <Transition name="fade" mode="out-in">
        <!-- ===== Orders Tab ===== -->
        <div v-if="activeTab === 'orders'" key="orders" class="animate-fade-in-up">
          <AppTable
            :columns="[
              { key: 'id', label: 'Mã đơn' },
              { key: 'status', label: 'Trạng thái' },
              { key: 'total', label: 'Tổng tiền', align: 'right' as const },
              { key: 'amount_collected', label: 'Đã thu', align: 'right' as const },
              { key: 'created_at', label: 'Ngày đặt' },
            ]"
            :rows="orders"
            row-key="id"
            :empty-title="orders.length ? '' : 'Chưa có đơn hàng'"
            :empty-description="orders.length ? '' : 'Khách hàng này chưa đặt đơn hàng nào'"
            @row-click="(row: Order) => router.push(`/admin/orders/${row.id}`)"
          >
            <template #cell-id="{ value }">
              <span class="font-mono text-xs text-primary-600 dark:text-primary-400">#{{ String(value).slice(-6) }}</span>
            </template>
            <template #cell-status="{ value }">
              <AppBadge :color="ORDER_STATUS_COLORS[value as OrderStatus]">{{ t(`orderStatus.${value}`) }}</AppBadge>
            </template>
            <template #cell-total="{ value }">
              <span class="font-medium text-surface-foreground tabular-nums">{{ formatVND(Number(value)) }}</span>
            </template>
            <template #cell-amount_collected="{ value }">
              <span :class="['tabular-nums', Number(value) > 0 ? 'text-success-600 dark:text-success-400' : 'text-slate-400 dark:text-zinc-500']">
                {{ formatVND(Number(value)) }}
              </span>
            </template>
            <template #cell-created_at="{ value }">
              <span class="text-slate-500 dark:text-zinc-400">{{ formatDate(value as string) }}</span>
            </template>
          </AppTable>
        </div>

        <!-- ===== Debt Tab ===== -->
        <div v-else-if="activeTab === 'debt'" key="debt" class="space-y-6 animate-fade-in-up">
          <!-- Debt summary -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div class="card p-5 stagger-item">
              <div class="flex items-center gap-2 mb-3">
                <div class="w-7 h-7 rounded-lg bg-danger-50 dark:bg-danger-900/20 flex items-center justify-center">
                  <Wallet class="w-4 h-4 text-danger-600 dark:text-danger-400" aria-hidden="true" />
                </div>
                <h2 class="text-sm font-semibold text-surface-foreground">Công nợ hiện tại</h2>
              </div>
              <p :class="['text-3xl font-bold tabular-nums', currentDebt > 0 ? 'text-danger-600 dark:text-danger-400' : 'text-success-600 dark:text-success-400']">
                {{ formatVND(currentDebt) }}
              </p>
              <p class="text-xs text-slate-500 dark:text-zinc-400 mt-1">Từ {{ debtTransactions.length }} giao dịch</p>
            </div>

            <div class="card p-5 stagger-item" style="animation-delay: 40ms">
              <div class="flex items-center gap-2 mb-3">
                <div class="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                  <CreditCard class="w-4 h-4 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                </div>
                <h2 class="text-sm font-semibold text-surface-foreground">Hạn mức công nợ</h2>
              </div>
              <p class="text-3xl font-bold text-surface-foreground tabular-nums">{{ formatVND(debtLimit) }}</p>
              <div class="mt-3">
                <div class="flex items-center justify-between text-xs mb-1.5">
                  <span class="text-slate-500 dark:text-zinc-400">Đã sử dụng</span>
                  <span class="font-medium text-surface-foreground tabular-nums">{{ debtUtilization }}%</span>
                </div>
                <div class="h-2 rounded-full bg-surface-hover overflow-hidden">
                  <div
                    :class="['h-full rounded-full transition-all duration-500', debtUtilization > 80 ? 'bg-danger-500' : debtUtilization > 50 ? 'bg-warning-500' : 'bg-success-500']"
                    :style="{ width: `${debtUtilization}%` }"
                  />
                </div>
                <p class="text-xs text-slate-400 dark:text-zinc-500 mt-1.5">Còn lại: {{ formatVND(debtRemaining) }}</p>
              </div>
            </div>

            <div class="card p-5 stagger-item" style="animation-delay: 80ms">
              <div class="flex items-center gap-2 mb-3">
                <div class="w-7 h-7 rounded-lg bg-success-50 dark:bg-success-900/20 flex items-center justify-center">
                  <TrendingDown class="w-4 h-4 text-success-600 dark:text-success-400" aria-hidden="true" />
                </div>
                <h2 class="text-sm font-semibold text-surface-foreground">Tổng đã thanh toán</h2>
              </div>
              <p class="text-3xl font-bold text-success-600 dark:text-success-400 tabular-nums">
                {{ formatVND(paymentTransactions.reduce((s, tx) => s + tx.amount, 0)) }}
              </p>
              <p class="text-xs text-slate-500 dark:text-zinc-400 mt-1">{{ paymentTransactions.length }} lần thanh toán</p>
            </div>
          </div>

          <!-- Transaction history -->
          <div class="card p-5 stagger-item" style="animation-delay: 120ms">
            <h2 class="text-sm font-semibold text-surface-foreground mb-4">Lịch sử giao dịch</h2>
            <template v-if="transactions.length">
              <div class="space-y-0">
                <div
                  v-for="tx in transactions"
                  :key="tx.id"
                  class="flex items-center gap-3 py-3 border-b border-surface-border last:border-0"
                >
                  <div :class="[
                    'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                    tx.type === TransactionType.DEBT_INCREASE
                      ? 'bg-danger-50 dark:bg-danger-900/20'
                      : tx.type === TransactionType.DEBT_PAYMENT || tx.type === TransactionType.PAYMENT
                        ? 'bg-success-50 dark:bg-success-900/20'
                        : 'bg-secondary-50 dark:bg-secondary-900/20',
                  ]">
                    <component :is="tx.type === TransactionType.DEBT_INCREASE ? TrendingUp : TrendingDown"
                      :class="[
                        'w-4 h-4',
                        tx.type === TransactionType.DEBT_INCREASE
                          ? 'text-danger-600 dark:text-danger-400'
                          : 'text-success-600 dark:text-success-400',
                      ]"
                      aria-hidden="true"
                    />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-surface-foreground">
                      {{ tx.type === TransactionType.DEBT_INCREASE ? 'Tăng công nợ' : tx.type === TransactionType.DEBT_PAYMENT ? 'Giảm công nợ' : tx.type === TransactionType.PAYMENT ? 'Thanh toán' : 'Hoàn tiền' }}
                    </p>
                    <p class="text-xs text-slate-500 dark:text-zinc-400 truncate">{{ tx.note }}</p>
                    <p class="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">{{ formatDateTime(tx.created_at) }}</p>
                  </div>
                  <span :class="[
                    'text-sm font-semibold tabular-nums flex-shrink-0',
                    tx.type === TransactionType.DEBT_INCREASE ? 'text-danger-600 dark:text-danger-400' : 'text-success-600 dark:text-success-400',
                  ]">
                    {{ tx.type === TransactionType.DEBT_INCREASE ? '+' : '-' }}{{ formatVND(tx.amount) }}
                  </span>
                </div>
              </div>
            </template>
            <AppEmptyState v-else title="Chưa có giao dịch" description="Lịch sử công nợ sẽ hiển thị tại đây" />
          </div>
        </div>

        <!-- ===== Addresses Tab ===== -->
        <div v-else-if="activeTab === 'addresses'" key="addresses" class="animate-fade-in-up">
          <div class="flex justify-end mb-3">
            <AppButton size="sm" @click="openAddAddress">
              <Plus class="w-4 h-4" aria-hidden="true" /> Thêm địa chỉ
            </AppButton>
          </div>
          <div class="grid gap-3">
            <div
              v-for="addr in addresses"
              :key="addr.id"
              class="card card-hover p-4 flex items-start justify-between stagger-item"
            >
              <div class="flex items-start gap-3 min-w-0">
                <div class="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                  <Home class="w-4 h-4 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="font-medium text-surface-foreground">{{ addr.full_name }}</span>
                    <AppBadge v-if="addr.is_default" color="primary" size="sm">Mặc định</AppBadge>
                  </div>
                  <p class="text-sm text-slate-500 dark:text-zinc-400 tabular-nums">{{ addr.phone || 'Chưa có SĐT' }}</p>
                  <p class="text-sm text-slate-600 dark:text-zinc-300 mt-0.5">{{ addr.street }}, {{ addr.ward }}, {{ addr.district }}, {{ addr.city }}</p>
                </div>
              </div>
              <div class="flex gap-1 flex-shrink-0">
                <AppIconButton :icon="Pencil" label="Sửa địa chỉ" variant="edit" @click="openEditAddress(addr)" />
                <AppIconButton :icon="Trash2" label="Xoá địa chỉ" variant="delete" @click="deleteAddress(addr.id)" />
              </div>
            </div>
            <AppEmptyState v-if="!addresses.length" title="Chưa có địa chỉ" description="Sổ địa chỉ của khách hàng sẽ hiển thị tại đây" />
          </div>
        </div>

        <!-- ===== Custom Prices Tab ===== -->
        <div v-else-if="activeTab === 'prices'" key="prices" class="animate-fade-in-up">
          <div class="flex justify-end mb-3">
            <AppButton size="sm" @click="openAddPrice">
              <Plus class="w-4 h-4" aria-hidden="true" /> Thiết lập giá riêng
            </AppButton>
          </div>
          <AppTable
            :columns="[
              { key: 'product', label: 'Sản phẩm' },
              { key: 'unit', label: 'Đơn vị', hideOnMobile: true },
              { key: 'default_price', label: 'Giá gốc', align: 'right' as const, hideOnMobile: true },
              { key: 'price', label: 'Giá riêng', align: 'right' as const },
              { key: 'discount', label: 'Chiết khấu', align: 'right' as const, hideOnMobile: true },
              { key: 'actions', label: '', align: 'right' as const },
            ]"
            :rows="customPrices"
            row-key="id"
            :empty-title="customPrices.length ? '' : 'Chưa có giá riêng'"
            :empty-description="customPrices.length ? '' : 'Thiết lập giá riêng cho khách hàng này'"
          >
            <template #cell-product="{ row }">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-surface-hover overflow-hidden flex-shrink-0 flex items-center justify-center">
                  <img
                    v-if="row.product?.image_url"
                    :src="row.product.image_url"
                    :alt="row.product.name"
                    class="w-full h-full object-cover"
                  >
                  <Tag v-else class="w-4 h-4 text-slate-300 dark:text-zinc-600" aria-hidden="true" />
                </div>
                <span class="text-surface-foreground font-medium">{{ row.product?.name || 'Sản phẩm đã xoá' }}</span>
              </div>
            </template>
            <template #cell-unit="{ row }">
              <span class="text-slate-500 dark:text-zinc-400">{{ row.product?.unit || '—' }}</span>
            </template>
            <template #cell-default_price="{ row }">
              <span class="text-slate-500 dark:text-zinc-400 tabular-nums line-through">{{ formatVND(Number(row.product?.price ?? 0)) }}</span>
            </template>
            <template #cell-price="{ value }">
              <span class="font-semibold text-primary-600 dark:text-primary-400 tabular-nums">{{ formatVND(Number(value)) }}</span>
            </template>
            <template #cell-discount="{ row }">
              <span v-if="row.product?.price" class="text-xs font-medium text-success-600 dark:text-success-400 tabular-nums">
                -{{ Math.round((1 - Number(row.price) / Number(row.product.price)) * 100) }}%
              </span>
              <span v-else class="text-slate-400">—</span>
            </template>
            <template #cell-actions="{ row }">
              <AppIconButton :icon="Trash2" label="Xoá giá riêng" variant="delete" @click.stop="deletePrice(row.id)" />
            </template>
          </AppTable>
        </div>
      </Transition>
    </template>

    <AppEmptyState v-else title="Không tìm thấy khách hàng" description="Khách hàng không tồn tại hoặc đã bị xoá" />

    <!-- Address Modal -->
    <AppModal v-model="showAddressModal" :title="editingAddressId ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'" size="md">
      <form class="space-y-4" @submit.prevent="saveAddress">
        <AppInput v-model="addressForm.full_name" label="Họ và tên" :required="true" placeholder="Nguyễn Văn A" />
        <AppInput v-model="addressForm.phone" label="Số điện thoại" placeholder="0901 234 567" />
        <AppInput v-model="addressForm.street" label="Số nhà, đường" :required="true" placeholder="123 Lê Lợi" />
        <div class="grid grid-cols-2 gap-3">
          <AppInput v-model="addressForm.ward" label="Phường/Xã" placeholder="Phường Bến Nghé" />
          <AppInput v-model="addressForm.district" label="Quận/Huyện" placeholder="Quận 1" />
        </div>
        <AppInput v-model="addressForm.city" label="Thành phố" placeholder="TP. Hồ Chí Minh" />
        <label class="flex items-center gap-2 cursor-pointer">
          <input v-model="addressForm.is_default" type="checkbox" class="rounded border-surface-border text-primary-600 dark:text-primary-400 focus:ring-primary-500">
          <span class="text-sm text-gray-700 dark:text-zinc-200">Đặt làm địa chỉ mặc định</span>
        </label>
      </form>
      <template #footer>
        <AppButton variant="ghost" @click="showAddressModal = false">Huỷ</AppButton>
        <AppButton @click="saveAddress">{{ editingAddressId ? 'Cập nhật' : 'Thêm mới' }}</AppButton>
      </template>
    </AppModal>

    <!-- Price Modal -->
    <AppModal v-model="showPriceModal" title="Thiết lập giá riêng" size="sm">
      <form class="space-y-4" @submit.prevent="savePrice">
        <AppSelect
          v-model="priceForm.product_id"
          label="Chọn sản phẩm"
          :required="true"
          :options="availableProducts.map(p => ({ value: p.id, label: `${p.name} — ${formatVND(p.price)}/${p.unit}` }))"
          placeholder="Chọn sản phẩm..."
        />
        <AppInput v-model="priceForm.price" label="Giá riêng" type="number" :required="true" :min="0" :suffix="'₫'" />
      </form>
      <template #footer>
        <AppButton variant="ghost" @click="showPriceModal = false">Huỷ</AppButton>
        <AppButton @click="savePrice">Lưu giá</AppButton>
      </template>
    </AppModal>
  </div>
</template>
