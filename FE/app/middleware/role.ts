/**
 * Middleware: role
 * Kiểm tra role user để chặn truy cập sai phân quyền.
 *
 * Sử dụng:
 * definePageMeta({
 *   middleware: ['auth', 'role'],
 *   requiredRole: 'admin'   // hoặc 'driver', 'wholesale_customer'
 * })
 */
export default defineNuxtRouteMiddleware((to) => {
  const userStore = useCurrentUserStore()
  const requiredRole = to.meta.requiredRole as string | undefined

  // Nếu page không khai báo requiredRole → bỏ qua
  if (!requiredRole) return

  // Nếu chưa có thông tin user → redirect login
  if (!userStore.currentUser) {
    return navigateTo('/login')
  }

  // Nếu role không khớp → ném lỗi 403
  if (userStore.currentUser.role !== requiredRole) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Bạn không có quyền truy cập trang này.'
    })
  }
})
