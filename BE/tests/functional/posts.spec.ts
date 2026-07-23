import { test } from '@japa/runner'
import Post from '#models/post'
import { UserFactory } from '#database/factories/user_factory'
import { PostFactory } from '#database/factories/post_factory'
import { BlogCategoryFactory } from '#database/factories/blog_category_factory'

test.group('Posts', (group) => {
  let adminUser: any

  group.setup(async () => {
    adminUser = await UserFactory.merge({ role: 'admin' }).create()
  })

  test('admin can create post', async ({ client, assert }) => {
    const category = await BlogCategoryFactory.create()
    const response = await client
      .post('/api/v1/admin/posts')
      .json({
        title: 'Test Post',
        slug: 'test-post-' + Date.now(),
        content: 'This is a test post',
        blogCategoryId: category.id,
      })
      .loginAs(adminUser)

    response.assertStatus(201)
    response.assertBodyContains({ success: true })
    assert.equal(response.body().data?.title, 'Test Post')
  })

  test('client can list published posts', async ({ client, assert }) => {
    const category = await BlogCategoryFactory.create()
    await PostFactory.merge({ blogCategoryId: category.id, isPublished: true }).createMany(3)

    const response = await client.get('/api/v1/posts')

    response.assertStatus(200)
    response.assertBodyContains({ success: true })
    assert.isAtLeast(response.body().data?.length, 3)
  })

  test('admin can update post', async ({ client, assert }) => {
    const category = await BlogCategoryFactory.create()
    const post = await PostFactory.merge({ blogCategoryId: category.id }).create()

    const response = await client
      .put(`/api/v1/admin/posts/${post.id}`)
      .json({
        title: 'Updated Title',
        slug: 'updated-title-' + Date.now(),
      })
      .loginAs(adminUser)

    response.assertStatus(200)
    response.assertBodyContains({ success: true })
    assert.equal(response.body().data?.title, 'Updated Title')
  })

  test('admin can delete post', async ({ client, assert }) => {
    const category = await BlogCategoryFactory.create()
    const post = await PostFactory.merge({ blogCategoryId: category.id }).create()

    const response = await client.delete(`/api/v1/admin/posts/${post.id}`).loginAs(adminUser)

    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const deletedPost = await Post.find(post.id)
    assert.isNotNull(deletedPost?.deletedAt)
  })
})
