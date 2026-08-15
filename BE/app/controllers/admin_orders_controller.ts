import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import AdminOrderService from '#services/admin_order_service'
import {
  createAdminOrderValidator,
  updateOrderStatusValidator,
  batchAssignDriverValidator,
} from '#validators/admin_order_validator'
import emitter from '@adonisjs/core/services/emitter'
import { formatPagination } from '#utils/pagination'
import ExcelJS from 'exceljs'
import { PassThrough } from 'node:stream'

@inject()
export default class AdminOrdersController {
  constructor(protected adminOrderService: AdminOrderService) {}

  /**
   * @index
   * @summary Danh sách đơn hàng (Admin)
   * @description Lấy danh sách toàn bộ đơn hàng trong hệ thống
   * @paramQuery page - Trang hiện tại
   * @paramQuery limit - Số lượng trên mỗi trang
   * @paramQuery status - Trạng thái đơn hàng
   * @paramQuery userId - ID khách hàng
   * @paramQuery driverId - ID tài xế
   * @paramQuery search - Từ khóa tìm kiếm (mã đơn, tên khách, số điện thoại, địa chỉ)
   * @paramQuery startDate - Lọc từ ngày
   * @paramQuery endDate - Lọc đến ngày
   * @responseBody 200 - <PaginatedOrderAdminListResponse>
   */
  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const status = request.input('status')
    const userId = request.input('userId')
    const driverId = request.input('driverId')
    const search = request.input('search')
    const startDate = request.input('startDate')
    const endDate = request.input('endDate')

    const orders = await this.adminOrderService.getOrders(page, limit, {
      status,
      userId,
      driverId,
      search,
      startDate,
      endDate,
    })

