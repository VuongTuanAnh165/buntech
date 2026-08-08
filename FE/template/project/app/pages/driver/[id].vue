<script setup lang="ts">
import {
  ArrowLeft, MapPin, Phone, User, Wallet, CheckCircle2, Package,
  Navigation, Clock, Star, ChevronRight, Truck,
} from 'lucide-vue-next'
import { OrderStatus, ORDER_STATUS_COLORS, Role, UserStatus } from '../../core/enums'
import { mockOrders, mockProfiles } from '../../core/mock/data'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const { formatVND, formatDateTime } = useFormat()
const toast = useToast()

useHead({ title: 'Chi tiết đơn giao - BunTech Driver' })
definePageMeta({ layout: 'driver' })

const orderId = computed(() => route.params.id as string)
const loading = ref(true)
const delivered = ref(false)
const showCollectModal = ref(false)
const amountInput = ref('')
const submitting = ref(false)

// Current driver
const currentDriver = computed(() => {
  return mockProfiles.find(p => p.role === Role.DRIVER && p.status === UserStatus.ACTIVE) || mockProfiles[2]
})

// Find order by route param id
const order = computed(() => {
  return mockOrders.find(o => o.id === orderId.value) || null
})

// Order items
const orderItems = computed(() => {
  return order.value?.order_items || []
})

// Payment summary
const remaining = computed(() => {
  if (!order.value) return 0
  return Math.max(0, Number(order.value.total) - Number(order.value.amount_collected))
})

// Status gradient classes
const statusGradient = computed(() => {
  if (!order.value) return 'from-slate-700 to-slate-800'
  const status = order.value.status as OrderStatus
  if (status === OrderStatus.SHIPPING) return 'from-primary-600 to-indigo-700'
  if (status === OrderStatus.DELIVERED) return 'from-success-600 to-emerald-700'
  if (status === OrderStatus.CANCELLED) return 'from-danger-600 to-rose-700'
  if (status === OrderStatus.PROCESSING) return 'from-warning-500 to-amber-600'
  return 'from-slate-700 to-slate-800'
})

function load() {
  loading.value = true
  setTimeout(() => {
    if (order.value) {
      amountInput.value = String(Number(order.value.total))
    }
    loading.value = false
  }, 500)
}

function callCustomer() {
  const phone = order.value?.user?.phone || order.value?.guest_info?.phone
  if (phone) {
    toast.success(`Đang gọi ${phone}`)
    window.location.href = `tel:${phone}`
  } else {
    toast.error('Không có số điện thoại')
  }
}

function navigateToAddress() {
  toast.success('Mở bản đồ điều hướng...')
}

function openCollectModal() {
  showCollectModal.value = true
}

function confirmDelivery() {
  if (submitting.value) return
  submitting.value = true
  setTimeout(() => {
    submitting.value = false
    delivered.value = true
    showCollectModal.value = false
    toast.success('Đã xác nhận giao hàng thành công!')
    setTimeout(() => router.push('/driver'), 2000)
  }, 1000)
}

onMounted(load)
</script>

