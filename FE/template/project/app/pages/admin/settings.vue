<script setup lang="ts">
import {
  Building2, Bell, Palette, Settings2, Check, Sun, Moon, Monitor, Save,
  Truck, Package, AlertTriangle, Mail, Database, HardDrive, Activity,
  Server, Zap, CircleDot,
} from 'lucide-vue-next'

const { t } = useI18n()
const toast = useToast()
const { colorMode, toggleDark, initDark } = useColorMode()
useHead({ title: `${t('nav.settings')} - BunTech Admin` })
definePageMeta({ layout: 'admin' })

// Ensure dark mode initialized on client
onMounted(() => { initDark() })

type TabKey = 'company' | 'notifications' | 'appearance' | 'system'
const activeTab = ref<TabKey>('company')

const tabs = [
  { key: 'company' as TabKey, label: 'Công ty', icon: Building2 },
  { key: 'notifications' as TabKey, label: 'Thông báo', icon: Bell },
  { key: 'appearance' as TabKey, label: 'Giao diện', icon: Palette },
  { key: 'system' as TabKey, label: 'Hệ thống', icon: Settings2 },
]

const saving = ref(false)

// Company form
const companyForm = ref({
  workshop_name: 'Xưởng bún BunTech',
  workshop_address: '45 Lê Lợi, Phường Bến Nghé, Quận 1, TP. HCM',
  workshop_phone: '0901 234 567',
  currency: 'VND',
  tax_code: '0301234567',
  business_hours: '5:00 - 18:00',
})

// Notifications toggles
const notifications = ref({
  order_notifications: true,
  delivery_alerts: true,
  low_stock_warnings: true,
  daily_summary_email: false,
})

const notificationItems = [
  { key: 'order_notifications' as const, label: 'Thông báo đơn hàng mới', description: 'Nhận thông báo khi có đơn hàng mới được tạo', icon: Package, color: 'primary' as const },
  { key: 'delivery_alerts' as const, label: 'Cảnh báo giao hàng', description: 'Thông báo khi đơn hàng bị trễ hoặc có vấn đề', icon: Truck, color: 'accent' as const },
  { key: 'low_stock_warnings' as const, label: 'Cảnh báo tồn kho thấp', description: 'Nhận cảnh báo khi sản phẩm sắp hết hàng', icon: AlertTriangle, color: 'warning' as const },
  { key: 'daily_summary_email' as const, label: 'Email tổng hợp hàng ngày', description: 'Báo cáo tổng kết hoạt động gửi qua email mỗi tối', icon: Mail, color: 'info' as const },
]

const notifColorMap: Record<string, { bg: string; text: string; ring: string }> = {
  primary: { bg: 'bg-primary-50 dark:bg-primary-900/20', text: 'text-primary-600 dark:text-primary-400', ring: 'ring-primary-100 dark:ring-primary-900/30' },
  accent: { bg: 'bg-accent-50 dark:bg-accent-900/20', text: 'text-accent-600 dark:text-accent-400', ring: 'ring-accent-100 dark:ring-accent-900/30' },
  warning: { bg: 'bg-warning-50 dark:bg-warning-900/20', text: 'text-warning-600 dark:text-warning-400', ring: 'ring-warning-100 dark:ring-warning-900/30' },
  info: { bg: 'bg-info-50 dark:bg-info-900/20', text: 'text-info-600 dark:text-info-400', ring: 'ring-info-100 dark:ring-info-900/30' },
}

// Appearance
const themeMode = ref<'light' | 'dark' | 'system'>('light')
const denseMode = ref(false)
const sidebarPosition = ref<'left' | 'right'>('left')

const themeOptions = [
  { value: 'light' as const, label: 'Sáng', icon: Sun, preview: 'bg-white border-slate-200' },
  { value: 'dark' as const, label: 'Tối', icon: Moon, preview: 'bg-zinc-900 border-zinc-700' },
  { value: 'system' as const, label: 'Hệ thống', icon: Monitor, preview: 'bg-gradient-to-br from-white to-zinc-900 border-slate-300' },
]

