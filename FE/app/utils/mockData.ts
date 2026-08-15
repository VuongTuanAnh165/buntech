import type {
  Profile,
  Category,
  Product,
  CustomPrice,
  Address,
  Order,
  OrderItem,
  Transaction,
  InventoryItem,
  InventoryMovement,
  BlogCategory,
  BlogPost,
  SystemConfig,
  DashboardKPI,
  RevenuePoint,
  TopBuyer,
  Vehicle,
  Notification,
  Message,
  DeliveryRoute
} from './types'

export * from './types'

const now = new Date()
const iso = (daysAgo: number) => new Date(now.getTime() - daysAgo * 86400000).toISOString()
const uid = (prefix: string, n: number) => `${prefix}-${String(n).padStart(4, '0')}`

// ─── Helpers ──────────────────────────────────────────────
const avatarFor = (name: string) =>
  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=ed7628,f59e0b,10b981,3b82f6,8b5cf6,ec4899&radius=50`
const _imgFor = (id: number) => `https://picsum.photos/seed/buntech${id}/600/600`

// Deterministic pseudo-random for stable data across reloads
let seed = 42
const rand = () => {
  seed = (seed * 9301 + 49297) % 233280
  return seed / 233280
}
const randInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min
const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)] as NonNullable<T>

// Vietnamese name pools for generation
const surnames = [
  'Nguyễn',
  'Trần',
  'Lê',
  'Phạm',
  'Hoàng',
  'Vũ',
  'Phan',
  'Bùi',
  'Đặng',
  'Đỗ',
  'Ngô',
  'Dương',
  'Lý',
  'Võ',
  'Trương'
]
const maleMiddle = [
  'Văn',
  'Hữu',
  'Đức',
  'Minh',
  'Quang',
  'Thanh',
  'Hoàng',
  'Bảo',
  'Anh',
  'Quốc',
  'Nhất',
  'Phú',
  'Tấn',
  'Công'
]
const femaleMiddle = [
  'Thị',
  'Ngọc',
  'Thanh',
  'Mỹ',
  'Hoài',
  'Bảo',
  'Hồng',
  'Kim',
  'Thu',
  'Quỳnh',
  'Phương',
  'Mai',
  'Hà',
  'Diệu'
]
const maleNames = [
  'Hùng',
  'Nam',
  'Dũng',
  'Tuấn',
  'Khoa',
  'Phong',
  'Lộc',
  'Thắng',
  'Cường',
  'Hải',
  'Bảo',
  'Đạt',
  'Quân',
  'Long',
  'Phát',
  'Sơn',
  'Trí',
  'Tài',
  'Hiếu',
  'Khôi'
]
const femaleNames = [
  'Mai',
  'Hoa',
  'Lan',
  'Hà',
  'Mỹ',
  'Nga',
  'Trang',
  'Xuân',
  'Hồng',
  'Vân',
  'Kiều',
  'Diệu',
  'Phương',
  'Thảo',
  'Linh',
  'Thủy',
  'Hằng',
  'Nhi',
  'Tâm',
  'Quỳnh'
]
const driverNames = [
  'Tài',
  'Lái',
  'Hùng',
  'Nam',
  'Dũng',
  'Phong',
  'Lộc',
  'Thắng',
  'Cường',
  'Hải',
  'Đạt',
  'Quân',
  'Long',
  'Phát',
  'Sơn',
  'Trí',
  'Hiếu',
  'Khôi',
  'Minh',
  'Bảo',
  'Tân',
  'Phú',
  'Tấn',
  'Công',
  'Hòa',
  'Thiện',
  'Vinh',
  'Phước',
  'Lộc',
  'Khang'
]

function genName(isMale: boolean): string {
  const surname = pick(surnames)
  if (isMale) return `${surname} ${pick(maleMiddle)} ${pick(maleNames)}`
  return `${surname} ${pick(femaleMiddle)} ${pick(femaleNames)}`
}

// ─── Profiles (120 total: 2 admin, 50 drivers, 68 customers) ───────────────────
const adminProfiles: Profile[] = [
  {
    id: uid('usr', 1),
    role: 'ADMIN',
    phone: '0901234567',
    full_name: 'Nguyễn Quang Admin',
    status: 'ACTIVE',
    debt_limit: 0,
    avatar_url: avatarFor('Nguyễn Quang Admin'),
    created_at: iso(120),
    updated_at: iso(1)
  },
  {
    id: uid('usr', 2),
    role: 'ADMIN',
    phone: '0901234568',
    full_name: 'Trần Thị Quản Lý',
    status: 'ACTIVE',
    debt_limit: 0,
    avatar_url: avatarFor('Trần Thị Quản Lý'),
    created_at: iso(100),
    updated_at: iso(2)
  }
]

const driverProfiles: Profile[] = Array.from({ length: 50 }, (_, i) => {
  const _isMale = true
  const name = `${pick(surnames)} ${pick(maleMiddle)} ${pick(driverNames)}`
  const phone = `09${String(20000000 + i * 137).slice(0, 8)}`
  const isActive = i < 45
  return {
    id: uid('usr', i + 3),
    role: 'DRIVER',
    phone,
    full_name: name,
    status: isActive ? 'ACTIVE' : 'INACTIVE',
    debt_limit: 0,
    avatar_url: avatarFor(name),
    created_at: iso(90 - i),
    updated_at: iso(randInt(1, 20))
  }
})

const customerProfiles: Profile[] = Array.from({ length: 68 }, (_, i) => {
  const isMale = i % 2 === 0
  const name = genName(isMale)
  const phone = `09${String(10000000 + i * 191).slice(0, 8)}`
  const isActive = i < 64
  const debtLimit = randInt(5, 50) * 1000000
  return {
    id: uid('usr', i + 53),
    role: 'CUSTOMER',
    phone,
    full_name: name,
    status: isActive ? 'ACTIVE' : 'INACTIVE',
    debt_limit: debtLimit,
    avatar_url: avatarFor(name),
    created_at: iso(80 - Math.floor(i / 2)),
    updated_at: iso(randInt(1, 30))
  }
})

export const mockProfiles: Profile[] = [...adminProfiles, ...driverProfiles, ...customerProfiles]
export const mockCustomers: Profile[] = customerProfiles
export const mockAdminUser = adminProfiles[0]

// ─── Categories (8) ─────────────────────────────────────────────
export const mockCategories: Category[] = [
  { id: uid('cat', 1), name: 'Bún tươi', slug: 'bun-tuoi', created_at: iso(100) },
  { id: uid('cat', 2), name: 'Bún khô', slug: 'bun-kho', created_at: iso(100) },
  { id: uid('cat', 3), name: 'Phở tươi', slug: 'pho-tuoi', created_at: iso(100) },
  { id: uid('cat', 4), name: 'Miến', slug: 'mien', created_at: iso(100) },
  { id: uid('cat', 5), name: 'Hủ tiếu', slug: 'hu-tieu', created_at: iso(90) },
  { id: uid('cat', 6), name: 'Bánh canh', slug: 'banh-canh', created_at: iso(90) },
  { id: uid('cat', 7), name: 'Miến dong', slug: 'mien-dong', created_at: iso(90) },
  { id: uid('cat', 8), name: 'Đồ gia dụng', slug: 'do-gia-dung', created_at: iso(80) }
]

