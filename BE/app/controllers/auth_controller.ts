import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import AuthService from '#services/auth_service'
import { loginValidator, refreshValidator } from '#validators/auth_validator'

@inject()
export default class AuthController {
  constructor(protected authService: AuthService) {}

  /**
   * @login
   * @summary Đăng nhập hệ thống
   * @description Đăng nhập bằng số điện thoại và mật khẩu
   * @requestBody <loginValidator>
   * @responseBody 200 - <LoginResponse>
   */
  async login({ request, response }: HttpContext) {
    const payload = await request.validateUsing(loginValidator)

    const tokens = await this.authService.login(
      payload.phoneNumber,
      payload.password,
      payload.rememberMe
    )

    const clientType = request.header('x-client-type') || 'APP'

    if (clientType.toUpperCase() === 'WEB') {
      response.cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        // maxAge in seconds (example: 7 days or tokens.expiresIn)
        maxAge: 7 * 24 * 60 * 60,
      })

      return response.json({
        success: true,
        message: 'Đăng nhập thành công',
        data: {
          user: tokens.user,
        },
      })
    }

    return response.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: tokens,
    })
  }

  /**
   * @refresh
   * @summary Làm mới Access Token
   * @description Làm mới token khi access_token hết hạn
   * @requestBody <refreshValidator>
   * @responseBody 200 - <RefreshResponse>
   */
  async refresh({ request, response }: HttpContext) {
    const payload = await request.validateUsing(refreshValidator)

    const token = await this.authService.refresh(payload.refreshToken)

    const clientType = request.header('x-client-type') || 'APP'

    if (clientType.toUpperCase() === 'WEB') {
      response.cookie('accessToken', token.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60,
      })
      return response.json({
        success: true,
        message: 'Làm mới token thành công',
        data: {},
      })
    }

    return response.json({
      success: true,
      message: 'Làm mới token thành công',
      data: token,
    })
  }

  /**
   * @me
   * @summary Lấy thông tin user hiện tại
   * @description Yêu cầu truyền Bearer Token vào Header
   * @responseBody 200 - <UserResponse>
   */
  async me({ auth, response }: HttpContext) {
    const user = auth.user!
    await user.load((preloader) => preloader.load('profile'))

    const data = {
      id: user.id,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile
        ? {
            avatarUrl: user.profile.avatarUrl,
            storeName: user.profile.storeName,
            currentDebt: user.profile.currentDebt,
            debtLimit: user.profile.debtLimit,
            zaloUserId: user.profile.zaloUserId,
          }
        : null,
    }

    return response.json({
      success: true,
      message: 'Lấy thông tin người dùng thành công',
      data,
    })
  }

  /**
   * @forgotPassword
   * @summary Quên mật khẩu (Gửi OTP)
   * @description Gửi mã OTP về số điện thoại để khôi phục mật khẩu
   * @requestBody <forgotPasswordValidator>
   * @responseBody 200 - { success: true, message: string }
   */
  async forgotPassword({ request, response }: HttpContext) {
    const { forgotPasswordValidator } = await import('#validators/auth_validator')
    const payload = await request.validateUsing(forgotPasswordValidator)

    const result = await this.authService.forgotPassword(payload.phoneNumber)

    return response.json(result)
  }

  /**
   * @resetPassword
   * @summary Khôi phục mật khẩu
   * @description Sử dụng OTP để đổi mật khẩu mới
   * @requestBody <resetPasswordValidator>
   * @responseBody 200 - { success: true, message: string }
   */
  async resetPassword({ request, response }: HttpContext) {
    const { resetPasswordValidator } = await import('#validators/auth_validator')
    const payload = await request.validateUsing(resetPasswordValidator)

    await this.authService.resetPassword(payload.phoneNumber, payload.token, payload.newPassword)

    return response.json({
      success: true,
      message: 'Khôi phục mật khẩu thành công',
    })
  }

  /**
   * @changePassword
   * @summary Đổi mật khẩu
   * @description Dành cho user đang đăng nhập
   * @requestBody <changePasswordValidator>
   * @responseBody 200 - { success: true, message: string }
   */
  async changePassword({ auth, request, response }: HttpContext) {
    const { changePasswordValidator } = await import('#validators/auth_validator')
    const payload = await request.validateUsing(changePasswordValidator)

    await this.authService.changePassword(auth.user!.id, payload.oldPassword, payload.newPassword)

    return response.json({
      success: true,
      message: 'Đổi mật khẩu thành công',
    })
  }

  /**
   * @updateProfile
   * @summary Cập nhật hồ sơ cá nhân
   * @description Dành cho user đang đăng nhập
   * @requestBody <updateProfileValidator>
   * @responseBody 200 - { success: true, message: string, data: object }
   */
  async updateProfile({ auth, request, response }: HttpContext) {
    const { updateProfileValidator } = await import('#validators/auth_validator')
    const payload = await request.validateUsing(updateProfileValidator)

    const user = await this.authService.updateProfile(
      auth.user!.id,
      payload.fullName,
      payload.avatarUrl
    )

    const data = {
      id: user.id,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile
        ? {
            avatarUrl: user.profile.avatarUrl,
            storeName: user.profile.storeName,
            currentDebt: user.profile.currentDebt,
            debtLimit: user.profile.debtLimit,
            zaloUserId: user.profile.zaloUserId,
          }
        : null,
    }

    return response.json({
      success: true,
      message: 'Cập nhật hồ sơ thành công',
      data,
    })
  }
}
