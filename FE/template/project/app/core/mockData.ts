import { ref } from 'vue'
import type {
  Profile, Category, Product, Order, OrderItem, Transaction,
  BlogPost, BlogCategory, CustomPrice, ProductReview,
  InventoryItem, InventoryMovement, SystemConfig,
} from './types'
import {
  Role, OrderStatus, TransactionType, ProductStatus, UserStatus,
  BlogStatus, InventoryMovementType,
} from './enums'

// ─── Helper ───
export function generateId(): string {
  return crypto.randomUUID()
}

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

// ─── Users / Profiles ───
const MOCK_PASSWORD = '123456'
export interface MockUser {
  email: string
  password: string
  profile: Profile
}

export const mockUserAccounts: MockUser[] = [
  {
    email: 'admin@buntech.vn',
    password: MOCK_PASSWORD,
    profile: {
      id: '00000000-0000-0000-0000-000000000001',
      role: Role.ADMIN,
      phone: '0901000001',
      full_name: 'Nguyễn Văn Admin',
      status: UserStatus.ACTIVE,
      debt_limit: 0,
      avatar_url: null,
      created_at: daysAgo(90),
      updated_at: daysAgo(1),
    },
  },
  {
    email: 'khach1@buntech.vn',
    password: MOCK_PASSWORD,
    profile: {
      id: '00000000-0000-0000-0000-000000000002',
      role: Role.CUSTOMER,
      phone: '0901000002',
      full_name: 'Trần Thị Khách',
      status: UserStatus.ACTIVE,
      debt_limit: 5_000_000,
      avatar_url: null,
      created_at: daysAgo(60),
      updated_at: daysAgo(5),
    },
  },
  {
    email: 'khach2@buntech.vn',
    password: MOCK_PASSWORD,
    profile: {
      id: '00000000-0000-0000-0000-000000000003',
      role: Role.CUSTOMER,
      phone: '0901000003',
      full_name: 'Lê Văn Mua',
      status: UserStatus.ACTIVE,
      debt_limit: 3_000_000,
      avatar_url: null,
      created_at: daysAgo(45),
      updated_at: daysAgo(2),
    },
  },
  {
    email: 'taixe@buntech.vn',
    password: MOCK_PASSWORD,
    profile: {
      id: '00000000-0000-0000-0000-000000000004',
      role: Role.DRIVER,
      phone: '0901000004',
      full_name: 'Phạm Tài Xế',
      status: UserStatus.ACTIVE,
      debt_limit: 0,
      avatar_url: null,
      created_at: daysAgo(30),
      updated_at: daysAgo(3),
    },
  },
]

export const mockUsers = ref<Profile[]>(mockUserAccounts.map(u => ({ ...u.profile })))

// ─── Categories ───
export const mockCategories = ref<Category[]>([
  { id: 'cat-01', name: 'Bún tươi', slug: 'bun-tuoi', created_at: daysAgo(90) },
  { id: 'cat-02', name: 'Bún khô', slug: 'bun-kho', created_at: daysAgo(90) },
  { id: 'cat-03', name: 'Bún bò', slug: 'bun-bo', created_at: daysAgo(90) },
  { id: 'cat-04', name: 'Bún đặc biệt', slug: 'bun-dac-biet', created_at: daysAgo(90) },
])

