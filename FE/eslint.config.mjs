import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  ignores: ['template/**'],
  // Tùy chỉnh thêm các rules eslint nếu cần tại đây
  rules: {
    // ...
  }
})
