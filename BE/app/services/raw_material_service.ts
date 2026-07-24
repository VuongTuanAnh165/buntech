import RawMaterial from '#models/raw_material'
import { DateTime } from 'luxon'
import { Pagination } from '#enums/pagination'

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
      .whereNull('deleted_at')
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
      .whereNull('deleted_at')
      .firstOrFail()
  }

  /**
   * Tạo mới nguyên vật liệu
   */
  async createRawMaterial(data: { name: string; unit: string; currentStock?: number }) {
    const rawMaterial = new RawMaterial()
    rawMaterial.name = data.name
    rawMaterial.unit = data.unit
    rawMaterial.currentStock = data.currentStock?.toString() || '0'
    await rawMaterial.save()
    return rawMaterial
  }

  /**
   * Cập nhật nguyên vật liệu
   */
  async updateRawMaterial(
    id: number,
    data: { name?: string; unit?: string; currentStock?: number }
  ) {
    const rawMaterial = await this.getRawMaterial(id)

    if (data.name !== undefined) rawMaterial.name = data.name
    if (data.unit !== undefined) rawMaterial.unit = data.unit
    if (data.currentStock !== undefined) rawMaterial.currentStock = data.currentStock.toString()

    await rawMaterial.save()
    return rawMaterial
  }

  /**
   * Xóa mềm (Soft delete) nguyên vật liệu
   */
  async deleteRawMaterial(id: number) {
    const rawMaterial = await this.getRawMaterial(id)
    rawMaterial.deletedAt = DateTime.now()
    await rawMaterial.save()
  }
}
