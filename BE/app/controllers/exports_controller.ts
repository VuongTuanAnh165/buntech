import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import ExportService from '#services/export_service'
import { dashboardOverviewValidator } from '#validators/dashboard_validator'
import { DateTime } from 'luxon'

@inject()
export default class ExportsController {
  constructor(protected exportService: ExportService) {}

  /**
   * @exportOrders
   * @summary Xuất báo cáo đơn hàng (CSV)
   * @description Tải xuống danh sách đơn hàng dưới định dạng CSV (tương thích Excel). Hỗ trợ lọc theo khoảng thời gian.
   * @paramQuery startDate - Ngày bắt đầu (VD: 2026-07-01)
   * @paramQuery endDate - Ngày kết thúc (VD: 2026-07-31)
   * @responseBody 200 - {"type": "string"}
   */
  async exportOrders({ request, response }: HttpContext) {
    const payload = await request.validateUsing(dashboardOverviewValidator)
    const stream = this.exportService.exportOrdersToCsvStream(payload)

    const fileName = `Export_Orders_${DateTime.now().toFormat('yyyy_MM_dd')}.csv`

    response.header('Content-Type', 'text/csv; charset=utf-8')
    response.header('Content-Disposition', `attachment; filename="${fileName}"`)

    return response.stream(stream)
  }

  /**
   * @exportOrdersToday
   * @summary Xuất báo cáo đơn hàng hôm nay (CSV)
   * @description Tải xuống danh sách đơn hàng của ngày hôm nay dưới định dạng CSV (tương thích Excel).
   * @responseBody 200 - {"type": "string"}
   */
  async exportOrdersToday({ response }: HttpContext) {
    const today = DateTime.now().startOf('day')
    const stream = this.exportService.exportOrdersToCsvStream({
      startDate: today,
      endDate: today.endOf('day'),
    })

    const fileName = `Export_Orders_Today_${DateTime.now().toFormat('yyyy_MM_dd')}.csv`

    response.header('Content-Type', 'text/csv; charset=utf-8')
    response.header('Content-Disposition', `attachment; filename="${fileName}"`)

    return response.stream(stream)
  }
}
