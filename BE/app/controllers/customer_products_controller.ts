import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import ProductService from '#services/product_service'
import { clientProductFilterValidator } from '#validators/product'
import { Pagination } from '#enums/pagination'

@inject()
export default class CustomerProductsController {
  constructor(protected productService: ProductService) {}

  /**
   * @index
   * @summary Danh sách sản phẩm kèm giá riêng (Khách sỉ)
   * @description GET /api/v1/customer/products
   * @paramQuery page - Trang hiện tại
   * @paramQuery limit - Số lượng trên mỗi trang
   * @paramQuery categoryId - ID Danh mục
   * @paramQuery search - Từ khóa tìm kiếm
   * @responseBody 200 - <PaginatedCustomerProductResponse>
   */
  async index({ request, response, auth }: HttpContext) {
    const { page, limit, categoryId, search } = await request.validateUsing(
      clientProductFilterValidator,
      {
        data: request.qs(),
      }
    )

    const userId = auth.user!.id
    const pageNum = page || Pagination.DEFAULT_PAGE
    const limitNum = limit || Pagination.DEFAULT_LIMIT

    const result = await this.productService.getCustomerProducts(userId, pageNum, limitNum, {
      categoryId,
      search,
    })

    return response.json({
      success: true,
      message: 'Lấy danh sách sản phẩm thành công',
      data: result,
    })
  }
}
