/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  drive: {
    fs: {
      serve: typeof routes['drive.fs.serve']
    }
  }
  openapi: {
    html: typeof routes['openapi.html']
    json: typeof routes['openapi.json']
    yaml: typeof routes['openapi.yaml']
  }
  auth: {
    login: typeof routes['auth.login']
    refresh: typeof routes['auth.refresh']
    me: typeof routes['auth.me']
  }
  masterData: {
    getDivisionsVersion: typeof routes['master_data.get_divisions_version']
    getDivisions: typeof routes['master_data.get_divisions']
  }
  blogCategories: {
    clientIndex: typeof routes['blog_categories.client_index']
    index: typeof routes['blog_categories.index']
    show: typeof routes['blog_categories.show']
    store: typeof routes['blog_categories.store']
    update: typeof routes['blog_categories.update']
    destroy: typeof routes['blog_categories.destroy']
  }
  posts: {
    clientIndex: typeof routes['posts.client_index']
    clientShow: typeof routes['posts.client_show']
    index: typeof routes['posts.index']
    show: typeof routes['posts.show']
    store: typeof routes['posts.store']
    update: typeof routes['posts.update']
    destroy: typeof routes['posts.destroy']
  }
  categories: {
    clientIndex: typeof routes['categories.client_index']
    clientShow: typeof routes['categories.client_show']
    index: typeof routes['categories.index']
    show: typeof routes['categories.show']
    store: typeof routes['categories.store']
    update: typeof routes['categories.update']
    destroy: typeof routes['categories.destroy']
  }
  products: {
    clientIndex: typeof routes['products.client_index']
    clientShow: typeof routes['products.client_show']
    index: typeof routes['products.index']
    show: typeof routes['products.show']
    store: typeof routes['products.store']
    update: typeof routes['products.update']
    destroy: typeof routes['products.destroy']
  }
  productReviews: {
    clientIndex: typeof routes['product_reviews.client_index']
    store: typeof routes['product_reviews.store']
    index: typeof routes['product_reviews.index']
    approve: typeof routes['product_reviews.approve']
    reply: typeof routes['product_reviews.reply']
    destroy: typeof routes['product_reviews.destroy']
  }
}
