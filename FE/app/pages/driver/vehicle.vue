<script setup lang="ts">
import { driverService } from '~/services/driverService'
import { t } from '~/utils/i18n'

definePageMeta({ layout: 'driver' })
useSeoMeta({ title: t('driver_vehicle_seo_title') })
const toast = useToast()
const loading = ref(true)

const { data: historyData } = useAsyncData('driver-history-stats', () =>
  driverService.getHistory({ limit: 100 })
)

const vehicleStats = computed(() => {
  const routes = historyData.value?.data?.data || []
  const trips = routes.length
  const distance = routes.reduce((sum, r) => {
    let seed = 0
    const idStr = String(r.id)
    for (let i = 0; i < idStr.length; i++) seed = (seed * 31 + idStr.charCodeAt(i)) >>> 0
    return sum + 4 + (seed % 18)
  }, 0)
  return { trips, distance, fuelEfficiency: 42.5, daysActive: 127 }
})
const maintenanceHistory = ref([
  {
    id: 'm1',
    date: '2024-07-10',
    type: t('driver_vehicle_mock_type_1'),
    description: t('driver_vehicle_mock_desc_1'),
    cost: 450000,
    mileage: 28000,
    status: 'completed' as const
  },
  {
    id: 'm2',
    date: '2024-06-01',
    type: t('driver_vehicle_mock_type_2'),
    description: t('driver_vehicle_mock_desc_2'),
    cost: 680000,
    mileage: 26500,
    status: 'completed' as const
  },
  {
    id: 'm3',
    date: '2024-04-15',
    type: t('driver_vehicle_mock_type_1'),
    description: t('driver_vehicle_mock_desc_3'),
    cost: 520000,
    mileage: 24200,
    status: 'completed' as const
  },
  {
    id: 'm4',
    date: '2024-02-20',
    type: t('driver_vehicle_mock_type_4'),
    description: t('driver_vehicle_mock_desc_4'),
    cost: 380000,
    mileage: 22100,
    status: 'completed' as const
  },
  {
    id: 'm5',
    date: '2024-08-15',
    type: t('driver_vehicle_mock_type_5'),
    description: t('driver_vehicle_mock_desc_5'),
    cost: 0,
    mileage: 30000,
    status: 'scheduled' as const
  }
])
const nextMaintenance = '2024-08-15'
const registrationExpiry = '2025-03-20'
const insuranceExpiry = '2025-01-15'
const daysUntilNextMaintenance = computed(() =>
  Math.max(0, Math.ceil((new Date(nextMaintenance).getTime() - Date.now()) / 86400000))
)
const registrationStatus = computed(() => {
  const days = Math.ceil((new Date(registrationExpiry).getTime() - Date.now()) / 86400000)
  if (days < 0) return { label: t('driver_vehicle_docs_expired'), color: 'error' as const }
  if (days < 30)
    return { label: t('driver_vehicle_docs_expires_in', { days }), color: 'warning' as const }
  return { label: t('driver_vehicle_docs_expires_in', { days }), color: 'success' as const }
})
const insuranceStatus = computed(() => {
  const days = Math.ceil((new Date(insuranceExpiry).getTime() - Date.now()) / 86400000)
  if (days < 0) return { label: t('driver_vehicle_docs_expired'), color: 'error' as const }
  if (days < 30)
    return { label: t('driver_vehicle_docs_expires_in', { days }), color: 'warning' as const }
  return { label: t('driver_vehicle_docs_expires_in', { days }), color: 'success' as const }
})
function reportIssue() {
  toast.add({ title: t('driver_vehicle_msg_report_success'), color: 'success' })
}
function viewSchedule() {
  toast.add({ title: t('driver_vehicle_msg_schedule'), color: 'info' })
}
onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 500)
})
</script>
<template>
  <div class="p-4 pb-6">
    <!-- Header -->
    <div class="mb-4">
      <h1 class="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
        {{ $t('driver_vehicle') }}
      </h1>
      <p class="mt-0.5 text-sm text-slate-500 dark:text-zinc-400">
        {{ $t('driver_vehicle_desc') }}
      </p>
    </div>
    <!-- Loading -->
    <template v-if="loading">
      <div class="skeleton mb-4 h-56 w-full rounded-2xl" />
      <div class="skeleton mb-4 h-32 w-full rounded-xl" />
      <div class="skeleton h-40 w-full rounded-xl" />
    </template>
    <template v-else>
      <!-- Vehicle hero card -->
      <div
        class="to-primary-950 relative mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 p-5 text-white"
      >
        <div class="bg-primary-500/15 absolute top-0 right-0 h-40 w-40 rounded-full blur-3xl" />
        <div class="bg-info-500/10 absolute bottom-0 left-0 h-32 w-32 rounded-full blur-2xl" />
        <div class="relative">
          <div class="mb-4 flex items-start justify-between">
            <div class="flex items-center gap-2">
              <div
                class="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur"
              >
                <UIcon name="i-lucide-truck" class="text-primary-400 h-6 w-6" />
              </div>
              <div>
                <p class="text-xs text-slate-400">{{ $t('driver_vehicle_plate') }}</p>
                <p class="text-2xl font-bold tracking-tight tabular-nums">51F-1234</p>
              </div>
            </div>
            <UBadge color="success" variant="solid" size="xs">{{
              $t('status_user_active')
            }}</UBadge>
          </div>
          <div class="mb-4 flex items-center gap-2 text-slate-300">
            <span class="text-sm font-medium">Honda Blade 110</span>
            <span class="text-slate-500">·</span>
            <span class="text-sm text-slate-400">120 kg</span>
          </div>
          <div
            class="flex h-28 items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur"
          >
            <UIcon name="i-lucide-truck" class="text-primary-400/40 h-16 w-16" />
          </div>
        </div>
      </div>
      <!-- Info grid -->
      <h2 class="mb-3 px-1 text-sm font-semibold text-neutral-900 dark:text-white">
        {{ $t('driver_vehicle_specs_title') }}
      </h2>
      <div class="mb-4 grid grid-cols-2 gap-3">
        <div class="card p-4">
          <div class="mb-1 flex items-center gap-1.5">
            <UIcon name="i-lucide-gauge" class="text-primary-500 h-3.5 w-3.5" />
            <span class="text-xs text-slate-500 dark:text-zinc-400">{{
              $t('driver_vehicle_specs_mileage')
            }}</span>
          </div>
          <p class="text-lg font-bold text-neutral-900 tabular-nums dark:text-white">
            {{ formatNumber(vehicleStats.distance * 10) }}
            <span class="text-xs font-medium text-slate-400">km</span>
          </p>
        </div>
        <div class="card p-4">
          <div class="mb-1 flex items-center gap-1.5">
            <UIcon name="i-lucide-zap" class="text-warning-500 h-3.5 w-3.5" />
            <span class="text-xs text-slate-500 dark:text-zinc-400">{{
              $t('driver_vehicle_specs_payload')
            }}</span>
          </div>
          <p class="text-lg font-bold text-neutral-900 dark:text-white">
            120 <span class="text-xs font-medium text-slate-400">kg</span>
          </p>
        </div>
        <div class="card p-4">
          <div class="mb-1 flex items-center gap-1.5">
            <UIcon name="i-lucide-fuel" class="text-info-500 h-3.5 w-3.5" />
            <span class="text-xs text-slate-500 dark:text-zinc-400">{{
              $t('driver_vehicle_specs_fuel')
            }}</span>
          </div>
          <p class="text-lg font-bold text-neutral-900 dark:text-white">
            {{ $t('driver_vehicle_specs_fuel_type') }}
          </p>
        </div>
        <div class="card p-4">
          <div class="mb-1 flex items-center gap-1.5">
            <UIcon name="i-lucide-calendar" class="text-success-500 h-3.5 w-3.5" />
            <span class="text-xs text-slate-500 dark:text-zinc-400">{{
              $t('driver_vehicle_specs_last_maintenance')
            }}</span>
          </div>
          <p class="text-sm font-bold text-neutral-900 dark:text-white">
            {{ formatDate('2024-07-10') }}
          </p>
        </div>
      </div>
      <!-- Maintenance schedule banner -->
      <div
        :class="[
          'card mb-4 border-l-4 p-4',
          daysUntilNextMaintenance <= 7
            ? 'border-l-warning-500 bg-warning-50/50 dark:bg-warning-900/10'
            : 'border-l-primary-500'
        ]"
      >
        <div class="flex items-center gap-3">
          <div
            :class="[
              'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl',
              daysUntilNextMaintenance <= 7
                ? 'bg-warning-100 dark:bg-warning-900/30'
                : 'bg-primary-50 dark:bg-primary-900/20'
            ]"
          >
            <UIcon
              name="i-lucide-wrench"
              :class="[
                'h-5 w-5',
                daysUntilNextMaintenance <= 7
                  ? 'text-warning-600 dark:text-warning-400'
                  : 'text-primary-600 dark:text-primary-400'
              ]"
            />
          </div>
          <div class="flex-1">
            <p class="text-sm font-semibold text-neutral-900 dark:text-white">
              {{ $t('driver_vehicle_next_maintenance') }}
            </p>
            <p class="text-xs text-slate-500 dark:text-zinc-400">
              {{ formatDate(nextMaintenance) }} ·
              <span
                :class="
                  daysUntilNextMaintenance <= 7
                    ? 'text-warning-600 dark:text-warning-400 font-medium'
                    : ''
                "
                >{{ $t('driver_vehicle_days_left', { days: daysUntilNextMaintenance }) }}</span
              >
            </p>
          </div>
          <UIcon name="i-lucide-chevron-right" class="h-5 w-5 text-slate-300 dark:text-zinc-600" />
        </div>
      </div>
      <!-- Maintenance history timeline -->
      <div class="card mb-4 p-5">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="flex items-center gap-2 font-semibold text-neutral-900 dark:text-white">
            <UIcon name="i-lucide-wrench" class="h-4 w-4 text-slate-400 dark:text-zinc-500" />
            {{ $t('driver_vehicle_history_title') }}
          </h2>
          <span class="text-xs text-slate-400 tabular-nums dark:text-zinc-500">{{
            $t('driver_vehicle_history_count', {
              count: maintenanceHistory.filter((m) => m.status === 'completed').length
            })
          }}</span>
        </div>
        <div class="relative">
          <div
            class="absolute top-2 bottom-2 left-[15px] w-px bg-neutral-200 dark:bg-neutral-800"
          />
          <div class="space-y-4">
            <div v-for="m in maintenanceHistory" :key="m.id" class="relative flex gap-3 pl-1">
              <div
                :class="[
                  'relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ring-4 ring-white dark:ring-zinc-900',
                  m.status === 'scheduled'
                    ? 'bg-warning-100 dark:bg-warning-900/30'
                    : 'bg-success-100 dark:bg-success-900/30'
                ]"
              >
                <UIcon
                  name="i-lucide-circle-dot"
                  :class="[
                    'h-4 w-4',
                    m.status === 'scheduled'
                      ? 'text-warning-600 dark:text-warning-400'
                      : 'text-success-600 dark:text-success-400'
                  ]"
                />
              </div>
              <div class="flex-1 pb-1">
                <div class="mb-0.5 flex items-start justify-between gap-2">
                  <p class="text-sm font-medium text-neutral-900 dark:text-white">{{ m.type }}</p>
                  <UBadge
                    v-if="m.status === 'scheduled'"
                    color="warning"
                    variant="subtle"
                    size="xs"
                    >{{ $t('driver_vehicle_status_scheduled') }}</UBadge
                  >
                  <UBadge v-else color="success" variant="subtle" size="xs">{{
                    $t('driver_deliv_status_done')
                  }}</UBadge>
                </div>
                <p class="mb-1 text-xs leading-relaxed text-slate-500 dark:text-zinc-400">
                  {{ m.description }}
                </p>
                <div class="flex items-center gap-3 text-[11px] text-slate-400 dark:text-zinc-500">
                  <span class="flex items-center gap-1"
                    ><UIcon name="i-lucide-calendar" class="h-3 w-3" />
                    {{ formatDate(m.date) }}</span
                  >
                  <span class="flex items-center gap-1"
                    ><UIcon name="i-lucide-gauge" class="h-3 w-3" />
                    {{ formatNumber(m.mileage) }} km</span
                  >
                  <span v-if="m.cost > 0" class="tabular-nums">{{ formatNumber(m.cost) }} ₫</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Vehicle stats -->
      <div class="card mb-4 p-5">
        <h2 class="mb-4 flex items-center gap-2 font-semibold text-neutral-900 dark:text-white">
          <UIcon name="i-lucide-trending-up" class="h-4 w-4 text-slate-400 dark:text-zinc-500" />
          {{ $t('driver_vehicle_stats_title') }}
        </h2>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="mb-1 text-xs text-slate-500 dark:text-zinc-400">
              {{ $t('driver_vehicle_stats_trips') }}
            </p>
            <p class="text-xl font-bold text-neutral-900 tabular-nums dark:text-white">
              {{ formatNumber(vehicleStats.trips) }}
            </p>
          </div>
          <div>
            <p class="mb-1 text-xs text-slate-500 dark:text-zinc-400">
              {{ $t('driver_history_stat_distance') }}
            </p>
            <p class="text-xl font-bold text-neutral-900 tabular-nums dark:text-white">
              {{ formatNumber(vehicleStats.distance) }}
              <span class="text-xs font-medium text-slate-400">km</span>
            </p>
          </div>
          <div>
            <p class="mb-1 text-xs text-slate-500 dark:text-zinc-400">
              {{ $t('driver_vehicle_stats_fuel_efficiency') }}
            </p>
            <p class="text-success-600 dark:text-success-400 text-xl font-bold tabular-nums">
              {{ vehicleStats.fuelEfficiency }}
              <span class="text-xs font-medium text-slate-400">km/l</span>
            </p>
          </div>
          <div>
            <p class="mb-1 text-xs text-slate-500 dark:text-zinc-400">
              {{ $t('driver_vehicle_stats_days_active') }}
            </p>
            <p class="text-xl font-bold text-neutral-900 tabular-nums dark:text-white">
              {{ formatNumber(vehicleStats.daysActive) }}
              <span class="text-xs font-medium text-slate-400">{{
                $t('driver_vehicle_days')
              }}</span>
            </p>
          </div>
        </div>
      </div>
      <!-- Documents -->
      <div class="card mb-4 p-5">
        <h2 class="mb-4 flex items-center gap-2 font-semibold text-neutral-900 dark:text-white">
          <UIcon name="i-lucide-file-text" class="h-4 w-4 text-slate-400 dark:text-zinc-500" />
          {{ $t('driver_vehicle_docs_title') }}
        </h2>
        <div class="space-y-3">
          <div class="flex items-center gap-3 rounded-xl bg-neutral-50 p-3 dark:bg-zinc-800/50">
            <div
              class="bg-info-50 dark:bg-info-900/20 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
            >
              <UIcon
                name="i-lucide-file-text"
                class="text-info-600 dark:text-info-400 h-4.5 w-4.5"
              />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-neutral-900 dark:text-white">
                {{ $t('driver_vehicle_docs_registration') }}
              </p>
              <p class="text-xs text-slate-500 dark:text-zinc-400">
                {{ $t('driver_vehicle_docs_expiry', { date: formatDate(registrationExpiry) }) }}
              </p>
            </div>
            <UBadge :color="registrationStatus.color" variant="subtle" size="xs">{{
              registrationStatus.label
            }}</UBadge>
          </div>
          <div class="flex items-center gap-3 rounded-xl bg-neutral-50 p-3 dark:bg-zinc-800/50">
            <div
              class="bg-success-50 dark:bg-success-900/20 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
            >
              <UIcon
                name="i-lucide-shield-check"
                class="text-success-600 dark:text-success-400 h-4.5 w-4.5"
              />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-neutral-900 dark:text-white">
                {{ $t('driver_vehicle_docs_insurance') }}
              </p>
              <p class="text-xs text-slate-500 dark:text-zinc-400">
                {{ $t('driver_vehicle_docs_expiry', { date: formatDate(insuranceExpiry) }) }}
              </p>
            </div>
            <UBadge :color="insuranceStatus.color" variant="subtle" size="xs">{{
              insuranceStatus.label
            }}</UBadge>
          </div>
        </div>
      </div>
      <!-- Action buttons -->
      <div class="grid grid-cols-2 gap-3 pb-6">
        <UButton variant="outline" size="lg" block @click="viewSchedule">
          <UIcon name="i-lucide-calendar" class="mr-1 h-4 w-4" />
          {{ $t('driver_vehicle_btn_schedule') }}
        </UButton>
        <UButton color="warning" size="lg" block @click="reportIssue">
          <UIcon name="i-lucide-alert-triangle" class="mr-1 h-4 w-4" />
          {{ $t('driver_vehicle_btn_report') }}
        </UButton>
      </div>
    </template>
  </div>
</template>
