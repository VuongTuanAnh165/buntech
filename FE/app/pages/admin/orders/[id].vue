<script setup lang="ts">
import { mockOrders, mockProfiles, mockOrderItems } from '~/utils/mockData'
import { OrderStatus, Role, UserStatus } from '~/utils/enums'
import type { Order, OrderItem, Profile } from '~/utils/types'
import { ORDER_STATUS_COLORS, ORDER_STATUS_ICONS, ORDER_STATUS_LABELS, ORDER_STATUS_FLOW } from '~/utils/orderStatus'

const toast = useToast()
const route = useRoute()
const { formatVND, formatDateTime } = useFormat()

definePageMeta({ layout: 'admin' })

const orderId = route.params.id as string

// State
const loading = ref(true)
const error = ref(false)
const order = ref<Order | null>(null)
const items = ref<OrderItem[]>([])
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
  return { label: 'Chưa thanh toán', color: 'error' as const } // v4 uses error, not danger
})

const customer = computed(() => order.value?.user as Profile | null | undefined)
const customerName = computed(() => customer.value?.full_name || order.value?.guest_info?.name || 'Khách lẻ')
const customerPhone = computed(() => customer.value?.phone || order.value?.guest_info?.phone || '—')
const shippingAddress = computed(() => order.value?.shipping_address || order.value?.guest_info?.address || '—')
const driver = computed(() => order.value?.driver as Profile | null | undefined)
const driverName = computed(() => driver.value?.full_name)
const orderNotes = computed(() => order.value?.note || 'Không có ghi chú cho đơn hàng này.')

const availableDrivers = computed(() => mockProfiles.filter(p => p.role === Role.DRIVER && p.status === UserStatus.ACTIVE))

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
  navigateTo('/admin/orders/create')
}

function printOrder() {
  if (import.meta.client) window.print()
}

useSeoMeta({ title: () => `Đơn hàng #${String(orderId).slice(0, 8)} - BunTech Admin` })
onMounted(loadOrder)

const statusOptions = computed(() => {
  return Object.values(OrderStatus)
    .filter(s => s !== order.value?.status)
    .map(s => ({
      label: ORDER_STATUS_LABELS[s],
      icon: ORDER_STATUS_ICONS[s],
      onSelect: () => changeStatus(s)
    }))
})

const orderActions = computed(() => [
  [
    { label: 'Sao chép', icon: 'i-lucide-copy', onSelect: copyOrder },
    { label: 'In', icon: 'i-lucide-printer', onSelect: printOrder }
  ]
])

</script>

