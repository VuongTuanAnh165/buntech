<script setup lang="ts">
import {
  mockProfiles,
  mockOrders,
  mockTransactions,
  mockAddresses,
  mockCustomPrices,
  mockProducts
} from '~/utils/mockData'
import type { Profile, Order, Transaction, Address, CustomPrice, Product } from '~/utils/types'
import { ConstantKey } from '~/enums/constantKeys'
const { constants } = useMasterData()

const route = useRoute()
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
const addressForm = ref({
  full_name: '',
  phone: '',
  street: '',
  ward: '',
  district: '',
  city: '',
  is_default: false
})

const showPriceModal = ref(false)
const priceForm = ref({ product_id: '', price: 0 })

// Computed
const customerName = computed(() => customer.value?.full_name || '—')

const currentDebt = computed(() => {
  let debt = 0
  for (const tx of transactions.value) {
    if (tx.type === constants.value?.[ConstantKey.TransactionType]?.DEBT_INCREASE) debt += tx.amount
    if (tx.type === constants.value?.[ConstantKey.TransactionType]?.DEBT_PAYMENT) debt -= tx.amount
  }
  return debt
})

const debtLimit = computed(() => Number(customer.value?.debt_limit ?? 0))
const _debtRemaining = computed(() => Math.max(0, debtLimit.value - currentDebt.value))
const _debtUtilization = computed(() =>
  debtLimit.value > 0 ? Math.min(100, Math.round((currentDebt.value / debtLimit.value) * 100)) : 0
)

const totalOrders = computed(() => orders.value.length)
const totalSpent = computed(() => orders.value.reduce((s, o) => s + o.total, 0))
const avgOrderValue = computed(() =>
  totalOrders.value > 0 ? Math.round(totalSpent.value / totalOrders.value) : 0
)

const debtTransactions = computed(() =>
  transactions.value.filter(
    (tx) =>
      tx.type === constants.value?.[ConstantKey.TransactionType]?.DEBT_INCREASE ||
      tx.type === constants.value?.[ConstantKey.TransactionType]?.DEBT_PAYMENT
  )
)

const _paymentTransactions = computed(() =>
  transactions.value.filter(
    (tx) => tx.type === constants.value?.[ConstantKey.TransactionType]?.PAYMENT
  )
)

const tabs = computed(() => [
  {
    value: 'orders',
    label: 'Lịch sử đơn hàng',
    icon: 'i-lucide-shopping-bag',
    count: orders.value.length
  },
  {
    value: 'debt',
    label: 'Công nợ',
    icon: 'i-lucide-wallet',
    count: debtTransactions.value.length
  },
  {
    value: 'addresses',
    label: 'Sổ địa chỉ',
    icon: 'i-lucide-map-pin',
    count: addresses.value.length
  },
  {
    value: 'prices',
    label: 'Bảng giá riêng',
    icon: 'i-lucide-tag',
    count: customPrices.value.length
  }
])

const statCards = computed(() => [
  {
    title: 'Tổng đơn hàng',
    value: totalOrders.value,
    icon: 'i-lucide-shopping-bag',
    color: 'primary' as const
  },
  {
    title: 'Tổng chi tiêu',
    value: formatVND(totalSpent.value),
    icon: 'i-lucide-trending-up',
    color: 'success' as const
  },
  {
    title: 'Công nợ hiện tại',
    value: formatVND(currentDebt.value),
    icon: 'i-lucide-wallet',
    color: currentDebt.value > 0 ? ('error' as const) : ('success' as const)
  },
  {
    title: 'Giá trị TB/đơn',
    value: formatVND(avgOrderValue.value),
    icon: 'i-lucide-credit-card',
    color: 'info' as const
  }
])

function loadCustomer() {
  loading.value = true
  error.value = false
  setTimeout(() => {
    try {
      const profile = mockProfiles.find((p) => p.id === customerId)
      if (!profile) {
        error.value = true
        loading.value = false
        return
      }
      customer.value = profile

      orders.value = mockOrders
        .filter((o) => o.user_id === customerId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      transactions.value = mockTransactions
        .filter((tx) => tx.user_id === customerId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      addresses.value = mockAddresses
        .filter((a) => a.user_id === customerId)
        .sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0))

      const cps = mockCustomPrices.filter((cp) => cp.user_id === customerId)
      customPrices.value = cps
        .map((cp) => {
          const product = mockProducts.find((p) => p.id === cp.product_id) || null
          return { ...cp, product }
        })
        .sort((a, b) => b.price - a.price)
    } catch {
      error.value = true
    } finally {
      loading.value = false
    }
  }, 300)
}

