<script setup lang="ts">
import {
  Package, CheckCircle2, XCircle, AlertTriangle, Bell, CheckCheck,
  Trash2, Clock,
} from 'lucide-vue-next'
import { NotificationType, Role, UserStatus } from '../../core/enums'
import { mockNotifications, mockProfiles } from '../../core/mock/data'

const { t } = useI18n()
const toast = useToast()

useHead({ title: 'Thông báo - BunTech Driver' })
definePageMeta({ layout: 'driver' })

type FilterTab = 'all' | 'unread' | 'read'

const loading = ref(true)
const filterTab = ref<FilterTab>('all')

// Current driver
const currentDriver = computed(() => {
  return mockProfiles.find(p => p.role === Role.DRIVER && p.status === UserStatus.ACTIVE) || mockProfiles[2]
})

// Notifications for current driver (including system-wide null user_id)
const notifications = ref(mockNotifications
  .filter(n => n.user_id === currentDriver.value?.id || n.user_id === null)
  .map(n => ({ ...n, read: n.is_read }))
)

const NOTIFICATION_META: Record<string, { icon: typeof Package; bg: string; text: string }> = {
  [NotificationType.ORDER_ASSIGNED]: { icon: Package, bg: 'bg-primary-50 dark:bg-primary-900/20', text: 'text-primary-600 dark:text-primary-400' },
  [NotificationType.ORDER_DELIVERED]: { icon: CheckCircle2, bg: 'bg-success-50 dark:bg-success-900/20', text: 'text-success-600 dark:text-success-400' },
  [NotificationType.ORDER_CANCELLED]: { icon: XCircle, bg: 'bg-danger-50 dark:bg-danger-900/20', text: 'text-danger-600 dark:text-danger-400' },
  [NotificationType.LOW_STOCK]: { icon: AlertTriangle, bg: 'bg-warning-50 dark:bg-warning-900/20', text: 'text-warning-600 dark:text-warning-400' },
  [NotificationType.SYSTEM]: { icon: Bell, bg: 'bg-info-50 dark:bg-info-900/20', text: 'text-info-600 dark:text-info-400' },
}

const filteredNotifications = computed(() => {
  if (filterTab.value === 'unread') return notifications.value.filter(n => !n.read)
  if (filterTab.value === 'read') return notifications.value.filter(n => n.read)
  return notifications.value
})

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days} ngày trước`
  if (hours > 0) return `${hours} giờ trước`
  if (mins > 0) return `${mins} phút trước`
  return 'Vừa xong'
}

function markAsRead(id: string) {
  const n = notifications.value.find(x => x.id === id)
  if (n && !n.read) n.read = true
}

function markAllRead() {
  if (unreadCount.value === 0) {
    toast.info('Không có thông báo chưa đọc')
    return
  }
  notifications.value.forEach(n => { n.read = true })
  toast.success(`Đã đánh dấu ${unreadCount.value} thông báo là đã đọc`)
}

function clearAllRead() {
  const readCount = notifications.value.filter(n => n.read).length
  if (readCount === 0) {
    toast.info('Không có thông báo nào để xóa')
    return
  }
  notifications.value = notifications.value.filter(n => !n.read)
  toast.success(`Đã xóa ${readCount} thông báo đã đọc`)
}

function load() {
  loading.value = true
  setTimeout(() => { loading.value = false }, 400)
}

onMounted(load)
</script>

<template>
  <div class="p-4 pb-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <h1 class="text-xl font-bold text-surface-foreground tracking-tight flex items-center gap-2">
          Thông báo
          <span v-if="unreadCount" class="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold text-white bg-danger-500 rounded-full tabular-nums">{{ unreadCount }}</span>
        </h1>
        <p class="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">{{ unreadCount }} thông báo chưa đọc</p>
      </div>
      <div class="flex items-center gap-1">
        <button
          class="p-2.5 text-slate-500 dark:text-zinc-400 hover:text-danger-600 dark:hover:text-danger-400 hover:bg-surface-hover rounded-xl transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Xóa thông báo đã đọc"
          @click="clearAllRead"
        >
          <Trash2 class="w-5 h-5" aria-hidden="true" />
        </button>
        <button
          class="p-2.5 text-slate-500 dark:text-zinc-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-surface-hover rounded-xl transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Đánh dấu tất cả đã đọc"
          @click="markAllRead"
        >
          <CheckCheck class="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
    </div>

    <!-- Filter tabs -->
    <div class="flex items-center gap-2 mb-4">
      <div class="flex items-center gap-1 p-1 bg-surface rounded-xl border border-surface-border flex-1">
        <button
          v-for="tab in [
            { key: 'all', label: 'Tất cả', count: notifications.length },
            { key: 'unread', label: 'Chưa đọc', count: unreadCount },
            { key: 'read', label: 'Đã đọc', count: notifications.length - unreadCount },
          ]"
          :key="tab.key"
          :class="[
            'flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
            filterTab === tab.key
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-500 dark:text-zinc-400 hover:bg-surface-hover',
          ]"
          @click="filterTab = tab.key as FilterTab"
        >{{ tab.label }} <span class="opacity-60">({{ tab.count }})</span></button>
      </div>
    </div>

    <!-- Loading -->
    <template v-if="loading">
      <div v-for="i in 5" :key="i" class="card p-4 mb-2.5">
        <div class="flex items-start gap-3">
          <AppSkeleton height="h-10" width="w-10" class="rounded-xl" />
          <div class="flex-1">
            <AppSkeleton height="h-4" class="mb-2" />
            <AppSkeleton height="h-3" width="w-3/4" />
          </div>
        </div>
      </div>
    </template>

    <!-- Notification list -->
    <template v-else-if="filteredNotifications.length">
      <TransitionGroup name="fade" tag="div">
        <button
          v-for="(n, i) in filteredNotifications"
          :key="n.id"
          type="button"
          class="w-full text-left card card-hover p-4 mb-2.5 relative overflow-hidden animate-fade-in-up transition-all"
          :style="{ animationDelay: `${i * 40}ms` }"
          :class="{ 'ring-1 ring-primary-200 dark:ring-primary-800/40': !n.read }"
          @click="markAsRead(n.id)"
        >
          <div class="flex items-start gap-3">
            <div :class="['w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', NOTIFICATION_META[n.type]?.bg || 'bg-slate-100 dark:bg-zinc-800']">
              <component :is="NOTIFICATION_META[n.type]?.icon || Bell" :class="['w-5 h-5', NOTIFICATION_META[n.type]?.text || 'text-slate-500']" aria-hidden="true" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2 mb-1">
                <p :class="['text-sm leading-snug', n.read ? 'font-medium text-surface-foreground' : 'font-semibold text-surface-foreground']">{{ n.title }}</p>
                <span v-if="!n.read" class="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1.5" aria-label="Chưa đọc" />
              </div>
              <p class="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed line-clamp-2 mb-1.5">{{ n.message }}</p>
              <div class="flex items-center gap-1 text-[11px] text-slate-400 dark:text-zinc-500">
                <Clock class="w-3 h-3" aria-hidden="true" />
                <span>{{ timeAgo(n.created_at) }}</span>
              </div>
            </div>
          </div>
        </button>
      </TransitionGroup>
    </template>

    <!-- Empty -->
    <AppEmptyState
      v-else
      :title="filterTab === 'unread' ? 'Không có thông báo chưa đọc' : 'Không có thông báo'"
      :description="filterTab === 'unread' ? 'Bạn đã đọc hết tất cả thông báo rồi!' : 'Khi có thông báo mới, nó sẽ hiển thị tại đây.'"
    />
  </div>
</template>
