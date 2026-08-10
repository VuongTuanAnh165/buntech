<!--
  Responsibility: Render security information and active sessions for the admin profile.
  Dependency: UI components (UCard, UIcon, UBadge), formatDate (utils).
  Lifecycle: Mounted on admin profile page.
  Reason: Extracted from admin/profile.vue to adhere to the < 400 lines rule and component-driven architecture.
-->
<script setup lang="ts">
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
</script>

<template>
  <UCard>
    <div class="mb-4 flex items-center gap-2.5">
      <div
        class="bg-success-50 dark:bg-success-900/20 ring-success-100 dark:ring-success-900/30 flex h-8 w-8 items-center justify-center rounded-lg ring-1"
      >
        <UIcon name="i-lucide-shield" class="text-success-600 dark:text-success-400 h-4 w-4" />
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
      <div class="border-surface-border flex items-center justify-between gap-3 border-y py-3">
        <div class="flex min-w-0 items-center gap-2.5">
          <UIcon
            name="i-lucide-smartphone"
            class="h-4 w-4 flex-shrink-0 text-slate-400 dark:text-zinc-500"
          />
          <div>
            <p class="text-surface-foreground text-sm font-medium">Xác thực 2 bước</p>
            <p class="text-xs text-slate-500 dark:text-zinc-400">Bảo vệ tài khoản thêm một lớp</p>
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
          <span class="text-xs text-slate-400 dark:text-zinc-500">({{ sessions.length }})</span>
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
              <UIcon :name="session.icon" class="h-3.5 w-3.5 text-slate-500 dark:text-zinc-400" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-surface-foreground truncate text-xs font-medium">
                {{ session.device }}
              </p>
              <p class="flex items-center gap-1 truncate text-xs text-slate-500 dark:text-zinc-400">
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
</template>