function openAddAddress() {
  editingAddressId.value = null
  addressForm.value = {
    full_name: '',
    phone: '',
    street: '',
    ward: '',
    district: '',
    city: '',
    is_default: false
  }
  showAddressModal.value = true
}

function openEditAddress(addr: Address) {
  editingAddressId.value = addr.id
  addressForm.value = {
    full_name: addr.full_name,
    phone: addr.phone || '',
    street: addr.street,
    ward: addr.ward,
    district: addr.district,
    city: addr.city,
    is_default: addr.is_default
  }
  showAddressModal.value = true
}

function saveAddress() {
  if (!addressForm.value.full_name || !addressForm.value.street) {
    toast.add({ title: 'Vui lòng nhập tên và địa chỉ', color: 'error' })
    return
  }
  if (editingAddressId.value) {
    const idx = addresses.value.findIndex((a) => a.id === editingAddressId.value)
    if (idx >= 0) {
      addresses.value[idx] = { ...addresses.value[idx], ...addressForm.value } as Address
      toast.add({ title: 'Đã cập nhật địa chỉ', color: 'success' })
    }
  } else {
    addresses.value.unshift({
      id: `addr-${Date.now()}`,
      user_id: customerId,
      ...addressForm.value,
      created_at: new Date().toISOString()
    })
    toast.add({ title: 'Đã thêm địa chỉ mới', color: 'success' })
  }
  showAddressModal.value = false
}

function deleteAddress(id: string) {
  addresses.value = addresses.value.filter((a) => a.id !== id)
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
  const existing = customPrices.value.findIndex(
    (cp) => cp.product_id === priceForm.value.product_id
  )
  const product = mockProducts.find((p) => p.id === priceForm.value.product_id)
  if (existing >= 0) {
    const cp = customPrices.value[existing]
    if (cp) cp.price = priceForm.value.price
    toast.add({ title: 'Đã cập nhật giá riêng', color: 'success' })
  } else {
    customPrices.value.unshift({
      id: `cpr-${Date.now()}`,
      user_id: customerId,
      product_id: priceForm.value.product_id,
      price: priceForm.value.price,
      created_at: new Date().toISOString(),
      product: product || null
    })
    toast.add({ title: 'Đã thiết lập giá riêng', color: 'success' })
  }
  showPriceModal.value = false
}

function deletePrice(id: string) {
  customPrices.value = customPrices.value.filter((cp) => cp.id !== id)
  toast.add({ title: 'Đã xoá giá riêng', color: 'success' })
}

