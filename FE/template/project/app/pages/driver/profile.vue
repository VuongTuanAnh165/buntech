<script setup lang="ts">
import {
  Star, Phone, Mail, IdCard, Calendar, Truck, Package, Wallet,
  TrendingUp, Clock, Bell, Moon, Sun, LogOut, ChevronRight, CheckCircle2,
  Settings, Award, MapPin,
} from 'lucide-vue-next'
import { OrderStatus, Role, UserStatus } from '../../core/enums'
import { mockOrders, mockProfiles } from '../../core/mock/data'

const { t } = useI18n()
const { formatVND, formatNumber, formatDate } = useFormat()
const toast = useToast()
const router = useRouter()
const authStore = useAuthStore()
const { colorMode, toggleDark } = useColorMode()

useHead({ title: 'Hồ sơ tài xế - BunTech Driver' })
definePageMeta({ layout: 'driver' })

const loading = ref(true)

// Current driver profile
const driver = computed(() => {
  if (authStore.user?.id) {
    const found = mockProfiles.find(p => p.id === authStore.user!.id)
    if (found) return found
  }
  return mockProfiles.find(p => p.role === Role.DRIVER && p.status === UserStatus.ACTIVE) || mockProfiles[2]
})

// Past orders for this driver
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
  const totalEarnings = delivered.reduce((sum, o) => sum + Math.round(Number(o.total) * 0.03), 0) // mock 3% commission
  const successRate = orders.length ? Math.round((delivered.length / orders.length) * 100) : 0
  return {
    totalDeliveries: delivered.length,
    successRate,
    totalEarnings,
    rating: 4.8,
  }
})

// Weekly delivery chart data (last 7 days) — deterministic per weekday
const weeklyData = computed(() => {
  const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
  const today = new Date()
  const todayIdx = (today.getDay() + 6) % 7 // Monday = 0
  const counts = [5, 7, 4, 8, 6, 9, 3]
  return days.map((day, i) => {
    const isPast = i <= todayIdx
    const count = isPast ? counts[i] : 0
    return { day, count, isToday: i === todayIdx }
  })
})
// Keep weeklyData stable after load
const stableWeekly = ref<{ day: string; count: number; isToday: boolean }[]>([])
const maxWeekly = computed(() => Math.max(...stableWeekly.value.map(d => d.count), 1))

// Recent activity timeline
const recentActivity = computed(() => {
  return driverOrders.value.slice(0, 6).map(o => ({
    id: o.id,
    type: o.status === OrderStatus.DELIVERED ? 'delivered' : o.status === OrderStatus.CANCELLED ? 'cancelled' : 'shipping',
    label: o.status === OrderStatus.DELIVERED
      ? `Giao thành công #${o.id.slice(0, 8)}`
      : o.status === OrderStatus.CANCELLED
        ? `Đơn hủy #${o.id.slice(0, 8)}`
        : `Đang giao #${o.id.slice(0, 8)}`,
    customer: o.user?.full_name || 'Khách vãng lai',
    address: o.shipping_address,
    amount: Number(o.amount_collected),
    time: o.created_at,
  }))
})

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor(diff / 3600000)
  const mins = Math.floor(diff / 60000)
  if (days > 0) return `${days} ngày trước`
  if (hours > 0) return `${hours} giờ trước`
  if (mins > 0) return `${mins} phút trước`
  return 'Vừa xong'
}

function handleLogout() {
  authStore.logout()
  router.push('/auth/driver/login')
}

function copyPhone() {
  if (driver.value?.phone) {
    navigator.clipboard?.writeText(driver.value.phone).then(() => toast.success('Đã sao chép số điện thoại')).catch(() => toast.error('Không thể sao chép'))
  }
}

function load() {
  loading.value = true
  setTimeout(() => {
    stableWeekly.value = weeklyData.value
    loading.value = false
  }, 500)
}

onMounted(load)
</script>

