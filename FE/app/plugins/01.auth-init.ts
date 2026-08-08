/**
 * Plugin khởi tạo User Session khi app load.
 * Gọi API /auth/me 1 lần duy nhất trên Server (SSR).
 */
export default defineNuxtPlugin(async () => {
  const userStore = useCurrentUserStore()

  // callOnce đảm bảo logic chỉ chạy 1 lần trên Server, không chạy lại trên Client
  await callOnce('auth-init', async () => {
    await userStore.fetchUser()
  })
})