const availableProducts = computed(() =>
  mockProducts.filter(
    (p) => !p.deleted_at && p.status === constants.value?.[ConstantKey.ProductStatus]?.ACTIVE
  )
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
        { label: customerName }
      ]"
      class="mb-2"
    />

    <UButton
      variant="ghost"
      color="neutral"
      icon="i-lucide-arrow-left"
      class="mb-4"
      @click="
        () => {
          navigateTo('/admin/customers')
        }
      "
    >
      Quay lại
    </UButton>

    <BaseEmptyState
      v-if="error"
      icon="i-lucide-alert-circle"
      title="Lỗi tải dữ liệu"
      description="Không thể tải thông tin khách hàng."
    >
      <template #action>
        <UButton color="primary" @click="loadCustomer">Thử lại</UButton>
      </template>
    </BaseEmptyState>

    <template v-else-if="loading">
      <div class="space-y-4">
        <div class="card animate-fade-in-up p-6">
          <div class="flex items-center gap-4">
            <div class="skeleton h-16 w-16 rounded-full" />
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
        <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div v-for="i in 4" :key="i" class="card p-4"><div class="skeleton h-16 w-full" /></div>
        </div>
        <div class="card animate-fade-in-up p-6" style="animation-delay: 50ms">
          <div class="skeleton h-64 w-full" />
        </div>
      </div>
    </template>

    <template v-else-if="customer">
      <!-- Header card with gradient -->
      <UCard class="animate-fade-in-up relative mb-6 overflow-hidden">
        <div
          class="from-primary-500/8 dark:from-primary-400/8 absolute -top-16 -right-16 h-56 w-56 rounded-full bg-gradient-to-br to-blue-500/8 blur-3xl dark:to-blue-400/8"
          aria-hidden="true"
        />
        <div class="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <UAvatar :alt="customer.full_name" :src="customer.avatar_url || undefined" size="3xl" />
          <div class="min-w-0 flex-1">
            <h1 class="text-surface-foreground text-xl font-bold tracking-tight sm:text-2xl">
              {{ customer.full_name }}
            </h1>
            <div class="mt-1.5 flex flex-wrap items-center gap-3">
              <span class="flex items-center gap-1.5 text-sm text-slate-500 dark:text-zinc-400">
                <span class="i-lucide-phone h-3.5 w-3.5" aria-hidden="true" />
                {{ customer.phone || 'Chưa có SĐT' }}
              </span>
              <span class="text-slate-300 dark:text-zinc-600">·</span>
              <span class="font-mono text-xs text-slate-400 dark:text-zinc-500"
                >#{{ customer.id }}</span
              >
            </div>
            <div class="mt-2.5 flex flex-wrap items-center gap-2">
              <UBadge
                :color="
                  customer.role === constants?.[ConstantKey.Role]?.DRIVER
                    ? 'warning'
                    : customer.role === constants?.[ConstantKey.Role]?.ADMIN
                      ? 'error'
                      : 'success'
                "
                variant="soft"
              >
                {{
                  customer.role === constants?.[ConstantKey.Role]?.ADMIN
                    ? 'Quản trị viên'
                    : customer.role === constants?.[ConstantKey.Role]?.DRIVER
                      ? 'Tài xế'
                      : 'Khách hàng'
                }}
              </UBadge>
              <BaseStatusBadge type="user" :status="customer.status" />
            </div>
          </div>
          <div class="flex flex-shrink-0 flex-col items-end gap-2">
            <div class="text-right">
              <p class="text-xs text-slate-500 dark:text-zinc-400">Hạn mức công nợ</p>
              <p class="text-surface-foreground text-xl font-bold tabular-nums">
                {{ formatVND(debtLimit) }}
              </p>
            </div>
          </div>
        </div>
      </UCard>

      <BaseStatsGrid :stats="statCards" />

      <UTabs v-model="activeTab" :items="tabs" class="mt-6 w-full" :ui="{ content: 'mt-6' }">
        <template #content="{ item }">
          <Transition name="fade" mode="out-in">
            <!-- ===== Orders Tab ===== -->
            <AdminCustomerOrdersTab v-if="item.value === 'orders'" :orders="orders" />
            <!-- ===== Debt Tab ===== -->
            <AdminCustomerDebtTab
              v-else-if="item.value === 'debt'"
              :transactions="transactions"
              :debt-limit="debtLimit"
            />
            <!-- ===== Addresses Tab ===== -->
            <div v-else-if="item.value === 'addresses'" key="addresses" class="animate-fade-in-up">
              <div class="mb-4 flex justify-end">
                <UButton icon="i-lucide-plus" color="primary" @click="openAddAddress">
                  Thêm địa chỉ
                </UButton>
              </div>
              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <UCard
                  v-for="addr in addresses"
                  :key="addr.id"
                  class="stagger-item group transition-transform hover:-translate-y-1"
                >
                  <div class="flex min-w-0 items-start gap-3">
                    <div
                      class="bg-primary-50 dark:bg-primary-900/20 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                    >
                      <span
                        class="i-lucide-home text-primary-600 dark:text-primary-400 h-4 w-4"
                        aria-hidden="true"
                      />
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="mb-1 flex items-center gap-2">
                        <span class="text-surface-foreground font-medium">{{
                          addr.full_name
                        }}</span>
                        <UBadge v-if="addr.is_default" color="primary" variant="soft" size="sm"
                          >Mặc định</UBadge
                        >
                      </div>
                      <p class="text-sm text-slate-500 tabular-nums dark:text-zinc-400">
                        {{ addr.phone || 'Chưa có SĐT' }}
                      </p>
                      <p class="mt-0.5 text-sm text-slate-600 dark:text-zinc-300">
                        {{ addr.street }}, {{ addr.ward }}, {{ addr.district }}, {{ addr.city }}
                      </p>
                    </div>
                    <div
                      class="flex flex-shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <UButton
                        icon="i-lucide-pencil"
                        color="neutral"
                        variant="ghost"
                        size="sm"
                        @click="openEditAddress(addr)"
                      />
                      <UButton
                        icon="i-lucide-trash-2"
                        color="error"
                        variant="ghost"
                        size="sm"
                        @click="deleteAddress(addr.id)"
                      />
                    </div>
                  </div>
                </UCard>
                <UButton
                  color="neutral"
                  variant="outline"
                  class="flex h-full min-h-[120px] flex-col items-center justify-center gap-2 border-dashed"
                  @click="openAddAddress"
                >
                  <span class="i-lucide-plus text-xl" />
                  <span>Thêm địa chỉ mới</span>
                </UButton>
              </div>
            </div>

            <!-- ===== Custom Prices Tab ===== -->
            <div v-else-if="item.value === 'prices'" key="prices" class="animate-fade-in-up">
              <div class="mb-4 flex justify-end">
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
                  { accessorKey: 'actions', header: '' }
                ]"
                :rows="customPrices"
                empty-title="Chưa có giá riêng"
                empty-description="Thiết lập giá riêng cho khách hàng này"
              >
                <template #product-cell="{ row }">
                  <div class="flex items-center gap-2.5">
                    <div
                      class="bg-surface-hover flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg"
                    >
                      <NuxtImg
                        v-if="row.product?.image_url"
                        :src="row.product.image_url"
                        :alt="row.product.name"
                        class="h-full w-full object-cover"
                      />
                      <span
                        v-else
                        class="i-lucide-tag h-4 w-4 text-slate-300 dark:text-zinc-600"
                        aria-hidden="true"
                      />
                    </div>
                    <span class="text-surface-foreground font-medium">{{
                      row.product?.name || 'Sản phẩm đã xoá'
                    }}</span>
                  </div>
                </template>
                <template #unit-cell="{ row }">
                  <span class="text-slate-500 dark:text-zinc-400">{{
                    row.product?.unit || '—'
                  }}</span>
                </template>
                <template #default_price-cell="{ row }">
                  <span class="text-slate-500 tabular-nums line-through dark:text-zinc-400">{{
                    formatVND(Number(row.product?.price ?? 0))
                  }}</span>
                </template>
                <template #price-cell="{ row }">
                  <span class="text-primary-600 dark:text-primary-400 font-semibold tabular-nums">{{
                    formatVND(Number(row.price))
                  }}</span>
                </template>
                <template #discount-cell="{ row }">
                  <span
                    v-if="row.product?.price"
                    class="text-xs font-medium text-emerald-600 tabular-nums dark:text-emerald-400"
                  >
                    -{{ Math.round((1 - Number(row.price) / Number(row.product.price)) * 100) }}%
                  </span>
                  <span v-else class="text-slate-400">—</span>
                </template>
                <template #actions-cell="{ row }">
                  <div class="flex justify-end">
                    <UButton
                      icon="i-lucide-trash-2"
                      color="error"
                      variant="ghost"
                      @click.stop="deletePrice(row.id)"
                    />
                  </div>
                </template>
              </BaseDataTable>
            </div>
          </Transition>
        </template>
      </UTabs>
    </template>

    <BaseEmptyState
      v-else
      title="Không tìm thấy khách hàng"
      description="Khách hàng không tồn tại hoặc đã bị xoá."
      icon="i-lucide-user-x"
    />

    <!-- Address Modal -->
    <UModal
      v-model:open="showAddressModal"
      :title="editingAddressId ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'"
    >
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
        <div class="flex w-full justify-end gap-3">
          <UButton
            variant="ghost"
            color="neutral"
            @click="
              () => {
                showAddressModal = false
              }
            "
            >Huỷ</UButton
          >
          <UButton color="primary" @click="saveAddress">{{
            editingAddressId ? 'Cập nhật' : 'Thêm mới'
          }}</UButton>
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
              <template #item="{ item }">
                {{ (item as any).name }} — {{ formatVND((item as any).price) }}/{{
                  (item as any).unit
                }}
              </template>
            </USelectMenu>
          </UFormField>
          <UFormField label="Giá riêng" required>
            <UInput v-model="priceForm.price" type="number" :min="0" class="w-full">
              <template #trailing>
                <span class="text-sm text-gray-500 dark:text-gray-400">₫</span>
              </template>
            </UInput>
          </UFormField>
        </div>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-3">
          <UButton
            variant="ghost"
            color="neutral"
            @click="
              () => {
                showPriceModal = false
              }
            "
            >Huỷ</UButton
          >
          <UButton color="primary" @click="savePrice">Lưu giá</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
