import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'posts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('blog_category_id')
        .unsigned()
        .references('id')
        .inTable('blog_categories')
        .onDelete('SET NULL')
        .index()
      table
        .integer('author_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
        .index()
      table.string('title', 255).notNullable()
      table.string('slug', 255).notNullable().unique()
      table.text('thumbnail_url').nullable()
      table.text('content').nullable()
      table.string('meta_title', 60).nullable()
      table.string('meta_description', 160).nullable()
      table.boolean('is_published').defaultTo(false).index()
      table.timestamp('published_at').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
      table.timestamp('deleted_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
