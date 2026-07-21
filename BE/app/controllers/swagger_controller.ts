import swagger from 'adonis-autoswagger'
import swaggerConfig from '#config/swagger'
import router from '@adonisjs/core/services/router'
import type { HttpContext } from '@adonisjs/core/http'
import fs from 'node:fs/promises'
import app from '@adonisjs/core/services/app'
import { ModelParser } from 'adonis-autoswagger/dist/parsers.js'

export default class SwaggerController {
  /**
   * Trả về file cấu trúc API (OpenAPI spec)
   */
  async swagger({ response }: HttpContext) {
    const sw: any = swagger
    const docs = await (sw.default || sw).json(router.toJSON(), swaggerConfig)
    
    // Đảm bảo các schema custom trong config được giữ lại
    docs.components = docs.components || { schemas: {} }
    docs.components.schemas = {
      ...docs.components.schemas,
      ...(swaggerConfig.components?.schemas || {})
    }

    // Nạp properties từ schema.ts (bổ sung cho Model vì Model chỉ khai báo relations)
    try {
      const schemaPath = app.makePath('database/schema.ts')
      const schemaContent = await fs.readFile(schemaPath, 'utf8')
      const parser = new ModelParser(swaggerConfig.snakeCase || true)
      
      const lines = schemaContent.split('export class ')
      lines.shift() // bỏ qua header
      
      for (const block of lines) {
        const data = 'export default class ' + block
        const parsed = parser.parseModelProperties(data)
        const name = block.split(' ')[0].replace('Schema', '')
        
        // Merge properties vào schema hiện tại của Model
        if (docs.components.schemas[name]) {
          docs.components.schemas[name].properties = {
            ...parsed.props,
            ...(docs.components.schemas[name].properties || {}) // Giữ lại relations từ Model
          }
        }
      }
    } catch (e) {
      console.error('Failed to parse database/schema.ts for swagger', e)
    }

    // Fix bug của adonis-autoswagger: Các thuộc tính nguyên thủy trong @responseBody JSON bị map thành giá trị trực tiếp thay vì Schema Object
    // Ví dụ: { success: true } sẽ gây crash Swagger UI vì nó mong đợi { success: { type: "boolean" } }
    const fixSwaggerProperties = (obj: any) => {
      if (typeof obj !== 'object' || obj === null) return
      
      if (obj.properties) {
        for (const key in obj.properties) {
          const val = obj.properties[key]
          if (typeof val === 'boolean') {
            obj.properties[key] = { type: 'boolean', example: val }
          } else if (typeof val === 'string') {
            obj.properties[key] = { type: 'string', example: val }
          } else if (typeof val === 'number') {
            obj.properties[key] = { type: 'number', example: val }
          } else {
            fixSwaggerProperties(val)
          }
        }
      }
      
      for (const key in obj) {
        if (key !== 'properties') {
          fixSwaggerProperties(obj[key])
        }
      }
    }
    
    fixSwaggerProperties(docs.paths)


    // Tự động sinh ra các DTO Schema chuẩn dựa trên các trường được `.select()` trong Service
    const dtoMappings: Record<string, { base: string, pick: string[], relations?: Record<string, string> }> = {
      // Sub-relations
      CategoryBasic: { base: 'Category', pick: ['id', 'name', 'slug'] },
      CategoryNameOnly: { base: 'Category', pick: ['id', 'name'] },
      UserBasic: { base: 'User', pick: ['id', 'fullName'] },
      UserAvatar: { base: 'User', pick: ['id', 'fullName', 'avatarUrl'] },
      ProductImageBasic: { base: 'ProductImage', pick: ['id', 'fileUrl', 'altText'] },
      ProductReviewImageBasic: { base: 'ProductReviewImage', pick: ['fileUrl'] },
      ProductNameOnly: { base: 'Product', pick: ['id', 'name'] },

      // Main DTOs
      CategoryAdminList: { base: 'Category', pick: ['id', 'name', 'slug', 'thumbnailUrl', 'createdAt', 'updatedAt'] },
      CategoryClientList: { base: 'Category', pick: ['id', 'name', 'slug', 'thumbnailUrl', 'description', 'metaTitle', 'metaDescription'] },
      BlogCategoryList: { base: 'BlogCategory', pick: ['id', 'name', 'slug', 'description', 'createdAt', 'updatedAt'] },
      
      PostList: { 
        base: 'Post', 
        pick: ['id', 'title', 'slug', 'thumbnailUrl', 'createdAt', 'blogCategoryId', 'authorId', 'isPublished', 'publishedAt'],
        relations: { category: 'CategoryBasic', author: 'UserBasic' }
      },
      PostDetail: { 
        base: 'Post', 
        pick: ['id', 'title', 'slug', 'thumbnailUrl', 'content', 'metaTitle', 'metaDescription', 'createdAt', 'updatedAt', 'blogCategoryId', 'authorId', 'isPublished', 'publishedAt'],
        relations: { category: 'Category', author: 'UserAvatar' }
      },
      
      ProductAdminList: { 
        base: 'Product', 
        pick: ['id', 'name', 'slug', 'basePrice', 'unit', 'isActive', 'thumbnailUrl', 'categoryId', 'createdAt'],
        relations: { category: 'CategoryBasic' }
      },
      ProductClientList: { 
        base: 'Product', 
        pick: ['id', 'name', 'slug', 'basePrice', 'unit', 'thumbnailUrl', 'shortDescription', 'categoryId', 'metaTitle', 'metaDescription'],
        relations: { category: 'CategoryBasic' }
      },
      ProductAdminShow: {
        base: 'Product',
        pick: ['id', 'name', 'slug', 'basePrice', 'unit', 'isActive', 'thumbnailUrl', 'shortDescription', 'content', 'categoryId', 'metaTitle', 'metaDescription', 'totalReviews', 'averageRating', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt'],
        relations: { category: 'CategoryNameOnly', images: 'ProductImageBasic' } 
      },
      
      ProductReviewClientList: { 
        base: 'ProductReview', 
        pick: ['id', 'rating', 'content', 'createdAt', 'userId', 'hasPurchased', 'replyContent'],
        relations: { user: 'UserBasic', images: 'ProductReviewImageBasic' }
      },
      ProductReviewAdminList: {
        base: 'ProductReview',
        pick: ['id', 'rating', 'content', 'createdAt', 'userId', 'productId', 'isApproved', 'hasPurchased', 'repliedBy', 'replyContent'],
        relations: { user: 'UserBasic', product: 'ProductNameOnly', replier: 'UserBasic' }
      }
    };

    for (const [dtoName, config] of Object.entries(dtoMappings)) {
      const baseSchema = docs.components.schemas[config.base]
      if (baseSchema) {
        const newProperties: any = {}
        for (const prop of config.pick) {
          const snakeProp = prop.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
          if (baseSchema.properties[prop]) {
            newProperties[prop] = baseSchema.properties[prop]
          } else if (baseSchema.properties[snakeProp]) {
            newProperties[snakeProp] = baseSchema.properties[snakeProp]
          }
        }
        if (config.relations) {
          for (const [relName, relDto] of Object.entries(config.relations)) {
            const snakeRel = relName.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            const originalRel = baseSchema.properties[relName] || baseSchema.properties[snakeRel];
            if (originalRel && originalRel.type === 'array') {
              newProperties[snakeRel] = { type: 'array', items: { $ref: `#/components/schemas/${relDto}` } }
            } else {
              newProperties[snakeRel] = { $ref: `#/components/schemas/${relDto}` }
            }
          }
        }
        docs.components.schemas[dtoName] = {
          type: 'object',
          properties: newProperties,
          description: dtoName + ' (DTO)'
        }
      }
    }

        return response.send(docs)
  }

  /**
   * Trả về giao diện HTML Swagger UI
   */
  async docs({ response }: HttpContext) {
    const sw: any = swagger
    const html = (sw.default || sw).ui('/swagger', swaggerConfig)
    return response.header('Content-Type', 'text/html').send(html)
  }
}
