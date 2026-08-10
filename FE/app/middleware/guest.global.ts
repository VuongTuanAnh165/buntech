/**
 * Middleware: guest.global
 * Tự động chặn user đã đăng nhập vào lại các trang Login/Register.
 */
export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie('auth_token')

  if (to.path.startsWith('/auth') && token.value) {
    // Lý tưởng nhất là redirect dựa trên role, tạm thời để /admin
    // (hoặc nếu là auth/driver thì redirect về /driver)
    if (to.path.startsWith('/auth/driver')) {
      return navigateTo('/driver')
    }
    return navigateTo('/admin')
  }
})
