import { defineStore } from 'pinia'
import type { Category, BlogCategory } from '../core/types'
import { mockCategories, mockBlogCategories } from '../core/mockData'

interface MasterDataState {
  categories: Category[]
  blogCategories: BlogCategory[]
  categoriesLoaded: boolean
  blogCategoriesLoaded: boolean
  categoriesETag: string | null
}

export const useMasterDataStore = defineStore('masterData', {
  state: (): MasterDataState => ({
    categories: [],
    blogCategories: [],
    categoriesLoaded: false,
    blogCategoriesLoaded: false,
    categoriesETag: null,
  }),

  actions: {
    async loadCategories(force = false) {
      if (this.categoriesLoaded && !force) return
      await new Promise(r => setTimeout(r, 200))
      this.categories = [...mockCategories.value].sort((a, b) => a.name.localeCompare(b.name))
      this.categoriesLoaded = true
    },

    async loadBlogCategories(force = false) {
      if (this.blogCategoriesLoaded && !force) return
      await new Promise(r => setTimeout(r, 200))
      this.blogCategories = [...mockBlogCategories.value].sort((a, b) => a.name.localeCompare(b.name))
      this.blogCategoriesLoaded = true
    },

    invalidate() {
      this.categoriesLoaded = false
      this.blogCategoriesLoaded = false
    },
  },
})
