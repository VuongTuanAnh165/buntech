/**
 * Middleware: auth
 * Bảo vệ các route yêu cầu đăng nhập.
 * Sử dụng: definePageMeta({ middleware: ['auth'] })
 */
export default defineNuxtRouteMiddleware(() => {
  const token = useCookie('auth_token')

  if (!token.value) {
    return navigateTo('/login')
  }
})
