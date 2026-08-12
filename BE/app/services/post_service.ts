import Post from '#models/post'
import { DateTime } from 'luxon'
import type { Infer } from '@vinejs/vine/types'
import { Pagination } from '#enums/pagination'
import { type createPostValidator, type updatePostValidator } from '#validators/post'
import FileUploadService from '#services/file_upload_service'
import MediaService from '#services/media_service'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'

export type CreatePostDTO = Infer<typeof createPostValidator>
export type UpdatePostDTO = Infer<typeof updatePostValidator>

interface GetPostListOptions {
  isPublic?: boolean
  categoryId?: number
  search?: string
  status?: string
}

@inject()
export default class PostService {
  constructor(
    protected fileUploadService: FileUploadService,
    protected mediaService: MediaService
  ) {}

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
      .preload('category', (catQuery) => {
        catQuery.select('id', 'name', 'slug')
      })
      .preload('author', (userQuery) => {
        userQuery.select('id', 'fullName')
      })
      .orderBy('createdAt', 'desc')

    if (options?.categoryId) {
      query.where('blogCategoryId', options.categoryId)
    }

    if (options?.isPublic) {
      query.where('isPublished', true).andWhere('publishedAt', '<=', DateTime.now().toSQL())
    }

    if (options?.search) {
      query.where('title', 'LIKE', `%${options.search}%`)
    }

    if (options?.status) {
      if (options.status === 'PUBLISHED') {
        query.where('isPublished', true)
      } else if (options.status === 'DRAFT') {
        query.where('isPublished', false)
      }
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
      .preload('category', (q) => q.select('id', 'name', 'slug'))
      .preload('author', (q) => q.select('id', 'fullName'))

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

    // Xử lý ảnh trong nội dung bài viết (Chuyển tmp -> images)
    if (postData.content) {
      postData.content = await this.mediaService.processHtmlImages(null, postData.content)
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
      oldKeyToDelete = this.fileUploadService.extractKeyFromUrl(
        post.thumbnailUrl,
        'posts/thumbnails'
      )

      const uploadResult = await this.fileUploadService.upload(thumbnail, 'posts/thumbnails')
      thumbnailUrl = uploadResult.url
      newKey = uploadResult.key
    }

    // Xử lý ảnh trong nội dung bài viết (Chuyển tmp -> images và xoá ảnh rác)
    if (postData.content !== undefined) {
      postData.content = await this.mediaService.processHtmlImages(post.content, postData.content)
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
    const post = await Post.query().select('id').where('id', id).firstOrFail()
    await post.delete()
  }
}
