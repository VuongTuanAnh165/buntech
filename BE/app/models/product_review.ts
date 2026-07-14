import { belongsTo, hasMany, beforeFind, beforeFetch } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import { ProductReviewSchema } from '#database/schema'
import { ApiProperty } from '@foadonis/openapi/decorators'
import Product from '#models/product'
import User from '#models/user'
import ProductReviewImage from '#models/product_review_image'

export default class ProductReview extends ProductReviewSchema {
  @ApiProperty()
  declare id: number

  @ApiProperty()
  declare rating: number

  @ApiProperty()
  declare content: string | null

  @ApiProperty()
  declare isApproved: boolean | null

  @ApiProperty()
  declare replyContent: string | null
  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'repliedBy',
  })
  declare replier: BelongsTo<typeof User>

  @hasMany(() => ProductReviewImage, {
    foreignKey: 'reviewId',
  })
  declare images: HasMany<typeof ProductReviewImage>

  @beforeFind()
  static ignoreDeletedFind(query: ModelQueryBuilderContract<typeof ProductReview, ProductReview>) {
    query.whereNull(`${query.model.table}.deleted_at`)
  }

  @beforeFetch()
  static ignoreDeletedFetch(query: ModelQueryBuilderContract<typeof ProductReview, ProductReview>) {
    query.whereNull(`${query.model.table}.deleted_at`)
  }
}
