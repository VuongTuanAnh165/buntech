import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    ignores: ['.agents/**', 'all_*.txt', 'template/**', 'android/**', 'ios/**']
  },
  {
    rules: {
      'no-console': 'warn',
      'no-debugger': 'error',
      '@typescript-eslint/no-explicit-any': 'error'
    }
  }
)