<template>
  <div class="pb-20 lg:pb-0">
    <div class="mb-4">
      <UButton
        variant="ghost"
        color="neutral"
        icon="i-lucide-arrow-left"
        @click="navigateTo('/admin/orders')"
      >
        Quay lại
      </UButton>
    </div>

    <BaseEmptyState v-if="error" title="Lỗi tải dữ liệu" description="Không thể tải thông tin đơn hàng." @retry="loadOrder" />

    <template v-else-if="loading">
      <BasePageLoading />
    </template>

    <template v-else-if="order">
      <!-- Order header card -->
      <UCard class="mb-6 relative overflow-hidden bg-surface">
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
              <span class="flex items-center gap-1.5"><div class="i-lucide-clock w-4 h-4" /> {{ formatDateTime(order.created_at) }}</span>
              <span class="flex items-center gap-1.5"><div class="i-lucide-shopping-bag w-4 h-4" /> {{ items.length }} sản phẩm</span>
            </div>
          </div>

          <div class="flex flex-col items-start lg:items-end gap-3">
            <div class="lg:text-right">
              <p class="text-xs text-slate-500 dark:text-zinc-400">Tổng tiền</p>
              <p class="text-3xl font-bold text-primary-600 dark:text-primary-400 tabular-nums">{{ formatVND(total) }}</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <UDropdownMenu :items="orderActions">
                <UButton variant="outline" color="neutral">
                  Thao tác <div class="i-lucide-chevron-down w-4 h-4 ml-1" />
                </UButton>
              </UDropdownMenu>
              <UDropdownMenu :items="[statusOptions]">
                <UButton :loading="changingStatus" icon="i-lucide-refresh-cw">
                  Đổi trạng thái
                </UButton>
              </UDropdownMenu>
            </div>
          </div>
        </div>
      </UCard>

      <!-- 3-column layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left (main) -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Order items -->
          <UCard class="animate-fade-in-up bg-surface">
            <template #header>
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                  <div class="i-lucide-shopping-bag w-4 h-4 text-primary-600 dark:text-primary-400" />
                </div>
                <h2 class="text-sm font-semibold text-surface-foreground">Sản phẩm trong đơn</h2>
              </div>
            </template>

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
                    <div v-else class="i-lucide-package w-5 h-5 text-gray-300 dark:text-zinc-600" />
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
          </UCard>

          <!-- Order notes -->
          <UCard class="animate-fade-in-up bg-surface" style="animation-delay: 80ms">
            <template #header>
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-warning-50 dark:bg-warning-900/20 flex items-center justify-center">
                  <div class="i-lucide-sticky-note w-4 h-4 text-warning-600 dark:text-warning-400" />
                </div>
                <h2 class="text-sm font-semibold text-surface-foreground">Ghi chú đơn hàng</h2>
              </div>
            </template>
            <div class="bg-surface-hover rounded-lg p-4">
              <p class="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">{{ orderNotes }}</p>
            </div>
          </UCard>

          <!-- Status timeline -->
          <UCard class="animate-fade-in-up bg-surface" style="animation-delay: 120ms">
            <template #header>
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-info-50 dark:bg-info-900/20 flex items-center justify-center">
                  <div class="i-lucide-git-commit w-4 h-4 text-info-600 dark:text-info-400" />
                </div>
                <h2 class="text-sm font-semibold text-surface-foreground">Tiến trình đơn hàng</h2>
              </div>
            </template>

            <div v-if="!isCancelled" class="mb-12">
              <BaseStepper :steps="deliveryTimeline" />
            </div>

            <div v-else class="flex items-center gap-3 p-4 rounded-lg bg-error-50 dark:bg-error-900/20">
              <div class="w-10 h-10 rounded-full bg-error-500 text-white flex items-center justify-center flex-shrink-0">
                <div class="i-lucide-x-circle w-5 h-5" />
              </div>
              <div>
                <p class="text-sm font-semibold text-error-700 dark:text-error-300">Đơn hàng đã bị hủy</p>
                <p class="text-xs text-error-600 dark:text-error-400">Quy trình giao hàng đã dừng lại</p>
              </div>
            </div>
          </UCard>

          <!-- Order history -->
          <UCard class="animate-fade-in-up bg-surface" style="animation-delay: 160ms">
            <template #header>
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-secondary-50 dark:bg-secondary-900/20 flex items-center justify-center">
                  <div class="i-lucide-history w-4 h-4 text-secondary-600 dark:text-secondary-400" />
                </div>
                <h2 class="text-sm font-semibold text-surface-foreground">Lịch sử thay đổi</h2>
              </div>
            </template>
            <ol class="relative space-y-0 p-2">
              <li v-for="(h, i) in orderHistory" :key="i" class="flex gap-4 pb-4 last:pb-0 relative">
                <div v-if="i < orderHistory.length - 1" class="absolute left-[15px] top-8 bottom-0 w-px bg-surface-border" />
                <div :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ring-4 ring-surface',
                  h.status === OrderStatus.CANCELLED ? 'bg-error-50 dark:bg-error-900/20' :
                  h.status === OrderStatus.DELIVERED ? 'bg-success-50 dark:bg-success-900/20' : 'bg-primary-50 dark:bg-primary-900/20',
                ]">
                  <div :class="[
                    statusIcons[h.status],
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
          </UCard>
        </div>

        <!-- Right (sidebar) -->
        <div class="space-y-6">
          <!-- Customer information -->
          <UCard class="animate-fade-in-up bg-surface" style="animation-delay: 40ms">
            <template #header>
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-success-50 dark:bg-success-900/20 flex items-center justify-center">
                  <div class="i-lucide-user w-4 h-4 text-success-600 dark:text-success-400" />
                </div>
                <h2 class="text-sm font-semibold text-surface-foreground">Khách hàng</h2>
              </div>
            </template>
            <div class="flex items-center gap-3 mb-4">
              <UAvatar :alt="customerName" size="lg" :src="customer?.avatar_url" />
              <div class="min-w-0">
                <p class="text-sm font-semibold text-surface-foreground truncate">{{ customerName }}</p>
                <NuxtLink v-if="order.user_id" :to="`/admin/customers/${order.user_id}`" class="text-xs text-primary-600 dark:text-primary-400 hover:underline">
                  Xem hồ sơ khách
                </NuxtLink>
                <span v-else class="text-xs text-slate-400 dark:text-zinc-500">Khách lẻ</span>
              </div>
            </div>
            <dl class="space-y-3 text-sm">
              <div class="flex items-center gap-2.5">
                <div class="i-lucide-phone w-4 h-4 text-slate-400 flex-shrink-0" />
                <span class="text-slate-600 dark:text-zinc-300 tabular-nums">{{ customerPhone }}</span>
              </div>
              <div class="flex items-start gap-2.5">
                <div class="i-lucide-map-pin w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <span class="text-slate-600 dark:text-zinc-300">{{ shippingAddress }}</span>
              </div>
            </dl>
          </UCard>

          <!-- Payment -->
          <UCard class="animate-fade-in-up bg-surface" style="animation-delay: 80ms">
            <template #header>
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                  <div class="i-lucide-wallet w-4 h-4 text-primary-600 dark:text-primary-400" />
                </div>
                <h2 class="text-sm font-semibold text-surface-foreground">Thanh toán</h2>
              </div>
            </template>
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
                  <div class="i-lucide-credit-card w-3.5 h-3.5" /> Còn nợ
                </dt>
                <dd :class="['font-semibold tabular-nums', remaining > 0 ? 'text-error-600 dark:text-error-400' : 'text-surface-foreground']">
                  {{ formatVND(remaining) }}
                </dd>
              </div>
            </dl>
          </UCard>

          <!-- Delivery -->
          <UCard class="animate-fade-in-up bg-surface" style="animation-delay: 120ms">
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-lg bg-info-50 dark:bg-info-900/20 flex items-center justify-center">
                    <div class="i-lucide-truck w-4 h-4 text-info-600 dark:text-info-400" />
                  </div>
                  <h2 class="text-sm font-semibold text-surface-foreground">Giao hàng</h2>
                </div>
                <UButton v-if="!driverName" variant="ghost" color="primary" size="sm" icon="i-lucide-user-check" @click="showAssignDriver = true">
                  Gán tài xế
                </UButton>
              </div>
            </template>

            <div v-if="driverName" class="flex items-center gap-3 mb-4 pb-4 border-b border-surface-border">
              <UAvatar :alt="driverName" size="md" :src="driver?.avatar_url" />
              <div class="min-w-0">
                <p class="text-sm font-medium text-surface-foreground truncate">{{ driverName }}</p>
                <p class="text-xs text-slate-500 dark:text-zinc-400">Tài xế giao hàng</p>
              </div>
            </div>
            <div v-else class="flex items-center gap-2 mb-4 pb-4 border-b border-surface-border text-sm text-slate-400 dark:text-zinc-500">
              <div class="i-lucide-alert-circle w-4 h-4" /> Chưa gán tài xế
            </div>

            <div class="mb-4">
              <p class="text-xs text-slate-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1.5">
                <span class="i-lucide-map-pin w-3.5 h-3.5" /> Địa chỉ giao hàng
              </p>
              <p class="text-sm text-slate-600 dark:text-zinc-300">{{ shippingAddress }}</p>
            </div>

            <div class="relative pl-3 space-y-6">
              <!-- Vertical line -->
              <div class="absolute left-[17px] top-2 bottom-2 w-0.5 bg-surface-border rounded-full" />
              <div
                v-for="(step, index) in deliveryTimeline"
                :key="step.label"
                class="relative flex items-center gap-4"
              >
                <!-- Dot -->
                <div 
                  :class="[
                    'absolute -left-[9px] w-3 h-3 rounded-full border-2 border-surface', 
                    step.done ? 'bg-success-500' : 'bg-surface-border'
                  ]" 
                />
                
                <div class="flex-1 min-w-0 py-0.5">
                  <p :class="['text-sm', step.done ? 'font-medium text-surface-foreground' : 'text-slate-400 dark:text-zinc-500']">{{ step.label }}</p>
                  <p class="text-xs text-slate-400 dark:text-zinc-500">{{ step.desc }}</p>
                </div>
                <div v-if="step.done" class="i-lucide-check-circle-2 w-4 h-4 text-success-500 flex-shrink-0" />
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </template>

    <!-- Assign Driver Modal -->
    <UModal v-model:open="showAssignDriver" title="Gán tài xế">
      <template #body>
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
            <div v-if="selectedDriverId === drv.id" class="i-lucide-check-circle-2 w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 ml-auto" />
          </button>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" color="neutral" @click="showAssignDriver = false">Huỷ</UButton>
          <UButton :disabled="!selectedDriverId" @click="assignDriver">Gán tài xế</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
