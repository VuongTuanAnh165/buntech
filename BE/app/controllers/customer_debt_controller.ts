import type { HttpContext } from '@adonisjs/core/http'
import UserProfile from '#models/user_profile'
import { DateTime } from 'luxon'

export default class CustomerDebtController {
  /**
   * @index
   * @summary Xem công nợ
   * @description Trả về tổng công nợ hiện tại của khách sỉ đang đăng nhập
   * @responseBody 200 - <CustomerDebtResponse>
   */
  async index({ response, auth }: HttpContext) {
    const userId = auth.user!.id
    const profile = await UserProfile.query().where('user_id', userId).first()

    const currentDebt = profile?.currentDebt ? Number(profile.currentDebt) : 0
    const debtLimit = profile?.debtLimit ? Number(profile.debtLimit) : 0

    return response.ok({
      success: true,
      message: 'Lấy thông tin công nợ thành công',
      data: {
        currentDebt,
        debtLimit,
        currency: 'VND',
        updatedAt: profile?.updatedAt?.toISO() || DateTime.now().toISO(),
      },
    })
  }
}
