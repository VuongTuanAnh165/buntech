import { type LucidModel } from '@adonisjs/lucid/types/model'

export default class BaseService<T extends LucidModel> {
  protected model: T

  constructor(model: T) {
    this.model = model
  }

  /**
   * Phân trang cơ bản
   */
  public async paginate(page: number = 1, limit: number = 10, queryBuilder?: any) {
    const query = queryBuilder ? queryBuilder : this.model.query()

    // Tự động filter các bản ghi chưa bị xóa mềm nếu Model có hỗ trợ
    if (this.model.$hasColumn('deletedAt')) {
      query.whereNull('deleted_at')
    }

    return await query.paginate(page, limit)
  }

  /**
   * Lấy chi tiết bằng ID
   */
  public async findById(id: number) {
    const query = this.model.query().where('id', id)

    if (this.model.$hasColumn('deletedAt')) {
      query.whereNull('deleted_at')
    }

    return await query.first()
  }

  /**
   * Xóa mềm
   */
  public async softDelete(id: number, deletedBy?: number) {
    const record = await this.model.find(id)
    if (!record) return false

    // Nếu Model có cột deleted_at
    if ('deletedAt' in record) {
      record.merge({ deletedAt: new Date() } as any) // Note: luxon DateTime handling might be needed depending on the exact column config

      // Nếu Model có cập nhật người xóa (nếu có cột deleted_by, ở đây ta dùng updated_by tạm)
      if (deletedBy && 'updatedBy' in record) {
        record.merge({ updatedBy: deletedBy } as any)
      }

      await record.save()
      return true
    }

    return false
  }
}
