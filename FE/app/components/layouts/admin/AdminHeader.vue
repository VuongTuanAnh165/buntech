<!--
  Responsibility: Render the Admin Layout Header containing user profile, dark mode toggle, and mobile menu toggle.
  Dependency: auth (store), useAdminLayout (composables), useColorMode (Nuxt).
-->
<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const { openMobile } = useAdminLayout()
const authStore = useAuthStore()

const handleLogout = async () => {
  await authStore.logout()
  navigateTo('/auth/admin/login')
}
</script>

<template>
  <header
    class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-white/60 px-4 backdrop-blur-xl transition-colors sm:px-6 dark:bg-zinc-950/60"
  >
    <UButton
      variant="ghost"
      color="neutral"
      class="-ml-2 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl p-2.5 text-slate-700 transition-colors hover:bg-slate-100/50 lg:hidden dark:text-zinc-300 dark:hover:bg-zinc-800/50"
      @click="openMobile"
    >
      <UIcon name="i-lucide-menu" class="h-5 w-5" aria-hidden="true" />
    </UButton>

    <!-- Search hint -->
    <div class="hidden items-center gap-2 text-sm text-slate-400 lg:flex dark:text-zinc-500">
      <kbd
        class="rounded-md border border-slate-200/50 bg-slate-100/50 px-2 py-1 font-mono text-[11px] font-medium text-slate-500 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/50 dark:text-zinc-400"
      >
        ⌘K
      </kbd>
      <span class="text-[13px] font-medium">Tìm kiếm nhanh...</span>
    </div>

    <div class="flex-1 lg:hidden" />

    <div class="flex items-center gap-2">
      <!-- Dark mode -->
      <UColorModeButton />

      <!-- Notifications -->
      <UButton
        variant="ghost"
        color="neutral"
        class="relative flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl text-slate-700 transition-colors hover:bg-slate-100/50 dark:text-zinc-300 dark:hover:bg-zinc-800/50"
      >
        <UIcon name="i-lucide-bell" class="h-5 w-5" aria-hidden="true" />
        <span
          class="bg-primary-500 absolute top-2 right-2 h-2 w-2 rounded-full ring-2 ring-white dark:ring-zinc-950"
        />
        <span
          class="bg-primary-500 absolute top-2 right-2 h-2 w-2 animate-ping rounded-full opacity-75"
        />
      </UButton>

      <!-- User menu -->
      <div class="relative ml-2">
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
                onSelect: handleLogout
              }
            ]
          ]"
          :ui="{
            content:
              'w-56 rounded-xl shadow-xl shadow-black/5 ring-1 ring-slate-200 dark:ring-zinc-800'
          }"
        >
          <UButton
            variant="ghost"
            color="neutral"
            class="flex h-10 items-center gap-3 rounded-xl px-2 transition-all duration-300 hover:bg-slate-100/50 dark:hover:bg-zinc-800/50"
          >
            <UAvatar
              :src="authStore.user?.avatarUrl || ''"
              :alt="authStore.user?.fullName || 'Admin'"
              size="sm"
              class="shadow-sm ring-2 ring-white dark:ring-zinc-900"
            />
            <div class="hidden text-left sm:block">
              <p class="text-[13px] leading-none font-semibold text-slate-700 dark:text-zinc-200">
                {{ authStore.user?.fullName || 'Admin User' }}
              </p>
              <p
                class="mt-1 text-[11px] leading-none font-medium text-slate-500 dark:text-zinc-400"
              >
                {{ authStore.user?.role || 'Quản trị viên' }}
              </p>
            </div>
            <UIcon
              name="i-lucide-chevron-down"
              class="hidden h-3.5 w-3.5 text-slate-400 transition-transform sm:block dark:text-zinc-500"
              aria-hidden="true"
            />
          </UButton>
        </UDropdownMenu>
      </div>
    </div>
  </header>
</template>