    return response.ok({
      success: true,
      message: 'Lấy danh sách đơn hàng thành công',
      data: formatPagination(orders),
    })
  }

  /**
   * @export
   * @summary Xuất danh sách đơn hàng ra Excel
   * @description Lấy danh sách toàn bộ đơn hàng khớp với bộ lọc và xuất ra file Excel (.xlsx) thông qua Stream
   * @paramQuery status - Trạng thái đơn hàng
   * @paramQuery userId - ID khách hàng
   * @paramQuery driverId - ID tài xế
   * @paramQuery search - Từ khóa tìm kiếm (mã đơn, tên khách, số điện thoại, địa chỉ)
   * @paramQuery startDate - Lọc từ ngày
   * @paramQuery endDate - Lọc đến ngày
   * @responseBody 200 - application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
   */
  async export({ request, response }: HttpContext) {
    const status = request.input('status')
    const userId = request.input('userId')
    const driverId = request.input('driverId')
    const search = request.input('search')
    const startDate = request.input('startDate')
    const endDate = request.input('endDate')

    const filters = {
      status,
      userId,
      driverId,
      search,
      startDate,
      endDate,
    }

    // Set headers for file download
    response.header(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response.header(
      'Content-Disposition',
      `attachment; filename="DanhSachDonHang_${Date.now()}.xlsx"`
    )

    // Use PassThrough stream to let Adonis properly apply headers (like CORS)
    const passThrough = new PassThrough()
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ stream: passThrough })

    // Process in background and pipe to passThrough
    ;(async () => {
      try {
        const worksheet = workbook.addWorksheet('DanhSachDonHang', {
          views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
        })

        worksheet.columns = [
          { key: 'id', width: 10 },
          { key: 'customerName', width: 25 },
          { key: 'customerPhone', width: 15 },
          { key: 'driverName', width: 25 },
          { key: 'driverPhone', width: 15 },
          { key: 'status', width: 15 },
          { key: 'totalAmount', width: 15 },
          { key: 'amountCollected', width: 15 },
          { key: 'createdAt', width: 20 },
        ]

        // Manual header row
        const headerRow = worksheet.addRow({
          id: 'Mã đơn',
          customerName: 'Tên khách hàng',
          customerPhone: 'SĐT khách hàng',
          driverName: 'Tên tài xế',
          driverPhone: 'SĐT tài xế',
          status: 'Trạng thái',
          totalAmount: 'Tổng tiền',
          amountCollected: 'Đã thu',
          createdAt: 'Ngày tạo',
        })

        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
        headerRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0F172A' }, // Slate 900
        }
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
        headerRow.height = 25

        const thinBorder: Partial<ExcelJS.Borders> = {
          top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        }

        headerRow.eachCell((cell) => {
          cell.border = thinBorder
        })

        headerRow.commit()

        const generator = this.adminOrderService.getOrdersExportGenerator(filters, 500)
        for await (const chunk of generator) {
          for (const order of chunk) {
            const row = worksheet.addRow({
              id: order.id,
              customerName: order.user?.fullName || '',
              customerPhone: order.user?.phoneNumber || '',
              driverName: order.driver?.fullName || '',
              driverPhone: order.driver?.phoneNumber || '',
              status: order.status,
              totalAmount: Number(order.totalAmount || 0),
              amountCollected: Number(order.amountCollected || 0),
              createdAt: order.createdAt ? order.createdAt.toFormat('dd/MM/yyyy HH:mm:ss') : '',
            })

            row.eachCell((cell, colNumber) => {
              cell.border = thinBorder
              cell.alignment = { vertical: 'middle' }

              // Format số tiền (cột 7 và 8)
              if (colNumber === 7 || colNumber === 8) {
                cell.numFmt = '#,##0'
                cell.alignment = { vertical: 'middle', horizontal: 'right' }
              }
            })

            row.commit()
          }
          // Commit chunk to clear memory
          worksheet.commit()
        }

        await workbook.commit()
      } catch (error) {
        console.error('EXCEL_EXPORT_ERROR:', error)
        passThrough.destroy(error as Error)
      }
    })()

    return response.stream(passThrough)
  }

  /**
   * @show
   * @summary Chi tiết đơn hàng
   * @description Lấy chi tiết đơn hàng cho Admin
   * @paramPath id - ID đơn hàng
   * @responseBody 200 - <OrderAdminDetailResponse>
   */
  async show({ params, response }: HttpContext) {
    const order = await this.adminOrderService.getOrder(params.id)
    return response.ok({
      success: true,
      message: 'Lấy chi tiết đơn hàng thành công',
      data: order,
    })
  }

  /**
   * @store
   * @summary Tạo đơn hàng (Admin)
   * @description Tạo đơn hàng cho khách sỉ, hệ thống tự động quét và áp dụng bảng giá riêng (CustomerPrice) nếu có.
   * @requestBody <createAdminOrderValidator>
   * @responseBody 201 - <OrderResponse>
   */
  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createAdminOrderValidator)

    const order = await this.adminOrderService.createOrder({
      ...payload,
      deliveryDate: payload.deliveryDate as Date | undefined,
    })

    // Kích hoạt sự kiện để gửi thông báo Zalo ZNS ngầm
    emitter.emit('order:created', order)

    return response.created({
      success: true,
      message: 'Tạo đơn hàng thành công',
      data: order,
    })
  }

  /**
   * @updateStatus
   * @summary Cập nhật trạng thái
   * @description Đổi status đơn hàng
   * @paramPath id - ID đơn hàng
   * @requestBody <updateOrderStatusValidator>
   * @responseBody 200 - <OrderAdminDetailResponse>
   */
  async updateStatus({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateOrderStatusValidator)
    const order = await this.adminOrderService.updateStatus(params.id, payload)

    return response.ok({
      success: true,
      message: 'Cập nhật trạng thái thành công',
      data: order,
    })
  }

  /**
   * @batchAssign
   * @summary Gán tài xế hàng loạt
   * @description Phân công lộ trình giao hàng (Routing) cho một tài xế cụ thể.
   * @requestBody <batchAssignDriverValidator>
   * @responseBody 200 - <SuccessResponse>
   */
  async batchAssign({ request, response }: HttpContext) {
    const payload = await request.validateUsing(batchAssignDriverValidator)
    await this.adminOrderService.batchAssignDriver(payload.driverId, payload.orders)

    return response.ok({
      success: true,
      message: 'Gán tài xế hàng loạt thành công',
    })
  }
}
