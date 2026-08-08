import { ref } from 'vue'

export interface ToastItem {
  id: number
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
}

const toasts = ref<ToastItem[]>([])
let nextId = 0

export function useAppToast() {
  const show = (message: string, type: ToastItem['type'] = 'info', duration = 3000) => {
    const id = ++nextId
    toasts.value.push({ id, message, type })
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration)
    }
    return id
  }
  const dismiss = (id: number) => {
    const idx = toasts.value.findIndex((t) => t.id === id)
    if (idx >= 0) toasts.value.splice(idx, 1)
  }
  const success = (message: string) => { return show(message, 'success') }
  const error = (message: string) => { return show(message, 'error') }
  const warning = (message: string) => { return show(message, 'warning') }
  const info = (message: string) => { return show(message, 'info') }
  return { toasts, show, dismiss, success, error, warning, info }
}
