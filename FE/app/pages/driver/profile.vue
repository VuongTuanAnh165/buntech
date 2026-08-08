<script setup lang="ts">
import { OrderStatus, Role, UserStatus } from '~/utils/enums'
import { mockOrders, mockProfiles } from '~/utils/mockData'

definePageMeta({ layout: 'driver' })
useSeoMeta({ title: 'Hồ sơ tài xế - BunTech Driver' })

const router = useRouter()
const toast = useToast()
const { formatVND, formatNumber, formatDate, formatTimeAgo } = useFormat()

const loading = ref(true)

const driver = computed(() =>
  mockProfiles.find(p => p.role === Role.DRIVER && p.status === UserStatus.ACTIVE) || mockProfiles[2]
)

const driverOrders = computed(() => {
  const id = driver.value?.id
  if (!id) return []
  return mockOrders
    .filter(o => o.driver_id === id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})

const stats = computed(() => {
  const orders = driverOrders.value
  const delivered = orders.filter(o => o.status === OrderStatus.DELIVERED)
  const totalEarnings = delivered.reduce((sum, o) => sum + Math.round(o.total_amount * 0.03), 0)
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
    return { day, count: isPast ? counts[i] : 0, isToday: i === todayIdx }
  })
})
const stableWeekly = ref<{ day: string; count: number; isToday: boolean }[]>([])
const maxWeekly = computed(() => Math.max(...stableWeekly.value.map(d => d.count), 1))

// Recent activity timeline
const recentActivity = computed(() =>
  driverOrders.value.slice(0, 6).map(o => ({
    id: o.id,
    type: o.status === OrderStatus.DELIVERED ? 'delivered' : o.status === OrderStatus.CANCELLED ? 'cancelled' : 'shipping',
    label: o.status === OrderStatus.DELIVERED ? `Giao thành công #${o.id}` : o.status === OrderStatus.CANCELLED ? `Đơn hủy #${o.id}` : `Đang giao #${o.id}`,
    customer: o.customer_name || 'Khách vãng lai',
    address: o.shipping_address,
    amount: o.amount_collected || 0,
    time: o.created_at,
  }))
)

