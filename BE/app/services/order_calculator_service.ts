import Product from '#models/product'
import CustomerPrice from '#models/customer_price'
import BusinessException from '#exceptions/business_exception'

export default class OrderCalculatorService {
  /**
   * Tính toán tổng tiền và tạo chi tiết items cho đơn hàng
   * @param items Mảng sản phẩm khách đặt
   * @param userId (Optional) ID của User để áp dụng bảng giá sỉ (CustomerPrice)
   */
  async calculateOrder(items: Array<{ productId: number; quantity: number }>, userId?: number) {
    const productIds = items.map((i) => i.productId)

    // 1. Fetch Products
    const products = await Product.query()
      .select('id', 'is_active', 'base_price')
      .whereIn('id', productIds)

    // 2. Fetch Custom Prices if userId is provided
    let customPrices: CustomerPrice[] = []
    if (userId) {
      customPrices = await CustomerPrice.query()
        .select('id', 'product_id', 'custom_price')
        .where('user_id', userId)
        .whereIn('product_id', productIds)
    }

    let totalAmount = 0
    const orderItemsData: Array<{ productId: number; quantity: number; unitPrice: number }> = []

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)

      if (!product || !product.isActive) {
        throw new BusinessException(
          `Sản phẩm với ID ${item.productId} không tồn tại hoặc đã ngừng bán`
        )
      }

      // 3. Determine Price (Priority: CustomerPrice > BasePrice)
      const customPrice = customPrices.find((cp) => cp.productId === item.productId)
      const unitPrice = customPrice
        ? Number.parseFloat(customPrice.customPrice)
        : Number.parseFloat(product.basePrice)

      totalAmount += unitPrice * item.quantity

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: unitPrice,
      })
    }

    return { totalAmount, orderItemsData }
  }
}
