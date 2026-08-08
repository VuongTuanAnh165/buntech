<script setup lang="ts">
import {
  Plus, Wallet, ShoppingBag, Clock, CheckCircle2, XCircle,
  TrendingUp, ArrowUpRight, Package, Truck, FileText,
  Store, ChevronRight, CreditCard,
} from 'lucide-vue-next'
import { OrderStatus, ORDER_STATUS_COLORS } from '../../core/enums'

const { t } = useI18n()
const { formatVND, formatDate } = useFormat()

useHead({ title: 'Khách hàng - BunTech' })
definePageMeta({ layout: 'default' })

const loading = ref(true)

const statusIcon: Record<string, unknown> = {
  PENDING: Clock,
  CONFIRMED: CheckCircle2,
  DELIVERED: CheckCircle2,
  CANCELLED: XCircle,
}

const customerProfile = computed(() => mockProfiles[0] || {
  id: 'cust-1',
  full_name: 'Nguyễn Văn An',
  phone: '0901234567',
  avatar_url: '',
  role: 'WHOLESALE_CUSTOMER',
})

const customerOrders = computed(() =>
  mockOrders
    .filter((o: any) => o.user_id === customerProfile.value?.id)
    .slice(0, 20)
)

const totalSpent = computed(() =>
  customerOrders.value.reduce((sum: number, o: any) => sum + Number(o.total || 0), 0)
)

const totalDebt = computed(() =>
  customerOrders.value.reduce((sum: number, o: any) => {
    const debt = Number(o.total || 0) - Number(o.amount_collected || 0)
    return sum + (debt > 0 ? debt : 0)
  }, 0)
)

const creditLimit = 10000000
const debtPercentage = computed(() => Math.min(100, (totalDebt.value / creditLimit) * 100))

const quickActions = [
  { icon: ShoppingBag, label: 'Đặt hàng', to: '/portal/order', color: 'primary' },
  { icon: FileText, label: 'Lịch sử đơn', to: '/portal', color: 'secondary' },
  { icon: CreditCard, label: 'Thanh toán', to: '/portal', color: 'success' },
  { icon: Store, label: 'Sản phẩm', to: '/products', color: 'warning' },
]

const colorMap: Record<string, { bg: string; text: string; ring: string }> = {
  primary: { bg: 'bg-primary-50 dark:bg-primary-900/20', text: 'text-primary-600 dark:text-primary-400', ring: 'ring-primary-100 dark:ring-primary-900/30' },
  secondary: { bg: 'bg-secondary-50 dark:bg-secondary-900/20', text: 'text-secondary-600 dark:text-secondary-400', ring: 'ring-secondary-100 dark:ring-secondary-900/30' },
  success: { bg: 'bg-success-50 dark:bg-success-900/20', text: 'text-success-600 dark:text-success-400', ring: 'ring-success-100 dark:ring-success-900/30' },
  warning: { bg: 'bg-warning-50 dark:bg-warning-900/20', text: 'text-warning-600 dark:text-warning-400', ring: 'ring-warning-100 dark:ring-warning-900/30' },
}

