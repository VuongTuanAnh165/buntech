import vine from '@vinejs/vine'
import { Role } from '#enums/role'
import { CustomerType } from '#enums/customer_type'

export const createUserValidator = vine.compile(
  vine.object({
    phoneNumber: vine
      .string()
      .trim()
      .regex(/^0[0-9]{9}$/)
      .unique(async (db, value) => {
        const user = await db.from('users').where('phone_number', value).first()
        return !user
      }),
    password: vine.string().minLength(6),
    fullName: vine.string().trim().maxLength(100),
    role: vine.enum(Object.values(Role)),
    customerType: vine.enum(Object.values(CustomerType)).optional(),
    debtLimit: vine.number().min(0).optional(),
    storeName: vine.string().trim().maxLength(191).optional(),
    isPublic: vine.boolean().optional(),
    avatarUrl: vine.string().trim().optional(),
  })
)

export const updateUserValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().maxLength(100).optional(),
    role: vine.enum(Object.values(Role)).optional(),
    customerType: vine.enum(Object.values(CustomerType)).optional(),
    debtLimit: vine.number().min(0).optional(),
    storeName: vine.string().trim().maxLength(191).optional(),
    isPublic: vine.boolean().optional(),
    avatarUrl: vine.string().trim().optional(),
  })
)

export const changePasswordValidator = vine.compile(
  vine.object({
    password: vine.string().minLength(6),
  })
)

export const updateUserProfileValidator = vine.compile(
  vine.object({
    debtLimit: vine.number().min(0).optional(),
    storeName: vine.string().trim().maxLength(191).optional(),
    zaloUserId: vine.string().trim().maxLength(191).optional(),
    avatarUrl: vine.string().trim().optional(),
    isPublic: vine.boolean().optional(),
  })
)