// ─── Products ───
export const mockProducts = ref<Product[]>([
  {
    id: 'prod-01', category_id: 'cat-01', name: 'Bún tươi sợi nhỏ', slug: 'bun-tuoi-soi-nho',
    description: 'Bún tươi sợi nhỏ truyền thống, được làm từ gạo nguyên chất 100%. Sợi bún mềm mịn, dai vừa, thích hợp ăn với nước lèo hoặc bún chả.',
    price: 15000, stock: 200, unit: 'kg', image_url: null,
    status: ProductStatus.ACTIVE, deleted_at: null,
    created_at: daysAgo(80), updated_at: daysAgo(1),
  },
  {
    id: 'prod-02', category_id: 'cat-01', name: 'Bún tươi sợi to', slug: 'bun-tuoi-soi-to',
    description: 'Bún tươi sợi to đặc trưng, phù hợp với bún bò Huế, bún riêu. Sợi bún dày, giòn dai, giữ được độ tươi lâu.',
    price: 16000, stock: 150, unit: 'kg', image_url: null,
    status: ProductStatus.ACTIVE, deleted_at: null,
    created_at: daysAgo(80), updated_at: daysAgo(1),
  },
  {
    id: 'prod-03', category_id: 'cat-02', name: 'Bún khô truyền thống', slug: 'bun-kho-truyen-thong',
    description: 'Bún khô phơi nắng tự nhiên, bảo quản được lâu. Chỉ cần ngâm nước 15 phút là có bún ngon như tươi.',
    price: 35000, stock: 100, unit: 'kg', image_url: null,
    status: ProductStatus.ACTIVE, deleted_at: null,
    created_at: daysAgo(70), updated_at: daysAgo(3),
  },
  {
    id: 'prod-04', category_id: 'cat-02', name: 'Bún khô sợi vàng', slug: 'bun-kho-soi-vang',
    description: 'Bún khô sợi vàng đặc biệt, sử dụng gạo lứt. Giàu chất xơ, tốt cho sức khỏe.',
    price: 42000, stock: 80, unit: 'kg', image_url: null,
    status: ProductStatus.ACTIVE, deleted_at: null,
    created_at: daysAgo(65), updated_at: daysAgo(5),
  },
  {
    id: 'prod-05', category_id: 'cat-03', name: 'Bún bò Huế sợi to', slug: 'bun-bo-hue-soi-to',
    description: 'Bún bò Huế sợi to chính gốc, được chế biến theo công thức truyền thống. Sợi bún dày, dai, thấm đều nước lèo.',
    price: 20000, stock: 120, unit: 'kg', image_url: null,
    status: ProductStatus.ACTIVE, deleted_at: null,
    created_at: daysAgo(60), updated_at: daysAgo(2),
  },
  {
    id: 'prod-06', category_id: 'cat-03', name: 'Bún bò lát mỏng', slug: 'bun-bo-lat-mong',
    description: 'Bún lát mỏng đặc biệt, tạo hình đẹp mắt cho món bún bò. Thích hợp cho nhà hàng, quán ăn.',
    price: 22000, stock: 90, unit: 'kg', image_url: null,
    status: ProductStatus.ACTIVE, deleted_at: null,
    created_at: daysAgo(55), updated_at: daysAgo(4),
  },
  {
    id: 'prod-07', category_id: 'cat-04', name: 'Bún ngũ sắc', slug: 'bun-ngu-sac',
    description: 'Bún ngũ sắc với 5 màu tự nhiên từ rau củ: xanh (rau ngót), vàng (nghệ), đỏ (gấc), tím (khoai lang tím), trắng (gạo). Sản phẩm cao cấp.',
    price: 55000, stock: 50, unit: 'kg', image_url: null,
    status: ProductStatus.ACTIVE, deleted_at: null,
    created_at: daysAgo(40), updated_at: daysAgo(1),
  },
  {
    id: 'prod-08', category_id: 'cat-04', name: 'Bún gạo lứt healthy', slug: 'bun-gao-lut-healthy',
    description: 'Bún gạo lứt dành cho người ăn kiêng, ít đường. 100% gạo lứt nguyên cám, không chất phụ gia.',
    price: 48000, stock: 60, unit: 'kg', image_url: null,
    status: ProductStatus.ACTIVE, deleted_at: null,
    created_at: daysAgo(35), updated_at: daysAgo(2),
  },
  {
    id: 'prod-09', category_id: 'cat-01', name: 'Bún lá cuốn', slug: 'bun-la-cuon',
    description: 'Bún tươi dạng lá, dùng để cuốn. Mềm, mịn, dễ cuốn, không bị rách. Lý tưởng cho bún cuốn chả.',
    price: 18000, stock: 130, unit: 'kg', image_url: null,
    status: ProductStatus.ACTIVE, deleted_at: null,
    created_at: daysAgo(50), updated_at: daysAgo(1),
  },
  {
    id: 'prod-10', category_id: 'cat-04', name: 'Bún chả cá Đà Nẵng', slug: 'bun-cha-ca-da-nang',
    description: 'Bún tươi sợi nhỏ đặc biệt dành riêng cho món bún chả cá Đà Nẵng. Sợi nhỏ mịn, không bị nát khi nấu.',
    price: 19000, stock: 70, unit: 'kg', image_url: null,
    status: ProductStatus.ACTIVE, deleted_at: null,
    created_at: daysAgo(30), updated_at: daysAgo(6),
  },
])

