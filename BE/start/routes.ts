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
