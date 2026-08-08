import vine from '@vinejs/vine'

/**
 * Validator for uploading images
 */
export const uploadValidator = vine.compile(
  vine.object({
    image: vine.file({
      size: '5mb',
      extnames: ['jpg', 'png', 'jpeg', 'webp'],
    }),
  })
)
