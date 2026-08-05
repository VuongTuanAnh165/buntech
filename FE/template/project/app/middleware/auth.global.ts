import { Role } from '../core/enums'

export default defineNuxtRouteMiddleware((to) => {
  const isAdminRoute = to.path.startsWith('/admin')
  const isDriverRoute = to.path.startsWith('/driver')
  const isCustomerPortal = to.path.startsWith('/portal')
  const isAuthRoute = to.path.startsWith('/auth')

  if (import.meta.server) {
    if (isAdminRoute) return navigateTo('/auth/admin/login')
    if (isDriverRoute) return navigateTo('/auth/driver/login')
    if (isCustomerPortal) return navigateTo('/auth/customer/login')
    return
  }

  const authStore = useAuthStore()
  if (!authStore.initialized) {
    authStore.init()
  }

  if (isAuthRoute) {
    if (authStore.isAuthenticated) {
      if (authStore.role === Role.ADMIN) return navigateTo('/admin')
      if (authStore.role === Role.DRIVER) return navigateTo('/driver')
      if (authStore.role === Role.CUSTOMER) return navigateTo('/portal')
    }
    return
  }

  if (isAdminRoute) {
    if (!authStore.isAuthenticated) return navigateTo('/auth/admin/login')
    if (authStore.role !== Role.ADMIN) return navigateTo('/')
    return
  }

  if (isDriverRoute) {
    if (!authStore.isAuthenticated) return navigateTo('/auth/driver/login')
    if (authStore.role !== Role.DRIVER) return navigateTo('/')
    return
  }

  if (isCustomerPortal) {
    if (!authStore.isAuthenticated) return navigateTo('/auth/customer/login')
    if (authStore.role !== Role.CUSTOMER) return navigateTo('/')
    return
  }
})
