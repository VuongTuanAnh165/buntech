<script setup lang="ts">
import {
  Shield, Phone, Mail, CalendarDays, Pencil, Clock, LogIn, UserCog, Package,
  TrendingUp, FileText, Activity, CheckCircle2, Smartphone, Monitor, KeyRound,
  CircleDot, ChevronRight, MapPin, BadgeCheck, Zap,
} from 'lucide-vue-next'
import { Role, ROLE_COLORS } from '../../core/enums'
import type { Profile } from '../../core/types'

const { t } = useI18n()
const authStore = useAuthStore()
const { formatDate, formatDateTime } = useFormat()
useHead({ title: `${t('nav.profile')} - BunTech Admin` })
definePageMeta({ layout: 'admin' })

const user = computed(() => authStore.user as Profile | null)

// Derived email from login convention
const email = computed(() => {
  if (!user.value) return '—'
  if (user.value.role === Role.ADMIN) return 'admin@buntech.vn'
  if (user.value.role === Role.DRIVER) return 'driver@buntech.vn'
  return `${user.value.full_name.toLowerCase().replace(/\s+/g, '.')}@buntech.vn`
})

// Account age in days
const accountAgeDays = computed(() => {
  if (!user.value?.created_at) return 0
  const diff = Date.now() - new Date(user.value.created_at).getTime()
  return Math.max(0, Math.floor(diff / 86400000))
})

const accountAgeLabel = computed(() => {
  const days = accountAgeDays.value
  if (days < 30) return `${days} ngày`
  const months = Math.floor(days / 30)
  const remDays = days % 30
  if (months < 12) return `${months} tháng${remDays ? ` ${remDays} ngày` : ''}`
  const years = Math.floor(months / 12)
  const remMonths = months % 12
  return `${years} năm${remMonths ? ` ${remMonths} tháng` : ''}`
})

// Stats
const stats = computed(() => [
  {
    label: 'Tổng thao tác',
    value: '1.248',
    icon: Zap,
    color: 'primary' as const,
    hint: 'Trong 30 ngày qua',
  },
  {
    label: 'Đăng nhập gần nhất',
    value: '2 giờ trước',
    icon: LogIn,
    color: 'success' as const,
    hint: formatDateTime(new Date(Date.now() - 2 * 3600000).toISOString()),
  },
  {
    label: 'Tuổi tài khoản',
    value: accountAgeLabel.value,
    icon: CalendarDays,
    color: 'accent' as const,
    hint: `Từ ${formatDate(user.value?.created_at)}`,
  },
])

const colorMap: Record<string, { bg: string; text: string; ring: string; bar: string }> = {
  primary: { bg: 'bg-primary-50 dark:bg-primary-900/20', text: 'text-primary-600 dark:text-primary-400', ring: 'ring-primary-100 dark:ring-primary-900/30', bar: 'bg-gradient-to-r from-primary-500 to-primary-400' },
  success: { bg: 'bg-success-50 dark:bg-success-900/20', text: 'text-success-600 dark:text-success-400', ring: 'ring-success-100 dark:ring-success-900/30', bar: 'bg-gradient-to-r from-success-500 to-success-400' },
  accent: { bg: 'bg-accent-50 dark:bg-accent-900/20', text: 'text-accent-600 dark:text-accent-400', ring: 'ring-accent-100 dark:ring-accent-900/30', bar: 'bg-gradient-to-r from-accent-500 to-accent-400' },
}

// Activity timeline mock data
interface ActivityEntry {
  id: string
  type: 'login' | 'profile' | 'order' | 'product' | 'report' | 'password'
  title: string
  description: string
  timestamp: string
  icon: unknown
  color: 'primary' | 'success' | 'accent' | 'warning' | 'info' | 'secondary'
}

