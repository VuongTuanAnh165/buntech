import { ApiClient } from '~/utils/api'
import type { BlogCategory, BlogPost } from '~/utils/types'
import type { ApiResponse, PaginatedResponse, PaginationParams } from '~/types/api'

export const blogService = {
  // ─── PUBLIC APIs ────────────────────────────────────────────────────────
  getPublicCategories() {
    return ApiClient.get<ApiResponse<BlogCategory[]>>('/blog-categories')
  },

  getPublicPosts(params?: PaginationParams & { categoryId?: number | string }) {
    return ApiClient.get<PaginatedResponse<BlogPost>>('/posts', params as Record<string, unknown>)
  },

  getPublicPost(id: number | string) {
    return ApiClient.get<ApiResponse<BlogPost>>(`/posts/${id}`)
  },

  // ─── ADMIN APIs ─────────────────────────────────────────────────────────
  getAdminCategories() {
    return ApiClient.get<ApiResponse<BlogCategory[]>>('/admin/blog-categories')
  },

  getAdminCategory(id: number | string) {
    return ApiClient.get<ApiResponse<BlogCategory>>(`/admin/blog-categories/${id}`)
  },

  createCategory(data: { name: string; slug: string; description?: string }) {
    return ApiClient.post<ApiResponse<BlogCategory>>('/admin/blog-categories', data)
  },

  updateCategory(
    id: number | string,
    data: { name?: string; slug?: string; description?: string }
  ) {
    return ApiClient.put<ApiResponse<BlogCategory>>(`/admin/blog-categories/${id}`, data)
  },

  deleteCategory(id: number | string) {
    return ApiClient.del<ApiResponse<null>>(`/admin/blog-categories/${id}`)
  },

  getAdminPosts(
    params?: PaginationParams & { categoryId?: number | string; search?: string; status?: string }
  ) {
    return ApiClient.get<PaginatedResponse<BlogPost>>(
      '/admin/posts',
      params as Record<string, unknown>
    )
  },

  getAdminPost(id: number | string) {
    return ApiClient.get<ApiResponse<BlogPost>>(`/admin/posts/${id}`)
  },

  createPost(formData: FormData) {
    return ApiClient.upload<ApiResponse<BlogPost>>('/admin/posts', formData)
  },

  updatePost(id: number | string, formData: FormData) {
    formData.append('_method', 'PUT')
    return ApiClient.upload<ApiResponse<BlogPost>>(`/admin/posts/${id}?_method=PUT`, formData)
  },

  deletePost(id: number | string) {
    return ApiClient.del<ApiResponse<null>>(`/admin/posts/${id}`)
  }
}
