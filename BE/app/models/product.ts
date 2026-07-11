import { column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import AppBaseModel from '#models/app_base_model'
import OrderItem from '#models/order_item'

export default class Product extends AppBaseModel {
  @column({ isPrimary: true })
  declare id: number

  @hasMany(() => OrderItem)
  declare orderItems: HasMany<typeof OrderItem>
}
