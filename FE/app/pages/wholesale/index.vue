<script setup lang="ts">
import { mockProfiles, mockOrders } from '~/utils/mockData'

const { formatVND } = useFormat()

useSeoMeta({ title: 'Khách hàng - BunTech' })
definePageMeta({ layout: 'default' })

const loading = ref(true)

const customerProfile = computed(() => mockProfiles[0] || {
  id: 'cust-1',
  full_name: 'Nguyễn Văn An',
  phone: '0901234567',
  avatar_url: '',
  role: 'WHOLESALE_CUSTOMER',
})

const customerOrders = computed(() =>
  mockOrders
    .filter((o) => o.user_id === customerProfile.value?.id)
    .slice(0, 20)
)

const totalSpent = computed(() =>
  customerOrders.value.reduce((sum, o) => sum + Number(o.total || 0), 0)
)

const totalDebt = computed(() =>
  customerOrders.value.reduce((sum, o) => {
    const debt = Number(o.total || 0) - Number(o.amount_collected || 0)
    return sum + (debt > 0 ? debt : 0)
  }, 0)
)

const creditLimit = 10000000
const debtPercentage = computed(() => Math.min(100, (totalDebt.value / creditLimit) * 100))

const quickActions = [
  { icon: 'i-lucide-shopping-bag', label: 'Đặt hàng', to: '/wholesale/order', color: 'primary' },
  { icon: 'i-lucide-file-text', label: 'Lịch sử đơn', to: '/wholesale', color: 'secondary' },
  { icon: 'i-lucide-credit-card', label: 'Thanh toán', to: '/wholesale', color: 'success' },
  { icon: 'i-lucide-store', label: 'Sản phẩm', to: '/', color: 'warning' },
]

onMounted(() => {
  setTimeout(() => { loading.value = false }, 400)
})

const colorMap: Record<string, string> = {
  primary: 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 ring-primary-100 dark:ring-primary-900/30',
  secondary: 'text-secondary-600 dark:text-secondary-400 bg-secondary-50 dark:bg-secondary-900/20 ring-secondary-100 dark:ring-secondary-900/30',
  success: 'text-success-600 dark:text-success-400 bg-success-50 dark:bg-success-900/20 ring-success-100 dark:ring-success-900/30',
  warning: 'text-warning-600 dark:text-warning-400 bg-warning-50 dark:bg-warning-900/20 ring-warning-100 dark:ring-warning-900/30',
}

const tableColumns = [
  { accessorKey: 'id', header: 'Mã đơn' },
  { accessorKey: 'created_at', header: 'Ngày đặt' },
  { accessorKey: 'status', header: 'Trạng thái' },
  { accessorKey: 'total', header: 'Tổng tiền' },
]

