import vine from '@vinejs/vine'

/**
 * Validator for creating a category
 */
export const createCategoryValidator = vine.compile(
  vine.object({
    name: vine.string().maxLength(100),
    slug: vine.string().maxLength(100),
    description: vine.string().optional(),
    metaTitle: vine.string().maxLength(60).optional(),
    metaDescription: vine.string().maxLength(160).optional(),
    thumbnail: vine
      .file({
        size: '2mb',
        extnames: ['jpg', 'png', 'jpeg', 'webp'],
      })
      .optional(),
  })
)

/**
 * Validator for updating a category
 */
export const updateCategoryValidator = vine.compile(
  vine.object({
    name: vine.string().maxLength(100).optional(),
    slug: vine.string().maxLength(100).optional(),
    description: vine.string().optional(),
    metaTitle: vine.string().maxLength(60).optional(),
    metaDescription: vine.string().maxLength(160).optional(),
    thumbnail: vine
      .file({
        size: '2mb',
        extnames: ['jpg', 'png', 'jpeg', 'webp'],
      })
      .optional(),
  })
)
