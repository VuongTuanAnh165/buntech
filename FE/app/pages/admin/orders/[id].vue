<script setup lang="ts">
import { ConstantKey } from '~/enums/constantKeys'
import { useAdminOrders } from '~/composables/admin/useAdminOrders'
import { useUsers } from '~/composables/admin/useUsers'
import {
  getOrderStatusColor,
  getOrderStatusIcon,
  getOrderStatusLabel,
  getOrderStatusList
} from '~/utils/orderStatus'
import type { UserDTO } from '~/utils/types'

const { constants } = useMasterData()
const toast = useToast()
const route = useRoute()
const _router = useRouter()
const { getOrder, updateStatus, batchAssignDriver } = useAdminOrders()
const { fetchUsers } = useUsers()
definePageMeta({ layout: 'admin' })

const orderId = route.params.id as string

const {
  data: res,
  status,
  error: fetchError,
  refresh
} = useAsyncData(`admin_order_${orderId}`, () => getOrder(orderId))

const loading = computed(() => status.value === 'pending')
const error = computed(() => !!fetchError.value || !res.value?.data)
const order = computed(() => res.value?.data || null)
const items = computed(() => order.value?.items || [])

const showStatusMenu = ref(false)
const changingStatus = ref(false)
const showAssignDriver = ref(false)
const selectedDriverId = ref('')

const statusFlow = computed(() => getOrderStatusList(constants))
const currentStatusIndex = computed(() => {
  if (!order.value) return -1
  if (order.value.status === constants.value?.[ConstantKey.OrderStatus]?.CANCELLED) return -2
  return statusFlow.value.indexOf(order.value.status)
})
const isCancelled = computed(
  () => order.value?.status === constants.value?.[ConstantKey.OrderStatus]?.CANCELLED
)

const total = computed(() => Number(order.value?.totalAmount ?? 0))
const amountCollected = computed(() => 0)
const remaining = computed(() => Math.max(0, total.value - amountCollected.value))

const paymentState = computed(() => {
  if (amountCollected.value >= total.value && total.value > 0)
    return { label: 'Đã thanh toán đủ', color: 'success' as const }
  if (amountCollected.value > 0) return { label: 'Thanh toán một phần', color: 'warning' as const }
  return { label: 'Chưa thanh toán', color: 'error' as const }
})

const customer = computed(() => order.value?.user)
const customerName = computed(() => customer.value?.fullName || 'Khách lẻ')
const customerPhone = computed(() => customer.value?.phoneNumber || '—')
const shippingAddress = computed(() => order.value?.shippingAddress?.addressLine || '—')
const driver = computed(() => order.value?.driver)
const driverName = computed(() => driver.value?.fullName)
const orderNotes = computed(() => order.value?.note || 'Không có ghi chú cho đơn hàng này.')

const availableDrivers = ref<UserDTO[]>([])
onMounted(async () => {
  try {
    const driverRole = constants.value?.[ConstantKey.Role]?.DRIVER
    if (driverRole) {
      const usersRes = await fetchUsers({ role: driverRole, limit: 100 })
      availableDrivers.value = usersRes.data?.data || []
    }
  } catch {
    // ignore
  }
})

const statusOptions = computed(() =>
  Object.values(constants.value?.[ConstantKey.OrderStatus] || {}).filter(
    (s) => s !== order.value?.status
  )
)

