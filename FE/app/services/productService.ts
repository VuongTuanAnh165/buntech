import { ApiClient } from '~/utils/api'
import type { ProductCategory, AdminProduct } from '~/utils/types'
import type { ApiResponse, PaginatedResponse, PaginationParams } from '~/types/api'

export const productService = {
  // ─── ADMIN CATEGORIES ──────────────────────────────────────────────────
  getAdminCategories(params?: PaginationParams) {
    return ApiClient.get<PaginatedResponse<ProductCategory>>(
      '/admin/categories',
      params as Record<string, unknown>
    )
  },

  getAdminCategory(id: number | string) {
    return ApiClient.get<ApiResponse<ProductCategory>>(`/admin/categories/${id}`)
  },

  createCategory(formData: FormData) {
    return ApiClient.upload<ApiResponse<ProductCategory>>('/admin/categories', formData)
  },

  updateCategory(id: number | string, formData: FormData) {
    formData.append('_method', 'PUT')
    return ApiClient.upload<ApiResponse<ProductCategory>>(
      `/admin/categories/${id}?_method=PUT`,
      formData
    )
  },

  deleteCategory(id: number | string) {
    return ApiClient.del<ApiResponse<null>>(`/admin/categories/${id}`)
  },

  // ─── ADMIN PRODUCTS ────────────────────────────────────────────────────
  getAdminProducts(
    params?: PaginationParams & { categoryId?: number | string; search?: string; status?: string }
  ) {
    return ApiClient.get<PaginatedResponse<AdminProduct>>(
      '/admin/products',
      params as Record<string, unknown>
    )
  },

  getAdminProduct(id: number | string) {
    return ApiClient.get<ApiResponse<AdminProduct>>(`/admin/products/${id}`)
  },

  createProduct(formData: FormData) {
    return ApiClient.upload<ApiResponse<AdminProduct>>('/admin/products', formData)
  },

  updateProduct(id: number | string, formData: FormData) {
    formData.append('_method', 'PUT')
    return ApiClient.upload<ApiResponse<AdminProduct>>(
      `/admin/products/${id}?_method=PUT`,
      formData
    )
  },

  deleteProduct(id: number | string) {
    return ApiClient.del<ApiResponse<null>>(`/admin/products/${id}`)
  },

  // ─── CLIENT APIs ───────────────────────────────────────────────────────
  getClientCategories() {
    return ApiClient.get<ApiResponse<ProductCategory[]>>('/categories')
  },

  getClientProducts(params?: PaginationParams & { categoryId?: number | string }) {
    return ApiClient.get<PaginatedResponse<AdminProduct>>(
      '/products',
      params as Record<string, unknown>
    )
  },

  getClientProduct(id: number | string) {
    return ApiClient.get<ApiResponse<AdminProduct>>(`/products/${id}`)
  }
}
