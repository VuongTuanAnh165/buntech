export enum Role {
  ADMIN = 'ADMIN',
  DRIVER = 'DRIVER',
  CUSTOMER = 'CUSTOMER',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPING = 'SHIPPING',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum TransactionType {
  PAYMENT = 'PAYMENT',
  REFUND = 'REFUND',
  DEBT_INCREASE = 'DEBT_INCREASE',
  DEBT_PAYMENT = 'DEBT_PAYMENT',
}

export enum InventoryMovementType {
  IMPORT = 'IMPORT',
  EXPORT = 'EXPORT',
  LOSS = 'LOSS',
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum BlogStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export enum VehicleStatus {
  ACTIVE = 'ACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  INACTIVE = 'INACTIVE',
}

export enum NotificationType {
  ORDER_ASSIGNED = 'ORDER_ASSIGNED',
  ORDER_DELIVERED = 'ORDER_DELIVERED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  LOW_STOCK = 'LOW_STOCK',
  NEW_REVIEW = 'NEW_REVIEW',
  SYSTEM = 'SYSTEM',
}

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPING,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
]

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'warning',
  [OrderStatus.PROCESSING]: 'secondary',
  [OrderStatus.SHIPPING]: 'accent',
  [OrderStatus.DELIVERED]: 'success',
  [OrderStatus.CANCELLED]: 'danger',
}

export const ROLE_COLORS: Record<Role, string> = {
  [Role.ADMIN]: 'danger',
  [Role.DRIVER]: 'secondary',
  [Role.CUSTOMER]: 'success',
}
