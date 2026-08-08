<script setup lang="ts">
import {
  Role, UserStatus, TransactionType, ProductStatus, OrderStatus
} from '~/utils/mockData'
import type { Profile, Order, Transaction, Address, CustomPrice, Product } from '~/utils/mockData'
import {
  mockProfiles, mockOrders, mockTransactions, mockAddresses, mockCustomPrices, mockProducts
} from '~/utils/mockData'

const route = useRoute()
const { formatVND, formatDate, formatDateTime } = useFormat()
const toast = useToast()

definePageMeta({ layout: 'admin' })

const customerId = route.params.id as string

// State
const loading = ref(true)
const error = ref(false)
const customer = ref<Profile | null>(null)
const activeTab = ref('orders')

const orders = ref<Order[]>([])
const transactions = ref<Transaction[]>([])
const addresses = ref<Address[]>([])
const customPrices = ref<(CustomPrice & { product?: Product | null })[]>([])

const showAddressModal = ref(false)
const editingAddressId = ref<string | null>(null)
const addressForm = ref({ full_name: '', phone: '', street: '', ward: '', district: '', city: '', is_default: false })

const showPriceModal = ref(false)
const priceForm = ref({ product_id: '', price: 0 })

// Computed
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
const avgOrderValue = computed(() => totalOrders.value > 0 ? Math.round(totalSpent.value / totalOrders.value) : 0)

const debtTransactions = computed(() =>
  transactions.value.filter(tx =>
    tx.type === TransactionType.DEBT_INCREASE || tx.type === TransactionType.DEBT_PAYMENT
  )
)

const paymentTransactions = computed(() =>
  transactions.value.filter(tx => tx.type === TransactionType.PAYMENT)
)

const tabs = computed(() => [
  { value: 'orders', label: 'Lịch sử đơn hàng', icon: 'i-lucide-shopping-bag', count: orders.value.length },
  { value: 'debt', label: 'Công nợ', icon: 'i-lucide-wallet', count: debtTransactions.value.length },
  { value: 'addresses', label: 'Sổ địa chỉ', icon: 'i-lucide-map-pin', count: addresses.value.length },
  { value: 'prices', label: 'Bảng giá riêng', icon: 'i-lucide-tag', count: customPrices.value.length },
])

const statCards = computed(() => [
  { title: 'Tổng đơn hàng', value: totalOrders.value, icon: 'i-lucide-shopping-bag', color: 'primary' as const },
  { title: 'Tổng chi tiêu', value: formatVND(totalSpent.value), icon: 'i-lucide-trending-up', color: 'success' as const },
  { title: 'Công nợ hiện tại', value: formatVND(currentDebt.value), icon: 'i-lucide-wallet', color: currentDebt.value > 0 ? 'error' as const : 'success' as const },
  { title: 'Giá trị TB/đơn', value: formatVND(avgOrderValue.value), icon: 'i-lucide-credit-card', color: 'info' as const },
])

function loadCustomer() {
  loading.value = true
  error.value = false
  setTimeout(() => {
    try {
      const profile = mockProfiles.find(p => p.id === customerId)
      if (!profile) { error.value = true; loading.value = false; return }
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
  }, 300)
}

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
    toast.add({ title: 'Vui lòng nhập tên và địa chỉ', color: 'error' })
    return
  }
  if (editingAddressId.value) {
    const idx = addresses.value.findIndex(a => a.id === editingAddressId.value)
    if (idx >= 0) {
      addresses.value[idx] = { ...addresses.value[idx], ...addressForm.value }
      toast.add({ title: 'Đã cập nhật địa chỉ', color: 'success' })
    }
  } else {
    addresses.value.unshift({
      id: `addr-${Date.now()}`,
      user_id: customerId,
      ...addressForm.value,
      created_at: new Date().toISOString(),
    })
    toast.add({ title: 'Đã thêm địa chỉ mới', color: 'success' })
  }
  showAddressModal.value = false
}

function deleteAddress(id: string) {
  addresses.value = addresses.value.filter(a => a.id !== id)
  toast.add({ title: 'Đã xoá địa chỉ', color: 'success' })
}

function openAddPrice() {
  priceForm.value = { product_id: '', price: 0 }
  showPriceModal.value = true
}

