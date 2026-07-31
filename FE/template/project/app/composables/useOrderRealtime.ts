import { ref, onUnmounted } from 'vue'

export function useOrderRealtime(onChange: () => void) {
  const connected = ref(false)
  let intervalId: ReturnType<typeof setInterval> | null = null

  function connect() {
    // In mock mode, simulate realtime by polling every 10 seconds
    connected.value = true
    intervalId = setInterval(() => {
      onChange()
    }, 10000)
  }

  function disconnect() {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
    connected.value = false
  }

  connect()

  onUnmounted(() => {
    disconnect()
  })

  return { connected, disconnect, reconnect: connect }
}
