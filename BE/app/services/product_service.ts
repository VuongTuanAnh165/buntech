import Product from '#models/product'
import ProductImage from '#models/product_image'
import { DateTime } from 'luxon'
import type { Infer } from '@vinejs/vine/types'
import { Pagination } from '#enums/pagination'
import { type createProductValidator, type updateProductValidator } from '#validators/product'
import db from '@adonisjs/lucid/services/db'
import logger from '@adonisjs/core/services/logger'
import FileUploadService from '#services/file_upload_service'
import { inject } from '@adonisjs/core'
import type { MultipartFile } from '@adonisjs/core/bodyparser'

type CreateProductDTO = Infer<typeof createProductValidator>
type UpdateProductDTO = Infer<typeof updateProductValidator>

@inject()
export default class ProductService {
  constructor(protected fileUploadService: FileUploadService) {}

  /**
   * Helper: Xử lý upload ảnh Thumbnail mới và lấy key ảnh cũ để xóa
   */
  private async handleThumbnail(thumbnail: MultipartFile, oldUrl?: string | null) {
    const result = { url: '', newKey: '', oldKeyToDelete: undefined as string | undefined }
    if (oldUrl) {
      const oldThumbKey = this.fileUploadService.extractKeyFromUrl(oldUrl, 'products/thumbnails')
      if (oldThumbKey) result.oldKeyToDelete = oldThumbKey
    }
    const uploadResult = await this.fileUploadService.upload(thumbnail, 'products/thumbnails')
    result.url = uploadResult.url
    result.newKey = uploadResult.key
    return result
  }

  /**
   * Helper: Xử lý upload thư viện ảnh Gallery mới
   */
  private async handleGalleryUpload(images: MultipartFile[], startOrder: number = 1) {
    const result = {
      newKeys: [] as string[],
      records: [] as Array<{ fileUrl: string; displayOrder: number }>,
    }
    const uploadResults = await this.fileUploadService.uploadMany(images, 'products/gallery')
    let order = startOrder
    for (const res of uploadResults) {
      result.newKeys.push(res.key)
      result.records.push({ fileUrl: res.url, displayOrder: order++ })
    }
    return result
  }

  /**
   * Helper: Tìm các key của ảnh cũ chuẩn bị xóa
   */
  private async getOldGalleryKeysToDelete(productId: number, deletedImageIds: number[]) {
    const oldKeys: string[] = []
    const imagesToDelete = await ProductImage.query()
      .where('productId', productId)
      .whereIn('id', deletedImageIds)

    for (const img of imagesToDelete) {
      const oldGalleryKey = this.fileUploadService.extractKeyFromUrl(
        img.fileUrl,
        'products/gallery'
      )
      if (oldGalleryKey) oldKeys.push(oldGalleryKey)
    }
    return oldKeys
  }

  /**
   * Admin: Phân trang danh sách sản phẩm
   */
  async paginate(page: number = 1, limit: number = 10) {
    const safeLimit = Math.min(limit, Pagination.MAX_LIMIT)
    return await Product.query()
      .select(
        'id',
        'name',
        'slug',
        'basePrice',
        'unit',
        'isActive',
        'thumbnailUrl',
        'categoryId',
        'createdAt'
      )
      .preload('category', (q) => q.select('id', 'name', 'slug'))
      .orderBy('id', 'desc')
      .paginate(page, safeLimit)
  }

  /**
   * Client: Phân trang / Lọc sản phẩm
   */
  async clientList(page: number = 1, limit: number = 10, categoryId?: number) {
    const safeLimit = Math.min(limit, Pagination.MAX_LIMIT)
    const query = Product.query()
      .select(
        'id',
        'name',
        'slug',
        'basePrice',
        'unit',
        'thumbnailUrl',
        'shortDescription',
        'categoryId',
        'metaTitle',
        'metaDescription'
      )
      .where('isActive', true)
      .preload('category', (q) => q.select('id', 'name', 'slug'))
      .orderBy('id', 'desc')

    if (categoryId) {
      query.where('categoryId', categoryId)
    }

    return await query.paginate(page, safeLimit)
  }

  /**
   * Admin: Tìm chi tiết bằng ID
   */
  async findById(id: number) {
    return await Product.query()
      .where('id', id)
      .preload('category', (q) => q.select('id', 'name'))
      .preload('images', (q) => q.orderBy('displayOrder', 'asc'))
      .firstOrFail()
  }

  /**
   * Client: Tìm chi tiết bằng ID (Chuẩn SEO SSR)
   */
  async findByIdForClient(id: number) {
    return await Product.query()
      .where('id', id)
      .where('isActive', true)
      .preload('category', (q) => q.select('id', 'name', 'slug'))
      .preload('images', (q) => q.orderBy('displayOrder', 'asc').select('id', 'fileUrl', 'altText'))
      .firstOrFail()
  }

