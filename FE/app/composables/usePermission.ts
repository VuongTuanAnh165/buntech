import { useAuthStore } from '~/stores/auth'
import type { Role } from '~/enums/role'

/**
 * Composable xử lý kiểm tra quyền (Authorization) phía Client.
 * Sử dụng để ẩn/hiện Component hoặc chặn logic dựa trên Role của User.
 */
export const usePermission = () => {
  const authStore = useAuthStore()

  /**
   * Kiểm tra xem User có ít nhất 1 role trong danh sách yêu cầu không.
   * @param roles Một Role hoặc mảng các Role
   */
  const hasRole = (roles: Role | Role[]) => {
    if (!authStore.user) return false

    const roleList = Array.isArray(roles) ? roles : [roles]
    return roleList.includes(authStore.user.role as Role)
  }

  /**
   * Throw lỗi 403 nếu User không có quyền. Dùng trong Middleware hoặc Logic.
   */
  const requireRole = (roles: Role | Role[]) => {
    if (!hasRole(roles)) {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }
  }

  return {
    hasRole,
    requireRole
  }
}