const orderHistory = ref<{ status: string; at: string; note: string }[]>([])
watch(
  order,
  () => {
    if (!order.value) return
    const created = order.value.createdAt
    const base: { status: string; at: string; note: string }[] = [
      {
        status: constants.value?.[ConstantKey.OrderStatus]?.PENDING as string,
        at: created,
        note: 'Đơn hàng được tạo'
      }
    ]
    if (
      order.value.status !== constants.value?.[ConstantKey.OrderStatus]?.PENDING &&
      order.value.status !== constants.value?.[ConstantKey.OrderStatus]?.CANCELLED
    ) {
      base.push({
        status: constants.value?.[ConstantKey.OrderStatus]?.PROCESSING as string,
        at: addHours(created, 2),
        note: 'Bắt đầu chuẩn bị hàng'
      })
    }
    if (
      [
        constants.value?.[ConstantKey.OrderStatus]?.SHIPPING,
        constants.value?.[ConstantKey.OrderStatus]?.DELIVERED
      ].includes(order.value.status)
    ) {
      base.push({
        status: constants.value?.[ConstantKey.OrderStatus]?.SHIPPING as string,
        at: addHours(created, 4),
        note: 'Đã giao cho tài xế'
      })
    }
    if (order.value.status === constants.value?.[ConstantKey.OrderStatus]?.DELIVERED) {
      base.push({
        status: constants.value?.[ConstantKey.OrderStatus]?.DELIVERED as string,
        at: addHours(created, 8),
        note: 'Khách đã nhận hàng'
      })
    }
    if (order.value.status === constants.value?.[ConstantKey.OrderStatus]?.CANCELLED) {
      base.push({
        status: constants.value?.[ConstantKey.OrderStatus]?.CANCELLED as string,
        at: addHours(created, 1),
        note: 'Đơn hàng bị hủy'
      })
    }
    orderHistory.value = base
  },
  { immediate: true }
)

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
    { label: 'Giao thành công', desc: 'Khách đã nhận', done: currentStatusIndex.value >= 3 }
  ]
})

async function changeStatus(newStatus: string) {
  if (!order.value) return
  showStatusMenu.value = false
  changingStatus.value = true
  try {
    await updateStatus(orderId, {
      status: newStatus,
      updatedAt: order.value.updatedAt
    })
    refresh()
  } catch {
    // ignore
  } finally {
    changingStatus.value = false
  }
}

async function assignDriver() {
  if (!selectedDriverId.value || !order.value) return
  try {
    await batchAssignDriver({
      driverId: parseInt(selectedDriverId.value, 10),
      orders: [{ orderId: parseInt(orderId, 10) }]
    })
    showAssignDriver.value = false
    selectedDriverId.value = ''
    refresh()
  } catch {
    // ignore
  }
}

