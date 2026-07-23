import { test } from '@japa/runner'
import { ProductFactory } from '#database/factories/product_factory'
import { CategoryFactory } from '#database/factories/category_factory'

test.group('Products', () => {
  test('get list of products', async ({ client }) => {
    const category = await CategoryFactory.create()
    await ProductFactory.merge({ categoryId: category.id }).createMany(3)

    const response = await client.get('/api/v1/products')

    response.assertStatus(200)
    response.assertBodyContains({
      success: true,
    })
  })

  test('get a single product details', async ({ client, assert }) => {
    const category = await CategoryFactory.create()
    const product = await ProductFactory.merge({ categoryId: category.id }).create()

    const response = await client.get(`/api/v1/products/${product.id}`)

    response.assertStatus(200)
    response.assertBodyContains({
      success: true,
    })
    assert.exists(response.body().data?.id)
  })
})
