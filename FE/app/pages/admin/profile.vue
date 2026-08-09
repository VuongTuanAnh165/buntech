<script setup lang="ts">
import { Role } from '~/utils/enums'
import type { CurrentUser } from '~/types/common'
import { updateProfileSchema } from '~~/core/validators/auth.validator'
import { authService } from '~~/core/services/auth.service'
import type { z } from 'zod'

const authStore = useAuthStore()
const toast = useToast()
const ROLE_LABELS: Record<string, string> = {
  [Role.ADMIN]: 'Quản trị viên',
  [Role.DRIVER]: 'Tài xế',
  [Role.CUSTOMER]: 'Khách hàng'
}
useSeoMeta({ title: 'Hồ sơ cá nhân - BunTech Admin' })
definePageMeta({ layout: 'admin' })
const ROLE_COLORS = {
  [Role.ADMIN]: 'primary',
  [Role.DRIVER]: 'warning',
  [Role.CUSTOMER]: 'success'
}
const user = computed(() => {
  return authStore.user as CurrentUser | null
})
// Derived email from login convention
const email = computed(() => {
  if (!user.value) return '—'
  if (user.value.role === Role.ADMIN) return 'admin@buntech.vn'
  if (user.value.role === Role.DRIVER) return 'driver@buntech.vn'
  return `${user.value.fullName.toLowerCase().replace(/\s+/g, '.')}@buntech.vn`
})
// Account age in days
const accountAgeDays = computed(() => {
  return 0 // Removed since created_at is not in CurrentUser right now
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
    icon: 'i-lucide-zap',
    color: 'primary' as const,
    hint: 'Trong 30 ngày qua'
  },
  {
    label: 'Đăng nhập gần nhất',
    value: '2 giờ trước',
    icon: 'i-lucide-log-in',
    color: 'success' as const,
    hint: formatDateTime(new Date(Date.now() - 2 * 3600000).toISOString())
  },
  {
    label: 'Tuổi tài khoản',
    value: accountAgeLabel.value,
    icon: 'i-lucide-calendar-days',
    color: 'accent' as const,
    hint: `Từ lâu`
  }
])
const colorMap = {
  primary: {
    bg: 'bg-primary-50 dark:bg-primary-900/20',
    text: 'text-primary-600 dark:text-primary-400',
    ring: 'ring-primary-100 dark:ring-primary-900/30',
    bar: 'bg-gradient-to-r from-primary-500 to-primary-400'
  },
  success: {
    bg: 'bg-success-50 dark:bg-success-900/20',
    text: 'text-success-600 dark:text-success-400',
    ring: 'ring-success-100 dark:ring-success-900/30',
    bar: 'bg-gradient-to-r from-success-500 to-success-400'
  },
  accent: {
    bg: 'bg-accent-50 dark:bg-accent-900/20',
    text: 'text-accent-600 dark:text-accent-400',
    ring: 'ring-accent-100 dark:ring-accent-900/30',
    bar: 'bg-gradient-to-r from-accent-500 to-accent-400'
  }
}
// Activity timeline mock data
interface ActivityEntry {
  id: string
  type: 'login' | 'profile' | 'order' | 'product' | 'report' | 'password'
  title: string
  description: string
  timestamp: string
  icon: string
  color: 'primary' | 'success' | 'accent' | 'warning' | 'info' | 'secondary'
}
const activities = ref<ActivityEntry[]>([
  {
    id: 'act-1',
    type: 'login',
    title: 'Đăng nhập hệ thống',
    description: 'Đăng nhập từ trình duyệt Chrome trên Windows · TP. HCM',
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    icon: 'i-lucide-log-in',
    color: 'success'
  },
  {
    id: 'act-2',
    type: 'order',
    title: 'Tạo đơn hàng mới',
    description: 'Đơn #ORD-0042 cho khách Phạm Thị Mai · 1.850.000 ₫',
    timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
    icon: 'i-lucide-package',
    color: 'primary'
  },
  {
    id: 'act-3',
    type: 'profile',
    title: 'Cập nhật hồ sơ',
    description: 'Thay đổi số điện thoại liên hệ',
    timestamp: new Date(Date.now() - 26 * 3600000).toISOString(),
    icon: 'i-lucide-user-cog',
    color: 'info'
  },
  {
    id: 'act-4',
    type: 'report',
    title: 'Xuất báo cáo doanh thu',
    description: 'Báo cáo tuần từ 29/07 đến 04/08 · PDF',
    timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
    icon: 'i-lucide-file-text',
    color: 'accent'
  },
  {
    id: 'act-5',
    type: 'product',
    title: 'Cập nhật giá sản phẩm',
    description: 'Bún tươi sợi nhỏ: 23.000 ₫ → 25.000 ₫',
    timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
    icon: 'i-lucide-trending-up',
    color: 'warning'
  },
  {
    id: 'act-6',
    type: 'password',
    title: 'Đổi mật khẩu',
    description: 'Mật khẩu được cập nhật thành công',
    timestamp: new Date(Date.now() - 7 * 86400000).toISOString(),
    icon: 'i-lucide-key-round',
    color: 'secondary'
  }
])
const _activityColorMap = {
  primary: {
    bg: 'bg-primary-50 dark:bg-primary-900/20',
    text: 'text-primary-600 dark:text-primary-400',
    ring: 'ring-primary-200/60 dark:ring-primary-800/40'
  },
  success: {
    bg: 'bg-success-50 dark:bg-success-900/20',
    text: 'text-success-600 dark:text-success-400',
    ring: 'ring-success-200/60 dark:ring-success-800/40'
  },
  accent: {
    bg: 'bg-accent-50 dark:bg-accent-900/20',
    text: 'text-accent-600 dark:text-accent-400',
    ring: 'ring-accent-200/60 dark:ring-accent-800/40'
  },
  warning: {
    bg: 'bg-warning-50 dark:bg-warning-900/20',
    text: 'text-warning-600 dark:text-warning-400',
    ring: 'ring-warning-200/60 dark:ring-warning-800/40'
  },
  info: {
    bg: 'bg-info-50 dark:bg-info-900/20',
    text: 'text-info-600 dark:text-info-400',
    ring: 'ring-info-200/60 dark:ring-info-800/40'
  },
  secondary: {
    bg: 'bg-secondary-50 dark:bg-secondary-900/20',
    text: 'text-secondary-600 dark:text-secondary-400',
    ring: 'ring-secondary-200/60 dark:ring-secondary-800/40'
  }
}
function _relativeTime(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Vừa xong'
  if (mins < 60) return `${mins} phút trước`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} giờ trước`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} ngày trước`
  return formatDate(isoStr)
}
// Security / sessions mock data
const sessions = ref([
  {
    id: 's1',
    device: 'Windows · Chrome',
    location: 'TP. HCM, Việt Nam',
    current: true,
    icon: 'i-lucide-monitor',
    lastActive: 'Đang hoạt động'
  },
  {
    id: 's2',
    device: 'iPhone 15 · Safari',
    location: 'TP. HCM, Việt Nam',
    current: false,
    icon: 'i-lucide-smartphone',
    lastActive: '2 giờ trước'
  }
])
const passwordLastChanged = new Date(Date.now() - 7 * 86400000).toISOString()
const twoFAEnabled = ref(false)
const showEditModal = ref(false)

