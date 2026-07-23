import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// Fallback for environments without import.meta.dirname
const currentDirname = import.meta.dirname || dirname(fileURLToPath(import.meta.url))

export default {
  openapi: '3.0.0',
  path: join(currentDirname, '../'),
  title: 'Buntech API',
  version: '1.0.0',
  description:
    'API Documentation for Buntech Backend. Auto-generated from routes and VineJS schemas.',
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
          token: { type: 'string' },
        },
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          page: { type: 'number', example: 1 },
          pageSize: { type: 'number', example: 10 },
          total: { type: 'number', example: 100 },
          totalPages: { type: 'number', example: 10 },
        },
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
              refreshToken: { type: 'string', example: 'a1b2c3d4...' },
            },
          },
        },
      },
      RefreshResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Thành công' },
          data: {
            type: 'object',
            properties: {
              accessToken: { type: 'string', example: 'oat_...' },
            },
          },
        },
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
                  zaloUserId: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          slug: { type: 'string' },
          thumbnailUrl: { type: 'string', nullable: true },
          description: { type: 'string', nullable: true },
          metaTitle: { type: 'string', nullable: true },
          metaDescription: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          fullName: { type: 'string' },
          avatarUrl: { type: 'string', nullable: true },
        },
      },
      ProductImage: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          fileUrl: { type: 'string' },
          altText: { type: 'string', nullable: true },
        },
      },
      ProductReviewImage: {
        type: 'object',
        properties: {
          fileUrl: { type: 'string' },
        },
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          slug: { type: 'string' },
          basePrice: { type: 'string' },
          unit: { type: 'string' },
          isActive: { type: 'boolean' },
          thumbnailUrl: { type: 'string', nullable: true },
          shortDescription: { type: 'string', nullable: true },
          content: { type: 'string', nullable: true },
          categoryId: { type: 'integer' },
          metaTitle: { type: 'string', nullable: true },
          metaDescription: { type: 'string', nullable: true },
          totalReviews: { type: 'integer' },
          averageRating: { type: 'string', nullable: true },
          createdBy: { type: 'integer' },
          updatedBy: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      BlogCategory: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          slug: { type: 'string' },
          description: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Post: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          title: { type: 'string' },
          slug: { type: 'string' },
          thumbnailUrl: { type: 'string', nullable: true },
          content: { type: 'string', nullable: true },
          metaTitle: { type: 'string', nullable: true },
          metaDescription: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          blogCategoryId: { type: 'integer' },
          authorId: { type: 'integer' },
          isPublished: { type: 'boolean' },
          publishedAt: { type: 'string', format: 'date-time', nullable: true },
        },
      },
      ProductReview: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          rating: { type: 'number' },
          content: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          userId: { type: 'integer' },
          productId: { type: 'integer' },
          isApproved: { type: 'boolean' },
          hasPurchased: { type: 'boolean' },
          repliedBy: { type: 'integer', nullable: true },
          replyContent: { type: 'string', nullable: true },
        },
      },
    },
  },
}
