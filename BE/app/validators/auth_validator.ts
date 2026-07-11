import vine from '@vinejs/vine'

/**
 * Validator for checking login payload
 */
export const loginValidator = vine.compile(
  vine.object({
    phoneNumber: vine.string().mobile({ strictMode: false }), // Relaxed strictMode based on local context
    password: vine.string().minLength(6),
  })
)

/**
 * Validator for checking refresh token payload
 */
export const refreshValidator = vine.compile(
  vine.object({
    refreshToken: vine.string(),
  })
)
