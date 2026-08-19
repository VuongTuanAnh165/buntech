import User from '#models/user'
import UserProfile from '#models/user_profile'
import db from '@adonisjs/lucid/services/db'
import { inject } from '@adonisjs/core'
import FileUploadService from '#services/file_upload_service'
import { Pagination, getSafeLimit } from '#enums/pagination'
import { CustomerType } from '#enums/customer_type'
import { Role } from '#enums/role'
import { OrderStatus } from '#enums/order_status'
import { DateTime } from 'luxon'

@inject()
export default class UserService {
  constructor(protected fileUploadService: FileUploadService) {}
  /**
   * Get list of users with pagination and optional role filter
   */
  async getUsers(
    page: number = 1,
    limit: number = Pagination.DEFAULT_LIMIT,
    role?: string,
    search?: string
  ) {
    const query = User.query()
      .select('id', 'full_name', 'phone_number', 'role', 'created_at')
      .preload('profile', (q) => {
        q.select('user_id', 'avatar_url', 'store_name', 'debt_limit', 'current_debt')
      })
      .orderBy('created_at', 'desc')

    if (role) {
      query.where('role', role)
    }

    if (search) {
      query.where((q) => {
        q.whereILike('full_name', `%${search}%`).orWhereILike('phone_number', `%${search}%`)
      })
    }

    const safeLimit = getSafeLimit(limit)
    return query.paginate(page, safeLimit)
  }

  /**
   * Get public customers for the distribution map page.
   * Aggregates monthly order volume and last order date for gamification tiers.
   */
  async getPublicCustomers() {
    const startOfMonth = DateTime.now().startOf('month').toSQL()

    const users = await User.query()
      .select('id', 'full_name', 'phone_number')
      .where('role', Role.CUSTOMER)
      .whereHas('profile', (q) => {
        q.where('is_public', true)
      })
      .preload('profile', (q) => {
        q.select('user_id', 'store_name', 'avatar_url')
      })
      .preload('addresses', (q) => {
        q.select('id', 'user_id', 'province', 'ward', 'address_line', 'latitude', 'longitude')
      })
      .withAggregate('orders', (q) => {
        q.sum('total_amount')
          .where('status', OrderStatus.DELIVERED)
          .andWhereRaw('created_at >= ?', [startOfMonth!])
          .as('monthly_volume')
      })
      .withAggregate('orders', (q) => {
        q.max('created_at').as('last_order_date')
      })
      .orderBy('monthly_volume', 'desc')
      .limit(100)

    return users
  }

  /**
   * Get single user by ID
   */
  async getUser(id: number) {
    return User.query()
      .select('id', 'full_name', 'phone_number', 'role', 'created_at')
      .where('id', id)
      .preload('profile', (q) => {
        q.select(
          'user_id',
          'avatar_url',
          'store_name',
          'debt_limit',
          'current_debt',
          'zalo_user_id',
          'is_public'
        )
      })
      .firstOrFail()
  }

  /**
   * Create a new user (with profile)
   */
  async createUser(data: {
    phoneNumber: string
    password?: string
    fullName: string
    role: string
    customerType?: CustomerType
  }) {
    // Transaction to ensure user and profile are created together
    return await db.transaction(async (trx) => {
      const user = new User()
      user.fill(data)
      user.useTransaction(trx)
      await user.save()

      // Create an empty profile for the user
      const profile = new UserProfile()
      profile.userId = user.id
      profile.customerType = data.customerType || CustomerType.RETAIL
      profile.useTransaction(trx)
      await profile.save()

      user.$setRelated('profile', profile)
      return user
    })
  }

  /**
   * Update an existing user
   */
  async updateUser(
    id: number,
    data: {
      fullName?: string
      role?: string
      customerType?: CustomerType
    }
  ) {
    const user = await User.findOrFail(id)
    user.merge({
      fullName: data.fullName,
      role: data.role,
    })
    await user.save()

    if (data.customerType) {
      const profile = await UserProfile.query()
        .select('user_id', 'customer_type')
        .where('user_id', user.id)
        .firstOrFail()
      profile.customerType = data.customerType
      await profile.save()
    }

    await user.load('profile', (q) => {
      q.select('user_id', 'avatar_url', 'store_name', 'debt_limit', 'current_debt', 'zalo_user_id')
    })
    return user
  }

  /**
   * Change user password
   */
  async changePassword(id: number, password: string) {
    const user = await User.query().select('id', 'password').where('id', id).firstOrFail()
    user.password = password
    await user.save()
  }

  /**
   * Delete user
   */
  async deleteUser(id: number) {
    const user = await User.query().select('id').where('id', id).firstOrFail()
    await user.delete() // AppBaseModel will handle soft delete if configured, or hard delete
  }

  /**
   * Update user profile (debt_limit, storeName, etc.)
   */
  async updateProfile(
    userId: number,
    data: {
      debtLimit?: number
      storeName?: string
      zaloUserId?: string
      avatarUrl?: string
      isPublic?: boolean
    }
  ) {
    const profile = await UserProfile.query()
      .select(
        'user_id',
        'avatar_url',
        'store_name',
        'debt_limit',
        'current_debt',
        'zalo_user_id',
        'customer_type',
        'is_public'
      )
      .where('user_id', userId)
      .firstOrFail()

    const oldAvatarUrl = profile.avatarUrl

    // debtLimit in DB is string (decimal), we cast number to string if provided
    const updateData: Record<string, unknown> = { ...data }
    if (data.debtLimit !== undefined) {
      updateData.debtLimit = data.debtLimit.toString()
    }

    profile.merge(updateData)
    await profile.save()

    // Clean up old avatar if it was replaced
    if (data.avatarUrl && oldAvatarUrl && data.avatarUrl !== oldAvatarUrl) {
      const oldAvatarKey = this.fileUploadService.extractKeyFromUrl(oldAvatarUrl, 'users/avatars')
      if (oldAvatarKey) {
        await this.fileUploadService.delete(oldAvatarKey).catch(() => {})
      }
    }

    return profile
  }
}
