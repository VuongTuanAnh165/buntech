import { hasMany, beforeFind, beforeFetch } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import { CategorySchema } from '#database/schema'
import Product from '#models/product'

export default class Category extends CategorySchema {
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
