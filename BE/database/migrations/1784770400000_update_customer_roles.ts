import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected userTableName = 'users'
  protected profileTableName = 'user_profiles'

  async up() {
    // 1. Thêm cột customer_type vào user_profiles
    this.schema.alterTable(this.profileTableName, (table) => {
      table.string('customer_type', 50).nullable().defaultTo('retail')
    })

    // 2. Chuyển đổi Data (Raw SQL để đảm bảo nguyên tử và nhanh)
    this.defer(async (db) => {
      await db.rawQuery(`
        UPDATE user_profiles up
        JOIN users u ON u.id = up.user_id
        SET up.customer_type = 'wholesale'
        WHERE u.role = 'wholesale'
      `)

      // 3. Gộp toàn bộ role wholesale/retail thành customer
      await db.rawQuery(`
        UPDATE users
        SET role = 'customer'
        WHERE role IN ('wholesale', 'retail')
      `)
    })
  }

  async down() {
    // Phục hồi lại dữ liệu cũ khi có sự cố
    this.defer(async (db) => {
      await db.rawQuery(`
        UPDATE users u
        JOIN user_profiles up ON u.id = up.user_id
        SET u.role = 'wholesale'
        WHERE up.customer_type = 'wholesale' AND u.role = 'customer'
      `)
    })

    // Xóa cột customer_type
    this.schema.alterTable(this.profileTableName, (table) => {
      table.dropColumn('customer_type')
    })
  }
}
