import { ApiClient } from '~/utils/api'
import type { ApiResponse } from '~/types/api'

export interface PublicCustomerAddress {
  id: number
  province: string | null
  ward: string | null
  addressLine: string | null
  latitude: number | null
  longitude: number | null
}

export interface PublicCustomer {
  id: number
  fullName: string
  phoneNumber: string
  storeName: string | null
  avatarUrl: string | null
  tier: 'diamond' | 'gold' | 'silver' | 'bronze'
  monthlyVolume: number
  isRecentlyRestocked: boolean
  addresses: PublicCustomerAddress[]
}

export const publicCustomerService = {
  fetchPublicCustomers() {
    return ApiClient.get<ApiResponse<PublicCustomer[]>>('/public/customers')
  }
}
