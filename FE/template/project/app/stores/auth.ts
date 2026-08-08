import { defineStore } from 'pinia'
import type { Profile } from '../core/types'
import { Role } from '../core/enums'
import { mockProfiles } from '../core/mock/data'

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
    role: (state) => state.user?.role ?? null,
    isAdmin: (state) => state.user?.role === Role.ADMIN,
    isDriver: (state) => state.user?.role === Role.DRIVER,
    isCustomer: (state) => state.user?.role === Role.CUSTOMER,
  },

  actions: {
    init() {
      if (this.initialized) return
      this.initialized = true
      if (import.meta.client) {
        const saved = sessionStorage.getItem('buntech_mock_auth')
        if (saved) {
          try {
            const userId = JSON.parse(saved)
            const profile = mockProfiles.find(p => p.id === userId)
            if (profile) this.user = profile
          } catch { /* ignore */ }
        }
      }
    },

    async login(email: string, _password: string) {
      this.loading = true
      try {
        let profile: Profile | undefined
        if (email === 'admin@buntech.vn') profile = mockProfiles.find(p => p.role === Role.ADMIN)
        else if (email === 'driver@buntech.vn') profile = mockProfiles.find(p => p.role === Role.DRIVER)
        else if (email === 'customer@buntech.vn') profile = mockProfiles.find(p => p.role === Role.CUSTOMER && p.status === 'ACTIVE')
        if (!profile) throw new Error('Invalid credentials')
        this.user = profile
        if (import.meta.client) sessionStorage.setItem('buntech_mock_auth', JSON.stringify(profile.id))
      } finally {
        this.loading = false
      }
    },

    async logout() {
      this.user = null
      if (import.meta.client) sessionStorage.removeItem('buntech_mock_auth')
    },

    async updateProfile(updates: Partial<Profile>) {
      if (!this.user) return
      this.user = { ...this.user, ...updates, updated_at: new Date().toISOString() }
    },

    async changePassword(_oldPassword: string, _newPassword: string) {
      // Mock - always succeeds
    },

    async register(email: string, _password: string, fullName: string) {
      this.loading = true
      try {
        const newProfile: Profile = {
          id: `usr-${Math.random().toString(36).slice(2, 10)}`,
          role: Role.CUSTOMER,
          phone: null,
          full_name: fullName || email.split('@')[0],
          status: 'ACTIVE' as never,
          debt_limit: 0,
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        mockProfiles.push(newProfile)
        this.user = newProfile
        if (import.meta.client) sessionStorage.setItem('buntech_mock_auth', JSON.stringify(newProfile.id))
      } finally {
        this.loading = false
      }
    },
  },
})
