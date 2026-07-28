import { inject } from '@adonisjs/core'
import RawMaterial from '#models/raw_material'
import InventoryLog from '#models/inventory_log'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

@inject()
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

      // 2. Cập nhật số lượng tồn kho an toàn bằng DB Native Math
      await db
        .from('raw_materials')
        .where('id', material.id)
        .update({
          current_stock: db.raw('current_stock + ?', [data.quantity]),
          updated_by: userId,
          updated_at: DateTime.now().toSQL(),
        })
        .useTransaction(trx)

      const updatedMaterial = await RawMaterial.query({ client: trx })
        .select('current_stock')
        .where('id', material.id)
        .firstOrFail()

      material.currentStock = updatedMaterial.currentStock
      material.updatedBy = userId

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
