import vine from '@vinejs/vine'

export const createRawMaterialValidator = vine.compile(
  vine.object({
    name: vine.string().trim().maxLength(191),
    unit: vine.string().trim().maxLength(50),
  })
)

export const updateRawMaterialValidator = vine.compile(
  vine.object({
    name: vine.string().trim().maxLength(191).optional(),
    unit: vine.string().trim().maxLength(50).optional(),
  })
)
