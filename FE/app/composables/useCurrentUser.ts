import { defineStore } from 'pinia'
import type { CurrentUser } from '~/types/common'
import { AuthService } from '~/services/authService'

import { Role } from '~/enums/role'

/**
 * Pinia Store quản lý thông tin User hiện tại.
 * SSR-safe — state được hydrate từ Server sang Client tự động.
 */
export const useCurrentUserStore = defineStore(
  'current-user',
  () => {
    // --- State ---
    const currentUser = ref<CurrentUser | null>(null)
    const isLoading = ref(false)

    // --- Getters ---
    const isLoggedIn = computed(() => !!currentUser.value)
    const isAdmin = computed(() => currentUser.value?.role === Role.ADMIN)
    const isDriver = computed(() => currentUser.value?.role === Role.DRIVER)
    const isWholesale = computed(() => currentUser.value?.role === Role.WHOLESALE)
    const isRetail = computed(() => currentUser.value?.role === Role.RETAIL)

    const userInitials = computed(() => {
      if (!currentUser.value?.fullName) return ''
      const words = currentUser.value.fullName.trim().split(/\s+/)
      if (words.length === 1) return (words[0] ?? '').slice(0, 2).toUpperCase()
      const first = words[0]?.[0] ?? ''
      const last = words[words.length - 1]?.[0] ?? ''
      return (first + last).toUpperCase()
    })

    // --- Actions ---

    /**
     * Lấy thông tin user từ API /auth/me.
     * Gọi 1 lần khi app khởi tạo (trong plugin).
     */
    const fetchUser = async () => {
      const token = useCookie('auth_token')
      if (!token.value) return

      isLoading.value = true
      try {
        const res = await AuthService.getCurrentUser()
        if (res.data) {
          currentUser.value = res.data
        }
      } catch {
        // Token hết hạn hoặc lỗi → xóa token, không redirect ở đây
        // Middleware auth sẽ lo việc redirect
        currentUser.value = null
      } finally {
        isLoading.value = false
      }
    }

    /**
     * Set user trực tiếp (dùng sau khi login thành công).
     */
    const setUser = (user: CurrentUser) => {
      currentUser.value = user
    }

    /**
     * Xóa thông tin user (dùng khi logout).
     */
    const clearUser = () => {
      currentUser.value = null
    }

    return {
      // State
      currentUser,
      isLoading,
      // Getters
      isLoggedIn,
      isAdmin,
      isDriver,
      isWholesale,
      isRetail,
      userInitials,
      // Actions
      fetchUser,
      setUser,
      clearUser
    }
  },
  {
    persist: true
  }
)