type Schema = z.output<typeof updateProfileSchema>

const editForm = reactive({
  fullName: '',
  phone: ''
})

function openEdit() {
  editForm.fullName = user.value?.fullName || ''
  editForm.phone = user.value?.phoneNumber || ''
  showEditModal.value = true
}

const { submit: saveProfile, saving } = useFormSubmit<Schema>(
  async (data) => {
    const res = await authService.updateProfile({
      fullName: data.fullName
    })

    // update store manually or just re-fetch
    if (res.data) {
      await authStore.fetchUser()
    }
  },
  {
    onSuccess() {
      showEditModal.value = false
      toast.add({ title: 'Đã cập nhật hồ sơ', color: 'success' })
    },
    onError(err) {
      toast.add({ title: 'Cập nhật thất bại', description: err.message, color: 'error' })
    }
  }
)
// Personal info rows
const personalInfo = computed(() => [
  { label: 'Họ và tên', value: user.value?.fullName || '—', icon: 'i-lucide-user-cog' },
  { label: 'Số điện thoại', value: user.value?.phoneNumber || '—', icon: 'i-lucide-phone' },
  { label: 'Email', value: email.value, icon: 'i-lucide-mail' },
  {
    label: 'Vai trò',
    value: user.value ? ROLE_LABELS[user.value.role] || user.value.role : '—',
    icon: 'i-lucide-badge-check'
  },
  {
    label: 'Trạng thái',
    value: 'Hoạt động',
    icon: 'i-lucide-circle-dot'
  }
])
</script>
<template>
  <div>
    <BasePageHeader
      title="Hồ sơ cá nhân"
      subtitle="Xem và quản lý thông tin tài khoản cá nhân"
      breadcrumb-label="Hồ sơ"
    >
      <template #actions>
        <UButton
          color="neutral"
          variant="outline"
          to="/admin/change-password"
          icon="i-lucide-key-round"
        >
          Đổi mật khẩu
        </UButton>
        <UButton icon="i-lucide-pencil" @click="openEdit"> Chỉnh sửa </UButton>
      </template>
    </BasePageHeader>
    <!-- Profile Header Card -->
    <div
      class="card card-gradient stagger-item relative mt-6 mb-6 p-5 sm:p-7"
      style="animation-delay: 0ms"
    >
      <div
        class="from-primary-500 via-accent-400 to-primary-400 absolute top-0 right-0 left-0 h-1 rounded-t-xl bg-gradient-to-r"
      />
      <div class="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div class="relative flex-shrink-0">
          <UAvatar
            :alt="user?.full_name"
            :src="user?.avatar_url || ''"
            size="3xl"
            class="ring-primary-100 dark:ring-primary-900/30 ring-4"
          />
          <span
            class="bg-success-500 ring-surface absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full ring-4"
          >
            <UIcon name="i-lucide-check-circle-2" class="h-3.5 w-3.5 text-white" />
          </span>
        </div>
        <div class="min-w-0 flex-1">
          <div class="mb-1 flex flex-wrap items-center gap-2">
            <h2 class="text-surface-foreground text-2xl font-bold tracking-tight">
              {{ user?.fullName }}
            </h2>
            <UBadge
              :color="
                (ROLE_COLORS[user?.role || Role.ADMIN] as
                  'error' | 'primary' | 'warning' | 'success') || 'primary'
              "
              variant="solid"
            >
              <UIcon name="i-lucide-shield" class="mr-1 h-3 w-3" />
              {{ user ? ROLE_LABELS[user.role] || user.role : '' }}
            </UBadge>
          </div>
          <div
            class="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-slate-500 dark:text-zinc-400"
          >
            <span class="flex items-center gap-1.5">
              <UIcon name="i-lucide-phone" class="h-3.5 w-3.5" />
              {{ user?.phoneNumber || '—' }}
            </span>
            <span class="flex items-center gap-1.5">
              <UIcon name="i-lucide-mail" class="h-3.5 w-3.5" />
              {{ email }}
            </span>
            <span class="flex items-center gap-1.5">
              <UIcon name="i-lucide-calendar-days" class="h-3.5 w-3.5" />
              Thành viên từ {{ formatDate(user?.created_at || new Date().toISOString()) }}
            </span>
          </div>
        </div>
        <div class="hidden flex-col items-end gap-1 lg:flex">
          <UBadge color="success" variant="soft"> Hoạt động </UBadge>
          <span class="text-xs text-slate-400 dark:text-zinc-500"
            >ID: {{ user?.id?.slice(0, 12) }}</span
          >
        </div>
      </div>
    </div>
    <!-- Stats Row -->
    <div class="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
      <div
        v-for="(stat, i) in stats"
        :key="stat.label"
        class="card card-hover stagger-item group relative overflow-hidden p-5"
        :style="{ animationDelay: `${i * 50 + 40}ms` }"
      >
        <div :class="['kpi-accent', colorMap[stat.color].bar]" />
        <div class="mb-2.5 flex items-start justify-between">
          <div
            :class="[
              'flex h-10 w-10 items-center justify-center rounded-xl ring-1 transition-transform duration-200 group-hover:scale-110',
              colorMap[stat.color].bg,
              colorMap[stat.color].ring
            ]"
          >
            <UIcon :name="stat.icon" :class="['h-5 w-5', colorMap[stat.color].text]" />
          </div>
        </div>
        <p class="mb-1 text-[13px] font-medium text-slate-500 dark:text-zinc-400">
          {{ stat.label }}
        </p>
        <p class="text-surface-foreground text-2xl font-bold tracking-tight">{{ stat.value }}</p>
        <p class="mt-1 truncate text-xs text-slate-400 dark:text-zinc-500">{{ stat.hint }}</p>
      </div>
    </div>
    <!-- 2-column grid -->
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
      <!-- Left Column -->
      <div class="space-y-4 lg:col-span-1 lg:space-y-6">
        <!-- Personal Information -->
        <UCard class="stagger-item" style="animation-delay: 200ms">
          <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div
                class="bg-primary-50 dark:bg-primary-900/20 ring-primary-100 dark:ring-primary-900/30 flex h-8 w-8 items-center justify-center rounded-lg ring-1"
              >
                <UIcon
                  name="i-lucide-user-cog"
                  class="text-primary-600 dark:text-primary-400 h-4 w-4"
                />
              </div>
              <h3 class="text-surface-foreground text-sm font-semibold">Thông tin cá nhân</h3>
            </div>
            <UButton
              variant="ghost"
              color="neutral"
              class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-0.5 text-xs font-medium transition-colors"
              @click="openEdit"
            >
              Sửa <UIcon name="i-lucide-chevron-right" class="h-3 w-3" />
            </UButton>
          </div>
          <dl class="space-y-3">
            <div
              v-for="item in personalInfo"
              :key="item.label"
              class="border-surface-border flex items-center justify-between gap-3 border-b py-2 last:border-0"
            >
              <div class="flex min-w-0 items-center gap-2.5">
                <UIcon
                  :name="item.icon"
                  class="h-4 w-4 flex-shrink-0 text-slate-400 dark:text-zinc-500"
                />
                <dt class="text-sm text-slate-500 dark:text-zinc-400">{{ item.label }}</dt>
              </div>
              <dd class="text-surface-foreground truncate text-right text-sm font-medium">
                {{ item.value }}
              </dd>
            </div>
          </dl>
        </UCard>
        <!-- Security Card -->
        <UCard class="stagger-item" style="animation-delay: 260ms">
          <div class="mb-4 flex items-center gap-2.5">
            <div
              class="bg-success-50 dark:bg-success-900/20 ring-success-100 dark:ring-success-900/30 flex h-8 w-8 items-center justify-center rounded-lg ring-1"
            >
              <UIcon
                name="i-lucide-shield"
                class="text-success-600 dark:text-success-400 h-4 w-4"
              />
            </div>
            <h3 class="text-surface-foreground text-sm font-semibold">Bảo mật</h3>
          </div>
          <div class="space-y-4">
            <!-- Password last changed -->
            <div class="flex items-start justify-between gap-3">
              <div class="flex min-w-0 items-start gap-2.5">
                <UIcon
                  name="i-lucide-key-round"
                  class="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400 dark:text-zinc-500"
                />
                <div>
                  <p class="text-surface-foreground text-sm font-medium">Mật khẩu</p>
                  <p class="text-xs text-slate-500 dark:text-zinc-400">
                    Đổi lần cuối {{ formatDate(passwordLastChanged) }}
                  </p>
                </div>
              </div>
              <NuxtLink
                to="/admin/change-password"
                class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex-shrink-0 text-xs font-medium"
              >
                Đổi
              </NuxtLink>
            </div>
            <!-- 2FA -->
            <div
              class="border-surface-border flex items-center justify-between gap-3 border-y py-3"
            >
              <div class="flex min-w-0 items-center gap-2.5">
                <UIcon
                  name="i-lucide-smartphone"
                  class="h-4 w-4 flex-shrink-0 text-slate-400 dark:text-zinc-500"
                />
                <div>
                  <p class="text-surface-foreground text-sm font-medium">Xác thực 2 bước</p>
                  <p class="text-xs text-slate-500 dark:text-zinc-400">
                    Bảo vệ tài khoản thêm một lớp
                  </p>
                </div>
              </div>
              <UBadge :color="twoFAEnabled ? 'success' : 'warning'" variant="soft">
                {{ twoFAEnabled ? 'Bật' : 'Tắt' }}
              </UBadge>
            </div>
            <!-- Active sessions -->
            <div>
              <div class="mb-2.5 flex items-center gap-2.5">
                <UIcon name="i-lucide-monitor" class="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                <p class="text-surface-foreground text-sm font-medium">Phiên hoạt động</p>
                <span class="text-xs text-slate-400 dark:text-zinc-500"
                  >({{ sessions.length }})</span
                >
              </div>
              <div class="space-y-2">
                <div
                  v-for="session in sessions"
                  :key="session.id"
                  class="bg-surface-hover/60 flex items-center gap-3 rounded-lg p-2.5"
                >
                  <div
                    class="bg-surface ring-surface-border flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ring-1"
                  >
                    <UIcon
                      :name="session.icon"
                      class="h-3.5 w-3.5 text-slate-500 dark:text-zinc-400"
                    />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-surface-foreground truncate text-xs font-medium">
                      {{ session.device }}
                    </p>
                    <p
                      class="flex items-center gap-1 truncate text-xs text-slate-500 dark:text-zinc-400"
                    >
                      <UIcon name="i-lucide-map-pin" class="h-3 w-3 flex-shrink-0" />
                      {{ session.location }}
                    </p>
                  </div>
                  <UBadge v-if="session.current" color="success" variant="soft">{{
                    session.lastActive
                  }}</UBadge>
                  <span v-else class="flex-shrink-0 text-xs text-slate-400 dark:text-zinc-500">{{
                    session.lastActive
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </div>
      <AdminActivityTimeline :activities="activities" />
    </div>
    <!-- Edit Modal -->
    <UModal v-model:open="showEditModal" title="Chỉnh sửa hồ sơ" :ui="{ content: 'sm:max-w-md' }">
      <template #body>
        <UForm
          class="space-y-4"
          :schema="updateProfileSchema"
          :state="editForm"
          @submit="saveProfile"
        >
          <UFormField label="Họ và tên" name="fullName" required>
            <UInput v-model="editForm.fullName" class="w-full" />
          </UFormField>
          <UFormField
            label="Số điện thoại (Chỉ xem)"
            name="phone"
            help="SĐT được dùng để đăng nhập"
          >
            <UInput v-model="editForm.phone" type="tel" class="w-full" disabled />
          </UFormField>
        </UForm>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            variant="ghost"
            color="neutral"
            @click="
              () => {
                showEditModal = false
              }
            "
            >Huỷ</UButton
          >
          <UButton :loading="saving" @click="saveProfile">Lưu</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