<template>
  <div class="p-4">
    <!-- Header -->
    <div class="mb-4">
      <h1 class="text-xl font-bold text-surface-foreground tracking-tight">Hồ sơ tài xế</h1>
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
        <div class="absolute top-0 right-0 w-40 h-40 rounded-full bg-primary-500/15 blur-3xl" aria-hidden="true" />
        <div class="relative">
          <div class="flex items-center gap-4 mb-4">
            <AppAvatar :name="driver?.full_name || 'Tài xế'" :src="driver?.avatar_url" size="lg" />
            <div class="flex-1 min-w-0">
              <p class="text-lg font-bold truncate">{{ driver?.full_name }}</p>
              <p class="text-xs text-slate-400 font-mono">{{ driver?.id }}</p>
              <div class="flex items-center gap-2 mt-1.5">
                <AppBadge color="success" variant="solid" dot>Đang hoạt động</AppBadge>
                <span class="flex items-center gap-0.5 text-xs">
                  <Star v-for="i in 5" :key="i" :class="['w-3.5 h-3.5', i <= Math.round(stats.rating) ? 'fill-warning-400 text-warning-400' : 'text-slate-600']" aria-hidden="true" />
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
          <div class="absolute top-0 right-0 w-20 h-20 rounded-full bg-primary-500/5 blur-xl" aria-hidden="true" />
          <div class="relative">
            <div class="flex items-center gap-1.5 mb-1">
              <Package class="w-3.5 h-3.5 text-primary-500" aria-hidden="true" />
              <span class="text-xs text-slate-500 dark:text-zinc-400">Tổng chuyến</span>
            </div>
            <p class="text-2xl font-bold text-surface-foreground tabular-nums">{{ formatNumber(stats.totalDeliveries) }}</p>
          </div>
        </div>
        <div class="card p-4 relative overflow-hidden">
          <div class="absolute top-0 right-0 w-20 h-20 rounded-full bg-success-500/5 blur-xl" aria-hidden="true" />
          <div class="relative">
            <div class="flex items-center gap-1.5 mb-1">
              <TrendingUp class="w-3.5 h-3.5 text-success-500" aria-hidden="true" />
              <span class="text-xs text-slate-500 dark:text-zinc-400">Tỷ lệ thành công</span>
            </div>
            <p class="text-2xl font-bold text-success-600 dark:text-success-400 tabular-nums">{{ stats.successRate }}%</p>
          </div>
        </div>
        <div class="card p-4 relative overflow-hidden">
          <div class="absolute top-0 right-0 w-20 h-20 rounded-full bg-warning-500/5 blur-xl" aria-hidden="true" />
          <div class="relative">
            <div class="flex items-center gap-1.5 mb-1">
              <Wallet class="w-3.5 h-3.5 text-warning-500" aria-hidden="true" />
              <span class="text-xs text-slate-500 dark:text-zinc-400">Tổng thu nhập</span>
            </div>
            <p class="text-lg font-bold text-surface-foreground tabular-nums truncate">{{ formatVND(stats.totalEarnings) }}</p>
          </div>
        </div>
        <div class="card p-4 relative overflow-hidden">
          <div class="absolute top-0 right-0 w-20 h-20 rounded-full bg-info-500/5 blur-xl" aria-hidden="true" />
          <div class="relative">
            <div class="flex items-center gap-1.5 mb-1">
              <Star class="w-3.5 h-3.5 text-info-500" aria-hidden="true" />
              <span class="text-xs text-slate-500 dark:text-zinc-400">Điểm đánh giá</span>
            </div>
            <p class="text-2xl font-bold text-info-600 dark:text-info-400 tabular-nums">{{ stats.rating.toFixed(1) }}<span class="text-sm font-medium text-slate-400">/5</span></p>
          </div>
        </div>
      </div>

      <!-- Personal Information -->
      <div class="card p-5 mb-4">
        <h2 class="font-semibold text-surface-foreground mb-4 flex items-center gap-2">
          <IdCard class="w-4 h-4 text-slate-400 dark:text-zinc-500" aria-hidden="true" />
          Thông tin cá nhân
        </h2>
        <div class="space-y-3.5">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-surface-hover flex items-center justify-center flex-shrink-0">
              <Phone class="w-4 h-4 text-slate-500 dark:text-zinc-400" aria-hidden="true" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs text-slate-500 dark:text-zinc-400">Số điện thoại</p>
              <p class="text-sm font-medium text-surface-foreground tabular-nums">{{ driver?.phone || 'Chưa có' }}</p>
            </div>
            <button class="text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline" @click="copyPhone">Sao chép</button>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-surface-hover flex items-center justify-center flex-shrink-0">
              <Mail class="w-4 h-4 text-slate-500 dark:text-zinc-400" aria-hidden="true" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs text-slate-500 dark:text-zinc-400">Email</p>
              <p class="text-sm font-medium text-surface-foreground truncate">{{ driver?.phone ? `driver${driver.phone.slice(-4)}@buntech.vn` : 'Chưa có' }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-surface-hover flex items-center justify-center flex-shrink-0">
              <IdCard class="w-4 h-4 text-slate-500 dark:text-zinc-400" aria-hidden="true" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs text-slate-500 dark:text-zinc-400">Số giấy phép lái</p>
              <p class="text-sm font-medium text-surface-foreground tabular-nums">B2-0{{ (driver?.phone || '000').slice(-6) }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-surface-hover flex items-center justify-center flex-shrink-0">
              <Calendar class="w-4 h-4 text-slate-500 dark:text-zinc-400" aria-hidden="true" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs text-slate-500 dark:text-zinc-400">Ngày tham gia</p>
              <p class="text-sm font-medium text-surface-foreground">{{ formatDate(driver?.created_at) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Vehicle Assignment -->
      <div class="card card-hover p-5 mb-4 cursor-pointer" role="button" tabindex="0" @click="router.push('/driver/vehicle')" @keydown.enter="router.push('/driver/vehicle')">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold text-surface-foreground flex items-center gap-2">
            <Truck class="w-4 h-4 text-slate-400 dark:text-zinc-500" aria-hidden="true" />
            Phương tiện được phân công
          </h2>
          <ChevronRight class="w-5 h-5 text-slate-300 dark:text-zinc-600" aria-hidden="true" />
        </div>
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
            <Truck class="w-6 h-6 text-primary-600 dark:text-primary-400" aria-hidden="true" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-base font-bold text-surface-foreground tabular-nums">51F-1234</p>
            <p class="text-xs text-slate-500 dark:text-zinc-400">Honda Blade 110 · 2022</p>
          </div>
          <AppBadge color="success" dot>Hoạt động</AppBadge>
        </div>
      </div>

      <!-- Performance card -->
      <div class="card p-5 mb-4">
        <h2 class="font-semibold text-surface-foreground mb-4 flex items-center gap-2">
          <Award class="w-4 h-4 text-slate-400 dark:text-zinc-500" aria-hidden="true" />
          Hiệu suất
        </h2>
        <!-- Weekly chart -->
        <div class="mb-5">
          <div class="flex items-center justify-between mb-3">
            <p class="text-xs text-slate-500 dark:text-zinc-400">Chuyến giao theo ngày (tuần này)</p>
            <p class="text-xs font-medium text-surface-foreground tabular-nums">{{ stableWeekly.reduce((s, d) => s + d.count, 0) }} chuyến</p>
          </div>
          <div class="flex items-end justify-between gap-2 h-32">
            <div v-for="d in stableWeekly" :key="d.day" class="flex-1 flex flex-col items-center gap-2">
              <div class="w-full flex-1 flex items-end">
                <div
                  :class="[
                    'w-full rounded-t-md transition-all duration-500',
                    d.isToday ? 'bg-primary-600' : 'bg-primary-200 dark:bg-primary-900/40',
                  ]"
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
        <div class="grid grid-cols-3 gap-3 pt-4 border-t border-surface-border">
          <div class="text-center">
            <p class="text-xs text-slate-500 dark:text-zinc-400 mb-1">Tỷ lệ hoàn thành</p>
            <p class="text-lg font-bold text-success-600 dark:text-success-400 tabular-nums">{{ stats.successRate }}%</p>
          </div>
          <div class="text-center">
            <p class="text-xs text-slate-500 dark:text-zinc-400 mb-1">TB thời gian giao</p>
            <p class="text-lg font-bold text-surface-foreground tabular-nums">24<span class="text-xs font-medium text-slate-400"> phút</span></p>
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
          <h2 class="font-semibold text-surface-foreground flex items-center gap-2">
            <Clock class="w-4 h-4 text-slate-400 dark:text-zinc-500" aria-hidden="true" />
            Hoạt động gần đây
          </h2>
          <button class="text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline" @click="router.push('/driver/history')">Xem tất cả</button>
        </div>
        <div class="relative">
          <div class="absolute left-[15px] top-2 bottom-2 w-px bg-surface-border" aria-hidden="true" />
          <div class="space-y-4">
            <div v-for="a in recentActivity" :key="a.id" class="relative flex gap-3 pl-1">
              <div
                :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ring-4 ring-surface relative z-10',
                  a.type === 'delivered' ? 'bg-success-100 dark:bg-success-900/30' : a.type === 'cancelled' ? 'bg-danger-100 dark:bg-danger-900/30' : 'bg-primary-100 dark:bg-primary-900/30',
                ]"
              >
                <CheckCircle2 v-if="a.type === 'delivered'" class="w-4 h-4 text-success-600 dark:text-success-400" aria-hidden="true" />
                <Package v-else-if="a.type === 'shipping'" class="w-4 h-4 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                <span v-else class="w-4 h-4 text-danger-600 dark:text-danger-400 font-bold text-xs flex items-center justify-center">×</span>
              </div>
              <div class="flex-1 pb-1">
                <p class="text-sm font-medium text-surface-foreground">{{ a.label }}</p>
                <p class="text-xs text-slate-500 dark:text-zinc-400">{{ a.customer }}</p>
                <div class="flex items-center gap-2 mt-1 text-[11px] text-slate-400 dark:text-zinc-500">
                  <span class="flex items-center gap-1"><MapPin class="w-3 h-3" aria-hidden="true" />{{ a.address.slice(0, 24) }}…</span>
                  <span>·</span>
                  <span>{{ timeAgo(a.time) }}</span>
                </div>
              </div>
              <span v-if="a.amount > 0" class="text-xs font-semibold text-surface-foreground tabular-nums flex-shrink-0">{{ formatVND(a.amount) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Settings links -->
      <div class="card p-2 mb-4">
        <NuxtLink to="/driver/notifications" class="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-hover transition-colors min-h-[44px]">
          <div class="w-9 h-9 rounded-lg bg-info-50 dark:bg-info-900/20 flex items-center justify-center flex-shrink-0">
            <Bell class="w-4.5 h-4.5 text-info-600 dark:text-info-400" aria-hidden="true" />
          </div>
          <span class="flex-1 text-sm font-medium text-surface-foreground">Thông báo</span>
          <ChevronRight class="w-5 h-5 text-slate-300 dark:text-zinc-600" aria-hidden="true" />
        </NuxtLink>
        <button class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-hover transition-colors min-h-[44px]" @click="toggleDark">
          <div class="w-9 h-9 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
            <Sun v-if="colorMode === 'dark'" class="w-4.5 h-4.5 text-warning-500" aria-hidden="true" />
            <Moon v-else class="w-4.5 h-4.5 text-slate-600 dark:text-zinc-400" aria-hidden="true" />
          </div>
          <span class="flex-1 text-sm font-medium text-surface-foreground text-left">{{ colorMode === 'dark' ? 'Chế độ sáng' : 'Chế độ tối' }}</span>
          <span v-if="colorMode === 'dark'" class="text-xs text-slate-400">Đang bật</span>
          <ChevronRight class="w-5 h-5 text-slate-300 dark:text-zinc-600" aria-hidden="true" />
        </button>
        <button class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors min-h-[44px]" @click="handleLogout">
          <div class="w-9 h-9 rounded-lg bg-danger-50 dark:bg-danger-900/20 flex items-center justify-center flex-shrink-0">
            <LogOut class="w-4.5 h-4.5 text-danger-600 dark:text-danger-400" aria-hidden="true" />
          </div>
          <span class="flex-1 text-sm font-medium text-danger-600 dark:text-danger-400 text-left">Đăng xuất</span>
          <ChevronRight class="w-5 h-5 text-slate-300 dark:text-zinc-600" aria-hidden="true" />
        </button>
      </div>
    </template>
  </div>
</template>
