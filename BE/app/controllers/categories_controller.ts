import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import CategoryService from '#services/category_service'
import { createCategoryValidator, updateCategoryValidator } from '#validators/category'
import { Pagination } from '#enums/pagination'
import { paginationValidator } from '#validators/pagination'

@inject()
export default class CategoriesController {
  constructor(protected categoryService: CategoryService) {}

  /**
   * @index
   * @summary Danh sách danh mục (Admin)
   * @description GET /api/v1/admin/categories
   * @paramQuery page - Trang hiện tại
   * @paramQuery limit - Số lượng trên mỗi trang
   * @responseBody 200 - {"success": true, "message": "string", "data": [{"$ref": "#/components/schemas/Category"}], "meta": {"$ref": "#/components/schemas/PaginationMeta"}}
   */
  async index({ request, response }: HttpContext) {
    const { page, limit } = await request.validateUsing(paginationValidator, {
      data: request.qs(),
    })

    const pageNum = page || Pagination.DEFAULT_PAGE
    const limitNum = limit || Pagination.DEFAULT_LIMIT

    const categories = await this.categoryService.paginate(pageNum, limitNum)

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
   * @summary Danh sách danh mục (Client)
   * @description GET /api/v1/categories
   * @responseBody 200 - <CategoryClientListArrayResponse>
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
   * @summary Tạo danh mục mới
   * @description POST /api/v1/admin/categories
   * @requestBody <createCategoryValidator>
   * @responseBody 201 - <CategoryResponse>
   */
  async store({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(createCategoryValidator)
    const userId = auth.user!.id
    const category = await this.categoryService.create(payload, userId)

    return response.created({
      success: true,
      message: 'Thành công',
      data: category,
    })
  }

  /**
   * @show
   * @summary Chi tiết danh mục (Admin)
   * @description GET /api/v1/admin/categories/:id
   * @paramPath id - Category ID
   * @responseBody 200 - <CategoryAdminListResponse>
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
   * @summary Chi tiết danh mục (Client)
   * @description GET /api/v1/categories/:id
   * @paramPath id - Category ID
   * @responseBody 200 - <CategoryAdminListResponse>
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
   * @summary Cập nhật danh mục
   * @description PUT /api/v1/admin/categories/:id
   * @paramPath id - Category ID
   * @requestBody <updateCategoryValidator>
   * @responseBody 200 - <CategoryAdminListResponse>
   */
  async update({ params, request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(updateCategoryValidator, {
      meta: { categoryId: Number(params.id) },
    })
    const userId = auth.user!.id
    const category = await this.categoryService.update(params.id, payload, userId)

    return response.json({
      success: true,
      message: 'Thành công',
      data: category,
    })
  }

  /**
   * @destroy
   * @summary Xóa danh mục
   * @description DELETE /api/v1/admin/categories/:id
   * @paramPath id - Category ID
   * @responseBody 200 - <SuccessResponse>
   */
  async destroy({ params, response, auth }: HttpContext) {
    const userId = auth.user!.id
    await this.categoryService.delete(params.id, userId)
    return response.json({
      success: true,
      message: 'Xóa danh mục thành công',
    })
  }
}
