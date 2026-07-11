import { column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import AppBaseModel from '#models/app_base_model'
import User from '#models/user'
import OrderItem from '#models/order_item'

export default class Order extends AppBaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => OrderItem)
  declare items: HasMany<typeof OrderItem>
}
