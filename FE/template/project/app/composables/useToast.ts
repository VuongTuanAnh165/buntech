import { ref } from 'vue'

export interface ToastItem {
  id: number
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
}

const toasts = ref<ToastItem[]>([])
let nextId = 0

export function useToast() {
  function show(message: string, type: ToastItem['type'] = 'success', duration = 4000) {
    const id = ++nextId
    toasts.value.push({ id, message, type })
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration)
    }
    return id
  }
  function dismiss(id: number) {
    const idx = toasts.value.findIndex((t) => t.id === id)
    if (idx >= 0) toasts.value.splice(idx, 1)
  }
  function success(message: string) { return show(message, 'success') }
  function error(message: string) { return show(message, 'error') }
  function warning(message: string) { return show(message, 'warning') }
  function info(message: string) { return show(message, 'info') }
  return { toasts, show, dismiss, success, error, warning, info }
}
