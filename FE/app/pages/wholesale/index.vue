<script setup lang="ts">
import { customerService } from '~/services/customerService'
import { getOrderStatusColor, getOrderStatusLabel } from '~/utils/orderStatus'

import { t } from '~/utils/i18n'

const { constants } = useMasterData()
const authStore = useAuthStore()

useSeoMeta({ title: t('wholesale_seo_title') })
definePageMeta({ layout: 'default' })

const { data: dashboardData, pending: loading } = useAsyncData(
  'wholesale-dashboard',
  async () => {
    const [overviewRes, ordersRes] = await Promise.all([
      customerService.getDashboardOverview(),
      customerService.getOrders({ page: 1, limit: 5 })
    ])

    return {
      overview: overviewRes.data,
      recentOrders: ordersRes.data?.data || []
    }
  },
  { lazy: false }
)

const customerProfile = computed(() => authStore.user)
const overview = computed(() => dashboardData.value?.overview)
const recentOrders = computed(() => dashboardData.value?.recentOrders || [])

const totalSpent = computed(() => overview.value?.totalSpent || 0)
const totalDebt = computed(() => overview.value?.currentDebt || 0)
const creditLimit = computed(() => overview.value?.debtLimit || 1)
const debtPercentage = computed(() => Math.min(100, (totalDebt.value / creditLimit.value) * 100))
const totalOrders30Days = computed(() => overview.value?.totalOrders30Days || 0)

const quickActions = computed(() => [
  {
    icon: 'i-lucide-shopping-bag',
    label: t('wholesale_qa_order'),
    to: '/wholesale/order',
    color: 'primary'
  },
  {
    icon: 'i-lucide-file-text',
    label: t('wholesale_qa_history'),
    to: '/wholesale/orders',
    color: 'secondary'
  },
  {
    icon: 'i-lucide-credit-card',
    label: t('wholesale_qa_payment'),
    to: '/wholesale',
    color: 'success'
  },
  { icon: 'i-lucide-store', label: t('nav_products'), to: '/', color: 'warning' }
])

const colorMap: Record<string, string> = {
  primary:
    'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 ring-primary-100 dark:ring-primary-900/30',
  secondary:
    'text-secondary-600 dark:text-secondary-400 bg-secondary-50 dark:bg-secondary-900/20 ring-secondary-100 dark:ring-secondary-900/30',
  success:
    'text-success-600 dark:text-success-400 bg-success-50 dark:bg-success-900/20 ring-success-100 dark:ring-success-900/30',
  warning:
    'text-warning-600 dark:text-warning-400 bg-warning-50 dark:bg-warning-900/20 ring-warning-100 dark:ring-warning-900/30'
}

