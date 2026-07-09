import { AuthService } from '~/services/authService'
import type { LoginPayload } from '~/types/auth'

/**
 * Composable quản lý trạng thái (State) và nghiệp vụ Đăng nhập.
 * Theo Rule 3 và 4: Composables là nơi chứa State và gọi các Services.
 */
export const useAuth = () => {
  const isLoading = ref(false)

  const login = async (payload: LoginPayload) => {
    isLoading.value = true
    try {
      const res = await AuthService.login(payload)
      if (res.data) {
        // Lưu trữ Tokens vào Cookie an toàn
        useCookie('auth_token').value = res.data.accessToken
        useCookie('refresh_token').value = res.data.refreshToken

        // Điều hướng vào trang chủ (Dashboard Admin)
        navigateTo('/')
      }
    } catch (error) {
      // Toast lỗi đã được ApiClient tự động hiển thị, ở đây không cần alert hay toast thủ công nữa
      console.error('Login Failed', error)
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    // Xóa Tokens
    useCookie('auth_token').value = null
    useCookie('refresh_token').value = null
    // Đá về màn hình Login
    navigateTo('/login')
  }

  return {
    isLoading,
    login,
    logout
  }
}
