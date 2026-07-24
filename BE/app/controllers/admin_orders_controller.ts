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
   * @summary Danh sách đơn hàng (Admin)
   * @description Lấy danh sách toàn bộ đơn hàng trong hệ thống
   * @responseBody 200 - {"success": true, "message": "Thành công", "data": {"meta": {}, "data": [{"id": 1, "userId": 1, "driverId": 2, "totalAmount": "string", "status": "string", "createdAt": "string", "user": {"id": 1, "fullName": "string", "phoneNumber": "string"}, "driver": {"id": 2, "fullName": "string", "phoneNumber": "string"}}]}}
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
   * @summary Chi tiết đơn hàng
   * @paramPath id - ID đơn hàng
   * @responseBody 200 - {"success": true, "message": "Thành công", "data": {"id": 1, "user": {"id": 1, "fullName": "string", "phoneNumber": "string"}, "driver": {"id": 2, "fullName": "string", "phoneNumber": "string"}, "items": [{"id": 1, "orderId": 1, "productId": 1, "quantity": 10, "unitPrice": "string", "product": {"id": 1, "name": "string", "unit": "string", "basePrice": "string"}}]}}
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
   * @summary Tạo đơn hàng (Admin)
   * @description Tạo đơn hàng cho khách sỉ, hệ thống tự động quét và áp dụng bảng giá riêng (CustomerPrice) nếu có.
   * @requestBody {"userId": 1, "shippingAddressId": 1, "note": "Giao gấp", "items": [{"productId": 1, "quantity": 10}]}
   * @responseBody 201 - {"success": true, "message": "Thành công", "data": {"id": 1, "userId": 1, "shippingAddressId": 1, "source": "string", "status": "string", "totalAmount": "string"}}
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
   * @summary Cập nhật trạng thái
   * @description Đổi status đơn hàng
   * @paramPath id - ID đơn hàng
   * @requestBody {"status": "DELIVERED"}
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
   * @summary Gán tài xế hàng loạt
   * @description Phân công lộ trình giao hàng (Routing) cho một tài xế cụ thể.
   * @requestBody {"driverId": 2, "orders": [{"orderId": 1, "routeOrder": 1}, {"orderId": 2, "routeOrder": 2}]}
   * @responseBody 200 - {"success": true, "message": "Thành công"}
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
