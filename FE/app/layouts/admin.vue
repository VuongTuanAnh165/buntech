<script setup lang="ts">
/**
 * Layout Admin — Dashboard với Sidebar + Header.
 * Sử dụng UDashboardGroup / UDashboardSidebar của Nuxt UI v4.
 */
import { adminNavigationItems } from '~/utils/navigation'

const { logout } = useAuth()
const userStore = useCurrentUserStore()
</script>

<template>
  <UDashboardGroup>
    <UDashboardSidebar collapsible resizable>
      <!-- Header: Logo + Search -->
      <template #header="{ collapsed }">
        <div class="flex items-center gap-2 px-1">
          <UIcon name="i-lucide-wheat" class="text-primary size-6 shrink-0" />
          <span v-if="!collapsed" class="text-highlighted text-lg font-bold">BunTech</span>
        </div>
      </template>

      <!-- Navigation Menu -->
      <template #default="{ collapsed }">
        <UNavigationMenu
          :collapsed="collapsed"
          :items="adminNavigationItems"
          orientation="vertical"
        />
      </template>

      <!-- Footer: User info + Logout -->
      <template #footer="{ collapsed }">
        <div class="flex flex-col gap-2">
          <!-- Color Mode Toggle -->
          <div class="flex justify-center">
            <UColorModeButton size="xs" color="neutral" variant="ghost" />
          </div>

          <!-- User Menu -->
          <UDropdownMenu
            :items="[
              [
                {
                  label: userStore.currentUser?.fullName || 'Người dùng',
                  icon: 'i-lucide-user',
                  disabled: true
                }
              ],
              [
                {
                  label: 'Đăng xuất',
                  icon: 'i-lucide-log-out',
                  color: 'error' as const,
                  onSelect: logout
                }
              ]
            ]"
          >
            <UButton
              :icon="collapsed ? 'i-lucide-user-circle' : undefined"
              :label="collapsed ? undefined : userStore.currentUser?.fullName || 'Tài khoản'"
              color="neutral"
              variant="ghost"
              block
              :truncate="!collapsed"
            />
          </UDropdownMenu>
        </div>
      </template>
    </UDashboardSidebar>

    <slot />
  </UDashboardGroup>
</template>
