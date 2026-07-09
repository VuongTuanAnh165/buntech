/**
 * Middleware: guest
 * Ngăn user đã đăng nhập truy cập trang Login/Register.
 * Sử dụng: definePageMeta({ middleware: ['guest'] })
 */
export default defineNuxtRouteMiddleware(() => {
  const token = useCookie('auth_token')

  if (token.value) {
    return navigateTo('/admin')
  }
})
