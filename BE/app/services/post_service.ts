import Post from '#models/post'
import { DateTime } from 'luxon'
import drive from '@adonisjs/drive/services/main'
import { randomUUID } from 'node:crypto'
import type { Infer } from '@vinejs/vine/types'
import { Pagination } from '#enums/pagination'
import { type createPostValidator, type updatePostValidator } from '#validators/post'

export type CreatePostDTO = Infer<typeof createPostValidator>
export type UpdatePostDTO = Infer<typeof updatePostValidator>

interface GetPostListOptions {
  isPublic?: boolean
  categoryId?: number
}

export default class PostService {
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
      newKey = `posts/thumbnails/${randomUUID()}.${thumbnail.extname}`
      await thumbnail.moveToDisk(newKey)
      thumbnailUrl = await drive.use().getUrl(newKey)
    }

    try {
      return await Post.create({ ...postData, thumbnailUrl, authorId })
    } catch (error) {
      if (newKey) {
        await drive
          .use()
          .delete(newKey)
          .catch(() => {})
      }
      throw error
    }
  }

  async update(id: number, data: UpdatePostDTO) {
    const post = await this.findById(id)
    const { thumbnail, ...postData } = data

    let thumbnailUrl: string | undefined
    let oldKeyToDelete: string | undefined
    let newKey: string | undefined

    if (thumbnail) {
      // Đánh dấu file cũ để xóa sau
      if (post.thumbnailUrl && post.thumbnailUrl.includes('posts/thumbnails/')) {
        oldKeyToDelete = post.thumbnailUrl.substring(post.thumbnailUrl.indexOf('posts/thumbnails/'))
      }

      newKey = `posts/thumbnails/${randomUUID()}.${thumbnail.extname}`
      await thumbnail.moveToDisk(newKey)
      thumbnailUrl = await drive.use().getUrl(newKey)
    }

    try {
      post.merge({ ...postData, thumbnailUrl: thumbnailUrl || post.thumbnailUrl })
      await post.save()

      // Xóa file cũ sau khi DB save thành công
      if (oldKeyToDelete) {
        await drive
          .use()
          .delete(oldKeyToDelete)
          .catch(() => {})
      }

      return post
    } catch (error) {
      if (newKey) {
        await drive
          .use()
          .delete(newKey)
          .catch(() => {})
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
