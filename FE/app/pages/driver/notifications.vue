<script setup lang="ts">
import { ConstantKey } from '~/enums/constantKeys'
import { useDriverNotifications } from '~/composables/driver/useDriverNotifications'
import type { DriverNotification } from '~/composables/driver/useDriverNotifications'

const { constants } = useMasterData()
definePageMeta({ layout: 'driver' })
useSeoMeta({ title: 'Thông báo - BunTech Driver' })

type FilterTab = 'all' | 'unread' | 'read'
const filterTab = ref<FilterTab>('all')

const {
  notifications,
  meta,
  pending: loading,
  fetchNotifications,
  markAsRead: apiMarkAsRead,
  markAllAsRead
} = useDriverNotifications()

const NOTIFICATION_ICONS: Record<string, { icon: string; bg: string; text: string }> = {}

NOTIFICATION_ICONS[
  constants.value?.[ConstantKey.NotificationType]?.ORDER_ASSIGNED || 'ORDER_ASSIGNED'
] = {
  icon: 'i-lucide-package',
  bg: 'bg-primary-50 dark:bg-primary-900/20',
  text: 'text-primary-600 dark:text-primary-400'
}
NOTIFICATION_ICONS[
  constants.value?.[ConstantKey.NotificationType]?.ORDER_DELIVERED || 'ORDER_DELIVERED'
] = {
  icon: 'i-lucide-check-circle-2',
  bg: 'bg-success-50 dark:bg-success-900/20',
  text: 'text-success-600 dark:text-success-400'
}
NOTIFICATION_ICONS[
  constants.value?.[ConstantKey.NotificationType]?.ORDER_CANCELLED || 'ORDER_CANCELLED'
] = {
  icon: 'i-lucide-x-circle',
  bg: 'bg-error-50 dark:bg-error-900/20',
  text: 'text-error-600 dark:text-error-400'
}
NOTIFICATION_ICONS[constants.value?.[ConstantKey.NotificationType]?.LOW_STOCK || 'LOW_STOCK'] = {
  icon: 'i-lucide-alert-triangle',
  bg: 'bg-warning-50 dark:bg-warning-900/20',
  text: 'text-warning-600 dark:text-warning-400'
}
NOTIFICATION_ICONS[constants.value?.[ConstantKey.NotificationType]?.SYSTEM || 'SYSTEM'] = {
  icon: 'i-lucide-bell',
  bg: 'bg-info-50 dark:bg-info-900/20',
  text: 'text-info-600 dark:text-info-400'
}

const unreadCount = computed(
  () => notifications.value.filter((n: DriverNotification) => !n.isRead).length
)

async function markAsRead(id: string) {
  const n = notifications.value.find((x: DriverNotification) => x.id === id)
  if (n && !n.isRead) {
    await apiMarkAsRead(id)
  }
}

const loadData = async (page = 1) => {
  await fetchNotifications(page, filterTab.value === 'unread')
}

watch(filterTab, () => {
  loadData(1)
})

onMounted(() => {
  loadData(1)
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
      <UButton
        v-if="unreadCount > 0"
        variant="ghost"
        color="neutral"
        size="sm"
        class="text-primary-600 dark:text-primary-400"
        @click="markAllAsRead"
      >
        Đánh dấu tất cả đã đọc
      </UButton>
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
          :key="tab.accessorKey"
          variant="ghost"
          color="neutral"
          :class="[
            'flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
            filterTab === tab.accessorKey
              ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900'
              : 'text-slate-500 hover:bg-neutral-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
          ]"
          @click="
            () => {
              filterTab = tab.accessorKey as FilterTab
            }
          "
          >{{ tab.header }} <span class="opacity-60">({{ tab.count }})</span></UButton
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
    <template v-else-if="notifications.length">
      <UButton
        v-for="(n, i) in notifications"
        :key="n.id"
        variant="ghost"
        color="neutral"
        type="button"
        class="card card-hover animate-fade-in-up relative mb-2.5 w-full overflow-hidden p-4 text-left transition-all"
        :style="{ animationDelay: `${i * 40}ms` }"
        :class="{ 'ring-primary-200 dark:ring-primary-800/40 ring-1': !n.isRead }"
        @click="markAsRead(n.id)"
      >
        <div class="flex items-start gap-3">
          <div
            :class="[
              'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl',
              NOTIFICATION_ICONS[n.type || 'SYSTEM']?.bg || 'bg-slate-100 dark:bg-zinc-800'
            ]"
          >
            <UIcon
              :name="NOTIFICATION_ICONS[n.type || 'SYSTEM']?.icon || 'i-lucide-bell'"
              :class="['h-5 w-5', NOTIFICATION_ICONS[n.type || 'SYSTEM']?.text || 'text-slate-500']"
            />
          </div>
          <div class="min-w-0 flex-1">
            <div class="mb-1 flex items-start justify-between gap-2">
              <p
                :class="[
                  'text-sm leading-snug',
                  n.isRead
                    ? 'font-medium text-neutral-900 dark:text-white'
                    : 'font-semibold text-neutral-900 dark:text-white'
                ]"
              >
                {{ n.title }}
              </p>
              <span
                v-if="!n.isRead"
                class="bg-primary-500 mt-1.5 h-2 w-2 flex-shrink-0 rounded-full"
              />
            </div>
            <p
              class="mb-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-zinc-400"
            >
              {{ n.body }}
            </p>
            <div class="flex items-center gap-1 text-[11px] text-slate-400 dark:text-zinc-500">
              <UIcon name="i-lucide-clock" class="h-3 w-3" />
              <span>{{ formatTimeAgo(n.createdAt) }}</span>
            </div>
          </div>
        </div>
      </UButton>

      <!-- Load More -->
      <div
        v-if="meta?.lastPage && meta.currentPage < meta.lastPage"
        class="mt-4 flex justify-center pb-8"
      >
        <UButton
          variant="outline"
          color="primary"
          :loading="loading"
          @click="loadData(meta.currentPage + 1)"
        >
          Tải thêm
        </UButton>
      </div>
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
