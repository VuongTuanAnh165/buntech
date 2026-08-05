export function useOrderRealtime(onChange: () => void) {
  const connected = ref(true)
  let interval: ReturnType<typeof setInterval> | null = null

  function connect() {
    if (interval) return
    interval = setInterval(() => {
      onChange()
    }, 10000)
  }

  function disconnect() {
    if (interval) {
      clearInterval(interval)
      interval = null
    }
    connected.value = false
  }

  connect()

  onUnmounted(() => {
    disconnect()
  })

  return { connected, disconnect, reconnect: connect }
}
