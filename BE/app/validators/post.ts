import vine from '@vinejs/vine'

/**
 * Validator to validate the payload when creating
 * a new post.
 */
export const createPostValidator = vine.compile(
  vine.object({
    title: vine.string().maxLength(255),
    slug: vine.string().maxLength(255).unique({ table: 'posts', column: 'slug' }),
    blogCategoryId: vine.number(),
    thumbnail: vine.file({
      size: '5mb',
      extnames: ['jpg', 'png', 'jpeg', 'webp'],
    }).optional(),
    content: vine.string().optional(),
    metaTitle: vine.string().maxLength(60).optional(),
    metaDescription: vine.string().maxLength(160).optional(),
    isPublished: vine.boolean().optional(),
    publishedAt: vine.date().optional(),
  })
)

/**
 * Validator to validate the payload when updating
 * an existing post.
 */
export const updatePostValidator = vine.compile(
  vine.object({
    title: vine.string().maxLength(255).optional(),
    slug: vine.string().maxLength(255).optional(),
    blogCategoryId: vine.number().optional(),
    thumbnail: vine.file({
      size: '5mb',
      extnames: ['jpg', 'png', 'jpeg', 'webp'],
    }).optional(),
    content: vine.string().optional(),
    metaTitle: vine.string().maxLength(60).optional(),
    metaDescription: vine.string().maxLength(160).optional(),
    isPublished: vine.boolean().optional(),
    publishedAt: vine.date().optional(),
  })
)