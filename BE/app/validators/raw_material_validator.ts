import vine from '@vinejs/vine'

export const createRawMaterialValidator = vine.compile(
  vine.object({
    name: vine.string().trim().maxLength(255),
    unit: vine.string().trim().maxLength(50),
    currentStock: vine.number().min(0).optional(),
  })
)

export const updateRawMaterialValidator = vine.compile(
  vine.object({
    name: vine.string().trim().maxLength(255).optional(),
    unit: vine.string().trim().maxLength(50).optional(),
    currentStock: vine.number().min(0).optional(),
  })
)
