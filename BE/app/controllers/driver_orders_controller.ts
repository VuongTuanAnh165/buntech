import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import DriverOrderService from '#services/driver_order_service'
import { deliverOrderValidator } from '#validators/driver_order_validator'
import emitter from '@adonisjs/core/services/emitter'

import { paginationValidator } from '#validators/pagination'
import { Pagination } from '#enums/pagination'
import { formatPagination } from '#utils/pagination'
import AdminOrderService from '#services/admin_order_service'
import { OrderStatus } from '#enums/order_status'

@inject()
export default class DriverOrdersController {
  constructor(
    protected driverOrderService: DriverOrderService,
    protected adminOrderService: AdminOrderService
  ) {}

  /**
   * @deliver
   * @summary Chốt giao hàng thành công (Tài xế)
   * @description Cập nhật đơn hàng thành DELIVERED, ghi nhận số tiền tài xế thu hộ, và tự động cập nhật Công Nợ của Khách hàng. Yêu cầu truyền `idempotencyKey` để chống double click.
   * @paramPath id - ID đơn hàng
   * @requestBody <deliverOrderValidator>
   * @responseBody 200 - <OrderResponse>
   */
  async deliver({ auth, params, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(deliverOrderValidator)

    const order = await this.driverOrderService.deliverOrder(params.id, user.id, payload)

    emitter.emit('order:delivered', order)

    return response.ok({
      success: true,
      message: 'Chốt giao hàng thành công, công nợ đã được tự động cập nhật',
      data: order,
    })
  }

  /**
   * @history
   * @summary Lịch sử chuyến đi
   * @description Lấy danh sách các đơn hàng đã được giao thành công bởi tài xế
   * @paramQuery page - Trang hiện tại
   * @paramQuery limit - Số lượng trên mỗi trang
   * @responseBody 200 - <PaginatedOrderListResponse>
   */
  async history({ request, response, auth }: HttpContext) {
    const { page, limit } = await request.validateUsing(paginationValidator, {
      data: request.qs(),
    })
    const driverId = auth.user!.id

    const pageNum = page || Pagination.DEFAULT_PAGE
    const limitNum = limit || Pagination.DEFAULT_LIMIT

    const orders = await this.adminOrderService.getOrders(pageNum, limitNum, {
      driverId,
      status: OrderStatus.DELIVERED,
    })

    return response.ok({
      success: true,
      message: 'Lấy lịch sử giao hàng thành công',
      data: formatPagination(orders),
    })
  }
}
