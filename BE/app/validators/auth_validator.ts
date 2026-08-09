import vine from '@vinejs/vine'

/**
 * Validator for checking login payload
 */
export const loginValidator = vine.compile(
  vine.object({
    phoneNumber: vine.string().mobile({ strictMode: false }), // Relaxed strictMode based on local context
    password: vine.string().minLength(6),
    rememberMe: vine.boolean().optional(),
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

/**
 * Validator for forgot password payload
 */
export const forgotPasswordValidator = vine.compile(
  vine.object({
    phoneNumber: vine.string().mobile({ strictMode: false }),
  })
)

/**
 * Validator for reset password payload
 */
export const resetPasswordValidator = vine.compile(
  vine.object({
    phoneNumber: vine.string().mobile({ strictMode: false }),
    token: vine.string(),
    newPassword: vine.string().minLength(6),
  })
)

/**
 * Validator for change password payload (for logged-in users)
 */
export const changePasswordValidator = vine.compile(
  vine.object({
    oldPassword: vine.string(),
    newPassword: vine.string().minLength(6),
  })
)

/**
 * Validator for update profile payload
 */
export const updateProfileValidator = vine.compile(
  vine.object({
    fullName: vine.string().maxLength(100),
    avatarUrl: vine.string().optional(),
  })
)
