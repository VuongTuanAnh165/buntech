import vine from '@vinejs/vine'

export const createProductReviewValidator = vine.compile(
  vine.object({
    rating: vine.number().min(1).max(5),
    content: vine.string().maxLength(1000).optional(),
    images: vine
      .array(
        vine.file({
          size: '5mb',
          extnames: ['jpg', 'png', 'jpeg', 'webp'],
        })
      )
      .maxLength(5)
      .optional(),
  })
)

export const approveProductReviewValidator = vine.compile(
  vine.object({
    isApproved: vine.boolean(),
  })
)

export const replyProductReviewValidator = vine.compile(
  vine.object({
    replyContent: vine.string().maxLength(2000),
  })
)

export const reviewFilterValidator = vine.compile(
  vine.object({
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
    status: vine.enum(['all', 'pending', 'approved']).optional(),
  })
)
