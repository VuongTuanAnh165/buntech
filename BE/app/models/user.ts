import AppBaseModel from '#models/app_base_model'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { type AccessToken, DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Order from '#models/order'

export default class User extends compose(AppBaseModel, withAuthFinder(hash)) {
  static accessTokens = DbAccessTokensProvider.forModel(User)
  declare currentAccessToken?: AccessToken

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare phoneNumber: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare fullName: string

  @column()
  declare role: string

  @hasMany(() => Order)
  declare orders: HasMany<typeof Order>

  get initials() {
    const name = this.fullName || 'User'
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase()
    }
    return `${name.slice(0, 2)}`.toUpperCase()
  }
}
