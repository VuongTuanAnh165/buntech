import factory from '@adonisjs/lucid/factories'
import Category from '#models/category'

export const CategoryFactory = factory
  .define(Category, async ({ faker }) => {
    const name = faker.commerce.department()
    return {
      name: name,
      slug:
        faker.helpers.slugify(faker.commerce.department()).toLowerCase() +
        '-' +
        faker.string.uuid(),
      description: faker.lorem.sentence(),
      metaTitle: faker.lorem.words(3),
      metaDescription: faker.lorem.sentence(),
      thumbnailUrl: faker.image.url(),
    }
  })
  .build()
