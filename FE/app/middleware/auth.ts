/**
 * Middleware: auth
 * Bảo vệ các route yêu cầu đăng nhập.
 * Sử dụng: definePageMeta({ middleware: ['auth'] })
 */
export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie('auth_token')

  if (!token.value) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }
})
