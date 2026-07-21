import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// Fallback for environments without import.meta.dirname
const __dirname = import.meta.dirname || dirname(fileURLToPath(import.meta.url))

export default {
  openapi: '3.0.0',
  path: join(__dirname, '../'),
  title: 'Buntech API',
  version: '1.0.0',
  description: 'API Documentation for Buntech Backend. Auto-generated from routes and VineJS schemas.',
  tagIndex: 2,
  info: {
    title: 'Buntech API',
    version: '1.0.0',
    description: 'Buntech Backend REST API',
  },
  snakeCase: true, // Convert camelCase schema keys to snake_case if needed
  useVineJs: true, // Extremely important: Parse VineJS schemas
  debug: true, // set to true
  ignore: ['/swagger', '/docs'],
  preferredPutPatch: 'PUT',
  common: {
    parameters: {},
    headers: {},
  },
  securitySchemes: {
    BearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
  },
  authMiddlewares: ['auth', 'auth:api'], 
  defaultSecurityScheme: 'BearerAuth',
  persistAuthorization: true, 
  showFullPath: false, 
  components: {
    schemas: {
      AccessToken: {
        type: 'object',
        properties: {
          type: { type: 'string', example: 'bearer' },
          token: { type: 'string' }
        }
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          page: { type: 'number', example: 1 },
          pageSize: { type: 'number', example: 10 },
          total: { type: 'number', example: 100 },
          totalPages: { type: 'number', example: 10 }
        }
      },
      LoginResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Thành công' },
          data: {
            type: 'object',
            properties: {
              accessToken: { type: 'string', example: 'oat_...' },
              refreshToken: { type: 'string', example: 'a1b2c3d4...' }
            }
          }
        }
      },
      RefreshResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Thành công' },
          data: {
            type: 'object',
            properties: {
              accessToken: { type: 'string', example: 'oat_...' }
            }
          }
        }
      },
      UserResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Thành công' },
          data: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              fullName: { type: 'string', example: 'Nguyễn Văn A' },
              phoneNumber: { type: 'string', example: '0987654321' },
              role: { type: 'string', example: 'admin' },
              profile: {
                type: 'object',
                nullable: true,
                properties: {
                  avatarUrl: { type: 'string', nullable: true },
                  storeName: { type: 'string', nullable: true },
                  currentDebt: { type: 'number', nullable: true },
                  debtLimit: { type: 'number', nullable: true },
                  zaloUserId: { type: 'string', nullable: true }
                }
              }
            }
          }
        }
      }
    }
  }
}
