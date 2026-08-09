<!--
  Responsibility: Render the Admin Layout Header containing user profile, dark mode toggle, and mobile menu toggle.
  Dependency: mockAdminUser (utils), useAdminLayout (composables), useColorMode (Nuxt).
  Lifecycle: Mounted on admin layout, destroyed when leaving admin layout.
  Reason: Extracting from admin.vue to keep components small and adhere to architecture rules.
-->
<script setup lang="ts">
import { mockAdminUser } from '~/utils/mockData'

const { openMobile } = useAdminLayout()
</script>

<template>
  <header
    class="glass border-surface-border/50 safe-area-top sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 sm:px-6"
  >
    <UButton
      variant="ghost"
      color="neutral"
      class="text-surface-foreground hover:bg-surface-hover -ml-2 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2.5 transition-colors lg:hidden"
      @click="openMobile"
    >
      <UIcon name="i-lucide-menu" class="h-5 w-5" aria-hidden="true" />
    </UButton>

    <!-- Search hint -->
    <div class="hidden items-center gap-2 text-sm text-slate-400 lg:flex dark:text-zinc-500">
      <kbd
        class="border-surface-border bg-surface-muted rounded-md border px-2 py-1 font-mono text-xs text-slate-400 dark:text-zinc-500"
        >⌘K</kbd
      >
      <span class="text-xs">Tìm kiếm nhanh...</span>
    </div>

    <div class="flex-1 lg:hidden" />

    <div class="flex items-center gap-1.5">
      <!-- Dark mode -->
      <UColorModeButton />

      <!-- Notifications -->
      <UButton
        variant="ghost"
        color="neutral"
        class="text-surface-foreground hover:bg-surface-hover relative flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2.5 transition-colors"
      >
        <UIcon name="i-lucide-bell" class="h-[18px] w-[18px]" aria-hidden="true" />
        <span
          class="bg-primary-500 ring-surface absolute top-2 right-2 h-2 w-2 rounded-full ring-2"
        />
        <span
          class="bg-primary-500 absolute top-2 right-2 h-2 w-2 animate-ping rounded-full opacity-60"
        />
      </UButton>

      <!-- User menu -->
      <div class="relative ml-1">
        <UDropdownMenu
          :items="[
            [
              { label: 'Hồ sơ', icon: 'i-lucide-user', to: '/admin/profile' },
              { label: 'Đổi mật khẩu', icon: 'i-lucide-settings', to: '/admin/change-password' }
            ],
            [
              {
                label: 'Đăng xuất',
                icon: 'i-lucide-log-out',
                color: 'error',
                to: '/auth/admin/login'
              }
            ]
          ]"
          :ui="{ content: 'w-56' }"
        >
          <UButton
            variant="ghost"
            color="neutral"
            class="hover:bg-surface-hover flex min-h-[44px] items-center gap-2.5 rounded-xl px-2 py-1.5 transition-all duration-200"
          >
            <UAvatar :src="mockAdminUser.avatar_url" :alt="mockAdminUser.full_name" size="sm" />
            <div class="hidden text-left sm:block">
              <p class="text-surface-foreground text-sm leading-tight font-medium">
                {{ mockAdminUser.full_name }}
              </p>
              <p class="text-xs leading-tight text-slate-400 dark:text-zinc-500">
                {{ mockAdminUser.phone }}
              </p>
            </div>
            <UIcon
              name="i-lucide-chevron-down"
              class="hidden h-4 w-4 text-slate-400 transition-transform sm:block dark:text-zinc-500"
              aria-hidden="true"
            />
          </UButton>
        </UDropdownMenu>
      </div>
    </div>
  </header>
</template>