function applyTheme(mode: 'light' | 'dark' | 'system') {
  themeMode.value = mode
  if (mode === 'system') {
    if (import.meta.client) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      colorMode.value = prefersDark ? 'dark' : 'light'
      document.documentElement.classList.toggle('dark', prefersDark)
    }
  } else {
    colorMode.value = mode
    if (import.meta.client) document.documentElement.classList.toggle('dark', mode === 'dark')
  }
}

// System form
const systemForm = ref({
  data_retention: '90',
  backup_frequency: 'daily',
  maintenance_mode: false,
})

const systemStatuses = ref([
  { label: 'API Server', status: 'operational', uptime: '99.98%', icon: Server, color: 'success' as const },
  { label: 'Cơ sở dữ liệu', status: 'operational', uptime: '99.99%', icon: Database, color: 'success' as const },
  { label: 'Lưu trữ file', status: 'operational', uptime: '100%', icon: HardDrive, color: 'success' as const },
  { label: 'Realtime Sync', status: 'degraded', uptime: '98.50%', icon: Activity, color: 'warning' as const },
])

const statusColorMap: Record<string, { bg: string; text: string; ring: string; dot: string; label: string }> = {
  operational: { bg: 'bg-success-50 dark:bg-success-900/20', text: 'text-success-600 dark:text-success-400', ring: 'ring-success-100 dark:ring-success-900/30', dot: 'bg-success-500', label: 'Hoạt động' },
  degraded: { bg: 'bg-warning-50 dark:bg-warning-900/20', text: 'text-warning-600 dark:text-warning-400', ring: 'ring-warning-100 dark:ring-warning-900/30', dot: 'bg-warning-500', label: 'Chậm' },
  down: { bg: 'bg-danger-50 dark:bg-danger-900/20', text: 'text-danger-600 dark:text-danger-400', ring: 'ring-danger-100 dark:ring-danger-900/30', dot: 'bg-danger-500', label: 'Sự cố' },
}

const backupOptions = [
  { value: 'hourly', label: 'Mỗi giờ' },
  { value: 'daily', label: 'Hàng ngày' },
  { value: 'weekly', label: 'Hàng tuần' },
]

const retentionOptions = [
  { value: '30', label: '30 ngày' },
  { value: '90', label: '90 ngày' },
  { value: '180', label: '180 ngày' },
  { value: '365', label: '1 năm' },
]

