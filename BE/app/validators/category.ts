import vine from '@vinejs/vine'

/**
 * Validator for creating a category
 */
export const createCategoryValidator = vine.compile(
  vine.object({
    name: vine.string().maxLength(100),
    slug: vine
      .string()
      .maxLength(100)
      .unique(async (db, value) => {
        const match = await db.from('categories').where('slug', value).first()
        return !match
      }),
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
export const updateCategoryValidator = vine.withMetaData<{ categoryId: number }>().compile(
  vine.object({
    name: vine.string().maxLength(100).optional(),
    slug: vine
      .string()
      .maxLength(100)
      .unique(async (db, value, field) => {
        const match = await db
          .from('categories')
          .where('slug', value)
          .whereNot('id', field.meta.categoryId)
          .first()
        return !match
      })
      .optional(),
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
