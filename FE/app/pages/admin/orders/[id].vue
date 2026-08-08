<script setup lang="ts">
import { mockOrders, mockProfiles, mockOrderItems } from '~/utils/mockData'
import { OrderStatus, Role, UserStatus } from '~/utils/enums'
import type { Order, OrderItem, Profile } from '~/utils/types'
import { ORDER_STATUS_COLORS, ORDER_STATUS_ICONS, ORDER_STATUS_LABELS, ORDER_STATUS_FLOW } from '~/utils/orderStatus'

const toast = useToast()
const route = useRoute()
const router = useRouter()
const { formatVND, formatDateTime } = useFormat()

definePageMeta({ layout: 'admin' })

const orderId = route.params.id as string

// State
const loading = ref(true)
const error = ref(false)
const order = ref<Order | null>(null)
const items = ref<OrderItem[]>([])
const showStatusMenu = ref(false)
const changingStatus = ref(false)
const showAssignDriver = ref(false)
const selectedDriverId = ref('')

const statusFlow = ORDER_STATUS_FLOW
const currentStatusIndex = computed(() => {
  if (!order.value) return -1
  if (order.value.status === OrderStatus.CANCELLED) return -2
  return statusFlow.indexOf(order.value.status as OrderStatus)
})
const isCancelled = computed(() => order.value?.status === OrderStatus.CANCELLED)

const total = computed(() => Number(order.value?.total ?? 0))
const amountCollected = computed(() => Number(order.value?.amount_collected ?? 0))
const remaining = computed(() => Math.max(0, total.value - amountCollected.value))

const paymentState = computed(() => {
  if (amountCollected.value >= total.value && total.value > 0) return { label: 'Đã thanh toán đủ', color: 'success' as const }
  if (amountCollected.value > 0) return { label: 'Thanh toán một phần', color: 'warning' as const }
  return { label: 'Chưa thanh toán', color: 'error' as const }
})

const customer = computed(() => order.value?.user as Profile | null | undefined)
const customerName = computed(() => customer.value?.full_name || order.value?.guest_info?.name || 'Khách lẻ')
const customerPhone = computed(() => customer.value?.phone || order.value?.guest_info?.phone || '—')
const shippingAddress = computed(() => order.value?.shipping_address || order.value?.guest_info?.address || '—')
const driver = computed(() => order.value?.driver as Profile | null | undefined)
const driverName = computed(() => driver.value?.full_name)
const orderNotes = computed(() => order.value?.note || 'Không có ghi chú cho đơn hàng này.')

const availableDrivers = computed(() => mockProfiles.filter(p => p.role === Role.DRIVER && p.status === UserStatus.ACTIVE))
const statusOptions = computed(() => Object.values(OrderStatus).filter(s => s !== order.value?.status))

// History
const orderHistory = ref<{ status: string; at: string; note: string }[]>([])
function buildHistory() {
  if (!order.value) return
  const created = order.value.created_at
  const base: { status: string; at: string; note: string }[] = [
    { status: OrderStatus.PENDING, at: created, note: 'Đơn hàng được tạo' },
  ]
  if (order.value.status !== OrderStatus.PENDING && order.value.status !== OrderStatus.CANCELLED) {
    base.push({ status: OrderStatus.PROCESSING, at: addHours(created, 2), note: 'Bắt đầu chuẩn bị hàng' })
  }
  if ([OrderStatus.SHIPPING, OrderStatus.DELIVERED].includes(order.value.status as OrderStatus)) {
    base.push({ status: OrderStatus.SHIPPING, at: addHours(created, 4), note: 'Đã giao cho tài xế' })
  }
  if (order.value.status === OrderStatus.DELIVERED) {
    base.push({ status: OrderStatus.DELIVERED, at: addHours(created, 8), note: 'Khách đã nhận hàng' })
  }
  if (order.value.status === OrderStatus.CANCELLED) {
    base.push({ status: OrderStatus.CANCELLED, at: addHours(created, 1), note: 'Đơn hàng bị hủy' })
  }
  orderHistory.value = base
}

function addHours(iso: string, h: number): string {
  const d = new Date(iso)
  d.setHours(d.getHours() + h)
  return d.toISOString()
}

