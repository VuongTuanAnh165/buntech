import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import ProductReviewService from '#services/product_review_service'
import {
  createProductReviewValidator,
  approveProductReviewValidator,
  replyProductReviewValidator,
} from '#validators/product_review'
import { HttpStatus } from '#enums/http_status'
import { Pagination } from '#enums/pagination'

@inject()
export default class ProductReviewsController {
  constructor(protected productReviewService: ProductReviewService) {}

  /**
   * @clientIndex
   * @description Client API: Get product reviews
   * @paramPath id - Product ID - @type(number) @required
   * @paramUse(sort, limit)
   * @param page - page number - @type(number)
   * @param limit - items per page - @type(number)
   * @responseBody 200 - {"success": true, "message": "string", "data": "<ProductReviewClientList[]>", "meta": "<PaginationMeta>"}
   */
  async clientIndex({ params, request, response }: HttpContext) {
    const page = request.input('page', Pagination.DEFAULT_PAGE)
    const limit = request.input('limit', Pagination.DEFAULT_LIMIT)

    const reviews = await this.productReviewService.clientList(params.id, page, limit)

    const meta = reviews.getMeta()
    return response.json({
      success: true,
      message: 'Lấy danh sách đánh giá thành công',
      data: reviews.all(),
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
   * @description Client API: Post a new review
   * @paramPath id - Product ID - @type(number) @required
   * @requestBody <createProductReviewValidator>
   * @responseBody 201 - {"success": true, "message": "string", "data": "<ProductReview>"}
   */
  async store({ params, request, response, auth }: HttpContext) {
    const user = auth.user!
    const payload = await request.validateUsing(createProductReviewValidator)

    const review = await this.productReviewService.create(params.id, user.id, payload)

    return response.status(HttpStatus.CREATED).json({
      success: true,
      message: 'Gửi đánh giá thành công. Đánh giá đang chờ duyệt.',
      data: review,
    })
  }

  /**
   * @index
   * @description Admin API: Get all product reviews
   * @paramUse(sort, limit)
   * @param page - page number - @type(number)
   * @param limit - items per page - @type(number)
   * @responseBody 200 - {"success": true, "message": "string", "data": "<ProductReviewAdminList[]>", "meta": "<PaginationMeta>"}
   */
  async index({ request, response }: HttpContext) {
    const page = request.input('page', Pagination.DEFAULT_PAGE)
    const limit = request.input('limit', Pagination.DEFAULT_LIMIT)

    const reviews = await this.productReviewService.adminList(page, limit)

    const meta = reviews.getMeta()
    return response.json({
      success: true,
      message: 'Lấy danh sách đánh giá thành công',
      data: reviews.all(),
      meta: {
        page: meta.currentPage,
        pageSize: meta.perPage,
        total: meta.total,
        totalPages: meta.lastPage,
      },
    })
  }

  /**
   * @approve
   * @description Admin API: Approve/Reject a review
   * @paramPath id - Review ID - @type(number) @required
   * @requestBody <approveProductReviewValidator>
   * @responseBody 200 - {"success": true, "message": "string", "data": "<ProductReview>"}
   */
  async approve({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(approveProductReviewValidator)

    const review = await this.productReviewService.approve(params.id, payload)

    return response.json({
      success: true,
      message: payload.isApproved ? 'Đã duyệt đánh giá thành công' : 'Đã ẩn đánh giá thành công',
      data: review,
    })
  }

  /**
   * @destroy
   * @description Admin API: Delete a review
   * @paramPath id - Review ID - @type(number) @required
   * @responseBody 200 - {"success": true, "message": "string"}
   */
  async destroy({ params, response }: HttpContext) {
    await this.productReviewService.delete(params.id)

    return response.json({
      success: true,
      message: 'Đã xóa đánh giá thành công',
    })
  }

  /**
   * @reply
   * @description Admin API: Reply to a review
   * @paramPath id - Review ID - @type(number) @required
   * @requestBody <replyProductReviewValidator>
   * @responseBody 200 - {"success": true, "message": "string", "data": "<ProductReview>"}
   */
  async reply({ params, request, response, auth }: HttpContext) {
    const admin = auth.user!
    const payload = await request.validateUsing(replyProductReviewValidator)

    const review = await this.productReviewService.reply(params.id, admin.id, payload)

    return response.json({
      success: true,
      message: 'Trả lời đánh giá thành công',
      data: review,
    })
  }
}
