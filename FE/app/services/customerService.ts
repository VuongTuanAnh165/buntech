import { ApiClient } from '~/utils/api'
import type { PaginatedResponse, ApiResponse } from '~/types/api'
import type { AdminOrderDTO } from './adminOrderService'
import type { AdminProduct, Address } from '~/utils/types'

export interface CustomerDashboardOverview {
  currentDebt: number
  debtLimit: number
  totalSpent: number
  totalOrders30Days: number
  currency: string
  updatedAt: string
}

export const customerService = {
  getDashboardOverview: () => {
    return ApiClient.get<ApiResponse<CustomerDashboardOverview>>('/customer/dashboard/overview')
  },
  getOrders: (params?: { page?: number; limit?: number; status?: string }) => {
    return ApiClient.get<PaginatedResponse<AdminOrderDTO>>('/customer/orders', params)
  },
  getOrder: (id: string | number) => {
    return ApiClient.get<ApiResponse<AdminOrderDTO>>(`/customer/orders/${id}`)
  },
  getProducts: (params?: {
    page?: number
    limit?: number
    categoryId?: number
    search?: string
  }) => {
    return ApiClient.get<
      PaginatedResponse<AdminProduct & { originalBasePrice?: string; hasCustomPrice?: boolean }>
    >('/customer/products', params)
  },
  getAddresses: () => {
    return ApiClient.get<ApiResponse<Address[]>>('/customer/addresses')
  },
  createOrder: (payload: {
    shippingAddressId: number
    note?: string
    deliveryDate?: string
    items: { productId: number; quantity: number }[]
  }) => {
    return ApiClient.post<ApiResponse<AdminOrderDTO>>('/customer/orders', payload)
  }
}