function copyOrder() {
  if (!order.value) return
  const copyData = {
    userId: order.value.userId,
    items: items.value.map((i) => ({
      productId: i.productId,
      productName: i.product?.name,
      quantity: i.quantity,
      price: i.unitPrice
    }))
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

function loadOrder() {
  refresh()
} // for retry button

const breadcrumbItems = [
  { label: 'Admin', to: '/admin' },
  { label: 'Đơn hàng', to: '/admin/orders' },
  { label: `#${String(orderId).slice(0, 8)}` }
]
</script>

<template>
  <div>
    <UBreadcrumb :items="breadcrumbItems" class="mb-4" />

    <UButton
      variant="ghost"
      color="neutral"
      class="mb-4 flex min-h-[44px] items-center gap-1 px-2 text-sm text-slate-500 transition-colors hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200"
      @click="
        () => {
          navigateTo('/admin/orders')
        }
      "
    >
      <UIcon name="i-lucide-arrow-left" class="h-4 w-4" /> Quay lại
    </UButton>

    <BaseEmptyState
      v-if="error"
      title="Lỗi tải dữ liệu"
      description="Không thể tải thông tin đơn hàng."
      @retry="loadOrder"
    />

    <template v-else-if="loading">
      <div class="space-y-4">
        <div class="skeleton h-32 w-full rounded-2xl" />
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div class="space-y-6 lg:col-span-2">
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
      <div class="card animate-fade-in-up relative mb-6 overflow-hidden p-6">
        <div
          class="bg-primary-500/5 dark:bg-primary-400/5 pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full blur-2xl"
        />
        <div class="relative flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div class="min-w-0 flex-1">
            <div class="mb-2 flex flex-wrap items-center gap-2">
              <span class="font-mono text-sm text-slate-500 dark:text-zinc-400"
                >#{{ String(orderId).slice(0, 8) }}</span
              >
              <UBadge :color="getOrderStatusColor(constants)[order.status] as any" variant="subtle">
                {{ getOrderStatusLabel(constants)[order.status] }}
              </UBadge>
            </div>
            <h1 class="text-surface-foreground mb-1 text-2xl font-bold tracking-tight">
              Đơn hàng #{{ String(orderId).slice(-6) }}
            </h1>
            <div
              class="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-zinc-400"
            >
              <span class="flex items-center gap-1.5"
                ><UIcon name="i-lucide-clock" class="h-4 w-4" />
                {{ formatDateTime(order.createdAt) }}</span
              >
              <span class="flex items-center gap-1.5"
                ><UIcon name="i-lucide-shopping-bag" class="h-4 w-4" /> {{ items.length }} sản
                phẩm</span
              >
            </div>
          </div>

          <div class="flex flex-col items-start gap-3 lg:items-end">
            <div class="lg:text-right">
              <p class="text-xs text-slate-500 dark:text-zinc-400">Tổng tiền</p>
              <p class="text-primary-600 dark:text-primary-400 text-3xl font-bold tabular-nums">
                {{ formatVND(total) }}
              </p>
            </div>
            <div class="flex flex-wrap gap-2">
              <UButton size="sm" variant="outline" color="neutral" @click="copyOrder">
                <UIcon name="i-lucide-copy" class="h-4 w-4" /> Sao chép
              </UButton>
              <UButton size="sm" variant="outline" color="neutral" @click="printOrder">
                <UIcon name="i-lucide-printer" class="h-4 w-4" /> In
              </UButton>
              <div class="relative">
                <UButton
                  size="sm"
                  :loading="changingStatus"
                  @click="
                    () => {
                      showStatusMenu = !showStatusMenu
                    }
                  "
                >
                  <UIcon name="i-lucide-refresh-cw" class="h-4 w-4" /> Đổi trạng thái
                  <UIcon
                    name="i-lucide-chevron-right"
                    class="h-3.5 w-3.5 transition-transform"
                    :class="showStatusMenu ? 'rotate-90' : ''"
                  />
                </UButton>
                <Transition name="fade">
                  <div
                    v-if="showStatusMenu"
                    class="card absolute top-full right-0 z-20 mt-2 w-48 p-1.5 shadow-lg"
                  >
                    <UButton
                      v-for="s in statusOptions"
                      :key="s"
                      variant="ghost"
                      color="neutral"
                      class="text-surface-foreground hover:bg-surface-hover flex min-h-[40px] w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
                      @click="changeStatus(s as string)"
                    >
                      <UIcon :name="getOrderStatusIcon(constants)[s]" class="h-4 w-4" />
                      {{ getOrderStatusLabel(constants)[s] }}
                    </UButton>
                  </div>
                </Transition>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3-column layout -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Left (main) -->
        <div class="space-y-6 lg:col-span-2">
          <!-- Order items -->
          <div class="card animate-fade-in-up p-5" style="animation-delay: 40ms">
            <div class="mb-4 flex items-center gap-2">
              <div
                class="bg-primary-50 dark:bg-primary-900/20 flex h-7 w-7 items-center justify-center rounded-lg"
              >
                <UIcon
                  name="i-lucide-shopping-bag"
                  class="text-primary-600 dark:text-primary-400 h-4 w-4"
                />
              </div>
              <h2 class="text-surface-foreground text-sm font-semibold">Sản phẩm trong đơn</h2>
            </div>

            <template v-if="items.length">
              <div
                class="border-surface-border mb-1 hidden grid-cols-12 gap-3 border-b px-3 pb-2 text-xs font-medium text-slate-500 sm:grid dark:text-zinc-400"
              >
                <div class="col-span-6">Tên sản phẩm</div>
                <div class="col-span-2 text-right">Đơn giá</div>
                <div class="col-span-2 text-right">Số lượng</div>
                <div class="col-span-2 text-right">Thành tiền</div>
              </div>

              <div
                v-for="item in items"
                :key="item.id"
                class="hover:bg-surface-hover grid grid-cols-12 items-center gap-3 rounded-lg px-3 py-3 transition-colors"
              >
                <div class="col-span-12 flex items-center gap-3 sm:col-span-6">
                  <div
                    class="bg-surface-hover ring-surface-border flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg ring-1"
                  >
                    <NuxtImg
                      v-if="item.product?.thumbnailUrl"
                      :src="item.product.thumbnailUrl"
                      :alt="item.product?.name"
                      class="h-full w-full object-cover"
                    />
                    <UIcon
                      v-else
                      name="i-lucide-package"
                      class="h-5 w-5 text-slate-300 dark:text-zinc-600"
                    />
                  </div>
                  <div class="min-w-0">
                    <p class="text-surface-foreground truncate text-sm font-medium">
                      {{ item.product?.name }}
                    </p>
                    <p class="text-xs text-slate-500 sm:hidden dark:text-zinc-400">
                      {{ formatVND(Number(item.unitPrice)) }} × {{ item.quantity }}
                    </p>
                  </div>
                </div>
                <div
                  class="col-span-2 hidden text-right text-sm text-slate-600 tabular-nums sm:block dark:text-zinc-300"
                >
                  {{ formatVND(Number(item.unitPrice)) }}
                </div>
                <div class="col-span-2 hidden text-right sm:block">
                  <UBadge color="neutral" variant="soft">× {{ item.quantity }}</UBadge>
                </div>
                <div
                  class="text-surface-foreground col-span-12 text-right text-sm font-semibold tabular-nums sm:col-span-2"
                >
                  {{ formatVND(Number(item.quantity) * Number(item.unitPrice)) }}
                </div>
              </div>

              <div
                class="border-surface-border mt-3 flex items-center justify-between border-t pt-3"
              >
                <span class="text-surface-foreground text-sm font-semibold">Tổng cộng</span>
                <span
                  class="text-primary-600 dark:text-primary-400 text-xl font-bold tabular-nums"
                  >{{ formatVND(total) }}</span
                >
              </div>
            </template>
            <BaseEmptyState
              v-else
              title="Không có sản phẩm"
              description="Đơn hàng này chưa có sản phẩm nào"
            />
          </div>

          <!-- Order notes -->
          <div class="card animate-fade-in-up p-5" style="animation-delay: 80ms">
            <div class="mb-3 flex items-center gap-2">
              <div
                class="bg-warning-50 dark:bg-warning-900/20 flex h-7 w-7 items-center justify-center rounded-lg"
              >
                <UIcon
                  name="i-lucide-sticky-note"
                  class="text-warning-600 dark:text-warning-400 h-4 w-4"
                />
              </div>
              <h2 class="text-surface-foreground text-sm font-semibold">Ghi chú đơn hàng</h2>
            </div>
            <div class="bg-surface-hover rounded-lg p-4">
              <p class="text-sm leading-relaxed text-slate-600 dark:text-zinc-300">
                {{ orderNotes }}
              </p>
            </div>
          </div>

          <!-- Status timeline -->
          <div class="card animate-fade-in-up p-5" style="animation-delay: 120ms">
            <div class="mb-5 flex items-center gap-2">
              <div
                class="bg-info-50 dark:bg-info-900/20 flex h-7 w-7 items-center justify-center rounded-lg"
              >
                <UIcon name="i-lucide-truck" class="text-info-600 dark:text-info-400 h-4 w-4" />
              </div>
              <h2 class="text-surface-foreground text-sm font-semibold">Tiến trình đơn hàng</h2>
            </div>

            <div v-if="!isCancelled" class="relative mb-2 flex items-center justify-between">
              <div class="bg-surface-border absolute top-5 right-5 left-5 h-0.5" />
              <div
                class="from-primary-500 to-success-500 absolute top-5 left-5 h-0.5 bg-gradient-to-r transition-all duration-700"
                :style="{
                  width: `calc((100% - 2.5rem) * ${currentStatusIndex >= 0 ? currentStatusIndex / (statusFlow.length - 1) : 0})`
                }"
              />
              <div
                v-for="(step, i) in deliveryTimeline"
                :key="step.label"
                class="relative z-10 flex flex-1 flex-col items-center gap-2"
              >
                <div
                  :class="[
                    'ring-surface flex h-10 w-10 items-center justify-center rounded-full ring-4 transition-all',
                    step.done
                      ? 'bg-success-500 text-white'
                      : 'bg-surface-hover text-slate-400 dark:text-zinc-500'
                  ]"
                >
                  <UIcon
                    :name="getOrderStatusIcon(constants)[statusFlow[i] as string]"
                    class="h-5 w-5"
                  />
                </div>
                <div class="text-center">
                  <p
                    :class="[
                      'text-xs font-medium',
                      step.done ? 'text-surface-foreground' : 'text-slate-400 dark:text-zinc-500'
                    ]"
                  >
                    {{ step.label }}
                  </p>
                  <p class="mt-0.5 hidden text-[10px] text-slate-400 sm:block dark:text-zinc-500">
                    {{ step.desc }}
                  </p>
                </div>
              </div>
            </div>

            <div
              v-else
              class="bg-error-50 dark:bg-error-900/20 flex items-center gap-3 rounded-lg p-4"
            >
              <div
                class="bg-error-500 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-white"
              >
                <UIcon name="i-lucide-x-circle" class="h-5 w-5" />
              </div>
              <div>
                <p class="text-error-700 dark:text-error-300 text-sm font-semibold">
                  Đơn hàng đã bị hủy
                </p>
                <p class="text-error-600 dark:text-error-400 text-xs">
                  Quy trình giao hàng đã dừng lại
                </p>
              </div>
            </div>
          </div>

          <!-- Order history -->
          <div class="card animate-fade-in-up p-5" style="animation-delay: 160ms">
            <div class="mb-4 flex items-center gap-2">
              <div
                class="bg-secondary-50 dark:bg-secondary-900/20 flex h-7 w-7 items-center justify-center rounded-lg"
              >
                <UIcon
                  name="i-lucide-history"
                  class="text-secondary-600 dark:text-secondary-400 h-4 w-4"
                />
              </div>
              <h2 class="text-surface-foreground text-sm font-semibold">Lịch sử thay đổi</h2>
            </div>
            <ol class="relative space-y-0">
              <li
                v-for="(h, i) in orderHistory"
                :key="i"
                class="relative flex gap-4 pb-4 last:pb-0"
              >
                <div
                  v-if="i < orderHistory.length - 1"
                  class="bg-surface-border absolute top-8 bottom-0 left-[15px] w-px"
                />
                <div
                  :class="[
                    'ring-surface flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ring-4',
                    h.status === constants?.[ConstantKey.OrderStatus]?.CANCELLED
                      ? 'bg-error-50 dark:bg-error-900/20'
                      : h.status === constants?.[ConstantKey.OrderStatus]?.DELIVERED
                        ? 'bg-success-50 dark:bg-success-900/20'
                        : 'bg-primary-50 dark:bg-primary-900/20'
                  ]"
                >
                  <UIcon
                    :name="getOrderStatusIcon(constants)[h.status]"
                    :class="[
                      'h-4 w-4',
                      h.status === constants?.[ConstantKey.OrderStatus]?.CANCELLED
                        ? 'text-error-600 dark:text-error-400'
                        : h.status === constants?.[ConstantKey.OrderStatus]?.DELIVERED
                          ? 'text-success-600 dark:text-success-400'
                          : 'text-primary-600 dark:text-primary-400'
                    ]"
                  />
                </div>
                <div class="min-w-0 flex-1 pt-0.5">
                  <div class="flex items-center justify-between gap-2">
                    <p class="text-surface-foreground text-sm font-medium">
                      {{ getOrderStatusLabel(constants)[h.status] }}
                    </p>
                    <span class="text-xs text-slate-400 dark:text-zinc-500">{{
                      formatDateTime(h.at)
                    }}</span>
                  </div>
                  <p class="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">{{ h.note }}</p>
                </div>
              </li>
            </ol>
          </div>
        </div>

        <!-- Right (sidebar) -->
        <div class="space-y-6">
          <!-- Customer information -->
          <div class="card animate-fade-in-up p-5" style="animation-delay: 40ms">
            <div class="mb-4 flex items-center gap-2">
              <div
                class="bg-success-50 dark:bg-success-900/20 flex h-7 w-7 items-center justify-center rounded-lg"
              >
                <UIcon
                  name="i-lucide-user"
                  class="text-success-600 dark:text-success-400 h-4 w-4"
                />
              </div>
              <h2 class="text-surface-foreground text-sm font-semibold">Khách hàng</h2>
            </div>
            <div class="mb-4 flex items-center gap-3">
              <UAvatar :alt="customerName" size="lg" :src="customer?.avatarUrl || undefined" />
              <div class="min-w-0">
                <p class="text-surface-foreground truncate text-sm font-semibold">
                  {{ customerName }}
                </p>
                <NuxtLink
                  v-if="order?.userId"
                  :to="`/admin/customers/${order.userId}`"
                  class="text-primary-600 dark:text-primary-400 text-xs hover:underline"
                >
                  Xem hồ sơ khách
                </NuxtLink>
                <span v-else class="text-xs text-slate-400 dark:text-zinc-500">Khách lẻ</span>
              </div>
            </div>
            <dl class="space-y-3 text-sm">
              <div class="flex items-center gap-2.5">
                <UIcon name="i-lucide-phone" class="h-4 w-4 flex-shrink-0 text-slate-400" />
                <span class="text-slate-600 tabular-nums dark:text-zinc-300">{{
                  customerPhone
                }}</span>
              </div>
              <div class="flex items-start gap-2.5">
                <UIcon
                  name="i-lucide-map-pin"
                  class="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400"
                />
                <span class="text-slate-600 dark:text-zinc-300">{{ shippingAddress }}</span>
              </div>
            </dl>
          </div>

          <!-- Payment -->
          <div class="card animate-fade-in-up p-5" style="animation-delay: 80ms">
            <div class="mb-4 flex items-center gap-2">
              <div
                class="bg-primary-50 dark:bg-primary-900/20 flex h-7 w-7 items-center justify-center rounded-lg"
              >
                <UIcon
                  name="i-lucide-wallet"
                  class="text-primary-600 dark:text-primary-400 h-4 w-4"
                />
              </div>
              <h2 class="text-surface-foreground text-sm font-semibold">Thanh toán</h2>
            </div>
            <div class="mb-4 flex items-center justify-between">
              <span class="text-xs text-slate-500 dark:text-zinc-400">Trạng thái</span>
              <UBadge :color="paymentState.color" variant="subtle">{{ paymentState.label }}</UBadge>
            </div>
            <dl class="space-y-2.5 text-sm">
              <div class="flex items-center justify-between">
                <dt class="text-slate-500 dark:text-zinc-400">Tổng tiền</dt>
                <dd class="text-surface-foreground font-medium tabular-nums">
                  {{ formatVND(total) }}
                </dd>
              </div>
              <div class="flex items-center justify-between">
                <dt class="text-slate-500 dark:text-zinc-400">Đã thu</dt>
                <dd class="text-success-600 dark:text-success-400 font-medium tabular-nums">
                  {{ formatVND(amountCollected) }}
                </dd>
              </div>
              <div class="border-surface-border flex items-center justify-between border-t pt-2.5">
                <dt class="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400">
                  <UIcon name="i-lucide-credit-card" class="h-3.5 w-3.5" /> Còn nợ
                </dt>
                <dd
                  :class="[
                    'font-semibold tabular-nums',
                    remaining > 0 ? 'text-error-600 dark:text-error-400' : 'text-surface-foreground'
                  ]"
                >
                  {{ formatVND(remaining) }}
                </dd>
              </div>
            </dl>
          </div>

          <!-- Delivery -->
          <div class="card animate-fade-in-up p-5" style="animation-delay: 120ms">
            <div class="mb-4 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div
                  class="bg-info-50 dark:bg-info-900/20 flex h-7 w-7 items-center justify-center rounded-lg"
                >
                  <UIcon name="i-lucide-truck" class="text-info-600 dark:text-info-400 h-4 w-4" />
                </div>
                <h2 class="text-surface-foreground text-sm font-semibold">Giao hàng</h2>
              </div>
              <UButton
                v-if="!driverName"
                variant="ghost"
                color="neutral"
                class="text-primary-600 dark:text-primary-400 flex items-center gap-1 text-xs hover:underline"
                @click="
                  () => {
                    showAssignDriver = true
                  }
                "
              >
                <UIcon name="i-lucide-user-check" class="h-3.5 w-3.5" /> Gán tài xế
              </UButton>
            </div>

            <div
              v-if="driverName"
              class="border-surface-border mb-4 flex items-center gap-3 border-b pb-4"
            >
              <UAvatar :alt="driverName" size="md" :src="driver?.avatarUrl || undefined" />
              <div class="min-w-0">
                <p class="text-surface-foreground truncate text-sm font-medium">{{ driverName }}</p>
                <p class="text-xs text-slate-500 dark:text-zinc-400">Tài xế giao hàng</p>
              </div>
            </div>
            <div
              v-else
              class="border-surface-border mb-4 flex items-center gap-2 border-b pb-4 text-sm text-slate-400 dark:text-zinc-500"
            >
              <UIcon name="i-lucide-alert-circle" class="h-4 w-4" /> Chưa gán tài xế
            </div>

            <div class="mb-4">
              <p class="mb-1.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400">
                <UIcon name="i-lucide-map-pin" class="h-3.5 w-3.5" /> Địa chỉ giao hàng
              </p>
              <p class="text-sm text-slate-600 dark:text-zinc-300">{{ shippingAddress }}</p>
            </div>

            <div class="space-y-3">
              <div
                v-for="step in deliveryTimeline"
                :key="step.label"
                class="flex items-center gap-3"
              >
                <div
                  :class="[
                    'h-2.5 w-2.5 flex-shrink-0 rounded-full',
                    step.done ? 'bg-success-500' : 'bg-surface-border'
                  ]"
                />
                <div class="min-w-0 flex-1">
                  <p
                    :class="[
                      'text-sm',
                      step.done
                        ? 'text-surface-foreground font-medium'
                        : 'text-slate-400 dark:text-zinc-500'
                    ]"
                  >
                    {{ step.label }}
                  </p>
                  <p class="text-xs text-slate-400 dark:text-zinc-500">{{ step.desc }}</p>
                </div>
                <UIcon
                  v-if="step.done"
                  name="i-lucide-check-circle-2"
                  class="text-success-500 h-4 w-4 flex-shrink-0"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <BaseEmptyState
      v-else
      title="Không tìm thấy đơn hàng"
      description="Đơn hàng không tồn tại hoặc đã bị xoá"
    />

    <!-- Assign Driver Modal -->
    <UModal v-model:open="showAssignDriver">
      <template #content>
        <div class="space-y-4 p-6">
          <h3 class="text-surface-foreground text-lg font-bold">Gán tài xế</h3>
          <div class="max-h-80 space-y-2 overflow-y-auto p-1">
            <UButton
              v-for="drv in availableDrivers"
              :key="drv.id"
              variant="ghost"
              color="neutral"
              :class="[
                'flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors',
                selectedDriverId === String(drv.id)
                  ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500'
                  : 'border-surface-border hover:bg-surface-hover'
              ]"
              @click="
                () => {
                  selectedDriverId = String(drv.id)
                }
              "
            >
              <UAvatar :alt="drv.fullName" size="sm" :src="drv.profile?.avatarUrl || undefined" />
              <div class="min-w-0">
                <p class="text-surface-foreground truncate text-sm font-medium">
                  {{ drv.fullName }}
                </p>
                <p class="text-xs text-slate-500 tabular-nums dark:text-zinc-400">
                  {{ drv.phoneNumber || 'Chưa có SĐT' }}
                </p>
              </div>
              <UIcon
                v-if="selectedDriverId === String(drv.id)"
                name="i-lucide-check-circle-2"
                class="text-primary-600 dark:text-primary-400 ml-auto h-5 w-5 flex-shrink-0"
              />
            </UButton>
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <UButton
              variant="ghost"
              color="neutral"
              @click="
                () => {
                  showAssignDriver = false
                }
              "
              >Huỷ</UButton
            >
            <UButton :disabled="!selectedDriverId" @click="assignDriver">Gán tài xế</UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
