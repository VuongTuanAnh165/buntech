<script setup lang="ts">
import { NotificationType, Role, UserStatus } from '~/utils/enums'
import { mockNotifications, mockProfiles } from '~/utils/mockData'
definePageMeta({ layout: 'driver' })
useSeoMeta({ title: 'Thông báo - BunTech Driver' })
const toast = useToast()
type FilterTab = 'all' | 'unread' | 'read'
const loading = ref(true)
const filterTab = ref<FilterTab>('all')
const currentDriver = computed(() =>
  mockProfiles.find(p => p.role === Role.DRIVER && p.status === UserStatus.ACTIVE) || mockProfiles[2]
)
const notifications = ref(
  mockNotifications
    .filter(n => n.user_id === currentDriver.value?.id || !n.user_id)
    .map(n => ({ ...n, read: n.is_read }))
)
const NOTIFICATION_ICONS: Record<string, { icon: string; bg: string; text: string }> = {
  [NotificationType.ORDER_ASSIGNED]: { icon: 'i-lucide-package', bg: 'bg-primary-50 dark:bg-primary-900/20', text: 'text-primary-600 dark:text-primary-400' },
  [NotificationType.ORDER_DELIVERED]: { icon: 'i-lucide-check-circle-2', bg: 'bg-success-50 dark:bg-success-900/20', text: 'text-success-600 dark:text-success-400' },
  [NotificationType.ORDER_CANCELLED]: { icon: 'i-lucide-x-circle', bg: 'bg-error-50 dark:bg-error-900/20', text: 'text-error-600 dark:text-error-400' },
  [NotificationType.LOW_STOCK]: { icon: 'i-lucide-alert-triangle', bg: 'bg-warning-50 dark:bg-warning-900/20', text: 'text-warning-600 dark:text-warning-400' },
  [NotificationType.SYSTEM]: { icon: 'i-lucide-bell', bg: 'bg-info-50 dark:bg-info-900/20', text: 'text-info-600 dark:text-info-400' },
}
const filteredNotifications = computed(() => {
  if (filterTab.value === 'unread') return notifications.value.filter(n => !n.read)
  if (filterTab.value === 'read') return notifications.value.filter(n => n.read)
  return notifications.value
})
const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)
function markAsRead(id: string) {
  const n = notifications.value.find(x => x.id === id)
  if (n && !n.read) n.read = true
}
function markAllRead() {
  if (unreadCount.value === 0) {
    toast.add({ title: 'Không có thông báo chưa đọc', color: 'info' })
    return
  }
  notifications.value.forEach(n => { n.read = true })
  toast.add({ title: `Đã đánh dấu ${unreadCount.value} thông báo là đã đọc`, color: 'success' })
}
function clearAllRead() {
  const readCount = notifications.value.filter(n => n.read).length
  if (readCount === 0) {
    toast.add({ title: 'Không có thông báo nào để xóa', color: 'info' })
    return
  }
  notifications.value = notifications.value.filter(n => !n.read)
  toast.add({ title: `Đã xóa ${readCount} thông báo đã đọc`, color: 'success' })
}
onMounted(() => { setTimeout(() => { loading.value = false }, 400) })
</script>
<template>
  <div class="p-4 pb-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <h1 class="text-xl font-bold text-neutral-900 dark:text-white tracking-tight flex items-center gap-2">
          Thông báo
          <span v-if="unreadCount" class="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold text-white bg-error-500 rounded-full tabular-nums">{{ unreadCount }}</span>
        </h1>
        <p class="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">{{ unreadCount }} thông báo chưa đọc</p>
      </div>
      <div class="flex items-center gap-1">
        <UButton variant="ghost" color="neutral"
          class="p-2.5 text-slate-500 dark:text-zinc-400 hover:text-error-600 dark:hover:text-error-400 hover:bg-neutral-100 dark:hover:bg-zinc-800 rounded-xl transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
          @click="clearAllRead"
        >
          <UIcon name="i-lucide-trash-2" class="w-5 h-5" />
        </UButton>
        <UButton variant="ghost" color="neutral"
          class="p-2.5 text-slate-500 dark:text-zinc-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-neutral-100 dark:hover:bg-zinc-800 rounded-xl transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
          @click="markAllRead"
        >
          <UIcon name="i-lucide-check-check" class="w-5 h-5" />
        </UButton>
      </div>
    </div>
    <!-- Filter tabs -->
    <div class="flex items-center gap-2 mb-4">
      <div class="flex items-center gap-1 p-1 bg-white dark:bg-zinc-900 rounded-xl border border-neutral-200 dark:border-neutral-800 flex-1">
        <UButton variant="ghost" color="neutral"
          v-for="tab in [
            { accessorKey: 'all', header: 'Tất cả', count: notifications.length },
            { accessorKey: 'unread', header: 'Chưa đọc', count: unreadCount },
            { accessorKey: 'read', header: 'Đã đọc', count: notifications.length - unreadCount },
          ]"
          :key="tab.key"
          :class="[
            'flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
            filterTab === tab.key
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-500 dark:text-zinc-400 hover:bg-neutral-100 dark:hover:bg-zinc-800',
          ]"
          @click="filterTab = tab.key as FilterTab"
        >{{ tab.label }} <span class="opacity-60">({{ tab.count }})</span></UButton>
      </div>
    </div>
    <!-- Loading -->
    <template v-if="loading">
      <div v-for="i in 5" :key="i" class="card p-4 mb-2.5">
        <div class="flex items-start gap-3">
          <div class="skeleton h-10 w-10 rounded-xl" />
          <div class="flex-1"><div class="skeleton h-4 mb-2" /><div class="skeleton h-3 w-3/4" /></div>
        </div>
      </div>
    </template>
    <!-- Notification list -->
    <template v-else-if="filteredNotifications.length">
      <UButton variant="ghost" color="neutral"
        v-for="(n, i) in filteredNotifications"
        :key="n.id"
        type="button"
        class="w-full text-left card card-hover p-4 mb-2.5 relative overflow-hidden animate-fade-in-up transition-all"
        :style="{ animationDelay: `${i * 40}ms` }"
        :class="{ 'ring-1 ring-primary-200 dark:ring-primary-800/40': !n.read }"
        @click="markAsRead(n.id)"
      >
        <div class="flex items-start gap-3">
          <div :class="['w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', NOTIFICATION_ICONS[n.type]?.bg || 'bg-slate-100 dark:bg-zinc-800']">
            <UIcon :name="NOTIFICATION_ICONS[n.type]?.icon || 'i-lucide-bell'" :class="['w-5 h-5', NOTIFICATION_ICONS[n.type]?.text || 'text-slate-500']" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2 mb-1">
              <p :class="['text-sm leading-snug', n.read ? 'font-medium text-neutral-900 dark:text-white' : 'font-semibold text-neutral-900 dark:text-white']">{{ n.title }}</p>
              <span v-if="!n.read" class="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1.5" />
            </div>
            <p class="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed line-clamp-2 mb-1.5">{{ n.message }}</p>
            <div class="flex items-center gap-1 text-[11px] text-slate-400 dark:text-zinc-500">
              <UIcon name="i-lucide-clock" class="w-3 h-3" />
              <span>{{ formatTimeAgo(n.created_at) }}</span>
            </div>
          </div>
        </div>
      </UButton>
    </template>
    <!-- Empty -->
    <BaseEmptyState
      v-else
      :title="filterTab === 'unread' ? 'Không có thông báo chưa đọc' : 'Không có thông báo'"
      :description="filterTab === 'unread' ? 'Bạn đã đọc hết tất cả thông báo rồi!' : 'Khi có thông báo mới, nó sẽ hiển thị tại đây.'"
    />
  </div>
</template>
