export interface UserProfileDTO {
  userId: string | number
  user_id?: string | number
  avatarUrl: string | null
  avatar_url?: string | null
  storeName: string | null
  store_name?: string | null
  debtLimit: string | number
  debt_limit?: string | number
  currentDebt: string | number
  current_debt?: string | number
  zaloUserId: string | null
  zalo_user_id?: string | null
  customerType: string | null
  customer_type?: string | null
  isPublic?: boolean | number | string
  is_public?: boolean | number | string
}

export interface UserDTO {
  id: string | number
  fullName: string
  phoneNumber: string
  role: string
  createdAt: string
  profile?: UserProfileDTO
}

// Giữ lại Profile cũ cho các modules khác đang dùng tạm, sẽ dần loại bỏ
export interface Profile {
  id: string
  role: string
  phone: string | null
  full_name: string
  status: string
  debt_limit: number
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface Product {
  id: string
  category_id: string | null
  category?: Category | null
  name: string
  slug: string
  description: string
  price: number
  stock: number
  unit: string
  image_url: string | null
  status: string
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface ProductReview {
  id: number
  productId: number
  userId: number | null
  rating: number
  content: string | null
  isApproved: boolean
  hasPurchased: boolean
  replyContent: string | null
  repliedBy: number | null
  createdAt: string
  user?: { id: number; fullName: string }
  product?: { id: number; name: string; thumbnailUrl?: string | null }
  replier?: { id: number; fullName: string }
  images?: { fileUrl: string }[]
}

export interface CustomPrice {
  id: string | number
  userId?: string | number
  user_id?: string | number
  productId?: string | number
  product_id?: string | number
  customPrice?: number | string
  price?: number
  createdAt?: string
  created_at?: string
  product?: (Pick<Product, 'id' | 'name' | 'image_url'> & { thumbnailUrl?: string | null }) | null
}

export interface Address {
  id: string | number
  userId: string | number
  fullName?: string
  phone?: string | null
  street?: string
  addressLine?: string
  ward: string
  district?: string
  province?: string
  city?: string
  isDefault?: boolean | number | string
  is_default?: boolean | number | string
  createdAt: string
  created_at?: string
  latitude?: string | null
  longitude?: string | null
}

export interface Order {
  id: string
  user_id: string | null
  driver_id: string | null
  driver?: Profile | null
  user?: Profile | null
  status: string
  total: number
  amount_collected: number
  guest_info: { name: string; phone: string; address: string } | null
  shipping_address: string
  note: string
  updated_at: string
  created_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product?: Product | null
  product_name: string
  quantity: number
  price: number
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string | null
  user?: Profile | null
  order_id: string | null
  type: string
  amount: number
  note: string
  created_at: string
}

export interface InventoryItem {
  id: string
  name: string
  unit: string
  quantity: number
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface InventoryMovement {
  id: string
  inventory_id: string
  inventory_item?: InventoryItem | null
  type: string
  quantity: number
  note: string
  created_at: string
}

export interface BlogCategory {
  id: number
  name: string
  slug: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface BlogPost {
  id: number
  authorId: number
  blogCategoryId: number
  category?: BlogCategory | null
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  thumbnailUrl: string | null
  metaTitle: string | null
  metaDescription: string | null
  isPublished: boolean
  publishedAt: string | null
  views: number
  author?: {
    id: number
    fullName: string
  }
  createdAt: string
  updatedAt: string
}

export interface SystemConfig {
  id: string
  key: string
  value: string
  description?: string
  updated_at: string
  created_at?: string
}

export interface DashboardKPI {
  revenueToday: number
  ordersToday: number
  newCustomers: number
  inventoryValue: number
}

export interface RevenuePoint {
  date: string
  revenue: number
}

export interface TopBuyer {
  user_id: string
  full_name: string
  avatar_url: string | null
  total: number
}

export interface Vehicle {
  id: string
  driver_id: string | null
  plate_number: string
  model: string
  capacity: number
  status: string
  last_maintenance: string
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string | null
  type: string
  title: string
  message: string
  is_read: boolean
  link: string | null
  created_at: string
}

export interface Message {
  id: string
  sender_id: string | null
  receiver_id: string | null
  content: string
  is_read: boolean
  created_at: string
}

export interface DeliveryRoute {
  id: string
  driver_id: string
  date: string
  order_ids: string[]
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  total_orders: number
  completed_orders: number
  total_distance: number
  estimated_time: number
  created_at: string
}

export interface ProductCategory {
  id: number
  name: string
  slug: string
  description: string | null
  thumbnailUrl: string | null
  metaTitle: string | null
  metaDescription: string | null
  createdAt: string
  updatedAt: string
}

export interface ProductImage {
  id: number
  productId: number
  fileUrl: string
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export interface AdminProduct {
  id: number
  categoryId: number | null
  category?: ProductCategory | null
  name: string
  slug: string
  basePrice: number
  unit: string
  shortDescription: string | null
  content: string | null
  thumbnailUrl: string | null
  metaTitle: string | null
  metaDescription: string | null
  isActive: boolean
  images?: ProductImage[]
  createdAt: string
  updatedAt: string
}
