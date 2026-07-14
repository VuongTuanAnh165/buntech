import { PostSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { ApiProperty } from '@foadonis/openapi/decorators'
import BlogCategory from '#models/blog_category'
import User from '#models/user'

export default class Post extends PostSchema {
  @ApiProperty()
  declare id: number

  @ApiProperty()
  declare title: string

  @ApiProperty()
  declare slug: string

  @ApiProperty()
  declare thumbnailUrl: string | null

  @ApiProperty()
  declare content: string | null

  @ApiProperty()
  declare isPublished: boolean | null
  @belongsTo(() => BlogCategory)
  declare category: BelongsTo<typeof BlogCategory>

  @belongsTo(() => User, { foreignKey: 'authorId' })
  declare author: BelongsTo<typeof User>
}
