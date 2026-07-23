import factory from '@adonisjs/lucid/factories'
import Product from '#models/product'

export const ProductFactory = factory
  .define(Product, async ({ faker }) => {
    const name = faker.commerce.productName()
    return {
      name: name,
      slug:
        faker.helpers.slugify(faker.commerce.productName()).toLowerCase() +
        '-' +
        faker.string.uuid(),
      basePrice: faker.commerce.price({ min: 10000, max: 10000000, dec: 0 }),
      unit: 'cái',
      isActive: true,
      shortDescription: faker.lorem.sentence(),
      content: faker.lorem.paragraphs(2),
      thumbnailUrl: faker.image.url(),
    }
  })
  .build()
