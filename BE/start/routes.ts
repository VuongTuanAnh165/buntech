/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

router.get('/', () => {
  return { hello: 'world' }
})

// Swagger API Documentation (Only available in non-production environments)
import env from '#start/env'

if (env.get('NODE_ENV') !== 'production') {
  router.get('/swagger', [() => import('#controllers/swagger_controller'), 'swagger'])
  router.get('/docs', [() => import('#controllers/swagger_controller'), 'docs'])
}

import { middleware } from '#start/kernel'

import { authThrottle } from '#start/limiter'

router
  .group(() => {
    router
      .post('/auth/login', [() => import('#controllers/auth_controller'), 'login'])
      .use(authThrottle)
    router
      .post('/auth/refresh', [() => import('#controllers/auth_controller'), 'refresh'])
      .use(authThrottle)
    router
      .get('/auth/me', [() => import('#controllers/auth_controller'), 'me'])
      .use(middleware.auth())

    // Master Data
    router.get('/master-data/divisions/version', [
      () => import('#controllers/master_data_controller'),
      'getDivisionsVersion',
    ])
    router.get('/master-data/divisions', [
      () => import('#controllers/master_data_controller'),
      'getDivisions',
    ])
  })
  .prefix('/api/v1')

// Public Routes (Frontend Nuxt 4)
router
  .group(() => {
    // Blog Categories
    router.get('/blog-categories', [
      () => import('#controllers/blog_categories_controller'),
      'clientIndex',
    ])

    // Posts
    router.get('/posts', [() => import('#controllers/posts_controller'), 'clientIndex'])
    router.get('/posts/:id', [() => import('#controllers/posts_controller'), 'clientShow'])

    // Categories
    router.get('/categories', [() => import('#controllers/categories_controller'), 'clientIndex'])
    router.get('/categories/:id', [
      () => import('#controllers/categories_controller'),
      'clientShow',
    ])

    // Products
    router.get('/products', [() => import('#controllers/products_controller'), 'clientIndex'])
    router.get('/products/:id', [() => import('#controllers/products_controller'), 'clientShow'])

    // Product Reviews (Client)
    router.get('/products/:id/reviews', [
      () => import('#controllers/product_reviews_controller'),
      'clientIndex',
    ])
    router
      .post('/products/:id/reviews', [
        () => import('#controllers/product_reviews_controller'),
        'store',
      ])
      .use(middleware.auth())
  })
  .prefix('/api/v1')

// Admin Routes (Yêu cầu Authentication)
router
  .group(() => {
    // Blog Categories CRUD
    router.get('/admin/blog-categories', [
      () => import('#controllers/blog_categories_controller'),
      'index',
    ])
    router.get('/admin/blog-categories/:id', [
      () => import('#controllers/blog_categories_controller'),
      'show',
    ])
    router.post('/admin/blog-categories', [
      () => import('#controllers/blog_categories_controller'),
      'store',
    ])
    router.put('/admin/blog-categories/:id', [
      () => import('#controllers/blog_categories_controller'),
      'update',
    ])
    router.delete('/admin/blog-categories/:id', [
      () => import('#controllers/blog_categories_controller'),
      'destroy',
    ])

    // Posts CRUD
    router.get('/admin/posts', [() => import('#controllers/posts_controller'), 'index'])
    router.get('/admin/posts/:id', [() => import('#controllers/posts_controller'), 'show'])
    router.post('/admin/posts', [() => import('#controllers/posts_controller'), 'store'])
    router.put('/admin/posts/:id', [() => import('#controllers/posts_controller'), 'update'])
    router.delete('/admin/posts/:id', [() => import('#controllers/posts_controller'), 'destroy'])

    // Categories CRUD
    router.get('/admin/categories', [() => import('#controllers/categories_controller'), 'index'])
    router.get('/admin/categories/:id', [
      () => import('#controllers/categories_controller'),
      'show',
    ])
    router.post('/admin/categories', [() => import('#controllers/categories_controller'), 'store'])
    router.put('/admin/categories/:id', [
      () => import('#controllers/categories_controller'),
      'update',
    ])
    router.delete('/admin/categories/:id', [
      () => import('#controllers/categories_controller'),
      'destroy',
    ])

    // Products CRUD
    router.get('/admin/products', [() => import('#controllers/products_controller'), 'index'])
    router.get('/admin/products/:id', [() => import('#controllers/products_controller'), 'show'])
    router.post('/admin/products', [() => import('#controllers/products_controller'), 'store'])
    router.put('/admin/products/:id', [() => import('#controllers/products_controller'), 'update'])
    router.delete('/admin/products/:id', [
      () => import('#controllers/products_controller'),
      'destroy',
    ])

    // Product Reviews CRUD
    router.get('/admin/product-reviews', [
      () => import('#controllers/product_reviews_controller'),
      'index',
    ])
    router.patch('/admin/product-reviews/:id/approve', [
      () => import('#controllers/product_reviews_controller'),
      'approve',
    ])
    router.patch('/admin/product-reviews/:id/reply', [
      () => import('#controllers/product_reviews_controller'),
      'reply',
    ])
    router.delete('/admin/product-reviews/:id', [
      () => import('#controllers/product_reviews_controller'),
      'destroy',
    ])
  })
  .prefix('/api/v1')
  .use(middleware.auth())
  .use(middleware.admin())
