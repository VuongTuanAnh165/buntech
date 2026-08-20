<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useDriverHistory } from '~/composables/driver/useDriverHistory'
import type { DriverRouteDTO } from '~/services/driverService'
import { ConstantKey } from '~/enums/constantKeys'
import { t } from '~/utils/i18n'

const { constants } = useMasterData()
definePageMeta({ layout: 'driver' })
useSeoMeta({ title: t('driver_profile_seo_title') })
const _router = useRouter()
const toast = useToast()
const loading = ref(true)

const authStore = useAuthStore()
const { history } = useDriverHistory()

const driver = computed(() => authStore.user)

const driverOrders = computed(() => {
  return history.value
})
const stats = computed(() => {
  const orders = driverOrders.value
  const delivered = orders.filter(
    (o: DriverRouteDTO) => o.status === constants.value?.[ConstantKey.OrderStatus]?.DELIVERED
  )
  const totalEarnings = delivered.reduce(
    (sum: number, o: DriverRouteDTO) => sum + Math.round((Number(o.totalAmount) || 0) * 0.03),
    0
  )
  const successRate = orders.length ? Math.round((delivered.length / orders.length) * 100) : 0
  return { totalDeliveries: delivered.length, successRate, totalEarnings, rating: 4.8 }
})
// Weekly delivery chart
const weeklyData = computed(() => {
  const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
  const today = new Date()
  const todayIdx = (today.getDay() + 6) % 7
  const counts = [5, 7, 4, 8, 6, 9, 3]
  return days.map((day, i) => {
    const isPast = i <= todayIdx
    return { day, count: isPast ? counts[i] || 0 : 0, isToday: i === todayIdx }
  })
})
const stableWeekly = ref<{ day: string; count: number; isToday: boolean }[]>([])
const maxWeekly = computed(() => Math.max(...stableWeekly.value.map((d) => d.count), 1))
// Recent activity timeline
const recentActivity = computed(() =>
  driverOrders.value.slice(0, 6).map((o: DriverRouteDTO) => ({
    id: o.id,
    type:
      o.status === constants.value?.[ConstantKey.OrderStatus]?.DELIVERED
        ? 'delivered'
        : o.status === constants.value?.[ConstantKey.OrderStatus]?.CANCELLED
          ? 'cancelled'
          : 'shipping',
    label:
      o.status === constants.value?.[ConstantKey.OrderStatus]?.DELIVERED
        ? t('driver_profile_activity_delivered', { id: o.id })
        : o.status === constants.value?.[ConstantKey.OrderStatus]?.CANCELLED
          ? t('driver_profile_activity_cancelled', { id: o.id })
          : t('driver_profile_activity_shipping', { id: o.id }),
    customer: o.user?.fullName || t('driver_history_guest'),
    address: o.shippingAddress?.addressLine || '',
    amount: Number(o.amountCollected) || 0,
    time: o.createdAt
  }))
)
function copyPhone() {
  if (driver.value?.phoneNumber) {
    navigator.clipboard
      ?.writeText(driver.value.phoneNumber)
      .then(() => toast.add({ title: t('driver_profile_msg_copy_success'), color: 'success' }))
      .catch(() => toast.add({ title: t('driver_profile_msg_copy_err'), color: 'error' }))
  }
}
function handleLogout() {
  navigateTo('/auth/login')
}
onMounted(() => {
  setTimeout(() => {
    stableWeekly.value = weeklyData.value
    loading.value = false
  }, 500)
})
</script>
<template>
  <div class="p-4">
    <!-- Header -->
    <div class="mb-4">
      <h1 class="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
        {{ $t('driver_profile_title') }}
      </h1>
      <p class="mt-0.5 text-sm text-slate-500 dark:text-zinc-400">
        {{ $t('driver_profile_desc') }}
      </p>
    </div>
    <!-- Loading -->
    <template v-if="loading">
      <div class="skeleton mb-4 h-44 w-full rounded-2xl" />
      <div class="mb-4 grid grid-cols-2 gap-3">
        <div class="skeleton h-24 w-full rounded-xl" />
        <div class="skeleton h-24 w-full rounded-xl" />
        <div class="skeleton h-24 w-full rounded-xl" />
        <div class="skeleton h-24 w-full rounded-xl" />
      </div>
      <div class="skeleton h-40 w-full rounded-xl" />
    </template>
    <template v-else>
      <!-- Profile header card -->
      <div
        class="to-primary-950 relative mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 p-5 text-white"
      >
        <div class="bg-primary-500/15 absolute top-0 right-0 h-40 w-40 rounded-full blur-3xl" />
        <div class="relative">
          <div class="mb-4 flex items-center gap-4">
            <UAvatar
              :src="driver?.profile?.avatarUrl || ''"
              :alt="driver?.fullName || $t('admin_role_driver')"
              size="lg"
            />
            <div class="min-w-0 flex-1">
              <p class="truncate text-lg font-bold">{{ driver?.fullName }}</p>
              <p class="font-mono text-xs text-slate-400">ID: {{ driver?.id }}</p>
              <div class="mt-1.5 flex items-center gap-2">
                <UBadge color="success" variant="solid" size="xs">{{
                  $t('admin_profile_info_active')
                }}</UBadge>
                <span class="flex items-center gap-0.5 text-xs">
                  <UIcon
                    v-for="i in 5"
                    :key="i"
                    name="i-lucide-star"
                    :class="[
                      'h-3.5 w-3.5',
                      i <= Math.round(stats.rating)
                        ? 'fill-warning-400 text-warning-400'
                        : 'text-slate-600'
                    ]"
                  />
                  <span class="text-warning-400 ml-1 font-medium tabular-nums">{{
                    stats.rating.toFixed(1)
                  }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Stats row -->
      <div class="mb-4 grid grid-cols-2 gap-3">
        <div class="card relative overflow-hidden p-4">
          <div class="bg-primary-500/5 absolute top-0 right-0 h-20 w-20 rounded-full blur-xl" />
          <div class="relative">
            <div class="mb-1 flex items-center gap-1.5">
              <UIcon name="i-lucide-package" class="text-primary-500 h-3.5 w-3.5" />
              <span class="text-xs text-slate-500 dark:text-zinc-400">{{
                $t('driver_history_stat_total')
              }}</span>
            </div>
            <p class="text-2xl font-bold text-neutral-900 tabular-nums dark:text-white">
              {{ formatNumber(stats.totalDeliveries) }}
            </p>
          </div>
        </div>
        <div class="card relative overflow-hidden p-4">
          <div class="bg-success-500/5 absolute top-0 right-0 h-20 w-20 rounded-full blur-xl" />
          <div class="relative">
            <div class="mb-1 flex items-center gap-1.5">
              <UIcon name="i-lucide-trending-up" class="text-success-500 h-3.5 w-3.5" />
              <span class="text-xs text-slate-500 dark:text-zinc-400">{{
                $t('driver_history_stat_success_rate')
              }}</span>
            </div>
            <p class="text-success-600 dark:text-success-400 text-2xl font-bold tabular-nums">
              {{ stats.successRate }}%
            </p>
          </div>
        </div>
        <div class="card relative overflow-hidden p-4">
          <div class="bg-warning-500/5 absolute top-0 right-0 h-20 w-20 rounded-full blur-xl" />
          <div class="relative">
            <div class="mb-1 flex items-center gap-1.5">
              <UIcon name="i-lucide-wallet" class="text-warning-500 h-3.5 w-3.5" />
              <span class="text-xs text-slate-500 dark:text-zinc-400">{{
                $t('driver_profile_stat_earnings')
              }}</span>
            </div>
            <p class="truncate text-lg font-bold text-neutral-900 tabular-nums dark:text-white">
              {{ formatVND(stats.totalEarnings) }}
            </p>
          </div>
        </div>
        <div class="card relative overflow-hidden p-4">
          <div class="bg-info-500/5 absolute top-0 right-0 h-20 w-20 rounded-full blur-xl" />
          <div class="relative">
            <div class="mb-1 flex items-center gap-1.5">
              <UIcon name="i-lucide-star" class="text-info-500 h-3.5 w-3.5" />
              <span class="text-xs text-slate-500 dark:text-zinc-400">{{
                $t('driver_profile_stat_rating')
              }}</span>
            </div>
            <p class="text-info-600 dark:text-info-400 text-2xl font-bold tabular-nums">
              {{ stats.rating.toFixed(1)
              }}<span class="text-sm font-medium text-slate-400">/5</span>
            </p>
          </div>
        </div>
      </div>
      <!-- Personal Information -->
      <div class="card mb-4 p-5">
        <h2 class="mb-4 flex items-center gap-2 font-semibold text-neutral-900 dark:text-white">
          <UIcon name="i-lucide-id-card" class="h-4 w-4 text-slate-400 dark:text-zinc-500" />
          {{ $t('driver_profile_info_title') }}
        </h2>
        <div class="space-y-3.5">
          <div class="flex items-center gap-3">
            <div
              class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-zinc-800"
            >
              <UIcon name="i-lucide-phone" class="h-4 w-4 text-slate-500 dark:text-zinc-400" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-xs text-slate-500 dark:text-zinc-400">{{ $t('auth_login_phone') }}</p>
              <p class="text-sm font-medium text-neutral-900 tabular-nums dark:text-white">
                {{ driver?.phoneNumber || $t('driver_profile_info_phone_empty') }}
              </p>
            </div>
            <UButton
              variant="ghost"
              color="neutral"
              class="text-primary-600 dark:text-primary-400 text-xs font-medium hover:underline"
              @click="copyPhone"
              >{{ $t('admin_order_list_btn_copy') }}</UButton
            >
          </div>
          <div class="flex items-center gap-3">
            <div
              class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-zinc-800"
            >
              <UIcon name="i-lucide-mail" class="h-4 w-4 text-slate-500 dark:text-zinc-400" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-xs text-slate-500 dark:text-zinc-400">
                {{ $t('admin_profile_info_email') }}
              </p>
              <p class="truncate text-sm font-medium text-neutral-900 dark:text-white">
                {{
                  driver?.phoneNumber
                    ? `driver${driver.phoneNumber.slice(-4)}@buntech.vn`
                    : $t('driver_profile_info_phone_empty')
                }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div
              class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-zinc-800"
            >
              <UIcon name="i-lucide-id-card" class="h-4 w-4 text-slate-500 dark:text-zinc-400" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-xs text-slate-500 dark:text-zinc-400">
                {{ $t('driver_profile_info_license') }}
              </p>
              <p class="text-sm font-medium text-neutral-900 tabular-nums dark:text-white">
                B2-0{{ (driver?.phoneNumber || '000').slice(-6) }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div
              class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-zinc-800"
            >
              <UIcon name="i-lucide-calendar" class="h-4 w-4 text-slate-500 dark:text-zinc-400" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-xs text-slate-500 dark:text-zinc-400">
                {{ $t('driver_profile_info_join_date') }}
              </p>
              <p class="text-sm font-medium text-neutral-900 dark:text-white">
                {{ $t('driver_profile_info_join_date_empty') }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <!-- Vehicle Assignment -->
      <div
        class="card card-hover mb-4 cursor-pointer p-5"
        role="button"
        tabindex="0"
        @click="
          () => {
            navigateTo('/driver/vehicle')
          }
        "
        @keydown.enter="navigateTo('/driver/vehicle')"
      >
        <div class="mb-4 flex items-center justify-between">
          <h2 class="flex items-center gap-2 font-semibold text-neutral-900 dark:text-white">
            <UIcon name="i-lucide-truck" class="h-4 w-4 text-slate-400 dark:text-zinc-500" />
            {{ $t('driver_profile_vehicle_title') }}
          </h2>
          <UIcon name="i-lucide-chevron-right" class="h-5 w-5 text-slate-300 dark:text-zinc-600" />
        </div>
        <div class="flex items-center gap-3">
          <div
            class="bg-primary-50 dark:bg-primary-900/20 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
          >
            <UIcon name="i-lucide-truck" class="text-primary-600 dark:text-primary-400 h-6 w-6" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-base font-bold text-neutral-900 tabular-nums dark:text-white">
              51F-1234
            </p>
            <p class="text-xs text-slate-500 dark:text-zinc-400">Honda Blade 110 · 2022</p>
          </div>
          <UBadge color="success" variant="subtle" size="xs">{{
            $t('admin_profile_info_active')
          }}</UBadge>
        </div>
      </div>
      <!-- Performance card -->
      <div class="card mb-4 p-5">
        <h2 class="mb-4 flex items-center gap-2 font-semibold text-neutral-900 dark:text-white">
          <UIcon name="i-lucide-award" class="h-4 w-4 text-slate-400 dark:text-zinc-500" />
          {{ $t('driver_profile_performance_title') }}
        </h2>
        <!-- Weekly chart -->
        <div class="mb-5">
          <div class="mb-3 flex items-center justify-between">
            <p class="text-xs text-slate-500 dark:text-zinc-400">
              {{ $t('driver_profile_performance_weekly') }}
            </p>
            <p class="text-xs font-medium text-neutral-900 tabular-nums dark:text-white">
              {{
                $t('driver_profile_performance_trips', {
                  count: stableWeekly.reduce((s, d) => s + d.count, 0)
                })
              }}
            </p>
          </div>
          <div class="flex h-32 items-end justify-between gap-2">
            <div
              v-for="d in stableWeekly"
              :key="d.day"
              class="flex flex-1 flex-col items-center gap-2"
            >
              <div class="flex w-full flex-1 items-end">
                <div
                  :class="[
                    'w-full rounded-t-md transition-all duration-500',
                    d.isToday ? 'bg-primary-600' : 'bg-primary-200 dark:bg-primary-900/40'
                  ]"
                  :style="{ height: `${Math.max((d.count / maxWeekly) * 100, 6)}%` }"
                >
                  <p
                    v-if="d.count > 0"
                    class="pt-1 text-center text-[10px] font-bold text-white tabular-nums"
                  >
                    {{ d.count }}
                  </p>
                </div>
              </div>
              <span
                :class="[
                  'text-[11px]',
                  d.isToday
                    ? 'text-primary-600 dark:text-primary-400 font-bold'
                    : 'text-slate-400 dark:text-zinc-500'
                ]"
                >{{ d.day }}</span
              >
            </div>
          </div>
        </div>
        <!-- Performance metrics -->
        <div
          class="grid grid-cols-3 gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-800"
        >
          <div class="text-center">
            <p class="mb-1 text-xs text-slate-500 dark:text-zinc-400">
              {{ $t('driver_profile_performance_completion') }}
            </p>
            <p class="text-success-600 dark:text-success-400 text-lg font-bold tabular-nums">
              {{ stats.successRate }}%
            </p>
          </div>
          <div class="text-center">
            <p class="mb-1 text-xs text-slate-500 dark:text-zinc-400">
              {{ $t('driver_profile_performance_avg_time') }}
            </p>
            <p class="text-lg font-bold text-neutral-900 tabular-nums dark:text-white">
              24<span class="text-xs font-medium text-slate-400">
                {{ $t('driver_profile_performance_avg_time_unit') }}</span
              >
            </p>
          </div>
          <div class="text-center">
            <p class="mb-1 text-xs text-slate-500 dark:text-zinc-400">
              {{ $t('driver_profile_stat_rating') }}
            </p>
            <p class="text-info-600 dark:text-info-400 text-lg font-bold tabular-nums">
              {{ stats.rating.toFixed(1) }}
            </p>
          </div>
        </div>
      </div>
      <!-- Recent Activity timeline -->
      <div class="card mb-4 p-5">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="flex items-center gap-2 font-semibold text-neutral-900 dark:text-white">
            <UIcon name="i-lucide-clock" class="h-4 w-4 text-slate-400 dark:text-zinc-500" />
            {{ $t('driver_profile_activity_title') }}
          </h2>
          <UButton
            variant="ghost"
            color="neutral"
            class="text-primary-600 dark:text-primary-400 text-xs font-medium hover:underline"
            @click="
              () => {
                navigateTo('/driver/history')
              }
            "
            >{{ $t('wholesale_view_all') }}</UButton
          >
        </div>
        <div class="relative">
          <div
            class="absolute top-2 bottom-2 left-[15px] w-px bg-neutral-200 dark:bg-neutral-800"
          />
          <div class="space-y-4">
            <div v-for="a in recentActivity" :key="a.id" class="relative flex gap-3 pl-1">
              <div
                :class="[
                  'relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ring-4 ring-white dark:ring-zinc-900',
                  a.type === 'delivered'
                    ? 'bg-success-100 dark:bg-success-900/30'
                    : a.type === 'cancelled'
                      ? 'bg-error-100 dark:bg-error-900/30'
                      : 'bg-primary-100 dark:bg-primary-900/30'
                ]"
              >
                <UIcon
                  v-if="a.type === 'delivered'"
                  name="i-lucide-check-circle-2"
                  class="text-success-600 dark:text-success-400 h-4 w-4"
                />
                <UIcon
                  v-else-if="a.type === 'shipping'"
                  name="i-lucide-package"
                  class="text-primary-600 dark:text-primary-400 h-4 w-4"
                />
                <span
                  v-else
                  class="text-error-600 dark:text-error-400 flex h-4 w-4 items-center justify-center text-xs font-bold"
                  >×</span
                >
              </div>
              <div class="flex-1 pb-1">
                <p class="text-sm font-medium text-neutral-900 dark:text-white">{{ a.label }}</p>
                <p class="text-xs text-slate-500 dark:text-zinc-400">{{ a.customer }}</p>
                <div
                  class="mt-1 flex items-center gap-2 text-[11px] text-slate-400 dark:text-zinc-500"
                >
                  <span class="flex items-center gap-1"
                    ><UIcon name="i-lucide-map-pin" class="h-3 w-3" />{{
                      a.address.slice(0, 24)
                    }}…</span
                  >
                  <span>·</span>
                  <span>{{ formatTimeAgo(a.time) }}</span>
                </div>
              </div>
              <span
                v-if="a.amount > 0"
                class="flex-shrink-0 text-xs font-semibold text-neutral-900 tabular-nums dark:text-white"
                >{{ formatVND(a.amount) }}</span
              >
            </div>
          </div>
        </div>
      </div>
      <!-- Settings links -->
      <div class="card mb-4 p-2">
        <NuxtLink
          to="/driver/notifications"
          class="flex min-h-[44px] items-center gap-3 rounded-lg p-3 transition-colors hover:bg-neutral-100 dark:hover:bg-zinc-800"
        >
          <div
            class="bg-info-50 dark:bg-info-900/20 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
          >
            <UIcon name="i-lucide-bell" class="text-info-600 dark:text-info-400 h-4.5 w-4.5" />
          </div>
          <span class="flex-1 text-sm font-medium text-neutral-900 dark:text-white">{{
            $t('driver_notifications')
          }}</span>
          <UIcon name="i-lucide-chevron-right" class="h-5 w-5 text-slate-300 dark:text-zinc-600" />
        </NuxtLink>
        <UButton
          variant="ghost"
          color="neutral"
          class="hover:bg-error-50 dark:hover:bg-error-900/20 flex min-h-[44px] w-full items-center gap-3 rounded-lg p-3 transition-colors"
          @click="handleLogout"
        >
          <div
            class="bg-error-50 dark:bg-error-900/20 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
          >
            <UIcon name="i-lucide-log-out" class="text-error-600 dark:text-error-400 h-4.5 w-4.5" />
          </div>
          <span class="text-error-600 dark:text-error-400 flex-1 text-left text-sm font-medium">{{
            $t('logout')
          }}</span>
          <UIcon name="i-lucide-chevron-right" class="h-5 w-5 text-slate-300 dark:text-zinc-600" />
        </UButton>
      </div>
    </template>
  </div>
</template>
