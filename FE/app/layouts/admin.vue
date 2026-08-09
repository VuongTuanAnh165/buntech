<!--
  Responsibility: Render the main layout for all Admin pages.
  Dependency: AdminSidebar, AdminHeader, AdminBottomNav, useAdminLayout.
  Lifecycle: Loaded when a page with layout: 'admin' is accessed.
  Reason: Adheres to Nuxt layouts architecture to provide a consistent shell for admin features.
-->
<script setup lang="ts">
import AdminSidebar from '~/components/layouts/admin/AdminSidebar.vue'
import AdminHeader from '~/components/layouts/admin/AdminHeader.vue'
import AdminBottomNav from '~/components/layouts/admin/AdminBottomNav.vue'

const { sidebarCollapsed, mobileSidebarOpen, closeMobile } = useAdminLayout()
</script>

<template>
  <div class="bg-surface-muted text-surface-foreground flex min-h-screen font-sans">
    <!-- Mobile/Tablet overlay -->
    <Transition name="fade">
      <div
        v-if="mobileSidebarOpen"
        class="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
        @click="closeMobile"
      />
    </Transition>

    <!-- Sidebar -->
    <AdminSidebar />

    <!-- Main content -->
    <div
      :class="[
        'min-h-screen flex-1 transition-[margin] duration-300 ease-out',
        sidebarCollapsed ? 'lg:ml-[68px]' : 'lg:ml-[248px]'
      ]"
    >
      <!-- Top bar -->
      <AdminHeader />

      <!-- Page content -->
      <main class="mx-auto h-[calc(100vh-64px)] overflow-y-auto p-4 pb-24 sm:p-6 lg:p-8 lg:pb-12">
        <slot />
      </main>
    </div>

    <!-- Bottom Navigation -->
    <AdminBottomNav />
  </div>
</template>
