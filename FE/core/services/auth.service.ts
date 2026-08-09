/**
 * Responsibility: Handle business logic for Authentication and Profile management (orchestrating API calls via repository).
 * Dependency: authRepository.
 * Lifecycle: Singleton instance exported for use across stores/components.
 * Reason: Separate business logic from UI/Stores, adhering to DDD architecture and making it testable.
 */
import { authRepository } from '../repositories/auth.repository'
import type {
  LoginPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  ChangePasswordPayload,
  UpdateProfilePayload
} from '~/types/auth'

export class AuthService {
  /**
   * ĐĂNG NHẬP
   */
  async login(payload: LoginPayload) {
    return authRepository.login(payload)
  }

  /**
   * LÀM MỚI TOKEN
   */
  async refreshToken(refreshToken: string) {
    return authRepository.refreshToken({ refreshToken })
  }

  /**
   * LẤY THÔNG TIN NGƯỜI DÙNG HIỆN TẠI
   */
  async getCurrentUser() {
    return authRepository.getCurrentUser()
  }

  /**
   * QUÊN MẬT KHẨU
   */
  async forgotPassword(payload: ForgotPasswordPayload) {
    return authRepository.forgotPassword(payload)
  }

  /**
   * ĐẶT LẠI MẬT KHẨU
   */
  async resetPassword(payload: ResetPasswordPayload) {
    return authRepository.resetPassword(payload)
  }

  /**
   * ĐỔI MẬT KHẨU
   */
  async changePassword(payload: ChangePasswordPayload) {
    return authRepository.changePassword(payload)
  }

  /**
   * CẬP NHẬT PROFILE
   */
  async updateProfile(payload: UpdateProfilePayload) {
    return authRepository.updateProfile(payload)
  }
}

export const authService = new AuthService()
