import vine from '@vinejs/vine'

/**
 * Validator to validate the payload when creating
 * a new blog category.
 */
export const createBlogCategoryValidator = vine.compile(
  vine.object({
    name: vine.string().maxLength(100),
    slug: vine.string().maxLength(100).unique({ table: 'blog_categories', column: 'slug' }),
    description: vine.string().maxLength(255).optional(),
  })
)

/**
 * Validator to validate the payload when updating
 * an existing blog category.
 */
export const updateBlogCategoryValidator = vine.compile(
  vine.object({
    name: vine.string().maxLength(100).optional(),
    slug: vine.string().maxLength(100).optional(),
    description: vine.string().maxLength(255).optional(),
  })
)