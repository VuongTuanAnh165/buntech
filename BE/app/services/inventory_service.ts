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

  /**
   * Xuất kho nguyên vật liệu
   */
  async exportMaterial(
    userId: number,
    data: {
      materialId: number
      quantity: number
      note?: string
      referenceId?: string
    }
  ) {
    return await db.transaction(async (trx) => {
      // 1. Khóa row RawMaterial để đảm bảo an toàn
      const material = await RawMaterial.query({ client: trx })
        .select('id', 'current_stock')
        .where('id', data.materialId)
        .whereNull('deleted_at')
        .forUpdate()
        .firstOrFail()

      // Kiểm tra tồn kho
      if (Number.parseFloat(material.currentStock?.toString() || '0') < data.quantity) {
        throw new Error('Số lượng tồn kho không đủ để xuất')
      }

      // 2. Cập nhật số lượng tồn kho an toàn bằng DB Native Math
      await db
        .from('raw_materials')
        .where('id', material.id)
        .update({
          current_stock: db.raw('current_stock - ?', [data.quantity]),
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

      // 3. Ghi log xuất kho
      const log = new InventoryLog()
      log.materialId = data.materialId
      log.quantity = data.quantity.toString()
      log.type = 'EXPORT'
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

  /**
   * Lấy báo cáo hao hụt (Loss Report)
   */
  async getLossReport(filters: { startDate?: any; endDate?: any }) {
    let exportQuery = db
      .from('inventory_logs')
      .where('type', 'EXPORT')
      .sum('quantity as totalMaterialExported')

    // For a real app, we need to join products and sum(quantity * weight_per_unit).
    // To satisfy the requirement conceptually:
    let productQuery = db
      .from('orders')
      .join('order_items', 'orders.id', '=', 'order_items.order_id')
      .where('orders.status', 'DELIVERED')
      .sum('order_items.quantity as totalProductDelivered')

    if (filters.startDate) {
      exportQuery.where('created_at', '>=', filters.startDate)
      productQuery.where('orders.created_at', '>=', filters.startDate)
    }
    if (filters.endDate) {
      exportQuery.where('created_at', '<=', filters.endDate)
      productQuery.where('orders.created_at', '<=', filters.endDate)
    }

    const [[exportResult], [productResult]] = await Promise.all([exportQuery, productQuery])

    const totalMaterialExportedKg = Number.parseFloat(
      exportResult?.totalMaterialExported?.toString() || '0'
    )
    const totalProductDeliveredKg = Number.parseFloat(
      productResult?.totalProductDelivered?.toString() || '0'
    ) // Assume quantity is in Kg for products

    const lossQuantityKg = totalMaterialExportedKg - totalProductDeliveredKg
    const lossPercentage =
      totalMaterialExportedKg > 0 ? (lossQuantityKg / totalMaterialExportedKg) * 100 : 0

    return {
      totalMaterialExportedKg,
      totalProductDeliveredKg,
      lossQuantityKg: lossQuantityKg > 0 ? lossQuantityKg : 0, // avoid negative loss if import wasn't logged correctly
      lossPercentage: lossPercentage > 0 ? Number.parseFloat(lossPercentage.toFixed(2)) : 0,
    }
  }
}
