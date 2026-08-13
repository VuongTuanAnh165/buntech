import { ApiClient } from '~/utils/api'
import type { ApiResponse } from '~/types/api'

export interface QuickOrderPayload {
  fullName: string
  phoneNumber: string
  addressLine: string
  province: string
  ward: string
  note?: string
  website_url?: string
  items: {
    productId: number
    quantity: number
  }[]
}

export interface QuickOrderResult {
  orderId: number
  totalAmount: number
}

export const publicOrderService = {
  createQuickOrder(payload: QuickOrderPayload) {
    return ApiClient.post<ApiResponse<QuickOrderResult>>('/orders/quick', payload)
  }
}
