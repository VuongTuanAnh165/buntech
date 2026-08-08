import { BaseModel, column, beforeFind, beforeFetch } from '@adonisjs/lucid/orm'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import { DateTime } from 'luxon'

export default class AppBaseModel extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime({ serializeAs: null })
  declare deletedAt: DateTime | null

  @column({ serializeAs: null })
  declare createdBy: number | null

  @column({ serializeAs: null })
  declare updatedBy: number | null

  /**
   * Tự động ẩn các bản ghi đã xóa mềm khi query
   */
  @beforeFind()
  static ignoreDeletedFind(query: ModelQueryBuilderContract<typeof AppBaseModel, AppBaseModel>) {
    query.whereNull(`${query.model.table}.deleted_at`)
  }

  @beforeFetch()
  static ignoreDeletedFetch(query: ModelQueryBuilderContract<typeof AppBaseModel, AppBaseModel>) {
    query.whereNull(`${query.model.table}.deleted_at`)
  }
}
