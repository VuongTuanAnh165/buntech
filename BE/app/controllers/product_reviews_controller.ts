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
import { paginationValidator } from '#validators/pagination'

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
   * @responseBody 200 - {"success": true, "message": "string", "data": [{"$ref": "#/components/schemas/ProductReview"}], "meta": {"$ref": "#/components/schemas/PaginationMeta"}}
   */
  async clientIndex({ params, request, response }: HttpContext) {
    const { page, limit } = await request.validateUsing(paginationValidator, {
      data: request.qs(),
    })

    const pageNum = page || Pagination.DEFAULT_PAGE
    const limitNum = limit || Pagination.DEFAULT_LIMIT

    const reviews = await this.productReviewService.clientList(params.id, pageNum, limitNum)

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
   * @responseBody 200 - {"success": true, "message": "string", "data": [{"$ref": "#/components/schemas/ProductReview"}], "meta": {"$ref": "#/components/schemas/PaginationMeta"}}
   */
  async index({ request, response }: HttpContext) {
    const { page, limit } = await request.validateUsing(paginationValidator, {
      data: request.qs(),
    })

    const pageNum = page || Pagination.DEFAULT_PAGE
    const limitNum = limit || Pagination.DEFAULT_LIMIT

    const reviews = await this.productReviewService.adminList(pageNum, limitNum)

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
