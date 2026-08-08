import { column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import AppBaseModel from '#models/app_base_model'
import User from '#models/user'

export default class RefreshToken extends AppBaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare token: string

  @column.dateTime()
  declare expiresAt: DateTime

  @column()
  declare isRevoked: boolean

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
