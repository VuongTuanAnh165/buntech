import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import PostService from '#services/post_service'
import { createPostValidator, updatePostValidator } from '#validators/post'
import { HttpStatus } from '#enums/http_status'
import { Pagination } from '#enums/pagination'

@inject()
export default class PostsController {
  constructor(protected postService: PostService) {}

  /**
   * @clientIndex
   * @description Public API: Get all published posts
   * @paramUse(sort, limit)
   * @param page - page number - @type(number)
   * @param limit - items per page - @type(number)
   * @param categoryId - category ID - @type(number)
   * @responseBody 200 - {"success": true, "message": "string", "data": "<PostList[]>", "meta": "<PaginationMeta>"}
   */
  async clientIndex({ request, response }: HttpContext) {
    const page = request.input('page', Pagination.DEFAULT_PAGE)
    const limit = request.input('limit', Pagination.DEFAULT_LIMIT)
    const categoryId = request.input('categoryId')

    const posts = await this.postService.getList(page, limit, {
      isPublic: true,
      categoryId: categoryId ? Number(categoryId) : undefined,
    })
    
    const meta = posts.getMeta()
    return response.json({
      success: true,
      message: 'Lấy danh sách bài viết thành công',
      data: posts.all(),
      meta: {
        page: meta.currentPage,
        pageSize: meta.perPage,
        total: meta.total,
        totalPages: meta.lastPage,
      },
    })
  }

  /**
   * @clientShow
   * @description Public API: Get single published post
   * @paramPath id - Post ID - @type(number) @required
   * @responseBody 200 - {"success": true, "message": "string", "data": "<PostDetail>"}
   */
  async clientShow({ params, response }: HttpContext) {
    const post = await this.postService.findById(params.id, { isPublic: true })
    return response.json({
      success: true,
      message: 'Lấy chi tiết bài viết thành công',
      data: post,
    })
  }

  /**
   * @index
   * @description Admin API: Get all posts
   * @paramUse(sort, limit)
   * @param page - page number - @type(number)
   * @param limit - items per page - @type(number)
   * @param categoryId - category ID - @type(number)
   * @responseBody 200 - {"success": true, "message": "string", "data": "<PostList[]>", "meta": "<PaginationMeta>"}
   */
  async index({ request, response }: HttpContext) {
    const page = request.input('page', Pagination.DEFAULT_PAGE)
    const limit = request.input('limit', Pagination.DEFAULT_LIMIT)
    const categoryId = request.input('categoryId')

    const posts = await this.postService.getList(page, limit, {
      categoryId: categoryId ? Number(categoryId) : undefined,
    })

    const meta = posts.getMeta()
    return response.json({
      success: true,
      message: 'Lấy danh sách bài viết thành công',
      data: posts.all(),
      meta: {
        page: meta.currentPage,
        pageSize: meta.perPage,
        total: meta.total,
        totalPages: meta.lastPage,
      },
    })
  }

  /**
   * @show
   * @description Admin API: Get single post
   * @paramPath id - Post ID - @type(number) @required
   * @responseBody 200 - {"success": true, "message": "string", "data": "<PostDetail>"}
   */
  async show({ params, response }: HttpContext) {
    const post = await this.postService.findById(params.id)
    return response.json({
      success: true,
      message: 'Lấy chi tiết bài viết thành công',
      data: post,
    })
  }

  /**
   * @store
   * @description Admin API: Create new post
   * @requestBody <createPostValidator>
   * @responseBody 201 - {"success": true, "message": "string", "data": "<Post>"}
   */
  async store({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(createPostValidator)
    const authorId = auth.user!.id // User must be authenticated

    const post = await this.postService.create(payload, authorId)

    return response.status(HttpStatus.CREATED).json({
      success: true,
      message: 'Tạo bài viết thành công',
      data: post,
    })
  }

  /**
   * @update
   * @description Admin API: Update post
   * @paramPath id - Post ID - @type(number) @required
   * @requestBody <updatePostValidator>
   * @responseBody 200 - {"success": true, "message": "string", "data": "<Post>"}
   */
  async update({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updatePostValidator)
    const post = await this.postService.update(params.id, payload)

    return response.json({
      success: true,
      message: 'Cập nhật bài viết thành công',
      data: post,
    })
  }

  /**
   * @destroy
   * @description Admin API: Delete post (Soft delete)
   * @paramPath id - Post ID - @type(number) @required
   * @responseBody 200 - {"success": true, "message": "string"}
   */
  async destroy({ params, response }: HttpContext) {
    await this.postService.delete(params.id)
    return response.json({
      success: true,
      message: 'Xoá bài viết thành công',
    })
  }
}
