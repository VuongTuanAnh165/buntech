import { PostSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import BlogCategory from '#models/blog_category'
import User from '#models/user'

export default class Post extends PostSchema {
  @belongsTo(() => BlogCategory)
  declare category: BelongsTo<typeof BlogCategory>

  @belongsTo(() => User, { foreignKey: 'authorId' })
  declare author: BelongsTo<typeof User>
}
