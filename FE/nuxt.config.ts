const isMobileBuild = process.env.npm_lifecycle_event === 'build:mobile'

export default defineNuxtConfig({
  ssr: !isMobileBuild,
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
    '@nuxtjs/google-fonts',
    '@vueuse/nuxt'
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
    storage: 'cookies',
    cookieOptions: {
      sameSite: 'lax',
      secure: true
    }
  },

  // --- Cấu hình Security ---
  security: {
    headers: {
      contentSecurityPolicy: {
        'default-src': ["'self'"],
        'script-src': [
          "'self'",
          'https:',
          "'unsafe-inline'",
          "'strict-dynamic'",
          "'nonce-{{nonce}}'"
        ],
        'style-src': ["'self'", 'https:', "'unsafe-inline'"],
        'base-uri': ["'self'"],
        'img-src': ["'self'", 'data:', 'https:', 'http:', 'blob:'],
        'font-src': ["'self'", 'https:', 'data:'],
        'object-src': ["'none'"],
        'script-src-attr': ["'none'"],
        'connect-src': ["'self'", 'https:', 'http:', 'capacitor:', 'ionic:'],
        'upgrade-insecure-requests': process.env.NODE_ENV === 'production' && !isMobileBuild
      },
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
      name: 'BunTech App',
      short_name: 'BunTech',
      theme_color: '#10b981', // emerald-500
      icons: []
    }
  },

  // --- Cấu hình Nitro ---
  nitro: {
    prerender: {
      failOnError: false
    }
  },

  // --- Cấu hình Icon (fix: failed to load icon warnings) ---
  icon: {
    clientBundle: {
      scan: true,
      includeCustomCollections: true,
      icons: [
        'lucide:quote',
        'lucide:search-x',
        'lucide:home',
        'lucide:refresh-cw',
        'heroicons:star-solid'
      ]
    }
  },

  devtools: { enabled: true },

  runtimeConfig: {
    // Biến chỉ khả dụng ở Server (Nitro)
    // stripeSecretKey: process.env.STRIPE_SECRET_KEY,

    public: {
      // Biến dùng được ở cả Client và Server
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api',
      firebaseApiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID,
      firebaseVapidKey: process.env.NUXT_PUBLIC_FIREBASE_VAPID_KEY
    }
  },

  // Cấu hình Caching (SWR) cho các trang tĩnh (Landing page)
  routeRules:
    process.env.NODE_ENV === 'production'
      ? {
          '/': { swr: 3600 }, // Cache trang chủ 1 tiếng trên server
          '/gioi-thieu': { static: true }
        }
      : {},

  // --- Custom Vite Config for Leaflet ---
  vite: {
    optimizeDeps: {
      include: ['leaflet', '@vue-leaflet/vue-leaflet']
    }
  }
})
