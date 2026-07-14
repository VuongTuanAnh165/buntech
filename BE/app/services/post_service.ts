import Post from '#models/post'
import { DateTime } from 'luxon'
import type { Infer } from '@vinejs/vine/types'
import { Pagination } from '#enums/pagination'
import { type createPostValidator, type updatePostValidator } from '#validators/post'
import FileUploadService from '#services/file_upload_service'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'

export type CreatePostDTO = Infer<typeof createPostValidator>
export type UpdatePostDTO = Infer<typeof updatePostValidator>

interface GetPostListOptions {
  isPublic?: boolean
  categoryId?: number
}

@inject()
export default class PostService {
  constructor(protected fileUploadService: FileUploadService) {}

  async getList(page: number = 1, limit: number = 10, options?: GetPostListOptions) {
    const safeLimit = Math.min(limit, Pagination.MAX_LIMIT)
    const query = Post.query()
      .select(
        'id',
        'title',
        'slug',
        'thumbnailUrl',
        'createdAt',
        'blogCategoryId',
        'authorId',
        'isPublished',
        'publishedAt'
      )
      .preload('category', (q) => q.select('id', 'name', 'slug'))
      .preload('author', (q) => q.select('id', 'fullName'))
      .orderBy('createdAt', 'desc')

    if (options?.categoryId) {
      query.where('blogCategoryId', options.categoryId)
    }

    if (options?.isPublic) {
      query.where('isPublished', true).andWhere('publishedAt', '<=', DateTime.now().toSQL())
    }

    return await query.paginate(page, safeLimit)
  }

  async findById(id: number, options?: { isPublic?: boolean }) {
    const query = Post.query()
      .select(
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
        'publishedAt'
      )
      .where('id', id)
      .preload('category')
      .preload('author', (q) => q.select('id', 'fullName', 'avatarUrl'))

    if (options?.isPublic) {
      query.where('isPublished', true).andWhere('publishedAt', '<=', DateTime.now().toSQL())
    }

    return await query.firstOrFail()
  }

  async create(data: CreatePostDTO, authorId: number) {
    const { thumbnail, ...postData } = data

    let thumbnailUrl: string | undefined
    let newKey: string | undefined

    if (thumbnail) {
      const uploadResult = await this.fileUploadService.upload(thumbnail, 'posts/thumbnails')
      thumbnailUrl = uploadResult.url
      newKey = uploadResult.key
    }

    try {
      return await Post.create({ ...postData, thumbnailUrl, authorId })
    } catch (error) {
      logger.error({ err: error }, 'Tạo bài viết thất bại')
      if (newKey) {
        await this.fileUploadService.delete(newKey)
      }
      throw error
    }
  }

  async update(id: number, data: UpdatePostDTO) {
    const post = await this.findById(id)
    const { thumbnail, ...postData } = data

    let thumbnailUrl: string | undefined
    let oldKeyToDelete: string | null = null
    let newKey: string | undefined

    if (thumbnail) {
      // Đánh dấu file cũ để xóa sau
      oldKeyToDelete = this.fileUploadService.extractKeyFromUrl(post.thumbnailUrl, 'posts/thumbnails')

      const uploadResult = await this.fileUploadService.upload(thumbnail, 'posts/thumbnails')
      thumbnailUrl = uploadResult.url
      newKey = uploadResult.key
    }

    try {
      post.merge({ ...postData, thumbnailUrl: thumbnailUrl || post.thumbnailUrl })
      await post.save()

      // Xóa file cũ sau khi DB save thành công
      if (oldKeyToDelete) {
        await this.fileUploadService.delete(oldKeyToDelete)
      }

      return post
    } catch (error) {
      logger.error({ err: error }, 'Cập nhật bài viết thất bại')
      if (newKey) {
        await this.fileUploadService.delete(newKey)
      }
      throw error
    }
  }

  async delete(id: number) {
    const post = await this.findById(id)
    post.deletedAt = DateTime.now()
    await post.save()
  }
}
