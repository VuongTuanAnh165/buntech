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
  })
  .prefix('/api/v1')
