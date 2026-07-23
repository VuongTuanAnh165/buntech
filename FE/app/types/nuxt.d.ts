declare module '#app' {
  interface RuntimeNuxtHooks {
    'app:toast': (options: {
      title?: string
      description?: string
      color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
      icon?: string
      timeout?: number
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      actions?: any[]
    }) => void
  }
}

export {}
