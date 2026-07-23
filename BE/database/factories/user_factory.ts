import factory from '@adonisjs/lucid/factories'
import User from '#models/user'

export const UserFactory = factory
  .define(User, async ({ faker }) => {
    return {
      fullName: faker.person.fullName(),
      phoneNumber: faker.string.numeric(10), // Vietnamese phone length
      password: 'password123',
      role: 'retail',
    }
  })
  .build()
