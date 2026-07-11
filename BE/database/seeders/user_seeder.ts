import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import { Role } from '#enums/role'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
    await User.createMany([
      {
        fullName: 'Admin Buntech',
        phoneNumber: '0901234567',
        password: 'password123', // Sẽ được tự động băm (hash) nhờ withAuthFinder mixin
        role: Role.ADMIN,
      },
      {
        fullName: 'Khách hàng Test',
        phoneNumber: '0987654321',
        password: 'password123',
        role: Role.RETAIL,
      },
    ])
  }
}