import { defineStore } from 'pinia'
import type { Category, BlogCategory } from '../core/types'
import { mockCategories, mockBlogCategories } from '../core/mock/data'

interface MasterDataState {
  categories: Category[]
  blogCategories: BlogCategory[]
  categoriesLoaded: boolean
  blogCategoriesLoaded: boolean
}

export const useMasterDataStore = defineStore('masterData', {
  state: (): MasterDataState => ({
    categories: [],
    blogCategories: [],
    categoriesLoaded: false,
    blogCategoriesLoaded: false,
  }),

  actions: {
    loadCategories(force = false) {
      if (this.categoriesLoaded && !force) return
      this.categories = [...mockCategories]
      this.categoriesLoaded = true
    },

    loadBlogCategories(force = false) {
      if (this.blogCategoriesLoaded && !force) return
      this.blogCategories = [...mockBlogCategories]
      this.blogCategoriesLoaded = true
    },

    invalidate() {
      this.categoriesLoaded = false
      this.blogCategoriesLoaded = false
    },
  },
})
