import { defineStore } from 'pinia'
import type { Profile } from '../core/types'
import { Role } from '../core/enums'
import { mockUserAccounts, mockUsers, type MockUser } from '../core/mockData'

const AUTH_STORAGE_KEY = 'buntech_auth_session'

interface AuthState {
  user: Profile | null
  loading: boolean
  initialized: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    loading: false,
    initialized: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    isLoggedIn: (state) => !!state.user,
    role: (state) => state.user?.role ?? null,
    isAdmin: (state) => state.user?.role === Role.ADMIN,
    isDriver: (state) => state.user?.role === Role.DRIVER,
    isCustomer: (state) => state.user?.role === Role.CUSTOMER,
    isGuest: (state) => !state.user,
    fullName: (state) => state.user?.full_name ?? '',
    permissions: (state) => {
      const role = state.user?.role ?? 'GUEST'
      return rolePermissions[role] ?? []
    },
    hasPermission: (state) => (perm: string) => {
      const role = state.user?.role ?? 'GUEST'
      return (rolePermissions[role] ?? []).includes(perm)
    },
  },

  actions: {
    async init() {
      if (this.initialized) return
      this.initialized = true
      // Restore session from localStorage (client-side only)
      if (import.meta.client) {
        try {
          const stored = localStorage.getItem(AUTH_STORAGE_KEY)
          if (stored) {
            const session = JSON.parse(stored) as { email: string }
            const account = mockUserAccounts.find(u => u.email === session.email)
            if (account) {
              this.user = { ...account.profile }
            }
          }
        } catch {
          localStorage.removeItem(AUTH_STORAGE_KEY)
        }
      }
    },

    async fetchProfile() {
      // Profile is already loaded from mock data during login/init
      // This is a no-op in mock mode
    },

    async login(email: string, password: string) {
      this.loading = true
      try {
        // Simulate network delay
        await new Promise(r => setTimeout(r, 500))

        const account = mockUserAccounts.find(
          u => u.email === email && u.password === password
        )
        if (!account) {
          throw new Error('Email hoặc mật khẩu không đúng')
        }

        this.user = { ...account.profile }
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ email }))
      } finally {
        this.loading = false
      }
    },

    async register(email: string, password: string, fullName: string, _role: Role = Role.CUSTOMER) {
      this.loading = true
      try {
        await new Promise(r => setTimeout(r, 500))

        // Check if email already exists
        if (mockUserAccounts.find(u => u.email === email)) {
          throw new Error('Email đã được sử dụng')
        }

        // Create new mock user
        const newProfile: Profile = {
          id: crypto.randomUUID(),
          role: Role.CUSTOMER,
          phone: null,
          full_name: fullName,
          status: 'ACTIVE' as any,
          debt_limit: 0,
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        const newAccount: MockUser = { email, password, profile: newProfile }
        mockUserAccounts.push(newAccount)
        mockUsers.value.push({ ...newProfile })

        // Auto login after register
        this.user = { ...newProfile }
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ email }))
      } finally {
        this.loading = false
      }
    },

    async logout() {
      this.user = null
      localStorage.removeItem(AUTH_STORAGE_KEY)
    },

    async updateProfile(updates: Partial<Profile>) {
      if (!this.user) return
      await new Promise(r => setTimeout(r, 300))

      // Update in mock users list
      const idx = mockUsers.value.findIndex(u => u.id === this.user!.id)
      if (idx !== -1) {
        mockUsers.value[idx] = { ...mockUsers.value[idx], ...updates }
      }

      // Update account profile
      const account = mockUserAccounts.find(a => a.profile.id === this.user!.id)
      if (account) {
        Object.assign(account.profile, updates)
      }

      this.user = { ...this.user, ...updates } as Profile
    },

    async changePassword(oldPassword: string, newPassword: string) {
      await new Promise(r => setTimeout(r, 300))

      const account = mockUserAccounts.find(a => a.profile.id === this.user?.id)
      if (!account) throw new Error('Không tìm thấy tài khoản')
      if (account.password !== oldPassword) throw new Error('Mật khẩu cũ không đúng')

      account.password = newPassword
    },
  },
})

const rolePermissions: Record<string, string[]> = {
  ADMIN: ['dashboard', 'orders', 'products', 'users', 'reports', 'settings', 'blog', 'delivery'],
  CUSTOMER: ['portal', 'profile'],
  DRIVER: ['delivery', 'profile'],
  GUEST: [],
}
