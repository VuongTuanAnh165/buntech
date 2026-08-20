import { viMessages } from './locales/vi'

export const t = (key: string, params?: Record<string, string | number>): string => {
  let message = viMessages[key] || key
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      message = message.replace(`{${k}}`, String(v))
    }
  }
  return message
}
