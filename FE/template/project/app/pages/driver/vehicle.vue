<script setup lang="ts">
import {
  Truck, Fuel, Calendar, Wrench, Gauge, FileText, ShieldCheck,
  AlertTriangle, ChevronRight, Zap, TrendingUp, CircleDot, Route as RouteIcon,
} from 'lucide-vue-next'
import { VehicleStatus, Role, UserStatus } from '../../core/enums'
import { mockVehicles, mockProfiles, mockOrders } from '../../core/mock/data'

const { t } = useI18n()
const { formatNumber, formatDate } = useFormat()
const toast = useToast()

useHead({ title: 'Phương tiện - BunTech Driver' })
definePageMeta({ layout: 'driver' })

const loading = ref(true)

// Current driver
const currentDriver = computed(() => {
  return mockProfiles.find(p => p.role === Role.DRIVER && p.status === UserStatus.ACTIVE) || mockProfiles[2]
})

// Find vehicle assigned to current driver
const vehicle = computed(() => {
  const driverId = currentDriver.value?.id
  return mockVehicles.find(v => v.driver_id === driverId) || mockVehicles[0]
})

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
  const daysActive = vehicle.value ? Math.max(1, Math.floor((Date.now() - new Date(vehicle.value.created_at).getTime()) / 86400000)) : 1
  return { trips, distance, fuelEfficiency: 42.5, daysActive }
})

// Inline mock maintenance history (5 entries)
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

const daysUntilNextMaintenance = computed(() => {
  return Math.max(0, Math.ceil((new Date(nextMaintenance).getTime() - Date.now()) / 86400000))
})

const registrationStatus = computed(() => {
  const days = Math.ceil((new Date(registrationExpiry).getTime() - Date.now()) / 86400000)
  if (days < 0) return { label: 'Đã hết hạn', color: 'danger' as const }
  if (days < 30) return { label: `Còn ${days} ngày`, color: 'warning' as const }
  return { label: `Còn ${days} ngày`, color: 'success' as const }
})

const insuranceStatus = computed(() => {
  const days = Math.ceil((new Date(insuranceExpiry).getTime() - Date.now()) / 86400000)
  if (days < 0) return { label: 'Đã hết hạn', color: 'danger' as const }
  if (days < 30) return { label: `Còn ${days} ngày`, color: 'warning' as const }
  return { label: `Còn ${days} ngày`, color: 'success' as const }
})

const vehicleStatusBadge = computed(() => {
  if (!vehicle.value) return { color: 'gray' as const, label: 'Không xác định' }
  if (vehicle.value.status === VehicleStatus.ACTIVE) return { color: 'success' as const, label: 'Hoạt động' }
  if (vehicle.value.status === VehicleStatus.MAINTENANCE) return { color: 'warning' as const, label: 'Bảo dưỡng' }
  return { color: 'danger' as const, label: 'Ngừng hoạt động' }
})

function reportIssue() {
  toast.success('Đã gửi báo cáo hỏng hóc. Quản lý sẽ liên hệ bạn sớm.')
}

function viewSchedule() {
  toast.info('Mở lịch bảo dưỡng...')
}

function load() {
  loading.value = true
  setTimeout(() => { loading.value = false }, 500)
}

onMounted(load)
</script>

