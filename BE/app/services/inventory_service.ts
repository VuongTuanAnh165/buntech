import { inject } from '@adonisjs/core'
import RawMaterial from '#models/raw_material'
import InventoryLog from '#models/inventory_log'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { InventoryType } from '#enums/inventory_type'
import { Pagination, getSafeLimit } from '#enums/pagination'

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
      log.type = InventoryType.IN
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
      log.type = InventoryType.OUT
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
  async getLossReport(filters: { startDate?: DateTime; endDate?: DateTime }) {
    let exportDailyQuery = db
      .from('inventory_logs')
      .where('type', InventoryType.OUT)
      .select(db.raw('DATE(created_at) as date'))
      .sum('quantity as totalMaterialExported')
      .groupByRaw('DATE(created_at)')
      .orderBy('date', 'asc')

    // For a real app, we need to join products and sum(quantity * weight_per_unit).
    // To satisfy the requirement conceptually:
    let productDailyQuery = db
      .from('orders')
      .join('order_items', 'orders.id', '=', 'order_items.order_id')
      .where('orders.status', 'DELIVERED')
      .select(db.raw('DATE(orders.created_at) as date'))
      .sum('order_items.quantity as totalProductDelivered')
      .groupByRaw('DATE(orders.created_at)')
      .orderBy('date', 'asc')

    if (filters.startDate) {
      exportDailyQuery.where('created_at', '>=', filters.startDate.toSQLDate()!)
      productDailyQuery.where('orders.created_at', '>=', filters.startDate.toSQLDate()!)
    }
    if (filters.endDate) {
      exportDailyQuery.where('created_at', '<=', filters.endDate.toSQLDate()!)
      productDailyQuery.where('orders.created_at', '<=', filters.endDate.toSQLDate()!)
    }

    const [exportDaily, productDaily] = await Promise.all([exportDailyQuery, productDailyQuery])

    // Merge by date
    interface DailyLossEntry {
      date: string
      exported: number
      delivered: number
      loss: number
      lossPercentage: number
    }
    const dailyMap = new Map<string, DailyLossEntry>()
    let totalMaterialExportedKg = 0
    let totalProductDeliveredKg = 0

    for (const row of exportDaily) {
      const dateStr =
        row.date instanceof Date
          ? row.date.toISOString().slice(0, 10)
          : String(row.date).slice(0, 10)
      const qty = Number.parseFloat(row.totalMaterialExported?.toString() || '0')
      totalMaterialExportedKg += qty
      dailyMap.set(dateStr, {
        date: dateStr,
        exported: qty,
        delivered: 0,
        loss: 0,
        lossPercentage: 0,
      })
    }

    for (const row of productDaily) {
      const dateStr =
        row.date instanceof Date
          ? row.date.toISOString().slice(0, 10)
          : String(row.date).slice(0, 10)
      const qty = Number.parseFloat(row.totalProductDelivered?.toString() || '0')
      totalProductDeliveredKg += qty
      if (!dailyMap.has(dateStr)) {
        dailyMap.set(dateStr, {
          date: dateStr,
          exported: 0,
          delivered: 0,
          loss: 0,
          lossPercentage: 0,
        })
      }
      dailyMap.get(dateStr)!.delivered = qty
    }

    // Calculate loss per day
    const dailyTrends = Array.from(dailyMap.values())
      .map((day) => {
        const lossQty = day.exported - day.delivered
        day.loss = lossQty > 0 ? lossQty : 0
        day.lossPercentage =
          day.exported > 0 ? Number.parseFloat(((day.loss / day.exported) * 100).toFixed(2)) : 0
        return day
      })
      .sort((a, b) => a.date.localeCompare(b.date))

    const lossQuantityKg = totalMaterialExportedKg - totalProductDeliveredKg
    const lossPercentage =
      totalMaterialExportedKg > 0 ? (lossQuantityKg / totalMaterialExportedKg) * 100 : 0

    return {
      totalMaterialExportedKg,
      totalProductDeliveredKg,
      lossQuantityKg: lossQuantityKg > 0 ? lossQuantityKg : 0, // avoid negative loss if import wasn't logged correctly
      lossPercentage: lossPercentage > 0 ? Number.parseFloat(lossPercentage.toFixed(2)) : 0,
      dailyTrends,
    }
  }

  /**
   * Lấy lịch sử giao dịch kho
   */
  async getHistory(page: number = 1, limit: number = Pagination.DEFAULT_LIMIT) {
    const safeLimit = getSafeLimit(limit)
    return InventoryLog.query()
      .select(
        'id',
        'material_id',
        'type',
        'quantity',
        'reference_id',
        'date',
        'note',
        'created_by',
        'created_at'
      )
      .preload('rawMaterial', (query) => {
        query.select('id', 'name', 'unit')
      })
      .orderBy('created_at', 'desc')
      .paginate(page, safeLimit)
  }
}
