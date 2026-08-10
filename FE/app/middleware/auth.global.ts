/**
 * Middleware: auth.global
 * Tự động kiểm tra quyền truy cập trên toàn ứng dụng.
 */
export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie('auth_token')

  // Xác định các route cần bảo vệ
  const isProtectedRoute =
    to.path.startsWith('/admin') ||
    to.path.startsWith('/driver') ||
    to.path.startsWith('/wholesale')

  if (isProtectedRoute && !token.value) {
    let loginPath = '/auth/customer/login'

    if (to.path.startsWith('/admin')) {
      loginPath = '/auth/admin/login'
    } else if (to.path.startsWith('/driver')) {
      loginPath = '/auth/driver/login'
    }

    return navigateTo({
      path: loginPath,
      query: { redirect: to.fullPath }
    })
  }
})
