/**
 * Responsibility: Manage layout state (Sidebar toggle, Mobile menu toggle)
 * Dependency: Nuxt useState
 * Lifecycle: Global per request session (SSR Safe)
 * Reason: Share state between AdminHeader, AdminSidebar, and AdminBottomNav without prop drilling. Ensures SSR safety per the architecture rules.
 */
export const useAdminLayout = () => {
  const sidebarCollapsed = useState<boolean>('admin-sidebar-collapsed', () => false)
  const mobileSidebarOpen = useState<boolean>('admin-mobile-sidebar-open', () => false)

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const closeMobile = () => {
    mobileSidebarOpen.value = false
  }

  const openMobile = () => {
    mobileSidebarOpen.value = true
  }

  return {
    sidebarCollapsed,
    mobileSidebarOpen,
    toggleSidebar,
    closeMobile,
    openMobile
  }
}
