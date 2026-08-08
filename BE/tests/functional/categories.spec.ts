import { test } from '@japa/runner'
import Category from '#models/category'
import { UserFactory } from '#database/factories/user_factory'
import { CategoryFactory } from '#database/factories/category_factory'

test.group('Categories', (group) => {
  let adminUser: any

  group.setup(async () => {
    adminUser = await UserFactory.merge({ role: 'admin' }).create()
  })

  test('admin can create category', async ({ client, assert }) => {
    const response = await client
      .post('/api/v1/admin/categories')
      .json({
        name: 'Test Category',
        slug: 'test-category-' + Date.now(),
        description: 'Test Description',
      })
      .loginAs(adminUser)

    response.assertStatus(201)
    response.assertBodyContains({ success: true })
    assert.equal(response.body().data?.name, 'Test Category')
  })

  test('client can list categories', async ({ client, assert }) => {
    await CategoryFactory.createMany(3)
    const response = await client.get('/api/v1/categories')

    response.assertStatus(200)
    response.assertBodyContains({ success: true })
    assert.isAtLeast(response.body().data?.length, 3)
  })

  test('admin can update category', async ({ client, assert }) => {
    const category = await CategoryFactory.create()
    const response = await client
      .put(`/api/v1/admin/categories/${category.id}`)
      .json({
        name: 'Updated Name',
        slug: 'updated-name-' + Date.now(),
      })
      .loginAs(adminUser)

    response.assertStatus(200)
    response.assertBodyContains({ success: true })
    assert.equal(response.body().data?.name, 'Updated Name')
  })

  test('admin can delete category', async ({ client, assert }) => {
    const category = await CategoryFactory.create()
    const response = await client
      .delete(`/api/v1/admin/categories/${category.id}`)
      .loginAs(adminUser)

    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const deletedCategory = await Category.find(category.id)
    assert.isNull(deletedCategory) // because of soft delete query scope or actual delete
  })
})
