import { TransactionSchema } from '#database/schema'

import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { belongsTo } from '@adonisjs/lucid/orm'
import User from './user.js'

export default class Transaction extends TransactionSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
