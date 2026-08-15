import { ApiClient } from '~/utils/api'
import type { PaginatedResponse, ApiResponse, PaginationParams } from '~/types/api'

export interface DriverRouteDTO {
  id: number
  userId: number
  shippingAddressId: number
  totalAmount: string | number
  amountCollected?: string | number
  status: string
  deliveryStatus: string | null
  paymentStatus: string | null
  routeOrder: number
  deliveryDate: string
  note: string | null
  createdAt: string
  updatedAt: string
  shippingAddress: {
    id: number
    addressLine: string
    ward: string | null
    district: string | null
    province: string | null
    phoneNumber: string
    recipientName: string
  } | null
  user: {
    id: number
    fullName: string
    phoneNumber: string
  } | null
  items: {
    id: number
    orderId: number
    productId: number
    quantity: number
    product: {
      id: number
      name: string
      thumbnailUrl: string | null
    }
  }[]
}

export type DeliverOrderPayload = {
  paymentMethod?: string
  amountCollected: number
  deliveryNote?: string
  idempotencyKey: string
  updatedAt: string
}

export const driverService = {
  getTodayRoutes() {
    return ApiClient.get<ApiResponse<DriverRouteDTO[]>>('/driver/routes/today')
  },

  getHistory(params?: PaginationParams & { status?: string; dateFrom?: string; dateTo?: string }) {
    return ApiClient.get<PaginatedResponse<DriverRouteDTO>>(
      '/driver/history',
      params as Record<string, unknown>
    )
  },

  deliverOrder(orderId: number | string, payload: DeliverOrderPayload) {
    return ApiClient.patch<ApiResponse<DriverRouteDTO>>(
      `/driver/orders/${orderId}/deliver`,
      payload
    )
  }
}
