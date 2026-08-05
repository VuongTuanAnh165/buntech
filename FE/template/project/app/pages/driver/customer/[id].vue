<script setup lang="ts">
import {
  ArrowLeft, Phone, MessageSquare, Navigation, MapPin, Star, Clock,
  Wallet, Package, ShoppingBag, FileText, AlertCircle, CheckCircle2,
  ChevronRight, TrendingUp, Home,
} from 'lucide-vue-next'
import { OrderStatus, ORDER_STATUS_COLORS, Role } from '../../../core/enums'
import { mockOrders, mockProfiles, mockAddresses } from '../../../core/mock/data'

const { t } = useI18n()
const { formatVND, formatDate, formatDateTime } = useFormat()
const toast = useToast()
const route = useRoute()
const router = useRouter()

useHead({ title: 'Chi tiết khách hàng - BunTech Driver' })
definePageMeta({ layout: 'driver' })

const customerId = computed(() => route.params.id as string)
const loading = ref(true)
const error = ref(false)

// Find customer profile by id, fallback to first customer
const customer = computed(() => {
  const found = mockProfiles.find(p => p.id === customerId.value && p.role === Role.CUSTOMER)
  return found || mockProfiles.find(p => p.role === Role.CUSTOMER) || null
})

// Customer's addresses
const customerAddresses = computed(() => {
  if (!customer.value) return []
  const byId = mockAddresses.filter(a => a.user_id === customer.value!.id)
  if (byId.length) return byId
  // fallback synthetic address from orders
  return []
})

// Default delivery address
const primaryAddress = computed(() => {
  // Prefer the most recent order's shipping address
  const fromOrder = customerOrders.value[0]?.shipping_address
  if (fromOrder) return fromOrder
  // Then try a stored address for this customer
  const addr = customerAddresses.value.find(a => a.is_default) || customerAddresses.value[0]
  if (addr) return `${addr.street}, ${addr.ward}, ${addr.district}, ${addr.city}`
  return '12 Nguyễn Văn Linh, Phường 4, Quận 5, TP. HCM'
})