const deliveryTimeline = computed(() => {
  if (isCancelled.value) {
    return [{ label: 'Đã hủy', desc: 'Đơn hàng bị hủy', done: true }]
  }
  return [
    { label: 'Tiếp nhận', desc: 'Đã ghi nhận đơn', done: currentStatusIndex.value >= 0 },
    { label: 'Chuẩn bị', desc: 'Đóng gói sản phẩm', done: currentStatusIndex.value >= 1 },
    { label: 'Vận chuyển', desc: 'Đang trên đường giao', done: currentStatusIndex.value >= 2 },
    { label: 'Giao thành công', desc: 'Khách đã nhận', done: currentStatusIndex.value >= 3 },
  ]
})

// Load
function loadOrder() {
  loading.value = true
  error.value = false
  try {
    const found = mockOrders.find(o => o.id === orderId)
    if (!found) { error.value = true; return }
    order.value = { ...found } as Order
    items.value = found.order_items || mockOrderItems.filter(i => i.order_id === orderId)
    buildHistory()
  } catch {
    error.value = true
  } finally {
    setTimeout(() => { loading.value = false }, 300)
  }
}

// Actions
function changeStatus(newStatus: string) {
  if (!order.value) return
  showStatusMenu.value = false
  changingStatus.value = true
  order.value.status = newStatus as OrderStatus
  setTimeout(() => {
    toast.add({ title: `Đã cập nhật trạng thái: ${ORDER_STATUS_LABELS[newStatus]}`, color: 'success' })
    buildHistory()
    changingStatus.value = false
  }, 500)
}

function assignDriver() {
  if (!selectedDriverId.value || !order.value) return
  const drv = availableDrivers.value.find(d => d.id === selectedDriverId.value)
  if (drv) {
    order.value.driver = drv
    order.value.driver_id = drv.id
    toast.add({ title: `Đã gán tài xế: ${drv.full_name}`, color: 'success' })
  }
  showAssignDriver.value = false
  selectedDriverId.value = ''
}

function copyOrder() {
  if (!order.value) return
  const copyData = {
    user_id: order.value.user_id,
    items: items.value.map(i => ({ product_id: i.product_id, product_name: i.product_name, quantity: i.quantity, price: i.price })),
  }
  if (import.meta.client) {
    sessionStorage.setItem('copyOrderData', JSON.stringify(copyData))
  }
  toast.add({ title: 'Đã sao chép đơn hàng', color: 'success' })
  router.push('/admin/orders/create')
}

function printOrder() {
  if (import.meta.client) window.print()
}

useSeoMeta({ title: () => `Đơn hàng #${String(orderId).slice(0, 8)} - BunTech Admin` })
onMounted(loadOrder)

const breadcrumbItems = [
  { label: 'Admin', to: '/admin' },
  { label: 'Đơn hàng', to: '/admin/orders' },
  { label: `#${String(orderId).slice(0, 8)}` },
]
</script>

