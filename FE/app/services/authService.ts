import { ApiClient } from '~/utils/api'
import type { ApiResponse } from '~/types/api'
import type { LoginPayload, LoginResponse, RefreshTokenPayload } from '~/types/auth'

export const AuthService = {
  /**
   * ĐĂNG NHẬP
   * Gọi API bằng ApiClient để tận dụng tự động hiện Toast khi thành công hoặc thất bại.
   */
  login(payload: LoginPayload) {
    return ApiClient.post<ApiResponse<LoginResponse>>('/auth/login', payload)
  },

  /**
   * LÀM MỚI TOKEN (REFRESH TOKEN)
   * Lưu ý: Hàm này dùng $fetch thuần (không dùng ApiClient) để tránh vòng lặp vô tận (Infinite Loop)
   * của cơ chế bắt lỗi 401. Nó sẽ được gọi ngầm trong cấu hình api.ts.
   */
  refreshToken(payload: RefreshTokenPayload) {
    const config = useRuntimeConfig()
    return $fetch<ApiResponse<LoginResponse>>('/auth/refresh', {
      baseURL: config.public.apiBaseUrl as string,
      method: 'POST',
      body: payload
    })
  }
}
