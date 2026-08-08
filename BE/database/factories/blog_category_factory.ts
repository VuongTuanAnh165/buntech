import factory from '@adonisjs/lucid/factories'
import BlogCategory from '#models/blog_category'

export const BlogCategoryFactory = factory
  .define(BlogCategory, async ({ faker }) => {
    return {
      name: faker.commerce.department(),
      slug:
        faker.helpers.slugify(faker.commerce.department()).toLowerCase() +
        '-' +
        faker.string.uuid(),
      description: faker.lorem.sentence(),
    }
  })
  .build()
