import vine from '@vinejs/vine'

/**
 * Validator for creating a product
 */
export const createProductValidator = vine.compile(
  vine.object({
    categoryId: vine.number().optional(),
    name: vine.string().maxLength(191),
    slug: vine.string().maxLength(191).unique({ table: 'products', column: 'slug' }),
    basePrice: vine.number().min(0),
    unit: vine.string().maxLength(20),
    shortDescription: vine.string().optional(),
    content: vine.string().optional(),
    metaTitle: vine.string().maxLength(60).optional(),
    metaDescription: vine.string().maxLength(160).optional(),
    isActive: vine.boolean().optional(),

    // File upload
    thumbnail: vine
      .file({
        size: '2mb',
        extnames: ['jpg', 'png', 'jpeg', 'webp'],
      })
      .optional(),

    // Array of files for gallery
    images: vine
      .array(
        vine.file({
          size: '2mb',
          extnames: ['jpg', 'png', 'jpeg', 'webp'],
        })
      )
      .optional(),
  })
)

/**
 * Validator for updating a product
 */
export const updateProductValidator = vine.withMetaData<{ productId: number }>().compile(
  vine.object({
    categoryId: vine.number().optional(),
    name: vine.string().maxLength(191).optional(),
    slug: vine
      .string()
      .maxLength(191)
      .unique(async (db, value, field) => {
        const match = await db
          .from('products')
          .where('slug', value)
          .whereNot('id', field.meta.productId)
          .first()
        return !match
      })
      .optional(),
    basePrice: vine.number().min(0).optional(),
    unit: vine.string().maxLength(20).optional(),
    shortDescription: vine.string().optional(),
    content: vine.string().optional(),
    metaTitle: vine.string().maxLength(60).optional(),
    metaDescription: vine.string().maxLength(160).optional(),
    isActive: vine.boolean().optional(),

    // Thumbnail upload
    thumbnail: vine
      .file({
        size: '2mb',
        extnames: ['jpg', 'png', 'jpeg', 'webp'],
      })
      .optional(),

    // Append new images to gallery
    images: vine
      .array(
        vine.file({
          size: '2mb',
          extnames: ['jpg', 'png', 'jpeg', 'webp'],
        })
      )
      .optional(),

    // Delete specific image IDs from gallery
    deletedImageIds: vine.array(vine.number()).optional(),

    // Update display orders: [{"id": 1, "order": 2}]
    imageOrders: vine
      .array(
        vine.object({
          id: vine.number(),
          order: vine.number(),
        })
      )
      .parse((value: unknown) => {
        if (typeof value === 'string') {
          try {
            return JSON.parse(value)
          } catch {
            return value
          }
        }
        return value
      })
      .optional(),
  })
)

/**
 * Validator for filtering products
 */
export const productFilterValidator = vine.compile(
  vine.object({
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
    search: vine.string().optional(),
    status: vine.enum(['ALL', 'PUBLISHED', 'DRAFT']).optional(),
    categoryId: vine.number().optional(),
  })
)
