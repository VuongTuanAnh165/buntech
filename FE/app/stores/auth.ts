import { defineStore } from 'pinia'
import { authService } from '~/services/authService'
import type { LoginPayload } from '~/types/auth'
import type { CurrentUser } from '~/types/common'
import { ConstantKey } from '~/enums/constantKeys'

export const useAuthStore = defineStore('auth', () => {
  // --- State ---
  const isLoading = ref(false)
  const user = ref<CurrentUser | null>(null)
  const initialized = ref(false)

  // --- Getters ---
  const isAuthenticated = computed(() => !!user.value)
  const role = computed(() => user.value?.role ?? null)
  const { constants } = useMasterData()
  const roleConstants = computed(() => constants.value?.[ConstantKey.Role] || {})

  const isAdmin = computed(() => user.value?.role === (roleConstants.value.ADMIN || 'admin'))
  const isDriver = computed(() => user.value?.role === (roleConstants.value.DRIVER || 'driver'))
  const isCustomer = computed(
    () => user.value?.role === (roleConstants.value.CUSTOMER || 'customer')
  )

  const userInitials = computed(() => {
    if (!user.value?.fullName) return ''
    const words = user.value.fullName.trim().split(/\s+/)
    if (words.length === 1) return (words[0] ?? '').slice(0, 2).toUpperCase()
    const first = words[0]?.[0] ?? ''
    const last = words[words.length - 1]?.[0] ?? ''
    return (first + last).toUpperCase()
  })

  // --- Actions ---
  const fetchUser = async () => {
    const token = useCookie('auth_token')
    if (!token.value) {
      initialized.value = true
      return
    }

    isLoading.value = true
    try {
      const res = await authService.getCurrentUser()
      if (res.data) {
        user.value = res.data
      }
    } catch {
      user.value = null
    } finally {
      isLoading.value = false
      initialized.value = true
    }
  }

  const init = async () => {
    if (initialized.value) return
    await fetchUser()
  }

  const login = async (payload: LoginPayload) => {
    isLoading.value = true
    try {
      const res = await authService.login(payload)
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

        // Populate basic user info immediately for role checks
        if (res.data.user) {
          user.value = res.data.user
          initialized.value = true
        }

        // Fetch actual user data (including profile) instead of mocking
        await fetchUser()

        // Caller is responsible for navigation
      }
    } catch (error) {
      // eslint-disable-next-line no-console
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
    navigateTo('/auth/admin/login')
  }

  const updateProfile = async (updates: Partial<CurrentUser>) => {
    if (!user.value) return
    user.value = { ...user.value, ...updates } as CurrentUser
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
    userInitials,
    init,
    fetchUser,
    login,
    logout,
    updateProfile
  }
})
