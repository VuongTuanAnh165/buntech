import type { Ref } from 'vue'

export function useFocusTrap(containerRef: Ref<HTMLElement | null>) {
  const isActive = ref(false)

  const getFocusableElements = (el: HTMLElement): HTMLElement[] => {
    return Array.from(
      el.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((e) => e.offsetParent !== null)
  }

  const handleKeydown = (e: KeyboardEvent) => {
    if (!isActive.value || !containerRef.value) return
    if (e.key !== 'Tab') return

    const focusable = getFocusableElements(containerRef.value)
    if (focusable.length === 0) return

    const first = focusable[0]!
    const last = focusable[focusable.length - 1]!

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault()
        last.focus()
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }

  const activate = () => {
    isActive.value = true
    document.addEventListener('keydown', handleKeydown)
    if (containerRef.value) {
      const focusable = getFocusableElements(containerRef.value)
      if (focusable.length > 0) {
        setTimeout(() => focusable[0]!.focus(), 50)
      }
    }
  }

  const deactivate = () => {
    isActive.value = false
    document.removeEventListener('keydown', handleKeydown)
  }

  onUnmounted(() => {
    deactivate()
  })

  return { activate, deactivate, isActive }
}
