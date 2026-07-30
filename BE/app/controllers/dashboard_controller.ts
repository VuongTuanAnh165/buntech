import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import DashboardService from '#services/dashboard_service'
import { dashboardOverviewValidator, topBuyersValidator } from '#validators/dashboard_validator'

@inject()
export default class DashboardController {
  constructor(protected dashboardService: DashboardService) {}

  /**
   * @overview
   * @summary Tổng quan Dashboard
   * @description Lấy số liệu thống kê tổng quan: Doanh thu, số lượng đơn hàng, công nợ và tỷ lệ trạng thái đơn hàng.
   * @paramQuery startDate - Ngày bắt đầu (VD: 2026-07-01)
   * @paramQuery endDate - Ngày kết thúc (VD: 2026-07-31)
   * @responseBody 200 - <DashboardOverviewResponse>
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

  /**
   * @topBuyers
   * @summary Top Khách Hàng (Top Buyers)
   * @description Lấy danh sách khách hàng mua nhiều nhất theo doanh thu hoặc sản lượng
   * @paramQuery startDate - Ngày bắt đầu
   * @paramQuery endDate - Ngày kết thúc
   * @paramQuery limit - Số lượng trả về (mặc định 10)
   * @paramQuery sortBy - Tiêu chí sắp xếp: `revenue` hoặc `quantity`
   * @responseBody 200 - <TopBuyersResponse>
   */
  async topBuyers({ request, response }: HttpContext) {
    const payload = await request.validateUsing(topBuyersValidator)

    const limit = payload.limit || 10
    const sortBy = payload.sortBy === 'quantity' ? 'quantity' : 'revenue'

    const data = await this.dashboardService.getTopBuyers({
      startDate: payload.startDate,
      endDate: payload.endDate,
      limit,
      sortBy,
    })

    return response.ok({
      success: true,
      message: 'Lấy danh sách Top Buyers thành công',
      data,
    })
  }
}
