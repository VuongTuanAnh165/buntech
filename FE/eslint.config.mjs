import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    ignores: ['.agents/**', 'all_*.txt']
  },
  {
    rules: {}
  }
)
