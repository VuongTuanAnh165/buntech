import RawMaterial from '#models/raw_material'
import InventoryLog from '#models/inventory_log'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export default class InventoryService {
  /**
   * Nhập kho nguyên vật liệu
   */
  async importMaterial(
    userId: number,
    data: {
      materialId: number
      quantity: number
      note?: string
      referenceId?: string
    }
  ) {
    return await db.transaction(async (trx) => {
      // 1. Khóa row RawMaterial để đảm bảo cộng dồn an toàn
      const material = await RawMaterial.query({ client: trx })
        .select('id', 'current_stock')
        .where('id', data.materialId)
        .whereNull('deleted_at')
        .forUpdate()
        .firstOrFail()

      // 2. Cập nhật số lượng tồn kho
      const currentStock = Number.parseFloat(material.currentStock || '0')
      const newStock = currentStock + data.quantity

      material.currentStock = newStock.toString()
      material.updatedBy = userId
      material.useTransaction(trx)
      await material.save()

      // 3. Ghi log nhập kho
      const log = new InventoryLog()
      log.materialId = data.materialId
      log.quantity = data.quantity.toString()
      log.type = 'IMPORT'
      log.note = data.note || null
      log.referenceId = data.referenceId || null
      log.date = DateTime.now()
      log.createdBy = userId
      log.useTransaction(trx)
      await log.save()

      return {
        material,
        log,
      }
    })
  }
}
