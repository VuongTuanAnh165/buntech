import { defineConfig } from '@foadonis/openapi'

export default defineConfig({
  ui: 'swagger',
  document: {
    info: {
      title: 'Buntech API',
      version: '1.0.0',
      description: 'API Documentation for Buntech Backend (Nuxt 4 FE)',
    },
    servers: [
      {
        url: 'http://localhost:3333/api/v1',
        description: 'Local server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
})