<template>
  <div>
    <UBreadcrumb :items="breadcrumbItems" class="mb-4" />

    <button
      class="flex items-center gap-1 text-sm text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 mb-4 min-h-[44px] px-2 transition-colors"
      @click="router.push('/admin/orders')"
    >
      <UIcon name="i-lucide-arrow-left" class="w-4 h-4" /> Quay lại
    </button>

    <BaseEmptyState v-if="error" title="Lỗi tải dữ liệu" description="Không thể tải thông tin đơn hàng." @retry="loadOrder" />

    <template v-else-if="loading">
      <div class="space-y-4">
        <div class="skeleton h-32 w-full rounded-2xl" />
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-6">
            <div class="skeleton h-72 w-full rounded-2xl" />
            <div class="skeleton h-40 w-full rounded-2xl" />
          </div>
          <div class="space-y-6">
            <div class="skeleton h-48 w-full rounded-2xl" />
            <div class="skeleton h-48 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="order">
      <!-- Order header card -->
      <div class="card p-6 mb-6 animate-fade-in-up relative overflow-hidden">
        <div class="absolute -top-12 -right-12 w-48 h-48 bg-primary-500/5 dark:bg-primary-400/5 rounded-full blur-2xl pointer-events-none" />
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-2 flex-wrap">
              <span class="text-sm font-mono text-slate-500 dark:text-zinc-400">#{{ String(orderId).slice(0, 8) }}</span>
              <UBadge :color="ORDER_STATUS_COLORS[order.status]" variant="subtle">
                {{ ORDER_STATUS_LABELS[order.status] }}
              </UBadge>
            </div>
            <h1 class="text-2xl font-bold text-surface-foreground tracking-tight mb-1">
              Đơn hàng #{{ String(orderId).slice(-6) }}
            </h1>
            <div class="flex items-center gap-4 text-sm text-slate-500 dark:text-zinc-400 flex-wrap">
              <span class="flex items-center gap-1.5"><UIcon name="i-lucide-clock" class="w-4 h-4" /> {{ formatDateTime(order.created_at) }}</span>
              <span class="flex items-center gap-1.5"><UIcon name="i-lucide-shopping-bag" class="w-4 h-4" /> {{ items.length }} sản phẩm</span>
            </div>
          </div>

          <div class="flex flex-col items-start lg:items-end gap-3">
            <div class="lg:text-right">
              <p class="text-xs text-slate-500 dark:text-zinc-400">Tổng tiền</p>
              <p class="text-3xl font-bold text-primary-600 dark:text-primary-400 tabular-nums">{{ formatVND(total) }}</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <UButton size="sm" variant="outline" color="neutral" @click="copyOrder">
                <UIcon name="i-lucide-copy" class="w-4 h-4" /> Sao chép
              </UButton>
              <UButton size="sm" variant="outline" color="neutral" @click="printOrder">
                <UIcon name="i-lucide-printer" class="w-4 h-4" /> In
              </UButton>
              <div class="relative">
                <UButton size="sm" :loading="changingStatus" @click="showStatusMenu = !showStatusMenu">
                  <UIcon name="i-lucide-refresh-cw" class="w-4 h-4" /> Đổi trạng thái
                  <UIcon name="i-lucide-chevron-right" class="w-3.5 h-3.5 transition-transform" :class="showStatusMenu ? 'rotate-90' : ''" />
                </UButton>
                <Transition name="fade">
                  <div v-if="showStatusMenu" class="absolute right-0 top-full mt-2 z-20 w-48 card p-1.5 shadow-lg">
                    <button
                      v-for="s in statusOptions"
                      :key="s"
                      class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-surface-foreground hover:bg-surface-hover transition-colors min-h-[40px]"
                      @click="changeStatus(s as string)"
                    >
                      <UIcon :name="ORDER_STATUS_ICONS[s]" class="w-4 h-4" />
                      {{ ORDER_STATUS_LABELS[s] }}
                    </button>
                  </div>
                </Transition>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3-column layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left (main) -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Order items -->
          <div class="card p-5 animate-fade-in-up" style="animation-delay: 40ms">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                <UIcon name="i-lucide-shopping-bag" class="w-4 h-4 text-primary-600 dark:text-primary-400" />
              </div>
              <h2 class="text-sm font-semibold text-surface-foreground">Sản phẩm trong đơn</h2>
            </div>

            <template v-if="items.length">
              <div class="hidden sm:grid grid-cols-12 gap-3 px-3 pb-2 mb-1 border-b border-surface-border text-xs font-medium text-slate-500 dark:text-zinc-400">
                <div class="col-span-6">Tên sản phẩm</div>
                <div class="col-span-2 text-right">Đơn giá</div>
                <div class="col-span-2 text-right">Số lượng</div>
                <div class="col-span-2 text-right">Thành tiền</div>
              </div>

              <div
                v-for="item in items"
                :key="item.id"
                class="grid grid-cols-12 gap-3 items-center px-3 py-3 rounded-lg hover:bg-surface-hover transition-colors"
              >
                <div class="col-span-12 sm:col-span-6 flex items-center gap-3">
                  <div class="w-11 h-11 rounded-lg bg-surface-hover overflow-hidden flex-shrink-0 flex items-center justify-center ring-1 ring-surface-border">
                    <NuxtImg
                      v-if="item.product?.image_url"
                      :src="item.product.image_url"
                      :alt="item.product?.name || item.product_name"
                      class="w-full h-full object-cover"
                    />
                    <UIcon v-else name="i-lucide-package" class="w-5 h-5 text-slate-300 dark:text-zinc-600" />
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-surface-foreground truncate">{{ item.product?.name || item.product_name }}</p>
                    <p class="text-xs text-slate-500 dark:text-zinc-400 sm:hidden">{{ formatVND(Number(item.price)) }} × {{ item.quantity }}</p>
                  </div>
                </div>
                <div class="hidden sm:block col-span-2 text-right text-sm text-slate-600 dark:text-zinc-300 tabular-nums">{{ formatVND(Number(item.price)) }}</div>
                <div class="hidden sm:block col-span-2 text-right">
                  <UBadge color="neutral" variant="soft">× {{ item.quantity }}</UBadge>
                </div>
                <div class="col-span-12 sm:col-span-2 text-right text-sm font-semibold text-surface-foreground tabular-nums">
                  {{ formatVND(Number(item.quantity) * Number(item.price)) }}
                </div>
              </div>

              <div class="mt-3 pt-3 border-t border-surface-border flex items-center justify-between">
                <span class="text-sm font-semibold text-surface-foreground">Tổng cộng</span>
                <span class="text-xl font-bold text-primary-600 dark:text-primary-400 tabular-nums">{{ formatVND(total) }}</span>
              </div>
            </template>
            <BaseEmptyState v-else title="Không có sản phẩm" description="Đơn hàng này chưa có sản phẩm nào" />
          </div>

          <!-- Order notes -->
          <div class="card p-5 animate-fade-in-up" style="animation-delay: 80ms">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-7 h-7 rounded-lg bg-warning-50 dark:bg-warning-900/20 flex items-center justify-center">
                <UIcon name="i-lucide-sticky-note" class="w-4 h-4 text-warning-600 dark:text-warning-400" />
              </div>
              <h2 class="text-sm font-semibold text-surface-foreground">Ghi chú đơn hàng</h2>
            </div>
            <div class="bg-surface-hover rounded-lg p-4">
              <p class="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">{{ orderNotes }}</p>
            </div>
          </div>

          <!-- Status timeline -->
          <div class="card p-5 animate-fade-in-up" style="animation-delay: 120ms">
            <div class="flex items-center gap-2 mb-5">
              <div class="w-7 h-7 rounded-lg bg-info-50 dark:bg-info-900/20 flex items-center justify-center">
                <UIcon name="i-lucide-truck" class="w-4 h-4 text-info-600 dark:text-info-400" />
              </div>
              <h2 class="text-sm font-semibold text-surface-foreground">Tiến trình đơn hàng</h2>
            </div>

            <div v-if="!isCancelled" class="flex items-center justify-between relative mb-2">
              <div class="absolute top-5 left-5 right-5 h-0.5 bg-surface-border" />
              <div
                class="absolute top-5 left-5 h-0.5 bg-gradient-to-r from-primary-500 to-success-500 transition-all duration-700"
                :style="{ width: `calc((100% - 2.5rem) * ${currentStatusIndex >= 0 ? currentStatusIndex / (statusFlow.length - 1) : 0})` }"
              />
              <div
                v-for="(step, i) in deliveryTimeline"
                :key="step.label"
                class="relative flex flex-col items-center gap-2 z-10 flex-1"
              >
                <div :class="[
                  'w-10 h-10 rounded-full flex items-center justify-center ring-4 ring-surface transition-all',
                  step.done ? 'bg-success-500 text-white' : 'bg-surface-hover text-slate-400 dark:text-zinc-500',
                ]">
                  <UIcon :name="ORDER_STATUS_ICONS[statusFlow[i]]" class="w-5 h-5" />
                </div>
                <div class="text-center">
                  <p :class="['text-xs font-medium', step.done ? 'text-surface-foreground' : 'text-slate-400 dark:text-zinc-500']">{{ step.label }}</p>
                  <p class="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5 hidden sm:block">{{ step.desc }}</p>
                </div>
              </div>
            </div>

            <div v-else class="flex items-center gap-3 p-4 rounded-lg bg-error-50 dark:bg-error-900/20">
              <div class="w-10 h-10 rounded-full bg-error-500 text-white flex items-center justify-center flex-shrink-0">
                <UIcon name="i-lucide-x-circle" class="w-5 h-5" />
              </div>
              <div>
                <p class="text-sm font-semibold text-error-700 dark:text-error-300">Đơn hàng đã bị hủy</p>
                <p class="text-xs text-error-600 dark:text-error-400">Quy trình giao hàng đã dừng lại</p>
              </div>
            </div>
          </div>

          <!-- Order history -->
          <div class="card p-5 animate-fade-in-up" style="animation-delay: 160ms">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-7 h-7 rounded-lg bg-secondary-50 dark:bg-secondary-900/20 flex items-center justify-center">
                <UIcon name="i-lucide-history" class="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
              </div>
              <h2 class="text-sm font-semibold text-surface-foreground">Lịch sử thay đổi</h2>
            </div>
            <ol class="relative space-y-0">
              <li v-for="(h, i) in orderHistory" :key="i" class="flex gap-4 pb-4 last:pb-0 relative">
                <div v-if="i < orderHistory.length - 1" class="absolute left-[15px] top-8 bottom-0 w-px bg-surface-border" />
                <div :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ring-4 ring-surface',
                  h.status === OrderStatus.CANCELLED ? 'bg-error-50 dark:bg-error-900/20' :
                  h.status === OrderStatus.DELIVERED ? 'bg-success-50 dark:bg-success-900/20' : 'bg-primary-50 dark:bg-primary-900/20',
                ]">
                  <UIcon :name="ORDER_STATUS_ICONS[h.status]" :class="[
                    'w-4 h-4',
                    h.status === OrderStatus.CANCELLED ? 'text-error-600 dark:text-error-400' :
                    h.status === OrderStatus.DELIVERED ? 'text-success-600 dark:text-success-400' : 'text-primary-600 dark:text-primary-400',
                  ]" />
                </div>
                <div class="flex-1 min-w-0 pt-0.5">
                  <div class="flex items-center justify-between gap-2">
                    <p class="text-sm font-medium text-surface-foreground">{{ ORDER_STATUS_LABELS[h.status] }}</p>
                    <span class="text-xs text-slate-400 dark:text-zinc-500">{{ formatDateTime(h.at) }}</span>
                  </div>
                  <p class="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{{ h.note }}</p>
                </div>
              </li>
            </ol>
          </div>
        </div>

        <!-- Right (sidebar) -->
        <div class="space-y-6">
          <!-- Customer information -->
          <div class="card p-5 animate-fade-in-up" style="animation-delay: 40ms">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-7 h-7 rounded-lg bg-success-50 dark:bg-success-900/20 flex items-center justify-center">
                <UIcon name="i-lucide-user" class="w-4 h-4 text-success-600 dark:text-success-400" />
              </div>
              <h2 class="text-sm font-semibold text-surface-foreground">Khách hàng</h2>
            </div>
            <div class="flex items-center gap-3 mb-4">
              <UAvatar :alt="customerName" size="lg" :src="customer?.avatar_url" />
              <div class="min-w-0">
                <p class="text-sm font-semibold text-surface-foreground truncate">{{ customerName }}</p>
                <NuxtLink v-if="order?.user_id" :to="`/admin/customers/${order.user_id}`" class="text-xs text-primary-600 dark:text-primary-400 hover:underline">
                  Xem hồ sơ khách
                </NuxtLink>
                <span v-else class="text-xs text-slate-400 dark:text-zinc-500">Khách lẻ</span>
              </div>
            </div>
            <dl class="space-y-3 text-sm">
              <div class="flex items-center gap-2.5">
                <UIcon name="i-lucide-phone" class="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span class="text-slate-600 dark:text-zinc-300 tabular-nums">{{ customerPhone }}</span>
              </div>
              <div class="flex items-start gap-2.5">
                <UIcon name="i-lucide-map-pin" class="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <span class="text-slate-600 dark:text-zinc-300">{{ shippingAddress }}</span>
              </div>
            </dl>
          </div>

          <!-- Payment -->
          <div class="card p-5 animate-fade-in-up" style="animation-delay: 80ms">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                <UIcon name="i-lucide-wallet" class="w-4 h-4 text-primary-600 dark:text-primary-400" />
              </div>
              <h2 class="text-sm font-semibold text-surface-foreground">Thanh toán</h2>
            </div>
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs text-slate-500 dark:text-zinc-400">Trạng thái</span>
              <UBadge :color="paymentState.color" variant="subtle">{{ paymentState.label }}</UBadge>
            </div>
            <dl class="space-y-2.5 text-sm">
              <div class="flex items-center justify-between">
                <dt class="text-slate-500 dark:text-zinc-400">Tổng tiền</dt>
                <dd class="font-medium text-surface-foreground tabular-nums">{{ formatVND(total) }}</dd>
              </div>
              <div class="flex items-center justify-between">
                <dt class="text-slate-500 dark:text-zinc-400">Đã thu</dt>
                <dd class="font-medium text-success-600 dark:text-success-400 tabular-nums">{{ formatVND(amountCollected) }}</dd>
              </div>
              <div class="flex items-center justify-between pt-2.5 border-t border-surface-border">
                <dt class="text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <UIcon name="i-lucide-credit-card" class="w-3.5 h-3.5" /> Còn nợ
                </dt>
                <dd :class="['font-semibold tabular-nums', remaining > 0 ? 'text-error-600 dark:text-error-400' : 'text-surface-foreground']">
                  {{ formatVND(remaining) }}
                </dd>
              </div>
            </dl>
          </div>

          <!-- Delivery -->
          <div class="card p-5 animate-fade-in-up" style="animation-delay: 120ms">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-info-50 dark:bg-info-900/20 flex items-center justify-center">
                  <UIcon name="i-lucide-truck" class="w-4 h-4 text-info-600 dark:text-info-400" />
                </div>
                <h2 class="text-sm font-semibold text-surface-foreground">Giao hàng</h2>
              </div>
              <button v-if="!driverName" class="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1" @click="showAssignDriver = true">
                <UIcon name="i-lucide-user-check" class="w-3.5 h-3.5" /> Gán tài xế
              </button>
            </div>

            <div v-if="driverName" class="flex items-center gap-3 mb-4 pb-4 border-b border-surface-border">
              <UAvatar :alt="driverName" size="md" :src="driver?.avatar_url" />
              <div class="min-w-0">
                <p class="text-sm font-medium text-surface-foreground truncate">{{ driverName }}</p>
                <p class="text-xs text-slate-500 dark:text-zinc-400">Tài xế giao hàng</p>
              </div>
            </div>
            <div v-else class="flex items-center gap-2 mb-4 pb-4 border-b border-surface-border text-sm text-slate-400 dark:text-zinc-500">
              <UIcon name="i-lucide-alert-circle" class="w-4 h-4" /> Chưa gán tài xế
            </div>

            <div class="mb-4">
              <p class="text-xs text-slate-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1.5">
                <UIcon name="i-lucide-map-pin" class="w-3.5 h-3.5" /> Địa chỉ giao hàng
              </p>
              <p class="text-sm text-slate-600 dark:text-zinc-300">{{ shippingAddress }}</p>
            </div>

            <div class="space-y-3">
              <div
                v-for="step in deliveryTimeline"
                :key="step.label"
                class="flex items-center gap-3"
              >
                <div :class="['w-2.5 h-2.5 rounded-full flex-shrink-0', step.done ? 'bg-success-500' : 'bg-surface-border']" />
                <div class="flex-1 min-w-0">
                  <p :class="['text-sm', step.done ? 'font-medium text-surface-foreground' : 'text-slate-400 dark:text-zinc-500']">{{ step.label }}</p>
                  <p class="text-xs text-slate-400 dark:text-zinc-500">{{ step.desc }}</p>
                </div>
                <UIcon v-if="step.done" name="i-lucide-check-circle-2" class="w-4 h-4 text-success-500 flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <BaseEmptyState v-else title="Không tìm thấy đơn hàng" description="Đơn hàng không tồn tại hoặc đã bị xoá" />

    <!-- Assign Driver Modal -->
    <UModal v-model:open="showAssignDriver">
      <template #content>
        <div class="p-6 space-y-4">
          <h3 class="text-lg font-bold text-surface-foreground">Gán tài xế</h3>
          <div class="space-y-2 max-h-80 overflow-y-auto p-1">
            <button
              v-for="drv in availableDrivers"
              :key="drv.id"
              :class="[
                'w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left',
                selectedDriverId === drv.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-surface-border hover:bg-surface-hover',
              ]"
              @click="selectedDriverId = drv.id"
            >
              <UAvatar :alt="drv.full_name" size="sm" :src="drv.avatar_url" />
              <div class="min-w-0">
                <p class="text-sm font-medium text-surface-foreground truncate">{{ drv.full_name }}</p>
                <p class="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">{{ drv.phone || 'Chưa có SĐT' }}</p>
              </div>
              <UIcon v-if="selectedDriverId === drv.id" name="i-lucide-check-circle-2" class="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 ml-auto" />
            </button>
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <UButton variant="ghost" color="neutral" @click="showAssignDriver = false">Huỷ</UButton>
            <UButton :disabled="!selectedDriverId" @click="assignDriver">Gán tài xế</UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
