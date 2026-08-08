<script setup lang="ts">
import { Role, UserStatus } from '~/utils/enums'
import { mockOrders, mockProfiles } from '~/utils/mockData'
definePageMeta({ layout: 'driver' })
useSeoMeta({ title: 'Phương tiện - BunTech Driver' })
const toast = useToast()
const loading = ref(true)
const currentDriver = computed(() =>
  mockProfiles.find(p => p.role === Role.DRIVER && p.status === UserStatus.ACTIVE) || mockProfiles[2]
)
// Vehicle stats from orders
const vehicleStats = computed(() => {
  const driverId = currentDriver.value?.id
  const orders = mockOrders.filter(o => o.driver_id === driverId)
  const trips = orders.length
  const distance = orders.reduce((sum, o) => {
    let seed = 0
    for (let i = 0; i < o.id.length; i++) seed = (seed * 31 + o.id.charCodeAt(i)) >>> 0
    return sum + 4 + (seed % 18)
  }, 0)
  return { trips, distance, fuelEfficiency: 42.5, daysActive: 127 }
})
const maintenanceHistory = ref([
  { id: 'm1', date: '2024-07-10', type: 'Bảo dưỡng định kỳ', description: 'Thay dầu máy, lọc gió, kiểm tra phanh. Tất cả hoạt động tốt.', cost: 450000, mileage: 28000, status: 'completed' as const },
  { id: 'm2', date: '2024-06-01', type: 'Thay lốp trước', description: 'Thay lốp trước do mòn vằn. Lốp mới Mitas MC-28.', cost: 680000, mileage: 26500, status: 'completed' as const },
  { id: 'm3', date: '2024-04-15', type: 'Bảo dưỡng định kỳ', description: 'Thay dầu máy, kiểm tra bugi, siết ốc. Xe hoạt động ổn định.', cost: 520000, mileage: 24200, status: 'completed' as const },
  { id: 'm4', date: '2024-02-20', type: 'Sửa chữa phanh', description: 'Thay má phanh sau và độ mâm phanh. Phanh hoạt động nhạy hơn.', cost: 380000, mileage: 22100, status: 'completed' as const },
  { id: 'm5', date: '2024-08-15', type: 'Bảo dưỡng định kỳ sắp tới', description: 'Kiểm tra tổng quát, thay dầu máy và lọc gió.', cost: 0, mileage: 30000, status: 'scheduled' as const },
])
const nextMaintenance = '2024-08-15'
const registrationExpiry = '2025-03-20'
const insuranceExpiry = '2025-01-15'
const daysUntilNextMaintenance = computed(() =>
  Math.max(0, Math.ceil((new Date(nextMaintenance).getTime() - Date.now()) / 86400000))
)
const registrationStatus = computed(() => {
  const days = Math.ceil((new Date(registrationExpiry).getTime() - Date.now()) / 86400000)
  if (days < 0) return { label: 'Đã hết hạn', color: 'error' as const }
  if (days < 30) return { label: `Còn ${days} ngày`, color: 'warning' as const }
  return { label: `Còn ${days} ngày`, color: 'success' as const }
})
const insuranceStatus = computed(() => {
  const days = Math.ceil((new Date(insuranceExpiry).getTime() - Date.now()) / 86400000)
  if (days < 0) return { label: 'Đã hết hạn', color: 'error' as const }
  if (days < 30) return { label: `Còn ${days} ngày`, color: 'warning' as const }
  return { label: `Còn ${days} ngày`, color: 'success' as const }
})
function reportIssue() {
  toast.add({ title: 'Đã gửi báo cáo hỏng hóc. Quản lý sẽ liên hệ bạn sớm.', color: 'success' })
}
function viewSchedule() {
  toast.add({ title: 'Mở lịch bảo dưỡng...', color: 'info' })
}
onMounted(() => { setTimeout(() => { loading.value = false }, 500) })
</script>
<template>
  <div class="p-4 pb-6">
    <!-- Header -->
    <div class="mb-4">
      <h1 class="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">Phương tiện</h1>
      <p class="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">Thông tin xe giao hàng của bạn</p>
    </div>
    <!-- Loading -->
    <template v-if="loading">
      <div class="skeleton h-56 w-full rounded-2xl mb-4" />
      <div class="skeleton h-32 w-full rounded-xl mb-4" />
      <div class="skeleton h-40 w-full rounded-xl" />
    </template>
    <template v-else>
      <!-- Vehicle hero card -->
      <div class="bg-gradient-to-br from-slate-900 via-slate-900 to-primary-950 rounded-2xl p-5 mb-4 text-white relative overflow-hidden">
        <div class="absolute top-0 right-0 w-40 h-40 rounded-full bg-primary-500/15 blur-3xl" />
        <div class="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-info-500/10 blur-2xl" />
        <div class="relative">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-2">
              <div class="w-11 h-11 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                <UIcon name="i-lucide-truck" class="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <p class="text-xs text-slate-400">Biển số</p>
                <p class="text-2xl font-bold tracking-tight tabular-nums">51F-1234</p>
              </div>
            </div>
            <UBadge color="success" variant="solid" size="xs">Hoạt động</UBadge>
          </div>
          <div class="flex items-center gap-2 mb-4 text-slate-300">
            <span class="text-sm font-medium">Honda Blade 110</span>
            <span class="text-slate-500">·</span>
            <span class="text-sm text-slate-400">120 kg</span>
          </div>
          <div class="h-28 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur">
            <UIcon name="i-lucide-truck" class="w-16 h-16 text-primary-400/40" />
          </div>
        </div>
      </div>
      <!-- Info grid -->
      <h2 class="text-sm font-semibold text-neutral-900 dark:text-white mb-3 px-1">Thông số kỹ thuật</h2>
      <div class="grid grid-cols-2 gap-3 mb-4">
        <div class="card p-4">
          <div class="flex items-center gap-1.5 mb-1">
            <UIcon name="i-lucide-gauge" class="w-3.5 h-3.5 text-primary-500" />
            <span class="text-xs text-slate-500 dark:text-zinc-400">Số km hiện tại</span>
          </div>
          <p class="text-lg font-bold text-neutral-900 dark:text-white tabular-nums">{{ formatNumber(vehicleStats.distance * 10) }} <span class="text-xs font-medium text-slate-400">km</span></p>
        </div>
        <div class="card p-4">
          <div class="flex items-center gap-1.5 mb-1">
            <UIcon name="i-lucide-zap" class="w-3.5 h-3.5 text-warning-500" />
            <span class="text-xs text-slate-500 dark:text-zinc-400">Tải trọng</span>
          </div>
          <p class="text-lg font-bold text-neutral-900 dark:text-white">120 <span class="text-xs font-medium text-slate-400">kg</span></p>
        </div>
        <div class="card p-4">
          <div class="flex items-center gap-1.5 mb-1">
            <UIcon name="i-lucide-fuel" class="w-3.5 h-3.5 text-info-500" />
            <span class="text-xs text-slate-500 dark:text-zinc-400">Nhiên liệu</span>
          </div>
          <p class="text-lg font-bold text-neutral-900 dark:text-white">Xăng</p>
        </div>
        <div class="card p-4">
          <div class="flex items-center gap-1.5 mb-1">
            <UIcon name="i-lucide-calendar" class="w-3.5 h-3.5 text-success-500" />
            <span class="text-xs text-slate-500 dark:text-zinc-400">Lần bảo dưỡng cuối</span>
          </div>
          <p class="text-sm font-bold text-neutral-900 dark:text-white">{{ formatDate('2024-07-10') }}</p>
        </div>
      </div>
      <!-- Maintenance schedule banner -->
      <div
        :class="['card p-4 mb-4 border-l-4', daysUntilNextMaintenance <= 7 ? 'border-l-warning-500 bg-warning-50/50 dark:bg-warning-900/10' : 'border-l-primary-500']"
      >
        <div class="flex items-center gap-3">
          <div :class="['w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', daysUntilNextMaintenance <= 7 ? 'bg-warning-100 dark:bg-warning-900/30' : 'bg-primary-50 dark:bg-primary-900/20']">
            <UIcon name="i-lucide-wrench" :class="['w-5 h-5', daysUntilNextMaintenance <= 7 ? 'text-warning-600 dark:text-warning-400' : 'text-primary-600 dark:text-primary-400']" />
          </div>
          <div class="flex-1">
            <p class="text-sm font-semibold text-neutral-900 dark:text-white">Bảo dưỡng tiếp theo</p>
            <p class="text-xs text-slate-500 dark:text-zinc-400">
              {{ formatDate(nextMaintenance) }} ·
              <span :class="daysUntilNextMaintenance <= 7 ? 'text-warning-600 dark:text-warning-400 font-medium' : ''">còn {{ daysUntilNextMaintenance }} ngày</span>
            </p>
          </div>
          <UIcon name="i-lucide-chevron-right" class="w-5 h-5 text-slate-300 dark:text-zinc-600" />
        </div>
      </div>
      <!-- Maintenance history timeline -->
      <div class="card p-5 mb-4">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
            <UIcon name="i-lucide-wrench" class="w-4 h-4 text-slate-400 dark:text-zinc-500" />
            Lịch sử bảo dưỡng
          </h2>
          <span class="text-xs text-slate-400 dark:text-zinc-500 tabular-nums">{{ maintenanceHistory.filter(m => m.status === 'completed').length }} lần</span>
        </div>
        <div class="relative">
          <div class="absolute left-[15px] top-2 bottom-2 w-px bg-neutral-200 dark:bg-neutral-800" />
          <div class="space-y-4">
            <div v-for="m in maintenanceHistory" :key="m.id" class="relative flex gap-3 pl-1">
              <div
                :class="['w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ring-4 ring-white dark:ring-zinc-900 relative z-10', m.status === 'scheduled' ? 'bg-warning-100 dark:bg-warning-900/30' : 'bg-success-100 dark:bg-success-900/30']"
              >
                <UIcon name="i-lucide-circle-dot" :class="['w-4 h-4', m.status === 'scheduled' ? 'text-warning-600 dark:text-warning-400' : 'text-success-600 dark:text-success-400']" />
              </div>
              <div class="flex-1 pb-1">
                <div class="flex items-start justify-between gap-2 mb-0.5">
                  <p class="text-sm font-medium text-neutral-900 dark:text-white">{{ m.type }}</p>
                  <UBadge v-if="m.status === 'scheduled'" color="warning" variant="subtle" size="xs">Sắp tới</UBadge>
                  <UBadge v-else color="success" variant="subtle" size="xs">Hoàn thành</UBadge>
                </div>
                <p class="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed mb-1">{{ m.description }}</p>
                <div class="flex items-center gap-3 text-[11px] text-slate-400 dark:text-zinc-500">
                  <span class="flex items-center gap-1"><UIcon name="i-lucide-calendar" class="w-3 h-3" /> {{ formatDate(m.date) }}</span>
                  <span class="flex items-center gap-1"><UIcon name="i-lucide-gauge" class="w-3 h-3" /> {{ formatNumber(m.mileage) }} km</span>
                  <span v-if="m.cost > 0" class="tabular-nums">{{ formatNumber(m.cost) }} ₫</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Vehicle stats -->
      <div class="card p-5 mb-4">
        <h2 class="font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
          <UIcon name="i-lucide-trending-up" class="w-4 h-4 text-slate-400 dark:text-zinc-500" />
          Thống kê xe
        </h2>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-xs text-slate-500 dark:text-zinc-400 mb-1">Tổng số chuyến</p>
            <p class="text-xl font-bold text-neutral-900 dark:text-white tabular-nums">{{ formatNumber(vehicleStats.trips) }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-500 dark:text-zinc-400 mb-1">Tổng quãng đường</p>
            <p class="text-xl font-bold text-neutral-900 dark:text-white tabular-nums">{{ formatNumber(vehicleStats.distance) }} <span class="text-xs font-medium text-slate-400">km</span></p>
          </div>
          <div>
            <p class="text-xs text-slate-500 dark:text-zinc-400 mb-1">Tiêu hao nhiên liệu</p>
            <p class="text-xl font-bold text-success-600 dark:text-success-400 tabular-nums">{{ vehicleStats.fuelEfficiency }} <span class="text-xs font-medium text-slate-400">km/l</span></p>
          </div>
          <div>
            <p class="text-xs text-slate-500 dark:text-zinc-400 mb-1">Số ngày hoạt động</p>
            <p class="text-xl font-bold text-neutral-900 dark:text-white tabular-nums">{{ formatNumber(vehicleStats.daysActive) }} <span class="text-xs font-medium text-slate-400">ngày</span></p>
          </div>
        </div>
      </div>
      <!-- Documents -->
      <div class="card p-5 mb-4">
        <h2 class="font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
          <UIcon name="i-lucide-file-text" class="w-4 h-4 text-slate-400 dark:text-zinc-500" />
          Giấy tờ xe
        </h2>
        <div class="space-y-3">
          <div class="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-zinc-800/50">
            <div class="w-9 h-9 rounded-lg bg-info-50 dark:bg-info-900/20 flex items-center justify-center flex-shrink-0">
              <UIcon name="i-lucide-file-text" class="w-4.5 h-4.5 text-info-600 dark:text-info-400" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-neutral-900 dark:text-white">Đăng kiểm xe</p>
              <p class="text-xs text-slate-500 dark:text-zinc-400">Hết hạn: {{ formatDate(registrationExpiry) }}</p>
            </div>
            <UBadge :color="registrationStatus.color" variant="subtle" size="xs">{{ registrationStatus.label }}</UBadge>
          </div>
          <div class="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-zinc-800/50">
            <div class="w-9 h-9 rounded-lg bg-success-50 dark:bg-success-900/20 flex items-center justify-center flex-shrink-0">
              <UIcon name="i-lucide-shield-check" class="w-4.5 h-4.5 text-success-600 dark:text-success-400" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-neutral-900 dark:text-white">Bảo hiểm trách nhiệm</p>
              <p class="text-xs text-slate-500 dark:text-zinc-400">Hết hạn: {{ formatDate(insuranceExpiry) }}</p>
            </div>
            <UBadge :color="insuranceStatus.color" variant="subtle" size="xs">{{ insuranceStatus.label }}</UBadge>
          </div>
        </div>
      </div>
      <!-- Action buttons -->
      <div class="grid grid-cols-2 gap-3 pb-6">
        <UButton variant="outline" size="lg" block @click="viewSchedule">
          <UIcon name="i-lucide-calendar" class="w-4 h-4 mr-1" />
          Lịch bảo dưỡng
        </UButton>
        <UButton color="warning" size="lg" block @click="reportIssue">
          <UIcon name="i-lucide-alert-triangle" class="w-4 h-4 mr-1" />
          Báo cáo hỏng hóc
        </UButton>
      </div>
    </template>
  </div>
</template>
