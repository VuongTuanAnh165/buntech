import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import CustomerPriceService from '#services/customer_price_service'
import { upsertCustomerPriceValidator } from '#validators/customer_price_validator'
import { paginationValidator } from '#validators/pagination'
import { Pagination } from '#enums/pagination'
import { formatPagination } from '#utils/pagination'

@inject()
export default class CustomerPricesController {
  constructor(protected customerPriceService: CustomerPriceService) {}

  /**
   * @index
   * @summary Danh sách Bảng giá riêng
   * @description Lấy danh sách các sản phẩm đã được cài đặt giá bán riêng cho một khách hàng sỉ.
   * @paramPath userId - ID người dùng
   * @paramQuery page - Trang hiện tại
   * @paramQuery limit - Số lượng trên mỗi trang
   * @responseBody 200 - <PaginatedCustomerPriceResponse>
   */
  async index({ params, request, response }: HttpContext) {
    const { page, limit } = await request.validateUsing(paginationValidator, {
      data: request.qs(),
    })

    const pageNum = page || Pagination.DEFAULT_PAGE
    const limitNum = limit || Pagination.DEFAULT_LIMIT

    const prices = await this.customerPriceService.getUserPrices(params.userId, pageNum, limitNum)

    return response.ok({
      success: true,
      message: 'Lấy bảng giá riêng thành công',
      data: formatPagination(prices),
    })
  }

  /**
   * @upsert
   * @summary Cài đặt giá bán riêng
   * @description Thêm mới hoặc cập nhật giá bán riêng của một sản phẩm cho khách hàng.
   * @paramPath userId - ID người dùng
   * @requestBody <upsertCustomerPriceValidator>
   * @responseBody 200 - <CustomerPriceResponse>
   */
  async upsert({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(upsertCustomerPriceValidator)
    const customerPrice = await this.customerPriceService.upsertPrice(params.userId, payload)

    return response.ok({
      success: true,
      message: 'Cập nhật giá bán riêng thành công',
      data: customerPrice,
    })
  }

  /**
   * @destroy
   * @summary Xóa giá bán riêng
   * @description Xóa cài đặt giá riêng của một sản phẩm, khôi phục về giá gốc.
   * @paramPath userId - ID người dùng
   * @paramPath productId - ID sản phẩm
   * @responseBody 200 - <SuccessResponse>
   */
  async destroy({ params, response }: HttpContext) {
    await this.customerPriceService.deletePrice(params.userId, params.productId)

    return response.ok({
      success: true,
      message: 'Xóa giá bán riêng thành công, hệ thống sẽ sử dụng giá gốc',
    })
  }
}
