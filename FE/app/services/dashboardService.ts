import { ApiClient } from '~/utils/api'
import type { ApiResponse } from '~/types/api'

export interface DashboardOverviewResponse {
  totalRevenue: number
  totalOrders: number
  totalDebt: number
  revenueToday: number
  ordersToday: number
  totalCustomers: number
  totalProducts: number
  orderStatuses: {
    status: string
    count: number
  }[]
  revenueChart: {
    date: string
    value: number
    ordersCount: number
  }[]
  topProducts: {
    name: string
    value: number
  }[]
}

export interface TopBuyer {
  userId: number
  fullName: string
  phoneNumber: string
  totalRevenue: number
  ordersCount: number
  avatarUrl?: string
}

export const dashboardService = {
  getOverview(params?: { startDate?: string; endDate?: string }) {
    return ApiClient.get<ApiResponse<DashboardOverviewResponse>>(
      '/admin/dashboard/overview',
      params
    )
  },
  getTopBuyers(params?: { startDate?: string; endDate?: string; limit?: number; sortBy?: string }) {
    return ApiClient.get<ApiResponse<TopBuyer[]>>('/admin/dashboard/top-buyers', params)
  }
}