async function handleSave() {
  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 600))
    toast.success(t('settings.saveSuccess'))
  } catch {
    toast.error(t('errors.saveFailed'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <AppPageHeader
      :title="t('settings.title')"
      subtitle="Quản lý cấu hình xưởng, thông báo, giao diện và hệ thống"
      :breadcrumb-label="t('nav.settings')"
    />

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
      <!-- Tab Navigation (sidebar on desktop) -->
      <nav class="lg:col-span-1">
        <div class="card p-2 stagger-item lg:sticky lg:top-4" style="animation-delay: 0ms">
          <div class="flex lg:flex-col gap-1 overflow-x-auto scrollbar-hide -mx-1 px-1">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              :class="[
                'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap min-h-[44px] flex-shrink-0 lg:flex-1 text-left',
                activeTab === tab.key
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 ring-1 ring-primary-100 dark:ring-primary-900/30'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-surface-hover',
              ]"
              @click="activeTab = tab.key"
            >
              <component :is="tab.icon" class="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              {{ tab.label }}
            </button>
          </div>
        </div>
      </nav>

      <!-- Tab Content -->
      <div class="lg:col-span-3">
        <Transition name="fade" mode="out-in">
          <!-- Company Tab -->
          <div v-if="activeTab === 'company'" key="company" class="space-y-4 stagger-item" style="animation-delay: 60ms">
            <div class="card p-5 sm:p-6">
              <div class="flex items-center gap-2.5 mb-5 pb-4 border-b border-surface-border">
                <div class="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center ring-1 ring-primary-100 dark:ring-primary-900/30">
                  <Building2 class="w-[18px] h-[18px] text-primary-600 dark:text-primary-400" aria-hidden="true" />
                </div>
                <div>
                  <h2 class="text-sm font-semibold text-surface-foreground">Thông tin xưởng</h2>
                  <p class="text-xs text-slate-500 dark:text-zinc-400">Thông tin hiển thị trên hóa đơn và liên hệ</p>
                </div>
              </div>

              <form class="space-y-4" @submit.prevent="handleSave">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AppInput v-model="companyForm.workshop_name" :label="t('settings.workshopName')" :required="true" />
                  <AppInput v-model="companyForm.workshop_phone" :label="t('settings.workshopPhone')" type="tel" />
                </div>
                <AppInput v-model="companyForm.workshop_address" :label="t('settings.workshopAddress')" />
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <AppSelect
                    v-model="companyForm.currency"
                    :label="t('settings.currency')"
                    :options="[{ value: 'VND', label: 'VND - Việt Nam Đồng' }, { value: 'USD', label: 'USD - US Dollar' }]"
                  />
                  <AppInput v-model="companyForm.tax_code" label="Mã số thuế" />
                  <AppInput v-model="companyForm.business_hours" label="Giờ hoạt động" hint="VD: 5:00 - 18:00" />
                </div>

                <!-- Info preview card -->
                <div class="rounded-lg border border-surface-border bg-surface-hover/40 p-4">
                  <p class="text-xs font-medium text-slate-500 dark:text-zinc-400 mb-2">Xem trước thông tin hóa đơn</p>
                  <div class="flex items-start gap-3">
                    <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-accent-400 flex items-center justify-center flex-shrink-0">
                      <Building2 class="w-5 h-5 text-white" aria-hidden="true" />
                    </div>
                    <div class="min-w-0">
                      <p class="text-sm font-semibold text-surface-foreground">{{ companyForm.workshop_name }}</p>
                      <p class="text-xs text-slate-500 dark:text-zinc-400">{{ companyForm.workshop_address }}</p>
                      <p class="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">SĐT: {{ companyForm.workshop_phone }} · MST: {{ companyForm.tax_code }}</p>
                    </div>
                  </div>
                </div>

                <div class="flex justify-end pt-1">
                  <AppButton type="submit" :loading="saving" size="lg">
                    <Save class="w-4 h-4" aria-hidden="true" />
                    {{ t('common.save') }}
                  </AppButton>
                </div>
              </form>
            </div>
          </div>

          <!-- Notifications Tab -->
          <div v-else-if="activeTab === 'notifications'" key="notifications" class="space-y-4 stagger-item" style="animation-delay: 60ms">
            <div class="card p-5 sm:p-6">
              <div class="flex items-center gap-2.5 mb-5 pb-4 border-b border-surface-border">
                <div class="w-9 h-9 rounded-lg bg-accent-50 dark:bg-accent-900/20 flex items-center justify-center ring-1 ring-accent-100 dark:ring-accent-900/30">
                  <Bell class="w-[18px] h-[18px] text-accent-600 dark:text-accent-400" aria-hidden="true" />
                </div>
                <div>
                  <h2 class="text-sm font-semibold text-surface-foreground">Tùy chọn thông báo</h2>
                  <p class="text-xs text-slate-500 dark:text-zinc-400">Chọn loại thông báo bạn muốn nhận</p>
                </div>
              </div>

              <div class="space-y-3">
                <div
                  v-for="item in notificationItems"
                  :key="item.key"
                  class="flex items-center justify-between gap-4 p-4 rounded-lg border border-surface-border hover:border-surface-border/80 hover:bg-surface-hover/30 transition-all"
                >
                  <div class="flex items-start gap-3 min-w-0">
                    <div :class="['w-9 h-9 rounded-lg flex items-center justify-center ring-1 flex-shrink-0', notifColorMap[item.color].bg, notifColorMap[item.color].ring]">
                      <component :is="item.icon" :class="['w-[18px] h-[18px]', notifColorMap[item.color].text]" aria-hidden="true" />
                    </div>
                    <div class="min-w-0">
                      <p class="text-sm font-medium text-surface-foreground">{{ item.label }}</p>
                      <p class="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{{ item.description }}</p>
                    </div>
                  </div>
                  <!-- Toggle switch -->
                  <button
                    type="button"
                    role="switch"
                    :aria-checked="notifications[item.key]"
                    :aria-label="item.label"
                    :class="[
                      'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
                      notifications[item.key] ? 'bg-primary-600' : 'bg-slate-200 dark:bg-zinc-700',
                    ]"
                    @click="notifications[item.key] = !notifications[item.key]"
                  >
                    <span
                      :class="[
                        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform duration-200 mt-0.5',
                        notifications[item.key] ? 'translate-x-[22px]' : 'translate-x-0.5',
                      ]"
                    />
                  </button>
                </div>
              </div>

              <div class="flex justify-end pt-5 mt-5 border-t border-surface-border">
                <AppButton :loading="saving" size="lg" @click="handleSave">
                  <Save class="w-4 h-4" aria-hidden="true" />
                  {{ t('common.save') }}
                </AppButton>
              </div>
            </div>
          </div>

          <!-- Appearance Tab -->
          <div v-else-if="activeTab === 'appearance'" key="appearance" class="space-y-4 stagger-item" style="animation-delay: 60ms">
            <div class="card p-5 sm:p-6">
              <div class="flex items-center gap-2.5 mb-5 pb-4 border-b border-surface-border">
                <div class="w-9 h-9 rounded-lg bg-secondary-50 dark:bg-secondary-900/20 flex items-center justify-center ring-1 ring-secondary-100 dark:ring-secondary-900/30">
                  <Palette class="w-[18px] h-[18px] text-secondary-600 dark:text-secondary-400" aria-hidden="true" />
                </div>
                <div>
                  <h2 class="text-sm font-semibold text-surface-foreground">Giao diện hiển thị</h2>
                  <p class="text-xs text-slate-500 dark:text-zinc-400">Tùy chỉnh hiển thị theo sở thích của bạn</p>
                </div>
              </div>

              <!-- Theme selection -->
              <div class="mb-6">
                <p class="form-label">Chủ đề màu</p>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    v-for="option in themeOptions"
                    :key="option.value"
                    type="button"
                    :class="[
                      'relative text-left p-3 rounded-xl border-2 transition-all',
                      themeMode === option.value
                        ? 'border-primary-500 ring-2 ring-primary-500/20'
                        : 'border-surface-border hover:border-slate-300 dark:hover:border-zinc-600',
                    ]"
                    @click="applyTheme(option.value)"
                  >
                    <!-- Preview -->
                    <div :class="['h-16 rounded-lg border mb-3 overflow-hidden relative', option.preview]">
                      <div class="absolute inset-0 p-2 flex flex-col gap-1.5">
                        <div :class="['h-1.5 w-8 rounded-full', option.value === 'dark' ? 'bg-zinc-700' : 'bg-slate-200']" />
                        <div class="flex gap-1.5">
                          <div :class="['h-1.5 w-6 rounded-full', option.value === 'dark' ? 'bg-zinc-700' : 'bg-slate-200']" />
                          <div :class="['h-1.5 flex-1 rounded-full', option.value === 'dark' ? 'bg-zinc-700' : 'bg-slate-100']" />
                        </div>
                        <div :class="['h-1.5 w-10 rounded-full self-end', option.value === 'dark' ? 'bg-primary-500' : 'bg-primary-400']" />
                      </div>
                    </div>
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <component :is="option.icon" class="w-4 h-4 text-slate-600 dark:text-zinc-300" aria-hidden="true" />
                        <span class="text-sm font-medium text-surface-foreground">{{ option.label }}</span>
                      </div>
                      <span v-if="themeMode === option.value" class="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                        <Check class="w-3 h-3 text-white" aria-hidden="true" />
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              <!-- Dense mode -->
              <div class="flex items-center justify-between gap-4 p-4 rounded-lg border border-surface-border mb-3">
                <div class="flex items-start gap-3">
                  <div class="w-9 h-9 rounded-lg bg-surface-hover flex items-center justify-center flex-shrink-0">
                    <CircleDot class="w-[18px] h-[18px] text-slate-600 dark:text-zinc-300" aria-hidden="true" />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-surface-foreground">Chế độ hiển thị dày đặc</p>
                    <p class="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Giảm khoảng cách giữa các phần tử để hiển thị nhiều nội dung hơn</p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  :aria-checked="denseMode"
                  aria-label="Chế độ dày đặc"
                  :class="[
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
                    denseMode ? 'bg-primary-600' : 'bg-slate-200 dark:bg-zinc-700',
                  ]"
                  @click="denseMode = !denseMode"
                >
                  <span :class="['pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 mt-0.5', denseMode ? 'translate-x-[22px]' : 'translate-x-0.5']" />
                </button>
              </div>

              <!-- Sidebar position -->
              <div class="flex items-center justify-between gap-4 p-4 rounded-lg border border-surface-border">
                <div class="flex items-start gap-3">
                  <div class="w-9 h-9 rounded-lg bg-surface-hover flex items-center justify-center flex-shrink-0">
                    <Settings2 class="w-[18px] h-[18px] text-slate-600 dark:text-zinc-300" aria-hidden="true" />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-surface-foreground">Vị trí thanh bên</p>
                    <p class="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Đặt thanh điều hướng ở bên trái hoặc phải</p>
                  </div>
                </div>
                <div class="flex rounded-lg border border-surface-border overflow-hidden flex-shrink-0">
                  <button
                    type="button"
                    :class="['px-3 py-1.5 text-xs font-medium transition-colors min-h-[36px]', sidebarPosition === 'left' ? 'bg-primary-600 text-white' : 'text-slate-600 dark:text-zinc-400 hover:bg-surface-hover']"
                    @click="sidebarPosition = 'left'"
                  >Trái</button>
                  <button
                    type="button"
                    :class="['px-3 py-1.5 text-xs font-medium transition-colors min-h-[36px]', sidebarPosition === 'right' ? 'bg-primary-600 text-white' : 'text-slate-600 dark:text-zinc-400 hover:bg-surface-hover']"
                    @click="sidebarPosition = 'right'"
                  >Phải</button>
                </div>
              </div>

              <div class="flex justify-end pt-5 mt-5 border-t border-surface-border">
                <AppButton :loading="saving" size="lg" @click="handleSave">
                  <Save class="w-4 h-4" aria-hidden="true" />
                  {{ t('common.save') }}
                </AppButton>
              </div>
            </div>
          </div>

          <!-- System Tab -->
          <div v-else-if="activeTab === 'system'" key="system" class="space-y-4 stagger-item" style="animation-delay: 60ms">
            <!-- System config -->
            <div class="card p-5 sm:p-6">
              <div class="flex items-center gap-2.5 mb-5 pb-4 border-b border-surface-border">
                <div class="w-9 h-9 rounded-lg bg-info-50 dark:bg-info-900/20 flex items-center justify-center ring-1 ring-info-100 dark:ring-info-900/30">
                  <Settings2 class="w-[18px] h-[18px] text-info-600 dark:text-info-400" aria-hidden="true" />
                </div>
                <div>
                  <h2 class="text-sm font-semibold text-surface-foreground">Cấu hình hệ thống</h2>
                  <p class="text-xs text-slate-500 dark:text-zinc-400">Quản lý dữ liệu, sao lưu và bảo trì</p>
                </div>
              </div>

              <div class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AppSelect
                    v-model="systemForm.data_retention"
                    label="Thời gian lưu dữ liệu"
                    :options="retentionOptions"
                    hint="Dữ liệu cũ hơn sẽ tự động được xóa"
                  />
                  <AppSelect
                    v-model="systemForm.backup_frequency"
                    label="Tần suất sao lưu"
                    :options="backupOptions"
                    hint="Sao lưu tự động cơ sở dữ liệu"
                  />
                </div>

                <!-- Maintenance mode -->
                <div class="flex items-center justify-between gap-4 p-4 rounded-lg border border-surface-border bg-warning-50/30 dark:bg-warning-900/10">
                  <div class="flex items-start gap-3">
                    <div class="w-9 h-9 rounded-lg bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle class="w-[18px] h-[18px] text-warning-600 dark:text-warning-400" aria-hidden="true" />
                    </div>
                    <div>
                      <p class="text-sm font-medium text-surface-foreground">Chế độ bảo trì</p>
                      <p class="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Khi bật, chỉ quản trị viên mới truy cập được hệ thống</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    :aria-checked="systemForm.maintenance_mode"
                    aria-label="Chế độ bảo trì"
                    :class="[
                      'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-warning-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
                      systemForm.maintenance_mode ? 'bg-warning-500' : 'bg-slate-200 dark:bg-zinc-700',
                    ]"
                    @click="systemForm.maintenance_mode = !systemForm.maintenance_mode"
                  >
                    <span :class="['pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 mt-0.5', systemForm.maintenance_mode ? 'translate-x-[22px]' : 'translate-x-0.5']" />
                  </button>
                </div>
              </div>

              <div class="flex justify-end pt-5 mt-5 border-t border-surface-border">
                <AppButton :loading="saving" size="lg" @click="handleSave">
                  <Save class="w-4 h-4" aria-hidden="true" />
                  {{ t('common.save') }}
                </AppButton>
              </div>
            </div>

            <!-- System Status -->
            <div class="card p-5 sm:p-6">
              <div class="flex items-center justify-between mb-5">
                <div class="flex items-center gap-2.5">
                  <div class="w-9 h-9 rounded-lg bg-success-50 dark:bg-success-900/20 flex items-center justify-center ring-1 ring-success-100 dark:ring-success-900/30">
                    <Activity class="w-[18px] h-[18px] text-success-600 dark:text-success-400" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 class="text-sm font-semibold text-surface-foreground">Tình trạng hệ thống</h2>
                    <p class="text-xs text-slate-500 dark:text-zinc-400">Giám sát các dịch vụ real-time</p>
                  </div>
                </div>
                <AppBadge color="success" dot>Live</AppBadge>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  v-for="svc in systemStatuses"
                  :key="svc.label"
                  class="flex items-center justify-between gap-3 p-3.5 rounded-lg border border-surface-border"
                >
                  <div class="flex items-center gap-3 min-w-0">
                    <div :class="['w-9 h-9 rounded-lg flex items-center justify-center ring-1 flex-shrink-0', statusColorMap[svc.status].bg, statusColorMap[svc.status].ring]">
                      <component :is="svc.icon" :class="['w-[18px] h-[18px]', statusColorMap[svc.status].text]" aria-hidden="true" />
                    </div>
                    <div class="min-w-0">
                      <p class="text-sm font-medium text-surface-foreground truncate">{{ svc.label }}</p>
                      <p class="text-xs text-slate-400 dark:text-zinc-500 tabular-nums">Uptime {{ svc.uptime }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-1.5 flex-shrink-0">
                    <span :class="['w-2 h-2 rounded-full', statusColorMap[svc.status].dot, svc.status === 'operational' ? 'animate-pulse' : '']" />
                    <span :class="['text-xs font-medium', statusColorMap[svc.status].text]">{{ statusColorMap[svc.status].label }}</span>
                  </div>
                </div>
              </div>

              <!-- Quick stats -->
              <div class="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-surface-border">
                <div class="text-center">
                  <div class="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mx-auto mb-1.5 ring-1 ring-primary-100 dark:ring-primary-900/30">
                    <Database class="w-4 h-4 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                  </div>
                  <p class="text-sm font-bold text-surface-foreground tabular-nums">2.4 GB</p>
                  <p class="text-xs text-slate-400 dark:text-zinc-500">Dung lượng DB</p>
                </div>
                <div class="text-center">
                  <div class="w-8 h-8 rounded-lg bg-accent-50 dark:bg-accent-900/20 flex items-center justify-center mx-auto mb-1.5 ring-1 ring-accent-100 dark:ring-accent-900/30">
                    <HardDrive class="w-4 h-4 text-accent-600 dark:text-accent-400" aria-hidden="true" />
                  </div>
                  <p class="text-sm font-bold text-surface-foreground tabular-nums">48%</p>
                  <p class="text-xs text-slate-400 dark:text-zinc-500">Lưu trữ</p>
                </div>
                <div class="text-center">
                  <div class="w-8 h-8 rounded-lg bg-success-50 dark:bg-success-900/20 flex items-center justify-center mx-auto mb-1.5 ring-1 ring-success-100 dark:ring-success-900/30">
                    <Zap class="w-4 h-4 text-success-600 dark:text-success-400" aria-hidden="true" />
                  </div>
                  <p class="text-sm font-bold text-surface-foreground tabular-nums">142ms</p>
                  <p class="text-xs text-slate-400 dark:text-zinc-500">Độ trễ TB</p>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>
