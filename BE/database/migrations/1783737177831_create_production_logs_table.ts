import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'production_logs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.date('date').notNullable()
      table.integer('material_id').unsigned().references('id').inTable('raw_materials').onDelete('CASCADE')
      table.decimal('material_used_qty', 10, 2).notNullable()
      table.integer('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE')
      table.decimal('product_yield_qty', 10, 2).notNullable()
      table.decimal('waste_percentage', 5, 2).notNullable()

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