// ─── Blog Categories ───
export const mockBlogCategories = ref<BlogCategory[]>([
  { id: 'bcat-01', name: 'Tin tức', slug: 'tin-tuc', created_at: daysAgo(90) },
  { id: 'bcat-02', name: 'Công thức', slug: 'cong-thuc', created_at: daysAgo(90) },
])

// ─── Blog Posts ───
export const mockBlogPosts = ref<BlogPost[]>([
  {
    id: 'blog-01', category_id: 'bcat-01', title: 'Quy trình sản xuất bún sạch tại BunTech',
    slug: 'quy-trinh-san-xuat-bun-sach',
    excerpt: 'Khám phá quy trình sản xuất bún tươi sạch 100% tại xưởng BunTech, từ khâu chọn gạo đến thành phẩm.',
    content: `<h2>Quy trình sản xuất bún sạch</h2>
<p>Tại BunTech, chúng tôi tự hào với quy trình sản xuất bún tươi sạch, đảm bảo an toàn vệ sinh thực phẩm từ khâu chọn nguyên liệu đến thành phẩm cuối cùng.</p>
<h3>1. Chọn gạo</h3>
<p>Chúng tôi sử dụng 100% gạo nguyên chất từ các vùng trồng lúa nổi tiếng như An Giang, Đồng Tháp. Gạo được kiểm tra chất lượng nghiêm ngặt trước khi đưa vào sản xuất.</p>
<h3>2. Ngâm và xay</h3>
<p>Gạo được ngâm trong nước sạch từ 6-8 tiếng, sau đó xay nhuyễn thành bột gạo mịn. Quá trình này đảm bảo bún sẽ có độ mềm mịn và dai đặc trưng.</p>
<h3>3. Ép sợi và luộc</h3>
<p>Bột gạo được ép thành sợi bún qua khuôn chuyên dụng, sau đó luộc chín trong nước sôi. Sợi bún sau khi luộc được làm mát ngay bằng nước sạch.</p>
<h3>4. Đóng gói</h3>
<p>Bún được đóng gói trong bao bì an toàn thực phẩm, bảo quản ở nhiệt độ mát và giao đến tay khách hàng trong ngày.</p>`,
    image_url: null, status: BlogStatus.PUBLISHED, deleted_at: null,
    created_at: daysAgo(15), updated_at: daysAgo(15),
  },
  {
    id: 'blog-02', category_id: 'bcat-02', title: 'Cách nấu bún bò Huế chuẩn vị',
    slug: 'cach-nau-bun-bo-hue-chuan-vi',
    excerpt: 'Hướng dẫn chi tiết cách nấu bún bò Huế đúng vị truyền thống, từ cách hầm xương đến pha nước lèo.',
    content: `<h2>Bún bò Huế - Tinh hoa ẩm thực miền Trung</h2>
<p>Bún bò Huế là một trong những món ăn nổi tiếng nhất Việt Nam. Hãy cùng BunTech tìm hiểu cách nấu bún bò Huế chuẩn vị.</p>
<h3>Nguyên liệu</h3>
<ul>
<li>1kg xương bò</li>
<li>500g giò heo</li>
<li>300g thịt bò bắp</li>
<li>Sả, ớt, mắm ruốc Huế</li>
<li>Bún bò Huế sợi to BunTech</li>
</ul>
<h3>Cách làm</h3>
<p>Hầm xương trong 4-5 tiếng cho nước ngọt. Phi sả cho thơm, thêm mắm ruốc tạo vị đặc trưng. Luộc thịt bò và giò heo riêng...</p>`,
    image_url: null, status: BlogStatus.PUBLISHED, deleted_at: null,
    created_at: daysAgo(10), updated_at: daysAgo(10),
  },
  {
    id: 'blog-03', category_id: 'bcat-01', title: 'BunTech mở rộng giao hàng toàn thành phố',
    slug: 'buntech-mo-rong-giao-hang',
    excerpt: 'Tin vui! BunTech chính thức mở rộng dịch vụ giao hàng đến tất cả các quận huyện trong thành phố.',
    content: `<h2>Mở rộng vùng giao hàng</h2>
<p>Để phục vụ khách hàng tốt hơn, BunTech đã đầu tư thêm xe giao hàng và mở rộng phạm vi phục vụ đến tất cả các quận huyện.</p>
<p>Từ nay, dù bạn ở đâu trong thành phố, bún tươi BunTech sẽ được giao đến tận nơi trong vòng 2-4 tiếng sau khi đặt hàng.</p>
<h3>Ưu đãi khai trương</h3>
<p>Miễn phí giao hàng cho đơn từ 200.000đ trong tháng đầu tiên!</p>`,
    image_url: null, status: BlogStatus.PUBLISHED, deleted_at: null,
    created_at: daysAgo(5), updated_at: daysAgo(5),
  },
  {
    id: 'blog-04', category_id: 'bcat-02', title: '5 món bún ngon dễ làm tại nhà',
    slug: '5-mon-bun-ngon-de-lam',
    excerpt: 'Tổng hợp 5 công thức món bún đơn giản, ngon miệng mà ai cũng có thể làm tại nhà.',
    content: `<h2>5 món bún dễ làm</h2>
<p>Bún không chỉ là nguyên liệu cho bún bò, bún riêu. Hãy khám phá thêm nhiều cách chế biến bún sáng tạo.</p>
<h3>1. Bún trộn thập cẩm</h3><p>Trộn bún với rau sống, thịt nướng, chả giò, nước mắm chua ngọt.</p>
<h3>2. Bún chả Hà Nội</h3><p>Bún ăn kèm chả nướng và nước chấm pha chua ngọt.</p>
<h3>3. Bún riêu cua</h3><p>Nước lèo cua đồng đậm đà, ăn với rau sống và mắm tôm.</p>
<h3>4. Bún xào</h3><p>Xào bún với rau củ và thịt, đơn giản mà ngon.</p>
<h3>5. Bún mắm</h3><p>Đặc sản miền Tây với nước lèo mắm cá linh thơm lừng.</p>`,
    image_url: null, status: BlogStatus.PUBLISHED, deleted_at: null,
    created_at: daysAgo(2), updated_at: daysAgo(2),
  },
])

