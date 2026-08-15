import { ApiClient } from '~/utils/api'
import type { PaginatedResponse, ApiResponse } from '~/types/api'

export interface AdminOrderItemDTO {
  id: number
  orderId: number
  productId: number
  quantity: string | number
  unitPrice: string | number
  product?: {
    id: number
    name: string
    thumbnailUrl: string | null
  }
}

export interface AdminOrderDTO {
  id: number
  userId: number | null
  driverId: number | null
  totalAmount: string | number
  amountCollected: string | number
  status: string
  deliveryStatus: string | null
  paymentStatus: string | null
  note: string | null
  createdAt: string
  updatedAt: string
  user?: {
    id: number
    fullName: string
    phoneNumber: string
    avatarUrl?: string | null
  }
  driver?: {
    id: number
    fullName: string
    phoneNumber: string
    avatarUrl?: string | null
  }
  shippingAddress?: {
    id: number
    addressLine: string | null
  }
  items?: AdminOrderItemDTO[]
}

export type UpdateOrderStatusPayload = {
  status?: string
  deliveryStatus?: string
  paymentStatus?: string
  updatedAt: string
}

export type BatchAssignDriverPayload = {
  driverId: number
  orders: { orderId: number; routeOrder: number }[]
}

export interface AdminCreateOrderPayload {
  userId: number
  shippingAddressId: number
  note?: string
  deliveryDate?: string | Date
  deliveryFee?: number
  amountCollected?: number
  items: { productId: number; quantity: number }[]
}

export const adminOrderService = {
  fetchOrders(params?: Record<string, unknown>) {
    return ApiClient.get<PaginatedResponse<AdminOrderDTO>>('/admin/orders', params)
  },

  getOrder(id: string | number) {
    return ApiClient.get<ApiResponse<AdminOrderDTO>>(`/admin/orders/${id}`)
  },

  updateStatus(id: string | number, payload: UpdateOrderStatusPayload) {
    return ApiClient.patch<ApiResponse<AdminOrderDTO>>(`/admin/orders/${id}/status`, payload)
  },

  batchAssignDriver(payload: BatchAssignDriverPayload) {
    return ApiClient.patch<ApiResponse<{ message: string }>>('/admin/orders/batch-assign', payload)
  },

  createOrder(payload: AdminCreateOrderPayload) {
    return ApiClient.post<ApiResponse<AdminOrderDTO>>('/admin/orders', payload)
  },

  exportOrders(params?: Record<string, unknown>) {
    return ApiClient.download('/admin/orders/export', params, 'DanhSachDonHang.xlsx')
  }
}
