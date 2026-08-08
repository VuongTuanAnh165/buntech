import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'

test.group('Auth', () => {
  // Test đăng nhập thất bại
  test('login fails with invalid credentials', async ({ client }) => {
    const response = await client.post('/api/v1/auth/login').json({
      phoneNumber: '0987654321',
      password: 'wrongpassword',
    })

    // Auth controller might return 400 or 401 depending on logic, let's assume 400 bad request for generic error
    response.assertStatus(400)
    response.assertBodyContains({
      success: false,
    })
  })

  // Test đăng nhập thành công
  test('login successfully with correct credentials', async ({ client, assert }) => {
    const user = await UserFactory.create()

    const response = await client.post('/api/v1/auth/login').json({
      phoneNumber: user.phoneNumber,
      password: 'password123',
    })

    response.assertStatus(200)
    response.assertBodyContains({
      success: true,
    })

    assert.exists(response.body().data?.accessToken)
  })
})
