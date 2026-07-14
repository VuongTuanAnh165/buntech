import BlogCategory from '#models/blog_category'
import type { Infer } from '@vinejs/vine/types'
import {
  type createBlogCategoryValidator,
  type updateBlogCategoryValidator,
} from '#validators/blog_category'

export type CreateBlogCategoryDTO = Infer<typeof createBlogCategoryValidator>
export type UpdateBlogCategoryDTO = Infer<typeof updateBlogCategoryValidator>

export default class BlogCategoryService {
  async getList() {
    return await BlogCategory.query()
      .select('id', 'name', 'slug', 'description', 'createdAt', 'updatedAt')
      .orderBy('createdAt', 'asc')
  }

  async findById(id: number) {
    return await BlogCategory.query()
      .select('id', 'name', 'slug', 'description', 'createdAt', 'updatedAt')
      .where('id', id)
      .firstOrFail()
  }

  async create(data: CreateBlogCategoryDTO) {
    return await BlogCategory.create(data)
  }

  async update(id: number, data: UpdateBlogCategoryDTO) {
    const category = await this.findById(id)
    category.merge(data)
    await category.save()
    return category
  }

  async delete(id: number) {
    const category = await this.findById(id)
    await category.delete()
  }
}