  /**
   * Tạo mới sản phẩm
   */
  async create(data: CreateProductDTO, userId?: number) {
    const { thumbnail, images, ...productData } = data

    let thumbnailUrl: string | undefined
    const newFileKeys: string[] = []
    let imageRecordsData: Array<{ fileUrl: string; displayOrder: number }> = []

    // 1. Upload ALL files BEFORE transaction
    if (thumbnail) {
      const thumb = await this.handleThumbnail(thumbnail)
      thumbnailUrl = thumb.url
      newFileKeys.push(thumb.newKey)
    }

    if (images && images.length > 0) {
      const gallery = await this.handleGalleryUpload(images)
      newFileKeys.push(...gallery.newKeys)
      imageRecordsData = gallery.records
    }

    const trx = await db.transaction()
    try {
      // 2. Tạo product trong DB
      const { basePrice, ...restData } = productData
      const product = await Product.create(
        {
          ...restData,
          basePrice: String(basePrice),
          thumbnailUrl,
          createdBy: userId,
          updatedBy: userId,
        },
        { client: trx }
      )

      // 3. Lưu Gallery images trong DB
      if (imageRecordsData.length > 0) {
        const records = imageRecordsData.map((r) => ({ ...r, productId: product.id }))
        await ProductImage.createMany(records, { client: trx })
      }

      await trx.commit()
      return product
    } catch (error) {
      await trx.rollback()
      // Rollback files on disk
      if (newFileKeys.length > 0) {
        await this.fileUploadService.deleteMany(newFileKeys)
      }
      logger.error({ err: error }, 'Tạo sản phẩm thất bại')
      throw error
    }
  }

  /**
   * Cập nhật sản phẩm
   */
  async update(id: number, data: UpdateProductDTO, userId?: number) {
    const product = await Product.findOrFail(id)
    const { thumbnail, images, deletedImageIds, imageOrders, ...productData } = data

    let thumbnailUrl: string | undefined
    const newFileKeys: string[] = []
    const oldKeysToDelete: string[] = []
    let imageRecordsData: Array<{ fileUrl: string; displayOrder: number }> = []

    // 1. Upload New Thumbnail
    if (thumbnail) {
      const thumb = await this.handleThumbnail(thumbnail, product.thumbnailUrl)
      thumbnailUrl = thumb.url
      newFileKeys.push(thumb.newKey)
      if (thumb.oldKeyToDelete) oldKeysToDelete.push(thumb.oldKeyToDelete)
    }

    // 2. Query old images to delete BEFORE transaction so we can get their keys
    if (deletedImageIds && deletedImageIds.length > 0) {
      const oldKeys = await this.getOldGalleryKeysToDelete(product.id, deletedImageIds)
      oldKeysToDelete.push(...oldKeys)
    }

    // 3. Upload New Gallery Images
    if (images && images.length > 0) {
      const maxOrderRecord = await ProductImage.query()
        .where('productId', product.id)
        .orderBy('displayOrder', 'desc')
        .first()
      const startOrder = maxOrderRecord?.displayOrder ? maxOrderRecord.displayOrder + 1 : 1

      const gallery = await this.handleGalleryUpload(images, startOrder)
      newFileKeys.push(...gallery.newKeys)
      imageRecordsData = gallery.records
    }

    const trx = await db.transaction()
    try {
      // 4. DB Updates
      const { basePrice, ...restData } = productData
      product.merge({
        ...restData,
        ...(basePrice !== undefined ? { basePrice: String(basePrice) } : {}),
        thumbnailUrl: thumbnailUrl || product.thumbnailUrl,
        updatedBy: userId,
      })
      product.useTransaction(trx)
      await product.save()

      if (deletedImageIds && deletedImageIds.length > 0) {
        await ProductImage.query({ client: trx })
          .where('productId', product.id)
          .whereIn('id', deletedImageIds)
          .delete()
      }

      if (imageRecordsData.length > 0) {
        const records = imageRecordsData.map((r) => ({ ...r, productId: product.id }))
        await ProductImage.createMany(records, { client: trx })
      }

      if (imageOrders && imageOrders.length > 0) {
        for (const item of imageOrders) {
          await ProductImage.query({ client: trx })
            .where('id', item.id)
            .where('productId', product.id)
            .update({ displayOrder: item.order })
        }
      }

      await trx.commit()

      // AFTER Commit, delete old files
      if (oldKeysToDelete.length > 0) {
        await this.fileUploadService.deleteMany(oldKeysToDelete)
      }

      return product
    } catch (error) {
      await trx.rollback()
      // DB Failed, cleanup newly uploaded files
      if (newFileKeys.length > 0) {
        await this.fileUploadService.deleteMany(newFileKeys)
      }
      logger.error({ err: error }, 'Cập nhật sản phẩm thất bại')
      throw error
    }
  }

  /**
   * Xóa mềm sản phẩm
   */
  async delete(id: number, userId?: number) {
    const product = await Product.findOrFail(id)
    product.deletedAt = DateTime.now()
    if (userId) {
      product.updatedBy = userId
    }
    await product.save()
  }
}
