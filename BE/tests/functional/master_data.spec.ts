import { test } from '@japa/runner'

test.group('Master Data', () => {
  test('client can get divisions version', async ({ client, assert }) => {
    const response = await client.get('/api/v1/master-data/divisions/version')
    response.assertStatus(200)
    response.assertBodyContains({ success: true })
    assert.property(response.body().data, 'versionHash')
  })

  test('client can get divisions list', async ({ client, assert }) => {
    const response = await client.get('/api/v1/master-data/divisions')
    response.assertStatus(200)
    response.assertBodyContains({ success: true })
    assert.isArray(response.body().data)
  })
})
