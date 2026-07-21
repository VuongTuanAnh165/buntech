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
}