// ─── Orders ───
const cust1Id = '00000000-0000-0000-0000-000000000002'
const cust2Id = '00000000-0000-0000-0000-000000000003'
const driverId = '00000000-0000-0000-0000-000000000004'

export const mockOrders = ref<Order[]>([
  {
    id: 'order-01', user_id: cust1Id, driver_id: driverId, status: OrderStatus.DELIVERED,
    total: 320000, amount_collected: 320000,
    guest_info: null, shipping_address: '123 Nguyễn Huệ, Q.1', note: 'Giao buổi sáng',
    created_at: daysAgo(14), updated_at: daysAgo(13),
  },
  {
    id: 'order-02', user_id: cust1Id, driver_id: driverId, status: OrderStatus.DELIVERED,
    total: 180000, amount_collected: 180000,
    guest_info: null, shipping_address: '123 Nguyễn Huệ, Q.1', note: '',
    created_at: daysAgo(10), updated_at: daysAgo(9),
  },
  {
    id: 'order-03', user_id: cust2Id, driver_id: driverId, status: OrderStatus.SHIPPING,
    total: 450000, amount_collected: 0,
    guest_info: null, shipping_address: '456 Lê Lợi, Q.3', note: 'Gọi trước khi giao',
    created_at: daysAgo(2), updated_at: daysAgo(1),
  },
  {
    id: 'order-04', user_id: cust1Id, driver_id: null, status: OrderStatus.PROCESSING,
    total: 250000, amount_collected: 0,
    guest_info: null, shipping_address: '123 Nguyễn Huệ, Q.1', note: '',
    created_at: daysAgo(1), updated_at: daysAgo(1),
  },
  {
    id: 'order-05', user_id: null, driver_id: null, status: OrderStatus.PENDING,
    total: 150000, amount_collected: 0,
    guest_info: { name: 'Nguyễn Khách Vãng Lai', phone: '0909123456', address: '789 Trần Hưng Đạo, Q.5' },
    shipping_address: '789 Trần Hưng Đạo, Q.5', note: 'Đặt hàng nhanh',
    created_at: daysAgo(0), updated_at: daysAgo(0),
  },
  {
    id: 'order-06', user_id: cust2Id, driver_id: null, status: OrderStatus.CANCELLED,
    total: 100000, amount_collected: 0,
    guest_info: null, shipping_address: '456 Lê Lợi, Q.3', note: 'Hủy do đổi ý',
    created_at: daysAgo(7), updated_at: daysAgo(6),
  },
])

