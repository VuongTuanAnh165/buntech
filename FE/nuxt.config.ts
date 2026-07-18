// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  future: {
    compatibilityVersion: 4
  },

  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@pinia/nuxt',
    '@nuxt/image',
    'pinia-plugin-persistedstate/nuxt',
    'nuxt-security',
    '@vite-pwa/nuxt',
    '@nuxtjs/google-fonts'
  ],

  googleFonts: {
    families: {
      'Be+Vietnam+Pro': [300, 400, 500, 600, 700]
    },
    display: 'swap'
  },

  css: ['~/assets/css/main.css'],

  // --- Cấu hình Pinia Persisted State ---
  piniaPluginPersistedstate: {
    storage: 'localStorage',
    cookieOptions: {
      sameSite: 'lax',
      secure: true
    }
  },

  // --- Cấu hình Security ---
  security: {
    headers: {
      contentSecurityPolicy: false, // Tắt CSP mặc định ở dev
      xXSSProtection: '1; mode=block',
      xFrameOptions: 'DENY',
      strictTransportSecurity: {
        maxAge: 31536000,
        includeSubdomains: true
      }
    },
    rateLimiter: {
      tokensPerInterval: 150,
      interval: 300000 // 5 minutes
    }
  },

  // --- Cấu hình PWA ---
  pwa: {
    manifest: {
      name: 'BúnTech Đặt Hàng',
      short_name: 'BúnTech',
      theme_color: '#10b981', // emerald-500
      icons: []
    }
  },

  devtools: { enabled: true },

  runtimeConfig: {
    // Biến chỉ khả dụng ở Server (Nitro)
    // stripeSecretKey: process.env.STRIPE_SECRET_KEY,

    public: {
      // Biến dùng được ở cả Client và Server
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'
    }
  },

  // Cấu hình Caching (SWR) cho các trang tĩnh (Landing page)
  routeRules: process.env.NODE_ENV === 'production' ? {
    '/': { swr: 3600 }, // Cache trang chủ 1 tiếng trên server
    '/gioi-thieu': { static: true }
  } : {}
})
