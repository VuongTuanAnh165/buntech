import { defineStore } from 'pinia'
import { AuthService } from '~/services/authService'
import type { LoginPayload } from '~/types/auth'

export const useAuthStore = defineStore('auth', () => {
  // --- State ---
  const isLoading = ref(false)
  const user = ref<Record<string, unknown> | null>(null)
  const initialized = ref(false)

  // --- Getters ---
  const isAuthenticated = computed(() => !!user.value)
  const role = computed(() => (user.value?.role as string) ?? null)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')
  const isDriver = computed(() => user.value?.role === 'DRIVER')
  const isCustomer = computed(() => user.value?.role === 'CUSTOMER')

  // --- Actions ---
  const init = () => {
    if (initialized.value) return
    initialized.value = true
    if (import.meta.client) {
      const saved = sessionStorage.getItem('buntech_mock_auth')
      if (saved) {
        try {
          user.value = JSON.parse(saved)
        } catch { /* ignore */ }
      }
    }
  }

  const login = async (payload: LoginPayload) => {
    isLoading.value = true
    try {
      const res = await AuthService.login(payload)
      if (res.data) {
        const config = useRuntimeConfig()
        const isProd = config.public.apiBaseUrl?.includes('https')
        const cookieOptions = {
          maxAge: payload.rememberMe ? 60 * 60 * 24 * 30 : undefined,
          secure: isProd,
          sameSite: 'lax' as const
        }
        useCookie('auth_token', cookieOptions).value = res.data.accessToken
        useCookie('refresh_token', cookieOptions).value = res.data.refreshToken

        // Mock user for UI display
        const { mockProfiles } = await import('~/utils/mockData')
        const adminProfile = mockProfiles.find(p => p.role === 'ADMIN')
        user.value = adminProfile || { role: 'ADMIN', phoneNumber: payload.phoneNumber, id: '1' }
        if (import.meta.client) {
          sessionStorage.setItem('buntech_mock_auth', JSON.stringify(user.value))
        }

        const route = useRoute()
        const redirectPath = route.query.redirect as string | undefined
        navigateTo(redirectPath || '/admin')
      }
    } catch (error) {
      console.error('[useAuthStore] Login failed:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    const config = useRuntimeConfig()
    const isProd = config.public.apiBaseUrl?.includes('https')
    const cookieOptions = { secure: isProd, sameSite: 'lax' as const }
    useCookie('auth_token', cookieOptions).value = null
    useCookie('refresh_token', cookieOptions).value = null
    user.value = null
    if (import.meta.client) {
      sessionStorage.removeItem('buntech_mock_auth')
    }
    navigateTo('/auth/admin/login')
  }

  const updateProfile = async (updates: Record<string, unknown>) => {
    if (!user.value) return
    user.value = { ...user.value, ...updates, updated_at: new Date().toISOString() }
  }

  const changePassword = async (_oldPassword: string, _newPassword: string) => {
    // Mock — always succeeds
  }

  return {
    isLoading,
    user,
    initialized,
    isAuthenticated,
    role,
    isAdmin,
    isDriver,
    isCustomer,
    init,
    login,
    logout,
    updateProfile,
    changePassword,
  }
})
