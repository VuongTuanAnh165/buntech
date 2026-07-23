import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import BlogCategoryService from '#services/blog_category_service'
import { createBlogCategoryValidator, updateBlogCategoryValidator } from '#validators/blog_category'
import { HttpStatus } from '#enums/http_status'

@inject()
export default class BlogCategoriesController {
  constructor(protected blogCategoryService: BlogCategoryService) {}

  /**
   * @clientIndex
   * @description Public API: Get all categories
   * @responseBody 200 - {"success": true, "message": "string", "data": "<BlogCategoryList[]>"}
   */
  async clientIndex({ response }: HttpContext) {
    const categories = await this.blogCategoryService.getList()
    return response.json({
      success: true,
      message: 'Lấy danh sách danh mục thành công',
      data: categories,
    })
  }

  /**
   * @index
   * @description Admin API: Get all categories
   * @responseBody 200 - {"success": true, "message": "string", "data": "<BlogCategoryList[]>"}
   */
  async index({ response }: HttpContext) {
    const categories = await this.blogCategoryService.getList()
    return response.json({
      success: true,
      message: 'Lấy danh sách danh mục thành công',
      data: categories,
    })
  }

  /**
   * @show
   * @description Admin API: Get category by ID
   * @paramPath id - Category ID - @type(number) @required
   * @responseBody 200 - {"success": true, "message": "string", "data": "<BlogCategoryList>"}
   */
  async show({ params, response }: HttpContext) {
    const category = await this.blogCategoryService.findById(params.id)
    return response.json({
      success: true,
      message: 'Lấy chi tiết danh mục thành công',
      data: category,
    })
  }

  /**
   * @store
   * @description Admin API: Create new category
   * @requestBody <createBlogCategoryValidator>
   * @responseBody 201 - {"success": true, "message": "string", "data": "<BlogCategory>"}
   */
  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createBlogCategoryValidator)
    const category = await this.blogCategoryService.create(payload)

    return response.status(HttpStatus.CREATED).json({
      success: true,
      message: 'Tạo danh mục thành công',
      data: category,
    })
  }

  /**
   * @update
   * @description Admin API: Update category
   * @paramPath id - Category ID - @type(number) @required
   * @requestBody <updateBlogCategoryValidator>
   * @responseBody 200 - {"success": true, "message": "string", "data": "<BlogCategory>"}
   */
  async update({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateBlogCategoryValidator, {
      meta: { categoryId: Number(params.id) },
    })
    const category = await this.blogCategoryService.update(params.id, payload)

    return response.json({
      success: true,
      message: 'Cập nhật danh mục thành công',
      data: category,
    })
  }

  /**
   * @destroy
   * @description Admin API: Delete category
   * @paramPath id - Category ID - @type(number) @required
   * @responseBody 200 - {"success": true, "message": "string"}
   */
  async destroy({ params, response }: HttpContext) {
    await this.blogCategoryService.delete(params.id)
    return response.json({
      success: true,
      message: 'Xoá danh mục thành công',
    })
  }
}