const activities = ref<ActivityEntry[]>([
  {
    id: 'act-1',
    type: 'login',
    title: 'Đăng nhập hệ thống',
    description: 'Đăng nhập từ trình duyệt Chrome trên Windows · TP. HCM',
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    icon: LogIn,
    color: 'success',
  },
  {
    id: 'act-2',
    type: 'order',
    title: 'Tạo đơn hàng mới',
    description: 'Đơn #ORD-0042 cho khách Phạm Thị Mai · 1.850.000 ₫',
    timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
    icon: Package,
    color: 'primary',
  },
  {
    id: 'act-3',
    type: 'profile',
    title: 'Cập nhật hồ sơ',
    description: 'Thay đổi số điện thoại liên hệ',
    timestamp: new Date(Date.now() - 26 * 3600000).toISOString(),
    icon: UserCog,
    color: 'info',
  },
  {
    id: 'act-4',
    type: 'report',
    title: 'Xuất báo cáo doanh thu',
    description: 'Báo cáo tuần từ 29/07 đến 04/08 · PDF',
    timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
    icon: FileText,
    color: 'accent',
  },
  {
    id: 'act-5',
    type: 'product',
    title: 'Cập nhật giá sản phẩm',
    description: 'Bún tươi sợi nhỏ: 23.000 ₫ → 25.000 ₫',
    timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
    icon: TrendingUp,
    color: 'warning',
  },
  {
    id: 'act-6',
    type: 'password',
    title: 'Đổi mật khẩu',
    description: 'Mật khẩu được cập nhật thành công',
    timestamp: new Date(Date.now() - 7 * 86400000).toISOString(),
    icon: KeyRound,
    color: 'secondary',
  },
])

const activityColorMap: Record<string, { bg: string; text: string; ring: string }> = {
  primary: { bg: 'bg-primary-50 dark:bg-primary-900/20', text: 'text-primary-600 dark:text-primary-400', ring: 'ring-primary-200/60 dark:ring-primary-800/40' },
  success: { bg: 'bg-success-50 dark:bg-success-900/20', text: 'text-success-600 dark:text-success-400', ring: 'ring-success-200/60 dark:ring-success-800/40' },
  accent: { bg: 'bg-accent-50 dark:bg-accent-900/20', text: 'text-accent-600 dark:text-accent-400', ring: 'ring-accent-200/60 dark:ring-accent-800/40' },
  warning: { bg: 'bg-warning-50 dark:bg-warning-900/20', text: 'text-warning-600 dark:text-warning-400', ring: 'ring-warning-200/60 dark:ring-warning-800/40' },
  info: { bg: 'bg-info-50 dark:bg-info-900/20', text: 'text-info-600 dark:text-info-400', ring: 'ring-info-200/60 dark:ring-info-800/40' },
  secondary: { bg: 'bg-secondary-50 dark:bg-secondary-900/20', text: 'text-secondary-600 dark:text-secondary-400', ring: 'ring-secondary-200/60 dark:ring-secondary-800/40' },
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Vừa xong'
  if (mins < 60) return `${mins} phút trước`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} giờ trước`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} ngày trước`
  return formatDate(iso)
}

// Security / sessions mock data
const sessions = ref([
  { id: 's1', device: 'Windows · Chrome', location: 'TP. HCM, Việt Nam', current: true, icon: Monitor, lastActive: 'Đang hoạt động' },
  { id: 's2', device: 'iPhone 15 · Safari', location: 'TP. HCM, Việt Nam', current: false, icon: Smartphone, lastActive: '2 giờ trước' },
])

const passwordLastChanged = new Date(Date.now() - 7 * 86400000).toISOString()
const twoFAEnabled = ref(false)

const showEditModal = ref(false)
const editForm = ref({ full_name: '', phone: '' })
const saving = ref(false)

function openEdit() {
  editForm.value = {
    full_name: user.value?.full_name || '',
    phone: user.value?.phone || '',
  }
  showEditModal.value = true
}

async function saveProfile() {
  if (!editForm.value.full_name.trim()) return
  saving.value = true
  try {
    await authStore.updateProfile({ full_name: editForm.value.full_name.trim(), phone: editForm.value.phone.trim() })
    showEditModal.value = false
    useToast().success('Đã cập nhật hồ sơ')
  } catch {
    useToast().error(t('errors.saveFailed'))
  } finally {
    saving.value = false
  }
}