function copyPhone() {
  if (driver.value?.phone) {
    navigator.clipboard?.writeText(driver.value.phone)
      .then(() => toast.add({ title: 'Đã sao chép số điện thoại', color: 'success' }))
      .catch(() => toast.add({ title: 'Không thể sao chép', color: 'error' }))
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
      <h1 class="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">Hồ sơ tài xế</h1>
      <p class="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">Thông tin và thành tích của bạn</p>
    </div>

    <!-- Loading -->
    <template v-if="loading">
      <div class="skeleton h-44 w-full rounded-2xl mb-4" />
      <div class="grid grid-cols-2 gap-3 mb-4">
        <div class="skeleton h-24 w-full rounded-xl" />
        <div class="skeleton h-24 w-full rounded-xl" />
        <div class="skeleton h-24 w-full rounded-xl" />
        <div class="skeleton h-24 w-full rounded-xl" />
      </div>
      <div class="skeleton h-40 w-full rounded-xl" />
    </template>

    <template v-else>
      <!-- Profile header card -->
      <div class="bg-gradient-to-br from-slate-900 via-slate-900 to-primary-950 rounded-2xl p-5 mb-4 text-white relative overflow-hidden">
        <div class="absolute top-0 right-0 w-40 h-40 rounded-full bg-primary-500/15 blur-3xl" />
        <div class="relative">
          <div class="flex items-center gap-4 mb-4">
            <UAvatar :src="driver?.avatar_url || ''" :alt="driver?.full_name || 'Tài xế'" size="lg" />
            <div class="flex-1 min-w-0">
              <p class="text-lg font-bold truncate">{{ driver?.full_name }}</p>
              <p class="text-xs text-slate-400 font-mono">{{ driver?.id }}</p>
              <div class="flex items-center gap-2 mt-1.5">
                <UBadge color="success" variant="solid" size="xs">Đang hoạt động</UBadge>
                <span class="flex items-center gap-0.5 text-xs">
                  <UIcon v-for="i in 5" :key="i" name="i-lucide-star" :class="['w-3.5 h-3.5', i <= Math.round(stats.rating) ? 'fill-warning-400 text-warning-400' : 'text-slate-600']" />
                  <span class="ml-1 font-medium text-warning-400 tabular-nums">{{ stats.rating.toFixed(1) }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats row -->
      <div class="grid grid-cols-2 gap-3 mb-4">
        <div class="card p-4 relative overflow-hidden">
          <div class="absolute top-0 right-0 w-20 h-20 rounded-full bg-primary-500/5 blur-xl" />
          <div class="relative">
            <div class="flex items-center gap-1.5 mb-1">
              <UIcon name="i-lucide-package" class="w-3.5 h-3.5 text-primary-500" />
              <span class="text-xs text-slate-500 dark:text-zinc-400">Tổng chuyến</span>
            </div>
            <p class="text-2xl font-bold text-neutral-900 dark:text-white tabular-nums">{{ formatNumber(stats.totalDeliveries) }}</p>
          </div>
        </div>
        <div class="card p-4 relative overflow-hidden">
          <div class="absolute top-0 right-0 w-20 h-20 rounded-full bg-success-500/5 blur-xl" />
          <div class="relative">
            <div class="flex items-center gap-1.5 mb-1">
              <UIcon name="i-lucide-trending-up" class="w-3.5 h-3.5 text-success-500" />
              <span class="text-xs text-slate-500 dark:text-zinc-400">Tỷ lệ thành công</span>
            </div>
            <p class="text-2xl font-bold text-success-600 dark:text-success-400 tabular-nums">{{ stats.successRate }}%</p>
          </div>
        </div>
        <div class="card p-4 relative overflow-hidden">
          <div class="absolute top-0 right-0 w-20 h-20 rounded-full bg-warning-500/5 blur-xl" />
          <div class="relative">
            <div class="flex items-center gap-1.5 mb-1">
              <UIcon name="i-lucide-wallet" class="w-3.5 h-3.5 text-warning-500" />
              <span class="text-xs text-slate-500 dark:text-zinc-400">Tổng thu nhập</span>
            </div>
            <p class="text-lg font-bold text-neutral-900 dark:text-white tabular-nums truncate">{{ formatVND(stats.totalEarnings) }}</p>
          </div>
        </div>
        <div class="card p-4 relative overflow-hidden">
          <div class="absolute top-0 right-0 w-20 h-20 rounded-full bg-info-500/5 blur-xl" />
          <div class="relative">
            <div class="flex items-center gap-1.5 mb-1">
              <UIcon name="i-lucide-star" class="w-3.5 h-3.5 text-info-500" />
              <span class="text-xs text-slate-500 dark:text-zinc-400">Điểm đánh giá</span>
            </div>
            <p class="text-2xl font-bold text-info-600 dark:text-info-400 tabular-nums">{{ stats.rating.toFixed(1) }}<span class="text-sm font-medium text-slate-400">/5</span></p>
          </div>
        </div>
      </div>

      <!-- Personal Information -->
      <div class="card p-5 mb-4">
        <h2 class="font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
          <UIcon name="i-lucide-id-card" class="w-4 h-4 text-slate-400 dark:text-zinc-500" />
          Thông tin cá nhân
        </h2>
        <div class="space-y-3.5">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
              <UIcon name="i-lucide-phone" class="w-4 h-4 text-slate-500 dark:text-zinc-400" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs text-slate-500 dark:text-zinc-400">Số điện thoại</p>
              <p class="text-sm font-medium text-neutral-900 dark:text-white tabular-nums">{{ driver?.phone || 'Chưa có' }}</p>
            </div>
            <button class="text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline" @click="copyPhone">Sao chép</button>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
              <UIcon name="i-lucide-mail" class="w-4 h-4 text-slate-500 dark:text-zinc-400" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs text-slate-500 dark:text-zinc-400">Email</p>
              <p class="text-sm font-medium text-neutral-900 dark:text-white truncate">{{ driver?.phone ? `driver${driver.phone.slice(-4)}@buntech.vn` : 'Chưa có' }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
              <UIcon name="i-lucide-id-card" class="w-4 h-4 text-slate-500 dark:text-zinc-400" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs text-slate-500 dark:text-zinc-400">Số giấy phép lái</p>
              <p class="text-sm font-medium text-neutral-900 dark:text-white tabular-nums">B2-0{{ (driver?.phone || '000').slice(-6) }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
              <UIcon name="i-lucide-calendar" class="w-4 h-4 text-slate-500 dark:text-zinc-400" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs text-slate-500 dark:text-zinc-400">Ngày tham gia</p>
              <p class="text-sm font-medium text-neutral-900 dark:text-white">{{ formatDate(driver?.created_at) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Vehicle Assignment -->
      <div class="card card-hover p-5 mb-4 cursor-pointer" role="button" tabindex="0" @click="navigateTo('/driver/vehicle')" @keydown.enter="navigateTo('/driver/vehicle')">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
            <UIcon name="i-lucide-truck" class="w-4 h-4 text-slate-400 dark:text-zinc-500" />
            Phương tiện được phân công
          </h2>
          <UIcon name="i-lucide-chevron-right" class="w-5 h-5 text-slate-300 dark:text-zinc-600" />
        </div>
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
            <UIcon name="i-lucide-truck" class="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-base font-bold text-neutral-900 dark:text-white tabular-nums">51F-1234</p>
            <p class="text-xs text-slate-500 dark:text-zinc-400">Honda Blade 110 · 2022</p>
          </div>
          <UBadge color="success" variant="subtle" size="xs">Hoạt động</UBadge>
        </div>
      </div>

      <!-- Performance card -->
      <div class="card p-5 mb-4">
        <h2 class="font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
          <UIcon name="i-lucide-award" class="w-4 h-4 text-slate-400 dark:text-zinc-500" />
          Hiệu suất
        </h2>
        <!-- Weekly chart -->
        <div class="mb-5">
          <div class="flex items-center justify-between mb-3">
            <p class="text-xs text-slate-500 dark:text-zinc-400">Chuyến giao theo ngày (tuần này)</p>
            <p class="text-xs font-medium text-neutral-900 dark:text-white tabular-nums">{{ stableWeekly.reduce((s, d) => s + d.count, 0) }} chuyến</p>
          </div>
          <div class="flex items-end justify-between gap-2 h-32">
            <div v-for="d in stableWeekly" :key="d.day" class="flex-1 flex flex-col items-center gap-2">
              <div class="w-full flex-1 flex items-end">
                <div
                  :class="['w-full rounded-t-md transition-all duration-500', d.isToday ? 'bg-primary-600' : 'bg-primary-200 dark:bg-primary-900/40']"
                  :style="{ height: `${Math.max((d.count / maxWeekly) * 100, 6)}%` }"
                >
                  <p v-if="d.count > 0" class="text-[10px] font-bold text-center text-white pt-1 tabular-nums">{{ d.count }}</p>
                </div>
              </div>
              <span :class="['text-[11px]', d.isToday ? 'font-bold text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-zinc-500']">{{ d.day }}</span>
            </div>
          </div>
        </div>
        <!-- Performance metrics -->
        <div class="grid grid-cols-3 gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <div class="text-center">
            <p class="text-xs text-slate-500 dark:text-zinc-400 mb-1">Tỷ lệ hoàn thành</p>
            <p class="text-lg font-bold text-success-600 dark:text-success-400 tabular-nums">{{ stats.successRate }}%</p>
          </div>
          <div class="text-center">
            <p class="text-xs text-slate-500 dark:text-zinc-400 mb-1">TB thời gian giao</p>
            <p class="text-lg font-bold text-neutral-900 dark:text-white tabular-nums">24<span class="text-xs font-medium text-slate-400"> phút</span></p>
          </div>
          <div class="text-center">
            <p class="text-xs text-slate-500 dark:text-zinc-400 mb-1">Điểm đánh giá</p>
            <p class="text-lg font-bold text-info-600 dark:text-info-400 tabular-nums">{{ stats.rating.toFixed(1) }}</p>
          </div>
        </div>
      </div>

      <!-- Recent Activity timeline -->
      <div class="card p-5 mb-4">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
            <UIcon name="i-lucide-clock" class="w-4 h-4 text-slate-400 dark:text-zinc-500" />
            Hoạt động gần đây
          </h2>
          <button class="text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline" @click="navigateTo('/driver/history')">Xem tất cả</button>
        </div>
        <div class="relative">
          <div class="absolute left-[15px] top-2 bottom-2 w-px bg-neutral-200 dark:bg-neutral-800" />
          <div class="space-y-4">
            <div v-for="a in recentActivity" :key="a.id" class="relative flex gap-3 pl-1">
              <div
                :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ring-4 ring-white dark:ring-zinc-900 relative z-10',
                  a.type === 'delivered' ? 'bg-success-100 dark:bg-success-900/30' : a.type === 'cancelled' ? 'bg-error-100 dark:bg-error-900/30' : 'bg-primary-100 dark:bg-primary-900/30',
                ]"
              >
                <UIcon
                  v-if="a.type === 'delivered'"
                  name="i-lucide-check-circle-2"
                  class="w-4 h-4 text-success-600 dark:text-success-400"
                />
                <UIcon
                  v-else-if="a.type === 'shipping'"
                  name="i-lucide-package"
                  class="w-4 h-4 text-primary-600 dark:text-primary-400"
                />
                <span v-else class="w-4 h-4 text-error-600 dark:text-error-400 font-bold text-xs flex items-center justify-center">×</span>
              </div>
              <div class="flex-1 pb-1">
                <p class="text-sm font-medium text-neutral-900 dark:text-white">{{ a.label }}</p>
                <p class="text-xs text-slate-500 dark:text-zinc-400">{{ a.customer }}</p>
                <div class="flex items-center gap-2 mt-1 text-[11px] text-slate-400 dark:text-zinc-500">
                  <span class="flex items-center gap-1"><UIcon name="i-lucide-map-pin" class="w-3 h-3" />{{ a.address.slice(0, 24) }}…</span>
                  <span>·</span>
                  <span>{{ formatTimeAgo(a.time) }}</span>
                </div>
              </div>
              <span v-if="a.amount > 0" class="text-xs font-semibold text-neutral-900 dark:text-white tabular-nums flex-shrink-0">{{ formatVND(a.amount) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Settings links -->
      <div class="card p-2 mb-4">
        <NuxtLink to="/driver/notifications" class="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-zinc-800 transition-colors min-h-[44px]">
          <div class="w-9 h-9 rounded-lg bg-info-50 dark:bg-info-900/20 flex items-center justify-center flex-shrink-0">
            <UIcon name="i-lucide-bell" class="w-4.5 h-4.5 text-info-600 dark:text-info-400" />
          </div>
          <span class="flex-1 text-sm font-medium text-neutral-900 dark:text-white">Thông báo</span>
          <UIcon name="i-lucide-chevron-right" class="w-5 h-5 text-slate-300 dark:text-zinc-600" />
        </NuxtLink>
        <button class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors min-h-[44px]" @click="handleLogout">
          <div class="w-9 h-9 rounded-lg bg-error-50 dark:bg-error-900/20 flex items-center justify-center flex-shrink-0">
            <UIcon name="i-lucide-log-out" class="w-4.5 h-4.5 text-error-600 dark:text-error-400" />
          </div>
          <span class="flex-1 text-sm font-medium text-error-600 dark:text-error-400 text-left">Đăng xuất</span>
          <UIcon name="i-lucide-chevron-right" class="w-5 h-5 text-slate-300 dark:text-zinc-600" />
        </button>
      </div>
    </template>
  </div>
</template>
