import swagger from 'adonis-autoswagger'
import swaggerConfig from '#config/swagger'
import router from '@adonisjs/core/services/router'
import type { HttpContext } from '@adonisjs/core/http'

export default class SwaggerController {
  /**
   * @swagger
   * Trả về file cấu trúc API (OpenAPI spec)
   */
  async swagger({ response }: HttpContext) {
    const sw = swagger as Record<string, unknown>
    const swaggerRunner = (sw.default || sw) as { json: Function; ui: Function }
    const docs = await swaggerRunner.json(router.toJSON(), swaggerConfig)

    // Đảm bảo các schema custom trong config được giữ lại
    docs.components = docs.components || { schemas: {} }
    docs.components.schemas = {
      ...docs.components.schemas,
      ...(swaggerConfig.components?.schemas || {}),
    }

    // Đã thay thế việc parse source code bằng cách định nghĩa trực tiếp DTO schemas tại config/swagger.ts

    // Fix bug của adonis-autoswagger: Các thuộc tính nguyên thủy trong @responseBody JSON bị map thành giá trị trực tiếp thay vì Schema Object
    // Ví dụ: { success: true } sẽ gây crash Swagger UI vì nó mong đợi { success: { type: "boolean" } }
    const fixSwaggerProperties = (obj: Record<string, unknown> | null | undefined) => {
      if (typeof obj !== 'object' || obj === null) return

      const properties = obj.properties as Record<string, unknown> | undefined
      if (properties) {
        for (const key in properties) {
          const val = properties[key]
          if (typeof val === 'boolean') {
            properties[key] = { type: 'boolean', example: val }
          } else if (typeof val === 'string') {
            properties[key] = { type: 'string', example: val }
          } else if (typeof val === 'number') {
            properties[key] = { type: 'number', example: val }
          } else {
            fixSwaggerProperties(val as Record<string, unknown>)
          }
        }
      }
      for (const key in obj) {
        if (key !== 'properties') {
          fixSwaggerProperties(obj[key] as Record<string, unknown>)
        }
      }
    }

    fixSwaggerProperties(docs.paths)

    // Tự động sinh ra các DTO Schema chuẩn dựa trên các trường được `.select()` trong Service
    const dtoMappings: Record<
      string,
      { base: string; pick: string[]; relations?: Record<string, string> }
    > = {
      // Sub-relations
      CategoryBasic: { base: 'Category', pick: ['id', 'name', 'slug'] },
      CategoryNameOnly: { base: 'Category', pick: ['id', 'name'] },
      UserBasic: { base: 'User', pick: ['id', 'fullName'] },
      UserAvatar: { base: 'User', pick: ['id', 'fullName', 'avatarUrl'] },
      ProductImageBasic: { base: 'ProductImage', pick: ['id', 'fileUrl', 'altText'] },
      ProductReviewImageBasic: { base: 'ProductReviewImage', pick: ['fileUrl'] },
      ProductNameOnly: { base: 'Product', pick: ['id', 'name'] },

      // Main DTOs
      CategoryAdminList: {
        base: 'Category',
        pick: ['id', 'name', 'slug', 'thumbnailUrl', 'createdAt', 'updatedAt'],
      },
      CategoryClientList: {
        base: 'Category',
        pick: ['id', 'name', 'slug', 'thumbnailUrl', 'description', 'metaTitle', 'metaDescription'],
      },
      BlogCategoryList: {
        base: 'BlogCategory',
        pick: ['id', 'name', 'slug', 'description', 'createdAt', 'updatedAt'],
      },

      PostList: {
        base: 'Post',
        pick: [
          'id',
          'title',
          'slug',
          'thumbnailUrl',
          'createdAt',
          'blogCategoryId',
          'authorId',
          'isPublished',
          'publishedAt',
        ],
        relations: { category: 'CategoryBasic', author: 'UserBasic' },
      },
      PostDetail: {
        base: 'Post',
        pick: [
          'id',
          'title',
          'slug',
          'thumbnailUrl',
          'content',
          'metaTitle',
          'metaDescription',
          'createdAt',
          'updatedAt',
          'blogCategoryId',
          'authorId',
          'isPublished',
          'publishedAt',
        ],
        relations: { category: 'Category', author: 'UserAvatar' },
      },

      ProductAdminList: {
        base: 'Product',
        pick: [
          'id',
          'name',
          'slug',
          'basePrice',
          'unit',
          'isActive',
          'thumbnailUrl',
          'categoryId',
          'createdAt',
        ],
        relations: { category: 'CategoryBasic' },
      },
      ProductClientList: {
        base: 'Product',
        pick: [
          'id',
          'name',
          'slug',
          'basePrice',
          'unit',
          'thumbnailUrl',
          'shortDescription',
          'categoryId',
          'metaTitle',
          'metaDescription',
        ],
        relations: { category: 'CategoryBasic' },
      },
      ProductAdminShow: {
        base: 'Product',
        pick: [
          'id',
          'name',
          'slug',
          'basePrice',
          'unit',
          'isActive',
          'thumbnailUrl',
          'shortDescription',
          'content',
          'categoryId',
          'metaTitle',
          'metaDescription',
          'totalReviews',
          'averageRating',
          'createdBy',
          'updatedBy',
          'createdAt',
          'updatedAt',
        ],
        relations: { category: 'CategoryNameOnly', images: 'ProductImageBasic' },
      },

      ProductReviewClientList: {
        base: 'ProductReview',
        pick: ['id', 'rating', 'content', 'createdAt', 'userId', 'hasPurchased', 'replyContent'],
        relations: { user: 'UserBasic', images: 'ProductReviewImageBasic' },
      },
      ProductReviewAdminList: {
        base: 'ProductReview',
        pick: [
          'id',
          'rating',
          'content',
          'createdAt',
          'userId',
          'productId',
          'isApproved',
          'hasPurchased',
          'repliedBy',
          'replyContent',
        ],
        relations: { user: 'UserBasic', product: 'ProductNameOnly', replier: 'UserBasic' },
      },
    }

    for (const [dtoName, config] of Object.entries(dtoMappings)) {
      const baseSchema = docs.components.schemas[config.base]
      if (baseSchema) {
        const newProperties: Record<string, unknown> = {}
        for (const prop of config.pick) {
          const snakeProp = prop.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
          if (baseSchema.properties[prop]) {
            newProperties[prop] = baseSchema.properties[prop]
          } else if (baseSchema.properties[snakeProp]) {
            newProperties[snakeProp] = baseSchema.properties[snakeProp]
          }
        }
        if (config.relations) {
          for (const [relName, relDto] of Object.entries(config.relations)) {
            const snakeRel = relName.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
            const originalRel = baseSchema.properties[relName] || baseSchema.properties[snakeRel]
            if (originalRel && originalRel.type === 'array') {
              newProperties[snakeRel] = {
                type: 'array',
                items: { $ref: `#/components/schemas/${relDto}` },
              }
            } else {
              newProperties[snakeRel] = { $ref: `#/components/schemas/${relDto}` }
            }
          }
        }
        docs.components.schemas[dtoName] = {
          type: 'object',
          properties: newProperties,
          description: dtoName + ' (DTO)',
        }
      }
    }

    // Tự động sinh ra các Schema Wrapper (Response) cho TẤT CẢ các Schema
    // Để Controller JSDoc có thể viết gọn: @responseBody 200 - <ModelResponse> hoặc <PaginatedModelListResponse>
    const schemaNames = Object.keys(docs.components.schemas)
    for (const schemaName of schemaNames) {
      if (schemaName.endsWith('Response') || schemaName.startsWith('Paginated')) continue

      // 1. Tạo ModelResponse: { success, message, data: Model }
      const modelResponseName = `${schemaName}Response`
      if (!docs.components.schemas[modelResponseName]) {
        docs.components.schemas[modelResponseName] = {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Thành công' },
            data: { $ref: `#/components/schemas/${schemaName}` },
          },
        }
      }

      // 2. Tạo PaginatedModelList: { meta: PaginationMeta, data: Model[] }
      const paginatedListName = `Paginated${schemaName}List`
      docs.components.schemas[paginatedListName] = {
        type: 'object',
        properties: {
          meta: { $ref: '#/components/schemas/PaginationMeta' },
          data: { type: 'array', items: { $ref: `#/components/schemas/${schemaName}` } },
        },
      }

      // 3. Tạo PaginatedModelListResponse: { success, message, data: PaginatedModelList }
      const paginatedListResponseName = `${paginatedListName}Response`
      if (!docs.components.schemas[paginatedListResponseName]) {
        docs.components.schemas[paginatedListResponseName] = {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Thành công' },
            data: { $ref: `#/components/schemas/${paginatedListName}` },
          },
        }
      }
    }

    return response.send(docs)
  }

  /**
   * @docs
   * Trả về giao diện HTML Swagger UI
   */
  async docs({ response }: HttpContext) {
    const sw = swagger as Record<string, unknown>
    const swaggerRunner = (sw.default || sw) as { ui: Function }
    const html = swaggerRunner.ui('/swagger', swaggerConfig)
    return response.header('Content-Type', 'text/html').send(html)
  }
}
