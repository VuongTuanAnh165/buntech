import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import ProductService from '#services/product_service'
import { createProductValidator, updateProductValidator } from '#validators/product'
import { Pagination } from '#enums/pagination'
import { ApiOperation } from '@foadonis/openapi/decorators'

@inject()
export default class ProductsController {
  constructor(protected productService: ProductService) {}

  /**
   * GET /api/v1/admin/products
   */
  @ApiOperation({ summary: 'Admin - Get all products (Paginated)' })
  async index({ request, response }: HttpContext) {
    const page = request.input('page', Pagination.DEFAULT_PAGE)
    const limit = request.input('limit', Pagination.DEFAULT_LIMIT)

    const products = await this.productService.paginate(page, limit)
    const meta = products.getMeta()

    return response.json({
      success: true,
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
   * GET /api/v1/products
   */
  @ApiOperation({ summary: 'Client - Get products' })
  async clientIndex({ request, response }: HttpContext) {
    const page = request.input('page', Pagination.DEFAULT_PAGE)
    const limit = request.input('limit', Pagination.DEFAULT_LIMIT)
    const categoryId = request.input('categoryId')

    const products = await this.productService.clientList(
      page,
      limit,
      categoryId ? Number(categoryId) : undefined
    )
    const meta = products.getMeta()

    return response.json({
      success: true,
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
   * POST /api/v1/admin/products
   */
  @ApiOperation({ summary: 'Admin - Create a new product' })
  async store({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(createProductValidator)
    const userId = auth.user?.id
    const product = await this.productService.create(payload, userId)

    return response.created({
      success: true,
      data: product,
    })
  }

  /**
   * GET /api/v1/admin/products/:id
   */
  @ApiOperation({ summary: 'Admin - Get product by ID' })
  async show({ params, response }: HttpContext) {
    const product = await this.productService.findById(params.id)
    return response.json({
      success: true,
      data: product,
    })
  }

  /**
   * GET /api/v1/products/:id
   */
  @ApiOperation({ summary: 'Client - Get product details' })
  async clientShow({ params, response }: HttpContext) {
    // Client dùng chung endpoint lấy chi tiết bằng ID
    const product = await this.productService.findByIdForClient(params.id)
    return response.json({
      success: true,
      data: product,
    })
  }

  /**
   * PUT /api/v1/admin/products/:id
   */
  @ApiOperation({ summary: 'Admin - Update product' })
  async update({ params, request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(updateProductValidator)
    const userId = auth.user?.id
    const product = await this.productService.update(params.id, payload, userId)

    return response.json({
      success: true,
      data: product,
    })
  }

  /**
   * DELETE /api/v1/admin/products/:id
   */
  @ApiOperation({ summary: 'Admin - Delete product' })
  async destroy({ params, response, auth }: HttpContext) {
    const userId = auth.user?.id
    await this.productService.delete(params.id, userId)
    return response.json({
      success: true,
      message: 'Xóa sản phẩm thành công',
    })
  }
}
