/**
 * Plugin khởi tạo User Session khi app load.
 * Gọi API /auth/me 1 lần duy nhất trên Server (SSR).
 */
import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()

  // callOnce đảm bảo logic chỉ chạy 1 lần trên Server, không chạy lại trên Client
  await callOnce('auth-init', async () => {
    await authStore.fetchUser()
  })
})
