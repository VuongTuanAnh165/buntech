<script setup lang="ts">
import { OrderStatus, Role, UserStatus } from '~/utils/enums'
import { mockOrders, mockProfiles } from '~/utils/mockData'

definePageMeta({ layout: 'driver' })

const router = useRouter()
const route = useRoute()
const toast = useToast()
const { formatVND, formatDateTime } = useFormat()

const orderId = computed(() => route.params.id as string)
const loading = ref(true)
const delivered = ref(false)
const showCollectModal = ref(false)
const amountInput = ref('')
const submitting = ref(false)

const currentDriver = computed(() =>
  mockProfiles.find(p => p.role === Role.DRIVER && p.status === UserStatus.ACTIVE) || mockProfiles[2]
)

const order = computed(() => mockOrders.find(o => o.id === orderId.value) || null)
useSeoMeta({ title: `Chi tiết đơn giao - BunTech Driver` })

const orderItems = computed(() => order.value?.orderItems || [])
const remaining = computed(() => {
  if (!order.value) return 0
  return Math.max(0, order.value.total_amount - (order.value.amount_collected || 0))
})

const statusGradient = computed(() => {
  if (!order.value) return 'from-slate-700 to-slate-800'
  const s = order.value.status as OrderStatus
  if (s === OrderStatus.SHIPPING) return 'from-primary-600 to-indigo-700'
  if (s === OrderStatus.DELIVERED) return 'from-success-600 to-emerald-700'
  if (s === OrderStatus.CANCELLED) return 'from-error-600 to-rose-700'
  if (s === OrderStatus.PROCESSING) return 'from-warning-500 to-amber-600'
  return 'from-slate-700 to-slate-800'
})

const statusLabel: Record<string, string> = {
  SHIPPING: 'Đang giao hàng',
  PROCESSING: 'Đang xử lý',
  PENDING: 'Chờ giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
}

function callCustomer() {
  const phone = order.value?.customer?.phone
  if (phone) {
    toast.add({ title: `Đang gọi ${phone}`, color: 'success' })
  } else {
    toast.add({ title: 'Không có số điện thoại', color: 'error' })
  }
}

function navigateToAddress() {
  toast.add({ title: 'Mở bản đồ điều hướng...', color: 'success' })
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
    toast.add({ title: 'Đã xác nhận giao hàng thành công!', color: 'success' })
    setTimeout(() => navigateTo('/driver/delivery'), 2000)
  }, 1000)
}

onMounted(() => {
  setTimeout(() => {
    if (order.value) {
      amountInput.value = String(order.value.total_amount)
    }
    loading.value = false
  }, 500)
})
</script>