// ─── Order Items ───
export const mockOrderItems = ref<OrderItem[]>([
  { id: 'oi-01', order_id: 'order-01', product_id: 'prod-01', product_name: 'Bún tươi sợi nhỏ', quantity: 10, price: 15000, created_at: daysAgo(14) },
  { id: 'oi-02', order_id: 'order-01', product_id: 'prod-05', product_name: 'Bún bò Huế sợi to', quantity: 8, price: 20000, created_at: daysAgo(14) },
  { id: 'oi-03', order_id: 'order-02', product_id: 'prod-02', product_name: 'Bún tươi sợi to', quantity: 5, price: 16000, created_at: daysAgo(10) },
  { id: 'oi-04', order_id: 'order-02', product_id: 'prod-09', product_name: 'Bún lá cuốn', quantity: 5, price: 18000, created_at: daysAgo(10) },
  { id: 'oi-05', order_id: 'order-03', product_id: 'prod-07', product_name: 'Bún ngũ sắc', quantity: 5, price: 55000, created_at: daysAgo(2) },
  { id: 'oi-06', order_id: 'order-03', product_id: 'prod-08', product_name: 'Bún gạo lứt healthy', quantity: 4, price: 48000, created_at: daysAgo(2) },
  { id: 'oi-07', order_id: 'order-04', product_id: 'prod-01', product_name: 'Bún tươi sợi nhỏ', quantity: 10, price: 15000, created_at: daysAgo(1) },
  { id: 'oi-08', order_id: 'order-04', product_id: 'prod-03', product_name: 'Bún khô truyền thống', quantity: 3, price: 35000, created_at: daysAgo(1) },
  { id: 'oi-09', order_id: 'order-05', product_id: 'prod-01', product_name: 'Bún tươi sợi nhỏ', quantity: 10, price: 15000, created_at: daysAgo(0) },
  { id: 'oi-10', order_id: 'order-06', product_id: 'prod-06', product_name: 'Bún bò lát mỏng', quantity: 5, price: 22000, created_at: daysAgo(7) },
])

// ─── Transactions ───
export const mockTransactions = ref<Transaction[]>([
  { id: 'tx-01', user_id: cust1Id, order_id: 'order-01', type: TransactionType.DEBT_INCREASE, amount: 320000, note: 'Đơn hàng order-01', created_at: daysAgo(14) },
  { id: 'tx-02', user_id: cust1Id, order_id: 'order-01', type: TransactionType.DEBT_PAYMENT, amount: 320000, note: 'Thanh toán order-01', created_at: daysAgo(13) },
  { id: 'tx-03', user_id: cust1Id, order_id: 'order-02', type: TransactionType.DEBT_INCREASE, amount: 180000, note: 'Đơn hàng order-02', created_at: daysAgo(10) },
  { id: 'tx-04', user_id: cust1Id, order_id: 'order-02', type: TransactionType.DEBT_PAYMENT, amount: 180000, note: 'Thanh toán order-02', created_at: daysAgo(9) },
  { id: 'tx-05', user_id: cust2Id, order_id: 'order-03', type: TransactionType.DEBT_INCREASE, amount: 450000, note: 'Đơn hàng order-03', created_at: daysAgo(2) },
  { id: 'tx-06', user_id: cust1Id, order_id: 'order-04', type: TransactionType.DEBT_INCREASE, amount: 250000, note: 'Đơn hàng order-04', created_at: daysAgo(1) },
])

// ─── Custom Prices ───
export const mockCustomPrices = ref<CustomPrice[]>([
  { id: 'cp-01', user_id: cust1Id, product_id: 'prod-01', price: 13000, created_at: daysAgo(30) },
  { id: 'cp-02', user_id: cust1Id, product_id: 'prod-05', price: 18000, created_at: daysAgo(30) },
])