const tableColumns = computed(() => [
  { accessorKey: 'id', header: t('wholesale_col_id') },
  { accessorKey: 'createdAt', header: t('wholesale_col_date') },
  { accessorKey: 'status', header: t('status') },
  { accessorKey: 'totalAmount', header: t('wholesale_col_total') }
])
</script>
<template>
  <div class="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
    <!-- Header -->
    <div
      class="animate-fade-in-up mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
    >
      <div class="flex items-center gap-4">
        <UAvatar
          :alt="customerProfile?.fullName || 'User'"
          :src="getImageUrl(customerProfile?.profile?.avatarUrl || undefined) || undefined"
          size="lg"
        />
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <h1 class="text-surface-foreground text-xl font-bold tracking-tight sm:text-2xl">
              {{ customerProfile?.fullName || $t('wholesale_role_label') }}
            </h1>
            <UBadge color="primary" variant="subtle">{{ $t('wholesale_role_label') }}</UBadge>
          </div>
          <p class="mt-0.5 text-sm text-slate-500 dark:text-zinc-400">
            {{
              $t('wholesale_welcome', {
                name: customerProfile?.fullName?.split(' ').pop() || $t('wholesale_default_user')
              })
            }}
          </p>
          <p class="mt-0.5 text-xs text-slate-400 dark:text-zinc-500">
            {{ customerProfile?.phoneNumber || $t('wholesale_no_phone') }}
          </p>
        </div>
      </div>
      <UButton to="/wholesale/order" size="lg" icon="i-lucide-plus" class="group">
        {{ $t('wholesale_qa_order') }}
        <template #trailing>
          <UIcon
            name="i-lucide-arrow-up-right"
            class="h-4 w-4 transition-transform group-hover:translate-x-0.5"
          />
        </template>
      </UButton>
    </div>
    <!-- KPI Cards -->
    <div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div
        class="card card-hover animate-fade-in-up relative overflow-hidden p-5"
        style="animation-delay: 40ms"
      >
        <div
          class="bg-primary-500/10 pointer-events-none absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full blur-3xl"
        />
        <div class="relative mb-3 flex items-center gap-3">
          <div
            class="bg-primary-50 dark:bg-primary-900/20 ring-primary-100 dark:ring-primary-900/30 flex h-10 w-10 items-center justify-center rounded-xl ring-1"
          >
            <UIcon name="i-lucide-wallet" class="text-primary-600 dark:text-primary-400 h-5 w-5" />
          </div>
          <h2 class="text-surface-foreground text-sm font-semibold">
            {{ $t('wholesale_kpi_total_spent') }}
          </h2>
        </div>
        <p class="text-primary-600 dark:text-primary-400 relative text-2xl font-bold tabular-nums">
          {{ formatVND(totalSpent) }}
        </p>
        <p class="relative mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-zinc-400">
          <UIcon name="i-lucide-trending-up" class="text-success-500 h-3.5 w-3.5" />
          {{ $t('wholesale_kpi_all_time') }}
        </p>
      </div>
      <div
        class="card card-hover animate-fade-in-up relative overflow-hidden p-5"
        style="animation-delay: 80ms"
      >
        <div class="relative mb-3 flex items-center gap-3">
          <div
            class="bg-error-50 dark:bg-error-900/20 ring-error-100 dark:ring-error-900/30 flex h-10 w-10 items-center justify-center rounded-xl ring-1"
          >
            <UIcon name="i-lucide-credit-card" class="text-error-600 dark:text-error-400 h-5 w-5" />
          </div>
          <h2 class="text-surface-foreground text-sm font-semibold">
            {{ $t('admin_customer_debt_cur') }}
          </h2>
        </div>
        <p class="text-error-600 dark:text-error-400 relative text-2xl font-bold tabular-nums">
          {{ formatVND(totalDebt) }}
        </p>
        <div class="relative mt-2">
          <div class="mb-1 flex justify-between text-[10px] text-slate-500 dark:text-zinc-400">
            <span>{{
              creditLimit === 1
                ? $t('wholesale_kpi_debt_limit_empty')
                : $t('wholesale_kpi_debt_limit', { limit: formatVND(creditLimit) })
            }}</span>
            <span>{{ Math.round(debtPercentage) }}%</span>
          </div>
          <UProgress :value="debtPercentage" color="error" size="sm" />
        </div>
      </div>
      <div
        class="card card-hover animate-fade-in-up relative overflow-hidden p-5"
        style="animation-delay: 120ms"
      >
        <div class="relative mb-3 flex items-center gap-3">
          <div
            class="bg-info-50 dark:bg-info-900/20 ring-info-100 dark:ring-info-900/30 flex h-10 w-10 items-center justify-center rounded-xl ring-1"
          >
            <UIcon name="i-lucide-package" class="text-info-600 dark:text-info-400 h-5 w-5" />
          </div>
          <h2 class="text-surface-foreground text-sm font-semibold">{{ $t('nav_orders') }}</h2>
        </div>
        <div class="relative flex items-end gap-2">
          <p class="text-surface-foreground text-2xl font-bold tabular-nums">
            {{ totalOrders30Days }}
          </p>
          <p class="mb-1 text-sm text-slate-500 dark:text-zinc-400">
            {{ $t('wholesale_kpi_orders_unit') }}
          </p>
        </div>
        <p class="relative mt-1 text-xs text-slate-500 dark:text-zinc-400">
          {{ $t('wholesale_kpi_orders_30days') }}
        </p>
      </div>
    </div>
    <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div class="lg:col-span-2">
        <div
          class="animate-fade-in-up mb-4 flex items-center justify-between"
          style="animation-delay: 160ms"
        >
          <h2 class="text-surface-foreground text-lg font-bold">
            {{ $t('wholesale_recent_orders') }}
          </h2>
          <UButton
            variant="ghost"
            color="neutral"
            to="/wholesale/orders"
            trailing-icon="i-lucide-chevron-right"
            size="sm"
          >
            {{ $t('wholesale_view_all') }}
          </UButton>
        </div>
        <div class="card animate-fade-in-up overflow-hidden p-0" style="animation-delay: 200ms">
          <BaseDataTable
            :rows="recentOrders"
            :columns="tableColumns"
            :loading="loading"
            :empty-title="$t('wholesale_empty_orders_title')"
            :empty-description="$t('wholesale_empty_orders_desc')"
            empty-icon="i-lucide-package-open"
            class="w-full"
            :ui="{ th: 'bg-surface-muted' }"
          >
            <template #id-cell="{ row }">
              <span class="text-surface-foreground font-mono text-xs font-medium"
                >#{{ String(row.id).slice(0, 8) }}</span
              >
            </template>
            <template #createdAt-cell="{ row }">
              <span class="text-sm text-slate-500">{{ formatDateTime(row.createdAt) }}</span>
            </template>
            <template #status-cell="{ row }">
              <UBadge
                :color="getOrderStatusColor(constants)[row.status] as any"
                variant="subtle"
                size="sm"
              >
                {{ getOrderStatusLabel(constants)[row.status] }}
              </UBadge>
            </template>
            <template #totalAmount-cell="{ row }">
              <span class="text-surface-foreground font-semibold tabular-nums">{{
                formatVND(Number(row.totalAmount))
              }}</span>
            </template>
          </BaseDataTable>
        </div>
      </div>
      <div>
        <h2
          class="text-surface-foreground animate-fade-in-up mb-4 text-lg font-bold"
          style="animation-delay: 160ms"
        >
          {{ $t('wholesale_quick_actions') }}
        </h2>
        <div class="animate-fade-in-up grid grid-cols-2 gap-3" style="animation-delay: 200ms">
          <NuxtLink
            v-for="action in quickActions"
            :key="action.label"
            :to="action.to"
            class="card hover:bg-surface-hover group border-surface-border flex cursor-pointer flex-col items-center justify-center gap-2 border p-4 text-center shadow-sm transition-colors duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
          >
            <div
              :class="[
                'flex h-10 w-10 items-center justify-center rounded-xl ring-1 transition-transform group-hover:scale-110',
                colorMap[action.color]
              ]"
            >
              <UIcon :name="action.icon" class="h-5 w-5" />
            </div>
            <span
              class="text-surface-foreground group-hover:text-primary-600 dark:group-hover:text-primary-400 text-xs font-medium transition-colors"
            >
              {{ action.label }}
            </span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
