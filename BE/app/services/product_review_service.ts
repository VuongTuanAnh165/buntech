import ProductReview from '#models/product_review'
import ProductReviewImage from '#models/product_review_image'
import Product from '#models/product'
import OrderItem from '#models/order_item'
import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { Pagination } from '#enums/pagination'
import type { Infer } from '@vinejs/vine/types'
import {
  type createProductReviewValidator,
  type approveProductReviewValidator,
  type replyProductReviewValidator,
} from '#validators/product_review'
import FileUploadService from '#services/file_upload_service'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import { DateTime } from 'luxon'

export type CreateProductReviewDTO = Infer<typeof createProductReviewValidator>
export type ApproveProductReviewDTO = Infer<typeof approveProductReviewValidator>
export type ReplyProductReviewDTO = Infer<typeof replyProductReviewValidator>

@inject()
export default class ProductReviewService {
  constructor(protected fileUploadService: FileUploadService) {}

  /**
   * Client: Get approved reviews for a product
   */
  async clientList(productId: number, page: number = 1, limit: number = 10) {
    const safeLimit = Math.min(limit, Pagination.MAX_LIMIT)

    return await ProductReview.query()
      .where('productId', productId)
      .where('isApproved', true)
      .preload('user', (q) => q.select('id', 'fullName'))
      .preload('images', (q) => q.select('fileUrl'))
      .select('id', 'rating', 'content', 'createdAt', 'userId', 'hasPurchased', 'replyContent')
      .orderBy('createdAt', 'desc')
      .paginate(page, safeLimit)
  }

  /**
   * Admin: Get all reviews
   */
  async adminList(page: number = 1, limit: number = 10) {
    const safeLimit = Math.min(limit, Pagination.MAX_LIMIT)

    return await ProductReview.query()
      .select(
        'id',
        'rating',
        'content',
        'created_at',
        'user_id',
        'product_id',
        'is_approved',
        'has_purchased',
        'replied_by',
        'reply_content'
      )
      .preload('user', (q) => q.select('id', 'fullName'))
      .preload('product', (q) => q.select('id', 'name'))
      .preload('replier', (q) => q.select('id', 'fullName'))
      .preload('images', (q) => q.select('review_id', 'file_url'))
      .orderBy('createdAt', 'desc')
      .paginate(page, safeLimit)
  }

  /**
   * Client: Create a new review
   */
  async create(productId: number, userId: number, data: CreateProductReviewDTO) {
    const { images, ...reviewData } = data

    // Check if user has purchased this product
    const orderItem = await OrderItem.query()
      .select('id')
      .where('productId', productId)
      .whereHas('order', (query) => {
        query.where('userId', userId)
      })
      .first()

    const hasPurchased = !!orderItem

    const uploadedImageUrls: string[] = []
    const uploadedImageKeys: string[] = []

    // 1. Upload files BEFORE transaction to prevent blocking
    if (images && images.length > 0) {
      const uploadResults = await this.fileUploadService.uploadMany(images, `reviews/${productId}`)
      for (const res of uploadResults) {
        uploadedImageUrls.push(res.url)
        uploadedImageKeys.push(res.key)
      }
    }

    try {
      // 2. Open Transaction
      const review = await db.transaction(async (trx) => {
        // Create review
        const newReview = new ProductReview()
        newReview.useTransaction(trx)
        newReview.productId = productId
        newReview.userId = userId
        newReview.rating = reviewData.rating
        newReview.content = reviewData.content || null
        newReview.hasPurchased = hasPurchased
        newReview.isApproved = false // Default to false

        await newReview.save()

        // Create images
        if (uploadedImageUrls.length > 0) {
          const imageRecords = uploadedImageUrls.map((fileUrl) => ({
            reviewId: newReview.id,
            fileUrl,
          }))
          await ProductReviewImage.createMany(imageRecords, { client: trx })
        }

        return newReview
      })

      return review
    } catch (error) {
      // 3. Rollback: Delete uploaded files if DB transaction fails
      if (uploadedImageKeys.length > 0) {
        await this.fileUploadService.deleteMany(uploadedImageKeys)
      }
      logger.error({ err: error }, 'Create product review failed')
      throw error
    }
  }

  /**
   * Admin: Approve or reject a review
   */
  async approve(id: number, data: ApproveProductReviewDTO) {
    const trx = await db.transaction()
    try {
      const review = await ProductReview.query({ client: trx })
        .select('id', 'is_approved', 'product_id')
        .where('id', id)
        .firstOrFail()
      review.useTransaction(trx)
      review.isApproved = data.isApproved
      await review.save()

      // Recalculate if it's approved or rejected
      await this.recalculateRating(review.productId!, trx)

      await trx.commit()
      return review
    } catch (error) {
      await trx.rollback()
      logger.error({ err: error }, 'Duyệt đánh giá thất bại')
      throw error
    }
  }

  /**
   * Admin: Reply to a review
   */
  async reply(id: number, adminId: number, data: ReplyProductReviewDTO) {
    const review = await ProductReview.query()
      .select('id', 'reply_content', 'replied_by')
      .where('id', id)
      .firstOrFail()
    review.replyContent = data.replyContent
    review.repliedBy = adminId
    await review.save()

    return review
  }

  /**
   * Admin: Delete a review
   */
  async delete(id: number) {
    const trx = await db.transaction()
    try {
      const review = await ProductReview.query({ client: trx })
        .select('id', 'product_id')
        .where('id', id)
        .firstOrFail()
      review.useTransaction(trx)
      review.deletedAt = DateTime.now()
      await review.save()

      // Recalculate
      await this.recalculateRating(review.productId!, trx)

      await trx.commit()
    } catch (error) {
      await trx.rollback()
      logger.error({ err: error }, 'Xóa đánh giá thất bại')
      throw error
    }
  }

  /**
   * Helper: Recalculate product average rating and total reviews
   */
  private async recalculateRating(productId: number, trx: TransactionClientContract) {
    // Get aggregate
    const result = await trx.rawQuery(
      'SELECT COUNT(id) as total, AVG(rating) as average FROM product_reviews WHERE product_id = ? AND is_approved = true AND deleted_at IS NULL',
      [productId]
    )

    const totalReviews = result[0][0].total || 0
    const averageRating = result[0][0].average ? Number.parseFloat(result[0][0].average) : 0.0

    // Update product
    const product = await Product.query({ client: trx })
      .select('id', 'total_reviews', 'average_rating')
      .where('id', productId)
      .firstOrFail()
    product.useTransaction(trx)
    product.totalReviews = totalReviews
    product.averageRating = String(averageRating)

    await product.save()
  }
}