// Past orders from this customer
const customerOrders = computed(() => {
  if (!customer.value) return []
  return mockOrders
    .filter(o => o.user_id === customer.value!.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
})

// Payment summary
const paymentSummary = computed(() => {
  const orders = mockOrders.filter(o => o.user_id === customer.value?.id)
  const totalOrders = orders.length
  const totalPaid = orders.reduce((sum, o) => sum + Number(o.amount_collected), 0)
  const totalValue = orders.reduce((sum, o) => sum + Number(o.total), 0)
  const outstanding = totalValue - totalPaid
  return { totalOrders, totalPaid, totalValue, outstanding: Math.max(0, outstanding) }
})

// Customer stats
const customerStats = computed(() => {
  const orders = mockOrders.filter(o => o.user_id === customer.value?.id)
  const delivered = orders.filter(o => o.status === OrderStatus.DELIVERED).length
  return {
    totalOrders: orders.length,
    delivered,
    rating: 4.7,
    since: customer.value?.created_at || new Date().toISOString(),
  }
})

// Delivery notes (mock based on order notes)
const deliveryNotes = computed(() => {
  const notes = mockOrders
    .filter(o => o.user_id === customer.value?.id && o.note)
    .map(o => o.note)
  const unique = [...new Set(notes)].slice(0, 3)
  return unique.length ? unique : ['Giao buổi sáng (8h-11h)', 'Gọi điện trước khi đến']
})

const preferredTime = 'Sáng (8:00 - 11:00)'

function callCustomer() {
  if (customer.value?.phone) {
    toast.success(`Đang gọi ${customer.value.phone}`)
    window.location.href = `tel:${customer.value.phone}`
  }
}

function messageCustomer() {
  toast.info('Mở tin nhắn...')
}

function navigateToAddress() {
  toast.success('Mở bản đồ điều hướng...')
}

function viewOrder(orderId: string) {
  router.push(`/driver/${orderId}`)
}

function load() {
  loading.value = true
  error.value = false
  setTimeout(() => {
    if (!customer.value) error.value = true
    loading.value = false
  }, 500)
}

onMounted(load)
</script>

<template>
  <div class="p-4">
    <!-- Back button -->
    <button
      class="flex items-center gap-1 text-sm text-slate-500 dark:text-zinc-400 hover:text-surface-foreground mb-4 min-h-[44px] px-2 rounded-md transition-colors"
      aria-label="Quay lại"
      @click="router.back()"
    >
      <ArrowLeft class="w-4 h-4" aria-hidden="true" /> Quay lại
    </button>

    <!-- Loading -->
    <template v-if="loading">
      <div class="skeleton h-40 w-full rounded-2xl mb-4" />
      <div class="skeleton h-24 w-full rounded-xl mb-4" />
      <div class="skeleton h-32 w-full rounded-xl mb-4" />
      <div class="skeleton h-40 w-full rounded-xl" />
    </template>

    <!-- Error -->
    <AppErrorState v-else-if="error" message="Không tìm thấy thông tin khách hàng" @retry="load" />

    <template v-else-if="customer">
      <!-- Customer card -->
      <div class="card p-5 mb-4 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary-500/5 blur-2xl" aria-hidden="true" />
        <div class="relative flex items-start gap-4">
          <AppAvatar :name="customer.full_name" :src="customer.avatar_url" size="lg" />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <h2 class="text-lg font-bold text-surface-foreground truncate">{{ customer.full_name }}</h2>
            </div>
            <p class="text-sm text-slate-500 dark:text-zinc-400 font-mono tabular-nums mb-2">{{ customer.phone || 'Chưa có SĐT' }}</p>
            <div class="flex items-center gap-2 flex-wrap">
              <AppBadge color="success" dot>Khách hàng</AppBadge>
              <span class="flex items-center gap-0.5 text-xs">
                <Star class="w-3.5 h-3.5 fill-warning-400 text-warning-400" aria-hidden="true" />
                <span class="font-medium text-warning-600 dark:text-warning-400 tabular-nums">{{ customerStats.rating.toFixed(1) }}</span>
              </span>
              <span class="flex items-center gap-1 text-xs text-slate-400 dark:text-zinc-500">
                <ShoppingBag class="w-3.5 h-3.5" aria-hidden="true" />
                <span class="tabular-nums">{{ customerStats.totalOrders }} đơn</span>
              </span>
            </div>
          </div>
        </div>
        <!-- Quick actions -->
        <div class="grid grid-cols-3 gap-2 mt-4">
          <button
            class="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-success-50 dark:bg-success-900/20 hover:bg-success-100 dark:hover:bg-success-900/30 transition-colors min-h-[64px]"
            @click="callCustomer"
          >
            <Phone class="w-5 h-5 text-success-600 dark:text-success-400" aria-hidden="true" />
            <span class="text-xs font-medium text-success-700 dark:text-success-300">Gọi điện</span>
          </button>
          <button
            class="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors min-h-[64px]"
            @click="messageCustomer"
          >
            <MessageSquare class="w-5 h-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
            <span class="text-xs font-medium text-primary-700 dark:text-primary-300">Nhắn tin</span>
          </button>
          <button
            class="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-info-50 dark:bg-info-900/20 hover:bg-info-100 dark:hover:bg-info-900/30 transition-colors min-h-[64px]"
            @click="navigateToAddress"
          >
            <Navigation class="w-5 h-5 text-info-600 dark:text-info-400" aria-hidden="true" />
            <span class="text-xs font-medium text-info-700 dark:text-info-300">Chỉ đường</span>
          </button>
        </div>
      </div>

      <!-- Delivery address card -->
      <div class="card p-5 mb-4">
        <h2 class="font-semibold text-surface-foreground mb-3 flex items-center gap-2">
          <Home class="w-4 h-4 text-slate-400 dark:text-zinc-500" aria-hidden="true" />
          Địa chỉ giao hàng
        </h2>
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-xl bg-danger-50 dark:bg-danger-900/20 flex items-center justify-center flex-shrink-0">
            <MapPin class="w-5 h-5 text-danger-600 dark:text-danger-400" aria-hidden="true" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-surface-foreground leading-relaxed">{{ primaryAddress }}</p>
            <p class="text-xs text-slate-500 dark:text-zinc-400 mt-1">Địa chỉ giao mặc định</p>
          </div>
        </div>
      </div>

      <!-- Delivery notes card -->
      <div class="card p-5 mb-4">
        <h2 class="font-semibold text-surface-foreground mb-3 flex items-center gap-2">
          <FileText class="w-4 h-4 text-slate-400 dark:text-zinc-500" aria-hidden="true" />
          Ghi chú giao hàng
        </h2>
        <div class="space-y-2.5">
          <div class="flex items-start gap-2.5 p-3 rounded-xl bg-warning-50/50 dark:bg-warning-900/10">
            <Clock class="w-4 h-4 text-warning-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div class="flex-1">
              <p class="text-xs text-slate-500 dark:text-zinc-400">Khung giờ giao mong muốn</p>
              <p class="text-sm font-medium text-surface-foreground">{{ preferredTime }}</p>
            </div>
          </div>
          <div v-for="(note, i) in deliveryNotes" :key="i" class="flex items-start gap-2.5">
            <AlertCircle class="w-4 h-4 text-info-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p class="text-sm text-surface-foreground">{{ note }}</p>
          </div>
        </div>
      </div>

      <!-- Payment summary card -->
      <div class="card p-5 mb-4">
        <h2 class="font-semibold text-surface-foreground mb-4 flex items-center gap-2">
          <Wallet class="w-4 h-4 text-slate-400 dark:text-zinc-500" aria-hidden="true" />
          Tổng kết thanh toán
        </h2>
        <div class="grid grid-cols-3 gap-3 mb-4">
          <div class="text-center p-3 rounded-xl bg-surface-hover/50">
            <p class="text-xs text-slate-500 dark:text-zinc-400 mb-1">Tổng đơn</p>
            <p class="text-lg font-bold text-surface-foreground tabular-nums">{{ paymentSummary.totalOrders }}</p>
          </div>
          <div class="text-center p-3 rounded-xl bg-success-50 dark:bg-success-900/20">
            <p class="text-xs text-slate-500 dark:text-zinc-400 mb-1">Đã thanh toán</p>
            <p class="text-sm font-bold text-success-600 dark:text-success-400 tabular-nums truncate">{{ formatVND(paymentSummary.totalPaid) }}</p>
          </div>
          <div class="text-center p-3 rounded-xl" :class="paymentSummary.outstanding > 0 ? 'bg-danger-50 dark:bg-danger-900/20' : 'bg-surface-hover/50'">
            <p class="text-xs text-slate-500 dark:text-zinc-400 mb-1">Còn nợ</p>
            <p class="text-sm font-bold tabular-nums truncate" :class="paymentSummary.outstanding > 0 ? 'text-danger-600 dark:text-danger-400' : 'text-slate-400'">{{ formatVND(paymentSummary.outstanding) }}</p>
          </div>
        </div>
        <div class="flex items-center justify-between pt-3 border-t border-surface-border">
          <div class="flex items-center gap-2">
            <TrendingUp class="w-4 h-4 text-slate-400 dark:text-zinc-500" aria-hidden="true" />
            <span class="text-sm text-slate-500 dark:text-zinc-400">Tổng giá trị đơn hàng</span>
          </div>
          <span class="text-sm font-bold text-surface-foreground tabular-nums">{{ formatVND(paymentSummary.totalValue) }}</span>
        </div>
      </div>

      <!-- Order history card -->
      <div class="card p-5 mb-4">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold text-surface-foreground flex items-center gap-2">
            <Package class="w-4 h-4 text-slate-400 dark:text-zinc-500" aria-hidden="true" />
            Lịch sử đơn hàng
          </h2>
          <span class="text-xs text-slate-400 dark:text-zinc-500 tabular-nums">{{ customerStats.totalOrders }} đơn</span>
        </div>
        <template v-if="customerOrders.length">
          <div class="space-y-2">
            <div
              v-for="order in customerOrders"
              :key="order.id"
              class="flex items-center gap-3 p-3 rounded-xl bg-surface-hover/40 hover:bg-surface-hover cursor-pointer transition-colors"
              role="button"
              tabindex="0"
              @click="viewOrder(order.id)"
              @keydown.enter="viewOrder(order.id)"
            >
              <div :class="[
                'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                order.status === OrderStatus.DELIVERED
                  ? 'bg-success-50 dark:bg-success-900/20'
                  : order.status === OrderStatus.CANCELLED
                    ? 'bg-danger-50 dark:bg-danger-900/20'
                    : 'bg-primary-50 dark:bg-primary-900/20',
              ]">
                <CheckCircle2 v-if="order.status === OrderStatus.DELIVERED" class="w-4.5 h-4.5 text-success-600 dark:text-success-400" aria-hidden="true" />
                <Package v-else class="w-4.5 h-4.5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-surface-foreground font-mono">#{{ order.id.slice(0, 10) }}</p>
                <p class="text-xs text-slate-500 dark:text-zinc-400">{{ formatDate(order.created_at) }} · {{ formatVND(Number(order.total)) }}</p>
              </div>
              <AppBadge :color="ORDER_STATUS_COLORS[order.status]">{{ t(`orderStatus.${order.status}`) }}</AppBadge>
              <ChevronRight class="w-4 h-4 text-slate-300 dark:text-zinc-600 flex-shrink-0" aria-hidden="true" />
            </div>
          </div>
        </template>
        <div v-else class="py-8 text-center">
          <p class="text-sm text-slate-400 dark:text-zinc-500">Chưa có đơn hàng nào</p>
        </div>
      </div>

      <!-- Action buttons (sticky bottom area) -->
      <div class="grid grid-cols-2 gap-3 pb-6">
        <AppButton variant="outline" size="md" @click="messageCustomer">
          <MessageSquare class="w-4 h-4" aria-hidden="true" />
          Nhắn tin
        </AppButton>
        <AppButton variant="success" size="md" @click="callCustomer">
          <Phone class="w-4 h-4" aria-hidden="true" />
          Gọi điện
        </AppButton>
      </div>
    </template>

    <AppErrorState v-else message="Không tìm thấy thông tin khách hàng" @retry="load" />
  </div>
</template>
