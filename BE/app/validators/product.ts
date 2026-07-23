import vine from '@vinejs/vine'

/**
 * Validator for creating a product
 */
export const createProductValidator = vine.compile(
  vine.object({
    categoryId: vine.number().optional(),
    name: vine.string().maxLength(255),
    slug: vine.string().maxLength(255),
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
export const updateProductValidator = vine.compile(
  vine.object({
    categoryId: vine.number().optional(),
    name: vine.string().maxLength(255).optional(),
    slug: vine.string().maxLength(255).optional(),
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
