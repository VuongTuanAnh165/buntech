import type { Role, OrderStatus, TransactionType, ProductStatus, UserStatus, BlogStatus, InventoryMovementType } from '../enums'

export interface Profile {
  id: string
  role: Role
  phone: string | null
  full_name: string
  status: UserStatus
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
  status: ProductStatus
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface ProductReview {
  id: string
  product_id: string
  user_id: string | null
  author_name: string
  rating: number
  content: string
  is_approved: boolean
  reply: string | null
  created_at: string
}

export interface CustomPrice {
  id: string
  user_id: string
  product_id: string
  price: number
  created_at: string
}

export interface Address {
  id: string
  user_id: string
  full_name: string
  phone: string | null
  street: string
  ward: string
  district: string
  city: string
  is_default: boolean
  created_at: string
}

export interface Order {
  id: string
  user_id: string | null
  driver_id: string | null
  driver?: Profile | null
  user?: Profile | null
  status: OrderStatus
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
  type: TransactionType
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
  type: InventoryMovementType
  quantity: number
  note: string
  created_at: string
}

export interface BlogCategory {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface BlogPost {
  id: string
  category_id: string | null
  category?: BlogCategory | null
  title: string
  slug: string
  excerpt: string
  content: string
  image_url: string | null
  status: BlogStatus
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface SystemConfig {
  id: string
  key: string
  value: string
  updated_at: string
}

export interface Paginated<T> {
  data: T[]
  total: number
  page: number
  limit: number
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
