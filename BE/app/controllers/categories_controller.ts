import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import CategoryService from '#services/category_service'
import { createCategoryValidator, updateCategoryValidator } from '#validators/category'
import { Pagination } from '#enums/pagination'

@inject()
export default class CategoriesController {
  constructor(protected categoryService: CategoryService) {}

  /**
   * GET /api/v1/admin/categories
   */
  async index({ request, response }: HttpContext) {
    const page = request.input('page', Pagination.DEFAULT_PAGE)
    const limit = request.input('limit', Pagination.DEFAULT_LIMIT)

    const categories = await this.categoryService.paginate(page, limit)

    const meta = categories.getMeta()
    return response.json({
      success: true,
      data: categories.all(),
      meta: {
        page: meta.currentPage,
        pageSize: meta.perPage,
        total: meta.total,
        totalPages: meta.lastPage,
      },
    })
  }

  /**
   * GET /api/v1/categories
   */
  async clientIndex({ response }: HttpContext) {
    const categories = await this.categoryService.clientList()
    return response.json({
      success: true,
      data: categories,
    })
  }

  /**
   * POST /api/v1/admin/categories
   */
  async store({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(createCategoryValidator)
    const userId = auth.user?.id
    const category = await this.categoryService.create(payload, userId)

    return response.created({
      success: true,
      data: category,
    })
  }

  /**
   * GET /api/v1/admin/categories/:id
   */
  async show({ params, response }: HttpContext) {
    const category = await this.categoryService.findById(params.id)
    return response.json({
      success: true,
      data: category,
    })
  }

  /**
   * GET /api/v1/categories/:id
   */
  async clientShow({ params, response }: HttpContext) {
    const category = await this.categoryService.findByIdForClient(params.id)
    return response.json({
      success: true,
      data: category,
    })
  }

  /**
   * PUT /api/v1/admin/categories/:id
   */
  async update({ params, request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(updateCategoryValidator)
    const userId = auth.user?.id
    const category = await this.categoryService.update(params.id, payload, userId)

    return response.json({
      success: true,
      data: category,
    })
  }

  /**
   * DELETE /api/v1/admin/categories/:id
   */
  async destroy({ params, response, auth }: HttpContext) {
    const userId = auth.user?.id
    await this.categoryService.delete(params.id, userId)
    return response.json({
      success: true,
      message: 'Xóa danh mục thành công',
    })
  }
}
