export function useColorMode() {
  const colorMode = useCookie<'light' | 'dark'>('color-mode', {
    default: () => 'light',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  })

  function toggleDark() {
    colorMode.value = colorMode.value === 'light' ? 'dark' : 'light'
    if (import.meta.client) {
      document.documentElement.classList.toggle('dark', colorMode.value === 'dark')
    }
  }

  function initDark() {
    if (import.meta.client) {
      document.documentElement.classList.toggle('dark', colorMode.value === 'dark')
    }
  }

  return { colorMode, toggleDark, initDark }
}
