import { BlogCategorySchema } from '#database/schema'
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Post from '#models/post'

export default class BlogCategory extends BlogCategorySchema {
  @hasMany(() => Post)
  declare posts: HasMany<typeof Post>
}
