import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Product from '#models/product'
import User from '#models/user'
import ProductReview from '#models/product_review'
import { Role } from '#enums/role'

export default class extends BaseSeeder {
  async run() {
    // Lấy 2 sản phẩm ngẫu nhiên
    const products = await Product.query().limit(2)
    if (products.length === 0) {
      console.log('Chưa có sản phẩm nào trong database, bỏ qua ProductReview seeder.')
      return
    }

    // Lấy một vài user đóng vai trò khách hàng
    const users = await User.query().where('role', Role.CUSTOMER).limit(3)
    if (users.length === 0) {
      console.log('Chưa có user nào trong database, bỏ qua ProductReview seeder.')
      return
    }

    // Xóa dữ liệu cũ nếu muốn (hoặc comment lại nếu muốn seed chèn thêm)
    // await ProductReview.query().delete()

    const reviewsToCreate = [
      {
        productId: products[0].id,
        userId: users[0].id,
        rating: 5,
        content: 'Sản phẩm tuyệt vời, bún làm ra dai và ngon! Giao hàng cũng rất nhanh.',
        hasPurchased: true,
        isApproved: true,
      },
      {
        productId: products[0].id,
        userId: users.length > 1 ? users[1].id : users[0].id,
        rating: 4,
        content: 'Chất lượng ổn trong tầm giá. Dễ sử dụng.',
        hasPurchased: true,
        isApproved: false, // Chờ duyệt
      },
    ]

    if (products.length > 1) {
      reviewsToCreate.push({
        productId: products[1].id,
        userId: users[0].id,
        rating: 5,
        content: 'Mình mua sỉ, giá rất tốt và chất lượng đồng đều.',
        hasPurchased: true,
        isApproved: true,
      })
      reviewsToCreate.push({
        productId: products[1].id,
        userId: users.length > 2 ? users[2].id : users[0].id,
        rating: 3,
        content: 'Cũng tạm được, nhưng đóng gói bị móp một chút.',
        hasPurchased: true,
        isApproved: false,
      })
    }

    for (const reviewData of reviewsToCreate) {
      await ProductReview.create(reviewData)
    }

    console.log('Product Review seeded successfully!')
  }
}