onMounted(() => {
  setTimeout(() => { loading.value = false }, 400)
})
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in-up">
      <div class="flex items-center gap-4">
        <AppAvatar :name="customerProfile?.full_name" :src="customerProfile?.avatar_url" size="lg" />
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h1 class="text-xl sm:text-2xl font-bold text-surface-foreground tracking-tight">{{ customerProfile?.full_name }}</h1>
            <AppBadge color="primary" :dot="true">Khách sỉ</AppBadge>
          </div>
          <p class="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">Xin chào, {{ customerProfile?.full_name?.split(' ').pop() }} 👋</p>
          <p class="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">{{ customerProfile?.phone }}</p>
        </div>
      </div>
      <NuxtLink to="/portal/order">
        <AppButton size="lg" class="group">
          <Plus class="w-4 h-4" aria-hidden="true" />
          Đặt hàng
          <ArrowUpRight class="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </AppButton>
      </NuxtLink>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <div class="card card-hover p-5 animate-fade-in-up relative overflow-hidden">
        <div class="kpi-accent bg-gradient-to-r from-primary-500 to-primary-400" />
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center ring-1 ring-primary-100 dark:ring-primary-900/30">
            <ShoppingBag class="w-5 h-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
          </div>
        </div>
        <p class="text-sm text-slate-500 dark:text-zinc-400 mb-1">Tổng đơn hàng</p>
        <p class="text-2xl font-bold text-surface-foreground tracking-tight tabular-nums">{{ customerOrders.length }}</p>
      </div>

      <div class="card card-hover p-5 animate-fade-in-up relative overflow-hidden" style="animation-delay: 60ms">
        <div class="kpi-accent bg-gradient-to-r from-success-500 to-success-400" />
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-xl bg-success-50 dark:bg-success-900/20 flex items-center justify-center ring-1 ring-success-100 dark:ring-success-900/30">
            <TrendingUp class="w-5 h-5 text-success-600 dark:text-success-400" aria-hidden="true" />
          </div>
        </div>
        <p class="text-sm text-slate-500 dark:text-zinc-400 mb-1">Tổng chi tiêu</p>
        <p class="text-2xl font-bold text-surface-foreground tracking-tight tabular-nums">{{ formatVND(totalSpent) }}</p>
      </div>

      <div class="card card-hover p-5 animate-fade-in-up relative overflow-hidden" style="animation-delay: 120ms">
        <div class="kpi-accent bg-gradient-to-r from-danger-500 to-danger-400" />
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-xl bg-danger-50 dark:bg-danger-900/20 flex items-center justify-center ring-1 ring-danger-100 dark:ring-danger-900/30">
            <Wallet class="w-5 h-5 text-danger-600 dark:text-danger-400" aria-hidden="true" />
          </div>
        </div>
        <p class="text-sm text-slate-500 dark:text-zinc-400 mb-1">Công nợ hiện tại</p>
        <p :class="['text-2xl font-bold tracking-tight tabular-nums', totalDebt > 0 ? 'text-danger-600 dark:text-danger-400' : 'text-success-600 dark:text-success-400']">{{ formatVND(totalDebt) }}</p>
      </div>
    </div>

    <!-- Debt card with progress bar -->
    <div v-if="totalDebt > 0" class="card p-5 mb-8 animate-fade-in-up">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <Wallet class="w-5 h-5 text-danger-600 dark:text-danger-400" aria-hidden="true" />
          <h3 class="font-semibold text-surface-foreground">Hạn mức công nợ</h3>
        </div>
        <span class="text-sm font-medium text-slate-500 dark:text-zinc-400">{{ formatVND(totalDebt) }} / {{ formatVND(creditLimit) }}</span>
      </div>
      <div class="h-2.5 bg-surface-hover rounded-full overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-700"
          :class="debtPercentage > 80 ? 'bg-gradient-to-r from-danger-500 to-danger-400' : debtPercentage > 50 ? 'bg-gradient-to-r from-warning-500 to-warning-400' : 'bg-gradient-to-r from-success-500 to-success-400'"
          :style="{ width: `${debtPercentage}%` }"
        />
      </div>
      <p class="text-xs text-slate-400 dark:text-zinc-500 mt-2">
        {{ debtPercentage > 80 ? 'Sắp đạt hạn mức — vui lòng thanh toán sớm' : `Còn ${formatVND(creditLimit - totalDebt)} hạn mức khả dụng` }}
      </p>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-4 gap-3 sm:gap-4 mb-8">
      <NuxtLink
        v-for="(action, i) in quickActions"
        :key="i"
        :to="action.to"
        class="card card-hover p-3 sm:p-4 text-center group animate-fade-in-up"
        :style="{ animationDelay: `${i * 50}ms` }"
      >
        <div :class="['w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300', colorMap[action.color].bg]">
          <component :is="action.icon" :class="['w-5 h-5 sm:w-6 sm:h-6', colorMap[action.color].text]" aria-hidden="true" />
        </div>
        <p class="text-xs sm:text-sm font-medium text-surface-foreground">{{ action.label }}</p>
      </NuxtLink>
    </div>

    <!-- Orders -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-surface-foreground tracking-tight">Lịch sử đơn hàng</h2>
      <span class="text-sm text-slate-400 dark:text-zinc-500">{{ customerOrders.length }} đơn</span>
    </div>

    <!-- Loading -->
    <template v-if="loading">
      <div v-for="i in 4" :key="i" class="card p-4 mb-3">
        <div class="flex items-center gap-3">
          <AppSkeleton height="h-10" width="w-10" class="rounded-xl" />
          <div class="flex-1">
            <AppSkeleton height="h-4" class="mb-2" />
            <AppSkeleton height="h-3" width="w-1/3" />
          </div>
          <AppSkeleton height="h-4" width="w-20" />
        </div>
      </div>
    </template>

    <!-- Orders list -->
    <template v-else-if="customerOrders.length">
      <div
        v-for="(order, i) in customerOrders"
        :key="order.id"
        class="card card-hover p-4 mb-3 animate-fade-in-up"
        :style="{ animationDelay: `${Math.min(i * 40, 300)}ms` }"
      >
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0 flex-1">
            <div :class="[
              'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
              ORDER_STATUS_COLORS[order.status as OrderStatus] === 'success' ? 'bg-success-50 dark:bg-success-900/20' :
              ORDER_STATUS_COLORS[order.status as OrderStatus] === 'warning' ? 'bg-warning-50 dark:bg-warning-900/20' :
              ORDER_STATUS_COLORS[order.status as OrderStatus] === 'danger' ? 'bg-danger-50 dark:bg-danger-900/20' :
              'bg-slate-100 dark:bg-zinc-800',
            ]">
              <component :is="statusIcon[order.status as string] || Clock" :class="[
                'w-5 h-5',
                ORDER_STATUS_COLORS[order.status as OrderStatus] === 'success' ? 'text-success-600 dark:text-success-400' :
                ORDER_STATUS_COLORS[order.status as OrderStatus] === 'warning' ? 'text-warning-600 dark:text-warning-400' :
                ORDER_STATUS_COLORS[order.status as OrderStatus] === 'danger' ? 'text-danger-600 dark:text-danger-400' :
                'text-slate-500 dark:text-zinc-400',
              ]" aria-hidden="true" />
            </div>
            <div class="min-w-0">
              <p class="font-mono text-xs text-slate-400 dark:text-zinc-500 mb-0.5">#{{ String(order.id).slice(0, 8) }}</p>
              <AppBadge :color="ORDER_STATUS_COLORS[order.status as OrderStatus]">{{ t(`orderStatus.${order.status}`) }}</AppBadge>
            </div>
          </div>
          <div class="text-right flex-shrink-0">
            <p class="font-bold text-surface-foreground tabular-nums">{{ formatVND(Number(order.total)) }}</p>
            <p class="text-xs text-slate-500 dark:text-zinc-400">{{ formatDate(order.created_at as string) }}</p>
          </div>
        </div>
      </div>
    </template>

    <AppEmptyState
      v-else
      title="Chưa có đơn hàng nào"
      description="Bắt đầu đặt hàng bún tươi ngay hôm nay!"
      cta-text="Đặt hàng ngay"
      @action="navigateTo('/portal/order')"
    />
  </div>
</template>
