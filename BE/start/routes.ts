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

import { middleware } from '#start/kernel'

router
  .group(() => {
    router.post('/auth/login', [() => import('#controllers/auth_controller'), 'login'])
    router.post('/auth/refresh', [() => import('#controllers/auth_controller'), 'refresh'])
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
router.group(() => {
  // Blog Categories
  router.get('/blog-categories', [() => import('#controllers/blog_categories_controller'), 'clientIndex'])
  
  // Posts
  router.get('/posts', [() => import('#controllers/posts_controller'), 'clientIndex'])
  router.get('/posts/:id', [() => import('#controllers/posts_controller'), 'clientShow'])
}).prefix('/api/v1')

// Admin Routes (Yêu cầu Authentication)
router.group(() => {
  // Blog Categories CRUD
  router.get('/admin/blog-categories', [() => import('#controllers/blog_categories_controller'), 'index'])
  router.get('/admin/blog-categories/:id', [() => import('#controllers/blog_categories_controller'), 'show'])
  router.post('/admin/blog-categories', [() => import('#controllers/blog_categories_controller'), 'store'])
  router.put('/admin/blog-categories/:id', [() => import('#controllers/blog_categories_controller'), 'update'])
  router.delete('/admin/blog-categories/:id', [() => import('#controllers/blog_categories_controller'), 'destroy'])

  // Posts CRUD
  router.get('/admin/posts', [() => import('#controllers/posts_controller'), 'index'])
  router.get('/admin/posts/:id', [() => import('#controllers/posts_controller'), 'show'])
  router.post('/admin/posts', [() => import('#controllers/posts_controller'), 'store'])
  router.put('/admin/posts/:id', [() => import('#controllers/posts_controller'), 'update'])
  router.delete('/admin/posts/:id', [() => import('#controllers/posts_controller'), 'destroy'])
}).prefix('/api/v1').use(middleware.auth())
