import Category from '#models/category'
import { DateTime } from 'luxon'
import type { Infer } from '@vinejs/vine/types'
import { type createCategoryValidator, type updateCategoryValidator } from '#validators/category'
import { Pagination } from '#enums/pagination'
import FileUploadService from '#services/file_upload_service'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'

type CreateCategoryDTO = Infer<typeof createCategoryValidator>
type UpdateCategoryDTO = Infer<typeof updateCategoryValidator>

@inject()
export default class CategoryService {
  constructor(protected fileUploadService: FileUploadService) {}

  /**
   * Lấy danh sách phân trang (Cho Admin)
   */
  async paginate(page: number = 1, limit: number = 10) {
    const safeLimit = Math.min(limit, Pagination.MAX_LIMIT)
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
    return await Category.query()
      .select(
        'id',
        'name',
        'slug',
        'thumbnail_url',
        'description',
        'meta_title',
        'meta_description',
        'created_at',
        'updated_at'
      )
      .where('id', id)
      .firstOrFail()
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
  async create(data: CreateCategoryDTO, userId: number) {
    const { thumbnail, ...categoryData } = data
    let thumbnailUrl: string | undefined
    let newKey: string | undefined

    if (thumbnail) {
      const uploadResult = await this.fileUploadService.upload(thumbnail, 'categories')
      thumbnailUrl = uploadResult.url
      newKey = uploadResult.key
    }

    try {
      const category = await Category.create({
        ...categoryData,
        thumbnailUrl,
        createdBy: userId,
        updatedBy: userId,
      })

      return category
    } catch (error) {
      logger.error({ err: error }, 'Tạo danh mục thất bại')
      if (newKey) {
        await this.fileUploadService.delete(newKey)
      }
      throw error
    }
  }

  /**
   * Cập nhật
   */
  async update(id: number, data: UpdateCategoryDTO, userId: number) {
    const category = await Category.query()
      .select('id', 'thumbnail_url')
      .where('id', id)
      .firstOrFail()
    const { thumbnail, ...categoryData } = data

    let thumbnailUrl: string | undefined
    let oldKeyToDelete: string | null = null
    let newKey: string | undefined

    if (thumbnail) {
      const uploadResult = await this.fileUploadService.upload(thumbnail, 'categories')
      thumbnailUrl = uploadResult.url
      newKey = uploadResult.key

      // Đánh dấu file cũ để xóa sau khi DB save thành công
      oldKeyToDelete = this.fileUploadService.extractKeyFromUrl(category.thumbnailUrl, 'categories')
    }

    try {
      category.merge({
        ...categoryData,
        thumbnailUrl: thumbnailUrl || category.thumbnailUrl,
        updatedBy: userId,
      })

      await category.save()

      // Xóa file cũ sau khi commit DB thành công
      if (oldKeyToDelete) {
        await this.fileUploadService.delete(oldKeyToDelete)
      }

      return category
    } catch (error) {
      logger.error({ err: error }, 'Cập nhật danh mục thất bại')
      if (newKey) {
        await this.fileUploadService.delete(newKey)
      }
      throw error
    }
  }

  /**
   * Xóa (Soft Delete)
   */
  async delete(id: number, userId: number) {
    const category = await Category.query().select('id').where('id', id).firstOrFail()
    category.deletedAt = DateTime.now()
    category.updatedBy = userId
    await category.save()
  }
}
