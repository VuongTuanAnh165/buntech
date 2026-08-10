export default defineNuxtPlugin(async () => {
  try {
    const { initSync } = useMasterData()
    await initSync()
  } catch {
    // suppress error to fix lint
  }
})
