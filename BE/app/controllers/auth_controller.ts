import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import BaseController from '#controllers/base_controller'
import AuthService from '#services/auth_service'
import { loginValidator, refreshValidator } from '#validators/auth_validator'

@inject()
export default class AuthController extends BaseController {
  constructor(protected authService: AuthService) {
    super()
  }

  /**
   * POST /api/v1/auth/login
   */
  async login(ctx: HttpContext) {
    const payload = await ctx.request.validateUsing(loginValidator)

    const tokens = await this.authService.login(payload.phoneNumber, payload.password)

    // Trả về theo format `data: { accessToken, refreshToken }` (Không message)
    return this.sendSuccess(ctx.response, tokens)
  }

  /**
   * POST /api/v1/auth/refresh
   */
  async refresh(ctx: HttpContext) {
    const payload = await ctx.request.validateUsing(refreshValidator)

    const token = await this.authService.refresh(payload.refreshToken)

    // Trả về theo format `data: { accessToken }` (Không message)
    return this.sendSuccess(ctx.response, token)
  }

  /**
   * GET /api/v1/auth/me
   */
  async me(ctx: HttpContext) {
    const user = ctx.auth.user!
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

    return this.sendSuccess(ctx.response, data)
  }
}
