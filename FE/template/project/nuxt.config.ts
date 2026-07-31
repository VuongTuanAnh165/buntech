export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  future: { compatibilityVersion: 4 },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxtjs/i18n',
  ],

  css: ['~/assets/css/main.css'],



  i18n: {
    locales: [{ code: 'vi', iso: 'vi-VN', file: 'vi.json' }],
    defaultLocale: 'vi',
    langDir: 'locales',
    strategy: 'no_prefix',
  },

  app: {
    head: {
      title: 'BunTech - Hệ thống quản lý xưởng bún',
      htmlAttrs: { lang: 'vi' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Hệ thống chuyển đổi số toàn diện cho xưởng bún gia đình' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap' },
      ],
    },
  },

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
  },

  typescript: {
    strict: true,
  },
})
