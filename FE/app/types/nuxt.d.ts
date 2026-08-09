declare module '#app' {
  interface RuntimeNuxtHooks {
    'app:toast': (options: {
      title?: string
      description?: string
      color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
      icon?: string
      timeout?: number

      actions?: Record<string, unknown>[]
    }) => void
  }
}

export {}
