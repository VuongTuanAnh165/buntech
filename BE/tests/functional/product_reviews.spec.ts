import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import { ProductFactory } from '#database/factories/product_factory'
import { ProductReviewFactory } from '#database/factories/product_review_factory'

test.group('Product Reviews', (group) => {
  let adminUser: any
  let clientUser: any

  group.setup(async () => {
    adminUser = await UserFactory.merge({ role: 'admin' }).create()
    clientUser = await UserFactory.merge({ role: 'retail' }).create()
  })

  test('client can create review', async ({ client, assert }) => {
    const product = await ProductFactory.create()
    const response = await client
      .post(`/api/v1/products/${product.id}/reviews`)
      .json({
        rating: 5,
        content: 'Great product!',
      })
      .loginAs(clientUser)

    response.assertStatus(201)
    response.assertBodyContains({ success: true })
    assert.equal(response.body().data?.content, 'Great product!')
  })

  test('client can view approved reviews', async ({ client, assert }) => {
    const product = await ProductFactory.create()
    await ProductReviewFactory.merge({ productId: product.id, isApproved: true }).createMany(2)

    const response = await client.get(`/api/v1/products/${product.id}/reviews`)

    response.assertStatus(200)
    response.assertBodyContains({ success: true })
    assert.isAtLeast(response.body().data?.length, 2)
  })

  test('admin can approve review', async ({ client, assert }) => {
    const product = await ProductFactory.create()
    const review = await ProductReviewFactory.merge({
      productId: product.id,
      isApproved: false,
    }).create()

    const response = await client
      .patch(`/api/v1/admin/product-reviews/${review.id}/approve`)
      .json({
        isApproved: true,
      })
      .loginAs(adminUser)

    response.assertStatus(200)
    response.assertBodyContains({ success: true })
    assert.isTrue(response.body().data?.isApproved)
  })

  test('admin can reply to review', async ({ client, assert }) => {
    const product = await ProductFactory.create()
    const review = await ProductReviewFactory.merge({ productId: product.id }).create()

    const response = await client
      .patch(`/api/v1/admin/product-reviews/${review.id}/reply`)
      .json({
        replyContent: 'Thank you for your feedback!',
      })
      .loginAs(adminUser)

    response.assertStatus(200)
    response.assertBodyContains({ success: true })
    assert.equal(response.body().data?.replyContent, 'Thank you for your feedback!')
  })
})
