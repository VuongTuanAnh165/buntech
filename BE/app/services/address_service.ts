import Address from '#models/address'
import db from '@adonisjs/lucid/services/db'

export default class AddressService {
  /**
   * Get all addresses of a user
   */
  async getUserAddresses(userId: number) {
    return Address.query()
      .where('user_id', userId)
      .orderBy('is_default', 'desc')
      .orderBy('id', 'desc')
  }

  /**
   * Get a specific address
   */
  async getAddress(userId: number, addressId: number) {
    return Address.query().where('id', addressId).where('user_id', userId).firstOrFail()
  }

  /**
   * Create a new address
   */
  async createAddress(
    userId: number,
    data: {
      addressLine: string
      province?: string
      ward?: string
      latitude?: string
      longitude?: string
      isDefault?: boolean
    }
  ) {
    return await db.transaction(async (trx) => {
      // If this address is set as default, remove default flag from others
      if (data.isDefault) {
        await Address.query({ client: trx })
          .where('user_id', userId)
          .where('is_default', true)
          .update({ isDefault: false })
      } else {
        // If it's the first address, make it default automatically
        const count = await Address.query({ client: trx })
          .where('user_id', userId)
          .count('* as total')
        if (Number(count[0].$extras.total) === 0) {
          data.isDefault = true
        }
      }

      const address = new Address()
      address.fill({ ...data, userId })
      address.useTransaction(trx)
      await address.save()

      return address
    })
  }

  /**
   * Update an address
   */
  async updateAddress(
    userId: number,
    addressId: number,
    data: {
      addressLine?: string
      province?: string
      ward?: string
      latitude?: string
      longitude?: string
      isDefault?: boolean
    }
  ) {
    return await db.transaction(async (trx) => {
      const address = await Address.query({ client: trx })
        .where('id', addressId)
        .where('user_id', userId)
        .firstOrFail()

      if (data.isDefault && !address.isDefault) {
        // Remove default flag from other addresses
        await Address.query({ client: trx })
          .where('user_id', userId)
          .where('id', '!=', addressId)
          .where('is_default', true)
          .update({ isDefault: false })
      }

      address.merge(data)
      address.useTransaction(trx)
      await address.save()

      return address
    })
  }

  /**
   * Delete an address
   */
  async deleteAddress(userId: number, addressId: number) {
    return await db.transaction(async (trx) => {
      const address = await Address.query({ client: trx })
        .where('id', addressId)
        .where('user_id', userId)
        .firstOrFail()

      const wasDefault = address.isDefault

      address.useTransaction(trx)
      await address.delete()

      // If we deleted the default address, promote another one to default
      if (wasDefault) {
        const nextAddress = await Address.query({ client: trx })
          .where('user_id', userId)
          .orderBy('id', 'desc')
          .first()

        if (nextAddress) {
          nextAddress.isDefault = true
          nextAddress.useTransaction(trx)
          await nextAddress.save()
        }
      }
    })
  }
}
