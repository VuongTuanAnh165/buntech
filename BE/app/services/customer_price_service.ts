import CustomerPrice from '#models/customer_price'
import Product from '#models/product'
import db from '@adonisjs/lucid/services/db'

export default class CustomerPriceService {
  /**
   * Get all custom prices for a specific user
   */
  async getUserPrices(userId: number) {
    return CustomerPrice.query()
      .select('id', 'user_id', 'product_id', 'custom_price', 'created_at')
      .where('user_id', userId)
      .preload('product', (q) => q.select('id', 'name', 'thumbnailUrl'))
      .orderBy('created_at', 'desc')
  }

  /**
   * Upsert (Create or Update) a custom price
   */
  async upsertPrice(
    userId: number,
    data: {
      productId: number
      customPrice: number
    }
  ) {
    // Check if product exists
    const product = await Product.query()
      .select('id', 'name', 'thumbnail_url')
      .where('id', data.productId)
      .firstOrFail()

    return await db.transaction(async (trx) => {
      // Find existing price
      let customerPrice = await CustomerPrice.query({ client: trx })
        .select('id', 'user_id', 'product_id', 'custom_price')
        .where('user_id', userId)
        .where('product_id', data.productId)
        .first()

      if (!customerPrice) {
        customerPrice = new CustomerPrice()
        customerPrice.userId = userId
        customerPrice.productId = data.productId
      }

      // Convert number to string for decimal column
      customerPrice.customPrice = data.customPrice.toString()
      customerPrice.useTransaction(trx)

      await customerPrice.save()

      // Attach product info for response
      customerPrice.$setRelated('product', product)

      return customerPrice
    })
  }

  /**
   * Delete a custom price (fallback to base price)
   */
  async deletePrice(userId: number, productId: number) {
    const customerPrice = await CustomerPrice.query()
      .select('id')
      .where('user_id', userId)
      .where('product_id', productId)
      .firstOrFail()

    await customerPrice.delete()
  }
}
