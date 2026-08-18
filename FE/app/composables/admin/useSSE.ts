

export const useAdminSSE = () => {
  const config = useRuntimeConfig()
  const token = useCookie('auth_token')
  let eventSource: EventSource | null = null

  const connect = (callbacks: { onOrderDelivered?: (data: { id: number }) => void }) => {
    if (!import.meta.client) return

    const baseUrl = config.public.apiBaseUrl || 'http://localhost:3333'
    const url = `${baseUrl}/api/v1/admin/events/sse?token=${token.value || ''}`

    eventSource = new EventSource(url)

    eventSource.onopen = () => {
      // eslint-disable-next-line no-console
      console.log('SSE connection opened.')
    }

    eventSource.addEventListener('order:delivered', (event: MessageEvent) => {
      if (callbacks.onOrderDelivered) {
        try {
          const data = JSON.parse(event.data)
          callbacks.onOrderDelivered(data)
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('Error parsing SSE data', e)
        }
      }
    })

    eventSource.onerror = (err) => {
      // eslint-disable-next-line no-console
      console.error('SSE connection error:', err)
      // EventSource automatically reconnects on most errors
    }
  }

  const disconnect = () => {
    if (eventSource) {
      eventSource.close()
      eventSource = null
      // eslint-disable-next-line no-console
      console.log('SSE connection closed.')
    }
  }

  onMounted(() => {
    // Optionally connect on mount, but usually caller will invoke connect()
  })

  onUnmounted(() => {
    disconnect()
  })

  return {
    connect,
    disconnect
  }
}
