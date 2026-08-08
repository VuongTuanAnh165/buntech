import factory from '@adonisjs/lucid/factories'
import Post from '#models/post'
import { BlogCategoryFactory } from './blog_category_factory.js'
import { UserFactory } from './user_factory.js'
import { DateTime } from 'luxon'

export const PostFactory = factory
  .define(Post, async ({ faker }) => {
    return {
      title: faker.lorem.sentence(),
      slug: faker.helpers.slugify(faker.lorem.sentence()).toLowerCase() + '-' + faker.string.uuid(),
      content: faker.lorem.paragraphs(3),
      isPublished: true,
      publishedAt: DateTime.now(),
    }
  })
  .relation('category', () => BlogCategoryFactory)
  .relation('author', () => UserFactory)
  .build()
