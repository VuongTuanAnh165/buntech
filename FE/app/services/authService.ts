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

export const authService = {
  login(payload: LoginPayload) {
    return ApiClient.post<ApiResponse<LoginResponse>>('/auth/login', payload)
  },
  refreshToken(payload: RefreshTokenPayload) {
    const config = useRuntimeConfig()
    return $fetch<ApiResponse<LoginResponse>>('/auth/refresh', {
      baseURL: config.public.apiBaseUrl as string,
      method: 'POST',
      body: payload
    })
  },
  getCurrentUser() {
    return ApiClient.get<ApiResponse<CurrentUser>>('/auth/me')
  },
  forgotPassword(payload: ForgotPasswordPayload) {
    return ApiClient.post<ApiResponse<null>>('/auth/forgot-password', payload)
  },
  resetPassword(payload: ResetPasswordPayload) {
    return ApiClient.post<ApiResponse<null>>('/auth/reset-password', payload)
  },
  changePassword(payload: ChangePasswordPayload) {
    return ApiClient.put<ApiResponse<null>>('/auth/change-password', payload)
  },
  updateProfile(payload: UpdateProfilePayload) {
    return ApiClient.put<ApiResponse<CurrentUser>>('/auth/me', payload)
  }
}
