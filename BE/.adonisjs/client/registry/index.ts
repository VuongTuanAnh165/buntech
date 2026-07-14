/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'drive.fs.serve': {
    methods: ["GET","HEAD"],
    pattern: '/uploads/*',
    tokens: [{"old":"/uploads/*","type":0,"val":"uploads","end":""},{"old":"/uploads/*","type":2,"val":"*","end":""}],
    types: placeholder as Registry['drive.fs.serve']['types'],
  },
  'openapi.html': {
    methods: ["GET","HEAD"],
    pattern: '/docs',
    tokens: [{"old":"/docs","type":0,"val":"docs","end":""}],
    types: placeholder as Registry['openapi.html']['types'],
  },
  'openapi.json': {
    methods: ["GET","HEAD"],
    pattern: '/docs.json',
    tokens: [{"old":"/docs.json","type":0,"val":"docs.json","end":""}],
    types: placeholder as Registry['openapi.json']['types'],
  },
  'openapi.yaml': {
    methods: ["GET","HEAD"],
    pattern: '/docs.yaml',
    tokens: [{"old":"/docs.yaml","type":0,"val":"docs.yaml","end":""}],
    types: placeholder as Registry['openapi.yaml']['types'],
  },
  'auth.login': {
    methods: ["POST"],
    pattern: '/api/v1/auth/login',
    tokens: [{"old":"/api/v1/auth/login","type":0,"val":"api","end":""},{"old":"/api/v1/auth/login","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/login","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['auth.login']['types'],
  },
  'auth.refresh': {
    methods: ["POST"],
    pattern: '/api/v1/auth/refresh',
    tokens: [{"old":"/api/v1/auth/refresh","type":0,"val":"api","end":""},{"old":"/api/v1/auth/refresh","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/refresh","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/refresh","type":0,"val":"refresh","end":""}],
    types: placeholder as Registry['auth.refresh']['types'],
  },
  'auth.me': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/auth/me',
    tokens: [{"old":"/api/v1/auth/me","type":0,"val":"api","end":""},{"old":"/api/v1/auth/me","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/me","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/me","type":0,"val":"me","end":""}],
    types: placeholder as Registry['auth.me']['types'],
  },
  'master_data.get_divisions_version': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/master-data/divisions/version',
    tokens: [{"old":"/api/v1/master-data/divisions/version","type":0,"val":"api","end":""},{"old":"/api/v1/master-data/divisions/version","type":0,"val":"v1","end":""},{"old":"/api/v1/master-data/divisions/version","type":0,"val":"master-data","end":""},{"old":"/api/v1/master-data/divisions/version","type":0,"val":"divisions","end":""},{"old":"/api/v1/master-data/divisions/version","type":0,"val":"version","end":""}],
    types: placeholder as Registry['master_data.get_divisions_version']['types'],
  },
  'master_data.get_divisions': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/master-data/divisions',
    tokens: [{"old":"/api/v1/master-data/divisions","type":0,"val":"api","end":""},{"old":"/api/v1/master-data/divisions","type":0,"val":"v1","end":""},{"old":"/api/v1/master-data/divisions","type":0,"val":"master-data","end":""},{"old":"/api/v1/master-data/divisions","type":0,"val":"divisions","end":""}],
    types: placeholder as Registry['master_data.get_divisions']['types'],
  },
  'blog_categories.client_index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/blog-categories',
    tokens: [{"old":"/api/v1/blog-categories","type":0,"val":"api","end":""},{"old":"/api/v1/blog-categories","type":0,"val":"v1","end":""},{"old":"/api/v1/blog-categories","type":0,"val":"blog-categories","end":""}],
    types: placeholder as Registry['blog_categories.client_index']['types'],
  },
  'posts.client_index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/posts',
    tokens: [{"old":"/api/v1/posts","type":0,"val":"api","end":""},{"old":"/api/v1/posts","type":0,"val":"v1","end":""},{"old":"/api/v1/posts","type":0,"val":"posts","end":""}],
    types: placeholder as Registry['posts.client_index']['types'],
  },
  'posts.client_show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/posts/:id',
    tokens: [{"old":"/api/v1/posts/:id","type":0,"val":"api","end":""},{"old":"/api/v1/posts/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/posts/:id","type":0,"val":"posts","end":""},{"old":"/api/v1/posts/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['posts.client_show']['types'],
  },
  'categories.client_index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/categories',
    tokens: [{"old":"/api/v1/categories","type":0,"val":"api","end":""},{"old":"/api/v1/categories","type":0,"val":"v1","end":""},{"old":"/api/v1/categories","type":0,"val":"categories","end":""}],
    types: placeholder as Registry['categories.client_index']['types'],
  },
  'categories.client_show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/categories/:id',
    tokens: [{"old":"/api/v1/categories/:id","type":0,"val":"api","end":""},{"old":"/api/v1/categories/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/categories/:id","type":0,"val":"categories","end":""},{"old":"/api/v1/categories/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['categories.client_show']['types'],
  },
  'products.client_index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/products',
    tokens: [{"old":"/api/v1/products","type":0,"val":"api","end":""},{"old":"/api/v1/products","type":0,"val":"v1","end":""},{"old":"/api/v1/products","type":0,"val":"products","end":""}],
    types: placeholder as Registry['products.client_index']['types'],
  },
  'products.client_show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/products/:id',
    tokens: [{"old":"/api/v1/products/:id","type":0,"val":"api","end":""},{"old":"/api/v1/products/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/products/:id","type":0,"val":"products","end":""},{"old":"/api/v1/products/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['products.client_show']['types'],
  },
  'product_reviews.client_index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/products/:id/reviews',
    tokens: [{"old":"/api/v1/products/:id/reviews","type":0,"val":"api","end":""},{"old":"/api/v1/products/:id/reviews","type":0,"val":"v1","end":""},{"old":"/api/v1/products/:id/reviews","type":0,"val":"products","end":""},{"old":"/api/v1/products/:id/reviews","type":1,"val":"id","end":""},{"old":"/api/v1/products/:id/reviews","type":0,"val":"reviews","end":""}],
    types: placeholder as Registry['product_reviews.client_index']['types'],
  },
  'product_reviews.store': {
    methods: ["POST"],
    pattern: '/api/v1/products/:id/reviews',
    tokens: [{"old":"/api/v1/products/:id/reviews","type":0,"val":"api","end":""},{"old":"/api/v1/products/:id/reviews","type":0,"val":"v1","end":""},{"old":"/api/v1/products/:id/reviews","type":0,"val":"products","end":""},{"old":"/api/v1/products/:id/reviews","type":1,"val":"id","end":""},{"old":"/api/v1/products/:id/reviews","type":0,"val":"reviews","end":""}],
    types: placeholder as Registry['product_reviews.store']['types'],
  },
  'blog_categories.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/blog-categories',
    tokens: [{"old":"/api/v1/admin/blog-categories","type":0,"val":"api","end":""},{"old":"/api/v1/admin/blog-categories","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/blog-categories","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/blog-categories","type":0,"val":"blog-categories","end":""}],
    types: placeholder as Registry['blog_categories.index']['types'],
  },
  'blog_categories.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/blog-categories/:id',
    tokens: [{"old":"/api/v1/admin/blog-categories/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/blog-categories/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/blog-categories/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/blog-categories/:id","type":0,"val":"blog-categories","end":""},{"old":"/api/v1/admin/blog-categories/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['blog_categories.show']['types'],
  },
  'blog_categories.store': {
    methods: ["POST"],
    pattern: '/api/v1/admin/blog-categories',
    tokens: [{"old":"/api/v1/admin/blog-categories","type":0,"val":"api","end":""},{"old":"/api/v1/admin/blog-categories","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/blog-categories","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/blog-categories","type":0,"val":"blog-categories","end":""}],
    types: placeholder as Registry['blog_categories.store']['types'],
  },
  'blog_categories.update': {
    methods: ["PUT"],
    pattern: '/api/v1/admin/blog-categories/:id',
    tokens: [{"old":"/api/v1/admin/blog-categories/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/blog-categories/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/blog-categories/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/blog-categories/:id","type":0,"val":"blog-categories","end":""},{"old":"/api/v1/admin/blog-categories/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['blog_categories.update']['types'],
  },
  'blog_categories.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/admin/blog-categories/:id',
    tokens: [{"old":"/api/v1/admin/blog-categories/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/blog-categories/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/blog-categories/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/blog-categories/:id","type":0,"val":"blog-categories","end":""},{"old":"/api/v1/admin/blog-categories/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['blog_categories.destroy']['types'],
  },
  'posts.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/posts',
    tokens: [{"old":"/api/v1/admin/posts","type":0,"val":"api","end":""},{"old":"/api/v1/admin/posts","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/posts","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/posts","type":0,"val":"posts","end":""}],
    types: placeholder as Registry['posts.index']['types'],
  },
  'posts.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/posts/:id',
    tokens: [{"old":"/api/v1/admin/posts/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/posts/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/posts/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/posts/:id","type":0,"val":"posts","end":""},{"old":"/api/v1/admin/posts/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['posts.show']['types'],
  },
  'posts.store': {
    methods: ["POST"],
    pattern: '/api/v1/admin/posts',
    tokens: [{"old":"/api/v1/admin/posts","type":0,"val":"api","end":""},{"old":"/api/v1/admin/posts","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/posts","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/posts","type":0,"val":"posts","end":""}],
    types: placeholder as Registry['posts.store']['types'],
  },
  'posts.update': {
    methods: ["PUT"],
    pattern: '/api/v1/admin/posts/:id',
    tokens: [{"old":"/api/v1/admin/posts/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/posts/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/posts/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/posts/:id","type":0,"val":"posts","end":""},{"old":"/api/v1/admin/posts/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['posts.update']['types'],
  },
  'posts.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/admin/posts/:id',
    tokens: [{"old":"/api/v1/admin/posts/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/posts/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/posts/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/posts/:id","type":0,"val":"posts","end":""},{"old":"/api/v1/admin/posts/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['posts.destroy']['types'],
  },
  'categories.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/categories',
    tokens: [{"old":"/api/v1/admin/categories","type":0,"val":"api","end":""},{"old":"/api/v1/admin/categories","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/categories","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/categories","type":0,"val":"categories","end":""}],
    types: placeholder as Registry['categories.index']['types'],
  },
  'categories.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/categories/:id',
    tokens: [{"old":"/api/v1/admin/categories/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/categories/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/categories/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/categories/:id","type":0,"val":"categories","end":""},{"old":"/api/v1/admin/categories/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['categories.show']['types'],
  },
  'categories.store': {
    methods: ["POST"],
    pattern: '/api/v1/admin/categories',
    tokens: [{"old":"/api/v1/admin/categories","type":0,"val":"api","end":""},{"old":"/api/v1/admin/categories","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/categories","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/categories","type":0,"val":"categories","end":""}],
    types: placeholder as Registry['categories.store']['types'],
  },
  'categories.update': {
    methods: ["PUT"],
    pattern: '/api/v1/admin/categories/:id',
    tokens: [{"old":"/api/v1/admin/categories/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/categories/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/categories/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/categories/:id","type":0,"val":"categories","end":""},{"old":"/api/v1/admin/categories/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['categories.update']['types'],
  },
  'categories.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/admin/categories/:id',
    tokens: [{"old":"/api/v1/admin/categories/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/categories/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/categories/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/categories/:id","type":0,"val":"categories","end":""},{"old":"/api/v1/admin/categories/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['categories.destroy']['types'],
  },
  'products.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/products',
    tokens: [{"old":"/api/v1/admin/products","type":0,"val":"api","end":""},{"old":"/api/v1/admin/products","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/products","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/products","type":0,"val":"products","end":""}],
    types: placeholder as Registry['products.index']['types'],
  },
  'products.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/products/:id',
    tokens: [{"old":"/api/v1/admin/products/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/products/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/products/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/products/:id","type":0,"val":"products","end":""},{"old":"/api/v1/admin/products/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['products.show']['types'],
  },
  'products.store': {
    methods: ["POST"],
    pattern: '/api/v1/admin/products',
    tokens: [{"old":"/api/v1/admin/products","type":0,"val":"api","end":""},{"old":"/api/v1/admin/products","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/products","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/products","type":0,"val":"products","end":""}],
    types: placeholder as Registry['products.store']['types'],
  },
  'products.update': {
    methods: ["PUT"],
    pattern: '/api/v1/admin/products/:id',
    tokens: [{"old":"/api/v1/admin/products/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/products/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/products/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/products/:id","type":0,"val":"products","end":""},{"old":"/api/v1/admin/products/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['products.update']['types'],
  },
  'products.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/admin/products/:id',
    tokens: [{"old":"/api/v1/admin/products/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/products/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/products/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/products/:id","type":0,"val":"products","end":""},{"old":"/api/v1/admin/products/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['products.destroy']['types'],
  },
  'product_reviews.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/product-reviews',
    tokens: [{"old":"/api/v1/admin/product-reviews","type":0,"val":"api","end":""},{"old":"/api/v1/admin/product-reviews","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/product-reviews","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/product-reviews","type":0,"val":"product-reviews","end":""}],
    types: placeholder as Registry['product_reviews.index']['types'],
  },
  'product_reviews.approve': {
    methods: ["PATCH"],
    pattern: '/api/v1/admin/product-reviews/:id/approve',
    tokens: [{"old":"/api/v1/admin/product-reviews/:id/approve","type":0,"val":"api","end":""},{"old":"/api/v1/admin/product-reviews/:id/approve","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/product-reviews/:id/approve","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/product-reviews/:id/approve","type":0,"val":"product-reviews","end":""},{"old":"/api/v1/admin/product-reviews/:id/approve","type":1,"val":"id","end":""},{"old":"/api/v1/admin/product-reviews/:id/approve","type":0,"val":"approve","end":""}],
    types: placeholder as Registry['product_reviews.approve']['types'],
  },
  'product_reviews.reply': {
    methods: ["PATCH"],
    pattern: '/api/v1/admin/product-reviews/:id/reply',
    tokens: [{"old":"/api/v1/admin/product-reviews/:id/reply","type":0,"val":"api","end":""},{"old":"/api/v1/admin/product-reviews/:id/reply","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/product-reviews/:id/reply","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/product-reviews/:id/reply","type":0,"val":"product-reviews","end":""},{"old":"/api/v1/admin/product-reviews/:id/reply","type":1,"val":"id","end":""},{"old":"/api/v1/admin/product-reviews/:id/reply","type":0,"val":"reply","end":""}],
    types: placeholder as Registry['product_reviews.reply']['types'],
  },
  'product_reviews.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/admin/product-reviews/:id',
    tokens: [{"old":"/api/v1/admin/product-reviews/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/product-reviews/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/product-reviews/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/product-reviews/:id","type":0,"val":"product-reviews","end":""},{"old":"/api/v1/admin/product-reviews/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['product_reviews.destroy']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
