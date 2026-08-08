export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  future: { compatibilityVersion: 4 },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxtjs/i18n',
  ],

  components: [
    { path: '~/components', pathPrefix: false, prefix: '' },
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
      script: [
        {
          innerHTML: `(function(){try{var m=document.cookie.match(/color-mode=([^;]+)/);if(m&&m[1]==='dark'){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          type: 'text/javascript',
        },
      ],
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'Hệ thống chuyển đổi số toàn diện cho xưởng bún gia đình' },
        { name: 'theme-color', content: '#ed7628' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap' },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
  },

  typescript: {
    strict: true,
  },

  imports: {
    dirs: ['core/mock', 'core/types', 'core/enums', 'core/constants'],
  },
})
