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

router
  .group(() => {
    router.post('/auth/login', [() => import('#controllers/auth_controller'), 'login'])
    router.post('/auth/refresh', [() => import('#controllers/auth_controller'), 'refresh'])
  })
  .prefix('/api/v1')
