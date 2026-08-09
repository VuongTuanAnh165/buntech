<script setup lang="ts">
import { NotificationType, Role, UserStatus } from '~/utils/enums'
import { mockNotifications, mockProfiles } from '~/utils/mockData'
definePageMeta({ layout: 'driver' })
useSeoMeta({ title: 'Thông báo - BunTech Driver' })
const toast = useToast()
type FilterTab = 'all' | 'unread' | 'read'
const loading = ref(true)
const filterTab = ref<FilterTab>('all')
const currentDriver = computed(
  () =>
    mockProfiles.find((p) => p.role === Role.DRIVER && p.status === UserStatus.ACTIVE) ||
    mockProfiles[2]
)
const notifications = ref(
  mockNotifications
    .filter((n) => n.user_id === currentDriver.value?.id || !n.user_id)
    .map((n) => ({ ...n, read: n.is_read }))
)
const NOTIFICATION_ICONS: Record<string, { icon: string; bg: string; text: string }> = {
  [NotificationType.ORDER_ASSIGNED]: {
    icon: 'i-lucide-package',
    bg: 'bg-primary-50 dark:bg-primary-900/20',
    text: 'text-primary-600 dark:text-primary-400'
  },
  [NotificationType.ORDER_DELIVERED]: {
    icon: 'i-lucide-check-circle-2',
    bg: 'bg-success-50 dark:bg-success-900/20',
    text: 'text-success-600 dark:text-success-400'
  },
  [NotificationType.ORDER_CANCELLED]: {
    icon: 'i-lucide-x-circle',
    bg: 'bg-error-50 dark:bg-error-900/20',
    text: 'text-error-600 dark:text-error-400'
  },
  [NotificationType.LOW_STOCK]: {
    icon: 'i-lucide-alert-triangle',
    bg: 'bg-warning-50 dark:bg-warning-900/20',
    text: 'text-warning-600 dark:text-warning-400'
  },
  [NotificationType.SYSTEM]: {
    icon: 'i-lucide-bell',
    bg: 'bg-info-50 dark:bg-info-900/20',
    text: 'text-info-600 dark:text-info-400'
  }
}
const filteredNotifications = computed(() => {
  if (filterTab.value === 'unread') return notifications.value.filter((n) => !n.read)
  if (filterTab.value === 'read') return notifications.value.filter((n) => n.read)
  return notifications.value
})
const unreadCount = computed(() => notifications.value.filter((n) => !n.read).length)
function markAsRead(id: string) {
  const n = notifications.value.find((x) => x.id === id)
  if (n && !n.read) n.read = true
}
function markAllRead() {
  if (unreadCount.value === 0) {
    toast.add({ title: 'Không có thông báo chưa đọc', color: 'info' })
    return
  }
  notifications.value.forEach((n) => {
    n.read = true
  })
  toast.add({ title: `Đã đánh dấu ${unreadCount.value} thông báo là đã đọc`, color: 'success' })
}
function clearAllRead() {
  const readCount = notifications.value.filter((n) => n.read).length
  if (readCount === 0) {
    toast.add({ title: 'Không có thông báo nào để xóa', color: 'info' })
    return
  }
  notifications.value = notifications.value.filter((n) => !n.read)
  toast.add({ title: `Đã xóa ${readCount} thông báo đã đọc`, color: 'success' })
}
onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 400)
})
</script>
<template>
  <div class="p-4 pb-6">
    <!-- Header -->
    <div class="mb-4 flex items-center justify-between">
      <div>
        <h1
          class="flex items-center gap-2 text-xl font-bold tracking-tight text-neutral-900 dark:text-white"
        >
          Thông báo
          <span
            v-if="unreadCount"
            class="bg-error-500 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-white tabular-nums"
            >{{ unreadCount }}</span
          >
        </h1>
        <p class="mt-0.5 text-sm text-slate-500 dark:text-zinc-400">
          {{ unreadCount }} thông báo chưa đọc
        </p>
      </div>
      <div class="flex items-center gap-1">
        <UButton
          variant="ghost"
          color="neutral"
          class="hover:text-error-600 dark:hover:text-error-400 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl p-2.5 text-slate-500 transition-all hover:bg-neutral-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          @click="clearAllRead"
        >
          <UIcon name="i-lucide-trash-2" class="h-5 w-5" />
        </UButton>
        <UButton
          variant="ghost"
          color="neutral"
          class="hover:text-primary-600 dark:hover:text-primary-400 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl p-2.5 text-slate-500 transition-all hover:bg-neutral-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          @click="markAllRead"
        >
          <UIcon name="i-lucide-check-check" class="h-5 w-5" />
        </UButton>
      </div>
    </div>
    <!-- Filter tabs -->
    <div class="mb-4 flex items-center gap-2">
      <div
        class="flex flex-1 items-center gap-1 rounded-xl border border-neutral-200 bg-white p-1 dark:border-neutral-800 dark:bg-zinc-900"
      >
        <UButton
          v-for="tab in [
            { accessorKey: 'all', header: 'Tất cả', count: notifications.length },
            { accessorKey: 'unread', header: 'Chưa đọc', count: unreadCount },
            { accessorKey: 'read', header: 'Đã đọc', count: notifications.length - unreadCount }
          ]"
          :key="tab.key"
          variant="ghost"
          color="neutral"
          :class="[
            'flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
            filterTab === tab.key
              ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900'
              : 'text-slate-500 hover:bg-neutral-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
          ]"
          @click="filterTab = tab.key as FilterTab"
          >{{ tab.label }} <span class="opacity-60">({{ tab.count }})</span></UButton
        >
      </div>
    </div>
    <!-- Loading -->
    <template v-if="loading">
      <div v-for="i in 5" :key="i" class="card mb-2.5 p-4">
        <div class="flex items-start gap-3">
          <div class="skeleton h-10 w-10 rounded-xl" />
          <div class="flex-1">
            <div class="skeleton mb-2 h-4" />
            <div class="skeleton h-3 w-3/4" />
          </div>
        </div>
      </div>
    </template>
    <!-- Notification list -->
    <template v-else-if="filteredNotifications.length">
      <UButton
        v-for="(n, i) in filteredNotifications"
        :key="n.id"
        variant="ghost"
        color="neutral"
        type="button"
        class="card card-hover animate-fade-in-up relative mb-2.5 w-full overflow-hidden p-4 text-left transition-all"
        :style="{ animationDelay: `${i * 40}ms` }"
        :class="{ 'ring-primary-200 dark:ring-primary-800/40 ring-1': !n.read }"
        @click="markAsRead(n.id)"
      >
        <div class="flex items-start gap-3">
          <div
            :class="[
              'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl',
              NOTIFICATION_ICONS[n.type]?.bg || 'bg-slate-100 dark:bg-zinc-800'
            ]"
          >
            <UIcon
              :name="NOTIFICATION_ICONS[n.type]?.icon || 'i-lucide-bell'"
              :class="['h-5 w-5', NOTIFICATION_ICONS[n.type]?.text || 'text-slate-500']"
            />
          </div>
          <div class="min-w-0 flex-1">
            <div class="mb-1 flex items-start justify-between gap-2">
              <p
                :class="[
                  'text-sm leading-snug',
                  n.read
                    ? 'font-medium text-neutral-900 dark:text-white'
                    : 'font-semibold text-neutral-900 dark:text-white'
                ]"
              >
                {{ n.title }}
              </p>
              <span
                v-if="!n.read"
                class="bg-primary-500 mt-1.5 h-2 w-2 flex-shrink-0 rounded-full"
              />
            </div>
            <p
              class="mb-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-zinc-400"
            >
              {{ n.message }}
            </p>
            <div class="flex items-center gap-1 text-[11px] text-slate-400 dark:text-zinc-500">
              <UIcon name="i-lucide-clock" class="h-3 w-3" />
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
      :description="
        filterTab === 'unread'
          ? 'Bạn đã đọc hết tất cả thông báo rồi!'
          : 'Khi có thông báo mới, nó sẽ hiển thị tại đây.'
      "
    />
  </div>
</template>