// ─── Products (300+) ──────────────────────────────────────────────
// Base product definitions for programmatic generation
const productBases: Array<{
  name: string
  basePrice: number
  category: string
  unit: string
  desc: string
}> = [
  {
    name: 'Bún tươi',
    basePrice: 25000,
    category: 'Bún tươi',
    unit: 'kg',
    desc: 'Bún tươi làm thủ công mỗi ngày từ gạo tẻ nguyên chất.'
  },
  {
    name: 'Bún khô',
    basePrice: 35000,
    category: 'Bún khô',
    unit: 'kg',
    desc: 'Bún khô phơi nắng tự nhiên, bảo quản được lâu.'
  },
  {
    name: 'Phở tươi',
    basePrice: 40000,
    category: 'Phở tươi',
    unit: 'kg',
    desc: 'Bánh phở tươi mềm dẻo, làm từ gạo tẻ thơm.'
  },
  {
    name: 'Miến',
    basePrice: 45000,
    category: 'Miến',
    unit: 'kg',
    desc: 'Miến dong nguyên chất từ tinh bột khoai lang.'
  },
  {
    name: 'Hủ tiếu',
    basePrice: 38000,
    category: 'Hủ tiếu',
    unit: 'kg',
    desc: 'Hủ tiếu tươi miền Nam, mềm, dẻo.'
  },
  {
    name: 'Bánh canh',
    basePrice: 35000,
    category: 'Bánh canh',
    unit: 'kg',
    desc: 'Bánh canh tươi sợi to, dai, nấu bò hoặc giò heo.'
  },
  {
    name: 'Miến dong',
    basePrice: 48000,
    category: 'Miến dong',
    unit: 'kg',
    desc: 'Miến dong 100% tinh bột khoai lang tự nhiên.'
  },
  {
    name: 'Đồ gia dụng',
    basePrice: 85000,
    category: 'Đồ gia dụng',
    unit: 'cái',
    desc: 'Dụng cụ làm bún thủ công bằng gỗ tre, bền, đẹp.'
  }
]

const variants = [
  'sợi nhỏ',
  'sợi lớn',
  'sợi vừa',
  'đặc biệt',
  'cao cấp',
  'nứt thủ công',
  'gạo lứt',
  'nghệ',
  'trà xanh',
  'đen'
]
const packaging = [
  { suffix: '', unit: 'kg', priceMult: 1 },
  { suffix: 'hộp 500g', unit: 'hộp', priceMult: 1.2 },
  { suffix: 'gói 1kg', unit: 'gói', priceMult: 1.1 },
  { suffix: 'combo 5kg', unit: 'combo', priceMult: 4.8 },
  { suffix: 'combo 10kg', unit: 'combo', priceMult: 9.5 }
]

const productDescs = [
  'Sợi đều, không bị dính, đậm vị gạo truyền thống.',
  'Làm thủ công mỗi ngày từ gạo tẻ nguyên chất.',
  'Phù hợp cho nhà hàng và quán ăn.',
  'Bảo quản được lâu, dễ nấu, tiện lợi.',
  'Cao cấp, chọn lọc từ những mẻ ngon nhất.',
  'Tốt cho người ăn kiêng, giàu chất xơ.',
  'Màu vàng tự nhiên, giàu curcumin.',
  'Kết hợp trà xanh Nhật Bản, độc đáo.',
  'Đóng gói đẹp, tiện lợi cho đại lý.',
  'Sợi giòn, dai, đậm đà vị gạo.'
]

function generateProducts(): Product[] {
  const products: Product[] = []
  let counter = 0
  for (const base of productBases) {
    const cat = mockCategories.find((c) => c.name === base.category)!
    // Base product
    products.push({
      id: uid('prd', ++counter),
      category_id: cat.id,
      category: cat,
      name: base.name,
      slug: `${base.name
        .toLowerCase()
        .replace(/[^a-z0-9\u00C0-\u1EF9]+/g, '-')
        .replace(/^-|-$/g, '')}`,
      description: base.desc,
      price: base.basePrice,
      stock: randInt(20, 300),
      unit: base.unit,
      image_url: `https://picsum.photos/seed/buntech-prod-${counter}/600/600`,
      status: 'ACTIVE',
      deleted_at: null,
      created_at: iso(60 - counter),
      updated_at: iso(randInt(0, 30))
    })
    // Variant × packaging combinations
    for (const variant of variants) {
      for (const pkg of packaging) {
        counter++
        if (counter > 320) break
        const name = `${base.name} ${variant}${pkg.suffix ? ' ' + pkg.suffix : ''}`
        const price =
          Math.round(
            (base.basePrice * pkg.priceMult * (1 + variants.indexOf(variant) * 0.05)) / 1000
          ) * 1000
        const stock = base.category === 'Đồ gia dụng' ? randInt(5, 30) : randInt(0, 400)
        products.push({
          id: uid('prd', counter),
          category_id: cat.id,
          category: cat,
          name,
          slug: name
            .toLowerCase()
            .replace(/[^a-z0-9\u00C0-\u1EF9]+/g, '-')
            .replace(/^-|-$/g, ''),
          description: `${base.desc} ${pick(productDescs)}`,
          price,
          stock,
          unit: pkg.unit,
          image_url: `https://picsum.photos/seed/buntech-prod-${counter}/600/600`,
          status: stock === 0 || counter % 47 === 0 ? 'INACTIVE' : 'ACTIVE',
          deleted_at: null,
          created_at: iso(Math.max(0, 60 - counter)),
          updated_at: iso(randInt(0, 30))
        })
      }
      if (counter > 320) break
    }
    if (counter > 320) break
  }
  return products
}

export const mockProducts: Product[] = generateProducts()

// ─── Addresses (60+) ─────────────────────────────────────────────
const hcmStreets = [
  'Nguyễn Văn Linh',
  'Lê Lợi',
  'Trần Hưng Đạo',
  'Điện Biên Phủ',
  'Pasteur',
  'Cách Mạng Tháng 8',
  'Hai Bà Trưng',
  'Lý Thường Kiệt',
  'Võ Văn Tần',
  'Nguyễn Trãi',
  'Tôn Thất Tùng',
  'Phạm Văn Đồng',
  'Trần Quang Khải',
  'Nguyễn Thái Học',
  'Cống Quỳnh',
  'Bùi Thị Xuân',
  'Ung Văn Khiêm',
  'Lê Quang Định',
  'Phan Xích Long',
  'Nguyễn Kiệm',
  'Lac Long Quân',
  'Tân Sơn',
  'Hồng Bàng',
  'An Dương Vương',
  'Hùng Vương'
]
const hcmWards = [
  'Phường 1',
  'Phường 3',
  'Phường 4',
  'Phường 5',
  'Phường 6',
  'Phường 7',
  'Phường Bến Nghé',
  'Phường Cầu Ông Lãnh',
  'Phường Tân Định',
  'Phường 25'
]
const hcmDistricts = [
  'Quận 1',
  'Quận 3',
  'Quận 5',
  'Quận 10',
  'Bình Thạnh',
  'Tân Bình',
  'Phú Nhuận',
  'Gò Vấp'
]

