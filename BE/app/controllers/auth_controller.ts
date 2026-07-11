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
}
