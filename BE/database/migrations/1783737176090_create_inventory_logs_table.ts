import { BaseSchema } from '@adonisjs/lucid/schema'
import { InventoryType } from '#enums/inventory_type'

export default class extends BaseSchema {
  protected tableName = 'inventory_logs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('material_id')
        .unsigned()
        .references('id')
        .inTable('raw_materials')
        .onDelete('CASCADE')
        .index()
      table.enum('type', Object.values(InventoryType)).notNullable()
      table.decimal('quantity', 10, 2).notNullable()
      table.string('reference_id', 100).nullable()
      table.timestamp('date').notNullable()
      table.text('note').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
      table.timestamp('deleted_at').nullable()
      table.integer('created_by').unsigned().nullable()
      table.integer('updated_by').unsigned().nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
