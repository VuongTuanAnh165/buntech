import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import AdminOrderService from '#services/admin_order_service'
import { createCustomerOrderValidator } from '#validators/customer_order_validator'
import emitter from '@adonisjs/core/services/emitter'
import { formatPagination } from '#utils/pagination'
import CustomerPolicy from '#policies/customer_policy'

@inject()
export default class CustomerOrdersController {
  constructor(protected adminOrderService: AdminOrderService) {}

  /**
   * @index
   * @summary Danh sách đơn hàng cá nhân
   * @description Lấy danh sách lịch sử đơn hàng của chính khách sỉ đang đăng nhập
   * @paramQuery page - Trang hiện tại
   * @paramQuery limit - Số lượng trên mỗi trang
   * @paramQuery status - Lọc theo trạng thái đơn hàng
   * @responseBody 200 - <PaginatedOrderListResponse>
   */
  async index({ request, response, auth }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const status = request.input('status')
    const userId = auth.user!.id

    const orders = await this.adminOrderService.getOrders(page, limit, {
      status,
      userId,
    })

    return response.ok({
      success: true,
      message: 'Lấy lịch sử đơn hàng thành công',
      data: formatPagination(orders),
    })
  }

  /**
   * @show
   * @summary Chi tiết đơn hàng cá nhân
   * @description Lấy chi tiết đơn hàng của chính khách sỉ đang đăng nhập
   * @paramPath id - ID đơn hàng
   * @responseBody 200 - <OrderDetailResponse>
   */
  async show({ params, response, bouncer }: HttpContext) {
    const order = await this.adminOrderService.getOrder(params.id)

    // Check quyền sở hữu đơn hàng (Bouncer)
    if (await bouncer.with(CustomerPolicy).denies('viewOrder', order)) {
      return response.forbidden({
        success: false,
        message: 'Bạn không có quyền xem đơn hàng này',
      })
    }

    return response.ok({
      success: true,
      message: 'Lấy chi tiết đơn hàng thành công',
      data: order,
    })
  }

  /**
   * @store
   * @summary Khách sỉ tự đặt hàng
   * @description Tạo đơn hàng từ phía khách sỉ. Hệ thống tự map giá riêng của khách.
   * @requestBody <createCustomerOrderValidator>
   * @responseBody 201 - <OrderResponse>
   */
  async store({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(createCustomerOrderValidator)
    const userId = auth.user!.id

    const order = await this.adminOrderService.createOrder({
      userId,
      shippingAddressId: payload.shippingAddressId,
      note: payload.note,
      deliveryDate: payload.deliveryDate as Date | undefined,
      items: payload.items,
    })

    // Kích hoạt sự kiện (vd: Gửi Noti về Admin, hoặc ZNS)
    emitter.emit('order:created', order)

    return response.created({
      success: true,
      message: 'Tạo đơn hàng thành công',
      data: order,
    })
  }
}
