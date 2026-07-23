import User from '#models/user'
import UserProfile from '#models/user_profile'
import db from '@adonisjs/lucid/services/db'

export default class UserService {
  /**
   * Get list of users with pagination and optional role filter
   */
  async getUsers(page: number = 1, limit: number = 20, role?: string) {
    const query = User.query().preload('profile').orderBy('created_at', 'desc')

    if (role) {
      query.where('role', role)
    }

    return query.paginate(page, limit)
  }

  /**
   * Get single user by ID
   */
  async getUser(id: number) {
    return User.query().where('id', id).preload('profile').firstOrFail()
  }

  /**
   * Create a new user (with profile)
   */
  async createUser(data: {
    phoneNumber: string
    password?: string
    fullName: string
    role: string
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
      profile.useTransaction(trx)
      await profile.save()

      await user.load('profile')
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
    }
  ) {
    const user = await User.findOrFail(id)
    user.merge(data)
    await user.save()

    await user.load('profile')
    return user
  }

  /**
   * Change user password
   */
  async changePassword(id: number, password: string) {
    const user = await User.findOrFail(id)
    user.password = password
    await user.save()
  }

  /**
   * Delete user
   */
  async deleteUser(id: number) {
    const user = await User.findOrFail(id)
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
    }
  ) {
    const profile = await UserProfile.findByOrFail('user_id', userId)

    // debtLimit in DB is string (decimal), we cast number to string if provided
    const updateData: any = { ...data }
    if (data.debtLimit !== undefined) {
      updateData.debtLimit = data.debtLimit.toString()
    }

    profile.merge(updateData)
    await profile.save()

    return profile
  }
}