import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '~/utils/orderStatus'
const { formatDateTime } = useFormat()
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in-up">
      <div class="flex items-center gap-4">
        <UAvatar :alt="customerProfile?.full_name" :src="customerProfile?.avatar_url" size="lg" />
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h1 class="text-xl sm:text-2xl font-bold text-surface-foreground tracking-tight">{{ customerProfile?.full_name }}</h1>
            <UBadge color="primary" variant="subtle">Khách sỉ</UBadge>
          </div>
          <p class="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">Xin chào, {{ customerProfile?.full_name?.split(' ').pop() }} 👋</p>
          <p class="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">{{ customerProfile?.phone }}</p>
        </div>
      </div>
      <UButton to="/wholesale/order" size="lg" icon="i-lucide-plus" class="group">
        Đặt hàng
        <template #trailing>
          <UIcon name="i-lucide-arrow-up-right" class="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </template>
      </UButton>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <div class="card card-hover p-5 animate-fade-in-up relative overflow-hidden" style="animation-delay: 40ms">
        <div class="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
        <div class="flex items-center gap-3 mb-3 relative">
          <div class="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center ring-1 ring-primary-100 dark:ring-primary-900/30">
            <UIcon name="i-lucide-wallet" class="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 class="text-sm font-semibold text-surface-foreground">Tổng chi tiêu</h2>
        </div>
        <p class="text-2xl font-bold text-primary-600 dark:text-primary-400 tabular-nums relative">{{ formatVND(totalSpent) }}</p>
        <p class="text-xs text-slate-500 dark:text-zinc-400 mt-1 relative flex items-center gap-1">
          <UIcon name="i-lucide-trending-up" class="w-3.5 h-3.5 text-success-500" /> Từ trước đến nay
        </p>
      </div>

      <div class="card card-hover p-5 animate-fade-in-up relative overflow-hidden" style="animation-delay: 80ms">
        <div class="flex items-center gap-3 mb-3 relative">
          <div class="w-10 h-10 rounded-xl bg-error-50 dark:bg-error-900/20 flex items-center justify-center ring-1 ring-error-100 dark:ring-error-900/30">
            <UIcon name="i-lucide-credit-card" class="w-5 h-5 text-error-600 dark:text-error-400" />
          </div>
          <h2 class="text-sm font-semibold text-surface-foreground">Công nợ hiện tại</h2>
        </div>
        <p class="text-2xl font-bold text-error-600 dark:text-error-400 tabular-nums relative">{{ formatVND(totalDebt) }}</p>
        <div class="mt-2 relative">
          <div class="flex justify-between text-[10px] text-slate-500 dark:text-zinc-400 mb-1">
            <span>Hạn mức: {{ formatVND(creditLimit) }}</span>
            <span>{{ Math.round(debtPercentage) }}%</span>
          </div>
          <UProgress :value="debtPercentage" color="error" size="sm" />
        </div>
      </div>

      <div class="card card-hover p-5 animate-fade-in-up relative overflow-hidden" style="animation-delay: 120ms">
        <div class="flex items-center gap-3 mb-3 relative">
          <div class="w-10 h-10 rounded-xl bg-info-50 dark:bg-info-900/20 flex items-center justify-center ring-1 ring-info-100 dark:ring-info-900/30">
            <UIcon name="i-lucide-package" class="w-5 h-5 text-info-600 dark:text-info-400" />
          </div>
          <h2 class="text-sm font-semibold text-surface-foreground">Đơn hàng</h2>
        </div>
        <div class="flex items-end gap-2 relative">
          <p class="text-2xl font-bold text-surface-foreground tabular-nums">{{ customerOrders.length }}</p>
          <p class="text-sm text-slate-500 dark:text-zinc-400 mb-1">đơn đã đặt</p>
        </div>
        <p class="text-xs text-slate-500 dark:text-zinc-400 mt-1 relative">Trong 30 ngày qua</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <div class="flex items-center justify-between mb-4 animate-fade-in-up" style="animation-delay: 160ms">
          <h2 class="text-lg font-bold text-surface-foreground">Đơn hàng gần đây</h2>
          <UButton variant="ghost" color="neutral" to="/wholesale" trailing-icon="i-lucide-chevron-right" size="sm">
            Xem tất cả
          </UButton>
        </div>

        <div class="card p-0 overflow-hidden animate-fade-in-up" style="animation-delay: 200ms">
          <BaseEmptyState v-if="!loading && customerOrders.length === 0" title="Chưa có đơn hàng" description="Bạn chưa đặt đơn hàng nào." />
          <UTable
            v-else
            :data="customerOrders.slice(0, 5)"
            :columns="tableColumns"
            :loading="loading"
            class="w-full"
            :ui="{ th: 'bg-surface-muted' }"
          >
            <template #id-cell="{ row }">
              <span class="font-mono text-xs font-medium text-surface-foreground">#{{ String(row.id).slice(0, 8) }}</span>
            </template>
            <template #created_at-cell="{ row }">
              <span class="text-sm text-slate-500">{{ formatDateTime(row.created_at) }}</span>
            </template>
            <template #status-cell="{ row }">
              <UBadge :color="ORDER_STATUS_COLORS[row.status]" variant="subtle" size="sm">
                {{ ORDER_STATUS_LABELS[row.status] }}
              </UBadge>
            </template>
            <template #total-cell="{ row }">
              <span class="font-semibold text-surface-foreground tabular-nums">{{ formatVND(Number(row.total)) }}</span>
            </template>
          </UTable>
        </div>
      </div>

      <div>
        <h2 class="text-lg font-bold text-surface-foreground mb-4 animate-fade-in-up" style="animation-delay: 160ms">Thao tác nhanh</h2>
        <div class="grid grid-cols-2 gap-3 animate-fade-in-up" style="animation-delay: 200ms">
          <NuxtLink
            v-for="action in quickActions"
            :key="action.label"
            :to="action.to"
            class="card p-4 flex flex-col items-center justify-center text-center gap-2 hover:bg-surface-hover transition-colors group cursor-pointer border border-surface-border shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 duration-200"
          >
            <div :class="['w-10 h-10 rounded-xl flex items-center justify-center ring-1 transition-transform group-hover:scale-110', colorMap[action.color]]">
              <UIcon :name="action.icon" class="w-5 h-5" />
            </div>
            <span class="text-xs font-medium text-surface-foreground group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {{ action.label }}
            </span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