function savePrice() {
  if (!priceForm.value.product_id || priceForm.value.price <= 0) {
    toast.add({ title: 'Vui lòng chọn sản phẩm và nhập giá hợp lệ', color: 'error' })
    return
  }
  const existing = customPrices.value.findIndex(cp => cp.product_id === priceForm.value.product_id)
  const product = mockProducts.find(p => p.id === priceForm.value.product_id)
  if (existing >= 0) {
    customPrices.value[existing].price = priceForm.value.price
    toast.add({ title: 'Đã cập nhật giá riêng', color: 'success' })
  } else {
    customPrices.value.unshift({
      id: `cpr-${Date.now()}`,
      user_id: customerId,
      product_id: priceForm.value.product_id,
      price: priceForm.value.price,
      created_at: new Date().toISOString(),
      product: product || null,
    })
    toast.add({ title: 'Đã thiết lập giá riêng', color: 'success' })
  }
  showPriceModal.value = false
}

function deletePrice(id: string) {
  customPrices.value = customPrices.value.filter(cp => cp.id !== id)
  toast.add({ title: 'Đã xoá giá riêng', color: 'success' })
}

const availableProducts = computed(() =>
  mockProducts.filter(p => !p.deleted_at && p.status === ProductStatus.ACTIVE)
)

useSeoMeta({ title: () => `${customerName.value} - BunTech Admin` })
onMounted(loadCustomer)
</script>

