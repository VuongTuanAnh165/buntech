import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import DeviceTokenService from '#services/device_token_service'
import { deviceTokenValidator } from '#validators/device_token_validator'

@inject()
export default class DeviceTokensController {
  constructor(protected deviceTokenService: DeviceTokenService) {}

  /**
   * @store
   * @summary Đăng ký Device Token
   * @description Driver (hoặc User) đăng ký FCM Token của thiết bị để nhận Push Notification.
   * @requestBody <deviceTokenValidator>
   * @responseBody 200 - <SuccessResponse>
   */
  async store({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(deviceTokenValidator)

    const deviceToken = await this.deviceTokenService.registerToken(user.id, payload)

    return response.ok({
      success: true,
      message: 'Đăng ký device token thành công',
      data: deviceToken,
    })
  }
}
