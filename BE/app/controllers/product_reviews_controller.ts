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
import { ApiOperation, ApiBody } from '@foadonis/openapi/decorators'
import {
  ApiOkMessageResponse,
  ApiOkMessageOnlyResponse,
  ApiOkMessageListResponse,
  ApiCreatedMessageResponse,
  ApiPaginationQuery,
} from '#decorators/openapi'
import ProductReview from '#models/product_review'

@inject()
export default class ProductReviewsController {
  constructor(protected productReviewService: ProductReviewService) {}

  /**
   * Client API: Get product reviews
   */
  @ApiOperation({ summary: 'Client - Get reviews for a product' })
  @ApiPaginationQuery()
  @ApiOkMessageListResponse(ProductReview)
  async clientIndex({ params, request, response }: HttpContext) {
    const page = request.input('page', Pagination.DEFAULT_PAGE)
    const limit = request.input('limit', Pagination.DEFAULT_LIMIT)

    const reviews = await this.productReviewService.clientList(params.id, page, limit)

    return response.json({
      success: true,
      message: 'Lấy danh sách đánh giá thành công',
      data: reviews,
    })
  }

  /**
   * Client API: Post a new review
   */
  @ApiOperation({ summary: 'Client - Post a new review' })
  @ApiBody({ type: () => createProductReviewValidator })
  @ApiCreatedMessageResponse(ProductReview)
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
   * Admin API: Get all product reviews
   */
  @ApiOperation({ summary: 'Admin - Get all reviews' })
  @ApiPaginationQuery()
  @ApiOkMessageListResponse(ProductReview)
  async index({ request, response }: HttpContext) {
    const page = request.input('page', Pagination.DEFAULT_PAGE)
    const limit = request.input('limit', Pagination.DEFAULT_LIMIT)

    const reviews = await this.productReviewService.adminList(page, limit)

    return response.json({
      success: true,
      message: 'Lấy danh sách đánh giá thành công',
      data: reviews,
    })
  }

  /**
   * Admin API: Approve/Reject a review
   */
  @ApiOperation({ summary: 'Admin - Approve or Reject a review' })
  @ApiBody({ type: () => approveProductReviewValidator })
  @ApiOkMessageResponse(ProductReview)
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
   * Admin API: Delete a review
   */
  @ApiOperation({ summary: 'Admin - Delete a review' })
  @ApiOkMessageOnlyResponse()
  async destroy({ params, response }: HttpContext) {
    await this.productReviewService.delete(params.id)

    return response.json({
      success: true,
      message: 'Đã xóa đánh giá thành công',
    })
  }

  /**
   * Admin API: Reply to a review
   */
  @ApiOperation({ summary: 'Admin - Reply to a review' })
  @ApiBody({ type: () => replyProductReviewValidator })
  @ApiOkMessageResponse(ProductReview)
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
