import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import DashboardService from '#services/dashboard_service'
import { dashboardOverviewValidator } from '#validators/dashboard_validator'

@inject()
export default class DashboardController {
  constructor(protected dashboardService: DashboardService) {}

  /**
   * @summary Tổng quan Dashboard
   * @description Lấy số liệu thống kê tổng quan: Doanh thu, số lượng đơn hàng, công nợ và tỷ lệ trạng thái đơn hàng.
   * @requestQuery {"startDate": "2026-07-01", "endDate": "2026-07-31"}
   * @responseBody 200 - {"success": true, "message": "Thành công", "data": {}}
   */
  async overview({ request, response }: HttpContext) {
    const payload = await request.validateUsing(dashboardOverviewValidator)

    const data = await this.dashboardService.getOverview(payload)

    return response.ok({
      success: true,
      message: 'Lấy dữ liệu Dashboard thành công',
      data,
    })
  }
}
