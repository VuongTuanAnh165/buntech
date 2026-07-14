import ProductReview from '#models/product_review'
import ProductReviewImage from '#models/product_review_image'
import Product from '#models/product'
import OrderItem from '#models/order_item'
import db from '@adonisjs/lucid/services/db'
import { Pagination } from '#enums/pagination'
import drive from '@adonisjs/drive/services/main'
import { randomUUID } from 'node:crypto'
import type { Infer } from '@vinejs/vine/types'
import {
  type createProductReviewValidator,
  type approveProductReviewValidator,
  type replyProductReviewValidator,
} from '#validators/product_review'

export type CreateProductReviewDTO = Infer<typeof createProductReviewValidator>
export type ApproveProductReviewDTO = Infer<typeof approveProductReviewValidator>
export type ReplyProductReviewDTO = Infer<typeof replyProductReviewValidator>

export default class ProductReviewService {
  /**
   * Client: Get approved reviews for a product
   */
  async clientList(productId: number, page: number = 1, limit: number = 10) {
    const safeLimit = Math.min(limit, Pagination.MAX_LIMIT)

    return await ProductReview.query()
      .where('productId', productId)
      .where('isApproved', true)
      .preload('user', (q) => q.select('id', 'fullName')) // Assuming avatarUrl is in UserProfile, let's just select fullName for now
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
      .preload('user', (q) => q.select('id', 'fullName'))
      .preload('product', (q) => q.select('id', 'name'))
      .preload('replier', (q) => q.select('id', 'fullName'))
      .preload('images')
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
      .where('productId', productId)
      .whereHas('order', (query) => {
        query.where('userId', userId)
      })
      .first()

    const hasPurchased = !!orderItem

    const uploadedImageKeys: string[] = []

    // 1. Upload files BEFORE transaction to prevent blocking
    if (images && images.length > 0) {
      for (const image of images) {
        if (!image) continue
        const key = `reviews/${productId}/${randomUUID()}.${image.extname}`
        await image.moveToDisk(key)
        const fileUrl = await drive.use().getUrl(key)
        uploadedImageKeys.push(fileUrl) // In real world we might just store keys, but let's store URLs as per our migration
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
        if (uploadedImageKeys.length > 0) {
          const imageRecords = uploadedImageKeys.map((fileUrl) => ({
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
      for (const fileUrl of uploadedImageKeys) {
        // fileUrl is the URL, we need to extract the key to delete.
        // Assuming URL contains the key. Let's just try to delete the known key format
        const key = fileUrl.substring(fileUrl.indexOf('reviews/'))
        await drive
          .use()
          .delete(key)
          .catch(() => {})
      }
      throw error
    }
  }

  /**
   * Admin: Approve or reject a review
   */
  async approve(id: number, data: ApproveProductReviewDTO) {
    const review = await ProductReview.findOrFail(id)
    review.isApproved = data.isApproved
    await review.save()

    // Recalculate if it's approved or rejected
    await this.recalculateRating(review.productId!)

    return review
  }

  /**
   * Admin: Reply to a review
   */
  async reply(id: number, adminId: number, data: ReplyProductReviewDTO) {
    const review = await ProductReview.findOrFail(id)
    review.replyContent = data.replyContent
    review.repliedBy = adminId
    await review.save()

    return review
  }

  /**
   * Admin: Delete a review
   */
  async delete(id: number) {
    const review = await ProductReview.findOrFail(id)
    review.deletedAt = require('luxon').DateTime.now()
    await review.save()

    // Recalculate
    await this.recalculateRating(review.productId!)
  }

  /**
   * Helper: Recalculate product average rating and total reviews
   */
  private async recalculateRating(productId: number) {
    await db.transaction(async (trx) => {
      // Get aggregate
      const result = await trx.rawQuery(
        'SELECT COUNT(id) as total, AVG(rating) as average FROM product_reviews WHERE product_id = ? AND is_approved = true AND deleted_at IS NULL',
        [productId]
      )

      const totalReviews = result[0][0].total || 0
      const averageRating = result[0][0].average ? Number.parseFloat(result[0][0].average) : 0.0

      // Update product
      const product = await Product.findOrFail(productId, { client: trx })
      product.totalReviews = totalReviews
      product.averageRating = String(averageRating)

      await product.save()
    })
  }
}