<template>
  <div class="p-4 pb-6">
    <!-- Header -->
    <div class="mb-4">
      <h1 class="text-xl font-bold text-surface-foreground tracking-tight">Phương tiện</h1>
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
        <div class="absolute top-0 right-0 w-40 h-40 rounded-full bg-primary-500/15 blur-3xl" aria-hidden="true" />
        <div class="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-info-500/10 blur-2xl" aria-hidden="true" />
        <div class="relative">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-2">
              <div class="w-11 h-11 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                <Truck class="w-6 h-6 text-primary-400" aria-hidden="true" />
              </div>
              <div>
                <p class="text-xs text-slate-400">Biển số</p>
                <p class="text-2xl font-bold tracking-tight tabular-nums">{{ vehicle?.plate_number || 'Chưa cấp' }}</p>
              </div>
            </div>
            <AppBadge :color="vehicleStatusBadge.color" variant="solid" dot>{{ vehicleStatusBadge.label }}</AppBadge>
          </div>
          <div class="flex items-center gap-2 mb-4 text-slate-300">
            <span class="text-sm font-medium">{{ vehicle?.model || 'Chưa có thông tin' }}</span>
            <span class="text-slate-500">·</span>
            <span class="text-sm text-slate-400">{{ vehicle?.capacity || 120 }} kg</span>
          </div>
          <div class="h-28 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur">
            <Truck class="w-16 h-16 text-primary-400/40" aria-hidden="true" />
          </div>
        </div>
      </div>

      <!-- Info grid -->
      <h2 class="text-sm font-semibold text-surface-foreground mb-3 px-1">Thông số kỹ thuật</h2>
      <div class="grid grid-cols-2 gap-3 mb-4">
        <div class="card p-4">
          <div class="flex items-center gap-1.5 mb-1">
            <Gauge class="w-3.5 h-3.5 text-primary-500" aria-hidden="true" />
            <span class="text-xs text-slate-500 dark:text-zinc-400">Số km hiện tại</span>
          </div>
          <p class="text-lg font-bold text-surface-foreground tabular-nums">{{ formatNumber(vehicleStats.distance * 10) }} <span class="text-xs font-medium text-slate-400">km</span></p>
        </div>
        <div class="card p-4">
          <div class="flex items-center gap-1.5 mb-1">
            <Zap class="w-3.5 h-3.5 text-warning-500" aria-hidden="true" />
            <span class="text-xs text-slate-500 dark:text-zinc-400">Tải trọng</span>
          </div>
          <p class="text-lg font-bold text-surface-foreground">{{ vehicle?.capacity || 120 }} <span class="text-xs font-medium text-slate-400">kg</span></p>
        </div>
        <div class="card p-4">
          <div class="flex items-center gap-1.5 mb-1">
            <Fuel class="w-3.5 h-3.5 text-info-500" aria-hidden="true" />
            <span class="text-xs text-slate-500 dark:text-zinc-400">Nhiên liệu</span>
          </div>
          <p class="text-lg font-bold text-surface-foreground">Xăng</p>
        </div>
        <div class="card p-4">
          <div class="flex items-center gap-1.5 mb-1">
            <Calendar class="w-3.5 h-3.5 text-success-500" aria-hidden="true" />
            <span class="text-xs text-slate-500 dark:text-zinc-400">Lần bảo dưỡng cuối</span>
          </div>
          <p class="text-sm font-bold text-surface-foreground">{{ formatDate(vehicle?.last_maintenance || '2024-07-10') }}</p>
        </div>
      </div>

      <!-- Maintenance schedule banner -->
      <div
        :class="[
          'card p-4 mb-4 border-l-4',
          daysUntilNextMaintenance <= 7 ? 'border-l-warning-500 bg-warning-50/50 dark:bg-warning-900/10' : 'border-l-primary-500',
        ]"
      >
        <div class="flex items-center gap-3">
          <div :class="[
            'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
            daysUntilNextMaintenance <= 7 ? 'bg-warning-100 dark:bg-warning-900/30' : 'bg-primary-50 dark:bg-primary-900/20',
          ]">
            <Wrench :class="['w-5 h-5', daysUntilNextMaintenance <= 7 ? 'text-warning-600 dark:text-warning-400' : 'text-primary-600 dark:text-primary-400']" aria-hidden="true" />
          </div>
          <div class="flex-1">
            <p class="text-sm font-semibold text-surface-foreground">Bảo dưỡng tiếp theo</p>
            <p class="text-xs text-slate-500 dark:text-zinc-400">
              {{ formatDate(nextMaintenance) }} ·
              <span :class="daysUntilNextMaintenance <= 7 ? 'text-warning-600 dark:text-warning-400 font-medium' : ''">còn {{ daysUntilNextMaintenance }} ngày</span>
            </p>
          </div>
          <ChevronRight class="w-5 h-5 text-slate-300 dark:text-zinc-600" aria-hidden="true" />
        </div>
      </div>

      <!-- Maintenance history timeline -->
      <div class="card p-5 mb-4">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold text-surface-foreground flex items-center gap-2">
            <Wrench class="w-4 h-4 text-slate-400 dark:text-zinc-500" aria-hidden="true" />
            Lịch sử bảo dưỡng
          </h2>
          <span class="text-xs text-slate-400 dark:text-zinc-500 tabular-nums">{{ maintenanceHistory.filter(m => m.status === 'completed').length }} lần</span>
        </div>
        <div class="relative">
          <div class="absolute left-[15px] top-2 bottom-2 w-px bg-surface-border" aria-hidden="true" />
          <div class="space-y-4">
            <div v-for="m in maintenanceHistory" :key="m.id" class="relative flex gap-3 pl-1">
              <div
                :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ring-4 ring-surface relative z-10',
                  m.status === 'scheduled' ? 'bg-warning-100 dark:bg-warning-900/30' : 'bg-success-100 dark:bg-success-900/30',
                ]"
              >
                <CircleDot :class="['w-4 h-4', m.status === 'scheduled' ? 'text-warning-600 dark:text-warning-400' : 'text-success-600 dark:text-success-400']" aria-hidden="true" />
              </div>
              <div class="flex-1 pb-1">
                <div class="flex items-start justify-between gap-2 mb-0.5">
                  <p class="text-sm font-medium text-surface-foreground">{{ m.type }}</p>
                  <AppBadge v-if="m.status === 'scheduled'" color="warning">Sắp tới</AppBadge>
                  <AppBadge v-else color="success">Hoàn thành</AppBadge>
                </div>
                <p class="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed mb-1">{{ m.description }}</p>
                <div class="flex items-center gap-3 text-[11px] text-slate-400 dark:text-zinc-500">
                  <span class="flex items-center gap-1"><Calendar class="w-3 h-3" aria-hidden="true" /> {{ formatDate(m.date) }}</span>
                  <span class="flex items-center gap-1"><Gauge class="w-3 h-3" aria-hidden="true" /> {{ formatNumber(m.mileage) }} km</span>
                  <span v-if="m.cost > 0" class="tabular-nums">{{ formatNumber(m.cost) }} ₫</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vehicle stats -->
      <div class="card p-5 mb-4">
        <h2 class="font-semibold text-surface-foreground mb-4 flex items-center gap-2">
          <TrendingUp class="w-4 h-4 text-slate-400 dark:text-zinc-500" aria-hidden="true" />
          Thống kê xe
        </h2>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-xs text-slate-500 dark:text-zinc-400 mb-1">Tổng số chuyến</p>
            <p class="text-xl font-bold text-surface-foreground tabular-nums">{{ formatNumber(vehicleStats.trips) }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-500 dark:text-zinc-400 mb-1">Tổng quãng đường</p>
            <p class="text-xl font-bold text-surface-foreground tabular-nums">{{ formatNumber(vehicleStats.distance) }} <span class="text-xs font-medium text-slate-400">km</span></p>
          </div>
          <div>
            <p class="text-xs text-slate-500 dark:text-zinc-400 mb-1">Tiêu hao nhiên liệu</p>
            <p class="text-xl font-bold text-success-600 dark:text-success-400 tabular-nums">{{ vehicleStats.fuelEfficiency }} <span class="text-xs font-medium text-slate-400">km/l</span></p>
          </div>
          <div>
            <p class="text-xs text-slate-500 dark:text-zinc-400 mb-1">Số ngày hoạt động</p>
            <p class="text-xl font-bold text-surface-foreground tabular-nums">{{ formatNumber(vehicleStats.daysActive) }} <span class="text-xs font-medium text-slate-400">ngày</span></p>
          </div>
        </div>
      </div>

      <!-- Documents -->
      <div class="card p-5 mb-4">
        <h2 class="font-semibold text-surface-foreground mb-4 flex items-center gap-2">
          <FileText class="w-4 h-4 text-slate-400 dark:text-zinc-500" aria-hidden="true" />
          Giấy tờ xe
        </h2>
        <div class="space-y-3">
          <div class="flex items-center gap-3 p-3 rounded-xl bg-surface-hover/50">
            <div class="w-9 h-9 rounded-lg bg-info-50 dark:bg-info-900/20 flex items-center justify-center flex-shrink-0">
              <FileText class="w-4.5 h-4.5 text-info-600 dark:text-info-400" aria-hidden="true" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-surface-foreground">Đăng kiểm xe</p>
              <p class="text-xs text-slate-500 dark:text-zinc-400">Hết hạn: {{ formatDate(registrationExpiry) }}</p>
            </div>
            <AppBadge :color="registrationStatus.color" :dot="registrationStatus.color === 'danger'">{{ registrationStatus.label }}</AppBadge>
          </div>
          <div class="flex items-center gap-3 p-3 rounded-xl bg-surface-hover/50">
            <div class="w-9 h-9 rounded-lg bg-success-50 dark:bg-success-900/20 flex items-center justify-center flex-shrink-0">
              <ShieldCheck class="w-4.5 h-4.5 text-success-600 dark:text-success-400" aria-hidden="true" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-surface-foreground">Bảo hiểm trách nhiệm</p>
              <p class="text-xs text-slate-500 dark:text-zinc-400">Hết hạn: {{ formatDate(insuranceExpiry) }}</p>
            </div>
            <AppBadge :color="insuranceStatus.color" :dot="insuranceStatus.color === 'danger'">{{ insuranceStatus.label }}</AppBadge>
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="grid grid-cols-2 gap-3 pb-6">
        <AppButton variant="outline" size="md" @click="viewSchedule">
          <Calendar class="w-4 h-4" aria-hidden="true" />
          Lịch bảo dưỡng
        </AppButton>
        <AppButton variant="warning" size="md" @click="reportIssue">
          <AlertTriangle class="w-4 h-4" aria-hidden="true" />
          Báo cáo hỏng hóc
        </AppButton>
      </div>
    </template>
  </div>
</template>
