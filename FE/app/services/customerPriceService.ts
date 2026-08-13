import { ApiClient } from '~/utils/api'
import type { PaginatedResponse, ApiResponse } from '~/types/api'
import type { CustomPrice } from '~/utils/types'

export type UpsertCustomPricePayload = {
  productId: number
  customPrice: number
}

export const customerPriceService = {
  fetchPrices(userId: string | number, params?: Record<string, unknown>) {
    return ApiClient.get<PaginatedResponse<CustomPrice>>(
      `/admin/users/${userId}/custom-prices`,
      params
    )
  },

  upsertPrice(userId: string | number, data: UpsertCustomPricePayload) {
    return ApiClient.post<ApiResponse<CustomPrice>>(`/admin/users/${userId}/custom-prices`, data)
  },

  deletePrice(userId: string | number, productId: string | number) {
    return ApiClient.del<ApiResponse<null>>(`/admin/users/${userId}/custom-prices/${productId}`)
  }
}