export const mockAddresses: Address[] = Array.from({ length: 60 }, (_, i) => {
  const custIdx = i % customerProfiles.length
  const cust = customerProfiles[custIdx]!
  return {
    id: uid('addr', i + 1),
    userId: cust.id,
    fullName: cust.full_name,
    phone: cust.phone,
    addressLine: `${randInt(1, 300)} ${pick(hcmStreets)}`,
    ward: pick(hcmWards),
    district: pick(hcmDistricts),
    province: 'TP. HCM',
    isDefault: i % 4 === 0,
    createdAt: iso(50 - i)
  }
})

// ─── Custom Prices (60+) ─────────────────────────────────────────
export const mockCustomPrices: CustomPrice[] = Array.from({ length: 60 }, (_, i) => {
  const cust = customerProfiles[i % customerProfiles.length]!
  const prod = mockProducts[i % mockProducts.length]!
  return {
    id: uid('cpr', i + 1),
    user_id: cust.id,
    product_id: prod.id,
    price: Math.round((prod.price * (0.8 + (i % 5) * 0.04)) / 1000) * 1000,
    created_at: iso(50 - i)
  }
})

// ─── Orders (500+) ────────────────────────────────────────────────
const allCustomerIds = customerProfiles.map((p) => p.id)
const allDriverIds = driverProfiles.filter((p) => p.status === 'ACTIVE').map((p) => p.id)
const orderStatusWeights = [
  'PENDING',
  'PENDING',
  'PENDING',
  'PROCESSING',
  'PROCESSING',
  'PROCESSING',
  'DELIVERING',
  'DELIVERING',
  'DELIVERING',
  'DELIVERING',
  'DELIVERED',
  'DELIVERED',
  'DELIVERED',
  'DELIVERED',
  'DELIVERED',
  'DELIVERED',
  'DELIVERED',
  'DELIVERED',
  'DELIVERED',
  'CANCELLED'
]
const orderNotes = [
  'Giao buổi sáng',
  'Giao buổi chiều',
  'Giao gấp',
  '',
  '',
  'Đơn sỉ lớn',
  'Khách quen',
  '',
  'Giao trước 9h',
  '',
  'Đóng gói cẩn thận',
  'Giao tận nhà'
]

function generateOrders(): Order[] {
  const orders: Order[] = []
  let itemCounter = 1
  for (let i = 0; i < 500; i++) {
    const cust = allCustomerIds[i % allCustomerIds.length]!
    const status = orderStatusWeights[i % orderStatusWeights.length]!
    const hasDriver = status !== 'PENDING' && status !== 'CANCELLED' && i % 5 !== 0
    const driver = hasDriver ? allDriverIds[i % allDriverIds.length]! : null
    const driverProfile = driver ? mockProfiles.find((p) => p.id === driver) || null : null
    const custProfile = mockProfiles.find((p) => p.id === cust) || null
    const daysAgo = Math.floor(i / 6) % 90
    const itemCount = (i % 4) + 1
    const items: OrderItem[] = []
    let total = 0
    for (let j = 0; j < itemCount; j++) {
      const prod = mockProducts[(i * 3 + j) % mockProducts.length]!
      const qty = ((i + j) % 18) + 2
      const customPrice = mockCustomPrices.find(
        (cp) => cp.user_id === cust && cp.product_id === prod.id
      )
      const price = customPrice?.price || prod.price
      total += qty * price
      items.push({
        id: uid('itm', itemCounter++),
        order_id: uid('ord', i + 1),
        product_id: prod.id,
        product: prod,
        product_name: prod.name,
        quantity: qty,
        price,
        created_at: iso(daysAgo)
      })
    }
    const isGuest = i % 10 === 0
    const addr = `${randInt(1, 300)} ${pick(hcmStreets)}, ${pick(hcmDistricts)}`
    orders.push({
      id: uid('ord', i + 1),
      user_id: isGuest ? null : cust,
      driver_id: driver,
      driver: driverProfile,
      user: isGuest ? null : custProfile,
      status,
      total,
      amount_collected:
        status === 'DELIVERED' ? total : status === 'DELIVERING' ? Math.floor(total * 0.5) : 0,
      guest_info: isGuest ? { name: 'Khách vãng lai', phone: '0987654321', address: addr } : null,
      shipping_address: addr,
      note: pick(orderNotes),
      updated_at: iso(Math.max(0, daysAgo - 1)),
      created_at: iso(daysAgo),
      order_items: items
    })
  }
  return orders.sort((a, b) => b.created_at.localeCompare(a.created_at))
}

export const mockOrders: Order[] = generateOrders()

// ─── Order Items (flattened) ────────────────────────────────────
export const mockOrderItems: OrderItem[] = mockOrders.flatMap((o) => o.order_items || [])

// ─── Transactions (100+) ──────────────────────────────────────────
function generateTransactions(): Transaction[] {
  const txns: Transaction[] = []
  const types = ['DEBT_INCREASE', 'DEBT_INCREASE', 'DEBT_PAYMENT', 'PAYMENT', 'REFUND']
  for (let i = 0; i < 120; i++) {
    const cust = allCustomerIds[i % allCustomerIds.length]!
    const custProfile = mockProfiles.find((p) => p.id === cust) || null
    const type = types[i % types.length]!
    const order = mockOrders.find((o) => o.user_id === cust)
    const amount =
      type === 'DEBT_INCREASE'
        ? order?.total || randInt(200000, 2000000)
        : type === 'DEBT_PAYMENT'
          ? randInt(100000, 1000000)
          : type === 'PAYMENT'
            ? randInt(50000, 500000)
            : randInt(50000, 200000)
    txns.push({
      id: uid('txn', i + 1),
      user_id: cust,
      user: custProfile,
      order_id: type === 'DEBT_INCREASE' ? order?.id || null : null,
      type,
      amount,
      note:
        type === 'DEBT_INCREASE'
          ? `Đơn hàng ${order?.id?.slice(0, 8) || ''}`
          : type === 'DEBT_PAYMENT'
            ? 'Thanh toán tiền nợ'
            : type === 'PAYMENT'
              ? 'Thu tiền giao hàng'
              : 'Hoàn tiền đơn hủy',
      created_at: iso(i % 90)
    })
  }
  return txns.sort((a, b) => b.created_at.localeCompare(a.created_at))
}

