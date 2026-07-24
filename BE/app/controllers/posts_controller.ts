import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import PostService from '#services/post_service'
import { createPostValidator, updatePostValidator } from '#validators/post'
import { HttpStatus } from '#enums/http_status'
import { Pagination } from '#enums/pagination'
import { paginationValidator } from '#validators/pagination'

@inject()
export default class PostsController {
  constructor(protected postService: PostService) {}

  /**
   * @clientIndex
   * @summary Danh sách bài viết (Client)
   * @description Public API: Get all published posts
   * @paramQuery page - Trang hiện tại
   * @paramQuery limit - Số lượng trên mỗi trang
   * @paramQuery categoryId - ID Danh mục
   * @responseBody 200 - {"success": true, "message": "string", "data": [{"$ref": "#/components/schemas/Post"}], "meta": {"$ref": "#/components/schemas/PaginationMeta"}}
   */
  async clientIndex({ request, response }: HttpContext) {
    const { page, limit } = await request.validateUsing(paginationValidator, {
      data: request.qs(),
    })

    const pageNum = page || Pagination.DEFAULT_PAGE
    const limitNum = limit || Pagination.DEFAULT_LIMIT
    const categoryId = request.input('categoryId')

    const posts = await this.postService.getList(pageNum, limitNum, {
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
   * @summary Chi tiết bài viết (Client)
   * @description Public API: Get single published post
   * @paramPath id - Post ID
   * @responseBody 200 - <PostResponse>
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
   * @summary Danh sách bài viết (Admin)
   * @description Admin API: Get all posts
   * @paramQuery page - Trang hiện tại
   * @paramQuery limit - Số lượng trên mỗi trang
   * @paramQuery categoryId - ID Danh mục
   * @responseBody 200 - {"success": true, "message": "string", "data": [{"$ref": "#/components/schemas/Post"}], "meta": {"$ref": "#/components/schemas/PaginationMeta"}}
   */
  async index({ request, response }: HttpContext) {
    const { page, limit } = await request.validateUsing(paginationValidator, {
      data: request.qs(),
    })

    const pageNum = page || Pagination.DEFAULT_PAGE
    const limitNum = limit || Pagination.DEFAULT_LIMIT
    const categoryId = request.input('categoryId')

    const posts = await this.postService.getList(pageNum, limitNum, {
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
   * @summary Chi tiết bài viết (Admin)
   * @description Admin API: Get single post
   * @paramPath id - Post ID
   * @responseBody 200 - <PostResponse>
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
   * @summary Tạo bài viết
   * @description Admin API: Create new post
   * @requestBody <createPostValidator>
   * @responseBody 201 - <PostResponse>
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
   * @summary Cập nhật bài viết
   * @description Admin API: Update post
   * @paramPath id - Post ID
   * @requestBody <updatePostValidator>
   * @responseBody 200 - <PostResponse>
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
   * @summary Xóa bài viết
   * @description Admin API: Delete post (Soft delete)
   * @paramPath id - Post ID
   * @responseBody 200 - <SuccessResponse>
   */
  async destroy({ params, response }: HttpContext) {
    await this.postService.delete(params.id)
    return response.json({
      success: true,
      message: 'Xoá bài viết thành công',
    })
  }
}