// Personal info rows
const personalInfo = computed(() => [
  { label: 'Họ và tên', value: user.value?.full_name || '—', icon: UserCog },
  { label: 'Số điện thoại', value: user.value?.phone || '—', icon: Phone },
  { label: 'Email', value: email.value, icon: Mail },
  { label: 'Vai trò', value: user.value ? t(`roles.${user.value.role}`) : '—', icon: BadgeCheck },
  { label: 'Trạng thái', value: user.value?.status === 'ACTIVE' ? t('common.active') : t('common.inactive'), icon: CircleDot },
  { label: 'Ngày tạo', value: user.value ? formatDate(user.value.created_at) : '—', icon: CalendarDays },
])
</script>

<template>
  <div>
    <AppPageHeader
      :title="t('nav.profile')"
      subtitle="Xem và quản lý thông tin tài khoản cá nhân"
      :breadcrumb-label="t('nav.profile')"
    >
      <template #actions>
        <NuxtLink to="/admin/change-password">
          <AppButton variant="outline">
            <KeyRound class="w-4 h-4" aria-hidden="true" />
            Đổi mật khẩu
          </AppButton>
        </NuxtLink>
        <AppButton @click="openEdit">
          <Pencil class="w-4 h-4" aria-hidden="true" />
          Chỉnh sửa
        </AppButton>
      </template>
    </AppPageHeader>

    <!-- Profile Header Card -->
    <div class="card card-gradient p-5 sm:p-7 mb-6 stagger-item relative" style="animation-delay: 0ms">
      <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-accent-400 to-primary-400 rounded-t-xl" />
      <div class="flex flex-col sm:flex-row sm:items-center gap-5">
        <div class="relative flex-shrink-0">
          <AppAvatar :name="user?.full_name" :src="user?.avatar_url" size="lg" class="!w-20 !h-20 !text-2xl ring-4 ring-primary-100 dark:ring-primary-900/30" />
          <span class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-success-500 ring-4 ring-surface flex items-center justify-center">
            <CheckCircle2 class="w-3.5 h-3.5 text-white" aria-hidden="true" />
          </span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap mb-1">
            <h2 class="text-2xl font-bold text-surface-foreground tracking-tight">{{ user?.full_name }}</h2>
            <AppBadge :color="ROLE_COLORS[user?.role || Role.ADMIN] as 'danger'" variant="solid">
              <Shield class="w-3 h-3" aria-hidden="true" />
              {{ user ? t(`roles.${user.role}`) : '' }}
            </AppBadge>
          </div>
          <div class="flex items-center gap-x-5 gap-y-1.5 flex-wrap text-sm text-slate-500 dark:text-zinc-400">
            <span class="flex items-center gap-1.5">
              <Phone class="w-3.5 h-3.5" aria-hidden="true" />
              {{ user?.phone || '—' }}
            </span>
            <span class="flex items-center gap-1.5">
              <Mail class="w-3.5 h-3.5" aria-hidden="true" />
              {{ email }}
            </span>
            <span class="flex items-center gap-1.5">
              <CalendarDays class="w-3.5 h-3.5" aria-hidden="true" />
              Thành viên từ {{ formatDate(user?.created_at) }}
            </span>
          </div>
        </div>
        <div class="hidden lg:flex flex-col items-end gap-1">
          <AppBadge :color="user?.status === 'ACTIVE' ? 'success' : 'danger'" dot>
            {{ user?.status === 'ACTIVE' ? t('common.active') : t('common.inactive') }}
          </AppBadge>
          <span class="text-xs text-slate-400 dark:text-zinc-500">ID: {{ user?.id?.slice(0, 12) }}</span>
        </div>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
      <div
        v-for="(stat, i) in stats"
        :key="stat.label"
        class="card card-hover p-5 stagger-item relative overflow-hidden group"
        :style="{ animationDelay: `${i * 50 + 40}ms` }"
      >
        <div :class="['kpi-accent', colorMap[stat.color].bar]" />
        <div class="flex items-start justify-between mb-2.5">
          <div :class="['w-10 h-10 rounded-xl flex items-center justify-center ring-1 transition-transform duration-200 group-hover:scale-110', colorMap[stat.color].bg, colorMap[stat.color].ring]">
            <component :is="stat.icon" :class="['w-5 h-5', colorMap[stat.color].text]" aria-hidden="true" />
          </div>
        </div>
        <p class="text-[13px] text-slate-500 dark:text-zinc-400 mb-1 font-medium">{{ stat.label }}</p>
        <p class="text-2xl font-bold text-surface-foreground tracking-tight">{{ stat.value }}</p>
        <p class="text-xs text-slate-400 dark:text-zinc-500 mt-1 truncate">{{ stat.hint }}</p>
      </div>
    </div>

    <!-- 2-column grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
      <!-- Left Column -->
      <div class="lg:col-span-1 space-y-4 lg:space-y-6">
        <!-- Personal Information -->
        <div class="card p-5 stagger-item" style="animation-delay: 200ms">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center ring-1 ring-primary-100 dark:ring-primary-900/30">
                <UserCog class="w-4 h-4 text-primary-600 dark:text-primary-400" aria-hidden="true" />
              </div>
              <h3 class="text-sm font-semibold text-surface-foreground">Thông tin cá nhân</h3>
            </div>
            <button class="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium flex items-center gap-0.5 transition-colors" @click="openEdit">
              Sửa <ChevronRight class="w-3 h-3" aria-hidden="true" />
            </button>
          </div>
          <dl class="space-y-3">
            <div
              v-for="item in personalInfo"
              :key="item.label"
              class="flex items-center justify-between gap-3 py-2 border-b border-surface-border last:border-0"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <component :is="item.icon" class="w-4 h-4 text-slate-400 dark:text-zinc-500 flex-shrink-0" aria-hidden="true" />
                <dt class="text-sm text-slate-500 dark:text-zinc-400">{{ item.label }}</dt>
              </div>
              <dd class="text-sm font-medium text-surface-foreground text-right truncate">{{ item.value }}</dd>
            </div>
          </dl>
        </div>

        <!-- Security Card -->
        <div class="card p-5 stagger-item" style="animation-delay: 260ms">
          <div class="flex items-center gap-2.5 mb-4">
            <div class="w-8 h-8 rounded-lg bg-success-50 dark:bg-success-900/20 flex items-center justify-center ring-1 ring-success-100 dark:ring-success-900/30">
              <Shield class="w-4 h-4 text-success-600 dark:text-success-400" aria-hidden="true" />
            </div>
            <h3 class="text-sm font-semibold text-surface-foreground">Bảo mật</h3>
          </div>

          <div class="space-y-4">
            <!-- Password last changed -->
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-start gap-2.5 min-w-0">
                <KeyRound class="w-4 h-4 text-slate-400 dark:text-zinc-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p class="text-sm font-medium text-surface-foreground">Mật khẩu</p>
                  <p class="text-xs text-slate-500 dark:text-zinc-400">Đổi lần cuối {{ formatDate(passwordLastChanged) }}</p>
                </div>
              </div>
              <NuxtLink to="/admin/change-password" class="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium flex-shrink-0">
                Đổi
              </NuxtLink>
            </div>

            <!-- 2FA -->
            <div class="flex items-center justify-between gap-3 py-3 border-y border-surface-border">
              <div class="flex items-center gap-2.5 min-w-0">
                <Smartphone class="w-4 h-4 text-slate-400 dark:text-zinc-500 flex-shrink-0" aria-hidden="true" />
                <div>
                  <p class="text-sm font-medium text-surface-foreground">Xác thực 2 bước</p>
                  <p class="text-xs text-slate-500 dark:text-zinc-400">Bảo vệ tài khoản thêm một lớp</p>
                </div>
              </div>
              <AppBadge :color="twoFAEnabled ? 'success' : 'warning'">
                {{ twoFAEnabled ? 'Bật' : 'Tắt' }}
              </AppBadge>
            </div>

            <!-- Active sessions -->
            <div>
              <div class="flex items-center gap-2.5 mb-2.5">
                <Monitor class="w-4 h-4 text-slate-400 dark:text-zinc-500" aria-hidden="true" />
                <p class="text-sm font-medium text-surface-foreground">Phiên hoạt động</p>
                <span class="text-xs text-slate-400 dark:text-zinc-500">({{ sessions.length }})</span>
              </div>
              <div class="space-y-2">
                <div
                  v-for="session in sessions"
                  :key="session.id"
                  class="flex items-center gap-3 p-2.5 rounded-lg bg-surface-hover/60"
                >
                  <div class="w-8 h-8 rounded-lg bg-surface flex items-center justify-center ring-1 ring-surface-border flex-shrink-0">
                    <component :is="session.icon" class="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" aria-hidden="true" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-medium text-surface-foreground truncate">{{ session.device }}</p>
                    <p class="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1 truncate">
                      <MapPin class="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                      {{ session.location }}
                    </p>
                  </div>
                  <AppBadge v-if="session.current" color="success" dot>{{ session.lastActive }}</AppBadge>
                  <span v-else class="text-xs text-slate-400 dark:text-zinc-500 flex-shrink-0">{{ session.lastActive }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Activity Timeline -->
      <div class="lg:col-span-2">
        <div class="card p-5 stagger-item h-full" style="animation-delay: 220ms">
          <div class="flex items-center justify-between mb-5">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-accent-50 dark:bg-accent-900/20 flex items-center justify-center ring-1 ring-accent-100 dark:ring-accent-900/30">
                <Activity class="w-4 h-4 text-accent-600 dark:text-accent-400" aria-hidden="true" />
              </div>
              <div>
                <h3 class="text-sm font-semibold text-surface-foreground">Lịch sử hoạt động</h3>
                <p class="text-xs text-slate-500 dark:text-zinc-400">6 hoạt động gần nhất</p>
              </div>
            </div>
            <AppBadge color="gray" variant="soft">30 ngày</AppBadge>
          </div>

          <ol class="relative space-y-1">
            <!-- vertical line -->
            <div class="absolute left-[19px] top-2 bottom-2 w-px bg-surface-border" aria-hidden="true" />
            <li
              v-for="(activity, idx) in activities"
              :key="activity.id"
              class="relative flex gap-4 pb-5 last:pb-0 stagger-item"
              :style="{ animationDelay: `${idx * 60 + 280}ms` }"
            >
              <!-- Node -->
              <div :class="[
                'relative z-10 w-10 h-10 rounded-full flex items-center justify-center ring-1 flex-shrink-0',
                activityColorMap[activity.color].bg,
                activityColorMap[activity.color].ring,
              ]">
                <component :is="activity.icon" :class="['w-5 h-5', activityColorMap[activity.color].text]" aria-hidden="true" />
              </div>
              <!-- Content -->
              <div class="flex-1 min-w-0 pt-1.5">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-surface-foreground">{{ activity.title }}</p>
                    <p class="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{{ activity.description }}</p>
                  </div>
                  <span class="text-xs text-slate-400 dark:text-zinc-500 whitespace-nowrap flex items-center gap-1 flex-shrink-0 tabular-nums">
                    <Clock class="w-3 h-3" aria-hidden="true" />
                    {{ relativeTime(activity.timestamp) }}
                  </span>
                </div>
              </div>
            </li>
          </ol>

          <div class="mt-4 pt-4 border-t border-surface-border flex justify-center">
            <button class="text-xs text-slate-500 dark:text-zinc-400 hover:text-primary-600 dark:hover:text-primary-400 font-medium flex items-center gap-1 transition-colors">
              Xem tất cả hoạt động
              <ChevronRight class="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <AppModal v-model="showEditModal" title="Chỉnh sửa hồ sơ" size="md">
      <form class="space-y-4" @submit.prevent="saveProfile">
        <AppInput v-model="editForm.full_name" label="Họ và tên" :required="true" />
        <AppInput v-model="editForm.phone" label="Số điện thoại" type="tel" hint="SĐT liên hệ của bạn" />
      </form>
      <template #footer>
        <AppButton variant="ghost" @click="showEditModal = false">{{ t('common.cancel') }}</AppButton>
        <AppButton :loading="saving" @click="saveProfile">{{ t('common.save') }}</AppButton>
      </template>
    </AppModal>
  </div>
</template>
