import { defineStore } from 'pinia'
import { AuthService } from '~/services/authService'
import type { LoginPayload } from '~/types/auth'
import type { CurrentUser } from '~/types/common'
import { Role } from '~/enums/role'

export const useAuthStore = defineStore('auth', () => {
  // --- State ---
  const isLoading = ref(false)
  const user = ref<CurrentUser | null>(null)
  const initialized = ref(false)

  // --- Getters ---
  const isAuthenticated = computed(() => !!user.value)
  const role = computed(() => user.value?.role ?? null)
  const isAdmin = computed(() => user.value?.role === Role.ADMIN)
  const isDriver = computed(() => user.value?.role === Role.DRIVER)
  const isCustomer = computed(() => user.value?.role === Role.CUSTOMER)

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
      const res = await AuthService.getCurrentUser()
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

        // Fetch actual user data instead of mocking
        await fetchUser()

        const route = useRoute()
        const redirectPath = route.query.redirect as string | undefined
        
        // redirect based on role
        if (!redirectPath) {
          if (isAdmin.value) navigateTo('/admin')
          else if (isDriver.value) navigateTo('/driver')
          else navigateTo('/')
        } else {
          navigateTo(redirectPath)
        }
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
    navigateTo('/auth/admin/login')
  }

  const updateProfile = async (updates: Partial<CurrentUser>) => {
    if (!user.value) return
    user.value = { ...user.value, ...updates } as CurrentUser
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
    userInitials,
    init,
    fetchUser,
    login,
    logout,
    updateProfile,
    changePassword,
  }
})
