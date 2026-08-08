import factory from '@adonisjs/lucid/factories'
import ProductReview from '#models/product_review'
import { ProductFactory } from './product_factory.js'
import { UserFactory } from './user_factory.js'

export const ProductReviewFactory = factory
  .define(ProductReview, async ({ faker }) => {
    return {
      rating: faker.number.int({ min: 1, max: 5 }),
      content: faker.lorem.sentence(),
      isApproved: false,
      hasPurchased: faker.datatype.boolean(),
    }
  })
  .relation('product', () => ProductFactory)
  .relation('user', () => UserFactory)
  .build()
