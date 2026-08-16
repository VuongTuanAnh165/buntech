import { inject } from '@adonisjs/core'
import RawMaterial from '#models/raw_material'
import { Pagination } from '#enums/pagination'

@inject()
export default class RawMaterialService {
  /**
   * Lấy danh sách nguyên vật liệu
   */
  async getRawMaterials(
    page: number = 1,
    limit: number = Pagination.DEFAULT_LIMIT,
    search?: string
  ) {
    const query = RawMaterial.query()
      .select('id', 'name', 'unit', 'current_stock', 'created_at')
      .orderBy('created_at', 'desc')

    if (search) {
      query.whereILike('name', `%${search}%`)
    }

    const safeLimit = Math.min(limit, Pagination.MAX_LIMIT || 100)
    return query.paginate(page, safeLimit)
  }

  /**
   * Lấy chi tiết nguyên vật liệu
   */
  async getRawMaterial(id: number) {
    return RawMaterial.query()
      .select('id', 'name', 'unit', 'current_stock', 'created_at')
      .where('id', id)
      .firstOrFail()
  }

  /**
   * Tạo mới nguyên vật liệu
   */
  async createRawMaterial(data: { name: string; unit: string }) {
    const rawMaterial = new RawMaterial()
    rawMaterial.name = data.name
    rawMaterial.unit = data.unit
    rawMaterial.currentStock = '0'
    await rawMaterial.save()
    return rawMaterial
  }

  /**
   * Cập nhật nguyên vật liệu
   */
  async updateRawMaterial(id: number, data: { name?: string; unit?: string }) {
    const rawMaterial = await this.getRawMaterial(id)

    if (data.name !== undefined) rawMaterial.name = data.name
    if (data.unit !== undefined) rawMaterial.unit = data.unit

    await rawMaterial.save()
    return rawMaterial
  }

  /**
   * Xóa mềm (Soft delete) nguyên vật liệu
   */
  async deleteRawMaterial(id: number) {
    const rawMaterial = await this.getRawMaterial(id)
    await rawMaterial.delete()
  }
  /**
   * Lấy thống kê kho nguyên liệu
   */
  async getSummary() {
    const rawMaterials = await RawMaterial.query().select('current_stock')

    const totalItems = rawMaterials.length
    const totalQuantity = rawMaterials.reduce(
      (acc, item) => acc + Number(item.currentStock || 0),
      0
    )
    const lowStockItems = rawMaterials.filter((item) => Number(item.currentStock || 0) <= 50).length

    return {
      totalItems,
      totalQuantity,
      lowStockItems,
    }
  }
}
