import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { ProductReviewImageSchema } from '#database/schema'
import ProductReview from '#models/product_review'

export default class ProductReviewImage extends ProductReviewImageSchema {
  @belongsTo(() => ProductReview, {
    foreignKey: 'reviewId',
  })
  declare review: BelongsTo<typeof ProductReview>
}
