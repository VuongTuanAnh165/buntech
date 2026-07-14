import Category from '#models/category'
import drive from '@adonisjs/drive/services/main'
import { randomUUID } from 'node:crypto'
import { DateTime } from 'luxon'
import type { Infer } from '@vinejs/vine/types'
import { type createCategoryValidator, type updateCategoryValidator } from '#validators/category'

type CreateCategoryDTO = Infer<typeof createCategoryValidator>
type UpdateCategoryDTO = Infer<typeof updateCategoryValidator>

export default class CategoryService {
  /**
   * Lấy danh sách phân trang (Cho Admin)
   */
  async paginate(page: number = 1, limit: number = 10) {
    const safeLimit = Math.min(limit, 100)
    return await Category.query()
      .select('id', 'name', 'slug', 'thumbnailUrl', 'createdAt', 'updatedAt')
      .paginate(page, safeLimit)
  }

  /**
   * Lấy danh sách không phân trang hoặc phân trang cho Client (FE)
   */
  async clientList() {
    return await Category.query()
      .select('id', 'name', 'slug', 'thumbnailUrl', 'description', 'metaTitle', 'metaDescription')
      .orderBy('name', 'asc')
  }

  /**
   * Lấy chi tiết bằng ID
   */
  async findById(id: number) {
    return await Category.findOrFail(id)
  }

  /**
   * Lấy chi tiết bằng ID (Client SEO)
   */
  async findByIdForClient(id: number) {
    return await Category.query()
      .select('id', 'name', 'slug', 'thumbnailUrl', 'description', 'metaTitle', 'metaDescription')
      .where('id', id)
      .firstOrFail()
  }

  /**
   * Tạo mới
   */
  async create(data: CreateCategoryDTO, userId?: number) {
    const { thumbnail, ...categoryData } = data
    let thumbnailUrl: string | undefined

    if (thumbnail) {
      const key = `categories/${randomUUID()}.${thumbnail.extname}`
      await thumbnail.moveToDisk(key)
      thumbnailUrl = await drive.use().getUrl(key)
    }

    const category = await Category.create({
      ...categoryData,
      thumbnailUrl,
      createdBy: userId,
      updatedBy: userId,
    })

    return category
  }

  /**
   * Cập nhật
   */
  async update(id: number, data: UpdateCategoryDTO, userId?: number) {
    const category = await this.findById(id)
    const { thumbnail, ...categoryData } = data

    let thumbnailUrl: string | undefined
    let oldKeyToDelete: string | undefined

    if (thumbnail) {
      const key = `categories/${randomUUID()}.${thumbnail.extname}`
      await thumbnail.moveToDisk(key)
      thumbnailUrl = await drive.use().getUrl(key)

      // Đánh dấu file cũ để xóa sau khi DB save thành công
      if (category.thumbnailUrl && category.thumbnailUrl.includes('categories/')) {
        oldKeyToDelete = category.thumbnailUrl.substring(
          category.thumbnailUrl.indexOf('categories/')
        )
      }
    }

    category.merge({
      ...categoryData,
      thumbnailUrl: thumbnailUrl || category.thumbnailUrl,
      updatedBy: userId,
    })

    await category.save()

    // Xóa file cũ sau khi commit DB thành công
    if (oldKeyToDelete) {
      await drive
        .use()
        .delete(oldKeyToDelete)
        .catch(() => {})
    }

    return category
  }

  /**
   * Xóa (Soft Delete)
   */
  async delete(id: number, userId?: number) {
    const category = await this.findById(id)
    category.deletedAt = DateTime.now()
    if (userId) {
      category.updatedBy = userId
    }
    await category.save()
  }
}
