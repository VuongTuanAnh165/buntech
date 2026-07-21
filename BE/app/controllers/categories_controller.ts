import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import CategoryService from '#services/category_service'
import { createCategoryValidator, updateCategoryValidator } from '#validators/category'
import { Pagination } from '#enums/pagination'

@inject()
export default class CategoriesController {
  constructor(protected categoryService: CategoryService) {}

  /**
   * @index
   * @description GET /api/v1/admin/categories
   * @paramUse(sort, limit)
   * @param page - page number - @type(number)
   * @param limit - items per page - @type(number)
   * @responseBody 200 - {"success": true, "message": "string", "data": "<CategoryAdminList[]>", "meta": "<PaginationMeta>"}
   */
  async index({ request, response }: HttpContext) {
    const page = request.input('page', Pagination.DEFAULT_PAGE)
    const limit = request.input('limit', Pagination.DEFAULT_LIMIT)

    const categories = await this.categoryService.paginate(page, limit)

    const meta = categories.getMeta()
    return response.json({
      success: true,
      message: 'Lấy danh sách thành công',
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
   * @clientIndex
   * @description GET /api/v1/categories
   * @responseBody 200 - {"success": true, "message": "string", "data": "<CategoryClientList[]>"}
   */
  async clientIndex({ response }: HttpContext) {
    const categories = await this.categoryService.clientList()
    return response.json({
      success: true,
      message: 'Lấy danh sách thành công',
      data: categories,
    })
  }

  /**
   * @store
   * @description POST /api/v1/admin/categories
   * @requestBody <createCategoryValidator>
   * @responseBody 201 - {"success": true, "message": "string", "data": "<Category>"}
   */
  async store({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(createCategoryValidator)
    const userId = auth.user?.id
    const category = await this.categoryService.create(payload, userId)

    return response.created({
      success: true,
      message: 'Thành công',
      data: category,
    })
  }

  /**
   * @show
   * @description GET /api/v1/admin/categories/:id
   * @paramPath id - Category ID - @type(number) @required
   * @responseBody 200 - {"success": true, "message": "string", "data": "<Category>"}
   */
  async show({ params, response }: HttpContext) {
    const category = await this.categoryService.findById(params.id)
    return response.json({
      success: true,
      message: 'Thành công',
      data: category,
    })
  }

  /**
   * @clientShow
   * @description GET /api/v1/categories/:id
   * @paramPath id - Category ID - @type(number) @required
   * @responseBody 200 - {"success": true, "message": "string", "data": "<CategoryClientList>"}
   */
  async clientShow({ params, response }: HttpContext) {
    const category = await this.categoryService.findByIdForClient(params.id)
    return response.json({
      success: true,
      message: 'Thành công',
      data: category,
    })
  }

  /**
   * @update
   * @description PUT /api/v1/admin/categories/:id
   * @paramPath id - Category ID - @type(number) @required
   * @requestBody <updateCategoryValidator>
   * @responseBody 200 - {"success": true, "message": "string", "data": "<Category>"}
   */
  async update({ params, request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(updateCategoryValidator)
    const userId = auth.user?.id
    const category = await this.categoryService.update(params.id, payload, userId)

    return response.json({
      success: true,
      message: 'Thành công',
      data: category,
    })
  }

  /**
   * @destroy
   * @description DELETE /api/v1/admin/categories/:id
   * @paramPath id - Category ID - @type(number) @required
   * @responseBody 200 - {"success": true, "message": "string"}
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
