import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'master_data'

  async up() {
    // Hard delete all previously soft-deleted records to maintain data integrity
    await this.db.from('categories').whereNotNull('deleted_at').delete()
    await this.db.from('posts').whereNotNull('deleted_at').delete()
    await this.db.from('raw_materials').whereNotNull('deleted_at').delete()

    this.schema.alterTable('categories', (table) => {
      table.dropColumn('deleted_at')
    })
    this.schema.alterTable('posts', (table) => {
      table.dropColumn('deleted_at')
    })
    this.schema.alterTable('raw_materials', (table) => {
      table.dropColumn('deleted_at')
    })
  }

  async down() {
    this.schema.alterTable('categories', (table) => {
      table.timestamp('deleted_at').nullable()
    })
    this.schema.alterTable('posts', (table) => {
      table.timestamp('deleted_at').nullable()
    })
    this.schema.alterTable('raw_materials', (table) => {
      table.timestamp('deleted_at').nullable()
    })
  }
}
