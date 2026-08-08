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
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Thành công' },
        },
      },
      UploadResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Thành công' },
          data: {
            type: 'object',
            properties: { url: { type: 'string' }, path: { type: 'string' } },
          },
        },
      },
      QuickOrderResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Thành công' },
          data: {
            type: 'object',
            properties: { orderId: { type: 'integer' }, totalAmount: { type: 'string' } },
          },
        },
      },
      DashboardOverviewResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Thành công' },
          data: { type: 'object' },
        },
      },
      DebtSummaryResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Thành công' },
          data: { type: 'object' },
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
          phoneNumber: { type: 'string', nullable: true },
          role: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time', nullable: true },
          updatedAt: { type: 'string', format: 'date-time', nullable: true },
        },
      },
      UserProfile: {
        type: 'object',
        properties: {
          userId: { type: 'integer' },
          avatarUrl: { type: 'string', nullable: true },
          storeName: { type: 'string', nullable: true },
          debtLimit: { type: 'number', nullable: true },
          currentDebt: { type: 'number', nullable: true },
          zaloUserId: { type: 'string', nullable: true },
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
      Order: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          userId: { type: 'integer', nullable: true },
          shippingAddressId: { type: 'integer', nullable: true },
          source: { type: 'string' },
          status: { type: 'string', nullable: true },
          totalAmount: { type: 'string' },
          note: { type: 'string', nullable: true },
          deliveryDate: { type: 'string', format: 'date-time' },
          deliveryStatus: { type: 'string', nullable: true },
          paymentStatus: { type: 'string', nullable: true },
          driverId: { type: 'integer', nullable: true },
          routeOrder: { type: 'integer', nullable: true },
          createdAt: { type: 'string', format: 'date-time', nullable: true },
          updatedAt: { type: 'string', format: 'date-time', nullable: true },
        },
      },
      OrderItem: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          orderId: { type: 'integer', nullable: true },
          productId: { type: 'integer', nullable: true },
          quantity: { type: 'string' },
          unitPrice: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time', nullable: true },
          updatedAt: { type: 'string', format: 'date-time', nullable: true },
        },
      },
      Address: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          userId: { type: 'integer', nullable: true },
          addressLine: { type: 'string', nullable: true },
          ward: { type: 'string', nullable: true },
          district: { type: 'string', nullable: true },
          province: { type: 'string', nullable: true },
          latitude: { type: 'string', nullable: true },
          longitude: { type: 'string', nullable: true },
          isDefault: { type: 'boolean', nullable: true },
          createdAt: { type: 'string', format: 'date-time', nullable: true },
          updatedAt: { type: 'string', format: 'date-time', nullable: true },
        },
      },
      CustomerPrice: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          userId: { type: 'integer', nullable: true },
          productId: { type: 'integer', nullable: true },
          customPrice: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time', nullable: true },
          updatedAt: { type: 'string', format: 'date-time', nullable: true },
        },
      },
      RawMaterial: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          unit: { type: 'string' },
          currentStock: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time', nullable: true },
          updatedAt: { type: 'string', format: 'date-time', nullable: true },
        },
      },
      SystemConfig: {
        type: 'object',
        properties: {
          key: { type: 'string' },
          value: { type: 'string' },
          description: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time', nullable: true },
          updatedAt: { type: 'string', format: 'date-time', nullable: true },
        },
      },
      Transaction: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          userId: { type: 'integer', nullable: true },
          orderId: { type: 'integer', nullable: true },
          amount: { type: 'string' },
          type: { type: 'string' },
          paymentMethod: { type: 'string' },
          referenceCode: { type: 'string', nullable: true },
          transactionDate: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time', nullable: true },
          updatedAt: { type: 'string', format: 'date-time', nullable: true },
        },
      },
      AdministrativeDivision: {
        type: 'object',
        properties: {
          code: { type: 'integer' },
          name: { type: 'string' },
          codename: { type: 'string' },
          divisionType: { type: 'string' },
          phoneCode: { type: 'integer', nullable: true },
          level: { type: 'string' },
          parentCode: { type: 'integer', nullable: true },
          createdAt: { type: 'string', format: 'date-time', nullable: true },
          updatedAt: { type: 'string', format: 'date-time', nullable: true },
        },
      },
    },
  },
}