<template>
  <div class="p-4 pb-6">
    <!-- Back button -->
    <button
      class="flex items-center gap-1 text-sm text-slate-500 dark:text-zinc-400 hover:text-neutral-900 dark:hover:text-white mb-4 min-h-[44px] px-2 rounded-md transition-colors"
      @click="navigateTo('/driver/delivery')"
    >
      <UIcon name="i-lucide-arrow-left" class="w-4 h-4" /> Quay lại
    </button>

    <!-- Loading -->
    <template v-if="loading">
      <div class="skeleton h-48 w-full rounded-2xl mb-4" />
      <div class="skeleton h-32 w-full rounded-xl mb-4" />
      <div class="skeleton h-40 w-full rounded-xl mb-4" />
      <div class="skeleton h-24 w-full rounded-xl" />
    </template>

    <!-- Order not found -->
    <BaseEmptyState v-else-if="!order" title="Không tìm thấy đơn hàng" description="Đơn hàng không tồn tại hoặc đã bị xóa." />

    <!-- Delivered success state -->
    <template v-else-if="delivered">
      <div class="card p-12 text-center">
        <div class="w-20 h-20 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center mx-auto mb-4 animate-scale-in">
          <UIcon name="i-lucide-check-circle-2" class="w-10 h-10 text-success-600 dark:text-success-400" />
        </div>
        <h2 class="text-xl font-bold text-neutral-900 dark:text-white mb-2">Giao hàng thành công!</h2>
        <p class="text-sm text-slate-500 dark:text-zinc-400 mb-4">Đơn #{{ order.id }} đã được xác nhận giao thành công.</p>
        <p class="text-sm text-slate-400 dark:text-zinc-500">Đang chuyển về danh sách tuyến giao...</p>
      </div>
    </template>

    <!-- Order detail -->
    <template v-else>
      <!-- Status hero card -->
      <div :class="['bg-gradient-to-br rounded-2xl p-5 mb-4 text-white relative overflow-hidden', statusGradient]">
        <div class="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 blur-3xl" />
        <div class="relative">
          <div class="flex items-start justify-between mb-3">
            <div>
              <p class="text-xs text-white/70 font-mono">#{{ order.id }}</p>
              <h2 class="text-xl font-bold mt-0.5">{{ statusLabel[order.status] || order.status }}</h2>
            </div>
            <div class="w-12 h-12 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
              <UIcon name="i-lucide-package" class="w-6 h-6 text-white" />
            </div>
          </div>
          <div class="flex items-center gap-4 text-sm text-white/90">
            <div class="flex items-center gap-1.5">
              <UIcon name="i-lucide-clock" class="w-4 h-4" />
              <span>{{ formatDateTime(order.created_at) }}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <UIcon name="i-lucide-truck" class="w-4 h-4" />
              <span>{{ orderItems.length }} sản phẩm</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Customer info card -->
      <div class="card p-5 mb-4">
        <h2 class="font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
          <UIcon name="i-lucide-user" class="w-4 h-4 text-slate-400 dark:text-zinc-500" />
          Thông tin khách hàng
        </h2>
        <div class="flex items-center gap-3 mb-4">
          <UAvatar :alt="order.customer_name || 'Khách'" size="md" />
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-neutral-900 dark:text-white">{{ order.customer_name || 'Khách vãng lai' }}</p>
            <p class="text-sm text-slate-500 dark:text-zinc-400 tabular-nums">{{ order.customer?.phone || 'Chưa có SĐT' }}</p>
          </div>
          <button
            class="w-10 h-10 rounded-xl bg-success-50 dark:bg-success-900/20 flex items-center justify-center hover:bg-success-100 dark:hover:bg-success-900/30 transition-colors min-w-[44px] min-h-[44px]"
            @click="callCustomer"
          >
            <UIcon name="i-lucide-phone" class="w-5 h-5 text-success-600 dark:text-success-400" />
          </button>
        </div>
        <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
          <UIcon name="i-lucide-star" class="w-3.5 h-3.5 fill-warning-400 text-warning-400" />
          <span class="font-medium text-warning-600 dark:text-warning-400">4.8</span>
          <span class="text-slate-300 dark:text-zinc-600">·</span>
          <span>Khách hàng thân thiết</span>
        </div>
      </div>

      <!-- Delivery address card -->
      <div class="card p-5 mb-4">
        <div class="flex items-center justify-between mb-3">
          <h2 class="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
            <UIcon name="i-lucide-map-pin" class="w-4 h-4 text-slate-400 dark:text-zinc-500" />
            Địa chỉ giao hàng
          </h2>
          <button
            class="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline"
            @click="navigateToAddress"
          >
            <UIcon name="i-lucide-navigation" class="w-3.5 h-3.5" />
            Chỉ đường
          </button>
        </div>
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-xl bg-error-50 dark:bg-error-900/20 flex items-center justify-center flex-shrink-0">
            <UIcon name="i-lucide-map-pin" class="w-5 h-5 text-error-600 dark:text-error-400" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-neutral-900 dark:text-white leading-relaxed">{{ order.shipping_address }}</p>
            <p v-if="order.note" class="text-xs text-warning-600 dark:text-warning-400 mt-2 flex items-center gap-1">
              <UIcon name="i-lucide-clock" class="w-3 h-3" />
              {{ order.note }}
            </p>
          </div>
        </div>
      </div>

      <!-- Order items list -->
      <div class="card p-5 mb-4">
        <h2 class="font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
          <UIcon name="i-lucide-package" class="w-4 h-4 text-slate-400 dark:text-zinc-500" />
          Danh sách sản phẩm
        </h2>
        <div class="space-y-3">
          <div
            v-for="item in orderItems"
            :key="item.id"
            class="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-zinc-800/50"
          >
            <div class="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
              <UIcon name="i-lucide-package" class="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-neutral-900 dark:text-white">{{ item.product?.name || 'Sản phẩm' }}</p>
              <p class="text-xs text-slate-500 dark:text-zinc-400">x{{ item.quantity }} · {{ formatVND(item.price) }}</p>
            </div>
            <p class="text-sm font-semibold text-neutral-900 dark:text-white tabular-nums">{{ formatVND(item.quantity * item.price) }}</p>
          </div>
        </div>
      </div>

      <!-- Payment summary -->
      <div class="card p-5 mb-4">
        <h2 class="font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
          <UIcon name="i-lucide-wallet" class="w-4 h-4 text-slate-400 dark:text-zinc-500" />
          Thanh toán
        </h2>
        <div class="space-y-3">
          <div class="flex items-center justify-between text-sm">
            <span class="text-slate-500 dark:text-zinc-400">Tổng giá trị đơn</span>
            <span class="font-semibold text-neutral-900 dark:text-white tabular-nums">{{ formatVND(order.total_amount) }}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-slate-500 dark:text-zinc-400">Đã thu</span>
            <span class="font-semibold text-success-600 dark:text-success-400 tabular-nums">{{ formatVND(order.amount_collected || 0) }}</span>
          </div>
          <div class="flex items-center justify-between text-sm pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <span class="font-medium text-neutral-900 dark:text-white">Còn phải thu</span>
            <span class="text-lg font-bold text-error-600 dark:text-error-400 tabular-nums">{{ formatVND(remaining) }}</span>
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="grid grid-cols-2 gap-3 pb-4">
        <UButton variant="outline" size="lg" block @click="openCollectModal">
          <UIcon name="i-lucide-wallet" class="w-4 h-4 mr-1" />
          Thu tiền
        </UButton>
        <UButton color="success" size="lg" block :loading="submitting" @click="confirmDelivery">
          <UIcon name="i-lucide-check-circle-2" class="w-4 h-4 mr-1" />
          Xác nhận giao
        </UButton>
      </div>
    </template>

    <!-- Collect amount modal -->
    <UModal v-model:open="showCollectModal">
      <template #content>
        <div class="p-6 space-y-4">
          <h3 class="text-lg font-bold text-neutral-900 dark:text-white">Thu tiền từ khách</h3>
          <div>
            <label class="text-sm font-medium text-slate-500 dark:text-zinc-400 block mb-1">Số tiền cần thu</label>
            <p class="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-3 tabular-nums">{{ formatVND(remaining) }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-slate-500 dark:text-zinc-400 block mb-1">Số tiền khách đưa</label>
            <UInput v-model="amountInput" type="text" inputmode="numeric" placeholder="Nhập số tiền" size="lg" />
          </div>
          <div class="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-zinc-800/50">
            <span class="text-sm text-slate-500 dark:text-zinc-400">Tiền thối lại</span>
            <span class="font-semibold text-neutral-900 dark:text-white tabular-nums">{{ formatVND(Math.max(0, Number(amountInput) - remaining)) }}</span>
          </div>
          <UButton color="primary" size="lg" block :loading="submitting" @click="confirmDelivery">
            Xác nhận đã thu
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
