import { hasMany, beforeFind, beforeFetch } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import { CategorySchema } from '#database/schema'
import { ApiProperty } from '@foadonis/openapi/decorators'
import Product from '#models/product'

export default class Category extends CategorySchema {
  @ApiProperty()
  declare id: number

  @ApiProperty()
  declare name: string

  @ApiProperty()
  declare slug: string

  @ApiProperty()
  declare description: string | null

  @ApiProperty()
  declare thumbnailUrl: string | null
  @hasMany(() => Product)
  declare products: HasMany<typeof Product>

  @beforeFind()
  static ignoreDeletedFind(query: ModelQueryBuilderContract<typeof Category, Category>) {
    query.whereNull(`${query.model.table}.deleted_at`)
  }

  @beforeFetch()
  static ignoreDeletedFetch(query: ModelQueryBuilderContract<typeof Category, Category>) {
    query.whereNull(`${query.model.table}.deleted_at`)
  }
}
