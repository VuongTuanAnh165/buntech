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
        const isProd = process.env.NODE_ENV === 'production'
        const cookieOptions = {
          maxAge: payload.rememberMe ? 60 * 60 * 24 * 30 : undefined,
          secure: isProd,
          sameSite: 'lax' as const
        }

        // Lưu trữ Tokens vào Cookie an toàn
        useCookie('auth_token', cookieOptions).value = res.data.accessToken
        useCookie('refresh_token', cookieOptions).value = res.data.refreshToken

        // Đọc query param `redirect` để điều hướng về trang trước đó
        const route = useRoute()
        const redirectPath = route.query.redirect as string | undefined

        // Điều hướng thẳng vào /admin để tránh Double Redirect qua / (index.vue)
        navigateTo(redirectPath || '/admin')
      }
    } catch (error) {
      // Toast lỗi đã được ApiClient tự động hiển thị, ở đây không cần alert hay toast thủ công nữa
      console.error('Login Failed', error)
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    const isProd = process.env.NODE_ENV === 'production'
    const cookieOptions = { secure: isProd, sameSite: 'lax' as const }

    // Xóa Tokens
    useCookie('auth_token', cookieOptions).value = null
    useCookie('refresh_token', cookieOptions).value = null
    // Đá về màn hình Login
    navigateTo('/login')
  }

  return {
    isLoading,
    login,
    logout
  }
}