<template>
  <div class="space-y-6">
    <UBreadcrumb
      :items="[
        { label: 'Admin', to: '/admin' },
        { label: 'Khách hàng', to: '/admin/customers' },
        { label: customerName },
      ]"
      class="mb-2"
    />

    <UButton
      variant="ghost"
      color="neutral"
      icon="i-lucide-arrow-left"
      class="mb-4"
      @click="navigateTo('/admin/customers')"
    >
      Quay lại
    </UButton>

    <BaseEmptyState v-if="error" icon="i-lucide-alert-circle" title="Lỗi tải dữ liệu" description="Không thể tải thông tin khách hàng.">
      <template #action>
        <UButton color="primary" @click="loadCustomer">Thử lại</UButton>
      </template>
    </BaseEmptyState>

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

    <template v-else-if="customer">
      <!-- Header card with gradient -->
      <UCard class="mb-6 animate-fade-in-up relative overflow-hidden">
        <div class="absolute -top-16 -right-16 w-56 h-56 bg-gradient-to-br from-primary-500/8 to-blue-500/8 dark:from-primary-400/8 dark:to-blue-400/8 rounded-full blur-3xl" aria-hidden="true" />
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 relative">
          <UAvatar :alt="customer.full_name" :src="customer.avatar_url" size="3xl" />
          <div class="min-w-0 flex-1">
            <h1 class="text-xl sm:text-2xl font-bold text-surface-foreground tracking-tight">{{ customer.full_name }}</h1>
            <div class="flex items-center gap-3 mt-1.5 flex-wrap">
              <span class="flex items-center gap-1.5 text-sm text-slate-500 dark:text-zinc-400">
                <span class="i-lucide-phone w-3.5 h-3.5" aria-hidden="true" /> {{ customer.phone || 'Chưa có SĐT' }}
              </span>
              <span class="text-slate-300 dark:text-zinc-600">·</span>
              <span class="text-xs font-mono text-slate-400 dark:text-zinc-500">#{{ customer.id }}</span>
            </div>
            <div class="flex items-center gap-2 mt-2.5 flex-wrap">
              <UBadge :color="customer.role === Role.DRIVER ? 'warning' : customer.role === Role.ADMIN ? 'error' : 'success'" variant="soft">
                {{ customer.role === Role.ADMIN ? 'Quản trị' : customer.role === Role.DRIVER ? 'Tài xế' : 'Khách hàng' }}
              </UBadge>
              <BaseStatusBadge type="user" :status="customer.status" />
            </div>
          </div>
          <div class="flex flex-col items-end gap-2 flex-shrink-0">
            <div class="text-right">
              <p class="text-xs text-slate-500 dark:text-zinc-400">Hạn mức công nợ</p>
              <p class="text-xl font-bold text-surface-foreground tabular-nums">{{ formatVND(debtLimit) }}</p>
            </div>
          </div>
        </div>
      </UCard>

      <BaseStatsGrid :stats="statCards" />

      <UTabs :items="tabs" v-model="activeTab" class="w-full mt-6" :ui="{ content: 'mt-6' }">
        <template #content="{ item }">
          <Transition name="fade" mode="out-in">
            <!-- ===== Orders Tab ===== -->
            <div v-if="item.value === 'orders'" key="orders" class="animate-fade-in-up">
              <BaseDataTable
                :columns="[
                  { accessorKey: 'id', header: 'Mã đơn' },
                  { accessorKey: 'status', header: 'Trạng thái' },
                  { accessorKey: 'total', header: 'Tổng tiền', class: 'text-right' },
                  { accessorKey: 'amount_collected', header: 'Đã thu', class: 'text-right' },
                  { accessorKey: 'created_at', header: 'Ngày đặt' },
                ]"
                :rows="orders"
                empty-title="Chưa có đơn hàng"
                empty-description="Khách hàng này chưa đặt đơn hàng nào"
              >
                <template #id-cell="{ row }">
                  <span class="font-mono text-xs text-primary-600 dark:text-primary-400 cursor-pointer hover:underline" @click="navigateTo(`/admin/orders/${row.id}`)">#{{ String(row.id).slice(-6) }}</span>
                </template>
                <template #status-cell="{ row }">
                  <BaseStatusBadge type="order" :status="row.status" />
                </template>
                <template #total-cell="{ row }">
                  <span class="font-medium text-surface-foreground tabular-nums">{{ formatVND(Number(row.total)) }}</span>
                </template>
                <template #amount_collected-cell="{ row }">
                  <span :class="['tabular-nums', Number(row.amount_collected) > 0 ? 'text-success-600 dark:text-success-400' : 'text-slate-400 dark:text-zinc-500']">
                    {{ formatVND(Number(row.amount_collected)) }}
                  </span>
                </template>
                <template #created_at-cell="{ row }">
                  <span class="text-slate-500 dark:text-zinc-400">{{ formatDate(row.created_at) }}</span>
                </template>
              </BaseDataTable>
            </div>

            <!-- ===== Debt Tab ===== -->
            <div v-else-if="item.value === 'debt'" key="debt" class="space-y-6 animate-fade-in-up">
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <UCard class="stagger-item">
                  <div class="flex items-center gap-2 mb-3">
                    <div class="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                      <span class="i-lucide-wallet w-4 h-4 text-red-600 dark:text-red-400" aria-hidden="true" />
                    </div>
                    <h2 class="text-sm font-semibold text-surface-foreground">Công nợ hiện tại</h2>
                  </div>
                  <p :class="['text-3xl font-bold tabular-nums', currentDebt > 0 ? 'text-red-600 dark:text-red-400' : 'text-success-600 dark:text-success-400']">
                    {{ formatVND(currentDebt) }}
                  </p>
                  <p class="text-xs text-slate-500 dark:text-zinc-400 mt-1">Từ {{ debtTransactions.length }} giao dịch</p>
                </UCard>

                <UCard class="stagger-item" style="animation-delay: 40ms">
                  <div class="flex items-center gap-2 mb-3">
                    <div class="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                      <span class="i-lucide-credit-card w-4 h-4 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                    </div>
                    <h2 class="text-sm font-semibold text-surface-foreground">Hạn mức công nợ</h2>
                  </div>
                  <p class="text-3xl font-bold text-surface-foreground tabular-nums">{{ formatVND(debtLimit) }}</p>
                  <div class="mt-3">
                    <div class="flex items-center justify-between text-xs mb-1.5">
                      <span class="text-slate-500 dark:text-zinc-400">Đã sử dụng</span>
                      <span class="font-medium text-surface-foreground tabular-nums">{{ debtUtilization }}%</span>
                    </div>
                    <div class="h-2 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                      <div
                        :class="['h-full rounded-full transition-all duration-500', debtUtilization > 80 ? 'bg-red-500' : debtUtilization > 50 ? 'bg-amber-500' : 'bg-emerald-500']"
                        :style="{ width: `${debtUtilization}%` }"
                      />
                    </div>
                    <p class="text-xs text-slate-400 dark:text-zinc-500 mt-1.5">Còn lại: {{ formatVND(debtRemaining) }}</p>
                  </div>
                </UCard>

                <UCard class="stagger-item" style="animation-delay: 80ms">
                  <div class="flex items-center gap-2 mb-3">
                    <div class="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                      <span class="i-lucide-trending-down w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    </div>
                    <h2 class="text-sm font-semibold text-surface-foreground">Tổng đã thanh toán</h2>
                  </div>
                  <p class="text-3xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {{ formatVND(paymentTransactions.reduce((s, tx) => s + tx.amount, 0)) }}
                  </p>
                  <p class="text-xs text-slate-500 dark:text-zinc-400 mt-1">{{ paymentTransactions.length }} lần thanh toán</p>
                </UCard>
              </div>

              <UCard class="stagger-item" style="animation-delay: 120ms">
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
                          ? 'bg-red-50 dark:bg-red-900/20'
                          : tx.type === TransactionType.DEBT_PAYMENT || tx.type === TransactionType.PAYMENT
                            ? 'bg-emerald-50 dark:bg-emerald-900/20'
                            : 'bg-blue-50 dark:bg-blue-900/20',
                      ]">
                        <span
                          :class="[
                            tx.type === TransactionType.DEBT_INCREASE ? 'i-lucide-trending-up' : 'i-lucide-trending-down',
                            'w-4 h-4',
                            tx.type === TransactionType.DEBT_INCREASE
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-emerald-600 dark:text-emerald-400',
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
                        tx.type === TransactionType.DEBT_INCREASE ? 'text-red-600 dark:text-red-400' : 'text-success-600 dark:text-success-400',
                      ]">
                        {{ tx.type === TransactionType.DEBT_INCREASE ? '+' : '-' }}{{ formatVND(tx.amount) }}
                      </span>
                    </div>
                  </div>
                </template>
                <BaseEmptyState v-else icon="i-lucide-file-text" title="Chưa có giao dịch" description="Lịch sử công nợ sẽ hiển thị tại đây" />
              </UCard>
            </div>

            <!-- ===== Addresses Tab ===== -->
            <div v-else-if="item.value === 'addresses'" key="addresses" class="animate-fade-in-up">
              <div class="flex justify-end mb-4">
                <UButton icon="i-lucide-plus" color="primary" @click="openAddAddress">
                  Thêm địa chỉ
                </UButton>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UCard
                  v-for="addr in addresses"
                  :key="addr.id"
                  class="stagger-item hover:-translate-y-1 transition-transform group"
                >
                  <div class="flex items-start gap-3 min-w-0">
                    <div class="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                      <span class="i-lucide-home w-4 h-4 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="font-medium text-surface-foreground">{{ addr.full_name }}</span>
                        <UBadge v-if="addr.is_default" color="primary" variant="soft" size="sm">Mặc định</UBadge>
                      </div>
                      <p class="text-sm text-slate-500 dark:text-zinc-400 tabular-nums">{{ addr.phone || 'Chưa có SĐT' }}</p>
                      <p class="text-sm text-slate-600 dark:text-zinc-300 mt-0.5">{{ addr.street }}, {{ addr.ward }}, {{ addr.district }}, {{ addr.city }}</p>
                    </div>
                    <div class="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <UButton icon="i-lucide-pencil" color="neutral" variant="ghost" size="sm" @click="openEditAddress(addr)" />
                      <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="sm" @click="deleteAddress(addr.id)" />
                    </div>
                  </div>
                </UCard>
                <UButton color="neutral" variant="outline" class="h-full min-h-[120px] border-dashed flex flex-col items-center justify-center gap-2" @click="openAddAddress">
                  <span class="i-lucide-plus text-xl"/>
                  <span>Thêm địa chỉ mới</span>
                </UButton>
              </div>
            </div>

            <!-- ===== Custom Prices Tab ===== -->
            <div v-else-if="item.value === 'prices'" key="prices" class="animate-fade-in-up">
              <div class="flex justify-end mb-4">
                <UButton icon="i-lucide-plus" color="primary" @click="openAddPrice">
                  Thiết lập giá riêng
                </UButton>
              </div>
              <BaseDataTable
                :columns="[
                  { accessorKey: 'product', header: 'Sản phẩm' },
                  { accessorKey: 'unit', header: 'Đơn vị' },
                  { accessorKey: 'default_price', header: 'Giá gốc' },
                  { accessorKey: 'price', header: 'Giá riêng' },
                  { accessorKey: 'discount', header: 'Chiết khấu' },
                  { accessorKey: 'actions', header: '' },
                ]"
                :rows="customPrices"
                empty-title="Chưa có giá riêng"
                empty-description="Thiết lập giá riêng cho khách hàng này"
              >
                <template #product-cell="{ row }">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg bg-surface-hover overflow-hidden flex-shrink-0 flex items-center justify-center">
                      <NuxtImg
                        v-if="row.product?.image_url"
                        :src="row.product.image_url"
                        :alt="row.product.name"
                        class="w-full h-full object-cover"
                      />
                      <span v-else class="i-lucide-tag w-4 h-4 text-slate-300 dark:text-zinc-600" aria-hidden="true" />
                    </div>
                    <span class="text-surface-foreground font-medium">{{ row.product?.name || 'Sản phẩm đã xoá' }}</span>
                  </div>
                </template>
                <template #unit-cell="{ row }">
                  <span class="text-slate-500 dark:text-zinc-400">{{ row.product?.unit || '—' }}</span>
                </template>
                <template #default_price-cell="{ row }">
                  <span class="text-slate-500 dark:text-zinc-400 tabular-nums line-through">{{ formatVND(Number(row.product?.price ?? 0)) }}</span>
                </template>
                <template #price-cell="{ row }">
                  <span class="font-semibold text-primary-600 dark:text-primary-400 tabular-nums">{{ formatVND(Number(row.price)) }}</span>
                </template>
                <template #discount-cell="{ row }">
                  <span v-if="row.product?.price" class="text-xs font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">
                    -{{ Math.round((1 - Number(row.price) / Number(row.product.price)) * 100) }}%
                  </span>
                  <span v-else class="text-slate-400">—</span>
                </template>
                <template #actions-cell="{ row }">
                  <div class="flex justify-end">
                    <UButton icon="i-lucide-trash-2" color="error" variant="ghost" @click.stop="deletePrice(row.id)" />
                  </div>
                </template>
              </BaseDataTable>
            </div>
          </Transition>
        </template>
      </UTabs>
    </template>
    
    <BaseEmptyState v-else title="Không tìm thấy khách hàng" description="Khách hàng không tồn tại hoặc đã bị xoá." icon="i-lucide-user-x" />

    <!-- Address Modal -->
    <UModal v-model:open="showAddressModal" :title="editingAddressId ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'">
      <template #body>
        <div class="space-y-4">
          <UFormField label="Họ và tên" required>
            <UInput v-model="addressForm.full_name" placeholder="Nguyễn Văn A" class="w-full" />
          </UFormField>
          <UFormField label="Số điện thoại">
            <UInput v-model="addressForm.phone" placeholder="0901 234 567" class="w-full" />
          </UFormField>
          <UFormField label="Số nhà, đường" required>
            <UInput v-model="addressForm.street" placeholder="123 Lê Lợi" class="w-full" />
          </UFormField>
          <div class="grid grid-cols-2 gap-3">
            <UFormField label="Phường/Xã">
              <UInput v-model="addressForm.ward" placeholder="Phường Bến Nghé" class="w-full" />
            </UFormField>
            <UFormField label="Quận/Huyện">
              <UInput v-model="addressForm.district" placeholder="Quận 1" class="w-full" />
            </UFormField>
          </div>
          <UFormField label="Thành phố">
            <UInput v-model="addressForm.city" placeholder="TP. Hồ Chí Minh" class="w-full" />
          </UFormField>
          <UFormField>
            <UCheckbox v-model="addressForm.is_default" label="Đặt làm địa chỉ mặc định" />
          </UFormField>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3 w-full">
          <UButton variant="ghost" color="neutral" @click="showAddressModal = false">Huỷ</UButton>
          <UButton color="primary" @click="saveAddress">{{ editingAddressId ? 'Cập nhật' : 'Thêm mới' }}</UButton>
        </div>
      </template>
    </UModal>

    <!-- Price Modal -->
    <UModal v-model:open="showPriceModal" title="Thiết lập giá riêng">
      <template #body>
        <div class="space-y-4">
          <UFormField label="Chọn sản phẩm" required>
            <USelectMenu
              v-model="priceForm.product_id"
              :options="availableProducts"
              value-attribute="id"
              option-attribute="name"
              placeholder="Chọn sản phẩm..."
              class="w-full"
            >
              <template #option="{ option }">
                {{ option.name }} — {{ formatVND(option.price) }}/{{ option.unit }}
              </template>
            </USelectMenu>
          </UFormField>
          <UFormField label="Giá riêng" required>
            <UInput v-model="priceForm.price" type="number" :min="0" class="w-full">
              <template #trailing>
                <span class="text-gray-500 dark:text-gray-400 text-sm">₫</span>
              </template>
            </UInput>
          </UFormField>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3 w-full">
          <UButton variant="ghost" color="neutral" @click="showPriceModal = false">Huỷ</UButton>
          <UButton color="primary" @click="savePrice">Lưu giá</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