export const mockTransactions: Transaction[] = generateTransactions()

// ─── Product Reviews (50+) ───────────────────────────────────────
const reviewContent = [
  'Bún tươi ngon lắm, sợi đều và không bị dính!',
  'Bún ngon nhưng giao hàng hơi chậm hôm đó.',
  'Bún lớn rất hợp để bán bún bò, khách khen nhiều.',
  'Bún khô thì bình thường, cần cải thiện đóng gói.',
  'Phở tươi mềm dẻo quá, sẽ đặt thêm!',
  'Chất lượng ổn, giá hợp lý cho đại lý.',
  'Bún giao còn nóng, khách quán thích lắm.',
  'Đóng gói đẹp, bún không bị gãy.',
  'Bún nứt thủ công ngon nhất, vị gạo đậm.',
  'Miến dong giòn, nấu canh mọc rất ngon.',
  'Hủ tiếu tươi mềm, nấu hủ tiếu Nam Vang chuẩn vị.',
  'Bánh canh dai, nấu bò rất đậm đà.',
  'Sẽ tiếp tục ủng hộ, bún ngon và sạch.',
  'Giá sỉ tốt hơn các nơi khác, chất lượng ổn.',
  'Giao hàng đúng giờ, bún còn tươi.',
  'Bún gạo lứt tốt cho người ăn kiêng, sẽ mua lại.',
  'Phở khô ngon, ngâm nước nhanh, tiện lợi.',
  'Bún nghệ màu đẹp, nấu bún riêu rất hợp.',
  'Miến dong cao cấp xứng đáng tiền, sợi giòn.',
  'Bún tươi cao cấp hộp tiện lợi, sạch sẽ.',
  'Chất lượng giảm so với trước, mong cải thiện.',
  'Hủ tiếu dai, ăn không bị nhão, rất tốt.',
  'Bánh canh gạo lứt lạ miệng, tốt cho sức khỏe.',
  'Phở gạo lứt dai, phù hợp người tiểu đường.',
  'Khuôn ép bún thủ công đẹp, dùng được lâu.',
  'Sợi bún đều, không bị dính, đóng gói đẹp.',
  'Giao nhanh, bún còn nóng hổi, rất hài lòng.',
  'Đặt sỉ lần đầu, chất lượng vượt mong đợi.',
  'Bún tươi ngon, sẽ giới thiệu cho bạn bè.',
  'Miến dong nấu canh rất ngon, sợi giòn.'
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mockProductReviews: any[] = Array.from({ length: 60 }, (_, i) => {
  const prod = mockProducts[i % mockProducts.length]!
  const cust = customerProfiles[i % customerProfiles.length]!
  return {
    id: i + 1,
    productId: prod.id,
    userId: cust.id,
    rating: [5, 4, 5, 3, 5, 4, 5, 4, 5, 4, 5, 5, 5, 4, 5, 5, 4, 5, 5, 5, 3, 5, 4, 5, 4][i % 25]!,
    content: reviewContent[i % reviewContent.length]!,
    isApproved: i % 4 !== 0,
    hasPurchased: true,
    replyContent: i % 3 === 0 ? 'Cảm ơn anh/chị! Chúng tôi luôn cố gắng giữ chất lượng.' : null,
    repliedBy: i % 3 === 0 ? 1 : null,
    createdAt: iso(Math.max(0, 30 - Math.floor(i / 2))),
    user: { id: cust.id, fullName: cust.full_name }
  }
})

// ─── Inventory Items (20+) ────────────────────────────────────────
const inventoryData: Array<[string, string, number]> = [
  ['Gạo tẻ nguyên liệu', 'kg', 500],
  ['Gạo lứt nguyên liệu', 'kg', 120],
  ['Gạo nhật nguyên liệu', 'kg', 80],
  ['Tinh bột khoai lang', 'kg', 80],
  ['Tinh bột gạo', 'kg', 200],
  ['Dầu thực vật', 'lít', 30],
  ['Bao bì PE 500g', 'cái', 1000],
  ['Bao bì PE 1kg', 'cái', 800],
  ['Bao bì PE 5kg', 'cái', 300],
  ['Hộp nhựa 500g', 'cái', 500],
  ['Hộp nhựa 1kg', 'cái', 300],
  ['Muối', 'kg', 50],
  ['Nước lọc', 'lít', 200],
  ['Chất ổn định (tự nhiên)', 'kg', 5],
  ['Tem nhãn', 'cái', 2000],
  ['Dây thắt buộc', 'cái', 1500],
  ['Khoai lang tươi', 'kg', 300],
  ['Nghệ tươi', 'kg', 40],
  ['Trà xanh bột', 'kg', 15],
  ['Bột gạo lứt', 'kg', 100],
  ['Chất bảo quản tự nhiên', 'kg', 8],
  ['Khay vận chuyển', 'cái', 200]
]

export const mockInventoryItems: InventoryItem[] = inventoryData.map((item, i) => ({
  id: uid('inv', i + 1),
  name: item[0],
  unit: item[1],
  quantity: item[2],
  deleted_at: null,
  created_at: iso(80 - i * 3),
  updated_at: iso(i)
}))

// ─── Inventory Movements (50+) ────────────────────────────────────
const movementTypes = ['IMPORT', 'IMPORT', 'EXPORT', 'LOSS']
const movementNotes = [
  'Nhập mới từ nhà cung cấp',
  'Nhập thêm nguyên liệu',
  'Xuất sản xuất',
  'Hao hụt tự nhiên',
  'Nhập kho',
  'Xuất sản xuất theo đơn',
  'Kiểm kê điều chỉnh',
  'Nhập kho đầu ngày'
]

export const mockInventoryMovements: InventoryMovement[] = Array.from({ length: 60 }, (_, i) => {
  const item = mockInventoryItems[i % mockInventoryItems.length]!
  const type = movementTypes[i % movementTypes.length]!
  return {
    id: uid('mov', i + 1),
    inventory_id: item.id,
    inventory_item: item,
    type,
    quantity: randInt(20, 200),
    note: movementNotes[i % movementNotes.length] || '',
    created_at: iso(Math.max(0, 30 - Math.floor(i / 3)))
  }
})

// ─── Blog Categories (5) ─────────────────────────────────────────
export const mockBlogCategories: BlogCategory[] = [
  {
    id: 1,
    name: 'Tin tức',
    slug: 'tin-tuc',
    description: '',
    createdAt: iso(90),
    updatedAt: iso(90)
  },
  {
    id: 2,
    name: 'Kiến thức',
    slug: 'kien-thuc',
    description: '',
    createdAt: iso(90),
    updatedAt: iso(90)
  },
  {
    id: 3,
    name: 'Công thức nấu ăn',
    slug: 'cong-thuc-nau-an',
    description: '',
    createdAt: iso(90),
    updatedAt: iso(90)
  },
  {
    id: 4,
    name: 'Sức khỏe',
    slug: 'suc-khoe',
    description: '',
    createdAt: iso(85),
    updatedAt: iso(85)
  },
  {
    id: 5,
    name: 'Khuyến mãi',
    slug: 'khuyen-mai',
    description: '',
    createdAt: iso(80),
    updatedAt: iso(80)
  }
]

// ─── Blog Posts (50+) ─────────────────────────────────────────────
const blogData: Array<[string, string, string, string, string, number]> = [
  [
    'BunTech - Hành trình 3 đời làm bún thủ công',
    'Câu chuyện gia đình BunTech từ xưởng bún nhỏ đến thương hiệu uy tín.',
    '<p>Xưởng bún BunTech bắt đầu từ năm 1960 với ông bà nội. Từ những mẻ bún nhỏ làm bằng tay, đến nay chúng tôi đã mở rộng quy mô nhưng vẫn giữ phương pháp thủ công truyền thống.</p><h2>Giá trị cốt lõi</h2><p>Chúng tôi cam kết sử dụng gạo nguyên chất, không chất bảo quản, không chất tẩy trắng.</p>',
    'Tin tức',
    'https://images.pexels.com/photos/6711698/pexels-photo-6711698.jpeg?auto=compress&cs=tinysrgb&w=800',
    20
  ],
  [
    'Cách phân biệt bún tươi và bún khô',
    'Bún tươi và bún khô có gì khác nhau? Cách chọn bún ngon.',
    '<p>Bún tươi là loại vừa làm xong, sợi mềm, dùng trong ngày. Bún khô là bún đã phơi khô, bảo quản lâu hơn.</p>',
    'Kiến thức',
    'https://images.pexels.com/photos/6711687/pexels-photo-6711687.jpeg?auto=compress&cs=tinysrgb&w=800',
    18
  ],
  [
    'Công thức bún bò huế chuẩn vị',
    'Hướng dẫn nấu bún bò huế thơm ngon với bún tươi BunTech.',
    '<p>Bún bò huế là món ăn nổi tiếng miền Trung. Với bún tươi BunTech, bạn sẽ có món bún bò huế chuẩn vị.</p><h2>Nguyên liệu</h2><p>- 500g bún tươi lớn BunTech<br>- 1kg bò bắp<br>- Xương ống heo</p>',
    'Công thức nấu ăn',
    'https://images.pexels.com/photos/36769199/pexels-photo-36769199.jpeg?auto=compress&cs=tinysrgb&w=800',
    15
  ],
  [
    'BunTech mở rộng giao hàng toàn thành phố',
    'Dịch vụ giao hàng mở rộng đến tất cả các quận tại TP. HCM.',
    '<p>Từ tháng này, BunTech mở rộng khu vực giao hàng đến tất cả các quận tại TP. HCM.</p>',
    'Tin tức',
    'https://images.pexels.com/photos/6711678/pexels-photo-6711678.jpeg?auto=compress&cs=tinysrgb&w=800',
    12
  ],
  [
    '5 món bún ngon dễ nấu tại nhà',
    'Tổng hợp 5 món bún ngon, dễ nấu, phù hợp cho gia đình.',
    '<p>Bún riêu, bún chả, bún bò huế, bún thịt nướng, bún ốc.</p>',
    'Công thức nấu ăn',
    'https://images.pexels.com/photos/4541405/pexels-photo-4541405.jpeg?auto=compress&cs=tinysrgb&w=800',
    10
  ],
  [
    'Lợi ích của bún gạo lứt đối với sức khỏe',
    'Bún gạo lứt giàu chất xơ, tốt cho người ăn kiêng.',
    '<p>Bún gạo lứt là lựa chọn lành mạnh, giàu chất xơ, chỉ số đường huyết thấp.</p>',
    'Sức khỏe',
    'https://images.pexels.com/photos/4541393/pexels-photo-4541393.jpeg?auto=compress&cs=tinysrgb&w=800',
    8
  ],
  [
    'Khuyến mãi tháng 8: Giảm 10% cho đơn sỉ',
    'Cơ hội vàng cho đại lý với ưu đãi giảm 10% cho đơn hàng trên 5kg.',
    '<p>Tháng 8, BunTech giảm 10% cho tất cả đơn hàng sỉ trên 5kg.</p>',
    'Khuyến mãi',
    'https://images.pexels.com/photos/4541341/pexels-photo-4541341.jpeg?auto=compress&cs=tinysrgb&w=800',
    7
  ],
  [
    'Cách bảo quản bún tươi được lâu',
    'Mẹo bảo quản bún tươi trong tủ lạnh được 3-5 ngày.',
    '<p>Bún tươi nên bảo quản trong tủ lạnh ở 2-4°C.</p>',
    'Kiến thức',
    'https://images.pexels.com/photos/30705635/pexels-photo-30705635.jpeg?auto=compress&cs=tinysrgb&w=800',
    6
  ],
  [
    'Công thức bún chả Hà Nội chuẩn vị',
    'Hướng dẫn làm bún chả Hà Nội với bún tươi BunTech.',
    '<p>Bún chả Hà Nội là món ăn biểu tượng của thủ đô.</p>',
    'Công thức nấu ăn',
    'https://images.pexels.com/photos/38802734/pexels-photo-38802734.jpeg?auto=compress&cs=tinysrgb&w=800',
    5
  ],
  [
    'BunTech đạt chứng nhận VSATTP 2024',
    'Xưởng bún BunTech đạt chứng nhận vệ sinh an toàn thực phẩm.',
    '<p>BunTech tự hào đạt chứng nhận VSATTP 2024.</p>',
    'Tin tức',
    'https://images.pexels.com/photos/6711698/pexels-photo-6711698.jpeg?auto=compress&cs=tinysrgb&w=800',
    4
  ],
  [
    'Miến dong BunTech: Từ nông trại đến bàn ăn',
    'Hành trình sản xuất miến dong từ tinh bột khoai lang.',
    '<p>Miến dong BunTech được làm từ tinh bột khoai lang tự nhiên.</p>',
    'Kiến thức',
    'https://images.pexels.com/photos/4541405/pexels-photo-4541405.jpeg?auto=compress&cs=tinysrgb&w=800',
    3
  ],
  [
    'Công thức bún riêu cua đồng',
    'Bún riêu cua đồng thanh mát, perfect cho mùa hè.',
    '<p>Bún riêu cua đồng là món ăn thanh mát, dễ nấu.</p>',
    'Công thức nấu ăn',
    'https://images.pexels.com/photos/4541393/pexels-photo-4541393.jpeg?auto=compress&cs=tinysrgb&w=800',
    2
  ],
  [
    'Top 10 quán bún ngon nhất TP. HCM',
    'Gợi ý 10 quán bún ngon nhất Sài Gòn.',
    '<p>Top 10 quán bún ngon nhất TP. HCM.</p>',
    'Tin tức',
    'https://images.pexels.com/photos/6711687/pexels-photo-6711687.jpeg?auto=compress&cs=tinysrgb&w=800',
    2
  ],
  [
    'Bún nghệ: Vàng trong ẩm thực Việt',
    'Bún nghệ giàu curcumin tốt cho sức khỏe.',
    '<p>Bún nghệ có màu vàng tự nhiên từ nghệ.</p>',
    'Sức khỏe',
    'https://images.pexels.com/photos/36769199/pexels-photo-36769199.jpeg?auto=compress&cs=tinysrgb&w=800',
    1
  ],
  [
    'Khuyến mãi: Miễn phí giao hàng cho đơn đầu tiên',
    'Khách hàng mới được miễn phí giao hàng.',
    '<p>Đặt hàng lần đầu tại BunTech, được miễn phí giao hàng!</p>',
    'Khuyến mãi',
    'https://images.pexels.com/photos/4541341/pexels-photo-4541341.jpeg?auto=compress&cs=tinysrgb&w=800',
    1
  ],
  [
    'Cách chọn gạo làm bún ngon',
    'Gạo là nguyên liệu quan trọng nhất quyết định chất lượng bún.',
    '<p>Để làm bún ngon, cần chọn gạo tẻ có hàm lượng tinh bột cao.</p>',
    'Kiến thức',
    'https://images.pexels.com/photos/6711678/pexels-photo-6711678.jpeg?auto=compress&cs=tinysrgb&w=800',
    0
  ],
  [
    'Công thức hủ tiếu Nam Vang chuẩn',
    'Hủ tiếu Nam Vang với hủ tiếu tươi BunTech.',
    '<p>Hủ tiếu Nam Vang là món ăn đậm chất Nam Bộ.</p>',
    'Công thức nấu ăn',
    'https://images.pexels.com/photos/30705635/pexels-photo-30705635.jpeg?auto=compress&cs=tinysrgb&w=800',
    0
  ],
  [
    'Bún tươi vs bún đóng hộp: Nên chọn loại nào?',
    'So sánh bún tươi và bún đóng hộp.',
    '<p>Bún tươi ngon hơn nhưng bảo quản ngắn.</p>',
    'Kiến thức',
    'https://images.pexels.com/photos/38802734/pexels-photo-38802734.jpeg?auto=compress&cs=tinysrgb&w=800',
    0
  ],
  [
    'Sức khỏe tiêu hóa và bún gạo lứt',
    'Bún gạo lứt giàu chất xơ, tốt cho hệ tiêu hóa.',
    '<p>Bún gạo lứt chứa nhiều chất xơ, giúp cải thiện hệ tiêu hóa.</p>',
    'Sức khỏe',
    'https://images.pexels.com/photos/4541405/pexels-photo-4541405.jpeg?auto=compress&cs=tinysrgb&w=800',
    0
  ],
  [
    'BunTech ra mắt app đặt hàng online',
    'Đặt bún online nhanh chóng, tiện lợi.',
    '<p>BunTech chính thức ra mắt ứng dụng đặt hàng online.</p>',
    'Tin tức',
    'https://images.pexels.com/photos/6711698/pexels-photo-6711698.jpeg?auto=compress&cs=tinysrgb&w=800',
    0
  ],
  [
    'Công thức bún ốc đậm vị Bắc',
    'Bún ốc Hà Nội với bún tươi BunTech.',
    '<p>Bún ốc là món ăn đặc sản miền Bắc.</p>',
    'Công thức nấu ăn',
    'https://images.pexels.com/photos/4541393/pexels-photo-4541393.jpeg?auto=compress&cs=tinysrgb&w=800',
    0
  ],
  [
    'Ung thư dạ dày và thực phẩm an toàn',
    'Chọn thực phẩm sạch, không chất bảo quản.',
    '<p>Thực phẩm sạch là chìa khóa để phòng tránh bệnh tiêu hóa.</p>',
    'Sức khỏe',
    'https://images.pexels.com/photos/6711687/pexels-photo-6711687.jpeg?auto=compress&cs=tinysrgb&w=800',
    0
  ],
  [
    'Ưu đãi cuối năm: Mua 10 tặng 1',
    'Chương trình khuyến mãi cuối năm cho đại lý.',
    '<p>Mua 10kg bún tươi bất kỳ, tặng 1kg.</p>',
    'Khuyến mãi',
    'https://images.pexels.com/photos/4541341/pexels-photo-4541341.jpeg?auto=compress&cs=tinysrgb&w=800',
    0
  ],
  [
    'Cách nhận biết bún có chứa hàn the',
    'Mẹo nhận biết bún an toàn.',
    '<p>Bún có hàn the thường quá trắng, giòn bất thường.</p>',
    'Kiến thức',
    'https://images.pexels.com/photos/36769199/pexels-photo-36769199.jpeg?auto=compress&cs=tinysrgb&w=800',
    0
  ]
]

// Generate additional blog posts programmatically to reach 50+
const blogTitleTemplates: Array<[string, string]> = [
  ['Bún tươi BunTech giao hàng trong 2 giờ', 'Tin tức'],
  ['Công thức phở bò đậm đà hương vị Bắc', 'Công thức nấu ăn'],
  ['Miến dong nấu canh mọc: Tuyệt chiếu nhà hàng', 'Công thức nấu ăn'],
  ['Bún gạo lứt và tiểu đường: Giải pháp cho người bệnh', 'Sức khỏe'],
  ['BunTech tham gia hội chợ thực phẩm 2024', 'Tin tức'],
  ['Cách làm bánh canh giò heo ngon chuẩn vị', 'Công thức nấu ăn'],
  ['Khuyến mãi trung thu: Combo bún tươi tặng quà', 'Khuyến mãi'],
  ['Hủ tiếu dai: Bí quyết tạo sợi hoàn hảo', 'Kiến thức'],
  ['Bún nghệ và những lợi ích sức khỏe bất ngờ', 'Sức khỏe'],
  ['Quy trình sản xuất bún tươi tại BunTech', 'Tin tức'],
  ['Công thức bún thịt nướng đậm vị miền Nam', 'Công thức nấu ăn'],
  ['Cách bảo quản bún khô được 6 tháng', 'Kiến thức'],
  ['Phở tươi vs phở khô: Đâu là lựa chọn tốt nhất', 'Kiến thức'],
  ['BunTech ký hợp đồng với 10 đại lý mới', 'Tin tức'],
  ['Công thức miến trộn chua cay ngon tuyệt', 'Công thức nấu ăn'],
  ['Khuyến mãi Black Friday: Giảm 20% toàn bộ sản phẩm', 'Khuyến mãi'],
  ['Bún tươi hộp: Tiện lợi cho cuộc sống hiện đại', 'Kiến thức'],
  ['Phở gạo lứt: Lựa chọn lành mạnh cho gia đình', 'Sức khỏe'],
  ['BunTech đạt giải thưởng thương hiệu uy tín 2024', 'Tin tức'],
  ['Cách chọn bún tươi ngon tại chợ', 'Kiến thức'],
  ['Công thức bún bò nướng đậm đà', 'Công thức nấu ăn'],
  ['Sức khỏe tim mạch và thực phẩm nguyên cám', 'Sức khỏe'],
  ['Ưu đãi Tết: Combo quà tặng bún khô cao cấp', 'Khuyến mãi'],
  ['Bún đen: Đặc sản mới của BunTech', 'Tin tức'],
  ['Cách làm miến dong xào tỏi thơm ngon', 'Công thức nấu ăn'],
  ['Bún và văn hóa ẩm thực Việt Nam', 'Kiến thức'],
  ['BunTech ra mắt dòng sản phẩm hữu cơ', 'Tin tức'],
  ['Công thức canh miến dong thịt nạc', 'Công thức nấu ăn'],
  ['Khuyến mãi hè: Freeship toàn thành', 'Khuyến mãi']
]

const blogImagePool = [
  'https://images.pexels.com/photos/6711698/pexels-photo-6711698.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/6711687/pexels-photo-6711687.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/4541405/pexels-photo-4541405.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/4541393/pexels-photo-4541393.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/4541341/pexels-photo-4541341.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/36769199/pexels-photo-36769199.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/30705635/pexels-photo-30705635.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/38802734/pexels-photo-38802734.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/6711678/pexels-photo-6711678.jpeg?auto=compress&cs=tinysrgb&w=800'
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const baseBlogPosts: any[] = blogData.map((b, i) => {
  const cat = mockBlogCategories.find((c) => c.name === b[3])!
  const author = mockProfiles[Math.floor(i % 2)]
  return {
    id: uid('blg', i + 1),
    category_id: cat.id,
    category: cat,
    title: b[0],
    slug: b[0]
      .toLowerCase()
      .replace(/[^a-z0-9\u00C0-\u1EF9]+/g, '-')
      .replace(/^-|-$/g, ''),
    excerpt: b[1],
    content: b[2],
    image_url: b[4],
    featured_image: b[4],
    author_name: author?.full_name || 'BunTech',
    published_at: i < 18 ? iso(b[5]) : null,
    status: i < 18 ? 'PUBLISHED' : 'DRAFT',
    deleted_at: null,
    created_at: iso(b[5] + 1),
    updated_at: iso(b[5])
  }
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const additionalBlogPosts: any[] = blogTitleTemplates.map((b, i) => {
  const cat = mockBlogCategories.find((c) => c.name === b[1])!
  const idx = i + blogData.length
  const title = b[0]
  const daysAgo = Math.max(0, 30 - i)
  const isPublished = i < 22
  return {
    id: uid('blg', idx + 1),
    category_id: cat.id,
    category: cat,
    title,
    slug: title
      .toLowerCase()
      .replace(/[^a-z0-9\u00C0-\u1EF9]+/g, '-')
      .replace(/^-|-$/g, ''),
    excerpt: `Bài viết về ${b[0].toLowerCase()}`,
    content: `<p>Nội dung chi tiết về ${b[0]}.</p><h2>Tìm hiểu thêm</h2><p>Chúng tôi cam kết mang đến thông tin hữu ích và chất lượng nhất cho khách hàng.</p>`,
    image_url: blogImagePool[i % blogImagePool.length]!,
    featured_image: blogImagePool[i % blogImagePool.length]!,
    author_name: mockProfiles[i % 2]?.full_name || 'BunTech',
    published_at: isPublished ? iso(daysAgo) : null,
    status: isPublished ? 'PUBLISHED' : 'DRAFT',
    deleted_at: null,
    created_at: iso(daysAgo + 1),
    updated_at: iso(daysAgo)
  }
})

export const mockBlogPosts: BlogPost[] = [...baseBlogPosts, ...additionalBlogPosts]

// ─── System Configs ─────────────────────────────────────────────
export const mockSystemConfigs: SystemConfig[] = [
  { id: uid('cfg', 1), key: 'workshop_name', value: 'Xưởng bún BunTech', updated_at: iso(10) },
  {
    id: uid('cfg', 2),
    key: 'workshop_address',
    value: '123 Lê Lợi, Phường Bến Nghé, Quận 1, TP. HCM',
    updated_at: iso(10)
  },
  { id: uid('cfg', 3), key: 'workshop_phone', value: '0901 234 567', updated_at: iso(10) },
  { id: uid('cfg', 4), key: 'currency', value: 'VND', updated_at: iso(10) },
  { id: uid('cfg', 5), key: 'workshop_email', value: 'contact@buntech.vn', updated_at: iso(10) },
  {
    id: uid('cfg', 6),
    key: 'workshop_hours',
    value: '6:00 - 18:00 (T2 - CN)',
    updated_at: iso(10)
  },
  { id: uid('cfg', 7), key: 'min_order_amount', value: '50000', updated_at: iso(10) },
  { id: uid('cfg', 8), key: 'delivery_fee', value: '30000', updated_at: iso(10) },
  { id: uid('cfg', 9), key: 'free_delivery_threshold', value: '500000', updated_at: iso(10) }
]

// ─── Dashboard KPI ───────────────────────────────────────────────
export const mockDashboardKPI: DashboardKPI = {
  revenueToday: 2840000,
  ordersToday: 14,
  newCustomers: 3,
  inventoryValue: 85000000
}

// ─── Revenue Data (7 days) ───────────────────────────────────────
export const mockRevenueData: RevenuePoint[] = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(now.getTime() - (6 - i) * 86400000)
  return {
    date: d.toISOString().slice(0, 10),
    revenue: [3200000, 4100000, 3800000, 5200000, 4800000, 6100000, 5400000][i]!
  }
})

// ─── Top Buyers ─────────────────────────────────────────────────
export const mockTopBuyers: TopBuyer[] = [
  {
    user_id: uid('usr', 53),
    full_name: customerProfiles[0]?.full_name || 'Phạm Thị Mai',
    avatar_url: avatarFor(customerProfiles[0]?.full_name || 'Phạm Thị Mai'),
    total: 18500000
  },
  {
    user_id: uid('usr', 60),
    full_name: customerProfiles[7]?.full_name || 'Trần Văn Hùng',
    avatar_url: avatarFor(customerProfiles[7]?.full_name || 'Trần Văn Hùng'),
    total: 14200000
  },
  {
    user_id: uid('usr', 54),
    full_name: customerProfiles[1]?.full_name || 'Hoàng Thị Hoa',
    avatar_url: avatarFor(customerProfiles[1]?.full_name || 'Hoàng Thị Hoa'),
    total: 9800000
  },
  {
    user_id: uid('usr', 56),
    full_name: customerProfiles[3]?.full_name || 'Vũ Thị Sỉ',
    avatar_url: avatarFor(customerProfiles[3]?.full_name || 'Vũ Thị Sỉ'),
    total: 7600000
  },
  {
    user_id: uid('usr', 57),
    full_name: customerProfiles[4]?.full_name || 'Bùi Văn Khách',
    avatar_url: avatarFor(customerProfiles[4]?.full_name || 'Bùi Văn Khách'),
    total: 5400000
  }
]

// ─── Vehicles (80+) ──────────────────────────────────────────────
const vehicleModels = [
  'Honda Wave Alpha',
  'Honda Blade',
  'Yamaha Sirius',
  'Suzuki GD110',
  'Honda Dream',
  'Yamaha Exciter',
  'Honda PCX',
  'Yamaha NVX',
  'Honda Air Blade',
  'Yamaha Latte',
  'Honda Vision',
  'Suzuki Viva'
]
const platePrefixes = ['51A', '59V', '50F', '51K', '59B', '50S', '51L', '59C', '50L', '51M']

export const mockVehicles: Vehicle[] = Array.from({ length: 80 }, (_, i) => {
  const driver =
    i < 45 ? driverProfiles[i]?.id || null : i < 50 ? driverProfiles[i]?.id || null : null
  const status = i < 56 ? 'ACTIVE' : i < 68 ? 'MAINTENANCE' : 'INACTIVE'
  return {
    id: uid('veh', i + 1),
    driver_id: driver,
    plate_number: `${platePrefixes[i % platePrefixes.length]}-${String(1000 + i * 7).slice(-5)}`,
    model: vehicleModels[i % vehicleModels.length]!,
    capacity: [50, 80, 100, 120, 150, 200, 250, 300][i % 8]!,
    status,
    last_maintenance: iso(randInt(5, 60)),
    created_at: iso(90 - i),
    updated_at: iso(randInt(1, 30))
  }
})

// ─── Notifications (100+) ─────────────────────────────────────────
const notifTitles: Array<[string, string]> = [
  ['ORDER_ASSIGNED', 'Đơn hàng mới được giao'],
  ['ORDER_DELIVERED', 'Đã giao hàng thành công'],
  ['ORDER_CANCELLED', 'Đơn hàng đã bị hủy'],
  ['LOW_STOCK', 'Cảnh báo tồn kho thấp'],
  ['NEW_REVIEW', 'Có đánh giá mới'],
  ['SYSTEM', 'Cập nhật hệ thống']
]
const notifMessages = [
  'Bạn có 1 đơn hàng giao hàng mới cần xử lý.',
  'Đơn hàng #ORD-0042 đã được giao thành công cho khách hàng.',
  'Đơn hàng #ORD-0035 đã bị khách hàng hủy.',
  'Sản phẩm Bún tươi sợi nhỏ sắp hết hàng (còn 5kg).',
  'Khách hàng Phạm Thị Mai vừa để lại đánh giá 5 sao.',
  'Hệ thống sẽ bảo trì vào lúc 2:00 sáng Chủ nhật.',
  'Vui lòng kiểm tra đơn hàng đang chờ xử lý.',
  'Đơn hàng quá hạn giao, cần xử lý gấp.',
  'Có 3 đơn hàng mới trong khu vực Quận 1.',
  'Báo cáo doanh thu tuần đã sẵn sàng.'
]

export const mockNotifications: Notification[] = Array.from({ length: 120 }, (_, i) => {
  const [type, title] = notifTitles[i % notifTitles.length]!
  return {
    id: uid('ntf', i + 1),
    user_id:
      i < 60
        ? driverProfiles[i % driverProfiles.length]?.id || null
        : customerProfiles[i % customerProfiles.length]?.id || null,
    type,
    title,
    message: notifMessages[i % notifMessages.length]!,
    is_read: i % 3 === 0,
    link: type === 'ORDER_ASSIGNED' ? `/driver/${uid('ord', i + 1)}` : null,
    created_at: iso(Math.max(0, Math.floor(i / 8)))
  }
})

// ─── Messages (100+) ──────────────────────────────────────────────
const messageContents = [
  'Anh/chị có thể giao trước 9h sáng không?',
  'Đơn hàng đã nhận, đang trên đường giao.',
  'Khách báo đổi địa chỉ giao hàng.',
  'Cảm ơn BunTech, bún rất ngon!',
  'Cho tôi hỏi giá sỉ cho bún tươi?',
  'Đã nhận hàng, cảm ơn tài xế.',
  'Giao chậm chút xíu, thông cảm nha.',
  'Đặt thêm 5kg bún tươi cho ngày mai.',
  'Bún hôm nay chất lượng tốt lắm!',
  'Cho tôi hủy đơn hàng #ORD-0023.',
  'Giao đến nơi rồi gọi điện cho em nhé.',
  'Có nhận giao hàng ngoại thành không?',
  'Cần xuất hóa đơn đỏ cho đơn này.',
  'Đơn hàng bị thiếu 2kg, nhờ kiểm tra lại.',
  'Cảm ơn dịch vụ giao hàng nhanh của BunTech.'
]

export const mockMessages: Message[] = Array.from({ length: 120 }, (_, i) => {
  const senderIsDriver = i % 3 === 0
  return {
    id: uid('msg', i + 1),
    sender_id: senderIsDriver
      ? driverProfiles[i % driverProfiles.length]?.id || null
      : customerProfiles[i % customerProfiles.length]?.id || null,
    receiver_id: senderIsDriver
      ? customerProfiles[i % customerProfiles.length]?.id || null
      : driverProfiles[i % driverProfiles.length]?.id || null,
    content: messageContents[i % messageContents.length]!,
    is_read: i % 2 === 0,
    created_at: iso(Math.max(0, Math.floor(i / 10)))
  }
})

// ─── Delivery Routes ──────────────────────────────────────────────
export const mockDeliveryRoutes: DeliveryRoute[] = Array.from({ length: 50 }, (_, i) => {
  const driver = driverProfiles[i % driverProfiles.length]!
  const routeOrders = mockOrders
    .filter((o) => o.driver_id === driver?.id && o.status !== 'PENDING')
    .slice(0, 5 + (i % 4))
  const completed = routeOrders.filter((o) => o.status === 'DELIVERED').length
  const status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' =
    i < 20 ? 'COMPLETED' : i < 35 ? 'IN_PROGRESS' : 'PENDING'
  return {
    id: uid('rte', i + 1),
    driver_id: driver?.id || '',
    date: iso(i),
    order_ids: routeOrders.map((o) => o.id),
    status,
    total_orders: routeOrders.length,
    completed_orders: completed,
    total_distance: randInt(5, 50),
    estimated_time: randInt(30, 180),
    created_at: iso(i)
  }
})
