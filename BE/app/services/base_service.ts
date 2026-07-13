import { type LucidModel } from '@adonisjs/lucid/types/model'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import { DateTime } from 'luxon'
export default class BaseService<T extends LucidModel> {
  protected model: T

  constructor(model: T) {
    this.model = model
  }

  /**
   * Phân trang cơ bản
   */
  public async paginate(
    page: number = 1,
    limit: number = 10,
    queryBuilder?: ModelQueryBuilderContract<T, InstanceType<T>>
  ) {
    const query = queryBuilder ? queryBuilder : this.model.query()

    // Giới hạn max limit = 100 để tránh sập RAM
    const safeLimit = Math.min(limit, 100)

    return await query.paginate(page, safeLimit)
  }

  /**
   * Lấy chi tiết bằng ID
   */
  public async findById(id: number) {
    const query = this.model.query().where('id', id)
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
      // @ts-expect-error - Dynamically checked above
      record.merge({ deletedAt: DateTime.now() })

      // Nếu Model có cập nhật người xóa (nếu có cột deleted_by, ở đây ta dùng updated_by tạm)
      if (deletedBy && 'updatedBy' in record) {
        // @ts-expect-error - Dynamically checked above
        record.merge({ updatedBy: deletedBy })
      }

      await record.save()
      return true
    }

    return false
  }
}
