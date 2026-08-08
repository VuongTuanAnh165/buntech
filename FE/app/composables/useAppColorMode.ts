export function useAppColorMode() {
  const colorMode = useCookie<'light' | 'dark'>('color-mode', {
    default: () => 'light',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  })
  const toggleDark = () => {
    colorMode.value = colorMode.value === 'light' ? 'dark' : 'light'
    if (import.meta.client) {
      document.documentElement.classList.toggle('dark', colorMode.value === 'dark')
    }
  }
  const initDark = () => {
    if (import.meta.client) {
      document.documentElement.classList.toggle('dark', colorMode.value === 'dark')
    }
  }

  return { colorMode, toggleDark, initDark }
}
