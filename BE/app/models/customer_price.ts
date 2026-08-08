import { CustomerPriceSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Product from '#models/product'
import User from '#models/user'

export default class CustomerPrice extends CustomerPriceSchema {
  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
