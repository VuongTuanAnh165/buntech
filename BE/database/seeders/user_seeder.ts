import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import { Role } from '#enums/role'

export default class extends BaseSeeder {
  async run() {
    const usersData = [
      {
        fullName: 'Admin Buntech',
        phoneNumber: '0901234567',
        password: 'password123',
        role: Role.ADMIN,
        profile: {
          storeName: 'Buntech Headquarter',
          avatarUrl: 'https://ui-avatars.com/api/?name=Admin',
          debtLimit: '0',
          currentDebt: '0',
          zaloUserId: null,
        },
      },
      {
        fullName: 'Tài xế Nguyễn Văn A',
        phoneNumber: '0911111111',
        password: 'password123',
        role: Role.DRIVER,
        profile: {
          storeName: null,
          avatarUrl: 'https://ui-avatars.com/api/?name=Nguyen+Van+A',
          debtLimit: '0',
          currentDebt: '0',
          zaloUserId: null,
        },
      },
      {
        fullName: 'Đại lý Minh Phát',
        phoneNumber: '0922222222',
        password: 'password123',
        role: Role.WHOLESALE,
        profile: {
          storeName: 'Cửa hàng Minh Phát',
          avatarUrl: null,
          debtLimit: '50000000',
          currentDebt: '0',
          zaloUserId: null,
        },
      },
      {
        fullName: 'Khách hàng Lẻ 1',
        phoneNumber: '0987654321',
        password: 'password123',
        role: Role.RETAIL,
        profile: {
          storeName: null,
          avatarUrl: null,
          debtLimit: '0',
          currentDebt: '0',
          zaloUserId: 'zalo_test_123',
        },
      },
    ]

    for (const userData of usersData) {
      const { profile, ...userPayload } = userData

      // Dùng updateOrCreate để có thể chạy lại seeder nhiều lần không bị lỗi trùng sdt
      const user = await User.updateOrCreate({ phoneNumber: userPayload.phoneNumber }, userPayload)

      // Cập nhật hoặc tạo profile tương ứng
      await user.related('profile').updateOrCreate({ userId: user.id }, profile)
    }
  }
}
