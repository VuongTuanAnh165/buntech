import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import AuthService from '#services/auth_service'
import { loginValidator, refreshValidator } from '#validators/auth_validator'
import { ApiOperation, ApiBody, ApiResponse } from '@foadonis/openapi/decorators'

@inject()
export default class AuthController {
  constructor(protected authService: AuthService) {}

  /**
   * POST /api/v1/auth/login
   */
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: () => loginValidator })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
      },
    },
  })
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
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ type: () => refreshValidator })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
          },
        },
      },
    },
  })
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
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Current user profile details',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            fullName: { type: 'string' },
            phoneNumber: { type: 'string' },
            role: { type: 'string' },
            profile: {
              type: 'object',
              nullable: true,
              properties: {
                avatarUrl: { type: 'string', nullable: true },
                storeName: { type: 'string', nullable: true },
                currentDebt: { type: 'string', nullable: true },
                debtLimit: { type: 'string', nullable: true },
                zaloUserId: { type: 'string', nullable: true },
              },
            },
          },
        },
      },
    },
  })
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
