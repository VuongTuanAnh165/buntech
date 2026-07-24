import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import AdminOrderService from '#services/admin_order_service'
import {
  createAdminOrderValidator,
  updateOrderStatusValidator,
  batchAssignDriverValidator,
} from '#validators/admin_order_validator'

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
   * @responseBody 200 - <PaginatedOrderAdminListResponse>
   */
  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const status = request.input('status')
    const userId = request.input('userId')
    const driverId = request.input('driverId')

    const orders = await this.adminOrderService.getOrders(page, limit, {
      status,
      userId,
      driverId,
    })

    return response.ok({
      success: true,
      message: 'Lấy danh sách đơn hàng thành công',
      data: orders,
    })
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
