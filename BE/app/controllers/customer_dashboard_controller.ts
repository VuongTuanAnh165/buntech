import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import CustomerDashboardService from '#services/customer_dashboard_service'

@inject()
export default class CustomerDashboardController {
  constructor(protected customerDashboardService: CustomerDashboardService) {}

  /**
   * @overview
   * @summary Tổng quan Dashboard Khách sỉ
   * @description Trả về các chỉ số tổng quan cho Dashboard của Khách sỉ bao gồm Công nợ, Tổng chi tiêu, Đơn hàng 30 ngày
   * @responseBody 200 - <CustomerDashboardOverviewResponse>
   */
  async overview({ response, auth }: HttpContext) {
    const userId = auth.user!.id
    const data = await this.customerDashboardService.getOverview(userId)

    return response.ok({
      success: true,
      message: 'Lấy thông quan tổng quan thành công',
      data,
    })
  }
}
