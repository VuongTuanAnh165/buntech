import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import ProductService from '#services/product_service'
import { createProductValidator, updateProductValidator } from '#validators/product'
import { paginationValidator } from '#validators/pagination'
import { Pagination } from '#enums/pagination'

@inject()
export default class ProductsController {
  constructor(protected productService: ProductService) {}

  /**
   * @index
   * @summary Danh sách sản phẩm (Admin)
   * @description GET /api/v1/admin/products
   * @paramQuery page - Trang hiện tại
   * @paramQuery limit - Số lượng trên mỗi trang
   * @responseBody 200 - {"success": true, "message": "string", "data": [{"$ref": "#/components/schemas/Product"}], "meta": {"$ref": "#/components/schemas/PaginationMeta"}}
   */
  async index({ request, response }: HttpContext) {
    const { page, limit } = await request.validateUsing(paginationValidator, {
      data: request.qs(),
    })

    const pageNum = page || Pagination.DEFAULT_PAGE
    const limitNum = limit || Pagination.DEFAULT_LIMIT

    const products = await this.productService.paginate(pageNum, limitNum)
    const meta = products.getMeta()

    return response.json({
      success: true,
      message: 'Lấy danh sách thành công',
      data: products.all(),
      meta: {
        page: meta.currentPage,
        pageSize: meta.perPage,
        total: meta.total,
        totalPages: meta.lastPage,
      },
    })
  }

  /**
   * @clientIndex
   * @summary Danh sách sản phẩm (Client)
   * @description GET /api/v1/products
   * @paramQuery page - Trang hiện tại
   * @paramQuery limit - Số lượng trên mỗi trang
   * @paramQuery categoryId - ID Danh mục
   * @responseBody 200 - {"success": true, "message": "string", "data": [{"$ref": "#/components/schemas/Product"}], "meta": {"$ref": "#/components/schemas/PaginationMeta"}}
   */
  async clientIndex({ request, response }: HttpContext) {
    const { page, limit } = await request.validateUsing(paginationValidator, {
      data: request.qs(),
    })

    const pageNum = page || Pagination.DEFAULT_PAGE
    const limitNum = limit || Pagination.DEFAULT_LIMIT
    const categoryId = request.input('categoryId')

    const products = await this.productService.clientList(
      pageNum,
      limitNum,
      categoryId ? Number(categoryId) : undefined
    )
    const meta = products.getMeta()

    return response.json({
      success: true,
      message: 'Lấy danh sách thành công',
      data: products.all(),
      meta: {
        page: meta.currentPage,
        pageSize: meta.perPage,
        total: meta.total,
        totalPages: meta.lastPage,
      },
    })
  }

  /**
   * @store
   * @summary Tạo sản phẩm
   * @description POST /api/v1/admin/products
   * @requestBody <createProductValidator>
   * @responseBody 201 - <ProductResponse>
   */
  async store({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(createProductValidator)
    const userId = auth.user!.id
    const product = await this.productService.create(payload, userId)

    return response.created({
      success: true,
      message: 'Thành công',
      data: product,
    })
  }

  /**
   * @show
   * @summary Chi tiết sản phẩm (Admin)
   * @description GET /api/v1/admin/products/:id
   * @paramPath id - Product ID
   * @responseBody 200 - <ProductResponse>
   */
  async show({ params, response }: HttpContext) {
    const product = await this.productService.findById(params.id)
    return response.json({
      success: true,
      message: 'Thành công',
      data: product,
    })
  }

  /**
   * @clientShow
   * @summary Chi tiết sản phẩm (Client)
   * @description GET /api/v1/products/:id
   * @paramPath id - Product ID
   * @responseBody 200 - <ProductResponse>
   */
  async clientShow({ params, response }: HttpContext) {
    // Client dùng chung endpoint lấy chi tiết bằng ID
    const product = await this.productService.findByIdForClient(params.id)
    return response.json({
      success: true,
      message: 'Thành công',
      data: product,
    })
  }

  /**
   * @update
   * @summary Cập nhật sản phẩm
   * @description PUT /api/v1/admin/products/:id
   * @paramPath id - Product ID
   * @requestBody <updateProductValidator>
   * @responseBody 200 - <ProductResponse>
   */
  async update({ params, request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(updateProductValidator)
    const userId = auth.user!.id
    const product = await this.productService.update(params.id, payload, userId)

    return response.json({
      success: true,
      message: 'Thành công',
      data: product,
    })
  }

  /**
   * @destroy
   * @summary Xóa sản phẩm
   * @description DELETE /api/v1/admin/products/:id
   * @paramPath id - Product ID
   * @responseBody 200 - <SuccessResponse>
   */
  async destroy({ params, response, auth }: HttpContext) {
    const userId = auth.user!.id
    await this.productService.delete(params.id, userId)
    return response.json({
      success: true,
      message: 'Xóa sản phẩm thành công',
    })
  }
}
