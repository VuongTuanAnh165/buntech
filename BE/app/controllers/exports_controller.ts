import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import ExportService from '#services/export_service'
import { dashboardOverviewValidator } from '#validators/dashboard_validator'
import { DateTime } from 'luxon'

@inject()
export default class ExportsController {
  constructor(protected exportService: ExportService) {}

  /**
   * @summary Xuất báo cáo đơn hàng (CSV)
   * @description Tải xuống danh sách đơn hàng dưới định dạng CSV (tương thích Excel). Hỗ trợ lọc theo khoảng thời gian.
   * @requestQuery {"startDate": "2026-07-01", "endDate": "2026-07-31"}
   * @responseBody 200 - File CSV attachment
   */
  async exportOrders({ request, response }: HttpContext) {
    const payload = await request.validateUsing(dashboardOverviewValidator)
    const csvContent = await this.exportService.exportOrdersToCsv(payload)

    const fileName = `Export_Orders_${DateTime.now().toFormat('yyyy_MM_dd')}.csv`

    response.header('Content-Type', 'text/csv; charset=utf-8')
    response.header('Content-Disposition', `attachment; filename="${fileName}"`)

    // Thêm BOM (Byte Order Mark) để Excel mở tiếng Việt UTF-8 không bị lỗi font
    const BOM = '\uFEFF'
    return response.send(BOM + csvContent)
  }
}
