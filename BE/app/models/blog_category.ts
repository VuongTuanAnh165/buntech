import { BlogCategorySchema } from '#database/schema'
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { ApiProperty } from '@foadonis/openapi/decorators'
import Post from '#models/post'

export default class BlogCategory extends BlogCategorySchema {
  @ApiProperty()
  declare id: number

  @ApiProperty()
  declare name: string

  @ApiProperty()
  declare slug: string

  @ApiProperty()
  declare description: string | null
  @hasMany(() => Post)
  declare posts: HasMany<typeof Post>
}