// ─── Product Reviews ───
export const mockProductReviews = ref<ProductReview[]>([
  {
    id: 'rev-01', product_id: 'prod-01', user_id: cust1Id,
    author_name: 'Trần Thị Khách', rating: 5,
    content: 'Bún rất tươi, sợi dai mịn, gia đình mình rất thích!',
    is_approved: true, reply: 'Cảm ơn chị đã ủng hộ BunTech ạ!',
    created_at: daysAgo(12),
  },
  {
    id: 'rev-02', product_id: 'prod-01', user_id: cust2Id,
    author_name: 'Lê Văn Mua', rating: 4,
    content: 'Bún ngon, giao hàng nhanh. Lần sau sẽ mua tiếp.',
    is_approved: true, reply: null,
    created_at: daysAgo(8),
  },
  {
    id: 'rev-03', product_id: 'prod-07', user_id: cust1Id,
    author_name: 'Trần Thị Khách', rating: 5,
    content: 'Bún ngũ sắc rất đẹp mắt, con nhỏ nhà mình thích lắm. Chất lượng tuyệt vời!',
    is_approved: true, reply: 'Dạ cảm ơn chị nhiều ạ! Chúc bé ăn ngon miệng.',
    created_at: daysAgo(5),
  },
  {
    id: 'rev-04', product_id: 'prod-05', user_id: cust2Id,
    author_name: 'Lê Văn Mua', rating: 4,
    content: 'Bún bò Huế sợi to, ăn rất vừa miệng. Đúng chất Huế.',
    is_approved: true, reply: null,
    created_at: daysAgo(3),
  },
])

// ─── Inventory Items ───
export const mockInventoryItems = ref<InventoryItem[]>([
  { id: 'inv-01', name: 'Gạo tẻ thường', unit: 'kg', quantity: 500, deleted_at: null, created_at: daysAgo(60), updated_at: daysAgo(1) },
  { id: 'inv-02', name: 'Gạo lứt', unit: 'kg', quantity: 200, deleted_at: null, created_at: daysAgo(60), updated_at: daysAgo(2) },
  { id: 'inv-03', name: 'Bao bì đóng gói', unit: 'cuộn', quantity: 50, deleted_at: null, created_at: daysAgo(45), updated_at: daysAgo(5) },
  { id: 'inv-04', name: 'Phụ gia thực phẩm', unit: 'kg', quantity: 30, deleted_at: null, created_at: daysAgo(30), updated_at: daysAgo(3) },
])

// ─── Inventory Movements ───
export const mockInventoryMovements = ref<InventoryMovement[]>([
  { id: 'im-01', inventory_id: 'inv-01', type: InventoryMovementType.IMPORT, quantity: 200, note: 'Nhập gạo đợt 1', created_at: daysAgo(30) },
  { id: 'im-02', inventory_id: 'inv-01', type: InventoryMovementType.EXPORT, quantity: 50, note: 'Xuất sản xuất', created_at: daysAgo(25) },
  { id: 'im-03', inventory_id: 'inv-02', type: InventoryMovementType.IMPORT, quantity: 100, note: 'Nhập gạo lứt', created_at: daysAgo(20) },
  { id: 'im-04', inventory_id: 'inv-03', type: InventoryMovementType.LOSS, quantity: 5, note: 'Hư hỏng', created_at: daysAgo(10) },
])

// ─── System Configs ───
export const mockSystemConfigs = ref<SystemConfig[]>([
  { id: 'cfg-01', key: 'shop_name', value: 'BunTech - Xưởng bún gia đình', updated_at: daysAgo(30) },
  { id: 'cfg-02', key: 'shop_phone', value: '0901000000', updated_at: daysAgo(30) },
  { id: 'cfg-03', key: 'shop_address', value: '123 Đường Bún, P.1, Q.1, TP.HCM', updated_at: daysAgo(30) },
  { id: 'cfg-04', key: 'delivery_fee', value: '15000', updated_at: daysAgo(15) },
  { id: 'cfg-05', key: 'min_order_free_delivery', value: '200000', updated_at: daysAgo(15) },
])
