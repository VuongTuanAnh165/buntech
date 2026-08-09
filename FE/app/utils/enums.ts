export enum Role {
  ADMIN = 'admin',
  DRIVER = 'driver',
  CUSTOMER = 'customer'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPING = 'SHIPPING',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export enum TransactionType {
  PAYMENT = 'PAYMENT',
  REFUND = 'REFUND',
  DEBT_INCREASE = 'DEBT_INCREASE',
  DEBT_PAYMENT = 'DEBT_PAYMENT'
}

export enum InventoryMovementType {
  IMPORT = 'IMPORT',
  EXPORT = 'EXPORT',
  LOSS = 'LOSS'
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export enum BlogStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED'
}

export enum VehicleStatus {
  ACTIVE = 'ACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  INACTIVE = 'INACTIVE'
}

export enum NotificationType {
  ORDER_ASSIGNED = 'ORDER_ASSIGNED',
  ORDER_DELIVERED = 'ORDER_DELIVERED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  LOW_STOCK = 'LOW_STOCK',
  NEW_REVIEW = 'NEW_REVIEW',
  SYSTEM = 'SYSTEM'
}
