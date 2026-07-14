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
   * Public API: Get all published posts
   */
  async clientIndex({ request, response }: HttpContext) {
    const page = request.input('page', Pagination.DEFAULT_PAGE)
    const limit = request.input('limit', Pagination.DEFAULT_LIMIT)
    const categoryId = request.input('categoryId')

    const posts = await this.postService.getList(page, limit, {
      isPublic: true,
      categoryId: categoryId ? Number(categoryId) : undefined,
    })

    return response.json({
      success: true,
      message: 'Lấy danh sách bài viết thành công',
      data: posts,
    })
  }

  /**
   * Public API: Get single published post
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
   * Admin API: Get all posts
   */
  async index({ request, response }: HttpContext) {
    const page = request.input('page', Pagination.DEFAULT_PAGE)
    const limit = request.input('limit', Pagination.DEFAULT_LIMIT)
    const categoryId = request.input('categoryId')

    const posts = await this.postService.getList(page, limit, {
      categoryId: categoryId ? Number(categoryId) : undefined,
    })

    return response.json({
      success: true,
      message: 'Lấy danh sách bài viết thành công',
      data: posts,
    })
  }

  /**
   * Admin API: Get single post
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
   * Admin API: Create new post
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
   * Admin API: Update post
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
   * Admin API: Delete post (Soft delete)
   */
  async destroy({ params, response }: HttpContext) {
    await this.postService.delete(params.id)
    return response.json({
      success: true,
      message: 'Xoá bài viết thành công',
    })
  }
}
