import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import AuthService from '#services/auth_service'
import { loginValidator, refreshValidator } from '#validators/auth_validator'

@inject()
export default class AuthController {
  constructor(protected authService: AuthService) {}

  /**
   * POST /api/v1/auth/login
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
      data: tokens,
    })
  }

  /**
   * POST /api/v1/auth/refresh
   */
  async refresh({ request, response }: HttpContext) {
    const payload = await request.validateUsing(refreshValidator)

    const token = await this.authService.refresh(payload.refreshToken)

    return response.json({
      success: true,
      data: token,
    })
  }

  /**
   * GET /api/v1/auth/me
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
      data,
    })
  }
}
