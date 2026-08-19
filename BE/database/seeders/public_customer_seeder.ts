import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  async run() {
    const coords = [
      { lat: '21.0285', lng: '105.8542', prov: 'Hà Nội' }, // HN
      { lat: '10.7626', lng: '106.6602', prov: 'Hồ Chí Minh' }, // HCM
      { lat: '16.0471', lng: '108.2062', prov: 'Đà Nẵng' }, // ĐN
      { lat: '20.8449', lng: '106.6881', prov: 'Hải Phòng' }, // HP
      { lat: '10.0452', lng: '105.7469', prov: 'Cần Thơ' }, // CT
      { lat: '12.2388', lng: '109.1967', prov: 'Nha Trang' }, // NT
      { lat: '20.9400', lng: '106.3300', prov: 'Hải Dương' }, // HD
      { lat: '16.4637', lng: '107.5909', prov: 'Huế' }, // Huế
      { lat: '13.7763', lng: '109.2227', prov: 'Quy Nhơn' }, // QN
      { lat: '9.9197', lng: '105.1504', prov: 'Rạch Giá' }, // KG
    ]

    const storeNames = [
      'Đại lý Tấn Phát',
      'Thực phẩm Hữu Cơ Xanh',
      'Chợ Gạo Cô Tâm',
      'Bách Hóa Chú Hùng',
      'Chuỗi Cửa Hàng 24h',
      'MiniMart An Bình',
      'Siêu thị Bếp Việt',
      'Nhà phân phối Hoàng Kim',
      'Đại lý Minh Trí',
      'Kho Bún Tươi Cô Lan',
    ]

    for (let i = 0; i < 10; i++) {
      const isFomo = i % 3 === 0 // 33% có nhãn FOMO (mới nhập hàng)
      const orderVolume = i < 2 ? 60000000 : i < 5 ? 25000000 : i < 8 ? 80000000 : 2000000 // Tạo Diamond, Gold, Silver, Bronze

      // 1. Tạo User
      const user = await User.create({
        fullName: `Nguyễn Văn ${String.fromCharCode(65 + i)}`,
        phoneNumber: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
        password: 'password',
        role: 'CUSTOMER',
      })

      // 2. Tạo Profile (isPublic = true)
      await user.related('profile').create({
        storeName: storeNames[i],
        customerType: 'wholesale',
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(storeNames[i])}&background=random`,
        isPublic: true,
      } as any)

      // 3. Tạo Address
      await user.related('addresses').create({
        addressLine: '123 Đường Số 1',
        province: coords[i].prov,
        ward: 'Phường 1',
        latitude: coords[i].lat,
        longitude: coords[i].lng,
        isDefault: true,
      })

      // 4. Tạo Order để sinh ra Doanh số (Tier) và Ngày nhập (FOMO)
      const orderDate = isFomo
        ? DateTime.now().minus({ days: 2 })
        : DateTime.now().minus({ days: 10 })
      await user.related('orders').create({
        totalAmount: orderVolume.toString(),
        status: 'completed',
        createdAt: orderDate,
        updatedAt: orderDate,
        deliveryDate: orderDate,
        source: 'zalo', // Enum hợp lệ tùy schema
      } as any)
    }
  }
}
