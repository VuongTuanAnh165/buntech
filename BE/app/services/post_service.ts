import Post from '#models/post'
import { DateTime } from 'luxon'
import drive from '@adonisjs/drive/services/main'
import { randomUUID } from 'node:crypto'
import type { Infer } from '@vinejs/vine/types'
import { createPostValidator, updatePostValidator } from '#validators/post'

export type CreatePostDTO = Infer<typeof createPostValidator>
export type UpdatePostDTO = Infer<typeof updatePostValidator>

interface GetPostListOptions {
  isPublic?: boolean
  categoryId?: number
}

export default class PostService {
  async getList(page: number = 1, limit: number = 10, options?: GetPostListOptions) {
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

    return await query.paginate(page, limit)
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
    
    if (thumbnail) {
      const key = `posts/thumbnails/${randomUUID()}.${thumbnail.extname}`
      await thumbnail.moveToDisk(key)
      thumbnailUrl = await drive.use().getUrl(key)
    }
    
    return await Post.create({ ...postData, thumbnailUrl, authorId })
  }

  async update(id: number, data: UpdatePostDTO) {
    const post = await this.findById(id)
    const { thumbnail, ...postData } = data
    
    let thumbnailUrl: string | undefined
    
    if (thumbnail) {
      const key = `posts/thumbnails/${randomUUID()}.${thumbnail.extname}`
      await thumbnail.moveToDisk(key)
      thumbnailUrl = await drive.use().getUrl(key)
    }

    post.merge({ ...postData, thumbnailUrl: thumbnailUrl || post.thumbnailUrl })
    await post.save()
    return post
  }

  async delete(id: number) {
    const post = await this.findById(id)
    post.deletedAt = DateTime.now()
    await post.save()
  }
}