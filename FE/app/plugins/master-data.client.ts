export default defineNuxtPlugin(async () => {
  try {
    const { initSync } = useMasterData()
    await initSync()
  } catch (e) {
    console.error('[MasterData Plugin] Lỗi đồng bộ:', e)
  }
})
