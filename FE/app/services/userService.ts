import { ApiClient } from '~/utils/api'
import type { PaginatedResponse, ApiResponse } from '~/types/api'
import type { UserDTO, UserProfileDTO, Address } from '~/utils/types'

export type CreateUserPayload = {
  phoneNumber: string
  password?: string
  fullName: string
  role: string
  customerType?: string
}

export type UpdateUserPayload = {
  fullName?: string
  role?: string
  customerType?: string
}

export type UpdateProfilePayload = {
  debtLimit?: number
  storeName?: string
  zaloUserId?: string
  avatarUrl?: string
  isPublic?: boolean
}

export type CreateAddressPayload = {
  addressLine: string
  province?: string
  ward?: string
  district?: string
  city?: string
  isDefault?: boolean
  latitude?: string | null
  longitude?: string | null
}

export const userService = {
  // --- USERS ---
  fetchUsers(params?: Record<string, unknown>) {
    return ApiClient.get<PaginatedResponse<UserDTO>>('/admin/users', params)
  },

  getUser(id: string | number) {
    return ApiClient.get<ApiResponse<UserDTO>>(`/admin/users/${id}`)
  },

  createUser(data: CreateUserPayload) {
    return ApiClient.post<ApiResponse<UserDTO>>('/admin/users', data)
  },

  updateUser(id: string | number, data: UpdateUserPayload) {
    return ApiClient.put<ApiResponse<UserDTO>>(`/admin/users/${id}`, data)
  },

  updateProfile(id: string | number, data: UpdateProfilePayload) {
    return ApiClient.put<ApiResponse<UserProfileDTO>>(`/admin/users/${id}/profile`, data)
  },

  deleteUser(id: string | number) {
    return ApiClient.del(`/admin/users/${id}`)
  },

  // --- ADDRESSES ---
  fetchAddresses(userId: string | number) {
    return ApiClient.get<ApiResponse<Address[]>>(`/admin/users/${userId}/addresses`)
  },

  createAddress(userId: string | number, data: CreateAddressPayload) {
    return ApiClient.post<ApiResponse<Address>>(`/admin/users/${userId}/addresses`, data)
  },

  updateAddress(userId: string | number, addressId: string | number, data: CreateAddressPayload) {
    return ApiClient.put<ApiResponse<Address>>(
      `/admin/users/${userId}/addresses/${addressId}`,
      data
    )
  },

  deleteAddress(userId: string | number, addressId: string | number) {
    return ApiClient.del(`/admin/users/${userId}/addresses/${addressId}`)
  }
}