<template>
  <div class="p-4 pb-6">
    <!-- Back button -->
    <button
      class="flex items-center gap-1 text-sm text-slate-500 dark:text-zinc-400 hover:text-surface-foreground mb-4 min-h-[44px] px-2 rounded-md transition-colors"
      aria-label="Quay lại"
      @click="router.push('/driver')"
    >
      <ArrowLeft class="w-4 h-4" aria-hidden="true" /> Quay lại
    </button>

    <!-- Loading -->
    <template v-if="loading">
      <div class="skeleton h-48 w-full rounded-2xl mb-4" />
      <div class="skeleton h-32 w-full rounded-xl mb-4" />
      <div class="skeleton h-40 w-full rounded-xl mb-4" />
      <div class="skeleton h-24 w-full rounded-xl" />
    </template>

    <!-- Order not found -->
    <AppErrorState v-else-if="!order" message="Không tìm thấy đơn hàng" @retry="router.push('/driver')" />

    <!-- Delivered success state -->
    <template v-else-if="delivered">
      <div class="card p-12 text-center">
        <div class="w-20 h-20 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center mx-auto mb-4 animate-scale-in">
          <CheckCircle2 class="w-10 h-10 text-success-600 dark:text-success-400" aria-hidden="true" />
        </div>
        <h2 class="text-xl font-bold text-surface-foreground mb-2">Giao hàng thành công!</h2>
        <p class="text-sm text-slate-500 dark:text-zinc-400 mb-4">Đơn #{{ order.id.slice(0, 8) }} đã được xác nhận giao thành công.</p>
        <p class="text-sm text-slate-400 dark:text-zinc-500">Đang chuyển về danh sách tuyến giao...</p>
      </div>
    </template>

    <!-- Order detail -->
    <template v-else>
      <!-- Status hero card -->
      <div
        :class="['bg-gradient-to-br rounded-2xl p-5 mb-4 text-white relative overflow-hidden', statusGradient]"
      >
        <div class="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
        <div class="relative">
          <div class="flex items-start justify-between mb-3">
            <div>
              <p class="text-xs text-white/70 font-mono">#{{ order.id.slice(0, 10) }}</p>
              <h2 class="text-xl font-bold mt-0.5">{{ t(`orderStatus.${order.status}`) }}</h2>
            </div>
            <div class="w-12 h-12 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
              <Package class="w-6 h-6 text-white" aria-hidden="true" />
            </div>
          </div>
          <div class="flex items-center gap-4 text-sm text-white/90">
            <div class="flex items-center gap-1.5">
              <Clock class="w-4 h-4" aria-hidden="true" />
              <span>{{ formatDateTime(order.created_at) }}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <Truck class="w-4 h-4" aria-hidden="true" />
              <span>{{ order.order_items?.length || 0 }} sản phẩm</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Customer info card -->
      <div class="card p-5 mb-4">
        <h2 class="font-semibold text-surface-foreground mb-4 flex items-center gap-2">
          <User class="w-4 h-4 text-slate-400 dark:text-zinc-500" aria-hidden="true" />
          Thông tin khách hàng
        </h2>
        <div class="flex items-center gap-3 mb-4">
          <AppAvatar :name="order.user?.full_name || 'Khách vãng lai'" :src="order.user?.avatar_url" size="md" />
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-surface-foreground">{{ order.user?.full_name || 'Khách vãng lai' }}</p>
            <p class="text-sm text-slate-500 dark:text-zinc-400 tabular-nums">{{ order.user?.phone || order.guest_info?.phone || 'Chưa có SĐT' }}</p>
          </div>
          <button
            class="w-10 h-10 rounded-xl bg-success-50 dark:bg-success-900/20 flex items-center justify-center hover:bg-success-100 dark:hover:bg-success-900/30 transition-colors min-w-[44px] min-h-[44px]"
            aria-label="Gọi điện"
            @click="callCustomer"
          >
            <Phone class="w-5 h-5 text-success-600 dark:text-success-400" aria-hidden="true" />
          </button>
        </div>
        <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
          <Star class="w-3.5 h-3.5 fill-warning-400 text-warning-400" aria-hidden="true" />
          <span class="font-medium text-warning-600 dark:text-warning-400">4.8</span>
          <span class="text-slate-300 dark:text-zinc-600">·</span>
          <span>Khách hàng thân thiết</span>
        </div>
      </div>

      <!-- Delivery address card -->
      <div class="card p-5 mb-4">
        <div class="flex items-center justify-between mb-3">
          <h2 class="font-semibold text-surface-foreground flex items-center gap-2">
            <MapPin class="w-4 h-4 text-slate-400 dark:text-zinc-500" aria-hidden="true" />
            Địa chỉ giao hàng
          </h2>
          <button
            class="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline"
            @click="navigateToAddress"
          >
            <Navigation class="w-3.5 h-3.5" aria-hidden="true" />
            Chỉ đường
          </button>
        </div>
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-xl bg-danger-50 dark:bg-danger-900/20 flex items-center justify-center flex-shrink-0">
            <MapPin class="w-5 h-5 text-danger-600 dark:text-danger-400" aria-hidden="true" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-surface-foreground leading-relaxed">{{ order.shipping_address }}</p>
            <p v-if="order.note" class="text-xs text-warning-600 dark:text-warning-400 mt-2 flex items-center gap-1">
              <Clock class="w-3 h-3" aria-hidden="true" />
              {{ order.note }}
            </p>
          </div>
        </div>
      </div>

      <!-- Order items list -->
      <div class="card p-5 mb-4">
        <h2 class="font-semibold text-surface-foreground mb-4 flex items-center gap-2">
          <Package class="w-4 h-4 text-slate-400 dark:text-zinc-500" aria-hidden="true" />
          Danh sách sản phẩm
        </h2>
        <div class="space-y-3">
          <div
            v-for="item in orderItems"
            :key="item.id"
            class="flex items-center gap-3 p-3 rounded-xl bg-surface-hover/40"
          >
            <div class="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
              <Package class="w-5 h-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-surface-foreground">{{ item.product_name }}</p>
              <p class="text-xs text-slate-500 dark:text-zinc-400">x{{ item.quantity }} · {{ formatVND(Number(item.price)) }}</p>
            </div>
            <p class="text-sm font-semibold text-surface-foreground tabular-nums">{{ formatVND(Number(item.quantity) * Number(item.price)) }}</p>
          </div>
        </div>
      </div>

      <!-- Payment summary -->
      <div class="card p-5 mb-4">
        <h2 class="font-semibold text-surface-foreground mb-4 flex items-center gap-2">
          <Wallet class="w-4 h-4 text-slate-400 dark:text-zinc-500" aria-hidden="true" />
          Thanh toán
        </h2>
        <div class="space-y-3">
          <div class="flex items-center justify-between text-sm">
            <span class="text-slate-500 dark:text-zinc-400">Tổng giá trị đơn</span>
            <span class="font-semibold text-surface-foreground tabular-nums">{{ formatVND(Number(order.total)) }}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-slate-500 dark:text-zinc-400">Đã thu</span>
            <span class="font-semibold text-success-600 dark:text-success-400 tabular-nums">{{ formatVND(Number(order.amount_collected)) }}</span>
          </div>
          <div class="flex items-center justify-between text-sm pt-3 border-t border-surface-border">
            <span class="font-medium text-surface-foreground">Còn phải thu</span>
            <span class="text-lg font-bold text-danger-600 dark:text-danger-400 tabular-nums">{{ formatVND(remaining) }}</span>
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="grid grid-cols-2 gap-3 pb-4">
        <AppButton variant="outline" size="lg" @click="openCollectModal">
          <Wallet class="w-4 h-4" aria-hidden="true" />
          Thu tiền
        </AppButton>
        <AppButton variant="success" size="lg" @click="confirmDelivery" :loading="submitting">
          <CheckCircle2 class="w-4 h-4" aria-hidden="true" />
          Xác nhận giao
        </AppButton>
      </div>
    </template>

    <!-- Collect amount modal -->
    <AppModal v-model="showCollectModal" title="Thu tiền từ khách" mobile-sheet>
      <div class="space-y-4">
        <div>
          <label class="form-label">Số tiền cần thu</label>
          <p class="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-3 tabular-nums">{{ formatVND(remaining) }}</p>
        </div>
        <div>
          <label class="form-label">Số tiền khách đưa</label>
          <input
            v-model="amountInput"
            type="text"
            inputmode="numeric"
            class="form-input"
            placeholder="Nhập số tiền"
          />
        </div>
        <div class="flex items-center justify-between p-3 rounded-xl bg-surface-hover/50">
          <span class="text-sm text-slate-500 dark:text-zinc-400">Tiền thối lại</span>
          <span class="font-semibold text-surface-foreground tabular-nums">{{ formatVND(Math.max(0, Number(amountInput) - remaining)) }}</span>
        </div>
        <AppButton variant="primary" size="lg" block @click="confirmDelivery" :loading="submitting">
          Xác nhận đã thu
        </AppButton>
      </div>
    </AppModal>
  </div>
</template>
