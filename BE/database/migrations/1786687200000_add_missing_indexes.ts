import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // IDX-01 + IDX-02: Composite index cho Dashboard + Order List queries
    // Covers: .where('status', ...) AND .where('created_at', '>=', ...)
    this.schema.alterTable('orders', (table) => {
      table.index(['status', 'created_at'], 'idx_orders_status_created_at')
      table.index(['created_at'], 'idx_orders_created_at')
    })

    // IDX-03 + IDX-04: Inventory filtering + daily aggregation
    // Covers: .where('type', ...) AND .where('created_at', '>=', ...)
    this.schema.alterTable('inventory_logs', (table) => {
      table.index(['type', 'created_at'], 'idx_inventory_logs_type_created_at')
    })

    // IDX-05: Unique constraint cho customer prices (user_id, product_id)
    // Prevents duplicate pricing records for same customer + product
    this.schema.alterTable('customer_prices', (table) => {
      table.unique(['user_id', 'product_id'], 'uq_customer_prices_user_product')
    })

    // IDX-06: Transaction date sorting + range filtering
    this.schema.alterTable('transactions', (table) => {
      table.index(['transaction_date'], 'idx_transactions_date')
    })
  }

  async down() {
    this.schema.alterTable('orders', (table) => {
      table.dropIndex([], 'idx_orders_status_created_at')
      table.dropIndex([], 'idx_orders_created_at')
    })

    this.schema.alterTable('inventory_logs', (table) => {
      table.dropIndex([], 'idx_inventory_logs_type_created_at')
    })

    this.schema.alterTable('customer_prices', (table) => {
      table.dropUnique([], 'uq_customer_prices_user_product')
    })

    this.schema.alterTable('transactions', (table) => {
      table.dropIndex([], 'idx_transactions_date')
    })
  }
}
