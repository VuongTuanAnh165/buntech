import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import CustomerDebtService from '#services/customer_debt_service'

@inject()
export default class CustomerDebtController {
  constructor(protected customerDebtService: CustomerDebtService) {}

  /**
   * @index
   * @summary Xem công nợ
   * @description Trả về tổng công nợ hiện tại của khách sỉ đang đăng nhập
   * @responseBody 200 - <CustomerDebtResponse>
   */
  async index({ response, auth }: HttpContext) {
    const userId = auth.user!.id
    const data = await this.customerDebtService.getDebtInfo(userId)

    return response.ok({
      success: true,
      message: 'Lấy thông tin công nợ thành công',
      data,
    })
  }
}
