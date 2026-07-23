import vine from '@vinejs/vine'

export const createAddressValidator = vine.compile(
  vine.object({
    addressLine: vine.string().trim().maxLength(255),
    province: vine.string().trim().maxLength(100).optional(),
    ward: vine.string().trim().maxLength(100).optional(),
    latitude: vine.string().trim().maxLength(50).optional(),
    longitude: vine.string().trim().maxLength(50).optional(),
    isDefault: vine.boolean().optional(),
  })
)

export const updateAddressValidator = vine.compile(
  vine.object({
    addressLine: vine.string().trim().maxLength(255).optional(),
    province: vine.string().trim().maxLength(100).optional(),
    ward: vine.string().trim().maxLength(100).optional(),
    latitude: vine.string().trim().maxLength(50).optional(),
    longitude: vine.string().trim().maxLength(50).optional(),
    isDefault: vine.boolean().optional(),
  })
)
