import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import ProductReviewService from '#services/product_review_service'
import {
  createProductReviewValidator,
  approveProductReviewValidator,
  replyProductReviewValidator,
  reviewFilterValidator,
} from '#validators/product_review'
import { HttpStatus } from '#enums/http_status'
import { Pagination } from '#enums/pagination'
import { paginationValidator } from '#validators/pagination'
import { formatPagination } from '#utils/pagination'

@inject()
export default class ProductReviewsController {
  constructor(protected productReviewService: ProductReviewService) {}

  /**
   * @clientIndex
   * @summary Lấy đánh giá sản phẩm (Client)
   * @description Client API: Get product reviews
   * @paramPath id - Product ID
   * @paramQuery page - Trang hiện tại
   * @paramQuery limit - Số lượng trên mỗi trang
   * @responseBody 200 - <PaginatedProductReviewClientListResponse>
   */
  async clientIndex({ params, request, response }: HttpContext) {
    const { page, limit } = await request.validateUsing(paginationValidator, {
      data: request.qs(),
    })

    const pageNum = page || Pagination.DEFAULT_PAGE
    const limitNum = limit || Pagination.DEFAULT_LIMIT

    const reviews = await this.productReviewService.clientList(params.id, pageNum, limitNum)

    return response.json({
      success: true,
      message: 'Lấy danh sách đánh giá thành công',
      data: formatPagination(reviews),
    })
  }

  /**
   * @clientFeatured
   * @summary Lấy đánh giá nổi bật (Client)
   * @description Client API: Get featured product reviews for homepage
   * @responseBody 200 - {"success": true, "message": "Lấy đánh giá nổi bật thành công", "data": []}
   */
  async clientFeatured({ response }: HttpContext) {
    const reviews = await this.productReviewService.clientFeatured(6)
    return response.json({
      success: true,
      message: 'Lấy đánh giá nổi bật thành công',
      data: reviews,
    })
  }

  /**
   * @store
   * @summary Gửi đánh giá sản phẩm
   * @description Client API: Post a new review
   * @paramPath id - Product ID
   * @requestBody <createProductReviewValidator>
   * @responseBody 201 - <ProductReviewResponse>
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
   * @summary Lấy tất cả đánh giá (Admin)
   * @description Admin API: Get all product reviews
   * @paramQuery page - Trang hiện tại
   * @paramQuery limit - Số lượng trên mỗi trang
   * @paramQuery status - Trạng thái lọc (all, pending, approved)
   * @responseBody 200 - <PaginatedProductReviewAdminListResponse>
   */
  async index({ request, response }: HttpContext) {
    const { page, limit, status } = await request.validateUsing(reviewFilterValidator, {
      data: request.qs(),
    })

    const pageNum = page || Pagination.DEFAULT_PAGE
    const limitNum = limit || Pagination.DEFAULT_LIMIT

    const reviews = await this.productReviewService.adminList(pageNum, limitNum, status)

    return response.json({
      success: true,
      message: 'Lấy danh sách đánh giá thành công',
      data: formatPagination(reviews),
    })
  }

  /**
   * @stats
   * @summary Lấy thống kê đánh giá (Admin)
   * @description Admin API: Get product reviews statistics
   * @responseBody 200 - {"success": true, "message": "Thành công", "data": {"total": 0, "pending": 0, "approved": 0, "averageRating": 0}}
   */
  async stats({ response }: HttpContext) {
    const stats = await this.productReviewService.getStats()
    return response.json({
      success: true,
      message: 'Lấy thống kê thành công',
      data: stats,
    })
  }

  /**
   * @approve
   * @summary Duyệt/Ẩn đánh giá
   * @description Admin API: Approve/Reject a review
   * @paramPath id - Review ID
   * @requestBody <approveProductReviewValidator>
   * @responseBody 200 - <ProductReviewResponse>
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
   * @summary Xóa đánh giá
   * @description Admin API: Delete a review
   * @paramPath id - Review ID
   * @responseBody 200 - <SuccessResponse>
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
   * @summary Trả lời đánh giá
   * @description Admin API: Reply to a review
   * @paramPath id - Review ID
   * @requestBody <replyProductReviewValidator>
   * @responseBody 200 - <ProductReviewResponse>
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
