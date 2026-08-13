import { ApiClient } from '~/utils/api'
import type { PaginatedResponse } from '~/types/api'
import type { ProductReview } from '~/utils/types'

export interface ReviewStats {
  total: number
  approved: number
  pending: number
  averageRating: number
}

export const productReviewService = {
  getAdminReviews: (params: { page: number; limit: number; status: string }) => {
    return ApiClient.get<PaginatedResponse<ProductReview>>('/admin/product-reviews', params)
  },

  getClientReviews: (productId: number | string, params?: { page?: number; limit?: number }) => {
    return ApiClient.get<PaginatedResponse<ProductReview>>(
      `/products/${productId}/reviews`,
      params as Record<string, unknown>
    )
  },

  getFeaturedReviews: () => {
    return ApiClient.get<{ success: boolean; message: string; data: ProductReview[] }>(
      '/reviews/featured'
    )
  },

  getReviewStats: () => {
    return ApiClient.get<{ success: boolean; message: string; data: ReviewStats }>(
      '/admin/product-reviews/stats'
    )
  },

  approveReview: (id: number, isApproved: boolean) => {
    return ApiClient.patch<{ success: boolean; data: ProductReview }>(
      `/admin/product-reviews/${id}/approve`,
      {
        isApproved
      }
    )
  },

  replyReview: (id: number, replyContent: string) => {
    return ApiClient.patch<{ success: boolean; data: ProductReview }>(
      `/admin/product-reviews/${id}/reply`,
      {
        replyContent
      }
    )
  },

  deleteReview: (id: number) => {
    return ApiClient.del(`/admin/product-reviews/${id}`)
  }
}
