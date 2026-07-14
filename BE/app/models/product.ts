import { hasMany, belongsTo, beforeFind, beforeFetch } from '@adonisjs/lucid/orm'
import type { HasMany, BelongsTo } from '@adonisjs/lucid/types/relations'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import { ProductSchema } from '#database/schema'
import { ApiProperty } from '@foadonis/openapi/decorators'
import OrderItem from '#models/order_item'
import Category from '#models/category'
import ProductImage from '#models/product_image'
import ProductReview from '#models/product_review'

export default class Product extends ProductSchema {
  @ApiProperty()
  declare id: number

  @ApiProperty()
  declare name: string

  @ApiProperty()
  declare slug: string

  @ApiProperty()
  declare basePrice: string

  @ApiProperty()
  declare shortDescription: string | null

  @ApiProperty()
  declare thumbnailUrl: string | null

  @ApiProperty()
  declare totalReviews: number | null

  @ApiProperty()
  declare averageRating: string | null
  @belongsTo(() => Category)
  declare category: BelongsTo<typeof Category>

  @hasMany(() => ProductImage)
  declare images: HasMany<typeof ProductImage>

  @hasMany(() => OrderItem)
  declare orderItems: HasMany<typeof OrderItem>

  @hasMany(() => ProductReview)
  declare reviews: HasMany<typeof ProductReview>

  @beforeFind()
  static ignoreDeletedFind(query: ModelQueryBuilderContract<typeof Product, Product>) {
    query.whereNull(`${query.model.table}.deleted_at`)
  }

  @beforeFetch()
  static ignoreDeletedFetch(query: ModelQueryBuilderContract<typeof Product, Product>) {
    query.whereNull(`${query.model.table}.deleted_at`)
  }
}
