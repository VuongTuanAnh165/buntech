/**
 * Responsibility: Handle all HTTP requests related to Authentication and User Profile to the backend API.
 * Dependency: ApiClient (axios/ofetch wrapper).
 * Lifecycle: Singleton instance exported for use.
 * Reason: Abstract the API layer to adhere to DDD, allowing services to call repositories without knowing HTTP details.
 */
import { ApiClient } from '~/utils/api'
import type { ApiResponse } from '~/types/api'
import type {
  LoginPayload,
  LoginResponse,
  RefreshTokenPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  ChangePasswordPayload,
  UpdateProfilePayload
} from '~/types/auth'
import type { CurrentUser } from '~/types/common'

export class AuthRepository {
  /**
   * ĐĂNG NHẬP
   */
  login(payload: LoginPayload) {
    return ApiClient.post<ApiResponse<LoginResponse>>('/auth/login', payload)
  }

  /**
   * LÀM MỚI TOKEN
   */
  refreshToken(payload: RefreshTokenPayload) {
    const config = useRuntimeConfig()
    return $fetch<ApiResponse<LoginResponse>>('/auth/refresh', {
      baseURL: config.public.apiBaseUrl as string,
      method: 'POST',
      body: payload
    })
  }

  /**
   * LẤY THÔNG TIN NGƯỜI DÙNG HIỆN TẠI
   */
  getCurrentUser() {
    return ApiClient.get<ApiResponse<CurrentUser>>('/auth/me')
  }

  /**
   * QUÊN MẬT KHẨU (YÊU CẦU OTP)
   */
  forgotPassword(payload: ForgotPasswordPayload) {
    return ApiClient.post<ApiResponse<null>>('/auth/forgot-password', payload)
  }

  /**
   * ĐẶT LẠI MẬT KHẨU
   */
  resetPassword(payload: ResetPasswordPayload) {
    return ApiClient.post<ApiResponse<null>>('/auth/reset-password', payload)
  }

  /**
   * ĐỔI MẬT KHẨU
   */
  changePassword(payload: ChangePasswordPayload) {
    return ApiClient.put<ApiResponse<null>>('/auth/change-password', payload)
  }

  /**
   * CẬP NHẬT PROFILE
   */
  updateProfile(payload: UpdateProfilePayload) {
    return ApiClient.put<ApiResponse<CurrentUser>>('/auth/me', payload)
  }
}

export const authRepository = new AuthRepository()
