import { column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { OrderSchema } from '#database/schema'
import User from '#models/user'
import OrderItem from '#models/order_item'
import Address from '#models/address'

export default class Order extends OrderSchema {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => OrderItem)
  declare items: HasMany<typeof OrderItem>

  @belongsTo(() => User, { foreignKey: 'driverId' })
  declare driver: BelongsTo<typeof User>

  @belongsTo(() => Address, { foreignKey: 'shippingAddressId' })
  declare shippingAddress: BelongsTo<typeof Address>
}
